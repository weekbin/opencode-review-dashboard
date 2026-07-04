# R110 — loop gap #2 fix (lightweight)

## ac1
src/r110-zh-cn-smoke.test.ts with 3 tests:
1. dist/ui/review.html exists with data-i18n-* attributes
2. mock-server serves wired HTML via /review/test
3. /api/review/test returns Launch-shaped JSON (catches fallback HTML)

## ac2
v6 pre-commit 8/8 PASS. 3/3 R110 tests GREEN. no regressions.

## ac3
this is a smoke proxy for the playwright zh-CN walkthrough. the
full playwright walkthrough (chrome + screenshot) remains in the
.next-round backlog.
