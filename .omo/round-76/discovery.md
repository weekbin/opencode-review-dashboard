# R76 Discovery

R75 carry-over: empty (R73-R75 timer-race cleanup arc complete).

Fresh scan found export modal (app.ts:3895-3918) was missed by R57-R72 modal sweep:

- h3 "Export review"
- p "Choose a format..."
- strong "Markdown summary (.md)"
- span "Round summary + findings table + notes..."
- strong "Patch file (.patch)"
- span "Unified diff with // REVIEW (<id>)..."
- button "Cancel" (reuses modal.cancel from R71)

All 7 sites inside a single innerHTML template literal. Same pattern as R70/R71/R72 modals.

Selected scope: 1 round, 1 modal, 6 new i18n keys.
