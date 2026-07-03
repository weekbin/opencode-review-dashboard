# R71 Retro

## What worked
- 7 hardcoded English strings → t() calls in 1 innerHTML template literal
- Pre-existing 3 keys reused; only 4 new keys needed
- Test anchored on `submit-confirm-modal` class (stable) instead of literal "Submit review?"

## What didn't
- src/r17-features.test.ts:111-115 (R17 T32.6a) failed after edit because it asserted literal English. Fixed by switching to stable element markers.

## Carry-over
- Edit-finding modal (app.ts:5415-5444) still has hardcoded "Category"/"Severity" labels
- Other modals may have similar issues
