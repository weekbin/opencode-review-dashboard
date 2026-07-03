# R67 Research

`t(key, params?)` at i18n.ts:261 supports interpolation: `t("key", { placeholder: "value" })`. STRINGS values use `{placeholder}` placeholder syntax.

3 i18n keys needed:
- `close.ariaLabel` — simple string (no params)
- `badge.edited.tooltip` — has `{timestamp}` placeholder
- `badge.resolution.tooltip` — has `{kind}` placeholder (the existing template also includes reason text after kind; can either add another placeholder or pre-format)

Decision: keep resolution.tooltip simple with just `{kind}` placeholder; the reason text is appended inline outside the i18n template literal.
