# R63 Brief

**Scope**: i18n for "File-level findings" tooltips. Add fileFinding.title key + replace 2 hardcoded English strings with t("fileFinding.title") calls.

**Risk**: Tiny. Pure i18n scope, no behavior change.

**Acceptance**: 3 tests pass; bash .husky/pre-commit → 8/8 PASS; 664/664 tests (661 + 3).
