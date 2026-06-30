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

34 git scenarios:

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
| 26 | `pinned-toggle` | R12 #17 ★ Pinned findings (GH#17) — `★/☆` star button + `★ Pinned` filter chip + Conversation tab `★N` badge; full flow verified via Playwright walkthrough |
| 27 | `react-add` | R12 #18 emoji reactions add (GH#18) — 6-emoji picker pill row + active-state styling + grouped count display; full flow verified via Playwright walkthrough |
| 28 | `react-remove` | R12 #18 emoji reactions remove (GH#18) — idempotent toggle: same emoji click removes the reaction; full flow verified via Playwright walkthrough |
| 29 | `n-jump-next` | R12 #19 `n` keyboard nav (GH#19) — global keydown handler + focus guard + activeTab guard; full flow verified via Playwright walkthrough |
| 30 | `p-jump-prev` | R12 #19 `p` keyboard nav wrap-around (GH#19) — wraps from index 0 to last; full flow verified via Playwright walkthrough |
| 31 | `jump-skips-stale` | R12 #19 nav skips stale (GH#19) — n/p skip `closed_auto` findings when `conversationFilter === "open"`; full flow verified via Playwright walkthrough |
| 32 | `resolve-with-reason` | R13 #20 resolve-with-reason modal (GH#20) — 4 quick-reason chips + textarea; Cancel returns null; Confirm POSTs `{finding_id, reason}`; full flow verified via Playwright walkthrough |
| 33 | `mark-as-wontfix` | R13 #21 mark-as-wontfix resolution kind (GH#21) — radio modal (wontfix / out_of_scope / false_positive / duplicate) + reason; POST `{finding_id, resolution_kind, resolution_reason}` → `badge-resolution-{kind}` renders; full flow verified via Playwright walkthrough |
| 34 | `in-diff-search` | R13 #22 in-diff search (GH#22) — Cmd+F / Ctrl+F / `/` capture-phase keydown → fixed-top `.diff-search-bar` overlay → `<mark class="diff-search-match">` highlights + counter; Enter / F3 jump; Escape closes; sessionStorage persistence; full flow verified via Playwright walkthrough |

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
