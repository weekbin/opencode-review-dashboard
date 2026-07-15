# R166 Discovery

## Real bug found (R166 = bugfix round)
The e2e test suite at `scripts/test-review-ui/e2e.mjs` has been **silently broken since the SDK 1.17.12 upgrade** (R32, June 2026 per project memory #1833/#1836).

### Symptom
```
$ bun run scripts/test-review-ui/e2e.mjs --only no-worktree-clean
  FAIL  no-worktree-clean
        ✗ returns diagnostic string
        threw: DiffReviewPlugin is not a function. (In 'DiffReviewPlugin({ directory, worktree, $: {} })', 'DiffReviewPlugin' is an instance of Object)

0 passed, 1 failed
```

### Root cause
- `src/index.ts:2942` exports `default` as `{ id, server: DiffReviewPlugin }` (per SDK 1.17.12 strict PluginModule shape)
- `dist/plugin/index.mjs` re-exports this object as `default`
- `e2e.mjs:38` does `const DiffReviewPlugin = plugin.default;` — gets the object
- `e2e.mjs:78` then calls `DiffReviewPlugin({ directory, worktree, $: {} })` — fails because object is not callable

### Impact
- All 34 e2e scenarios in `scripts/test-review-ui/scenarios.mjs` have been silently failing since R32
- This is the same root cause as the "Plugin export is not a function" issue documented in #1836 (for runtime loading); here it's the e2e test harness

## ACs this round
- **AC1**: Fix `e2e.mjs` to call the correct export — extract `plugin.default.server` (the function) instead of `plugin.default` (the wrapper object)
- **AC2**: Verify the e2e suite runs at least 1 scenario end-to-end without throwing
- **AC3**: Add a regression test that imports `dist/plugin/index.mjs` and asserts `default.server` is a function (locks in the SDK 1.17.12 PluginModule shape)

## Anti-cap check
- Features: 0
- Bugfixes: 1 (the e2e harness)
- Polish: 0
- Housekeeping: 2 (verify + regression test)
- Total: 3 (≤8 ✓)