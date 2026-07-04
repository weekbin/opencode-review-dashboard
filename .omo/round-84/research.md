# R84 — research

Each showToast / setAttribute / placeholder has a stable equivalent in the i18n STRINGS table. Pattern: replace `"English text"` with `t("i18n.key")` and add the key to i18n.ts. R73 was an existing test that used `"Copied as Markdown"` as a marker — R84 had to update it to `t("status.copiedMarkdown")` since the surrounding string changed.
