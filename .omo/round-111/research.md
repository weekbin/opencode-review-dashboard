# R111 — research

R106 walker discrepancy analysis:
- walker counts: 783 tests in src/ via regex `/\b(?:it|test)\(\s*['"]/g`
- bun test total: 807 tests across 90 files
- delta: 24 tests

delta source: scripts/test-review-ui/state-endpoint.test.mjs (4 tests)
+ scripts/test-review-ui/r110-walkthrough = 20+ tests.

R106 walker was scoped to src/ only at R106 commit time, when scripts/
had fewer tests. R44 retrofit added state-endpoint tests; R55 cleanup
added walkthrough scripts. walker never updated to include scripts/.

resolution: re-baseline R106 snapshot to 783 (walker scope), document
bun count = 807 in snapshot.note. walker = contract. future round can
extend walker to scripts/ if needed (would require updating R106 test
expectations).
