# R71 Discovery

R70 carry-over: round-notes textarea + edit-finding modal placeholders.

Fresh scan found submit modal (app.ts:5874) has 7 hardcoded English strings in a single innerHTML template literal:
1. `<h3>Submit review?</h3>`
2. `<p>You're about to submit your review.</p>`
3. `<p>open finding N will be submitted.</p>`
4. `<label>Round notes (appear in next round's "Previously discussed" panel)</label>`
5. `placeholder="Optional global notes for this round"`
6. `<button>Cancel</button>`
7. `<button>Submit</button>`

This is the highest-impact modal — shown right before user submits review. zh-CN users see all-English UI.

Selected scope: 1 round, 7 strings, 4 new i18n keys (pre-existing keys modal.submit.title / modal.submit.confirm / modal.cancel already exist).
