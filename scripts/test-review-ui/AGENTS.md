# scripts/test-review-ui/ — end-to-end UI harness

**Parent:** [`/AGENTS.md`](../AGENTS.md), [`/scripts/AGENTS.md`](../AGENTS.md), and `scripts/test-review-ui/README.md`.

## OVERVIEW
Playwright + git-scenario harness that exercises the dashboard against a Python mock server, bypassing the need to restart OpenCode for each scenario.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Scenario runner | `scripts/test-review-ui/e2e.mjs` | Top-level await loop over `SCENARIOS` |
| Git fixtures | `scripts/test-review-ui/scenarios.mjs` | 34 scenarios; `SCENARIOS` map |
| Mock server | `scripts/test-review-ui/mock-server.py` | `__main__` block at line 266; serves `dist/ui/*` + mocks `/api/review/*` |
| Endpoint integration test | `scripts/test-review-ui/state-endpoint.test.mjs` | bun:test format |
| Visual capture | `scripts/test-review-ui/take-screenshots.sh` | Use this; `take-screenshots.mjs` is dead code |

## CONVENTIONS
- Always run `bun run build` before `bun run scripts/test-review-ui/e2e.mjs`; the harness loads `dist/plugin/index.mjs` and `dist/ui/`.
- Mock server defaults to port `8890`; the bundled endpoint test uses `8891` to avoid collision with interactive Playwright sessions.
- Custom mock data is supplied via `MOCK_DATA_FILE=/path/to/custom.json python3 scripts/test-review-ui/mock-server.py 8890`; schema matches `src/index.ts:type Launch`.
- Filter scenarios with `bun run scripts/test-review-ui/e2e.mjs --only <scenario-name>`.
- For interactive UI work, route through the `review-dashboard-ui-test` skill or call Playwright MCP directly.

## ANTI-PATTERNS
- Do not skip the pre-test Playwright cleanup (R4 lesson): orphan Chrome and orphan mock-server processes must be killed first; refuse to start if Chrome count remains > 0 after `pkill -9`.
- Do not point the mock server at a stale `dist/`: rebuild with `bun run build` before each sweep.
- Do not add new scenarios without also updating `scripts/test-review-ui/README.md` (its scenario table is the canonical reference).

## NOTES
- The harness is the canonical way to verify detection logic, sidebar persistence, screenshot capture, and `--files` / `--base` filters without an OpenCode host.
- The mock server can be started detached for interactive debugging: `nohup setsid python3 scripts/test-review-ui/mock-server.py 8890 > /tmp/review-test-server.log 2>&1 < /dev/null & disown`; probe with `curl -s http://127.0.0.1:8890/health` (returns `ok`).