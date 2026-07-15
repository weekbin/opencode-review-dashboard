# R166 Brief

## Scope
1-line fix in `scripts/test-review-ui/e2e.mjs` + 1 new regression test that locks in the SDK 1.17.12 PluginModule export shape.

## Why
e2e test suite silently broken since R32 (June 2026 SDK upgrade). All 34 scenarios in `scripts/test-review-ui/scenarios.mjs` have been failing with "DiffReviewPlugin is not a function" because `plugin.default` is now the wrapper object `{ id, server }` instead of the function itself.

## Per-AC acceptance

1. **AC1 fix** — `scripts/test-review-ui/e2e.mjs:38` changes `plugin.default` to `plugin.default.server`. E2e suite runs the first scenario without throwing.
2. **AC2 e2e verify** — `bun run scripts/test-review-ui/e2e.mjs --only no-worktree-clean` runs without the "is not a function" error. Other scenarios may have their own bugs (out of scope for R166).
3. **AC3 regression test** — `src/r166-e2e-plugin-export.test.ts` imports `dist/plugin/index.mjs` (after build) and asserts:
   - `default` is an object
   - `default.id` is a non-empty string
   - `default.server` is a function

## Risk
LOW. 1-line fix + new test. No production source changes.

## Verification
- `bash .husky/pre-commit` 9/9 PASS (including verify-plugin-load.mjs which already checks this shape — R166 adds a second layer)
- `bun test` includes the new r166 test
- e2e suite runs at least 1 scenario without throwing (acceptance level, not full pass — other scenarios may have their own latent bugs surfaced, which is bonus discovery for future rounds)

## Profile
bugfix+housekeeping (1 bugfix + 2 housekeeping = 3 total)