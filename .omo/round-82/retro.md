# R82 — i18n: 8 remaining hardcoded English title="..." attributes

## What shipped
8 hardcoded English title attributes in review.html replaced with data-i18n-title pointing to i18n.ts keys. 8 new STRINGS entries (en + zh-CN). 1 regression test file with 3 tests covering all 8 sites.

## What went well
- Reusable R80/R81 pattern (data-i18n-title + i18n.ts STRINGS)
- 1 file change in HTML + 1 file change in i18n.ts
- No app.ts wiring changes needed (applyUI handles data-i18n-title)

## What was harder than expected
- 6 of 8 sites required 2-step Edit (find exact text, then replace). Tree/Flat had multi-line context with 18-space indentation. Each Edit had to be precise to avoid context-miss.
- Test regex for i18n keys went through 3 iterations: (1) line-based extraction failed for multi-line STRINGS rows, (2) `[^}]*` failed on multi-line values, (3) current pattern (300-char block + simple regex per property) is the simplest correct form.

## Loop-internal open
NONE.
