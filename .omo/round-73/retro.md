# R73 Retro

## What worked
- Pivoted to a non-i18n bug class (timer race) — fresh value beyond R63-R72's heavy i18n/a11y work
- TDD: RED → GREEN in 2 cycles (regex initially too narrow)
- Per-button state pattern: avoids global timer registry
- Single bug class fixed in 3 sites at once

## What didn't
- Initial test regex `clearTimeout\(button._copyXFeedbackTimer\)` was too narrow — Site 3's cast spans multiple lines with nested parens
- Final regex uses `clearTimeout[\s\S]{0,200}_copyXFeedbackTimer` to bridge multi-line typescript casts
- Spent extra cycles correcting the test rather than the production code (acceptable — production fix was clean on first attempt)

## Carry-over
- Other 1200ms / 1600ms setTimeout patterns in app.ts (L490 finding-permalink-flash, L729 diff-search-flash) — same race? Verify in future round
- Bulk pattern: extract `flashButtonFeedback(button, successText, originalText, ms)` helper to centralize the timer-cancel pattern across future copy/feedback buttons

## Closed in this round (loop-internal)
- [x] 3 stale-timer race fixes in copy-button handlers
- [x] 3 regression tests in `r73-copied-timer-leak.test.ts`
- [x] 6 round artifacts
- [x] proposals.jsonl entry

## Open loop-internal at retro time
(none)