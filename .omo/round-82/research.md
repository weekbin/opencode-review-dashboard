R82 — i18n: 8 remaining hardcoded English title="..." attributes in review.html

R81 left 13 hardcoded English title attributes in review.html. R82 covers Groups 1+2 (8 attributes across top toolbar + left sidebar + conversation/previously panels). R83 will handle Group 3 (conversation filter chips x5).

Research:
- 8 sites identified via grep on `title="..."` in review.html, cross-referenced with data-i18n-title pattern from R80/R81
- i18n.ts STRINGS table: keys need to be added with both en and zh-CN
- applyLanguage() at app.ts startup already calls applyUI() which re-renders data-i18n-title attributes (no JS wiring needed beyond the i18n.ts table + HTML attribute swap)

Pattern: replace `title="English text"` with `data-i18n-title="i18nKey"`. The applyLanguage / setLanguage flow already handles data-i18n-title via the general data-i18n rendering path. No app.ts changes needed.
