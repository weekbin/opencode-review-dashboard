# R72 Research

6 new STRINGS keys:
- `editFinding.title`: "Edit finding" / "编辑审查项"
- `editFinding.body`: "Update category, severity, or comment. Changes are audited and visible to the agent." / "..."
- `editFinding.categoryLabel`: "Category" / "类别"
- `editFinding.severityLabel`: "Severity" / "严重程度"
- `editFinding.commentLabel`: "Comment" / "评论"
- `editFinding.save`: "Save" / "保存"

Reused: `modal.cancel` (pre-existing from R71).

Naming convention: camelCase (editFinding.X.label), matches submit.modal.* convention from R71 + most recently added keys. Mixed names (modal.submit.* vs editFinding.*) coexist; minor inconsistency noted but not blocking.

TDD discipline: 5 regression tests (labels covered by 3 tests; h3 + body + Save in 3 separate tests; Cancel button check = 1 test). Total 5.

Initial key-name mismatch caused a 2-cycle RED→GREEN fix: first Python script used dot-separated (edit.finding.X.label), test expected camelCase (editFinding.X label). Aligned via sed + Python; final state all camelCase.
