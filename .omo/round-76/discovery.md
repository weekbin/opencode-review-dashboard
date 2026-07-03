# R76 Discovery

R75 carry-over: empty (R73-R75 timer-race cleanup arc complete).

Fresh scan found export modal (app.ts:3895-3918) missed by R57-R72 modal sweep:
- h3 "Export review"
- p "Choose a format. The file is generated client-side from the current round state."
- strong "Markdown summary (.md)"
- span "Round summary + findings table + notes — paste into Notion / Slack / email."
- strong "Patch file (.patch)"
- span "Unified diff with // REVIEW (<id>) annotations — attach to a bug report."
- button "Cancel" (reused from R71 modal.cancel)

All 7 sites inside a single innerHTML template literal. Same pattern as R70/R71/R72 modals.

Selected scope: 1 round, 1 modal, 6 new i18n keys (reuses modal.cancel from R71).
