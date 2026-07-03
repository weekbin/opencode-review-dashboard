# R65 Research

Single static HTML button, like R63 (review.html edits only). `data-i18n-title` attribute pattern already wired by i18n.ts registerUITranslator pipeline (per review.html:3225 example).

i18n STRINGS table key already exists: `toolbar.export.title` (en + zh-CN).

No regression-test risk: existing r43-feedback.test.ts + settings.test.ts now use precise `'data-i18n="'` pattern (per R64 tightening) — `data-i18n-title` doesn't match that pattern, won't false-fire.

## Simplest change
- review.html:3273 — replace `title="Export review as Markdown or patch"` with `data-i18n-title="toolbar.export.title"`
- Test: 2 regression tests verifying both removal of hardcoded title + presence of data-i18n-title
