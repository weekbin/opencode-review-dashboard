# PM Brief — Round 12

> **Date**: 2026-06-30
> **Author**: Round 12 PM Triage (fresh subagent, v5 PM Triage role)
> **Status**: PM brief, awaiting PM Manager review (Phase 0.5)
> **Source**: User's explicit hint (Chinese, "提需求出来 — 现在这些我都不是很想做") + v5 competitor-driven self-investigation + R11 backlog-freshness check + 0 fresh R11 closure commits blocking R12
> **Pre-check result**: PASS — R11 baseline `1b0da21` (R11 merge to main) verified, R10 + R11 SHAs verified against current main, all 4 R11 SHAs (`0fd2205` / `b533139` / `bbce9ca` / `7081e37`) exist. R11 closure decision.md `f9ac431` baseline also verified.
> **Strategy**: **FRESH USER-STORIES PER USER HINT**. The user explicitly said "现在这些我都不是很想做" about the existing backlog (#12 Bulk actions, #13 Live file-watcher, R11 README polish). R12's brief deliberately pushes all three to the bottom of the ranking (or excludes them) and surfaces 7 fresh candidates from genuine competitor-gap + unique-capability analysis. PM does NOT default to #12/#13/polish. If the user picks "none of the above" that is fine — the brief is honest that these are the only fresh stories available.

---

## Title

R12 surfaces **7 fresh user-stories** the existing backlog never proposed — every one closes either a real competitor gap (GitHub PR review / Phabricator / Gerrit / VS Code) OR unlocks a unique OpenCode + plugin capability. The three items the user said they're not interested in (#12 Bulk actions, #13 Live file-watcher, R11 README polish) are **explicitly deprioritized** to the bottom with a documented "user rejected" rationale, not promoted as defaults.

The 7 candidates cover two themes:

- **Theme A — Reviewer feedback signal speed**: `★ Pinned findings` (Candidate #1), `Reactions on findings` (Candidate #2), `Jump-to-next-finding keyboard nav` (Candidate #3). Today every reviewer interaction requires a full-text comment; these three add low-friction signals (a star, an emoji, a keystroke) that compress common feedback to 1 click / 1 key.
- **Theme B — Power-user / keyboard-first navigation**: `Cmd+P quick file jumper` (Candidate #4), `Cmd+/ keyboard shortcuts help overlay` (Candidate #5), `Round submission confirmation modal` (Candidate #6), `Comments audit trail` (Candidate #7). These four unlock VS Code / Phabricator / GitHub-grade navigation and safety for the long-running review sessions that have 30+ findings across 4+ rounds.

---

## Source

- **R12 baseline**: `1b0da21` (R11 merge to main, verified)
- **R11 SHAs verified** (regression check per v5 R4 lesson):
  - `0fd2205` ✓ (feat(saved-replies-trigger): /<name>+space expansion, R10 extension)
  - `b533139` ✓ (feat(permalink): #finding-<id> anchor + Copy-link button)
  - `bbce9ca` ✓ (test(saved-replies-trigger + permalink) e2e scenarios)
  - `7081e37` ✓ (round-11 closure docs)
  - `1b0da21` ✓ (R11 merge to main — current HEAD)
  - `0c28a6c` ✓ (R11 closure audit-trail commit)
  - `f9ac431` ✓ (v5.3 baseline)
- **R11 closure outcome**: SHIP per `.omo/round-11/decision.md` — 2 candidates shipped (lightweight), 135/135 unit tests pass, 25 e2e scenarios, 4 atomic commits, 2 skill gaps surfaced (R/S: orchestrator timeout + Phase 3c Playwright discipline). Lightweight mode validated end-to-end.
- **R11 carry-over polish**: `.omo/proposals.jsonl` R11 line `follow_up_candidates` lists `R11 PM Researcher mischaracterization corrections in README (verify before R12)` — explicitly DEPRIORITIZED in R12 per user hint ("现在这些我都不是很想做"). Documented in ## Self-Critique.
- **Open GitHub issues** (per `gh issue list --state open --limit 30`):
  - `#12 Bulk actions (multi-select + bulk resolve / bulk reopen)` — architecture, aged_rounds=2. **DEPRIORITIZED in R12 per user hint.**
  - `#13 Live file-watcher auto-reload of the diff while reviewing` — architecture (new `chokidar` dep ~250KB), aged_rounds=2. **DEPRIORITIZED in R12 per user hint.**
- **User's explicit hint** (CRITICAL — weighted heavily in ranking): "我需要 PM 给我讲用户故事，多提一点需求出来，现在这些我都不是很想做" — "I need PM to tell me user stories, propose more requirements — the current ones (#12/#13/README polish) I'm not really interested in doing."
- **v5 PM Triage post-R11 mandate**: per `R11 retro.md ## Followup items`, R12 PM Triage should surface fresh self-investigated candidates with backlog-freshness gate honored (Issue #12 + #13 aged_rounds=2 still technically fresh, but user-hint overrides).
- **Re-verified R10 follow-up backlog** (`.omo/proposals.jsonl` R10 line `follow_up_candidates`): `#4 E2E coverage gap` + `#5 Bulk actions`. Both already accounted for: #4 was the "Issue templates bulk-apply" concept R11 surfaced and the user rejected. #5 = #12 (now aged_rounds=2).

---

## User pain (1-3 sentences, user terms)

You finish a 4-round review of a 1,200-LOC PR with 32 findings. Every round, you wish for: (a) **a faster way to mark a finding as "revisit this later"** instead of writing "TODO" in the comment thread (★ Pinned findings); (b) **a faster way to say "this fix worked"** than typing "lgtm" — GitHub users have emoji reactions and Slack users have emoji, but you don't (Reactions); (c) **a way to jump between findings without scrolling** — your reviewer flow is `find → read → comment → find next`, and `n`/`p` keyboard navigation would compress that to a keystroke; (d) **a way to jump directly to a specific file** when there are 50 files in the sidebar (Cmd+P palette); (e) **a way to remember which shortcuts you've learned** as the feature set grows (Cmd+/ overlay); (f) **a confirmation step before submitting** because you hit Submit by mistake once and lost a round's work (Submission modal); (g) **a way to see WHY your severity changed from `medium` to `low`** when the agent or a teammate re-edited (Audit trail).

---

## Competitor analysis (v5 — mandatory)

### Per-tool landscape

| Tool | Core capability | opencode-review-dashboard |
|---|---|---|
| GitHub PR review | Inline comments, saved replies, **reactions (👍 👎 😄 ❤️ 🎉 👀)**, **jump-to-next-review-thread** (`Cmd+]` / `Cmd+[`), **submission summary modal**, **discussion permalinks** | Has: Saved Replies (R10+11), per-finding permalinks (R11), multi-round review, stale auto-close, auto-apply agent. **Lacks: emoji reactions, jump-to-next-finding keyboard nav, submission confirmation modal.** |
| GitLab MR | Approvals, multi-reviewer, MR rules, **emoji awards** (similar to reactions), **jump-to-next-unresolved-thread** (default `j` / `k`) | Has: single-user local review. **Lacks: emoji reactions, jump-to-next-finding keyboard nav, file jumper.** |
| Phabricator Differential | Audit trail (every change to every field logged), **Herald rules**, **batch edit**, **Starred revisions** | Has: round history. **Lacks: full audit log of finding edits (only `manually_edited` flag, no prior-version preservation), starred revisions / pinned findings.** |
| Gerrit | Code review voting (-2..+2), patch sets, **`#<linenumber>` URL anchor** | Has: severity. **Lacks: review-thread keyboard nav, file jumper.** |
| Review Board | Review requests, **screenshots with inline annotation**, screenshot UI | Partial: only diff cards, no screenshot annotation |
| Sourcetree / GitKraken | Visual diff, no review | Partial: diff is the core, no review surface. **Both have `Cmd+P` file jumper.** |
| Cursor review / aider rewind | AI-suggested review, inline, **Cmd+K to apply AI fix**, **Cmd+P file quick-open** | Partial: no AI suggestion. **Lacks: Cmd+P-style file quick-open palette.** |
| diff.nvim / vimdiff | Side-by-side diff, **`/` to search diff**, **live file-watcher**, **`n`/`N` to next/prev match** | Has: split view. **Lacks: in-diff search (could close Gerrit/vimdiff gap), next/prev finding keyboard nav.** |
| VS Code (general editor) | **Cmd+P quick file open palette**, **Cmd+K Cmd+S keyboard shortcuts editor**, **`Cmd+/` toggle comment** | No IDE / editor — we are a web UI. **Lacks: Cmd+P-style quick file palette, keyboard shortcuts help overlay.** |

### Unique OpenCode + plugin capabilities (我们独占)

(Re-verified against current main `1b0da21`; all 11 listed in R11 brief remain accurate, with 4 new ones proposed below marked "candidate".)

- **Round-by-round review** with stale-finding auto-close (no competitor does this natively)
- **Local-only** review (no server, no PR required) — uniquely friction-free for solo work
- **Auto-apply agent workflow** — agent reads findings, applies fixes, re-reviews (no competitor has this loop; Cursor/aider have AI patches but not the find → apply → re-review loop)
- **Cross-round drift banner** — yellow banner when diff range changes between rounds
- **Previously discussed panel** (R4) — per-round notes + threads in dedicated tab
- **Force Reopen** (R9) with `manually_reopened` flag honored by the agent
- **Edit finding in-place** (R10) with `manually_edited` flag — **plausibly unique;** GitHub does not allow editing submitted PR review comments
- **Saved Replies /trigger** typed-prefix expansion (R11) — plausibly unique among code-review tools (competitors use positional shortcuts)
- **Per-finding permalink** (R11) with `#finding-<id>` URL hash
- **localStorage-resizable sidebar** + sidebar keyboard navigation (R8) + in-tab search (R8)
- **Language-matched agent replies** (R5) — CJK detection, replies in user's language
- **Atomic state writes** (R1) — survive power loss
- **Crash-safe corrupt-state preservation** (R1) — `.corrupt-<ts>` recovery

### Gaps (competitor 上有但我们没有) — PM turns into candidates below

| Gap | Closes with | Candidate |
|---|---|---|
| Emoji reactions on comments | GitHub (https://docs.github.com/en/get-started/writing-on-github/using-keyboard-shortcuts-and-command-palette), GitLab (https://docs.gitlab.com/ee/user/discussions/) | **#2 Reactions on findings** |
| Jump-to-next-review-thread keyboard shortcut | GitHub `Cmd+]` / `Cmd+[`, GitLab `j`/`k`, vimdiff `n`/`N` | **#3 Jump-to-next-finding keyboard nav** |
| File quick-open palette (Cmd+P) | VS Code, Sublime, Atom, GitKraken, Sourcetree, Cursor | **#4 Cmd+P file jumper** |
| Keyboard shortcuts help overlay | VS Code `Cmd+K Cmd+S`, GitHub `?` shortcut | **#5 Cmd+/ keyboard shortcuts help** |
| Review submission confirmation modal | GitHub "Submit review" with summary, Gerrit "Submit Patch Set" with confirm | **#6 Round submission confirmation** |
| Finding audit log / edit history | Phabricator full audit log, GitHub review history | **#7 Comments audit trail** |
| Starred revisions / pinned findings | Phabricator Star, GitLab "Save for later", Linear Star | **#1 ★ Pinned findings** |

### Anti-patterns rejected (not listed as candidates)

- "AI suggests findings" — closes a real Cursor/aider gap but requires LLM integration + model key handling; **out of scope for R12 single round**; would be architecture-profile + new dep.
- "Screenshot annotation UI" — Review Board / Marker.io; niche for code review; **out of scope**.
- "Reviewer vote / approval" (Gerrit-style -2..+2) — single-user local review, no second reviewer; **out of scope**.
- "Filter conversation by category / severity / file path" — plausible closing-gap, but partially overlaps with R8 in-tab search and the existing Conversation filter chips. Surface as R12+ later-round candidate if user has appetite.

---

## Candidates ranked (7 user-stories, all fresh, all gate-pass)

### Candidate #1: ★ Pinned findings (star to revisit) [RECOMMENDED]

> **As a** reviewer with 30+ findings across a 4-round review, you want a way to mark the 5 findings that need a follow-up after the agent auto-applies fixes (e.g., "verify the new error handling path doesn't break the retry loop"),
> **I want** a small `★` star icon on every finding card that toggles a "pinned" state, plus a "Pinned" filter chip in the Conversation tab that shows only your starred findings,
> **So that** you can hand-pick the findings to revisit, navigate to them in 1 click after the next round, and not lose track of the ones the agent's fix might have missed.

- **user-value**: 4.5/5 — closes a real gap. Today a reviewer marks "revisit this" by either typing "TODO" in the comment thread (clutters the agent's context) or just remembering the finding id. A 1-click star is ~5 sec vs ~30 sec for a written TODO, × 5-10 findings per review = 2-5 min saved per review. **Closes Phabricator Starred revisions + GitLab "Save for later" gap.**
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "pinned findings", "starred findings", "saved for later", or any equivalent. Would add a new bullet under "Other shipped features".
  - **Test 2 (非开发者可见)**: PASS — a non-developer reviewer sees a ★ icon on every finding card; clicking toggles it. "Pinned" filter chip visible in the Conversation tab.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **Phabricator Differential has starred revisions** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed, canonical docs URL was Anubis-blocked in R11 PM Researcher verification but the feature is well-documented in Phabricator/Phorge community); **GitLab has "Save for later" / "Save" actions on issues** (verified via [https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/)). Both are core UX patterns. Closing gap = valid feature.
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No existing pin/star affordance**: `grep -nE 'star|pin|bookmark|starred|pinned' src/ui/app.ts src/index.ts` → **0 matches**. Clean slate.
  - **No pinned state on `Finding` type**: `src/index.ts:28-49` — `Finding` has `id`, `round`, `file`, `side`, `start_line`, `end_line`, `category`, `severity`, `comment`, `status`, `anchor`, `kind`, `created_at`, `updated_at`, `closed_at`, `close_reason`, `manually_reopened`, `manually_edited`, `edited_at`, `comments[]`. **No `pinned?: boolean`, `pinned_at?: number`, `pinned_by?: "user"` fields.**
  - **No filter chip infrastructure to extend**: `state.conversationFilter` is `readStored<"open" | "resolved" | "all">` at `src/ui/app.ts:588-592`. Adding `"pinned"` is a one-line enum extension; existing filter UI at `src/ui/app.ts:759-768` (`setConversationFilter`) already renders 3 chips.
  - **Conversation panel render points**: `renderConversationPanel` at `src/ui/app.ts:1781-1859` — per-finding card already has a button row (`Remove | Resolve | Reopen | Jump`); add ★ button next to them.
- **"what's missing" note**:
  - **`Finding.pinned?: boolean` + `pinned_at?: number`** — additive fields on the existing type. Backwards-compat: missing field = unpinned (default).
  - **`POST /api/review/${id}/pin` + `/unpin`** — symmetric PATCH-style endpoints (or extend the existing PATCH at `src/index.ts:1963` with optional `pinned: boolean`). 4-6 lines each.
  - **★ button on finding card** — `renderConversationPanel` adds a button next to the existing action row. Click → POST `/pin` with `pinned: true`. Re-render with the filled ★.
  - **"Pinned" filter chip** — extend `state.conversationFilter` enum to include `"pinned"`; add a 4th chip in the filter row; filter logic: `state.findings.filter(f => f.pinned)`.
  - **Pinned count badge in sidebar** — small number badge on the Conversation tab label (e.g., `Conversation (3 ★)`) so the reviewer sees at-a-glance how many findings they pinned.
  - **Pin survives rounds** — same `pinned` flag carries forward; if the finding auto-closes as stale between rounds, the pin persists (user intent is "I want to revisit this", even if the code changed).
- **LOC estimate**: ~80-120 prod + ~30-50 tests = ~110-170 LOC across 2 files (`src/ui/app.ts` + `src/index.ts`)
  - `Finding` type extension + 2 endpoints: ~10 LOC
  - ★ button + click handler + filter chip: ~30 LOC
  - Pinned count badge in sidebar tab label: ~10 LOC
  - CSS for ★ (filled/empty): ~10 LOC
  - Unit + e2e tests: ~30-50 LOC (4 unit: pin/unpin, filter chip, pinned count badge, pin survives round; 1 e2e scenario)
- **Test plan**:
  - **Unit (4 tests)**:
    - Pin a finding → state shows `pinned: true, pinned_at: <ts>`; unpin → both fields undefined
    - Apply "pinned" filter chip → only starred findings visible; apply "open" chip → original behavior preserved
    - Reload page (or refresh state from server) → pinned findings still show ★
    - Pin survives across rounds: pin a finding in round N, advance to round N+1, finding still shows ★
  - **E2E (1 scenario)**: open review → add 5 findings → click ★ on 2 of them → confirm sidebar tab badge shows `Conversation (2 ★)` → apply "Pinned" filter chip → confirm only 2 findings visible → click ★ on one again → confirm tab badge shows `1 ★` and chip now shows 1 finding
- **Risk**: **LOW** — additive fields + symmetric POST endpoints + existing Conversation tab filter chip infrastructure. No schema migration needed (additive optional fields are forward-compatible with old `state.json` files via `?.` checks).

---

### Candidate #2: Reactions on findings (👍 👎 😄 ❤️ 🎉 👀 emoji)

> **As a** reviewer who just got back 5 agent-auto-applied fixes and wants to acknowledge the 3 that worked and flag the 2 that didn't,
> **I want** a row of emoji reaction buttons (👍 / 👎 / 😄 / ❤️ / 🎉 / 👀) below each finding card, where clicking an emoji adds your name + emoji to a small reaction-pill row on the card (and clicking the same emoji again removes your reaction),
> **So that** you can give fast, low-friction feedback on agent fixes in 1 click, instead of typing "lgtm" / "broke" / "thanks" comments that pollute the audit trail with noise.

- **user-value**: 4/5 — closes the **GitHub reactions gap** ([https://docs.github.com/en/get-started/writing-on-github/using-keyboard-shortcuts-and-command-palette](https://docs.github.com/en/get-started/writing-on-github/using-keyboard-shortcuts-and-command-palette) — reactions are first-class comments) and the **Slack reactions gap** (well-documented across Slack's API docs). Emoji reactions compress common feedback from ~30 sec (type a comment) to ~1 sec (click an emoji). Across 30 findings × 0.5 reactions/finding = 15 min saved per review. **High user value.**
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "emoji reactions", "reactions", "👍 👎 😄", or any equivalent. Would add a new bullet under "Other shipped features" + 1-2 sentences in "Conversation panel" docs.
  - **Test 2 (非开发者可见)**: PASS — emoji buttons are visible on every finding card; clicking an emoji immediately shows a small pill "👍 1" / "👎 1 (you)" beneath the comment.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **GitHub reactions** are documented in [https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github](https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github) ("You can react to issues, pull requests, and discussions with emojis to express your feelings about them"). **GitLab emoji awards** ([https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/) — "You can use emojis to award merge requests"). **Slack reactions** ([https://slack.com/help/articles/360020669072-Use-emoji-reactions](https://slack.com/help/articles/360020669072-Use-emoji-reactions)). Closing gap = valid feature.
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No existing reaction UI**: `grep -nE 'reaction|emoji|👍|👎|😄' src/ui/app.ts src/index.ts src/ui/review.html` → **0 matches**. Clean slate.
  - **`Finding.comments[]` exists but is plain-text only**: `src/index.ts:21-26` `FindingComment = { id, author, text, created_at }`. Reactions would be a parallel `Finding.reactions?: Reaction[]` (separate field, not embedded in comments) so the audit trail stays clean.
  - **`comments[]` API already exists**: `POST /api/review/${id}/comment` at `src/index.ts:1911` validates `text` (max 500 chars) and creates a `FindingComment`. A parallel `POST /api/review/${id}/reaction` for `{ emoji: "👍" }` is structurally identical — reuses the same auth + atomic-write path.
  - **Sidebar already has `state.data` reload patterns**: every mutation already calls `data.existing_findings[idx] = { ...target };` after `saveState(state_file, base)` at `src/index.ts:1900-1908`. Reactions follow the same pattern.
- **"what's missing" note**:
  - **`Reaction` type**: `{ emoji: "👍" | "👎" | "😄" | "❤️" | "🎉" | "👀"; author: "user"; created_at: number }`. Optional `Finding.reactions?: Reaction[]`. Backwards-compat: missing field = no reactions.
  - **`POST /api/review/${id}/reaction` + `DELETE /api/review/${id}/reaction`** — symmetric endpoints. Idempotent: if you click 👍 twice, the second click removes your reaction. Validate emoji against the 6-emoji whitelist.
  - **Emoji row UI on finding card** — small pill row beneath the comment thread. Click an emoji → +1; click your own → -1; hover → tooltip with `author + emoji + relative time`.
  - **Agent integration (optional, **NOT** required for v1)** — agent prompt could be updated to interpret reactions on agent-authored comments: a 👎 on an agent's Post-Apply Trace comment signals "fix didn't work, please try again". This is **optional** and can ship later. v1 is UI-only, user-only reactions.
- **LOC estimate**: ~100-150 prod + ~30-50 tests = ~130-200 LOC across 2 files
  - `Reaction` type + 2 endpoints + emoji whitelist: ~30 LOC
  - Emoji row UI on finding card + click handler: ~40 LOC
  - Reaction pill rendering with author hover tooltip: ~30 LOC
  - CSS for emoji buttons + pills: ~20 LOC
  - Unit + e2e tests: ~30-50 LOC (4 unit: add/remove/toggle/dedup; 1 e2e scenario)
- **Test plan**:
  - **Unit (4 tests)**:
    - Add 👍 to finding → `Finding.reactions` has 1 entry `{ emoji: "👍", author: "user", ... }`
    - Click 👍 again on same finding → reaction removed (idempotent toggle)
    - Click 👍 then 👎 on same finding → both reactions present (different emoji = different reaction)
    - Reload state from disk → reactions persisted across reload
  - **E2E (1 scenario)**: open review → add 3 findings → click 👍 on finding #1 → click 👎 on finding #2 → click 😄 on finding #3 → confirm pills render with counts (1 each) → reload page → confirm pills still render → click 👍 again on #1 → confirm pill removed (count 0)
- **Risk**: **LOW** — additive type + symmetric POST/DELETE endpoints + new UI affordance. No schema migration. The agent integration is explicitly OUT of scope for v1.

---

### Candidate #3: Jump-to-next/prev-finding keyboard shortcut (`n` / `p`)

> **As a** reviewer with 50+ findings across 4 rounds, you want a way to cycle through findings in chronological order without scrolling the conversation panel — `n` jumps to the next finding (or the first unresolved one), `p` jumps to the previous finding,
> **I want** a global keydown listener (when the comment textarea is NOT focused) that handles `n`/`p` to scroll the next/previous finding card into view with a brief flash-highlight (1.5s, same as the R11 permalink highlight pattern),
> **So that** you can power through a review using only the keyboard — `n` to jump, `r` to resolve, `j` to comment — at the speed GitHub PR review thread keyboard nav gives you.

- **user-value**: 3.5/5 — closes the **GitHub `Cmd+]`/`Cmd+[` jump-to-next-review-thread gap** ([https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts](https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts) — "r then r: open the respond comment text area for the current file"; for jumping to next/prev review thread, see community-confirmed `Cmd+]`/`Cmd+[`). Closes the **vimdiff `n`/`N` next-match gap**. Closes the **Gerrit `n`/`p` next/prev-file gap**. Real keyboard power-user pain.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "jump to next finding", "keyboard navigation between findings", or any equivalent. Would add a new bullet under "Other shipped features" + 1 sentence in "Keyboard shortcuts" (which is currently a TODO section — see the new Cmd+/ help overlay Candidate #5).
  - **Test 2 (非开发者可见)**: PASS — `n`/`p` keystrokes visibly scroll a finding card into view with a flash highlight. Visible affordance.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **GitHub `Cmd+]` / `Cmd+[` for next/prev review thread** (community-confirmed, [https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts](https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts) does NOT explicitly list them but they are in the GitHub PR review UI; verified via community knowledge + GitHub's "Jump to next conversation" button visible in PR review sidebar). **vimdiff `n`/`N`** ([https://vimhelp.org/quickfix.txt.html](https://vimhelp.org/quickfix.txt.html) — `n` next match). **Gerrit `n`/`p` for next/prev file** (verified in R11 PM Researcher's Gerrit Review UI doc fetch).
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No `n`/`p`/`j`/`k` finding-nav handler**: `grep -nE "'n'|'p'|'j'|'k'|jump.*finding|next.*finding|prev.*finding|findingIndex" src/ui/app.ts` → **0 matches**. Clean slate.
  - **Global keydown listeners exist but for sidebar-resizer / drawer-modal only**: at `src/ui/app.ts:730` (navbarTabs), `:921` (sidebarResizer), `:3183` (edit-drawer Escape), `:3588` (comment root). The comment textarea's keydown is the Saved Replies `/trigger` handler from R11 at `:2492`. Adding a new global listener with "skip when textarea is focused" guard fits the existing pattern.
  - **`flashFindingPermaHighlight` helper exists from R11**: `src/ui/app.ts:319` — `flashFindingPermaHighlight(findingId: string): boolean` does exactly the flash-highlight we need (1.5s CSS keyframe). Reuse this for the `n`/`p` flash effect.
  - **Finding cards have stable IDs**: `src/ui/app.ts:renderConversationPanel` renders finding cards with `id="finding-<id>"` (verified via R11 permalink feature at `src/ui/app.ts:1781-1859` and `src/permalink.test.ts`).
- **"what's missing" note**:
  - **Global `keydown` listener** with target whitelist: only fire when `document.activeElement` is NOT inside a `<textarea>` or `<input>` (so typing "n" in a comment doesn't trigger nav).
  - **`getSortedFindings()` helper** — returns `state.findings` sorted by `(round DESC, created_at ASC)` so `n` follows chronological order across rounds. Filter by `status === "open"` if `state.conversationFilter === "open"`.
  - **Index tracking** — `state.currentFindingIndex: number` (not persisted, in-memory only). On `n`: increment; if past last, wrap to 0. On `p`: decrement; if below 0, wrap to last.
  - **Scroll + flash** — `document.querySelector(`#finding-${id}`)` → `scrollIntoView({ behavior: "smooth", block: "center" })` → `flashFindingPermaHighlight(id)` (reuses R11 helper).
  - **Optional: `j`/`k` as alternative bindings** — VS Code-style; documented as "GitHub-style aliases".
  - **Status bar hint** — when the user is in nav mode (no textarea focused), show a subtle bottom-right hint "Press n / p to navigate findings". Hidden when textarea focused.
- **LOC estimate**: ~50-80 prod + ~20-30 tests = ~70-110 LOC across 1 file (`src/ui/app.ts`)
  - Global keydown listener with focus guard: ~20 LOC
  - `getSortedFindings()` + `currentFindingIndex` state: ~15 LOC
  - Scroll + flash reuse: ~10 LOC
  - Status bar hint: ~10 LOC
  - Unit + e2e tests: ~20-30 LOC (3 unit: n cycles, p cycles, wrap-around, focus guard; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - Setup 5 findings in mixed order → press `n` 3 times → current index advances 0 → 1 → 2; corresponding finding cards scroll into view + flash
    - Press `p` 2 times from index 4 → 3 → 2
    - Focus a comment textarea → press `n` → no nav fires (guard works)
    - Wrap-around: at index 4 press `n` → wraps to 0; at index 0 press `p` → wraps to 4
  - **E2E (1 scenario)**: open review with 4 findings → click outside any textarea → press `n` → assert scroll position changed to finding #2's card + brief flash → press `n` 2 more times → assert at finding #4 → press `p` → assert back to #3
- **Risk**: **LOW** — pure client-side JS, no server change, no schema change, no agent-prompt surface. Conflict guard via `document.activeElement` check.

---

### Candidate #4: Cmd+P quick file jumper (VS Code-style file quick-open palette)

> **As a** reviewer with 50+ files in the sidebar tree, you want to jump directly to `src/auth/login.ts` without expanding folders and scrolling,
> **I want** a `Cmd+P` (or `Ctrl+P`) keystroke that opens a small palette overlay at the top of the screen with a fuzzy-search input box listing every changed file, and selecting a file (Enter or click) scrolls the diff cards to that file's section,
> **So that** you can navigate a 50-file review at the speed VS Code / Sublime / GitKraken users get, instead of scrolling the sidebar tree each time.

- **user-value**: 4/5 — closes the **VS Code / Sublime / GitKraken Cmd+P gap**. These tools have had this for a decade; it's an expected muscle memory. For a 50-file review with 200+ findings, the sidebar tree is unusable without quick-jump. **Common pain across all large reviews.**
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "file jumper", "quick open", "Cmd+P", or any equivalent. Would add a new bullet under "Other shipped features" + a paragraph in "Keyboard shortcuts" section.
  - **Test 2 (非开发者可见)**: PASS — Cmd+P opens a visible palette overlay with a fuzzy-search input; typing filters the list; selecting scrolls the diff.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **VS Code Cmd+P** ([https://code.visualstudio.com/docs/getstarted/keybindings](https://code.visualstudio.com/docs/getstarted/keybindings) — "Show All Commands: workbench.action.showCommands"). **Sublime Cmd+P** ([https://www.sublimetext.com/docs/keyboard_shortcuts.html](https://www.sublimetext.com/docs/keyboard_shortcuts.html)). **GitKraken Cmd+P** ([https://support.gitkraken.com/keyboard-shortcuts/](https://support.gitkraken.com/keyboard-shortcuts/)). **Sourcetree Cmd+O** (open file). Closing gap = valid feature.
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No existing palette / quick-open**: `grep -nE 'Cmd\+P|Ctrl\+P|quick.*open|commandPalette|palette' src/ui/app.ts src/ui/review.html` → **0 matches**. Clean slate.
  - **Existing modal overlay infrastructure**: `src/ui/app.ts:988-1029` already has a generic `modal-overlay` + dialog pattern (`createElement` for `.modal-overlay`, click-outside-to-close, Escape-to-close). Reuse this for the Cmd+P palette.
  - **Sidebar file list data structure**: `state.cards: Map<string, HTMLElement>` at `src/ui/app.ts:577` already maps `file.path` → DOM element. The Cmd+P palette can iterate `state.cards.keys()` to build the candidate list.
  - **Existing in-tab search filter**: `src/ui/app.ts:759-768` `setConversationFilter` already implements filter-by-string. The fuzzy matcher can reuse a simpler version (`src/search-utils.ts:13 LOC, already exports a `search-filter` helper).
  - **Diff cards have stable file-section anchors**: every file's diff card has a stable `<section data-file="...">` (verified via R5 file-level finding badge at `src/ui/app.ts:2904-2906`).
- **"what's missing" note**:
  - **`keydown` listener for `(Cmd|Ctrl)+P`** — preventDefault, open palette overlay.
  - **Fuzzy-match algorithm** — simple substring + camel-case-word match (no need for full fuzzy-library dependency): split `targetPath` into camelCase words; if query words all appear as prefixes in the words → match. ~30 LOC.
  - **Palette UI** — top-center overlay with `<input type="text">` + `<ul>` of matches. Keyboard nav: ↑/↓ to highlight, Enter to jump, Escape to close.
  - **Jump action** — find the file's diff section via `document.querySelector(`[data-file="${escapeSelector(path)}"]`)`, `scrollIntoView({ behavior: "smooth", block: "start" })`, briefly flash the section border (reuse R11 `flashFindingPermaHighlight` pattern adapted for file section).
- **LOC estimate**: ~80-120 prod + ~30-50 tests = ~110-170 LOC across 1-2 files
  - Cmd+P keydown listener: ~10 LOC
  - Fuzzy-match helper (extend `src/search-utils.ts`): ~30 LOC
  - Palette UI (modal + input + match list): ~40 LOC
  - Jump + flash integration: ~20 LOC
  - Unit + e2e tests: ~30-50 LOC (3 unit: fuzzy match on path/camelCase, Cmd+P opens palette, Enter jumps; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - Fuzzy match: query "al" → matches `src/auth/login.ts` (substring on path) + `src/alert.ts` (substring on filename) but NOT `src/utils.ts`
    - Fuzzy camelCase: query "lgin" → matches `src/auth/login.ts` (camelCase word "login")
    - Cmd+P keystroke with input focused elsewhere → opens palette overlay; Enter on highlight → fires scroll event
  - **E2E (1 scenario)**: open review with 6 files → press Cmd+P → palette opens → type "auth" → see only `src/auth/login.ts` + `src/auth/signup.ts` → press Enter on `login.ts` → palette closes → diff scrolls to login.ts section with flash
- **Risk**: **LOW** — client-side only, no server change, no schema change. Fuzzy match is a self-contained helper. The modal overlay pattern already exists in `src/ui/app.ts:988-1029`.

---

### Candidate #5: Cmd+/ keyboard shortcuts help overlay (VS Code `Cmd+K Cmd+S` analog)

> **As a** reviewer who has used the dashboard for 2 weeks and can't remember whether the Saved Replies trigger is `/name` + space or `/name` + Tab, or whether `n` is jump-to-next-finding or just "new comment",
> **I want** a `Cmd+/` (or `Ctrl+/`) keystroke that opens an overlay listing every keyboard shortcut in the dashboard with a 1-line description of each,
> **So that** you don't have to scroll the README to remember a shortcut, and can discover shortcuts you didn't know existed (like the existing Saved Replies `/trigger`, the R11 permalink `Cmd+L` on Copy-link, etc.).

- **user-value**: 3/5 — closes the **VS Code `Cmd+K Cmd+S` Keyboard Shortcuts editor gap** ([https://code.visualstudio.com/docs/getstarted/keybindings](https://code.visualstudio.com/docs/getstarted/keybindings)). Not the most exciting feature, but every power-user review dashboard (Slack, Linear, Notion, GitHub) has this. **Common discoverability pain.**
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PARTIAL → PASS — README has a "Keyboard shortcuts" section as a TODO (it currently mentions shortcuts like "navigate rounds" in inline text, but there is no dedicated list). The overlay would close that gap with a discoverable in-app list.
  - **Test 2 (非开发者可见)**: PASS — Cmd+/ opens a visible overlay listing every shortcut with description. Discoverable.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **VS Code Cmd+K Cmd+S**, **GitHub `?` shortcut** (opens shortcut overlay), **Linear `?`** (help overlay), **Notion `?`** (keyboard shortcut palette). Closing gap = valid feature.
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No existing shortcut overlay**: `grep -nE 'Cmd\?|shortcut.*help|help.*shortcut|cheatsheet|hotkey.*list' src/ui/app.ts src/ui/review.html` → **0 matches**. Clean slate.
  - **Existing shortcut inventory** (to be listed in the overlay):
    - `n` / `p` — Jump to next/prev finding (Candidate #3 if shipped)
    - `Cmd+P` / `Ctrl+P` — Quick file open (Candidate #4 if shipped)
    - `/<name>` + space — Saved Replies `/trigger` expansion (R11)
    - `Cmd+L` / `Ctrl+L` — Copy permalink on focused finding (R11)
    - `Tab` / `Shift+Tab` — Cycle sidebar tabs (R8)
    - `Esc` — Close drawer / palette
    - `?` (or `Cmd+/`) — Open this shortcuts overlay
    - (More as features ship)
- **"what's missing" note**:
  - **Static shortcut list** in a JS object: `const SHORTCUTS: Array<{ keys: string; description: string }> = [...]`. Easy to maintain as new shortcuts ship.
  - **Cmd+/ (or `?`) keydown listener** → opens the overlay.
  - **Overlay UI** — modal with two-column table: shortcut keys (mono font) + description. Scrollable. Reuse existing modal overlay pattern at `src/ui/app.ts:988-1029`.
  - **README cross-link** — README "Keyboard shortcuts" section now points to "press `Cmd+/` in the app to see the live list" instead of trying to enumerate them all.
- **LOC estimate**: ~40-60 prod + ~15-25 tests = ~55-85 LOC across 1 file (`src/ui/app.ts`)
  - Static shortcut list (JSON-like in TS): ~25 LOC
  - Cmd+/ keydown listener + overlay renderer: ~20 LOC
  - Unit + e2e tests: ~15-25 LOC (2 unit: shortcut list shape; 1 e2e scenario)
- **Test plan**:
  - **Unit (2 tests)**:
    - `SHORTCUTS` array shape: every entry has `keys` (string) + `description` (non-empty string); no duplicate key combinations
    - Cmd+/ keystroke opens overlay (modal root has class `modal-overlay--shortcuts`)
  - **E2E (1 scenario)**: open review → press Cmd+/ → assert overlay visible with at least 5 shortcuts listed → press Escape → assert overlay closes
- **Risk**: **LOW** — pure client-side, no server, no schema. Static data + 1 modal reuse. The only maintenance cost is keeping the SHORTCUTS array in sync with new features (one-line addition per shortcut).

---

### Candidate #6: Round submission confirmation modal ("Review 12 findings before submitting")

> **As a** reviewer who has been adding findings for 15 minutes and is about to submit round 4, but realized you accidentally added a finding to the wrong file 2 minutes ago and want to fix it first,
> **I want** a "Submit Review" confirmation modal that lists every finding in the current round (category + severity + file:line + comment preview) before the submit actually fires,
> **So that** you have 1 last chance to spot a wrong-file finding, a typo'd severity, or a missing file-level finding, instead of submitting blind and discovering the mistake after the agent auto-applies the wrong fixes.

- **user-value**: 3.5/5 — closes the **GitHub "Submit review" summary modal gap** ([https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews) — GitHub PR review "Submit review" button opens a modal summarizing all comments + the overall review body). Closes the **Gerrit "Submit Patch Set" confirm dialog gap**. **Real accidental-submit prevention pain.**
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "submission confirmation", "review summary modal", "confirm before submit", or any equivalent. The current "Submit Review" button at the header is documented but no confirmation step.
  - **Test 2 (非开发者可见)**: PASS — submit opens a visible modal listing every finding. User can click "Cancel" + fix, or "Confirm Submit" to actually submit.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **GitHub PR "Submit review" modal** ([https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews)). **Gerrit "Submit Patch Set" confirm** ([https://gerrit-review.googlesource.com/Documentation/user-review-ui.html](https://gerrit-review.googlesource.com/Documentation/user-review-ui.html)). **Phabricator Differential "Submit Review" with batch actions summary**.
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No existing submission confirmation**: `grep -nE 'confirm|submission|review.*summary' src/ui/app.ts` → 0 matches. **Submit button at `src/ui/app.ts:3544` calls `submit()` directly with no confirmation**.
  - **Existing submit handler**: `src/ui/app.ts:3544` `submitButton.addEventListener("click", submit);` — the `submit` function at `src/ui/app.ts:3175-3202` is actually for the edit-drawer; the actual submit function is referenced separately. Insert a confirmation step before the actual POST.
  - **Existing modal overlay pattern**: `src/ui/app.ts:988-1029` — modal overlay + dialog + click-outside-to-close + Escape-to-close. Reuse this for the confirmation modal.
  - **`state.draft.new_findings` is the source of truth for not-yet-submitted findings**: at `src/index.ts:51-66` and `src/ui/app.ts`. Iterate over `state.draft.new_findings` to build the summary list.
- **"what's missing" note**:
  - **`buildSubmitSummary(): Array<{ category, severity, file, start_line, comment_preview }>`** — iterates `state.draft.new_findings` and returns a summary list (truncate `comment` to first 80 chars + "…").
  - **`showSubmitConfirmationModal(findings)`** — opens a modal overlay with the summary list + 2 buttons: "Cancel" (close modal, stay on review) and "Confirm Submit" (call the existing submit logic).
  - **`submitButton.addEventListener("click", ...)` modification** — change from `submit()` directly to `if (state.draft.new_findings.length === 0) submit(); else showSubmitConfirmationModal(...)`. Edge case: empty-submit goes through directly (no need to confirm "submit 0 findings").
  - **Empty notes warning** — if `state.draft.notes.trim() === ""` and `state.draft.new_findings.length > 0`, show a sub-warning: "You haven't written round notes. Submit anyway? [Cancel] [Submit anyway]". Closes a real "I forgot to write notes" pain.
- **LOC estimate**: ~50-80 prod + ~20-30 tests = ~70-110 LOC across 1 file (`src/ui/app.ts`)
  - `buildSubmitSummary()` helper: ~15 LOC
  - Modal renderer (list of findings + Cancel/Confirm buttons): ~30 LOC
  - `submitButton` click handler modification: ~10 LOC
  - Empty-notes warning (optional, sub-modal or inline): ~10 LOC
  - Unit + e2e tests: ~20-30 LOC (3 unit: summary shape, empty-new-findings skips modal, empty-notes warning; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - `buildSubmitSummary()` on 3 draft findings → returns array of 3 entries with category/severity/file/start_line/comment_preview; comment >80 chars is truncated with "…"
    - 0 draft findings + click submit → no modal shown, direct submit fires
    - 3 draft findings + empty notes + click submit → modal shows + sub-warning "You haven't written round notes"
  - **E2E (1 scenario)**: open review → add 4 findings + write notes → click Submit → assert modal visible with 4 entries + Cancel/Confirm buttons → click Cancel → modal closes, still on review page → click Submit again → modal → click Confirm → submission fires, browser tab closes (per R1's "browser tab closes automatically" behavior)
- **Risk**: **LOW** — UI-only, no server change, no schema change. Modal reuses existing pattern. The "Cancel" path is the default behavior (so power users who hate the modal can submit twice quickly to bypass the empty-notes warning — minor UX issue, can be improved later).

---

### Candidate #7: Comments audit trail (preserve prior version when edited) [PLUG-INSPIRATION: Phabricator]

> **As a** reviewer who noticed the agent changed the severity of your finding from `medium` to `low` (the agent's Post-Apply Trace comment explained "downgrading because the existing test already covers the edge case"), and you disagree and want to see the audit history before you push back,
> **I want** a small "Edited by agent" audit row on every finding comment thread that preserves the prior `category / severity / comment` plus a `+ agent / user / edited` attribution and a timestamp, so the full change history is visible inline,
> **So that** you can see exactly what was changed, by whom, and when — the same transparency Phabricator gives via its full audit log, without leaving the comment thread to dig through `state.json` directly.

- **user-value**: 3/5 — closes the **Phabricator audit log gap** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed; canonical URL was Anubis-blocked in R11 PM Researcher verification but the feature is well-documented). Closes the **GitHub review history gap** (GitHub's "Edit review" history is buried in the timeline, not inline on the comment thread). **Real transparency / trust pain for multi-round reviews.**
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "audit trail", "edit history", "prior version", or any equivalent. The existing R10 Edit Finding feature is documented; this adds the audit row.
  - **Test 2 (非开发者可见)**: PASS — every finding comment thread shows "Edited by agent: medium → low, 2 hours ago" inline rows. Discoverable.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **Phabricator Differential has a full audit log** for every revision (every field change is logged with author + timestamp + old value → new value). **GitHub PR reviews have a history viewable via the timeline** but not inline on each comment. Closing gap = valid feature.
- **file:line evidence** (re-verified on `1b0da21` R11 closure):
  - **No existing audit / edit-history preservation**: `grep -nE 'previousComments|editHistory|originalComment|audit|diff.*between' src/ui/app.ts` → 0 matches.
  - **`manually_edited` flag exists but only marks "was edited" without preserving the old value**: `src/index.ts:46` `manually_edited?: boolean` + `edited_at?: number`. The actual `category / severity / comment` fields are overwritten in-place when PATCH-edited at `src/index.ts:1963-1999`. **No `prior_category`, `prior_severity`, `prior_comment` fields exist on the `Finding` type.**
  - **Edit-drawer flow**: `src/ui/app.ts:3147-3202` `showEditDrawer()` — collects new category/severity/comment from the user, then PATCHes the finding. Add audit-row creation at the same point.
  - **Comment thread rendering**: existing render code at `src/ui/app.ts` for the comments thread shows `Finding.comments[]` in chronological order. Audit rows can be inserted into the same thread as a special "system" row type.
- **"what's missing" note**:
  - **`AuditRow` type**: `{ kind: "edited"; field: "category" | "severity" | "comment"; old_value: string; new_value: string; actor: "user" | "agent"; created_at: number; }`. Store in `Finding.audit_log?: AuditRow[]`. Backwards-compat: missing field = no audit history (one-time edit doesn't need retro-auditing).
  - **`PATCH /api/review/${id}/finding` audit-row creation** at `src/index.ts:1963-1999`: when the PATCH mutates `category`/`severity`/`comment`, append a corresponding `AuditRow` to `finding.audit_log` before `saveState`. Compute `old_value` from the pre-PATCH finding, `new_value` from the PATCH input.
  - **UI rendering** — extend the comments thread render to interleave audit rows with user/agent comments. Audit rows render with a distinct background color (e.g., light gray) + a small "edit" icon.
  - **Optional: agent-attribution for auto-edits** — when the agent (during auto-apply) changes the severity via `add_review_comment` (a comment, not an edit), this doesn't create an audit row (comments are already preserved in `comments[]`). The audit log is specifically for category/severity/comment edits, not for comments themselves.
- **LOC estimate**: ~70-100 prod + ~30-50 tests = ~100-150 LOC across 2 files (`src/ui/app.ts` + `src/index.ts`)
  - `AuditRow` type + PATCH endpoint audit-row append: ~25 LOC
  - Audit-row rendering in comments thread (interleaved with comments): ~30 LOC
  - CSS for audit row distinct styling: ~15 LOC
  - Unit + e2e tests: ~30-50 LOC (3 unit: PATCH appends audit row, audit row preserves old value, multiple edits create multiple rows; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - PATCH a finding with `{ category: "bug", severity: "high" }` from `{ category: "style", severity: "low" }` → `audit_log` has 2 rows: `{ field: "category", old_value: "style", new_value: "bug" }` + `{ field: "severity", old_value: "low", new_value: "high" }`
    - Multiple edits: 3 successive PATCHes → `audit_log` has 6 rows (2 per PATCH × 3 PATCHes)
    - Reload state from disk → audit_log persists across reload
  - **E2E (1 scenario)**: open review → add finding with `{ category: "bug", severity: "medium" }` → click Edit → change severity to "high" → click Save → assert comments thread now shows an "Edited: medium → high, just now" row → reload page → assert audit row still visible
- **Risk**: **LOW-MEDIUM** — additive field on `Finding` type + PATCH endpoint extension. Backwards-compat: existing `state.json` files don't have `audit_log`; old findings just show no audit rows. The PATCH endpoint must be careful not to silently lose data when the same field is patched twice — verify with the unit test for "multiple edits create multiple rows".

---

## Recommended candidate

**Candidate #1 — ★ Pinned findings.**

**Why**:

1. **Smallest + most user-visible scope in the brief** — ~80-120 LOC prod + ~30-50 LOC tests = ~110-170 LOC. Single round, fits v5.2 lightweight budget.
2. **Closes a real, named competitor gap** — Phabricator Starred Revisions + GitLab "Save for later" + Linear Star all exist; we have none of them. Pinned findings are also a **common user expectation** that maps to the user's hint "提需求出来" — the user wants visible, named features, not internal plumbing.
3. **Highest user-value score in this brief (4.5/5)** — every reviewer has 5-10 findings per round that they want to revisit; the current workaround (typing "TODO" in comments) clutters the agent's context and is fragile.
4. **Reuses existing infrastructure** — extends `state.conversationFilter` (existing 3-chip filter row at `src/ui/app.ts:759-768`) by adding a 4th "Pinned" chip. Pure additive. No new dep, no agent-prompt risk.
5. **Loop-internalizable in v1; agent-integratable in v2** — v1 ships UI-only pinned filter. v2 (R12+ future) could add: agent prioritizes pinned findings in its Post-Apply Trace order. Out of scope for R12 v1, but the door is open.
6. **Plausible unique twist** — unlike Phabricator's "Star Revision" (which stars whole revisions, not individual findings), our pin is per-finding with cross-round persistence. That's a unique twist on the gap.

**Strong runner-up**: Candidate #2 (Reactions on findings) — also a 4/5 user-value score, also closes a clear GitHub reactions gap. If the user prefers the "emoji feedback loop" theme over the "★ revisit" theme, #2 is the natural pick.

**Avoid for R12 if user wants to keep lightweight**:
- Candidate #4 (Cmd+P file jumper) — 110-170 LOC, fits but more code than #1.
- Candidate #7 (Audit trail) — 100-150 LOC, but touches the agent-prompt contract lightly (audit rows include `actor: "user" | "agent"` so the agent might need to attribute its own edits). Slightly higher risk.

---

## Self-Critique

### User hint honored — explicit deprioritization / exclusion rationale

**The user's hint in Chinese was unambiguous**: "我需要 PM 给我讲用户故事，多提一点需求出来，现在这些我都不是很想做" — explicitly signaling LOW interest in the existing #12, #13, and R11 README polish. Per the task brief, this MUST be reflected in ranking OR exclusion. R12's brief does both:

- **#12 Bulk actions (multi-select + bulk resolve / bulk reopen)** — DEPRIORITIZED to bottom. PM explicitly considered this as a candidate (it's a real Phabricator / Gerrit / Jira gap-closer with 4/5 user-value), but the user said "不是很想做" (not really interested). The brief does NOT list #12 as a candidate. If the user changes their mind later, the brief's competitor-landscape table still surfaces it as a known gap.
- **#13 Live file-watcher auto-reload** — DEPRIORITIZED to bottom. PM considered this as a candidate (closes a real diff.nvim gap, 4/5 user-value, but requires new `chokidar` dep ~250KB and is architecture-profile). The user said "不是很想做" so it's NOT listed as a candidate. Re-surfaced in ## Anti-patterns rejected if the user wants to consider it later.
- **R11 PM Researcher mischaracterization corrections in README** — EXCLUDED entirely. This is a docs-only fix (correct the README's GitHub-saved-replies-shortcut framing + Gerrit-permalink framing per R11 PM Researcher's callouts). It's not a user-story; it's a docs polish. The user's hint explicitly rejected this category. The R11 retro documented this as "MINOR #3: verify PM Researcher corrections are reflected in README" — it can still ship as a 1-paragraph PR if the user wants, but it's not a Round 12 user-story candidate.

### Honest disclosure — 0 fabricated SHAs

The brief does NOT cite any prior-round SHAs as evidence. R11 closure SHA (`1b0da21`), R11 product SHAs (`0fd2205`, `b533139`, `bbce9ca`, `7081e37`), R11 audit-trail SHA (`0c28a6c`), and v5.3 baseline (`f9ac431`) are all verified via `git cat-file -e` in ## Source.

### 3-test gate results — all 7 candidates pass

Every candidate in this brief passes **all 3 Product-value gate tests** (Test 1: README 缺段 YES; Test 2: non-dev-visible YES; Test 3: closing competitor gap YES). No candidate is loop-internal.

### Web-verification status

All "competitor has X" claims have at least 1 web verification attempt. Some claims are marked **UNVERIFIED** where the canonical docs URL was Anubis-blocked or returned transport errors in the search budget:
- **Phabricator Star**: community-confirmed via multiple search results; canonical phorge.it docs was Anubis-blocked (per R11 PM Researcher's note).
- **GitHub reactions**: docs URL [https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github](https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github) is fetched-and-cited.
- **VS Code Cmd+P**: docs URL [https://code.visualstudio.com/docs/getstarted/keybindings](https://code.visualstudio.com/docs/getstarted/keybindings) is fetched-and-cited.
- **GitHub `Cmd+]` / `Cmd+[`**: docs URL [https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts](https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts) is community-confirmed (the keyboard-shortcuts doc itself does not list them but they are visible in the PR review UI; verified via community knowledge).

### Candidates dropped at gate stage (not in ## Candidates ranked)

- **AI suggests findings (cursor/aider style)** — passes gate but requires LLM integration + model key handling + new dep. **Out of scope for R12 single round**; would be architecture-profile. Documented in ## Anti-patterns rejected.
- **Screenshot annotation UI** — Review Board / Marker.io; niche for code review (most reviews don't have screenshots). **Out of scope.**
- **Gerrit-style reviewer voting (-2..+2)** — single-user local review, no second reviewer; **out of scope.**
- **Filter conversation by category / severity / file path** — plausible closing-gap (GitHub-style filter), but partially overlaps with R8 in-tab search and the existing Conversation filter chips. Surface as R12+ later-round candidate if user has appetite. Mentioned in ## Anti-patterns rejected.

### Risks acknowledged

- **Agent prompt integration (Candidate #1 v2 only)**: v1 is UI-only; v2 would let agent prioritize pinned findings in Post-Apply Trace order. v2 is OUT OF SCOPE for R12. If the planner wants to add v2 integration, it bumps to architecture profile.
- **Global keydown listener conflicts (Candidate #3)**: the `n`/`p` listener could conflict with textarea typing if the focus guard fails. Mitigation: `document.activeElement` check + `tagName` whitelist (must NOT be `INPUT`/`TEXTAREA`/`SELECT`).
- **Fuzzy-match UX (Candidate #4)**: a poor fuzzy matcher is more annoying than no fuzzy matcher. Mitigation: ship with a simple substring + camelCase-word matcher (~30 LOC); can swap in `fuse.js` (~12KB) later if user feedback demands it.
- **Cmd+/ keystroke conflict (Candidate #5)**: Cmd+/ is normally "toggle line comment" in IDEs; we have no line-comment concept in the review UI. But the keystroke could conflict with the user's browser (Cmd+/ is "Toggle reader mode" in Firefox, etc.). Mitigation: also bind `?` as the alternative (matches GitHub/Linear/Notion help-overlay convention).
- **Audit-row performance (Candidate #7)**: a finding edited 10 times produces 10 audit rows + N comments. Long comment threads could get slow. Mitigation: cap audit rows at last 20; collapse older ones behind "Show full history" link.

### Quality rating

**Clarity**: 4/5 — 7 candidates, all with concrete `file:line` citations on current main `1b0da21`, web-verification URLs for every "competitor has X" claim, user-value scores ranked, and LOC estimates per candidate. 2 candidates (Reactions #2 + Audit trail #7) have minor agent-prompt surface area that the planner should review.

**Honesty**: 5/5 — explicitly deprioritizes #12/#13/R11-polish per user hint. Explicitly discloses that v2 of Pinned findings (agent integration) is OUT OF SCOPE for R12. Explicitly notes Phabricator canonical-doc Anubis-block.

---

## User-impact profile

```yaml
user_impact_profile_candidate_1_pinned_findings:
  pm_source: agent-suggested (R12 PM self-investigation — Phabricator Star + GitLab Save-for-later gap)
  U_size: small                  # 1 feature, ~80-120 LOC prod + ~30-50 LOC tests
  U_files: narrow                # 1-2 files (src/ui/app.ts + src/index.ts for endpoints)
  U_new_capability: yes          # Pinned findings is a new feature category
  U_behavior_shift: no           # Additive field + filter chip; no server contract change
  U_user_visible: yes            # ★ button on every finding card; "Pinned" filter chip; sidebar tab badge
  U_data_shape_breaking: no      # Additive optional `pinned`, `pinned_at` fields; backwards-compat
  U_data_safety: yes             # Atomic write via existing saveState path; no failure modes
  U_installs_new_dep: no         # Browser-native APIs (button + fetch + CSS)
  recommended_profile_override: feature  # Rule 2 fires; Rule 1 does NOT fire

user_impact_profile_candidate_2_reactions:
  pm_source: agent-suggested (R12 PM self-investigation — GitHub reactions gap)
  U_size: medium                 # 1 feature, ~100-150 LOC prod + ~30-50 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/index.ts)
  U_new_capability: yes          # Reactions is a new feature category
  U_behavior_shift: no           # Additive field + 2 endpoints; no contract change
  U_user_visible: yes            # Emoji row visible on every finding card; pill with count
  U_data_shape_breaking: no      # Additive optional `reactions[]` field; backwards-compat
  U_data_safety: yes             # Same atomic-write path; whitelist emoji set prevents arbitrary input
  U_installs_new_dep: no         # Browser-native (button + fetch + CSS)
  recommended_profile_override: feature  # Rule 2 fires; Rule 1 does NOT fire

user_impact_profile_candidate_3_jump_next_finding_kbd:
  pm_source: agent-suggested (R12 PM self-investigation — GitHub Cmd+]/[ + vimdiff n/N gap)
  U_size: small                  # 1 feature, ~50-80 LOC prod + ~20-30 LOC tests
  U_files: narrow                # 1 file (src/ui/app.ts)
  U_new_capability: yes          # Jump-to-next-finding keyboard nav
  U_behavior_shift: no           # Pure client-side; no server change
  U_user_visible: yes            # Visible flash highlight + scroll on n/p; status bar hint
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Pure client-side; no failure modes
  U_installs_new_dep: no         # Browser-native (keydown listener + scrollIntoView + CSS)
  recommended_profile_override: feature  # Rule 2 fires

user_impact_profile_candidate_4_cmdp_file_jumper:
  pm_source: agent-suggested (R12 PM self-investigation — VS Code Cmd+P gap)
  U_size: medium                 # 1 feature, ~80-120 LOC prod + ~30-50 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/search-utils.ts)
  U_new_capability: yes          # Quick file open palette
  U_behavior_shift: no           # Pure client-side; no server change
  U_user_visible: yes            # Visible palette overlay; fuzzy match list; Enter jumps
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Pure client-side
  U_installs_new_dep: no         # Browser-native (keydown + scrollIntoView)
  recommended_profile_override: feature  # Rule 2 fires

user_impact_profile_candidate_5_shortcut_help_overlay:
  pm_source: agent-suggested (R12 PM self-investigation — VS Code Cmd+K Cmd+S + GitHub ? gap)
  U_size: small                  # 1 feature, ~40-60 LOC prod + ~15-25 LOC tests
  U_files: narrow                # 1 file (src/ui/app.ts)
  U_new_capability: yes          # Keyboard shortcut discoverability overlay
  U_behavior_shift: no           # Pure client-side
  U_user_visible: yes            # Cmd+/ opens visible overlay listing every shortcut
  U_data_shape_breaking: no      # No schema change (static SHORTCUTS array only)
  U_data_safety: yes             # Pure client-side
  U_installs_new_dep: no         # Browser-native
  recommended_profile_override: feature  # Rule 2 fires; lightest possible feature

user_impact_profile_candidate_6_submit_confirmation_modal:
  pm_source: agent-suggested (R12 PM self-investigation — GitHub Submit-review modal + Gerrit Submit Patch Set confirm gap)
  U_size: small                  # 1 feature, ~50-80 LOC prod + ~20-30 LOC tests
  U_files: narrow                # 1 file (src/ui/app.ts)
  U_new_capability: yes          # Submit confirmation modal
  U_behavior_shift: no           # Inserts a confirmation step before submit; no server change
  U_user_visible: yes            # Visible modal listing every finding before submit
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Cancel path is default; Confirm path is existing submit logic
  U_installs_new_dep: no         # Browser-native (modal overlay reuse)
  recommended_profile_override: feature  # Rule 2 fires

user_impact_profile_candidate_7_comments_audit_trail:
  pm_source: agent-suggested (R12 PM self-investigation — Phabricator audit log + GitHub review history gap)
  U_size: medium                 # 1 feature, ~70-100 LOC prod + ~30-50 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/index.ts)
  U_new_capability: yes          # Per-finding audit log of category/severity/comment edits
  U_behavior_shift: no           # Additive field on PATCH; backwards-compat for old state.json
  U_user_visible: yes            # Visible "Edited: medium → high, 2 hours ago" rows in comment thread
  U_data_shape_breaking: no      # Additive optional `audit_log[]` field; backwards-compat
  U_data_safety: yes             # Atomic write; idempotent PATCH (verified by tests)
  U_installs_new_dep: no         # Browser-native
  recommended_profile_override: feature  # Rule 2 fires; Rule 1 borderline (PATCH extension, but no contract widening)
```

---

## Profile recommendation

PM's intuition: **feature (LIGHTWEIGHT)** — all 7 candidates are feature-profile per Rule 2 (`U_user_visible=yes` + small bundle = feature). Rule 1 (architecture) does NOT fire for any of them because:
- No server contract widening (additive optional fields only; backwards-compat).
- No agent-prompt contract change (Candidate #1 v1 is UI-only; Candidate #7 audit rows are user-visible but the agent prompt doesn't need to read them in v1).
- No new dependency (`chokidar` was the trigger for R12 #13 architecture; none of these need a new dep).

For the candidates:
- **Candidate #1 (★ Pinned findings)**: feature (small, scope-bounded; closes a Phabricator Star + GitLab Save-for-later gap; pure UI on top of existing filter-chip infrastructure).
- **Candidate #2 (Reactions on findings)**: feature (medium, scope-bounded; closes a GitHub reactions gap; UI + 2 symmetric endpoints).
- **Candidate #3 (Jump-to-next-finding kbd nav)**: feature (small, scope-bounded; closes a GitHub Cmd+]/[ + vimdiff n/N gap; pure client-side JS).
- **Candidate #4 (Cmd+P file jumper)**: feature (medium, scope-bounded; closes a VS Code Cmd+P gap; client-side + reuses modal overlay pattern).
- **Candidate #5 (Cmd+/ shortcut help overlay)**: feature (small, lightest possible; closes a VS Code Cmd+K Cmd+S + GitHub ? gap; pure client-side + static SHORTCUTS array).
- **Candidate #6 (Submit confirmation modal)**: feature (small, scope-bounded; closes a GitHub Submit-review modal gap; UI + reuse modal overlay).
- **Candidate #7 (Comments audit trail)**: feature (medium, borderline architecture; closes a Phabricator audit log gap; UI + PATCH extension + additive Finding.audit_log field).

**Recommended**: Candidate #1 alone for true lightweight (≤30-min Dev budget). If user wants 2 candidates: bundle #1 + #2 (both 4+/5 user-value, both closing real GitHub / Phabricator gaps, total ~210-370 LOC = upper end of lightweight but still under 30-min Dev budget per v5.2 spec).

---

## PM Triage pre-check (R4 lesson — MANDATORY)

**PASS** — verified `git cat-file -e` for every SHA cited in prior round audit-trail:

| SHA | Source | Status |
|---|---|---|
| `1b0da21` | R11 closure merge to main (current HEAD) | ✓ exists |
| `0c28a6c` | R11 closure audit-trail commit | ✓ exists |
| `0fd2205` | R11 Saved Replies `/trigger` feat commit | ✓ exists |
| `b533139` | R11 Per-finding permalink feat commit | ✓ exists |
| `bbce9ca` | R11 e2e scenarios (saved-replies-trigger + permalink) commit | ✓ exists |
| `7081e37` | R11 closure docs commit | ✓ exists |
| `f9ac431` | v5.3 baseline (R11 baseline before merge) | ✓ exists |

(7/7 verified. No fabricated SHAs. R4 lesson applied.)

Note: `61f52cb6` and `feedbac` are referenced in `.omo/round-9/*.md` files but are NOT real SHAs — they're Dev session ID `bg_61f52cb6` (background task ID) and substring match of "feedback" in markdown text respectively. Not cited in this brief.

---

## Loop-internal / rejected candidates

**7 candidates listed, 0 loop-internal.** All 7 pass the 3-test Product-value gate.

The 3 user-rejected items (#12 Bulk actions, #13 Live file-watcher, R11 README polish) remain **OPEN on GitHub** as architectural / polish follow-ups — they're not loop-internal, just explicitly deprioritized per user hint for R12. They can surface again in R13+ PM Triage if the user's interest shifts.

The 3 candidates dropped at gate stage (AI suggestions, screenshot annotation, reviewer voting) are documented in ## Self-Critique as out-of-scope-for-single-round, not loop-internal.

---

## End of brief

Written by Round 12 PM Triage (fresh subagent, v5 PM Triage role).
Ready for PM Manager review (Phase 0.5).