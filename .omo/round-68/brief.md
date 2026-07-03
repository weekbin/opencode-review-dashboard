# R68 Brief

**Scope**: Add `src/ui/r68-card-header-bench.test.ts` (2 regression perf tests). Pure-JS synthetic workload mimics the per-file card-header object construction inside renderDiffPanel's for-of loop.

**Why**: Establishes regression-protection baseline for the testable slice of renderDiffPanel. Real browser perf (innerHTML clear, DOM ops) requires jsdom + browser — out of scope.

**Acceptance**: 2 tests pass with baseline numbers logged; bash .husky/pre-commit → 8/8 PASS; 676/676 tests.
