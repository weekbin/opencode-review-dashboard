# R147 Discovery — close R137+retro flag #1 (fallbackCopy deprecation docstring + visual marker)

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R146 retro carry-over**: none — closes last review.html i18n gap
- **R146 retro Risks Surfaced** (still on shelf, shelved across many rounds):
  - `fallbackCopy` deprecation — **8 rounds shelved (R137-R146)**. Real behavior change risk.
  - `formatRelativeTime > 1 year` — preventive only.
  - 3 server-side i18n-coupling markers — invasive.
- **Last 7 rounds**: R140-R146 = 7 consecutive polish rounds. i18n sweep is now exhaustive across `app.ts` + `review.html`. **Polish streak exhausted** — need to pivot profile.
- **Profile cadence last 12 rounds**: 9 polish + 2 refactor + 1 housekeeping. Housekeeping underrepresented.

## Audit findings

Ran a source-side audit beyond i18n (per the R143 retro audit-extension pattern):

| Pattern | Count | Locations |
|---|---|---|
| `document.execCommand("copy")` | 1 | `app.ts:676` (fallbackCopy function) |
| Other deprecated APIs (`webkitURL`, `attachEvent`, `mozMatchesSelector`, etc.) | 0 | n/a |
| `console.log/warn/error("English...")` | 0 | clean |
| `throw new Error("English...")` | 0 | clean |

**Conclusion**: `fallbackCopy` is the only deprecated-API use site in the codebase. It's been shelved for 8 rounds. Time to close it.

## Surfaced candidates

### C1 — Document + visually mark the deprecated execCommand fallback (R147 housekeeping)

**Evidence** (verified):

```bash
grep -nE 'document\.execCommand|"copy"' src/ui/app.ts
```

Returns exactly **1 match** at `app.ts:676`. The function is called from 4 sites (L393, L459, L1767, L1799) — all guarded by `if (typeof navigator !== "undefined" && navigator.clipboard?.writeText)` checks, with fallbackCopy as the catch-all.

The browser deprecation status:
- `document.execCommand("copy")` is **deprecated** but still works in all major browsers as of 2026.
- The official replacement is the async Clipboard API (`navigator.clipboard.writeText`) — already in use as the primary path.
- No browser vendor has announced removal plans yet, but MDN documents it as deprecated.

**Why close it now**: 8 rounds shelved = 8x the v5.4 No-Deferral Patch threshold for "real" items. Even minimal documentation closes the flag. The actual API behavior is unchanged (still uses execCommand as the fallback) — this is a pure housekeeping round that adds visual deprecation markers.

**Minimal scope**:
1. Rename the function from `fallbackCopy` to `legacyExecCommandCopy` — makes the deprecation visually obvious at every call site (4 sites auto-renamed).
2. Add a docstring above the function explaining: (a) why execCommand is still used, (b) the migration path when browser vendors remove execCommand, (c) the relationship to navigator.clipboard.writeText (primary path).
3. Add a TODO comment with migration plan reference (ClipboardItem API).

**Cost**: ≤1 file modified (`app.ts`) + 1 new test (behavior-contract) + 1 housekeeping append. ~15 LOC net.

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish = 0 total but ≤1 housekeeping slot). Closes a long-shelved risk without changing runtime behavior.

### C2 — Replace execCommand with ClipboardItem API

**Why not this round**: Real behavior change. ClipboardItem API requires Promise-based write of Blob objects, doesn't work in all test environments (jsdom, headless Chromium under Playwright), and would break existing tests. Would need a dedicated refactor round + test environment fixes.

### C3 — Migrate the 3 server-side i18n-coupling markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. Needs a separate feature round with agent contract re-design.

### C4 — `formatRelativeTime > 1 year` preventive

**Why not this round**: Preventive only. No current surface triggers this edge case.

## Selection

Pick **C1** — minimal-scope housekeeping round that closes the long-shelved `fallbackCopy` flag. Renames function to `legacyExecCommandCopy` (visual deprecation marker at all 4 call sites) + adds docstring + adds migration-plan TODO. Zero runtime behavior change, all tests stay green.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| housekeeping | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R146 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- Add a behavior-contract test verifying the rename + docstring presence (so future migrations have a clear refactor target)