# R63 Discovery

20-round ultrawork arc R63-R82 begins. R62 retrospective flagged only 30% of R53-R62 were product rounds.

Scan found 2 hardcoded "File-level findings" English tooltips:
- app.ts:3135 (sidebar)
- app.ts:5060 (diff panel)

Both are dynamic createElement paths missed by R19 i18n.

4 additional same-class gaps queued for R64-R67:
- L3184 copy-branch button title
- L3242 settings-btn aria-label
- L3273 export button title
- L3268 drawer-toggle missing aria-label

Selected scope: 2 spots → 1 i18n key + 2 t() calls. TDD-strict.
