# R71 Discovery

R70 carry-over: round-notes textarea + submit modal body text + edit-finding modal placeholders.

Fresh scan findings (5+i18n sites in submit modal alone):
- Submit modal h3 "Submit review?"
- Submit modal p "You're about to submit your review."
- Submit modal p "open finding N will be submitted."
- Submit modal label "Round notes (appear in next round's 'Previously discussed' panel)"
- Submit modal placeholder "Optional global notes for this round"
- Submit modal Cancel button (hardcoded English)
- Submit modal Submit button (hardcoded English)

Selected scope: 7 strings in 1 modal. Single dialog.innerHTML template (app.ts:5874). TDD-strict (5 tests).
