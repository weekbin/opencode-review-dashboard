# @weekbin/opencode-review-dashboard

English | [中文](README.zh-CN.md)

An [OpenCode](https://opencode.ai) plugin that adds a `/diff-review-dashboard` slash command for browser-based code review, powered by [@pierre/diffs](https://diffs.com).

The command is named `diff-review-dashboard` (tool name: `diff_review_dashboard`).

## Screenshots

### Diff review with foldable unchanged regions

![Files Changed / Diff view](docs/screenshots/diff.png)

### Add a finding on a line or file

![Adding a finding](docs/screenshots/finding.png)

### Commits panel

![Commits list](docs/screenshots/commits.png)

### Conversation panel with comments

![Conversation](docs/screenshots/conversation.png)

### Diff range with uncommitted files

![Uncommitted files shown in gray with diff_base header and range banner](docs/screenshots/uncommitted-files.png)

## Features

This section catalogs every shipped capability so the README doubles as a product spec. Each entry lists a user-visible guarantee, where to find evidence (test or screenshot), and how to exercise it.

### Crash-safe review state (atomic writes)

Your review history survives power loss, an editor closing mid-save, and a corrupt `state.json` file. Every write to `state.json`, `round-NNN.json`, and `round-NNN.md` goes through a single atomic helper (`writeFileAtomic` in `src/state-store.ts`) that uses POSIX-atomic temp-file + rename. On the same filesystem the kernel guarantees readers see either the old contents or the new contents — never a half-written mix. Cross-device fallback uses `copyFile + unlink`. If the temp write fails partway (ENOSPC, EIO, etc.) the target is left untouched and the orphan `.tmp.*` file is cleaned up. If `state.json` is ever found unreadable on disk, it is renamed to `state.json.corrupt-<timestamp>` (preserving your review data for manual recovery), a warning is logged to the TUI, and a fresh state is started.

![Unit tests for atomic state writes — 10 pass / 0 fail across 7 scenarios](docs/screenshots/atomic-state-writes-test.png)

The 7 scenarios in the unit suite (T1 happy path · T2 ENOSPC isolation · T3 EXDEV fallback · T4 EACCES propagation · T5 concurrent saves · T6 corrupt-file preservation · T7 round-export atomicity) are run via:

```bash
bun run test:unit
```

You do not need to do anything to get this — every existing `/diff-review-dashboard` invocation already uses the atomic path. The only user-visible side effect: if you ever see `[diff-review-dashboard] state.json at … was unreadable; preserved as …` in your TUI, check the `.corrupt-<ts>` file to recover your data before continuing.

### Other shipped features

- **Browser review UI** — file tree, syntax-highlighted diffs with folded unchanged regions, finding drawer (category, severity, comment). See [Review UI](#review-ui).
- **Diff range with cross-round drift banner** — report the actual diff range reviewed; show a yellow banner when the range changes between rounds. See [Diff range](#diff-range).
- **Multi-round reviews** — findings carry over between rounds; auto-close stale ones when anchored code changes.
- **Previously discussed panel (4th sidebar tab)** — dedicated tab that surfaces prior-round context: per-round `notes` (read from the existing `round-NNN.md` exports) plus every prior finding with its full comment thread (open, resolved, and stale). Lets you re-orient to the conversation history before deciding what to do this round, without opening a terminal or scrolling 30+ entries in the Conversation tab. Complements the Conversation tab (which shows the current round).
- **Auto-apply workflow** — agent plan-first applies actionable findings in one batch, then re-runs the review.
- **Worktree auto-detection** — picks the worktree with the most commits ahead of `origin/main` when `--worktree` is omitted; an explicit `--worktree <path>` is always respected, even when the named worktree is empty (the auto-pickaround excludes the worktree it already tried, so it never silently overrides the user's flag).

---

## Diff range

Each round of `/diff-review-dashboard` reports the **actual diff range** that was reviewed, and shows it in the UI header:

- **Default**: `HEAD vs origin/main + working tree` (both merged). Uncommitted files appear in **gray** in the sidebar with an **uncommitted** badge on the file card so you can tell them apart from committed changes.
- **Override**: pass `--base=<ref>` (e.g. `--base=HEAD~3`) to view a commit range only, with no working tree.
- **Cross-round drift**: when the diff range changes between rounds (e.g. you add an uncommitted file in round 2 that wasn't in round 1), a non-blocking **yellow banner** appears at the top of the UI showing the previous range and the current range. The review continues; you can dismiss the banner with ×.

This fixes [issue #4](https://github.com/weekbin/opencode-review-dashboard/issues/4). Previously an uncommitted file could cause the tool to silently drop the entire commit-stack diff and return "no findings" when there was real work to review.

---

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

### Language matching for auto-replies

The agent's `add_review_comment` replies and Post-Apply Trace comments follow the language of your findings:

- **CJK ratio > 30%** in the user's text → reply in Chinese.
- **CJK ratio < 10%** → reply in English.
- **Mixed (10–30% CJK)** → default to English unless you clearly write in Chinese across 3+ comments in the same round.
- **Empty / whitespace input** → defaults to English (preserves prior behavior).

The heuristic is regex-based on the CJK character range `[\u4e00-\u9fff]` and runs in the plugin's `detectLanguage()` helper at `src/index.ts`. The agent prompt has a dedicated "### Language Matching" section that tells the model to mirror the user's comment language. Code, file paths, and tool identifiers stay in their canonical form regardless of the reply language.

**To verify manually** (out of e2e harness scope — requires a real OpenCode session): post 1 Chinese finding like "这个 auth middleware 应该用 jwt.verify", submit the round, trigger the auto-apply loop, and confirm the agent's `add_review_comment` reply is in Chinese. The Chinese reply will then surface in the "Previously discussed" panel of the next round.

### Multi-round reviews

Each session tracks review rounds. When you run `/diff-review-dashboard` again in the same session, findings from previous rounds carry over. If a file was removed or the anchored code changed, old findings are automatically closed (shown as `stale`). This enables iterative review.

The 4th sidebar tab ("Previously discussed") gives you a glanceable history of every prior round in the same session: per-round `notes` (read from `round-NNN.md`), per-round findings (open + resolved + stale), and the full comment thread on each finding (every user / agent reply, in chronological order). The data is read from the existing `state.findings[]` array and the existing `round-NNN.md` exports — no new state file, no new payload field, no new dependency. The current round is intentionally excluded (use the Conversation tab for that). If you're on round 1, the tab shows a "First round — no prior discussion yet" empty state.

### State and exports

Review state is persisted to `.opencode/reviews/<session>/`. Each round produces:

- `state.json` — full session state with all findings across rounds
- `round-NNN.json` — snapshot of findings for that round
- `round-NNN.md` — markdown summary

Drafts are auto-saved as you work, so you can close the browser and reopen without losing progress. Review state files are written atomically (temp file + rename) so a crash or power loss can't leave a half-written `state.json`. If `state.json` is ever found unreadable, it is preserved as `state.json.corrupt-<timestamp>` and a fresh review state is started; check the TUI for the warning and inspect the `.corrupt-*` file to recover data manually if needed.

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

Auto-detection (when `--worktree` is not passed): if you're in the main checkout, the plugin lists every worktree, picks the one with the most commits ahead of `origin/main`, and uses that as the diff source. If you're already inside a worktree, it sticks with the current one. The auto-pickaround excludes the explicitly-named worktree (or the current one if no `--worktree` is passed), so the plugin never picks the same worktree it already tried.

### Tips

- The browser tab URL is one-shot per `/diff-review-dashboard` invocation — bookmarking it only works for the current round.
- Findings are anchored to file + line + a code snippet. If the surrounding code changes between rounds, the finding auto-closes (shown as `stale`).
- After submitting, the browser tab closes automatically.

---

## Review UI

The browser UI has three main areas:

- **Sidebar** (left) — resizable panel (drag the handle, width persisted to `localStorage`). Contains four tabs:
  - **Files Changed** — lists changed files with add/delete stats, tree/flat view toggle. File-level findings show a 📄 badge. Untracked files appear with `status: "added"` and an "uncommitted" badge.
  - **Commits** — per-file commit list with short SHA and message.
  - **Conversation** — all findings with status badges (open/resolved/stale), plus inline comments per finding. Resolve, Remove, Reopen, or Jump-to-file actions per finding.
  - **Previously discussed** — prior-round context: per-round `notes`, per-round findings grouped by round (open + resolved + stale), and the full comment thread on each finding. Excludes the current round. Empty state on round 1.
- **Diff cards** (center) — syntax-highlighted diffs. Click line numbers to select a range. Click the file card **+** button to add a file-level finding. Large unchanged regions are folded; click expand buttons to reveal 20 lines at a time.
- **Notes surface** (collapsible section above the diff cards) — round-level notes live here in an always-visible spot, so you can write notes while reviewing without opening the drawer. These notes feed into the next round's "Previously discussed" panel. Click the "Round notes" summary to collapse the section when you want more vertical space.
- **Review drawer** (overlay) — findings-only: pick category (`bug`, `style`, `perf`, `question`, `recommend`) and severity (`high`, `medium`, `low`), write a comment, and click "Add Finding". The drawer contains only the finding fields — no notes, no submit.
- **Header actions** (top-right) — `Submit Review` is the only submit action and it always lives in the page header so the terminal action is never behind a panel toggle. Layout (unified / split) and theme (light / auto / dark) controls sit alongside it. The "Review" toggle button shows a live count of findings.

Light/dark mode follows your system preference, or you can toggle it manually.

---

## Development Workflow

This project uses an internal **7-role dev loop** (PM / PM Manager / Architect / Dev / Tester / PM Doc Writer / Decision) to pick the next issue, propose it, gate it on pseudo-requirements, design it, build it, validate it (including user-perspective Playwright tests), document it (with screenshots), and loop — without any single agent being biased toward "looks done." The loop reuses `/shared/ulw-plan`, `/shared/start-work`, `/shared/review-work`, and dogfoods this plugin's own `/diff-review-dashboard` for code review.

See **[docs/team-dev-loop.md](docs/team-dev-loop.md)** for the full design, the anti-bias rationale, the backlog priority rules, and how to install the loop's skill locally (it's gitignored).

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
| `bun run test:unit` | Unit tests (`bun test src/`) — atomic-write invariant, corrupt-file recovery, concurrent saves. |
| `bun run test:ui` | End-to-end browser tests (Playwright MCP) — 15 git scenarios with mock review server. |

### Setup

```bash
bun install
bun run check        # format:check + lint + typecheck
bun run build        # writes dist/
```

---

## License

MIT
