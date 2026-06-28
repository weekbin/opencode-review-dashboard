# Doc Update Report — Round 2

## Sections added/modified

- **README.md** (`## Features` list): expanded the "Worktree auto-detection" bullet to document the explicit-`--worktree`-flag-always-wins guarantee. (1-line change, ~30 words added.)
- **README.md** (`### How worktree resolution works`): added 1 sentence at the end documenting the auto-pickaround exclusion behavior — "The auto-pickaround excludes the explicitly-named worktree (or the current one if no `--worktree` is passed), so the plugin never picks the same worktree it already tried."

## Screenshots captured

None — bugfix profile, no UI change, no new visual behavior to capture.

## User-perspective walkthrough validated

**PASS** (per bugfix profile; no Playwright required — see Phase 3c skipped per `references/loop-decision.md` § Round profile auto-classification: bugfix skips Playwright unless UI changes).

Manual walkthrough:

1. User in main checkout, runs `/diff-review-dashboard --worktree <empty-wt>` → returns empty diff (no auto-pickaround).
2. User in main checkout, runs `/diff-review-dashboard --worktree <wt-with-files>` → uses wt-with-files (unchanged).
3. User in main checkout, runs `/diff-review-dashboard` (no flag) → auto-picks worktree with most commits ahead (unchanged).
4. User inside worktree, runs `/diff-review-dashboard` → uses current worktree (unchanged).

## Final verdict

**PASS** — README updated with clear, accurate documentation of the worktree auto-pickaround behavior.