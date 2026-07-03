# R63 Discovery

## Backlog scan
- GH issues open: 0
- R62 carry-over: empty (10-round arc complete; new 20-round arc R63-R82 starts)
- Source scan found hardcoded English in 2 spots + 4 related buttons queued for R64-R67

## Selected scope (small, TDD-strict)
R19 introduced i18n but missed dynamic fileComments/fileCommentsBadge creation paths.
- app.ts:3135 (sidebar): `fileComments.title = "File-level findings"`
- app.ts:5060 (diff panel): `fileCommentsBadge.title = "File-level findings"`

Both spots are dynamic (createElement), so they need `t("key")` calls rather than `data-i18n-*` attributes (which only work for static HTML).
