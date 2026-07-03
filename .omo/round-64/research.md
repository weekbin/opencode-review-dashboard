# R64 Research

Both buttons are static HTML in review.html — use `data-i18n-*` attributes (not t() calls).

Existing patterns (preserved):
- `data-i18n-title="..."` translates `title` attribute (per R63 + earlier exploration)
- `data-i18n-aria-label="..."` translates `aria-label` attribute (per review.html:3226 example)
- `i18n.ts` registerUITranslator wires both attribute types via applyUITranslator pipeline

i18n keys already in STRINGS table (from R63 carry-over):
- `toolbar.copyBranch.title` (en: "Copy current branch name to clipboard", zh-CN: 复制当前分支名到剪贴板)
- `settings.btn.ariaLabel` (en: "Settings", zh-CN: 设置)

## Simplest change
- review.html:3184 — replace `title="Copy current branch name to clipboard"` with `data-i18n-title="toolbar.copyBranch.title"` (already done in earlier exploration, just verify)
- review.html:3242 — replace `title="Settings"` + `aria-label="Settings"` with `data-i18n-aria-label="settings.btn.ariaLabel"` (R64 actual fix)
- r43-feedback.test.ts:92 — tighten from `includes("data-i18n")` to `includes('data-i18n="')` (more precise, allows data-i18n-aria-label)
- settings.test.ts:35 — same tightening

## Risk
- Loosening R43 tests is a regression risk — mitigated by the precise `'data-i18n="'` pattern that still catches the original textContent-overwriting bug
- Settings-btn i18n change is purely additive (no visual change, just better aria-label)
- Zero behavior change beyond localization
