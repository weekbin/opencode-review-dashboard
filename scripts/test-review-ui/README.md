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

25 git scenarios:

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
| 11 | `uncommitted-with-commits` | Uncommitted files + diff_base header + uncommitted badge |
| 12 | `range-changed-banner` | Cross-round yellow banner when diff range shifts |
| 13 | `default-base-on-main` | Default base behavior on main branch |
| 14 | `previously-discussed-panel` | 4th sidebar tab surfaces prior-round notes + comment threads |
| 15 | `untracked-file-in-tree` | Untracked files appear with `status: "added"` + uncommitted badge |
| 16 | `previously-discussed-race` | AbortController for loadPriorNotes (R7 MINOR #1) — server launches without errors with abort logic in place; race condition itself verified via Playwright walkthrough |
| 17 | `previously-discussed-hint` | UI hint for "current round in Conversation" panel (R7 MINOR #2) — multi-round state triggers hint render; visibility verified via Playwright walkthrough |
| 18 | `in-tab-search` | In-tab search input filters active panel content (R8 MINOR #1) — search input renders + filter + Escape-clear verified via Playwright walkthrough |
| 19 | `sidebar-keyboard-nav` | Sidebar tabs keyboard navigation (R8 MINOR #2, WAI-ARIA tablist) — Arrow/Home/End + roving tabindex + aria-selected cycle verified via Playwright walkthrough |
| 20 | `reopen-stale-finding` | Manually re-open stale findings (R9 #1) — Force Reopen button on `closed_auto` + reason modal + `manually_reopened: true` POST payload + state.json update verified via Playwright walkthrough |
| 21 | `saved-replies` | R10's Saved Replies localStorage CRUD + dropdown UI + insert into comment — full flow verified via Playwright walkthrough |
| 22 | `export-review` | R10's Export review (markdown + patch download) — header Export button + modal + download trigger verified via Playwright walkthrough |
| 23 | `edit-finding` | R10's in-place edit (category/severity/comment) + `manually_edited` flag + "Edited <relative-time>" badge verified via Playwright walkthrough |
| 24 | `saved-replies-trigger` | R11 #1 `/trigger` typed-prefix expansion (GH#15) — textarea keydown handler + `loadSavedReplies()` lookup wired; full flow (type `/<name>` + space → expand; unknown stays literal; bare `/` doesn't trigger) verified via Playwright walkthrough |
| 25 | `permalink` | R11 #2 per-finding permalink (GH#16) — `id="finding-<id>"` attribute + Copy-link button + `#finding-<id>` hash-scroll + flash highlight; full flow verified via Playwright walkthrough |

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
