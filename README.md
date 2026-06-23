# @weekbin/opencode-review-dashboard

English | [中文](README.zh-CN.md)

An [OpenCode](https://opencode.ai) plugin that adds a `/diff-review-dashboard` slash command for browser-based code review, powered by [@pierre/diffs](https://diffs.com).

The command is named `diff-review-dashboard` (tool name: `diff_review_dashboard`).

## What it does

When you run `/diff-review-dashboard` inside an OpenCode session, the plugin:

1. **Collects diffs** from your git working tree, a base branch, or a specific worktree.
2. **Starts a local HTTP server** and opens a review UI in your browser. The URL is also printed to the TUI so you can copy it if the browser does not auto-open.
3. **Lets you review** — annotate lines or whole files with findings (category, severity, comment).
4. **Returns a structured JSON payload** to OpenCode on submit.
5. **The agent auto-applies** actionable findings (see [Auto-apply rule](#auto-apply-rule)).

### Review flow

```
You run /diff-review-dashboard
    → Plugin reads git diff
    → Plugin prints "review URL: http://127.0.0.1:NNNN/..." to the TUI
    → Browser opens with syntax-highlighted diffs
    → You click lines/files, add findings
    → You hit "Submit Review"
    → Plugin returns JSON: { round, open_count, by_severity, by_category, notes, findings[], artifacts }
    → Agent auto-applies actionable findings, then re-runs /diff-review-dashboard
```

### Auto-apply rule

The slash-command template tells the agent to **not ask the user how to proceed**. After a submit:

- Findings are sorted by severity (high → medium → low).
- `category: question` is skipped (clarification requests only).
- **Plan-first**: the agent reads every affected file once, then designs a unified fix plan for all actionable findings.
- The agent applies the plan in one batch, then re-runs `/diff-review-dashboard` to confirm.
- If `open_count == 0` or no findings are actionable, the agent responds `Round N: no actionable items, closing out.` and stops.

### Multi-round reviews

Each session tracks review rounds. When you run `/diff-review-dashboard` again in the same session, findings from previous rounds carry over. If a file was removed or the anchored code changed, old findings are automatically closed (shown as `stale`). This enables iterative review.

### State and exports

Review state is persisted to `.opencode/reviews/<session>/`. Each round produces:

- `state.json` — full session state with all findings across rounds
- `round-NNN.json` — snapshot of findings for that round
- `round-NNN.md` — markdown summary

Drafts are auto-saved as you work, so you can close the browser and reopen without losing progress.

---

## Installation

Add the plugin to your `opencode.json` (global or per-project `.opencode/opencode.json`):

```json
{
  "plugin": ["@weekbin/opencode-review-dashboard"]
}
```

Restart OpenCode. The `/diff-review-dashboard` slash command will be registered.

For development (local clone), use `file:/path/to/this/repo` instead.

---

## Usage

Review your working tree changes:

```
/diff-review-dashboard
```

Review against a specific branch:

```
/diff-review-dashboard --base origin/main
```

Review a specific commit or commit range:

```
/diff-review-dashboard --base HEAD~1
/diff-review-dashboard --base HEAD~3
```

Explicitly pick a worktree (auto-detected by default):

```
/diff-review-dashboard --worktree /path/to/worktree
```

Filter to specific files:

```
/diff-review-dashboard --files src/foo.ts,src/bar.ts
```

Combine flags:

```
/diff-review-dashboard --base origin/main --files src/foo.ts
```

When the plugin starts, it prints the review URL to the TUI:

```
[diff-review-dashboard] review URL: http://127.0.0.1:55006/review/review_abc?token=...
```

The browser also auto-opens to that URL. If auto-open fails, paste the URL from the TUI.

### How worktree resolution works

The plugin resolves the repository root and review scope in this priority order:

1. `--worktree <path>` flag (explicit override)
2. `context.worktree` (the OpenCode session's current worktree, if any)
3. `context.directory` (the session's main checkout / cwd)

The first one that resolves to a valid git toplevel wins. State files and the diff source are pinned to that path across all rounds of the same session.

Auto-detection (when `--worktree` is not passed): if you're in the main checkout, the plugin lists every worktree, picks the one with the most commits ahead of `origin/main`, and uses that as the diff source. If you're already inside a worktree, it sticks with the current one.

### Tips

- The browser tab URL is one-shot per `/diff-review-dashboard` invocation — bookmarking it only works for the current round.
- Findings are anchored to file + line + a code snippet. If the surrounding code changes between rounds, the finding auto-closes (shown as `stale`).
- After submitting, the browser tab closes automatically.

---

## Review UI

The browser UI has three main areas:

- **Sidebar** (left) — resizable panel (drag the handle, width persisted to `localStorage`). Contains three tabs:
  - **Files Changed** — lists changed files with add/delete stats, tree/flat view toggle. File-level findings show a 📄 badge.
  - **Commits** — per-file commit list with short SHA and message.
  - **Conversation** — all findings with status badges (open/resolved/stale), plus inline comments per finding. Resolve, Remove, Reopen, or Jump-to-file actions per finding.
- **Diff cards** (center) — syntax-highlighted diffs. Click line numbers to select a range. Click the file card **+** button to add a file-level finding. Large unchanged regions are folded; click expand buttons to reveal 20 lines at a time.
- **Review drawer** (overlay) — pick category (`bug`, `style`, `perf`, `question`, `recommend`) and severity (`high`, `medium`, `low`), write a comment, and click "Add Finding". A notes field holds general observations.

Light/dark mode follows your system preference, or you can toggle it manually.

---

## Development

Originally forked from [`oorestisime/opencode-diffs`](https://github.com/oorestisime/opencode-diffs), now substantially rewritten with auto-worktree detection, file-level findings, commits/conversation panels, finding comments, resizable sidebar, diff folding, and the auto-apply review workflow.

### Scripts

| Script | What it does |
|---|---|
| `bun run build` | Bundle plugin (`tsdown` → `dist/plugin/index.mjs`) and UI (`dist/ui/`), then copy `src/ui/review.html` into `dist/ui/`. |
| `bun run prepare` | Runs automatically on `bun install`. Calls `build`. |
| `bun run lint` | Lint `src/` with [oxlint](https://oxc.rs/docs/guide/usage/linter). |
| `bun run format` | Format `src/` in place with [oxfmt](https://oxc.rs/docs/guide/usage/formatter). |
| `bun run format:check` | Check formatting without writing. |
| `bun run typecheck` | Type-check with `tsc --noEmit`. |
| `bun run check` | `format:check && lint && typecheck`. |
| `bun run prepublishOnly` | Runs `check` then `build` before `npm publish`. |
| `bun run test:ui` | End-to-end browser tests (Playwright MCP) — 10 git scenarios with mock review server. |

### Setup

```bash
bun install
bun run check        # format:check + lint + typecheck
bun run build        # writes dist/
```

---

## License

MIT
