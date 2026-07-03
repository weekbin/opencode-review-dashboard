# R73 Brief

**Scope**: Fix stale-timer race in 3 copy-button handlers in `src/ui/app.ts`.

**Bug**: `setTimeout(1200)` for button textContent revert has no `clearTimeout`. Rapid clicks cause stale timer to overwrite fresh feedback text.

**Fix**: Per-button timer ID stored on DOM element (`_copyPermalinkFeedbackTimer`, `_copyMarkdownFeedbackTimer`, `_copyBranchFeedbackTimer`). Clear before each new `setTimeout`.

**Acceptance**:
- 3 regression tests pass (1 per site)
- bash .husky/pre-commit → 8/8 PASS
- 696/696 total tests
