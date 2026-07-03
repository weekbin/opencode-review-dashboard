# R63 Brief

**Scope**: 6 i18n keys + 2 hardcoded English titles → t() calls + 3 data-i18n-* attributes.

**Why**: zh-CN users see English tooltips in multiple places (file-level findings, copy branch, settings, export). Per R19 i18n mandate, all user-facing strings should be localized.

**Risk**: < 10 lines per file change. Pure i18n scope, no behavior change.

**Acceptance**: 3 tests pass (fileFinding.title key, sidebar uses t(), diff panel uses t()). 8/8 pre-commit.
