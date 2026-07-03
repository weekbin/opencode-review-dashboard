# R51 Brief

**Scope**: Add a chevron indicator + accessibility attributes to `commit-card-head` so users can see fold/unfold state. Changes:
1. `src/ui/review.html` — add `.commit-card-chevron` CSS + rotation rule
2. `src/ui/app.ts` — append chevron element to head; toggle `data-files-collapsed` + `aria-expanded` on click; add `role=button` + `tabindex=0` + `aria-label`
3. `src/ui/i18n.ts` — add `commits.toggle.ariaLabel` (en + zh-CN)
4. `src/ui/r51-commits-toggle.test.ts` — 6 new regression tests

**Why**: GH#73 #7 reported "COMMits panel folded vs unfolded states have no clear visual distinction". `commit-card-head` has a click handler that toggles `data-collapsed` on `filesContainer`, but no chevron indicator — users can't see the state. Following the existing `card-chevron` pattern (CHEVRON_SVG constant, rotate 90deg on collapse).

**Risk**:
- Existing click handler behavior preserved (toggles data-collapsed on filesContainer)
- No data structure changes
- 3 src/ files touched (above v6 lightweight threshold of ≤2 — regular round, not lightweight)
- Zero external dependencies
- i18n completeness verified by test

**Acceptance**:
- `.commit-card-chevron` CSS rule present in review.html
- `.commit-card-head[data-files-collapsed] .commit-card-chevron { transform: rotate(-90deg) }` rule present
- `app.ts` chevron appended to head, click handler updates aria-expanded, head has role/tabindex/aria-label
- `i18n.ts` has `commits.toggle.ariaLabel` with both `en` + `zh-CN` strings
- 6 new regression tests pass
- `bash .husky/pre-commit` → 8/8 PASS
- 632/632 tests (626 baseline + 6 new)