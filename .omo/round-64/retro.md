# R64 Retro

## What worked
- TDD: RED → GREEN captured (settings-btn initially failed 2 R43 tests)
- Caught the regression risk early — fixed it by tightening the test pattern (precise `'data-i18n="'`) rather than reverting R64's i18n change
- Carry-over discipline: pulled 2 items from R63 retro into R64 scope

## What didn't
- Initial test pattern used `includes("data-i18n")` substring — too loose, broke R64
- The fix required editing 2 existing regression tests, not just adding R64 tests

## Carry-over list
- export button `title="Export review as Markdown or patch"` → R65
- drawer-toggle missing aria-label → R66

## Closed in this round (loop-internal)
- [x] settings-btn gets data-i18n-aria-label
- [x] r43-feedback.test.ts + settings.test.ts: more precise `'data-i18n="'` pattern
- [x] r64-toolbar-aria-i18n.test.ts with 3 regression tests
- [x] 6 artifacts + proposals.jsonl entry

## Open loop-internal at retro time
(none)
