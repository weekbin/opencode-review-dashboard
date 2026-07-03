# R63 Discovery

20-round ultrawork arc (R63-R82) starts. R62 retrospective identified need for more product work (only 30% of R53-R62 were product rounds).

Scan of src/ui/ for hardcoded English user-facing strings found the file-finding tooltip duplicated in 2 spots:
- app.ts:3135 (sidebar): `fileComments.title = "File-level findings"`
- app.ts:5060 (renderDiffPanel): `fileCommentsBadge.title = "File-level findings"`

R19 introduced i18n but missed these dynamic createElement paths.

4 additional same-class gaps queued for R64-R67:
- L3184 copy-branch button title
- L3242 settings-btn aria-label
- L3273 export button title
- L3268 drawer-toggle missing aria-label

Selected scope: 2 spots of "File-level findings" → 1 i18n key + 2 t() calls. TDD-strict.
