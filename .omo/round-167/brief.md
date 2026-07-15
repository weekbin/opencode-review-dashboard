# R167 Brief

## Scope
Save full e2e sweep log as evidence + 1 regression test that locks in the R166 fix.

## Why
After 5 rounds of fixes (R162-R166), this is the **verification** round. 35/35 e2e scenarios pass = strong evidence that the fixes work end-to-end. The log serves as a baseline for future regression detection.

## Per-AC acceptance

1. **AC1 evidence** — `.omo/round-167/e2e-sweep.log` contains the full output of `bun run scripts/test-review-ui/e2e.mjs` showing 35 PASS, 0 FAIL.
2. **AC2 regression test** — `src/r167-e2e-baseline.test.ts` asserts `scripts/test-review-ui/e2e.mjs` references `plugin.default.server` (not `plugin.default`). Catches future regressions of the SDK 1.17.12 export shape fix.

## Risk
LOW. Documentation + 1 small test. No production source changes.

## Verification
- `bash .husky/pre-commit` 9/9 PASS
- `bun test` includes the new r167 test
- E2e sweep log committed as evidence

## Profile
polish+housekeeping (1 polish + 1 housekeeping = 2 total)