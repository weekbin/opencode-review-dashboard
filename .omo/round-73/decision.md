# R73 Decision

SHIP.

## What was shipped
- 3 race-condition fixes in `src/ui/app.ts` copy-button handlers
- Per-button timer ID pattern stored on the DOM element
- 3 regression tests in `src/ui/r73-copied-timer-leak.test.ts`

## Risk
- Zero behavior change for single-click users
- Rapid double-click users: no more flicker / wrong-text revert
- TypeScript casts use safe intersection types — no `any`, no `@ts-ignore`

## Doc updates
- None — internal bugfix, no user-facing README change

## Loop summary
R73 shipped a real prod bugfix different from the i18n sweep of R63-R72. Three copy-button handlers (copyFindingPermalink, copyAsMarkdown, copyBranch) all used `setTimeout(1200)` to revert the button textContent, but didn't clear the previous timer on rapid clicks. Fixed by storing the timer ID per-button and `clearTimeout()` before scheduling a new one. 3 regression tests verify the pattern. Pre-commit 8/8 PASS, 696/696 tests.