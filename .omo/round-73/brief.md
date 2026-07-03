# R73 Brief

**Scope**: Fix stale-timer race in 3 copy-button handlers (app.ts:388-405, 463-480, 1705-1716). Per-button timer ID + clearTimeout before new setTimeout.

**Acceptance**: 3 tests pass; bash .husky/pre-commit → 8/8 PASS; 696/696 tests.
