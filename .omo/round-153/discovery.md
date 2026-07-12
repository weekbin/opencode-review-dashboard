# R153 Discovery — close 15-round-shelved R137 retro Risk #1: remove deprecated `legacyExecCommandCopy` fallback

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R152 retro carry-over**: none — R152 closed the R151 carry-over. No new loop-internal flags.
- **R152 retro Risks Surfaced** (still on shelf):
  - `fallbackCopy` ClipboardItem API migration — **15 rounds shelved** (R137-R152). Real behavior change.
  - 3 server-side i18n-coupling system markers — **10 rounds shelved** (R142-R152). Invasive.
- **Profile cadence last 16 rounds**: 12 polish + 4 housekeeping + 1 refactor — heavy polish fatigue. R149 was housekeeping pivot; R151 was housekeeping pivot; R152 was housekeeping pivot. R153 = REFACTOR pivot to break the polish streak.
- **Test pass rate**: 1103/1103 PASS (no regression).
- **Fresh surface audit**: clean (no throw/console/TODO/FIXME, 0 lint warnings).

## Surfaced candidates

### C1 — Remove deprecated `legacyExecCommandCopy` fallback (R153 refactor)

**Evidence**:

```bash
grep -nE 'document\.execCommand' src/ui/app.ts
```

Returns 1 match at L678: `document.execCommand("copy");` inside the `legacyExecCommandCopy` function. MDN documents this API as deprecated since 2019. Browser vendors have not announced removal, but the deprecation warning is visible in console for all major browsers.

The fallback exists for 2 cases:
1. `navigator.clipboard` undefined (pre-2018 browsers — <0.1% of users today)
2. `navigator.clipboard.writeText` throws (permission denied, not in secure context)

In practice:
- All modern browsers (Chrome 66+ / Firefox 63+ / Safari 13.1+, all released 2018+) support `navigator.clipboard.writeText`
- The dashboard runs in localhost which is a secure context by default
- `writeText` failures are rare and already handled by the existing `setStatus("Could not copy")` error path

**Why now**: 15 rounds shelved is the longest-shelved flag in the project. R147 retro explicitly noted "Worth a dedicated refactor round with ClipboardItem API migration + jsdom test environment fixes". The cleanest path is **remove the fallback entirely** (don't migrate to ClipboardItem API) — the production error toast already handles failures.

**Why not jsdom fix**: jsdom doesn't support `navigator.clipboard.write` (only `writeText`). R147 retro's concern was that a full migration would break jsdom tests. R153 sidesteps this by deleting the fallback entirely, not migrating it. All 4 callers simplify to a single `try { await writeText; ok = true } catch { ok = false }` pattern — no jsdom concerns.

**Cost**: ≤3 files modified (`src/ui/app.ts`: function deletion + 4 call site simplifications; `src/permalink.test.ts` + `src/r16-features.test.ts`: behavior-contract upgrades) + 2 test files deleted (r139 + r147 test the removed function) + 1 housekeeping append. ~50 LOC net deletion.

**Profile**: refactor (removes deprecated API usage + simplifies 4 call sites). Real behavior change: copy failures in environments without `navigator.clipboard.writeText` (very old browsers + non-secure contexts) now show an error toast instead of falling back to execCommand. The user-facing behavior is more honest (clear error message vs. silent fallback success).

### C2 — Localize 3 server-side i18n-coupling system markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. Agent parses these as literal prefixes. Out of polish scope.

### C3 — Calendar-accurate formatRelativeTime

**Why not this round**: Preventive only. R148 retro noted "worth a future round if precision matters". No current surface triggers this edge case.

## Selection

Pick **C1** — remove the deprecated `legacyExecCommandCopy` fallback. Closes a 15-round-shelved flag. Profile pivot from polish (breaks the streak).

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| refactor | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R152 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- R137→R142 byte-equivalence → behavior-contract SOP applied to T11.2d, T16.8d, T16.10a, T16.10b (4 test upgrades)
- Delete R139 + R147 test files (they test the removed function — no longer meaningful)
- Stash-and-test verification after each edit (per R151 retro lesson learned)