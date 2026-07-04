R110 — gap #2 lightweight: zh-CN i18n smoke test.

audit of R82-R101 (20 i18n rounds) found no automated end-to-end check
that the served HTML carries the i18n wiring. real playwright zh-CN
walkthrough with screenshot capture exists as a skill
(`.opencode/skills/review-dashboard-ui-test/SKILL.md`) but is heavyweight
(chrome + browser binary + screenshot capture) and distinct from the
unit-test loop.

R110 = lightweight smoke proxy: spawn mock-server.py, fetch
`/review/test`, assert the served HTML contains data-i18n-* attributes.
this is the precondition for any chrome walkthrough to succeed.

scope:
- src/r110-zh-cn-smoke.test.ts (3 tests)
- mock-server.py doesn't change
- no production source change
