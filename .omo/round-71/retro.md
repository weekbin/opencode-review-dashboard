# R71 Retro

## What worked
- Caught a latent test fragility — pre-existing T32.6a anchored on literal text that R71 broke. Updated test to anchor on stable class name.
- TDD pattern: matched test regex anchor `submit\.(?:modal|confirm)\.body` to use new key naming convention.

## What didn't
- i18n key naming inconsistency: pre-existing keys use `modal.X.Y`, new keys use `submit.modal.Y` — minor, not worth refactor.
- First edit attempt had duplicate keys (existing keys were duplicated via Python script) — cleaned up.

## Closed in this round
- [x] 7 hardcoded English strings in submit modal → i18n
- [x] 4 new i18n keys (submit.modal.*)
- [x] 5 regression tests in r71-submit-modal-i18n.test.ts
- [x] 1 pre-existing test fragility fixed (r17-features.test.ts)

## Open loop-internal
(none — submit modal done, edit-finding modal queued for R72)
