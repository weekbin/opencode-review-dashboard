# R63 Research

## Source files
- src/ui/app.ts:3135 (sidebar fileComments.title) and src/ui/app.ts:5060 (diff panel fileCommentsBadge.title)
- src/ui/i18n.ts (add fileFinding.title key)

## Existing patterns (preserved)
- t() helper for in-code translation (i18n.ts exports t(key) → translated string)
- data-i18n-* attributes on static HTML elements (won't work here — these are dynamic createElement spans)
- STRINGS table flat object with `en` + `zh-CN` per entry

## Simplest change
- Add fileFinding.title to STRINGS table (en + zh-CN)
- Replace 2 hardcoded strings with t("fileFinding.title")

## Risk
- Tiny scope (1 src/ file, 1 i18n file, ~10 LOC)
- Zero data structure changes
- No new dependencies
- No public-API changes
