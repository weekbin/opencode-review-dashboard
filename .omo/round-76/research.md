# R76 Research

Pattern matches R70/R71/R72 (innerHTML → t() with escapeHtml).

6 new STRINGS keys:
- export.modal.title: "Export review" / "导出审查"
- export.modal.body: "Choose a format..." / "选择一种格式..."
- export.card.md.title: "Markdown summary (.md)" / "Markdown 摘要 (.md)"
- export.card.md.desc: "Round summary + findings table + notes..." / "本轮摘要 + 审查项表格..."
- export.card.patch.title: "Patch file (.patch)" / "补丁文件 (.patch)"
- export.card.patch.desc: "Unified diff with // REVIEW..." / "带 // REVIEW..."

Naming convention: category.action.attribute (export.modal.X, export.card.X.Y).

Side fix: src/export-review.test.ts:91 (R10 T10.4f) was asserting literal "Markdown summary (.md)" / "Patch file (.patch)" hardcoded English. R76 broke it. Updated to anchor on stable `data-format="md"` / `data-format="patch"` attributes + assert `t("export.card.md.title")` calls exist (proves i18n wiring).
