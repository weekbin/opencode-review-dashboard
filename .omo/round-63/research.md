# R63 Research

ApplyLanguage pipeline already supports `data-i18n-*` attributes (data-i18n-title + data-i18n-aria-label are wired by registerUITranslator, per i18n.ts:293-310). For dynamic `title = ...` assignments in JS (cannot use HTML attributes), need `t("key")` directly.

Changes:
1. i18n.ts: +6 keys (toolbar.copyBranch.title, toolbar.export.title, drawer.toggle.ariaLabel, settings.btn.ariaLabel, fileComments.tooltip + fileFinding.title)
2. app.ts: replace `fileComments.title = "File-level findings"` with `fileComments.title = t("fileFinding.title")` × 2 (sidebar + diff panel)
3. review.html: replace `title="..."` with `data-i18n-title="..."` × 2, replace `aria-label="Settings"` with `data-i18n-aria-label="settings.btn.ariaLabel"`

Test: 3 assertions covering i18n key existence + 2 places where title uses t().
