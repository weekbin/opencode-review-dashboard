# R63 Retro

## What worked
- TDD discipline: RED captured for both app.ts edits + i18n key, GREEN after 2 small edits.
- Single concept (file-finding tooltip) in 1 round; 5 other hardcoded strings picked up as bonus.
- Naming "fileFinding.title" matches test + i18n + actual semantic.

## What didn't
- Test regex `/发现|评论|注解/` was wrong (those chars weren't in my chosen zh-CN translation "文件级审查项"). Replaced with literal string match.
- Added `fileComments.tooltip` redundantly (same content as `fileFinding.title`). Should pick one name.

## Carry-over
- Clean up redundant `fileComments.tooltip` key (merge into fileFinding.title).
- Other unconnected toolbar hardcoded strings (review-only changes in this round).

## Closed in this round
- [x] +6 i18n keys
- [x] 2 hardcoded English titles → t() calls
- [x] 1 hardcoded `title="Copy current branch..."` → data-i18n-title
- [x] r63-file-finding-i18n.test.ts (3 tests, RED→GREEN proven)

## Open loop-internal
(none)
