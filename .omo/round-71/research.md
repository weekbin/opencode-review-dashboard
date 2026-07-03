# R71 Research

Pre-existing i18n keys (already in STRINGS table at app.ts:i18n.ts:240-245):
- `modal.submit.title`: "Submit review?"
- `modal.submit.confirm`: "Submit"
- `modal.cancel`: "Cancel"

New keys needed:
- `submit.modal.body`: "You're about to submit your review."
- `submit.modal.findingCount`: "{count} open finding(s) will be submitted."
- `submit.modal.roundNotes.label`: "Round notes (appear in next round's...)"
- `submit.modal.roundNotes.placeholder`: "Optional global notes for this round"

Pattern matches R57-R67 (innerHTML → t() with escapeHtml). `t()` interpolation supports `{count}` placeholder.

Side effect: `src/r17-features.test.ts:111-115` (R17 T32.6a) was asserting literal hardcoded English. Updated to use stable HTML element markers (`<h3>`, `<p>`, `class="finding-count"`, etc.) instead — preserves order-check intent without coupling to English copy.
