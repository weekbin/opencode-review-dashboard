# R73 Retro

## What worked
- TDD: 3 tests, RED→GREEN captured (regex match against existing setTimeout ID patterns)
- Per-button ID pattern avoids global state
- Single bug class fixed in 3 sites at once

## What didn't
- Initial test regex `clearTimeout\(button._copyXFeedbackTimer\)` failed because Site 3's cast spans multiple lines with nested parens
- Final regex uses `clearTimeout[\s\S]{0,200}_copyXFeedbackTimer` to bridge multi-line

## Carry-over
- Other 1200ms setTimeout patterns in app.ts (L490 finding-permalink-flash, L729 diff-search-flash) — same race? Verify in future round
