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
- **Saved Replies / Comment Templates** — save a current finding comment as a named template, insert it into a new finding with one click from a dropdown. Templates persist in localStorage and survive page reload. Closes the GitHub Saved Replies gap. Empty state when no templates saved.
- **Export review as markdown or patch** — click "Export" in the header to download either a Markdown summary (round number, timestamp, findings table, notes) or a unified diff `.patch` file (same as `git diff`). Filenames: `review-<round>-<timestamp>.md` / `review-<round>-<timestamp>.patch`.
- **Edit a finding in-place** — after submit, click "Edit" on any finding card to change its category, severity, or comment. The edit is server-validated, recorded with a `manually_edited` flag and `edited_at` timestamp (preserved across auto-close), and shows an "Edited <relative-time>" badge. Architecture profile — extends R9's `manually_reopened` server-widening pattern. **Unique**: GitHub does not allow editing submitted PR review comments.
- **Saved Replies `/trigger` typed-prefix expansion** — type `/<template-name>` followed by space, Tab, or Enter inside a finding's comment textarea to expand to the saved-reply body in place. Trigger names are slugified from the template name (so "Missing Err Handling" expands via `/missing-err-handling`). Unknown `/<name>` stays literal (no silent corruption), and bare `/` never triggers — leaves room for future OpenCode slash-commands. Extends the R10 Saved Replies click-to-insert dropdown with a keyboard path. Complements (not replaces) GitHub's positional `Ctrl+.`+number saved-reply shortcut by offering name-prefix expansion instead of number-index lookup.
- **Per-finding permalink anchor** — every finding card in the Conversation and Previously discussed panels carries `id="finding-<id>"`, and a "Copy link" button writes `<base-url>#finding-<id>` to the clipboard. Visiting a `#finding-<id>` URL auto-scrolls to that finding and applies a brief 1.5s flash highlight. If the referenced finding isn't in either panel (e.g., it was auto-closed in a later round), a small toast surfaces so you don't silently drop the link. Closes the GitHub `#discussion_r<id>` / Gerrit line-number permalink gap with a simpler W3C element-id hash.
- **★ Pinned findings** — click the ★ star on any finding card to mark it for revisit after the next round. A `★ Pinned (N)` filter chip and a `★N` badge on the Conversation sidebar tab give you a glanceable list of starred findings. The `manually_pinned` flag is honored by the agent's auto-apply loop, so pinned findings aren't silently auto-closed as stale. Reviewer-side revisit list — distinct from GitHub's admin-only repo-level "Pinned Issue" feature (which is capped at 3 repo-wide and requires admin perms).
- **Emoji reactions on findings** — a row of 6 emoji buttons (👍 👎 😄 ❤️ 🎉 👀) sits beneath each finding's comment thread. Click an emoji to react (1 click vs ~30 sec typing "lgtm"); click the same emoji again to remove your reaction (idempotent toggle). Already-reacted emojis render with active styling + a grouped count pill. Closes the GitHub reactions + GitLab emoji awards gap. Emoji whitelist enforced server-side; unknown emojis return 400.
- **`n` / `p` keyboard nav between findings** — focus outside any comment textarea and press `n` to jump to the next finding card, `p` to jump to the previous (wraps at both ends). Uses the same 1.5s flash highlight as the per-finding permalink. A subtle bottom-right hint shows "Press n / p to navigate findings" when the Conversation tab is active. Skips when `<textarea>` / `<input>` / `contentEditable` is focused so typing 'n' or 'p' in a comment doesn't fire nav. Closes the GitHub `Cmd+]` / `Cmd+[` jump-to-review-thread gap with an intuitive `n`/`p` mnemonic (vs vimdiff's `]c`/`[c`) to match Slack / email muscle memory.
- **Resolve with reason** — clicking "Resolve" on an open finding opens a modal with 4 quick-reason chips (fixed in this round / no longer applies / will fix in follow-up / false alarm) plus a free-form textarea. Cancel returns null (no POST); Confirm POSTs `{finding_id, reason}` and stamps `resolve_reason` + `resolve_manually_resolved` on the finding, which the agent's auto-apply loop honors as a hard-skip signal (R13 Manually-resolved honor directive). Mirrors the R9 Force-Reopen reason modal so the user has a single, consistent "tell the agent why" surface for both re-opening and resolving. Closes the GitHub "Resolve conversation" dropdown + Jira resolution reason field gap.
- **Mark as wontfix** — sibling button to "Resolve" on open findings opens a 4-radio modal (`wontfix` / `out_of_scope` / `false_positive` / `duplicate`) plus an optional reason textarea. The selected `kind` is validated server-side against a 4-value whitelist (400 on miss, mirrors the R12 emoji whitelist). Stamps `resolution_kind` + `resolution_reason` and renders a `badge-resolution-{kind}` next to the existing severity/category/kind badges in the Conversation panel. The agent's R13 Resolution-kind honor directive treats `wontfix` / `out_of_scope` as a hard skip and `false_positive` / `duplicate` as references for similar-looking future issues. Closes the GitHub "Close as not planned" + Jira "Won't Do" / "Duplicate" workflow gap.
- **In-diff search (`Ctrl+F` / `Cmd+F` / `/`)** — capture-phase global keydown listener intercepts `Ctrl+F` (or `Cmd+F` on macOS) plus `/` (when no text input is focused, mirroring the R12 n/p focus-guard) and opens a fixed-top search overlay. Type to filter the diff cards: every match is wrapped in `<mark class="diff-search-match">` (preserves the @pierre/diffs syntax-highlight spans), the counter shows `N of M matches` (or `100+ matches, refine your query` past the cap). `Enter` / `F3` jumps to the next match, `Shift+Enter` / `Shift+F3` to the previous, each with the same 1.5s flash highlight as the per-finding permalink. `Escape` closes the overlay and removes all `<mark>` wrappers. The last query is persisted in `sessionStorage` (try/catch wrapped for private-mode safety) so re-opening restores it within the same round — distinct from `localStorage` because the search query is round-scoped and should NOT leak across sessions. Closes the GitHub jump-to-symbol `t` + diff.nvim `/` search gap with a fixed-top overlay that doesn't scroll with the page.
- **Sort findings dropdown (Conversation panel)** — `★ Sort` `<select>` in the Conversation toolbar with 4 options: Newest first (default, preserves pre-R14 chronological order) / Oldest first / Severity high → low / File path A–Z. Sort is a pure client-side reducer over the existing `state.existing + state.fresh` arrays — no network call — and is applied AFTER the in-tab search filter (compose semantics, doesn't reset search). The selection is sticky per-session via `localStorage` key `diff-review:sort-findings-by`, so a page reload preserves your sort choice. Closes the GitHub "Sort by" dropdown + Linear priority-sort + Jira "Order by" gap with a 4-mode enum that mirrors the rest of the plugin's enum-based settings.
- **Previously-discussed round filter** — `Round` `<select>` in the Previously discussed panel toolbar with one option per prior round (plus `All rounds` default). Dropdown options are dynamically rebuilt on every render from the unique round numbers in `state.existing` (cheap, < 10 items max), so the filter row never goes stale as you submit more rounds. Filter state is in-memory ONLY (not localStorage) because which rounds exist depends on the current review session; a persisted "Round 3" filter on a fresh session with 0 rounds would silently match nothing. Filter composes with the R8 in-tab search: the search filter runs first, then the round filter narrows the result further. If your selected round no longer exists, the dropdown falls back to `All rounds` for that render without mutating your state — your choice is preserved in case the round reappears. Closes the GitHub "Filter by review" + Linear "Filter by cycle" gap with a round-scoped session filter.
- **Draft auto-save indicator** — replaces the intrusive "Draft saved at HH:MM:SS" toast with a persistent "Saved Xs ago" indicator in the review header. The indicator ticks every 5s via `setInterval` and falls back to "All changes saved" (idle state) after 60s of no new saves. The `Draft` type in `src/index.ts` gains an optional `lastSavedAt?: number` field; the server-side PUT `/draft` handler computes `max(client, server, prev)` to keep the stamp monotonic across clock skew, and echoes the canonical value in the response body so the client adopts it as the new baseline. Each fresh save triggers a 1-frame CSS pulse (`@keyframes save-indicator-pulse`) to draw the eye. Backwards-compat: state.json files from R12 or earlier load with `lastSavedAt` missing → 0 → indicator stays in the "All changes saved" idle state, no regression. Closes the VS Code "● Auto Saved" dot + Notion "Saved just now" / Google Docs "All changes saved" gap with a 5s-tick indicator that doesn't intrude on the working area.

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

The heuristic is regex-based on the CJK character range `[\u4e00-\u9fff\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff]` (Chinese Hanzi + Japanese Kanji/Hiragana/Katakana + Korean Hangul) and runs in the plugin's `detectLanguage()` helper at `src/index.ts`. The agent prompt has a dedicated "### Language Matching" section that tells the model to mirror the user's comment language. Code, file paths, and tool identifiers stay in their canonical form regardless of the reply language.

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
- **Keyboard shortcuts** (work in the review UI):
  - `Ctrl+F` (or `Cmd+F` on macOS) — open the in-diff search overlay (R13 #22). Type to filter the diffs, `Enter` / `F3` jump to the next match, `Shift+Enter` / `Shift+F3` to the previous, `Escape` closes.
  - `/` — same as `Ctrl+F` when no text input is focused (mirrors the `n`/`p` nav focus-guard).
  - `n` / `p` — jump to the next / previous finding card in the Conversation tab (R12 #19). Wraps at both ends.
  - `Tab` to the `★ Sort` dropdown in the Conversation panel toolbar (R14 #23) — then arrow keys to pick a sort mode (`newest` / `oldest` / `severity` / `file`) and `Enter` to apply. Selection is sticky per-session, so the keyboard choice persists across reloads.

---

## Review UI

The browser UI has three main areas:

- **Sidebar** (left) — resizable panel (drag the handle, width persisted to `localStorage`). Contains four tabs:
  - **Files Changed** — lists changed files with add/delete stats, tree/flat view toggle. File-level findings show a 📄 badge. Untracked files appear with `status: "added"` and an "uncommitted" badge.
  - **Commits** — per-file commit list with short SHA and message.
  - **Conversation** — all findings with status badges (open/resolved/stale), plus inline comments per finding. Resolve, Remove, Reopen, or Jump-to-file actions per finding. Star a finding (★) to pin it for revisit, or react with 👍/👎/😄/❤️/🎉/👀 to give fast feedback. Filter chips: `Unresolved | Resolved | All | ★ Pinned (N) | 😀 Reacted (N)`. Press `n` / `p` to jump between finding cards without scrolling.
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
| `bun run test:ui` | End-to-end browser tests (Playwright MCP) — 33 git scenarios with mock review server. |

### Setup

```bash
bun install
bun run check        # format:check + lint + typecheck
bun run build        # writes dist/
```

---

## License

MIT
