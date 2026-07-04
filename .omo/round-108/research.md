# R108 — research

`bun test scripts/test-review-ui/state-endpoint.test.mjs` reports 4 pass /
0 fail / 21 expect() calls. the tests:

1. returns 200 OK with documented schema (round, files, existing_findings,
   prior_notes, draft types all asserted)
2. F-MOCK-DUP fixture present with status=resolved, resolution_kind=duplicate
3. F-MOCK-OPEN fixture present with status=open, no resolution_kind
   (consistency invariant for open findings)
4. existing /api/review/<id> endpoint unchanged (regression check)

the test file uses port 8891 to avoid R43's 8890 conflicts. requires
python3 with the mock-server.py script available.

my audit incorrectly listed this as an open gap. no production code change
needed; this round is purely an audit-record.
