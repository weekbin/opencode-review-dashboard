# R158 Discovery — close R156 carry-over: test the `_BUN` test-injection seam

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R157 retro carry-over** (1 item): test-injection seam at `_BUN` (R156 retro, 1 round deferred). R156 introduced the module-level `_BUN: typeof Bun | undefined` cache but didn't test the seam. R157 deferred to R158+ as housekeeping.
- **Profile cadence last 22 rounds**: 11 polish + 9 housekeeping + 2 refactor. R156 was refactor; R157 was housekeeping. R158 = housekeeping pivot (closes the R156+R157-deferred carry-over).
- **Test pass rate**: 1116/1116 PASS.
- **Fresh surface audit**:
  1. 0 lint warnings (R157 closed them all)
  2. 0 orphan i18n keys (R149 audit still passes)
  3. **No test for the `_BUN` test-injection seam** at `src/runtime-compat.ts:44` — the cache was introduced by R156 but the seam was never exercised

## Surfaced candidates

### C1 — Close the `_BUN` test-injection seam carry-over (R158 housekeeping)

**Evidence**:

```ts
// src/runtime-compat.ts:38-47
const _bunGlobal = (globalThis as { Bun?: unknown }).Bun;
const IS_BUN = typeof _bunGlobal !== "undefined";

const _BUN: typeof Bun | undefined = (globalThis as { Bun?: typeof Bun }).Bun;
function bun(): typeof Bun {
  return _BUN as typeof Bun;
}
```

R156 retro noted: "the module-level cache provides a test-injection seam (tests can swap `_BUN` via `Object.defineProperty(globalThis, 'Bun', { value: fakeBun })`). R156 doesn't test this seam directly, but future rounds could add tests that verify the Bun path is exercised when `IS_BUN === true`."

**Why now**: R156 + R157 both flagged this as the explicit carry-over. Closing it requires:
1. Export a `__setBunForTesting(fakeBun)` setter from `src/runtime-compat.ts` (cleaner than raw `Object.defineProperty` in tests)
2. Add 1-2 tests to `src/runtime-compat.test.ts` that verify the Bun path is exercised

**Why this matters**: The `_BUN` cache was introduced for testability. If it can't be tested, the cache is dead weight — the comments lie. R158 closes the loop.

**Cost**:
- ≤2 files modified (`src/runtime-compat.ts`: export `__setBunForTesting`; `src/runtime-compat.test.ts`: add 1-2 tests)
- ~20 LOC net
- No production code path changes

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish). Closes R156 carry-over.

## Selection

Pick **C1** — add the test-injection seam test. Tight housekeeping, ≤2 files, ≤1 housekeeping slot.

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

- Append R157 entry to `.omo/proposals.jsonl` (per-SHIP discipline, 25th consecutive round)