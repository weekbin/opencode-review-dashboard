# R52 Research

## Source files
- `src/ui/review.html` (L319-355: `.ignore-whitespace-btn` CSS block — add `[data-loading]` state)
- `src/ui/app.ts` (L1735-1741: `setIgnoreWhitespace` function — add loading indicator)
- `src/ui/i18n.ts` (L51: `toolbar.ignoreWs.ariaLabel` block — add `loading` string)

## Existing patterns (preserved)
- **`setStatus(text)`** (app.ts L2253): toast notification helper used for action confirmations
- **`data-active` / `aria-pressed`** state pattern on ignore-whitespace-btn: existing CSS uses `[data-active="true"]` and `[aria-pressed="true"]` selectors
- **STRINGS table** (i18n.ts): flat object with `en` + `zh-CN` keys per entry
- **requestAnimationFrame**: used elsewhere in app.ts for deferred rendering

## Simplest change
- CSS: add `.ignore-whitespace-btn[data-loading="true"] { opacity: 0.65; cursor: progress; }` + `::after` spinner animation
- JS: in `setIgnoreWhitespace`, set `data-loading=true`, call `setStatus`, defer `renderDiffPanel` via rAF, clear `data-loading` + status in nested rAF
- i18n: add `toolbar.ignoreWs.loading` (en + zh-CN)
- Test: 3 new tests verifying CSS spinner rule + JS state management + i18n completeness

## Risk
- Sync `renderDiffPanel` wrapped in rAF: minimal — adds at most 1 frame of latency (~16ms)
- Existing toggle behavior preserved (state, localStorage, button styling)
- Spinner only visible during rAF window (~16ms on small diffs, longer on large)
- No new dependencies

## Compatibility check
- Existing tests: 632 baseline → 635 after R52 (+3)
- pre-commit: 8/8 PASS verified
- format: oxfmt applied to all touched files
- v6 SKILL.md unaffected
- proposals.jsonl: append 1 line for R52