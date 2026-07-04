R108 — gap #8 audit: mock-server /api/review/<id>/state endpoint.

R45 retro noted: "R45 retrofit: Added 4 regression tests for new endpoint
(schema, fixture, prior_note, regression on existing endpoint)".

`scripts/test-review-ui/state-endpoint.test.mjs` is exactly 127 lines with 4
tests. today, all 4 still pass (verified via `bun test`). the file spawns
mock-server.py on port 8891 (isolated from R43's 8890 to avoid conflicts).

gap #8 was incorrectly listed as an open gap in my audit. it was actually
closed by R44 and given regression tests by R45. this round records that.
