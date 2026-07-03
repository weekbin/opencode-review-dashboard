# R66 Brief

**Scope**: review.html drawer-toggle gets data-i18n-aria-label="drawer.toggle.ariaLabel". 2 regression tests using substring-based test extraction (handles multi-line button tag).

**Why**: Carry-over from R63. Drawer-toggle is the most prominent missing aria-label in the toolbar.

**Acceptance**: 2 tests pass; bash .husky/pre-commit → 8/8 PASS; total tests 671.
