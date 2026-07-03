# R65 Discovery

R64 carry-over (2 items):
- export button `title="Export review as Markdown or patch"` (review.html:3273) ← R65 scope
- drawer-toggle missing aria-label (review.html:3268) → R66

Selected scope: export button i18n. Smallest carry-over item. i18n key `toolbar.export.title` already in STRINGS table from R63 carry-over exploration. Static HTML button — use `data-i18n-title` attribute pattern.
