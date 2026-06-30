# opencode-review-dashboard

[English] | [中文](README.zh-CN.md)

A browser-based code review tool for [OpenCode](https://opencode.ai). Review diffs in your browser, leave comments, mark findings, then have an AI agent apply the fixes — all without leaving your editor.

If you review pull requests or diffs on a regular basis, this saves you the back-and-forth of copy-pasting comments into GitHub.

---

## What you can do with it

**Browse a diff in your browser.** All your changes (committed + uncommitted) are rendered in a single page. Unchanged regions are collapsed by default — click to expand. Files you haven't touched yet are dimmed so you can see at a glance what changed.

**Add findings.** Click a line number, type a comment, pick a category (bug / style / performance / question / recommendation), pick a severity (high / medium / low), and you're done. The finding is saved to a state file. You can also add file-level findings (not tied to a specific line) for general feedback.

**Comment threads.** Each finding can have multiple comments — useful when you and the agent iterate on a fix. Findings carry state: open / resolved / stale (auto-marked if the line it points to changes between rounds).

**Multi-round review.** When you submit a round, the agent applies its fixes, and you start a new round on top of those. Findings from previous rounds stay available via a dedicated "Previously discussed" tab — you can see what was discussed in round 1 when you're reviewing round 4.

**AI agent auto-apply.** The agent reads your findings, plans the fixes, applies them, and verifies. You can iterate within a single round: submit, the agent applies, you review the diff and add more findings if needed.

**Worktree auto-detection.** If you're working in a git worktree, the tool figures out which worktree you're in. No need to pass `--worktree` flags.

---

## Features

### Reading diffs

- **Foldable unchanged regions** — long diffs become scannable
- **Files-changed count** in the sidebar — see scope at a glance
- **Visual diff for line-level and file-level** — both supported
- **Diff range banner** — if the range changes mid-session (e.g., new uncommitted file), a yellow banner appears

### Adding findings

- **Click any line number** to start a finding on that line
- **Pick category** — bug / style / performance / question / recommendation
- **Pick severity** — high / medium / low
- **Add file-level findings** for general feedback (not tied to a line)
- **★ Pin findings** *(added R12)* — star any finding to mark it for revisit in the next round. A "★ Pinned" filter chip and a "★N" badge on the Conversation tab show all your starred findings at a glance
- **React with emoji** *(added R12)* — 👍 👎 😄 ❤️ 🎉 👀 on any finding. One click vs typing "lgtm". Click the same emoji again to remove your reaction

### Reviewing and iterating

- **`n` / `p` keys** *(added R12)* — jump to next/previous finding without scrolling. Works when your cursor isn't in a text field
- **In-diff search** *(added R13)* — `Ctrl+F` (or `Cmd+F` on Mac) opens a search bar to find any text in the loaded diff. Enter jumps to next match, Shift+Enter to previous
- **★ Sort findings** *(added R14)* — dropdown to sort by Newest / Oldest / Severity (high → low) / File path (A-Z)
- **Filter Previously-discussed by round** *(added R14)* — when reviewing 5+ rounds, filter the history tab by round number
- **★ Cmd+P file jumper** *(added R15)* — VS Code-style quick-open palette. Type a filename to jump directly to it

### Resolving findings

- **★ Resolve-with-reason modal** *(added R13)* — when resolving a finding, you can pick a quick-reason (Fixed / False positive / Out of scope / Wontfix) or type your own. The reason is preserved for future reference
- **Mark as wontfix / out-of-scope** *(added R13)* — distinct from plain Resolve. Use this for findings you agree with but don't want fixed (known issue, future work, etc.)
- **Comments audit trail** *(added R15)* — every edit to a finding preserves the prior version. The conversation thread shows "X edits" with the before/after history

### Submitting

- **Submit confirm modal** *(added R15)* — before final submit, a modal shows "Review N findings before submitting" to prevent accidental submits
- **Auto-save indicator** *(added R14)* — "Saved 3s ago" appears in the header, updates in place. No more intrusive "Draft saved at 12:34:56" toasts

### Workflow

- **Multi-round review** — each submit is a round. Findings carry forward between rounds. Stale findings (anchored to a line that changed) are auto-marked
- **Auto-apply agent** — the agent reads your findings, plans, applies, and verifies. Iteration within a round
- **Export** — save the review as a markdown report
- **Round notes** — global notes per round, auto-imported into the "Previously discussed" view

---

## How to install it

1. Install [OpenCode](https://opencode.ai) if you haven't
2. Install the plugin (see OpenCode plugin registry for the exact command):
   ```bash
   opencode plugin install @weekbin/opencode-review-dashboard
   ```
3. Open a project with git changes
4. Run `/diff-review-dashboard` in your OpenCode chat

That's it. The dashboard opens in your browser at `http://localhost:<port>`.

---

## How to use it

**A typical workflow:**

1. You make some code changes in your editor
2. You commit some, leave others uncommitted — that's fine
3. In OpenCode chat, you type `/diff-review-dashboard` and press Enter
4. Your browser opens to the review dashboard
5. You click line numbers to add findings, type comments, pick categories and severities
6. When you're done adding findings, you click "Submit Review" — confirm in the modal
7. The agent reads your findings, plans fixes, applies them
8. You reload the browser to see the agent's diff
9. You iterate: review the agent's changes, add more findings, or resolve what you liked
10. When you're fully satisfied with a round, you submit it; the findings carry forward to the next round

**Tips:**
- Use ★ Pinned for findings you want to revisit after the agent applies changes
- Use emoji reactions to give quick feedback without writing a full comment
- Use `n` / `p` keys to fly through findings without scrolling
- The "Previously discussed" tab accumulates history across rounds — use the round filter to focus on recent context

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `n` | Jump to next finding |
| `p` | Jump to previous finding |
| `Ctrl+F` / `Cmd+F` | Open in-diff search |
| `/` | Open in-diff search (alternative) |
| `Cmd+P` / `Ctrl+P` | Open file quick-jump palette |
| `Escape` | Close any open modal / overlay |
| `Enter` | Confirm default action in modals |

---

## FAQ

**Q: Where is my review data stored?**
A: In a `state.json` file at the project root. Each round also exports a `round-NNN.json` and `round-NNN.md` for reference.

**Q: Can I review a PR that someone else opened?**
A: Yes — pass `--base=<branch>` (e.g., `--base=main` to review all changes since main). The dashboard shows that diff instead of your working tree.

**Q: What happens if my review gets interrupted (browser closed, computer dies)?**
A: Everything is auto-saved. The next time you open the dashboard, you pick up where you left off. If `state.json` ever gets corrupted, the tool preserves it as `state.json.corrupt-<timestamp>` and starts a fresh state — your data isn't lost.

**Q: Can I work in a git worktree?**
A: Yes. The tool auto-detects the worktree (the one with the most commits ahead of `origin/main`). You can also pass `--worktree=<name>` explicitly.

**Q: How do I see what was discussed in a previous round?**
A: Click the "Previously discussed" tab. Use the round filter dropdown to focus on specific rounds.

**Q: Can I un-resolve a finding?**
A: Yes — click the finding, change its status back to "open", and add a reason if you want.

**Q: Is there a keyboard shortcut to navigate between findings?**
A: Yes — `n` (next) and `p` (previous). The shortcuts work when your cursor isn't in a text field, so you can type `n` and `p` in comments without triggering nav.

---

## License

[MIT](LICENSE) (or whatever the project uses)

---

## Contributing

Bug reports and PRs welcome. See [issues](https://github.com/weekbin/opencode-review-dashboard/issues) for the current backlog.
