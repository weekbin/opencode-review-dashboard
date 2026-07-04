# R83 — i18n: 5 conversation filter chip tooltips

## What shipped
5 hardcoded English title attributes on conversation filter chips replaced with data-i18n-title pointing to i18n.ts keys. 5 new STRINGS entries (en + zh-CN). 1 regression test file with 3 tests covering all 5 sites.

## What went well
- Reusable R80-R82 pattern
- 1 file change in HTML + 1 file change in i18n.ts
- No app.ts wiring changes needed

## What was harder than expected
- Test went through 3 iterations: (1) `indexOf` with `<button data-filter=` failed because oxfmt split the button across multiple lines, (2) `lastIndexOf("<button", idx)` returned -1 because the first `data-filter="X"` occurrence is in a CSS rule at L2565-2566, (3) current pattern anchors on `\n            <button\n              data-filter="X"` — the multi-line literal that only appears in the HTML button definition.
- i18n.ts Edit produced duplicate keys (the edit tool seemed to apply the edit twice in succession). Had to read the file to detect the duplicates and remove them.

## Loop-internal open
NONE.
