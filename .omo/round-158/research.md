# R158 Research — close R156 carry-over: add `__setBunForTesting` setter + 2 tests

Lightweight-round compression (≤35 LOC + ≤2 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

## The test-injection seam at `_BUN`

R156 introduced `const _BUN: typeof Bun | undefined = (globalThis as { Bun?: typeof Bun }).Bun;` at `src/runtime-compat.ts:44`. The variable is module-scoped and captured by the `bun()` function closure. The intent was testability: tests should be able to swap `_BUN` to test the Bun code path without needing actual Bun runtime.

**The current problem**: there's no exported way to mutate `_BUN` from a test. The only way to swap `_BUN` is to do `Object.defineProperty(globalThis, 'Bun', { value: fakeBun, configurable: true })` and then re-import the module. The second approach doesn't work because `_BUN` is captured at module-init time.

**The fix**: export a `__setBunForTesting(fakeBun: typeof Bun | undefined): void` setter that mutates the module-level `_BUN` cache. The `__` prefix signals "test-only, do not call from production code". The setter uses `let` (not `const`) for the cache, allowing mutation.

## The Bun type

`typeof Bun` is the global Bun type from the `@types/bun` package (already installed via `@tsconfig/bun/tsconfig.json`). Tests can construct a fake Bun object with the minimum surface needed for the test (e.g. `{ file: () => ({ exists: async () => true, text: async () => 'fake-content' }) }`).

## Test-injection pattern in v6

The v6 loop has used `Object.defineProperty(globalThis, 'Bun', { ... })` in a few places (e.g. `src/state-store.test.ts`). The new `__setBunForTesting` setter is a cleaner alternative: it doesn't mutate `globalThis`, it mutates the module's internal cache. This is safer because:
- The change is scoped to the `runtime-compat` module
- Tests don't need to know the exact mechanism
- After the test, the setter can be called with `undefined` to restore the original state

Per-SHIP append discipline preserved.