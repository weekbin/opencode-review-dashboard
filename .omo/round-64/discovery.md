# R64 Discovery

R63 carry-over:
- copy-branch button `title="Copy current branch name to clipboard"` (review.html:3184)
- settings-btn `aria-label="Settings"` (review.html:3242)
- export button `title="Export review as Markdown or patch"` (review.html:3273, queued for R65)
- drawer-toggle missing aria-label (review.html:3268, queued for R66)

Selected scope (R64): copy-branch + settings-btn — 2 of the 4 carry-over items, smallest scope that adds the most value (settings-btn is the most prominent UI control).

Recent Explorer scan also caught a regression risk: r43-feedback.test.ts L92 uses `includes("data-i18n")` substring check which would falsely fail if settings-btn adds any data-i18n-* attribute. The R43 AC3 intent was specifically: prevent `data-i18n="key"` from overwriting textContent on the icon button. Loosening to `includes('data-i18n="')` (quoted attribute pattern) preserves R43 intent without blocking legitimate aria-label updates.
