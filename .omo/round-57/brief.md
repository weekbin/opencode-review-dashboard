# R57 Brief

**Scope**: Add 5 i18n keys + replace hardcoded English in openDiffSearch overlay with t() calls.

**Why**: R19 introduced i18n but openDiffSearch was missed (overlay is dynamically created, not static HTML). zh-CN users see English in their search UI.

**Acceptance**: 3 tests pass (no hardcoded English, t() used, all 5 keys in both locales).
