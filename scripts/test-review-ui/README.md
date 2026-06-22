# Test Review UI — Quick Reference

End-to-end Playwright + git-scenario test harness for `opencode-review-dashboard`.

## TL;DR

```bash
# 1. Build the dist
bun run build

# 2. Run the scenario sweep
bun run scripts/test-review-ui/e2e.mjs
```

For interactive UI testing (drag, screenshot, etc.) see the skill
`review-dashboard-ui-test` or use Playwright MCP directly.

## What it tests

10 git scenarios:

| # | Scenario | What it checks |
|---|---|---|
| 1 | `no-worktree-clean` | Diagnostic "Working tree matches upstream" |
| 2 | `has-worktree-unpushed` | Auto-pick worktree, server launches |
| 3 | `multiple-worktrees-pick-most` | Auto-pick most-active (work/A over work/B) |
| 4 | `base-branch` | `--base main` from feature branch |
| 5 | `base-commit-single` | `--base HEAD~1` |
| 6 | `base-commit-range` | `--base HEAD~3` |
| 7 | `working-tree-changes` | Unstaged + staged |
| 8 | `files-filter` | `--files a.ts,b.ts` |
| 9 | `worktree-flag-override` | `--worktree <path>` from main |
| 10 | `empty-repo` | Diagnostic on empty repo |

## Files

- `mock-server.py` — Python http.server serving `dist/ui/*` + mock `/api/review/*`
- `scenarios.mjs` — git setup functions for each scenario
- `e2e.mjs` — orchestrator, runs all scenarios, asserts outcomes
- `../../.opencode/skills/review-dashboard-ui-test/SKILL.md` — full guide for
  the interactive Playwright part (sidebar, drag, screenshots)

## Running just one scenario

```bash
bun run scripts/test-review-ui/e2e.mjs --only no-worktree-clean
```

## Starting the mock server manually

```bash
nohup setsid python3 scripts/test-review-ui/mock-server.py 8890 \
  > /tmp/review-test-server.log 2>&1 < /dev/null &
disown
curl -s http://127.0.0.1:8890/health  # → "ok"
```

Then in OpenCode: `/test-review-ui` or any playwright tool.

## Custom mock data

```bash
MOCK_DATA_FILE=/path/to/custom.json python3 scripts/test-review-ui/mock-server.py 8890
```

Schema matches what the plugin sends in the `Launch` payload — see
`src/index.ts:type Launch`.
