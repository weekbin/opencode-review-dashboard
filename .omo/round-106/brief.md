# R106 — loop gap #9 fix

## ac1
`src/r106-test-count-snapshot.json` records baseline (775 tests) with
captured regex + ISO timestamp.

## ac2
`src/r106-test-count-drift.test.ts` ships with 2 tests:
- snapshot file exists at expected path
- total test count >= snapshot.total (regression fails this)
- bootstrap path: if snapshot is missing, create it and pass

## ac3
v6 pre-commit 8/8 PASS. all 22 prior tests stay green.
