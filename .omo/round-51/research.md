# R51 Research

## Source files
- `src/ui/review.html` (L595-625: `.commit-card-head` CSS block)
- `src/ui/app.ts` (L3472-3568: `renderCommitsPanel` function — `head` + `filesContainer` creation + click handler)
- `src/ui/i18n.ts` (L68: `sidebar.commits` entry — add `commits.toggle.ariaLabel` here)

## Existing patterns (preserved)
- **CHEVRON_SVG constant** (app.ts L1456): reusable SVG chevron used by `card-chevron` (L4976)
- **`card-chevron` CSS pattern** (review.html L1676-1684): rotate 90deg when parent has `[data-collapsed]`
- **`folder-chevron` CSS pattern** (review.html L1344-1361): unicode ▶/▼ characters; less consistent with CHEVRON_SVG
- **STRINGS table** (i18n.ts L67+): flat object with `en` + `zh-CN` keys per entry

## Simplest change
- CSS: add `.commit-card-chevron` class + rotation rule (`.commit-card-head[data-files-collapsed] .commit-card-chevron { transform: rotate(-90deg) }`)
- JS: append chevron to `head`, set `data-files-collapsed` on head when files collapse, add `aria-expanded` + `role=button` + `tabindex=0` + `aria-label`
- i18n: add `commits.toggle.ariaLabel` to STRINGS table
- Test: 6 new tests in `r51-commits-toggle.test.ts` covering CSS, JS, i18n, accessibility

## Risk
- Existing click handler behavior preserved (toggles `data-collapsed` on filesContainer)
- New behavior: chevron rotates visually + aria-expanded updates for screen readers
- No data structure changes
- No new dependencies
- Files outside src/ untouched

## Compatibility check
- Existing tests: 626 baseline → 632 after R51 (+6)
- pre-commit: 8/8 PASS verified
- format: oxfmt applied to all touched files
- v6 SKILL.md unaffected
- proposals.jsonl: append 1 line for R51