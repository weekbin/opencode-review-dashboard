# R64 Brief

**Scope**:
- review.html: settings-btn gets `data-i18n-aria-label="settings.btn.ariaLabel"` (replaces hardcoded English)
- r43-feedback.test.ts + settings.test.ts: tighten assertion from `includes("data-i18n")` to `includes('data-i18n="')` (precise check)
- New regression test: `src/ui/r64-toolbar-aria-i18n.test.ts` (3 tests)

**Why**: Carry-over from R63. Settings-btn was the most prominent toolbar button that still showed English aria-label to zh-CN users.

**Risk**: R43 test loosening is acceptable — the new pattern `data-i18n="` still catches the original textContent-overwriting bug, but excludes `data-i18n-aria-label` which only updates aria-label (correct behavior).

**Acceptance**:
- 3 new tests pass (copy-branch + settings-btn + i18n keys)
- R43 R64-R67 carryover: 2/4 done (R65 export, R66 drawer-toggle queued)
- bash .husky/pre-commit → 8/8 PASS
- 667/667 tests (664 + 3 R64 new)
