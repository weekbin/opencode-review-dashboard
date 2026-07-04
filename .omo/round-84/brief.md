# R84 — i18n: 9 hardcoded English strings in app.ts

## AC1
9 hardcoded English strings in app.ts replaced with `t("i18n.key")` calls.
- 4 showToast: copyPermalinkBlocked, copiedMarkdown, copyBlocked, findingAdded
- 4 setAttribute aria-label: file jumper, search panel, search current panel, select all findings
- 1 placeholder: "Add a comment (max 500 chars)"

## AC2
6 new STRINGS keys (3 status.* + 3 palette.* + 1 conversation + 1 finding.comment) added to i18n.ts with en + zh-CN.

## AC3
R73 test marker updated to match new i18n key (no behavior change). R84 test covers all 9 sites.
