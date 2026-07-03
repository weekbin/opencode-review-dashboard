# R72 Retro

## What worked
- Same fix pattern as R57-R71 (innerHTML template → t() with escapeHtml)
- Pre-existing `modal.cancel` reused (from R71)
- TDD caught i18n key naming inconsistency early (test regex used camelCase, but I initially inserted dot-separated keys)

## What didn't
- Initial Python script inserted dot-separated keys (edit.finding.X.label), not matching test regex (editFinding.X label)
- Required multiple cleanups: dedup duplicate block + rename to camelCase across i18n.ts + app.ts

## Closed in this round
- [x] 7 hardcoded English strings in edit-finding modal → i18n
- [x] 6 new STRINGS keys: editFinding.X (camelCase)
- [x] 5 regression tests in r72-edit-finding-modal-i18n.test.ts

## Open loop-internal
(none)
