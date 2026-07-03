# R71 Research

All 7 strings inside a single `dialog.innerHTML = ` template literal. Wrapping each in `${escapeHtml(t("key"))}` keeps the structure intact.

i18n keys:
- Pre-existing (L240-245): `modal.submit.title`, `modal.submit.confirm`, `modal.cancel`
- New: `submit.modal.body`, `submit.modal.findingCount`, `submit.modal.roundNotes.label`, `submit.modal.roundNotes.placeholder`

Naming note: pre-existing keys use `modal.X.Y`; new keys use `submit.modal.Y` to match the test's regex anchor. Two conventions coexist — minor inconsistency, not a blocker.

R17-feature test at src/r17-features.test.ts:109 had to be updated to anchor on "submit-confirm-modal" (stable class) instead of literal `<h3>Submit review?</h3>` text (which no longer exists). Same for subsequent indexOf calls — they now match on tag name only.

1 test broken by R71, 1 test fixed: T32.6a (modal HTML order).
