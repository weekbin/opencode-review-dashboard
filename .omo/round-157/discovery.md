# R157 Discovery — fix 3 lint warnings (R156-surfaced housekeeping)

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R156 retro carry-over**: None (R156 closed the 0-test-coverage module gap)
- **R156 retro Risks Surfaced** (1 item, not actioned this round):
  - **Test-injection seam at `_BUN`**: the module-level cache provides a test-injection seam. R156 doesn't test this seam directly. Out of R157 scope (housekeeping, not feature work).
- **Profile cadence last 20 rounds**: 10 polish + 8 housekeeping + 2 refactor. R156 was the 2nd refactor. R157 = housekeeping pivot.
- **Test pass rate**: 1116/1116 PASS.
- **Fresh surface audit**:
  1. `src/runtime-compat.ts:228` — `unicorn(no-useless-fallback-in-spread)`: `...process.env, ...(opts.env ?? {})` — the `?? {}` is unnecessary
  2. `src/runtime-compat.ts:283` — same warning (the `spawnText` and `spawnDetached` Node paths use the same pattern)
  3. `src/ui/diff-virtualization.test.ts:139` — `typescript(no-this-alias)`: `const self = this;` should be replaced with arrow function

## Surfaced candidates

### C1 — Fix 3 lint warnings (R157 housekeeping)

**Evidence**:

```bash
$ bun run check 2>&1 | grep -B1 -A6 'warning\|src/'
! unicorn(no-useless-fallback-in-spread): Empty fallbacks in spreads are unnecessary
   ,-[src/runtime-compat.ts:228:32]
! unicorn(no-useless-fallback-in-spread): Empty fallbacks in spreads are unnecessary
   ,-[src/runtime-compat.ts:283:30]
! typescript(no-this-alias): Unexpected aliasing of 'this' to local variable.
   ,-[src/ui/diff-virtualization.test.ts:139:11]

Found 3 warnings and 0 errors.
```

**Why now**: R156 surfaced these 3 warnings but didn't fix them (they didn't block pre-commit). R157 = the natural follow-up housekeeping round to clean up the lint signal. The 3 fixes are small, mechanical, no behavior change.

**Why this matters**: Every lint warning that's left in the dev signal makes it harder to spot real issues. The R156 retro observation: "Per-SHIP append discipline held for 23 rounds" — the v6 loop's intent is to keep the dev signal clean. Fixing these 3 warnings is the lightest possible maintenance.

**Cost**:
- ≤2 files modified (`src/runtime-compat.ts:228,283`; `src/ui/diff-virtualization.test.ts:139`)
- ~10 LOC net
- No production code path changes

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish). Profile pivot from R156 refactor.

## Selection

Pick **C1** — fix 3 lint warnings. Tight housekeeping, ≤2 files, ≤1 housekeeping slot. Closes the R156-surfaced warnings.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| refactor | 0 | n/a | OK |
| housekeeping | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R156 entry to `.omo/proposals.jsonl` (per-SHIP discipline)