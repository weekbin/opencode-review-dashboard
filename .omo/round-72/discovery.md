# R72 Discovery

R71 carry-over: edit-finding modal (app.ts:5410+) hardcoded "Category"/"Severity" labels + Save/Cancel buttons.

Found 7 hardcoded English strings in edit-finding modal:
1. h3 "Edit finding"
2. p body "Update category, severity, or comment. Changes are audited..."
3. label "Category"
4. label "Severity"
5. label "Comment"
6. button "Cancel"
7. button "Save"

All 7 are dynamically created via innerHTML template literal. Same pattern as R57-R71.

Selected scope: 1 round, 7 sites, 6 new i18n keys (modal.cancel reused from R71).
