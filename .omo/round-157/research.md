# R157 Research — fix 3 lint warnings (R156-surfaced housekeeping)

Lightweight-round compression (≤10 LOC + ≤2 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

## Warning 1 + 2: `unicorn(no-useless-fallback-in-spread)` at `src/runtime-compat.ts:228, 283`

The lint rule fires on:
```ts
env: { ...process.env, ...(opts.env ?? {}) } as NodeJS.ProcessEnv
```

The `?? {}` is a no-op because:
- If `opts.env` is `undefined`, spreading `undefined` into an object literal is harmless (ES spec)
- If `opts.env` is `null`, the same applies
- The fallback only matters if `opts.env` is `undefined`, in which case there's nothing to merge

Fix: remove the `?? {}` and pass `opts.env` directly:
```ts
env: { ...process.env, ...opts.env } as NodeJS.ProcessEnv
```

## Warning 3: `typescript(no-this-alias)` at `src/ui/diff-virtualization.test.ts:139`

The lint rule fires on:
```ts
const self = this;
function matches(el: FakeElement): boolean { ... }
function walk(node: FakeElement) {
  if (node !== self && matches(node)) { ... }
  for (const child of node.children) { walk(child); }
}
walk(this);
```

The `const self = this;` is a pre-ES2015 pattern (arrow functions were added in ES6, 2015). The fix: convert the inner functions to arrow functions, which capture `this` lexically, eliminating the need for the `self` alias. Make `walk` take `root` as a parameter so it can be called recursively without relying on `this`.

Per-SHIP append discipline preserved.