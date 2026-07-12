# R152 Discovery — close R151 carry-over: complete the `contextHash` unused-var cleanup

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R151 retro carry-over**: `contextHash` unused-var warning (1 remaining). Future R152+ should upgrade R113 + R131 to behavior-contract per the R137→R142 SOP, then complete the contextHash deletion.
- **R151 retro Risks Surfaced** (still on shelf):
  - `fallbackCopy` ClipboardItem API migration — **14 rounds shelved** (R137-R151). Real behavior change.
  - 3 server-side i18n-coupling markers — **9 rounds shelved** (R142-R151). Invasive.
- **Profile cadence last 15 rounds**: 11 polish + 4 housekeeping — heavier housekeeping now.
- **Test pass rate**: 0 fail, 1101 tests (R151 SHIPped cleanly).

## Surfaced candidates

### C1 — Complete `contextHash` cleanup (R152 housekeeping)

**Evidence** (R151 verify carry-over):

> The function is technically unused in production (never called)
> But it's referenced by tests via keyword-grep pattern + line-number-constant brittleness
> Fixing the tests would require upgrading R113 + R131 to behavior-contract (similar to the R137→R142 SOP) — out of R151's housekeeping scope

**Why now**: 14 of 15 unused-vars cleaned in R151. The 15th (`contextHash`) stays as a known limitation. Closing it requires:
1. Upgrade R113 AC3 from brittle keyword-grep to behavior-contract (assert `sanitize()` stamps `context_hash` per finding OR a similar semantic)
2. Upgrade R131 AC2 + AC6 from hardcoded line-number constants to behavior-contract (assert the submit response structure)
3. Delete `contextHash` function from `src/index.ts:434`
4. Verify 0 new lint warnings

**Cost**: ≤4 files modified (src/index.ts: function deletion; r113 test: AC3 upgrade; r131 test: AC2 + AC6 upgrades) + 1 housekeeping append. ~15-30 LOC net.

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish). Closes the last R151 carry-over.

### C2 — `fallbackCopy` ClipboardItem API migration

**Why not this round**: Real behavior change. jsdom doesn't support `navigator.clipboard.write` (only `writeText`). R147 retro explicitly noted "Worth a dedicated refactor round with ClipboardItem API migration + jsdom test environment fixes". Worth a dedicated refactor round with explicit design discussion — out of housekeeping scope.

### C3 — Localize 3 server-side i18n-coupling markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. Agent parses these as literal prefixes when scanning comments[]. Out of polish scope.

### C4 — Calendar-accurate formatRelativeTime

**Why not this round**: Preventive only. R148 retro noted "The 30-day 'months' approximation isn't calendar-accurate... Worth a future round if the precision matters". No current surface triggers this edge case.

## Selection

Pick **C1** — close the R151 carry-over. Closes the last `no-unused-vars` warning. Tight housekeeping, ≤4 files, ≤1 housekeeping slot.

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

- Append R151 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- Apply R137→R142 SOP to R113 AC3 + R131 AC2 + R131 AC6 (byte-equivalence → behavior-contract)
- Stash-and-test verification after each upgrade (per R151 lesson learned)