# R68 Brief

**Scope**: New `src/ui/r68-card-header-bench.test.ts` with 2 perf benchmarks mirroring renderDiffPanel's inner-loop allocation pattern.

**Why**: Establish regression-protection baseline. Future optimization rounds have a lower-bound measurement to target.

**Acceptance**: 2 tests pass; bash .husky/pre-commit → 8/8 PASS; 676/676 tests.
