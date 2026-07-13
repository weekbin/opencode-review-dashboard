# R158 Brief — close R156 carry-over: add `__setBunForTesting` setter + 2 tests that use it

## Scope

1. **`src/runtime-compat.ts`** — export a new `__setBunForTesting(fakeBun: typeof Bun | undefined): void` setter that mutates the module-level `_BUN` cache. The setter is clearly named with a `__` prefix to signal "test-only, do not call from production code".

2. **`src/runtime-compat.test.ts`** — add 2 new tests that use `__setBunForTesting`:
   - Test 1: verify `__setBunForTesting(fakeBun)` changes `IS_BUN` to true (assuming `fakeBun` is non-null) and the `bun()` function returns the fakeBun.
   - Test 2: verify the `fileExists` function uses the Bun path (calls `fakeBun.file(path).exists()`) when `IS_BUN === true`.

3. Append R157 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/runtime-compat.ts` — 1 new export (~5 LOC)
- `src/runtime-compat.test.ts` — 2 new tests (~30 LOC)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The v6 loop's existing `agent-memo hook` for comments — R158 makes 1 trivial comment-style change in the source file (a docstring on the new `__setBunForTesting` function explaining "test-only, do not call from production code"). The docstring is necessary because the function name alone (`__setBunForTesting`) doesn't fully convey "this mutates global state".
- The `R137→R142` byte-equivalence → behavior-contract SOP doesn't apply here (R158 doesn't modify any existing byte-equivalence test).

## Simplest change

Per call-site list. ~35 LOC net (5 LOC setter + 30 LOC tests + housekeeping append).

## Risk

- **No behavior change in production code paths.** The new setter is `__setBunForTesting` (underscore prefix) and only mutates state when called from tests. Production code never calls it.
- **No test brittleness** — the tests test the new contract (test-injection seam works) and don't depend on implementation details of `bun()`.
- **No new lint warnings** — `bun run check` should still report `0 warnings and 0 errors` after R158.

## Acceptance

- `bun test src/runtime-compat.test.ts` passes (15 tests after R158, +2 new)
- Full project suite stays green (was 1116, expect ~1118 with 2 new tests)
- `bun run check` reports `0 warnings and 0 errors` (was 0)
- Pre-commit 8/8 PASS
- `grep -nE '__setBunForTesting' src/runtime-compat.ts` returns 1+ matches
- `grep -nE '__setBunForTesting' src/runtime-compat.test.ts` returns 2+ matches (one per test)

## Profile

Housekeeping. 2 files modified + 1 housekeeping append. Closes R156 carry-over.