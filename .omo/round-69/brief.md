# R69 Brief

**Scope**: app.ts card-header div gets role="button" + tabindex="0" + aria-expanded (initial + on click update) + keydown Enter/Space handler. 2 regression tests verify.

**Why**: Keyboard a11y. Same pattern as R59.

**Acceptance**: 2 tests pass; bash .husky/pre-commit → 8/8 PASS; 678/678 tests.
