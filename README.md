# opencode-review-dashboard

An [OpenCode](https://opencode.ai) plugin that adds a `/diff-review-dashboard` command for browser-based code review powered by [@pierre/diffs](https://diffs.com).

The command is named `diff-review-dashboard` (not `diff-review`) to avoid collisions with the upstream [`oorestisime/opencode-diffs`](https://github.com/oorestisime/opencode-diffs) plugin. The tool name is `diff_review_dashboard`.

## What it does

When you run `/diff-review-dashboard` inside an OpenCode session, the plugin:

1. **Collects diffs** from your git working tree (or between a base branch and HEAD)
2. **Starts a local HTTP server** and opens a review UI in your browser — the URL is also printed to the TUI stdout so you can copy it if the browser doesn't auto-open
3. **Waits for you to review** — you annotate lines in the diff with findings (category, severity, comment)
4. **Returns a structured JSON payload** to OpenCode on submit
5. **Agent auto-applies** actionable findings (see [Auto-apply rule](#auto-apply-rule))

### Review flow

```
You run /diff-review-dashboard
    → Plugin reads git diff
    → Plugin prints "review URL: http://127.0.0.1:NNNN/..." to the TUI
    → Browser opens with syntax-highlighted diffs
    → You click lines, add findings (bug/style/perf/question/recommend + severity + comment)
    → You hit "Submit Review"
    → Plugin returns one-line JSON: { round, open_count, by_severity, by_category, notes, findings[], artifacts }
    → Agent auto-applies actionable findings, then re-runs /diff-review-dashboard
```

### Auto-apply rule

The slash-command template tells the agent to **not ask the user how to proceed**. After a submit:

- The agent sorts findings by severity (high → medium → low) and skips `category: question` (clarification requests).
- **Plan-first**: the agent reads every affected file once, then designs a UNIFIED fix plan addressing all actionable findings together. Per-finding fixes lose context and produce inconsistent patches — the plan must cover all findings as a coherent change.
- The agent applies the entire plan in one go via Edit calls, then re-runs `/diff-review-dashboard` to confirm.
- If `open_count == 0` or no findings are actionable, the agent responds with a single line: `Round N: no actionable items, closing out.` and stops.

### Multi-round reviews

Each session tracks review rounds. When you run `/diff-review-dashboard` again in the same session, findings from previous rounds carry over. If a file was removed or the anchored code changed, old findings are automatically closed. This lets you do iterative review — submit findings, the agent auto-applies, then you review the new diff.

### State and exports

Review state is persisted to `.opencode/reviews/<session>/`. Each round produces:
- `state.json` — full session state with all findings across rounds
- `round-NNN.json` — snapshot of findings for that round
- `round-NNN.md` — markdown summary

Drafts are auto-saved as you work, so you can close the browser and reopen without losing progress.

---

## Installation

This plugin is distributed as the npm package [`opencode-review-dashboard`](https://github.com/weekbin/opencode-review-dashboard). The `dist/` directory is built on install via the `prepare` script — no pre-shipped build artifacts.

### Option 1 — install from GitHub (recommended, no publish required)

Add this to your `opencode.json` (either your global config or a per-project `.opencode/opencode.json`):

```json
{
  "plugin": ["github:weekbin/opencode-review-dashboard"]
}
```

OpenCode will clone the repo, run `prepare` (which builds `dist/`), and pick up `dist/plugin/index.mjs` via the `main` field in `package.json`.

### Option 2 — install from npm (when published)

```json
{
  "plugin": ["opencode-review-dashboard"]
}
```

### Option 3 — install from a local clone (best for hacking on the plugin itself)

If you have this repo cloned at `~/Projects/opencode-review-dashboard`, point OpenCode at it directly:

```json
{
  "plugin": ["file:~/Projects/opencode-review-dashboard"]
}
```

Relative paths work too:

```json
{
  "plugin": ["file:../opencode-review-dashboard"]
}
```

Use this when you want to edit the plugin code and see changes after a rebuild (`bun run build`) + OpenCode restart.

### After install

Restart OpenCode. The `/diff-review-dashboard` slash command will be registered.

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

Explicitly pick a worktree (auto-detected by default, most-active wins):

```
/diff-review-dashboard --worktree /path/to/worktree
```

### How worktree resolution works

When you run `/diff-review-dashboard`, the plugin resolves the repository root and review scope in this priority order:

1. `--worktree <path>` flag (explicit override — wins over everything)
2. `context.worktree` (the OpenCode session's current worktree, if any)
3. `context.directory` (the session's main checkout / cwd)

The first one that resolves to a valid git toplevel wins. State files (`.opencode/reviews/<session>/state.json`) and the diff source are pinned to that same path across all rounds of the same session, so findings persist between `/diff-review-dashboard` invocations regardless of how you switch between auto-detect and explicit `--worktree`.

Auto-detection (when `--worktree` is **not** passed): if you're in the main checkout, the plugin lists every worktree, picks the one with the most commits ahead of `origin/main` (most-active wins), and uses that as the diff source. If you're already inside a worktree, it sticks with the current one — auto-pick never jumps out of your current worktree.

Filter to specific files (comma-separated, no spaces):

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

The browser also auto-opens to that URL. If the auto-open fails (e.g. headless), you can paste the URL from the TUI line.

When you submit, the plugin closes the browser tab and returns a single-line JSON object: round number, `open_count`, `by_severity` / `by_category` counts, reviewer notes, and an array of findings (each with `id`, `severity`, `category`, `file`, `start_line`/`end_line`, `side`, `comment`, and optionally `kind: "file"`). The agent acts on this directly per the auto-apply rule. The round JSON + markdown files are still written to `.opencode/reviews/<session>/` for human reading and re-loading in future rounds.

### Tips

- The browser tab is just `http://127.0.0.1:<random-port>/` — bookmarking the URL only works for the current round (the server is a one-shot per `/diff-review-dashboard` invocation).
- Findings are anchored to file + line + a code snippet. If the surrounding code changes between rounds, the finding auto-closes (shown in the UI as "stale").
- After submitting, the browser tab closes automatically (the plugin opens the tab via the OpenCode SDK's `openUrl`, which lets the same origin close it on submit).

---

## Review UI

The browser UI has two main areas:

- **Sidebar** (left) — resizable panel (drag the handle, persisted to localStorage). Contains three tabs:
  - **Files changed** — lists all changed files with add/delete stats, tree or flat view toggle. File-level findings show a 📄 badge. Click a file to scroll to its diff card.
  - **Commits** — per-file commit list with short SHA and message.
  - **Conversation** — all findings (line-level and file-level) in chronological order with status badges (open/resolved/stale). Resolve, Remove, or Jump-to-file actions per finding.
- **Diff cards** (center) — syntax-highlighted diffs for each file. Click line numbers to select a range and open the review drawer. Click the **+** button on a file card header to add a file-level finding (no line anchor). Files can be collapsed and marked as read.
- **Review drawer** (overlay) — opens when you select lines or click **+**. Pick category (`bug`, `style`, `perf`, `question`, `recommend`) and severity (`high`, `medium`, `low`), write a comment, and click "Add Finding". `recommend` is for positive suggestions / improvements that aren't strictly defects. A notes field at the bottom holds general observations.

Findings from prior rounds appear in the Conversation tab with a "Resolve" button. Light/dark mode follows your system preference, or you can toggle it manually.

---

## Development

Originally forked from [`oorestisime/opencode-diffs`](https://github.com/oorestisime/opencode-diffs), now substantially rewritten with auto-worktree detection, file-level findings, commits/conversation panels, resizable sidebar, and the full auto-apply review workflow.

### Scripts

| Script | What it does |
|---|---|
| `bun run build` | Bundle plugin (`tsdown` → `dist/plugin/index.mjs`) and UI (`dist/ui/`), then copy `src/ui/review.html` into `dist/ui/`. |
| `bun run prepare` | Runs automatically on `bun install` (including OpenCode's plugin install). Calls `build`. Ensures `dist/` exists before consumers load the plugin. |
| `bun run lint` | Lint `src/` with [oxlint](https://oxc.rs/docs/guide/usage/linter). |
| `bun run format` | Format `src/` in place with [oxfmt](https://oxc.rs/docs/guide/usage/formatter). |
| `bun run format:check` | Check formatting without writing — fails the build if `src/` is not formatted. |
| `bun run typecheck` | Type-check with `tsc --noEmit` against `tsconfig.json`. |
| `bun run check` | Convenience: `format:check && lint && typecheck`. Run this before committing. |
| `bun run prepublishOnly` | Runs `check` then `build` automatically before `npm publish`. |
| `bun run test:ui` | Run end-to-end browser tests (Playwright MCP) — 10 git scenarios with mock review server. |

### Setup

```bash
bun install
bun run check        # format:check + lint + typecheck
bun run build        # writes dist/
```

To test a local change, use the `file:` install above, then run `bun run build` and restart OpenCode.

---

## License

MIT
