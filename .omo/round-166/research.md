# R166 Research

## The fix

`e2e.mjs:38`:
```js
// BEFORE
const DiffReviewPlugin = plugin.default;

// AFTER
const DiffReviewPlugin = plugin.default.server;
```

That's the minimal fix. The default export is the SDK 1.17.12+ PluginModule shape `{ id, server, tui? }`. The actual plugin entry function is `default.server`.

## Verify the export shape

`src/index.ts:2942`:
```ts
export default { id: "diff-review-dashboard", server: DiffReviewPlugin };
```

`dist/plugin/index.mjs` (after build):
```js
//#endregion
export { DiffReviewPlugin, __test, src_default as default };
```

So `await import(PLUGIN_PATH).default` returns `{ id: "diff-review-dashboard", server: [Function: DiffReviewPlugin] }`.

`plugin.default.server` is the actual function. `plugin.default` is the wrapper.

## Files to modify

1. `scripts/test-review-ui/e2e.mjs` — change `plugin.default` to `plugin.default.server` (1 line)
2. `src/r166-e2e-plugin-export.test.ts` (new) — regression test that imports dist/plugin/index.mjs and asserts:
   - `default` is an object
   - `default.id` is a non-empty string
   - `default.server` is a function
   - `default.server` throws or returns sensibly when called

## Risk
LOW. The fix is a 1-line change. The regression test ensures future SDK upgrades that change the export shape will be caught.

## Side benefits
- After this fix, the e2e suite can actually run for the first time since R32
- May surface additional bugs in the 34 scenarios that have been silently failing
- This is a "root-cause fix" that closes a 5-month-old latent issue

## Why I didn't catch this earlier
- The 9-check pre-commit gate doesn't include e2e (e2e is heavy: requires mock-server + dist/ build + browser)
- R162's verify step didn't run e2e (only `bun test` + `bash .husky/pre-commit`)
- R164's "e2e walkthrough" used playwright-cli directly against the running mock-server, bypassing the e2e.mjs harness
- The e2e harness is gated by manual invocation (`bun run scripts/test-review-ui/e2e.mjs`), not by any automated test

**Lesson learned**: when refactoring the plugin export shape, ALSO update the e2e harness. The "Plugin export is not a function" pattern is a known structural issue from #1836 — should have included the e2e harness in the fix.