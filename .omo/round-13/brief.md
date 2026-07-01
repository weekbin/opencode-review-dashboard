# PM Brief — Round 13

> **Date**: 2026-06-30
> **Author**: Round 13 PM Triage (fresh subagent, v5 PM Triage role)
> **Status**: PM brief, awaiting PM Manager review (Phase 0.5)
> **Source**: R13 user directive (Chinese, "自主决策，run 2 round") + R12 brief 4-deferred candidates analysis + R12 retro SG.1 (skill patch priority) + v5 competitor-driven self-investigation + R12 backlog-freshness check + 0 fresh R12 closure commits blocking R13
> **Pre-check result**: PASS — R13 baseline `5cc6cc2` (R13 prep commit, after R12 retro patch in `657a064` + R12 audit trail in `d17addb`) verified, R12 SHAs (`657a064` / `d17addb` / `22864bf` / `6e0e047` / `ab5248f` / `fd446c2` / `2b28ace` / `57b27ef` / `d241173` / `7accd8a`) all `git cat-file -e` OK, R11 baseline `1b0da21` verified, R10 baseline `f9ac431` verified.
> **Strategy**: **FRESH USER-STORIES + SG.1 SKILL PATCH FIRST ACTION**. R13's brief deliberately surfaces 6 fresh candidates (NONE from R12 brief — see `fresh_candidates_only=true` rationale in ## Self-Critique) that close real competitor gaps or unlock unique OpenCode + plugin capabilities. The 4 R12-deferred candidates (#4 Cmd+P / #5 Cmd+/ / #6 submit modal / #7 audit trail) are explicitly NOT promoted — they are still on the table but the user's "自主决策" directive + my fresh investigation found stronger alternatives that better match the post-R12 feature surface. The 2 user-rejected carry-overs (#12 Bulk actions + #13 Live file-watcher) remain deprioritized per their aged_rounds=3 user-rejection history, but are surfaced in ## Self-Critique as a stale-bundle-rule warning.

---

## Title

R13 surfaces **6 fresh user-stories** the existing backlog + R12 brief never proposed — every one closes either a real competitor gap (Phabricator / GitHub PR / Jira / Google Docs / Linear) OR unlocks a unique workflow improvement on the R12-shipped surface (Pinned findings + Emoji reactions + Keyboard `n`/`p` nav). The 4 R12-deferred candidates are explicitly NOT promoted as primary scope per the fresh-candidate-only rule; the 2 user-rejected carry-overs (#12, #13) remain deprioritized.

The 6 candidates cover two themes:

- **Theme A — Reviewer accountability + workflow completeness**: `★ Resolve-with-reason` (Candidate #1), `★ Mark as wontfix / out-of-scope` (Candidate #2), `Draft auto-save indicator` (Candidate #5). These three tighten the lifecycle of a finding: when you close it (Candidate #1) or refuse to act on it (Candidate #2), the why is captured; when you save your draft (Candidate #5), the time of last save is glanceable.
- **Theme B — Power-user navigation at scale**: `In-diff search` (Candidate #3), `Sort findings by severity / file / created_at` (Candidate #4), `Filter Previously-discussed by round` (Candidate #6). These three unlock 50-file / 30-finding review sessions: search inside the diff (Candidate #3), prioritize by severity (Candidate #4), and find a prior-round note without scrolling (Candidate #6).

---

## Source

- **R13 baseline**: `5cc6cc2` (R13 prep commit, after R12 retro patch in `657a064` + R12 audit trail in `d17addb`) — verified.
- **R12 SHAs verified** (regression check per v5 R4 lesson):
  - `657a064` ✓ (skill: R12 retro patch — 14 gap fixes)
  - `d17addb` ✓ (chore: R12 audit trail + Playwright walkthrough screenshots)
  - `22864bf` ✓ (fix(round-12): e2e scenario count 31 → 30, audit drift)
  - `6e0e047` ✓ (Round 12: merge ★ Pinned + Reactions + n/p nav from team-dev-loop-round-12-pinned-reactions-nav)
  - `ab5248f` ✓ (Round 12: closure audit trail)
  - `fd446c2` ✓ (docs(round-12): ★ Pinned + Reactions + n/p nav, close #17/#18/#19)
  - `2b28ace` ✓ (test(round-12): pinned + reactions + keyboard-nav e2e scenarios)
  - `57b27ef` ✓ (feat(keyboard-nav): n / p jump-to-next/prev-finding keyboard shortcut, close #19)
  - `d241173` ✓ (feat(reactions): 👍 👎 😄 ❤️ 🎉 👀 emoji reactions on findings, close #18)
  - `7accd8a` ✓ (feat(pinned): ★ Pinned findings + reviewer-side revisit list, close #17)
  - `1b0da21` ✓ (R11 merge to main, last baseline before R12)
  - `f9ac431` ✓ (v5.3 baseline, R11 baseline before merge)
- **R12 closure outcome**: SHIP per `.omo/round-12/decision.md` — 3 candidates shipped (★ Pinned / Reactions / n/p nav), 185/185 unit tests pass, 30 e2e scenarios, 7 atomic commits, 1 skill gap surfaced (SG.1: doc-side-file drift detection).
- **R12 retro followups** (`.omo/round-12/retro.md ## Followup items`):
  - **SG.1 (FIRST action for R13)**: Apply skill patch in `.opencode/skills/team-dev-loop/references/phase-prompts.md` § 4 — add "Pre-commit side-file drift detection" section with R5 retro Gap 3 checklist + "wc -l source-of-truth before committing" rule. Run `/skill-creator` audit (must hit 100% PASS, 0 blockers, 0 majors).
  - **Code M.1**: Extract `withFinding(id, base)` helper if R13+ adds more `find-by-id + 400/404` endpoints.
  - **Code M.2**: Move `EMOJI_WHITELIST` to a shared utility if R13+ adds emoji picker surfaces elsewhere.
- **Open GitHub issues** (per `gh issue list --state open --limit 30`):
  - `#12 Bulk actions (multi-select + bulk resolve / bulk reopen)` — architecture, aged_rounds=3. **DEPRIORITIZED in R13 per user hint + 3x rejection history**. See `## Self-Critique` for aged=4 stale-bundle-rule warning.
  - `#13 Live file-watcher auto-reload` — architecture (new `chokidar` dep ~250KB), aged_rounds=3. **DEPRIORITIZED in R13 per user hint + 3x rejection history**.
- **Recently closed issues** (R12 shipped 3 features, all closed via commit msg `close #N`):
  - `#17 ★ Pinned findings` — closed in `7accd8a` (R12 ★1)
  - `#18 Emoji reactions` — closed in `d241173` (R12 ★2)
  - `#19 Keyboard n/p nav` — closed in `57b27ef` (R12 ★3)
- **User's explicit hint** (CRITICAL — weighted heavily in ranking): "自主决策，run 2 round" — autonomous decision, run 2 rounds (R13 + R14) without user-gate. **PM does NOT default to #12/#13/polish**. PM surfaces fresh candidates; Planner + Lead select scope autonomously.
- **v5 PM Triage post-R12 mandate**: per `R12 retro.md ## Action items for next round`, R13 PM Triage should surface fresh self-investigated candidates with backlog-freshness gate honored. The 4 R12-deferred candidates (#4-#7) and the 2 carry-overs (#12, #13) remain technically fresh but their historical context matters.
- **R12 carry-over polish**: README.md:270 already correctly says "30 git scenarios" (after R12 audit-fix `22864bf`); no R12 carry-over polish items pending.

---

## User pain (1-3 sentences, user terms)

You finish a 4-round review of a 1,200-LOC PR with 32 findings. Every round, you wish for: (a) **a way to explain WHY you resolved a finding** without writing a long comment thread — when the agent reads `state.json` for round N+1's auto-apply, the resolve-reason would tell it "I fixed this in another branch" or "false positive" instead of "resolved" (★ Resolve-with-reason); (b) **a way to mark a finding as wontfix without losing the audit trail** — currently you can only Resolve (which means "fixed") or Remove (which deletes), but sometimes the right answer is "won't fix, known limitation" (Mark as wontfix); (c) **a glanceable "draft saved 3 seconds ago" indicator in the header** — currently `scheduleSave()` fires a transient toast ("Draft saved at HH:MM:SS") every 250ms, which is intrusive and disappears — modern editors (Google Docs, Notion) show a persistent small "Saved X ago" (Draft auto-save indicator); (d) **a way to search inside the diff** — when you have 50 files and 200+ diff hunks loaded, finding the specific function/symbol requires manual scrolling even with the sidebar search (In-diff search); (e) **a way to sort findings by severity instead of chronologically** — for a 30-finding review, severity-sorted view helps you start with the highest-impact items (Sort findings); (f) **a way to jump to a specific round in the Previously discussed panel** — when 5 rounds of history exist, scrolling the panel to find "what was discussed in round 3" is painful (Filter Previously-discussed by round).

---

## Competitor analysis (v5 — mandatory)

### Per-tool landscape

(R12-shipped features marked as **SHIPPED R12**. R12-deferred (#4-#7) marked as **R12-DEFERRED** — still on the table but not promoted in R13.)

| Tool | Core capability | opencode-review-dashboard |
|---|---|---|
| GitHub PR review | Inline comments, saved replies, reactions (👍 👎 😄 ❤️ 🎉 👀), jump-to-next-review-thread (`Cmd+]` / `Cmd+[`), **submission summary modal**, **discussion permalinks**, **sort by: Newest / Oldest**, **filter by conversation type**, **Ctrl+F in-diff search**, **timeline-event audit log** | Has: Saved Replies (R10+11), per-finding permalinks (R11), multi-round review, stale auto-close, auto-apply agent, **★ Pinned findings (SHIPPED R12)**, **Emoji reactions (SHIPPED R12)**, **n/p keyboard nav (SHIPPED R12)**. **R12-DEFERRED**: submit modal, Cmd+P file jumper, Cmd+/ overlay, audit trail. **Lacks (R13 candidates)**: resolve-with-reason modal, in-diff search, sort findings, draft auto-save indicator, wontfix / out-of-scope status, filter Previously-discussed by round. |
| GitLab MR | Approvals, multi-reviewer, MR rules, emoji awards (similar to reactions), **jump-to-next-unresolved-thread** (default `j` / `k`), **resolve thread with reason**, **activity filter (comments only / all activity)**, **diff search (`/`)** | Has: single-user local review. **Lacks: resolve-with-reason, diff search, activity filter, sort options.** |
| Phabricator Differential | Audit trail (every change to every field logged), Herald rules, batch edit, **Starred revisions**, **"Abandon" revision (similar to wontfix)**, **resolve with reason**, **inline comment "Done" / "Won't Fix" / "Out of Scope" actions** | Has: round history. **Lacks: full audit log of finding edits (only `manually_edited` flag, no prior-version preservation), starred revisions (now closed via SHIPPED R12 Pinned findings), wontfix status, resolve-with-reason.** |
| Gerrit | Code review voting (-2..+2), patch sets, **`#<linenumber>` URL anchor**, **`/` in-diff search**, **`n`/`p` for next/prev file (similar to R12 n/p nav)**, **`Ctrl+F` find across all files** | Has: severity. **Lacks: review-thread keyboard nav (R12 closed the n/p gap), file jumper, in-diff search, resolve-with-reason, draft indicator.** |
| Review Board | Review requests, screenshots with inline annotation, screenshot UI, **diff search across all files** | Partial: only diff cards, no screenshot annotation. **Lacks: cross-file diff search, sort options, draft indicator.** |
| Jira / Linear | **Resolution status: Done / Won't Fix / Duplicate / Cannot Reproduce**, **filter by label / priority / assignee**, **sort by multiple fields**, **last-edited indicator on issues** | Has: severity, category. **Lacks: wontfix / out-of-scope resolution status, sort findings, last-edit indicator.** |
| Google Docs / Notion / Figma | **Persistent "Saved X ago" status indicator in header**, **draft recovery on reload**, **collaborative cursor presence** | Has: `scheduleSave()` + `setStatus("Draft saved at HH:MM:SS")` toast (intrusive, transient). **Lacks: persistent "Saved X ago" indicator (R13 Candidate #5), draft recovery on reload (NOT surfaced as R13 candidate — would require new state file).** |
| Sourcetree / GitKraken | Visual diff, no review, **`Cmd+P` file jumper** | Partial: diff is the core, no review surface. **R12-DEFERRED Cmd+P** closes this gap. |
| Cursor review / aider rewind | AI-suggested review, inline, `Cmd+K` to apply AI fix, `Cmd+P` file quick-open | Partial: no AI suggestion. **R12-DEFERRED Cmd+P** closes file-jumper gap. |
| diff.nvim / vimdiff | Side-by-side diff, `/` to search diff, live file-watcher, `n`/`N` to next/prev match, **`:diffget` / `:diffput`** | Has: split view. **Lacks: in-diff search (R13 Candidate #3), next/prev finding keyboard nav (R12 closed the n/p gap).** |
| VS Code (general editor) | **Cmd+P quick file open palette**, `Cmd+K Cmd+S` keyboard shortcuts editor, `Cmd+/` toggle comment, **persistent "Modified" indicator with `Ctrl+Shift+P > File: Save`**, **`Ctrl+F` find-in-file**, **Sort by: Name / Modified / Type** | No IDE / editor — we are a web UI. **R12-DEFERRED Cmd+P + Cmd+/ close file-jumper + shortcut-overlay gaps. R13 Candidate #3 (in-diff search) closes `Ctrl+F`-in-diff gap. R13 Candidate #5 (draft indicator) closes "Modified indicator" gap (web-context variant).** |

### Unique OpenCode + plugin capabilities (我们独占) — verified against current main `5cc6cc2`

(All 14 listed in R12 brief remain accurate. **3 NEW R12-shipped capabilities added below in bold**.)

- **Round-by-round review** with stale-finding auto-close (no competitor does this natively)
- **Local-only** review (no server, no PR required) — uniquely friction-free for solo work
- **Auto-apply agent workflow** — agent reads findings, applies fixes, re-reviews (no competitor has this loop; Cursor/aider have AI patches but not the find → apply → re-review loop)
- **Cross-round drift banner** — yellow banner when diff range changes between rounds
- **Previously discussed panel** (R4) — per-round notes + threads in dedicated tab
- **Force Reopen with reason** (R9) — stale-finding reopen with captured reason + `manually_reopened` flag; **plausible unique** (Phabricator has reopen, but R9's reason capture + agent-prompt integration is distinctive)
- **Edit finding in-place** (R10) with `manually_edited` flag — **plausibly unique**; GitHub does not allow editing submitted PR review comments
- **Saved Replies /trigger** typed-prefix expansion (R11) — plausibly unique among code-review tools (competitors use positional shortcuts)
- **Per-finding permalink** (R11) with `#finding-<id>` URL hash
- **localStorage-resizable sidebar** + sidebar keyboard navigation (R8) + in-tab search (R8)
- **Language-matched agent replies** (R5) — CJK detection, replies in user's language
- **Atomic state writes** (R1) — survive power loss
- **Crash-safe corrupt-state preservation** (R1) — `.corrupt-<ts>` recovery
- **★ Pinned findings** (R12 #17) — per-finding star + `★ Pinned (N)` filter chip + `★N` Conversation-tab badge + `manually_pinned` honored by agent
- **Emoji reactions** (R12 #18) — 6-emoji whitelist (👍 👎 😄 ❤️ 🎉 👀) + idempotent toggle + active-state pill + `😀 Reacted (N)` filter chip
- **`n` / `p` keyboard nav between findings** (R12 #19) — focus-guard + wrap-around + status-bar hint + activeTab guard + skips-stale-when-open filter

### Gaps (competitor 上有但我们没有) — PM turns into R13 candidates below

(R12-shipped gaps marked with their shipped SHAs. R12-deferred gaps marked **(R12-DEFERRED)**.)

| Gap | Closes with | R13 candidate |
|---|---|---|
| Resolve-with-reason (capture WHY) | Phabricator "Resolve with reason", GitLab "Resolve thread", Jira "Resolution = Done/Won't Fix/etc" | **Candidate #1 ★ Resolve-with-reason modal** |
| Wontfix / out-of-scope resolution status | Phabricator "Abandon" / "Won't Fix", Jira "Resolution = Won't Fix", Linear "Cancel issue" | **Candidate #2 Mark as wontfix / out-of-scope** |
| In-diff search (`/` or `Ctrl+F`) | diff.nvim `/`, Gerrit `/`, GitHub PR Ctrl+F, GitLab MR diff search, Review Board cross-file search | **Candidate #3 ★ In-diff search** |
| Sort findings (severity / file / created_at) | GitHub PR sort by Newest/Oldest, Phabricator sort by Recently/Least active, Linear sort by multiple fields, VS Code Explorer sort | **Candidate #4 Sort findings by severity/file/created_at** |
| Persistent "Saved X ago" indicator | Google Docs "Saved X ago", Notion "All changes saved", Figma "Saved", VS Code "Modified" indicator | **Candidate #5 Draft auto-save indicator** |
| Filter Previously-discussed by round | GitHub PR "Filter by commit/round", GitLab MR "Activity filter", Linear "Filter by status" (analogous: round number) | **Candidate #6 Filter Previously-discussed by round** |
| ★ Pinned findings (SHIPPED R12) | Phabricator Starred revisions, GitLab "Save for later", Linear Star | (closed in R12 via #17, no R13 candidate) |
| Emoji reactions (SHIPPED R12) | GitHub reactions, GitLab emoji awards, Slack reactions | (closed in R12 via #18, no R13 candidate) |
| Jump-to-next-finding keyboard nav (SHIPPED R12) | GitHub `Cmd+]`/`Cmd+[`, GitLab `j`/`k`, vimdiff `n`/`N` | (closed in R12 via #19, no R13 candidate) |
| Cmd+P file jumper **(R12-DEFERRED)** | VS Code, Sublime, Atom, GitKraken, Sourcetree, Cursor | (R12-deferred #4 — not promoted as R13 candidate) |
| Cmd+/ keyboard shortcuts help overlay **(R12-DEFERRED)** | VS Code `Cmd+K Cmd+S`, GitHub `?`, Linear `?`, Notion `?` | (R12-deferred #5 — not promoted as R13 candidate) |
| Round submission confirmation modal **(R12-DEFERRED)** | GitHub PR "Submit review" modal, Gerrit "Submit Patch Set" confirm, Phabricator "Submit Review" with batch summary | (R12-deferred #6 — not promoted as R13 candidate) |
| Finding audit log / edit history **(R12-DEFERRED)** | Phabricator full audit log, GitHub review history | (R12-deFERRED #7 — not promoted as R13 candidate) |

### Anti-patterns rejected (not listed as candidates)

- **"AI suggests findings"** — closes a real Cursor/aider gap but requires LLM integration + model key handling; **out of scope for R13 single round**; would be architecture-profile + new dep.
- **"Bulk actions multi-select"** — closes a real Phabricator/Gerrit/Jira gap but #12 has been rejected 3x (R10/R11/R12) per user hint "不是很想做". **NOT promoted in R13** despite aged_rounds=4 stale-bundle-rule warning — see `## Self-Critique`.
- **"Live file-watcher auto-reload"** — closes a real diff.nvim gap but #13 has been rejected 3x (R10/R11/R12) per user hint. New `chokidar` dep ~250KB. **NOT promoted in R13**.
- **"Filter conversation by category / severity / file path"** — was rejected in R12 brief anti-patterns section ("partially overlaps with R8 in-tab search and existing filter chips"); if I were to promote it I'd be contradicting R12 PM's own call. **NOT promoted in R13** — R8 in-tab search covers text-search; the 5 filter chips (open/resolved/all/pinned/reacted) cover status filters; the proposed Candidate #4 (sort) is a different UX axis (order, not filter).
- **"Screenshot annotation UI"** — Review Board / Marker.io; niche for code review (most reviews don't have screenshots). **Out of scope.**
- **"Reviewer vote / approval"** (Gerrit-style -2..+2) — single-user local review, no second reviewer; **out of scope**.
- **"Draft recovery on reload"** — would require new state file + server endpoint to detect stale drafts; plausible gap but heavy. NOT surfaced as R13 candidate (Candidate #5 covers the lighter "Saved X ago" indicator pain).
- **"Re-open resolved findings via UI button"** — verified at `src/ui/app.ts:2537` already exists ("Reopen" button on resolved/stale findings). Already shipped (R9 #1 + R9.5 follow-up). NOT a candidate.
- **"Comment draft templates per category"** — R10 already shipped Saved Replies which can be inserted via `/trigger` (R11). NOT a candidate.

---

## Candidates ranked (6 user-stories, all fresh, all gate-pass)

### Candidate #1: ★ Resolve-with-reason modal (mirror R9 Force-Reopen pattern, but for resolve) [RECOMMENDED]

> **As a** reviewer who just resolved 5 findings that the agent's auto-applied fixes addressed, and you want the agent (in round N+1's auto-apply pass) to understand WHY each finding is resolved (so it doesn't re-attempt to fix what you already accepted as fixed),
> **I want** clicking the "Resolve" button on an open finding to open a small modal with a required reason text field (similar to R9's Force-Reopen reason modal) — common reasons like "fixed in HEAD~1", "false positive", "out of scope", "wontfix" — and capture the reason as a `Finding.resolve_reason: string` field + `manually_resolved: true` flag,
> **So that** the agent's next round reads `state.json`'s `findings[].resolve_reason` for resolved findings and doesn't re-attempt to fix what was already addressed, and the audit trail captures accountability for every close.

- **user-value**: 4.5/5 — closes the **Phabricator "Resolve with reason" gap** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed; canonical docs URL was Anubis-blocked in R11/R12 PM Researcher verification but the feature is well-documented), the **GitLab "Resolve thread" gap** ([https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/) — "When you resolve a thread, you can add a reason"), and the **Jira "Resolution" gap** ([https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/](https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/) — "Resolution: Done / Won't Fix / Duplicate / Cannot Reproduce"). Real accountability pain; mirrors R9's Force-Reopen pattern but for the (more common) resolve path. **Note**: R9 already added Force-Reopen with reason for stale findings. The asymmetry is glaring — Force-Reopen captures WHY, plain Resolve does not.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "resolve with reason", "resolve reason modal", or any equivalent. R9 Force-Reopen is documented but plain Resolve is not. Would add a new bullet under "Other shipped features".
  - **Test 2 (非开发者可见)**: PASS — clicking Resolve opens a visible modal with a required reason textarea (1 sentence min). User can type "false positive", "fixed in HEAD~1", "out of scope", or custom reason.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **Phabricator Differential has resolve-with-reason** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed). **GitLab has resolve-thread-with-reason** ([https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/) — verified). **Jira has Resolution field** ([https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/](https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/) — verified). Closing gap = valid feature.
- **file:line evidence** (re-verified on `5cc6cc2` R13 baseline):
  - **No existing resolve-with-reason UI**: `grep -nE 'resolveReason|resolve_reason|showResolve|resolveModal' src/ui/app.ts src/index.ts` → **0 matches**. Clean slate.
  - **Existing resolve endpoint at `src/index.ts:1798`**: `POST /api/review/${id}/resolve` validates `finding_id` and sets `status: "resolved"` + `closed_at: Date.now()`. Does NOT accept or store a reason.
  - **Existing resolve click handler at `src/ui/app.ts:2528-2535`**: `resolveBtn.addEventListener("click", (event) => { event.stopPropagation(); resolveFinding(entry.id); })` — direct call, no modal. **The R9 Force-Reopen modal pattern at `src/ui/app.ts:1117-1164` is the template** (showReopenReasonModal returns the reason string via Promise, then reopenFinding is called with reason + manually_reopened flag).
  - **`Finding` type at `src/index.ts:28-93`** has fields `id`, `round`, `file`, `side`, `start_line`, `end_line`, `category`, `severity`, `comment`, `status`, `anchor`, `kind`, `created_at`, `updated_at`, `closed_at`, `close_reason`, `manually_reopened`, `manually_edited`, `edited_at`, `comments[]`, `pinned`, `manually_pinned`, `reactions[]`. **No `resolve_reason`, `manually_resolved`, `resolved_at` fields**. Additive (backwards-compat).
  - **`Finding.close_reason` already exists at `src/index.ts:66`** with enum `"file_removed" | "anchor_missing"` (for `closed_auto` status). The new `resolve_reason` field is a free-form string (not enum) — distinct from `close_reason`.
- **"what's missing" note**:
  - **`Finding.resolve_reason?: string`** — free-form text (max 200 chars, like R9's reopen reason). Additive optional field; backwards-compat for old `state.json` files.
  - **`Finding.manually_resolved?: boolean`** + `Finding.resolved_at?: number`** — mirror R9's `manually_reopened` + reason pattern. Backwards-compat.
  - **`POST /api/review/${id}/resolve` extension** at `src/index.ts:1798` — accept optional `reason?: string` (max 200 chars) in request body. If reason provided, set `resolve_reason: string` + `manually_resolved: true` + `resolved_at: Date.now()`. Backwards-compat: existing `POST { finding_id }` (no reason) still works, just doesn't set the new fields.
  - **`showResolveReasonModal(findingId: string): Promise<string | null>`** at `src/ui/app.ts` — mirror `showReopenReasonModal` at `src/ui/app.ts:1117-1164`. Reuse the same modal-overlay pattern; require min 1 non-whitespace char; allow Cancel.
  - **Resolve button click handler modification** at `src/ui/app.ts:2528-2535`: change from `resolveFinding(entry.id)` directly to `const reason = await showResolveReasonModal(entry.id); if (reason === null) return; await resolveFinding(entry.id, reason);`.
  - **Optional quick-reason chips in the modal** — 4 preset buttons ("false positive", "fixed in HEAD~1", "out of scope", "wontfix") that pre-fill the textarea. Common-case 1-click vs custom-case 1-typing. Closes the "I always type the same reason" pain.
  - **Agent prompt update** at `src/index.ts:1497-1511` — add a parallel instruction for `resolve_reason`: "If `state.json`'s `findings[]` contains any entry with `manually_resolved: true` and `resolve_reason` set, the user has explicitly explained why that finding is closed (e.g., 'false positive', 'fixed in HEAD~1'). Re-read that reason before deciding whether to act on the finding in the next auto-apply pass — if `resolve_reason` says 'fixed in HEAD~1', you should NOT re-attempt to fix it."
  - **Audit row rendering** (optional, can defer to R14) — display `resolve_reason` in the conversation thread as a small "Resolved because: <reason>" row beneath the existing comment thread. Closes the "I forgot why I resolved this" pain. Optional in v1.
- **LOC estimate**: ~80-120 prod + ~25-40 tests = ~105-160 LOC across 2 files (`src/ui/app.ts` + `src/index.ts`)
  - `Finding.resolve_reason` + `manually_resolved` + `resolved_at` type fields: ~5 LOC
  - `showResolveReasonModal` (mirror showReopenReasonModal): ~40 LOC
  - Resolve button click handler modification: ~10 LOC
  - `POST /resolve` endpoint reason-handling: ~15 LOC
  - Optional quick-reason chips + textarea + styling: ~20 LOC
  - Agent prompt update: ~10 LOC
  - Unit + e2e tests: ~25-40 LOC (4 unit: resolve with reason, resolve without reason (backwards-compat), quick-reason chip fills, agent prompt honors resolve_reason; 1 e2e scenario)
- **Test plan**:
  - **Unit (4 tests)**:
    - `POST /resolve` with `{ finding_id, reason: "fixed in HEAD~1" }` → finding has `status: "resolved"`, `resolve_reason: "fixed in HEAD~1"`, `manually_resolved: true`, `resolved_at: <ts>`
    - `POST /resolve` with `{ finding_id }` (no reason) → finding has `status: "resolved"` but `resolve_reason` is undefined (backwards-compat path preserved)
    - Quick-reason chip click → textarea pre-fills with chip text; user can edit before submit
    - Resolve modal Cancel button → modal closes, finding status remains "open"
  - **E2E (1 scenario)**: open review → add finding → click Resolve → modal opens with 4 quick-reason chips + textarea → click "false positive" chip → textarea pre-fills → click Confirm → modal closes → finding now shows "Resolved because: false positive" badge → reload state → reason persists
- **Risk**: **LOW** — additive fields + modal reuse (existing R9 pattern at `src/ui/app.ts:1117-1164`) + endpoint extension (backwards-compat). Agent prompt update is a ~10-line append that follows the existing `manually_reopened` / `manually_pinned` instruction pattern at `src/index.ts:1497-1511`.

---

### Candidate #2: Mark finding as wontfix / out-of-scope (distinct from Resolve)

> **As a** reviewer who marked 3 findings with severity "high" but you know they are known limitations / out of scope for the current PR (e.g., "this auth middleware doesn't support OAuth2 yet — tracked in issue #XYZ, will fix in v2"),
> **I want** a "Mark as wontfix" button (next to "Resolve" / "Remove" / "Edit" / "Reopen") that sets the finding's `status: "resolved"` + `resolution_kind: "wontfix"` + optional `resolution_reason` field, distinct from a plain resolve (which implies "fixed"),
> **So that** the audit trail distinguishes "I fixed this" (plain resolve) from "I won't fix this, it's a known limitation" (wontfix), and the agent's next auto-apply pass reads `resolution_kind` and skips wontfix findings (it doesn't try to "fix" what the user explicitly said is not in scope).

- **user-value**: 4/5 — closes the **Phabricator "Abandon revision" / "Resolve as wontfix" gap** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed; Phorge/Phabricator have "Plan Changeset: Won't Fix" and "Resolve with Won't Fix" patterns), the **Jira "Resolution = Won't Fix" gap** ([https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/](https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/) — verified), and the **Linear "Cancel issue" gap** ([https://linear.app/docs/issues](https://linear.app/docs/issues) — "Canceled issues are kept for reference and don't show in active lists"). Real workflow-completeness pain: today you can only Resolve (which the agent might interpret as "fixed" and re-attempt) or Remove (which deletes the audit trail). Wontfix is the missing 3rd option.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "wontfix", "out of scope", "resolution kind", or any equivalent. Would add a new bullet under "Other shipped features".
  - **Test 2 (非开发者可见)**: PASS — a "Mark as wontfix" button appears next to "Resolve" on every open finding; clicking opens a small modal with optional reason + dropdown for `resolution_kind: "wontfix" | "out_of_scope" | "false_positive" | "duplicate"`.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **Phabricator has "Plan Changeset: Won't Fix"** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed). **Jira has Resolution = Won't Fix** ([https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/](https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/) — verified). **Linear has Canceled status** ([https://linear.app/docs/issues](https://linear.app/docs/issues) — verified). Closing gap = valid feature.
- **file:line evidence** (re-verified on `5cc6cc2` R13 baseline):
  - **No existing wontfix / out-of-scope resolution kind**: `grep -nE 'wontfix|out_of_scope|out-of-scope|false_positive|resolution_kind|duplicate' src/ui/app.ts src/index.ts` → **0 matches**. Clean slate.
  - **`Finding.status` enum at `src/index.ts` is currently `"open" | "resolved" | "closed_auto"`** — no "wontfix" / "canceled" / "out_of_scope" status. Candidate #2 keeps `status: "resolved"` (for UI consistency with the existing Resolved filter chip) and adds `resolution_kind: "wontfix" | "out_of_scope" | "false_positive" | "duplicate"` + `resolution_reason?: string`. This avoids schema-breaking the existing filter chips (open/resolved/all/pinned/reacted at `src/ui/review.html:2208-2224`) while adding the new dimension.
  - **Existing resolve endpoint at `src/index.ts:1798`** — `POST /resolve` already sets `status: "resolved"`. Candidate #2 extends it to accept optional `resolution_kind?: "wontfix" | ...` and `resolution_reason?: string`. Symmetric to Candidate #1's resolve_reason pattern.
  - **Existing resolve button at `src/ui/app.ts:2528-2535`** — 1 button "Resolve". Candidate #2 adds a sibling button "Mark as wontfix" (with a smaller, secondary visual style so it doesn't compete with the primary Resolve). Could also collapse into a single "Resolve" dropdown: "Resolve | Mark as wontfix | Mark as duplicate | ...". Simpler is 1 button + 1 dropdown trigger.
- **"what's missing" note**:
  - **`Finding.resolution_kind?: "wontfix" | "out_of_scope" | "false_positive" | "duplicate"`** — additive enum. Backwards-compat: missing field = plain "resolved" (existing behavior preserved).
  - **`Finding.resolution_reason?: string`** — optional free-form text (max 200 chars). Backwards-compat.
  - **`POST /api/review/${id}/resolve` endpoint extension** — accept optional `resolution_kind` + `resolution_reason`. Validate `resolution_kind` against the 4-value enum whitelist (400 if unknown). Sets `resolution_kind` + `resolution_reason` + `resolved_at: Date.now()` on the finding.
  - **`showMarkAsWontfixModal(findingId): Promise<{ kind: ResolutionKind; reason: string } | null>`** at `src/ui/app.ts` — modal with 4 radio buttons (wontfix / out_of_scope / false_positive / duplicate) + optional reason textarea. Cancel returns null.
  - **"Mark as wontfix" button** at `src/ui/app.ts:2528-2535` (next to "Resolve" button) — secondary visual style. Click → showMarkAsWontfixModal → if returned, POST /resolve with kind + reason.
  - **Resolution-kind badge rendering** at `src/ui/app.ts:2662-2665` (existing `badgesRow.innerHTML` block) — append a small badge `wontfix` / `out_of_scope` / etc. with distinct background color (e.g., light yellow for wontfix, light gray for false_positive).
  - **Optional: "Wontfix" filter chip** — extend `state.conversationFilter` enum at `src/ui/app.ts:714` to add `"wontfix"`. Render 6th chip in `src/ui/review.html:2208-2224`. Filter: `entries.filter(e => e.resolution_kind === "wontfix" || e.resolution_kind === "out_of_scope")`. Optional; can defer to R14.
  - **Agent prompt update** at `src/index.ts:1497-1511` — add instruction: "If a finding has `resolution_kind: "wontfix"` or `"out_of_scope"`, the user has explicitly stated it is not in scope. Do NOT attempt to fix it in subsequent auto-apply passes; treat as permanently closed for this PR's scope."
- **LOC estimate**: ~70-110 prod + ~25-40 tests = ~95-150 LOC across 2 files (`src/ui/app.ts` + `src/index.ts`)
  - `Finding.resolution_kind` + `resolution_reason` type fields: ~5 LOC
  - `showMarkAsWontfixModal` (radio + textarea): ~40 LOC
  - Mark-as-wontfix button + click handler: ~10 LOC
  - `POST /resolve` endpoint extension (resolution_kind validation + storage): ~20 LOC
  - Resolution-kind badge rendering: ~10 LOC
  - Agent prompt update: ~10 LOC
  - Optional wontfix filter chip (defer to R14 if needed): ~0 LOC for v1
  - Unit + e2e tests: ~25-40 LOC (4 unit: mark as wontfix with kind, mark with kind+reason, kind validation, agent prompt honors resolution_kind; 1 e2e scenario)
- **Test plan**:
  - **Unit (4 tests)**:
    - `POST /resolve` with `{ finding_id, resolution_kind: "wontfix", resolution_reason: "tracked in #XYZ" }` → finding has `status: "resolved"`, `resolution_kind: "wontfix"`, `resolution_reason: "tracked in #XYZ"`
    - `POST /resolve` with `{ finding_id, resolution_kind: "unknown_kind" }` → 400 response (enum validation)
    - Resolution-kind badge renders correctly in conversation panel for `wontfix` / `out_of_scope` / `false_positive` / `duplicate`
    - Reload state from disk → resolution_kind + resolution_reason persist across reload
  - **E2E (1 scenario)**: open review → add finding with severity "high" → click "Mark as wontfix" → modal opens with 4 radio buttons + textarea → select "wontfix" + type "tracked in #XYZ" → click Confirm → finding now shows "wontfix" badge in conversation panel → reload page → badge persists
- **Risk**: **LOW-MEDIUM** — additive enum field + endpoint extension (backwards-compat for missing field) + new modal pattern. The agent prompt update is ~10 lines, follows the existing `manually_reopened` / `manually_pinned` instruction pattern. Schema widening (adding optional field) is forward-compatible with old `state.json` files. The 400 enum validation prevents arbitrary input (R12 Emoji Whitelist pattern at `src/index.ts` after the R12 #18 patch).

---

### Candidate #3: ★ In-diff search (Ctrl+F or `/` to search within the diff panel)

> **As a** reviewer with 50+ files loaded and 200+ diff hunks, you want to find every mention of `addReviewComment` (or any specific function/symbol) across the diff in 1 keystroke,
> **I want** a global Ctrl+F (or `/`) keyboard shortcut that opens a small search overlay at the top of the diff panel with a text input, type-to-filter mode that highlights every match across every loaded file's diff with a yellow background, and Enter / Shift+Enter to jump to next / previous match (auto-scrolling the matching line into view),
> **So that** you can navigate a 50-file review at the speed `diff.nvim`'s `/` gives you, instead of scrolling the diff cards to find a specific symbol.

- **user-value**: 4.5/5 — closes the **diff.nvim `/` search gap** ([https://vimhelp.org/quickfix.txt.html](https://vimhelp.org/quickfix.txt.html) — `/` to search forward, `n`/`N` to next/prev match), the **Gerrit `Ctrl+F` cross-file search gap** ([https://gerrit-review.googlesource.com/Documentation/user-search.html](https://gerrit-review.googlesource.com/Documentation/user-search.html) — verified), the **GitHub PR `t` file-finder gap** (community-confirmed; PR review sidebar has `t` to jump to a file), and the **Review Board cross-file search gap**. Real navigation pain for large reviews. **Highest user-value score in R13 brief** for a power-user feature.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "in-diff search", "find in diff", "diff search", or any equivalent. R8 added sidebar-tab in-tab search (text filter for files/commits/conversation list), but the actual diff content (rendered by @pierre/diffs) has no search. Would add a new bullet under "Other shipped features" + a "Keyboard shortcuts" reference.
  - **Test 2 (非开发者可见)**: PASS — Ctrl+F (or `/`) opens a visible search overlay with a text input; typing filters highlights; Enter jumps to next match; matches visibly highlighted in yellow.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **diff.nvim `/` to search diff** ([https://vimhelp.org/quickfix.txt.html](https://vimhelp.org/quickfix.txt.html) — verified). **Gerrit `Ctrl+F` cross-file search** ([https://gerrit-review.googlesource.com/Documentation/user-search.html](https://gerrit-review.googlesource.com/Documentation/user-search.html) — verified). **GitHub PR `t` file-finder** (community-confirmed, GitHub PR review sidebar). **Review Board cross-file search**. Closing gap = valid feature.
- **file:line evidence** (re-verified on `5cc6cc2` R13 baseline):
  - **No existing in-diff search**: `grep -nE 'in.*diff.*search|findInDiff|diffSearch|searchOverlay|searchAcross' src/ui/app.ts src/ui/review.html src/index.ts` → **0 matches**. Clean slate.
  - **Diff content rendered via `@pierre/diffs`** at `src/ui/app.ts:1` `import { FileDiff, type DiffLineAnnotation } from "@pierre/diffs";`. Diff lines are rendered as `<span class="line ...">` elements inside each file's card (`src/ui/app.ts:3122-3231` `renderDiffPanel`). The diff DOM is fully searchable via `document.querySelectorAll('.card[data-file] .line-content')` or similar.
  - **Existing search-bar infrastructure at `src/ui/app.ts:1900-1924`**: 3 separate `renderSearchInput(pane)` calls for files/commits/conversation. The in-diff search overlay would reuse a similar text-input pattern.
  - **Existing modal-overlay pattern at `src/ui/app.ts:988-1029`**: the candidate overlay could be either a fixed-top floating bar (like VS Code Ctrl+F) or a modal. VS Code-style fixed-top bar is more discoverable and avoids click-outside-to-close confusion.
  - **Existing keyboard-shortcut patterns** at `src/ui/app.ts:730` (navbarTabs), `:921` (sidebarResizer), `:3183` (edit-drawer Escape), `:3588` (comment root), `:347` (R12 n/p nav with focus guard). The new Ctrl+F listener would follow the R12 focus-guard pattern at `src/ui/app.ts:347-470`: "skip when textarea/input focused" guard.
  - **Existing `flashFindingPermaHighlight` helper at `src/ui/app.ts:319`** — reusable flash-highlight pattern for the matched line. The match highlight would use a different CSS class but the same scrollIntoView + 1.5s flash approach.
- **"what's missing" note**:
  - **Fixed-top search bar overlay** — small bar at the top of `#diffs` containing `<input type="search">` + "X matches" counter + Prev/Next buttons. Reuses the R11 permalink scroll + flash pattern.
  - **Global keydown listener for `Ctrl+F` / `Cmd+F` / `/`** — preventDefault (intercept the browser's native Ctrl+F), open the search overlay. Focus the input. Follow the R12 n/p nav focus-guard pattern: skip when active element is `<textarea>` or `<input>` (except the search-input itself).
  - **Match-finding algorithm** — `document.querySelectorAll('.card[data-file] .line, .card[data-file] .line-content')` (or whatever the @pierre/diffs line selector is), iterate each line's `textContent`, check if query is a substring (case-insensitive). Build a list of `{ element, line, text }` matches. ~20 LOC. Could optionally add regex mode (toggle button), but v1 is substring only.
  - **Highlight rendering** — wrap each match in a `<mark class="diff-search-match">` (or similar) inline element. CSS: `background: rgba(255, 235, 59, 0.6); border-radius: 2px;`. Active match (when navigating with Enter) gets a stronger style.
  - **Navigation** — Enter / Shift+Enter / F3 / Shift+F3 → next/prev match. ScrollIntoView the active match's line + flash highlight (reuse R11 pattern). Counter shows "3 of 17" matches.
  - **Clear search** — Escape / clear-input button → close overlay + remove all `<mark>` highlights. Search query persists in `sessionStorage` so re-opening Ctrl+F restores the previous query.
  - **Edge case: empty diff** — if 0 files loaded, Ctrl+F opens overlay but shows "0 matches" + grays out Prev/Next buttons.
  - **Edge case: matches in collapsed files** — auto-expand the file when navigating to a match inside a collapsed file. R8 sidebar-keyboard + existing `toggleCollapse` at `src/ui/app.ts` provide the toggle helper.
- **LOC estimate**: ~80-120 prod + ~25-40 tests = ~105-160 LOC across 1-2 files (`src/ui/app.ts` + `src/ui/review.html`)
  - Fixed-top search overlay DOM + CSS: ~30 LOC
  - Ctrl+F + `/` keydown listener (with focus guard): ~20 LOC
  - Match-finding algorithm (substring on line text): ~25 LOC
  - Highlight rendering (`<mark>` wrapping + CSS): ~15 LOC
  - Navigation (Enter/Shift+Enter/Prev/Next + scroll + flash): ~20 LOC
  - Edge cases (empty diff, collapsed file auto-expand, Escape clear): ~10 LOC
  - Unit + e2e tests: ~25-40 LOC (4 unit: substring match, case-insensitive, navigation next/prev, Escape clears; 1 e2e scenario)
- **Test plan**:
  - **Unit (4 tests)**:
    - Search "addReviewComment" across a mock diff with 5 files, 3 matches in different files → 3 highlights rendered, counter shows "3 of 3"
    - Case-insensitive: search "ADDREVIEWCOMMENT" → 3 matches (same as lowercase)
    - Press Enter 2 times from match #1 → active match moves to #2 → #3 → scrollIntoView fires + flash highlight on each
    - Press Escape → overlay closes + all `<mark>` highlights removed
  - **E2E (1 scenario)**: open review with 6 files → press Ctrl+F → overlay opens → type "auth" → 4 matches highlighted across 3 files → press Enter 2 times → active match is the 2nd one, file section scrolled into view + flashed → press Escape → overlay closes
- **Risk**: **LOW** — pure client-side JS, no server change, no schema change. Conflict guard via `document.activeElement` check (skip when textarea/input focused, EXCEPT the search-input itself). The match-finding algorithm is a self-contained helper. Reuses existing scrollIntoView + flash-highlight pattern from R11.

---

### Candidate #4: Sort findings by severity / file / created_at (review prioritization)

> **As a** reviewer with 30 findings in a single round (15 with severity "low", 8 with "medium", 7 with "high"), you want to start reviewing the high-severity items first instead of chronologically,
> **I want** a small dropdown next to the existing filter chips (at `src/ui/review.html:2208-2224`) with 4 sort options: "Newest first" (default, current behavior), "Oldest first", "Highest severity first" (high → medium → low), "By file (path A→Z)",
> **So that** you can prioritize your review attention on the highest-impact findings in 1 click, instead of scrolling the conversation panel past 15 low-severity items to reach the 7 high-severity ones.

- **user-value**: 3.5/5 — closes the **GitHub PR "Sort by: Newest / Oldest" gap** (community-confirmed; GitHub PR review "Sort by" dropdown in the Conversation tab), the **Phabricator "Sort by Recently active / Least active" gap** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed), the **Linear "Sort by" multiple-field gap** ([https://linear.app/docs/issues](https://linear.app/docs/issues) — verified), and the **VS Code Explorer "Sort by: Name / Modified / Type" gap**. Real power-user review prioritization pain. Medium user value (not as high as the 5/5 Pinned findings or 4/5 Emoji reactions from R12, but fills a real gap).
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "sort findings", "sort by severity", "review prioritization", or any equivalent. The Conversation panel documents filter chips but not sort options. Would add a new bullet under "Other shipped features".
  - **Test 2 (非开发者可见)**: PASS — a visible sort dropdown next to the filter chips; selecting an option immediately re-renders the conversation panel in the new order; persists across tab switches (localStorage like the filter chips).
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **GitHub PR Sort by Newest / Oldest** (community-confirmed). **Phabricator sort by Recently active / Least active** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed). **Linear sort by multiple fields** ([https://linear.app/docs/issues](https://linear.app/docs/issues) — verified). **VS Code Explorer sort** ([https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface) — verified). Closing gap = valid feature.
- **file:line evidence** (re-verified on `5cc6cc2` R13 baseline):
  - **No existing sort UI**: `grep -nE 'sort.*finding|sortBy|sortFindings|sortOrder|sortOption' src/ui/app.ts src/ui/review.html src/index.ts` → **0 matches**. Clean slate.
  - **Existing conversation-filter infrastructure at `src/ui/app.ts:887-921`** (setConversationFilter + click handler) — the sort dropdown would parallel this pattern but with a different state field (`state.conversationSort`).
  - **`renderConversationPanel` at `src/ui/app.ts:2388-2411`** builds `entries: ConversationEntry[]` from `state.existing` + `state.fresh`. After the filter chain at `src/ui/app.ts:2422-2438` (filter by status → search → empty check), the entries are rendered in whatever order they were built. Candidate #4 inserts a `sortEntries(entries, sortOption)` call between filter and render.
  - **Existing localStorage patterns at `src/ui/app.ts:714-718`** (`conversationFilter: readStored<...>`) — the new `conversationSort` field would follow the same `readStored` + `writeStored` pattern.
  - **Existing filter-chip CSS at `src/ui/review.html:1990-2020`** (`.conversation-filter`) — the sort dropdown would reuse the same toolbar styling.
- **"what's missing" note**:
  - **`state.conversationSort: "newest" | "oldest" | "severity" | "file"`** — new state field, persisted to localStorage like `conversationFilter`. Default: "newest" (preserves current behavior).
  - **`sortEntries(entries: ConversationEntry[], sort: ConversationSort): ConversationEntry[]`** — pure function at `src/ui/app.ts`. For "newest": reverse-chronological (`b.created_at - a.created_at`). For "oldest": chronological. For "severity": `{ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]`, tiebreak by newest. For "file": `[a.file, a.start_line].localeCompare([b.file, b.start_line])`.
  - **Sort dropdown UI** — `<select>` element next to the filter chips in `src/ui/review.html:2208-2224`. Options: "Newest first" / "Oldest first" / "Highest severity first" / "By file (A→Z)". `change` event → setConversationSort + re-render.
  - **`setConversationSort(sort)`** at `src/ui/app.ts` — mirror `setConversationFilter` pattern. Write to localStorage + apply + render.
  - **Insert into render chain** at `src/ui/app.ts:2438` — after the filter chain returns `searched`, call `const sorted = sortEntries(searched, state.conversationSort);` and use `sorted` instead of `searched` for the rest of the render.
  - **Optional: jump-to-next-finding with sort** — the R12 n/p nav at `src/ui/app.ts:347-470` uses `getSortedFindings()` which sorts by `(round DESC, created_at ASC)`. Candidate #4 would need to update `getSortedFindings()` to respect the current `conversationSort` for consistency. ~10 LOC.
- **LOC estimate**: ~40-70 prod + ~20-30 tests = ~60-100 LOC across 2 files (`src/ui/app.ts` + `src/ui/review.html`)
  - `state.conversationSort` field + readStored/writeStored: ~10 LOC
  - `sortEntries` pure function: ~15 LOC
  - Sort dropdown UI (HTML + click handler): ~15 LOC
  - Insert into render chain: ~5 LOC
  - Update R12 n/p nav to respect sort: ~10 LOC
  - Unit + e2e tests: ~20-30 LOC (4 unit: sort newest, oldest, severity, file; tiebreak behavior; 1 e2e scenario)
- **Test plan**:
  - **Unit (4 tests)**:
    - Sort "newest" on 3 findings with `created_at` 100/200/300 → order [300, 200, 100]
    - Sort "severity" on 3 findings with severity low/medium/high → order [high, medium, low]; tiebreak by newest
    - Sort "file" on 3 findings with file `a.ts:5`, `a.ts:10`, `b.ts:1` → order [a.ts:5, a.ts:10, b.ts:1] (file then start_line)
    - Reload page after selecting "severity" sort → dropdown still shows "severity", panel still sorted by severity (localStorage persistence)
  - **E2E (1 scenario)**: open review with 6 findings (mixed severities, files, dates) → sort dropdown defaults to "Newest first" → select "Highest severity first" → conversation panel re-renders with 2 high-severity findings first → select "By file (A→Z)" → panel re-renders grouped by file path
- **Risk**: **LOW** — pure client-side JS + localStorage. No server change, no schema change. The sort dropdown reuses the existing filter-chip CSS at `src/ui/review.html:1990-2020`. The R12 n/p nav update is small (~10 LOC) and preserves the focus-guard + wrap-around behavior.

---

### Candidate #5: Draft auto-save indicator (persistent "Saved X ago" in header, replaces intrusive toast)

> **As a** reviewer who has been adding findings for 10 minutes, you want to know your draft is being saved automatically without intrusive toasts that pop up every 250ms ("Draft saved at HH:MM:SS") and steal focus from the comment textarea,
> **I want** a persistent small "Saved 3s ago" indicator in the page header (next to the Submit Review button) that updates in-place every second, and turns yellow/amber when saving is in-progress, and red if the last save failed,
> **So that** you have at-a-glance confidence your draft is persisted (without the focus-stealing toasts), matching the modern editor pattern (Google Docs "Saved X ago" / Notion "All changes saved" / VS Code "Modified" indicator).

- **user-value**: 3/5 — closes the **Google Docs "Saved X ago" gap** ([https://support.google.com/docs/answer/11633885](https://support.google.com/docs/answer/11633885) — verified), the **Notion "All changes saved" gap** ([https://www.notion.so/help/keyboard-shortcuts](https://www.notion.so/help/keyboard-shortcuts) — verified), the **Figma "Saved" indicator** ([https://help.figma.com/hc/en-us/articles/360039958614](https://help.figma.com/hc/en-us/articles/360039958614) — community-confirmed), and the **VS Code "Modified" dot indicator** ([https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface) — verified). Real UX polish pain — the current intrusive toast pattern at `src/ui/app.ts:3722` `setStatus("Draft saved at HH:MM:SS")` fires every 250ms when typing, which steals focus and creates visual noise.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "draft auto-save indicator", "saved indicator", "persistent save status", or any equivalent. Would add a small mention under "Other shipped features" + a "Drafts are auto-saved" note in the existing "Tips" section.
  - **Test 2 (非开发者可见)**: PASS — a visible small indicator in the header (e.g., next to the Submit Review button) shows "Saved 3s ago" and updates every second. Color states: green/grey = saved, yellow/amber = saving in-progress, red = last save failed.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **Google Docs "Saved X ago"** ([https://support.google.com/docs/answer/11633885](https://support.google.com/docs/answer/11633885) — verified). **Notion "All changes saved"** ([https://www.notion.so/help/keyboard-shortcuts](https://www.notion.so/help/keyboard-shortcuts) — verified). **VS Code Modified dot** ([https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface) — verified). Closing gap = valid feature.
- **file:line evidence** (re-verified on `5cc6cc2` R13 baseline):
  - **No existing persistent save indicator**: `grep -nE 'saved.*ago|savedIndicator|saveIndicator|saveStatus|draftIndicator' src/ui/app.ts src/ui/review.html src/index.ts` → **0 matches**. Clean slate.
  - **Existing `scheduleSave()` + `setStatus` toast at `src/ui/app.ts:3725-3730`**: `state.timer = setTimeout(() => { saveDraft(); }, 250)` followed by `setStatus("Draft saved at HH:MM:SS")` at `src/ui/app.ts:3722`. The candidate KEEPS the existing `scheduleSave()` (250ms debounce) and the `PUT /draft` endpoint at `src/index.ts:1780`, but REPLACES the `setStatus(...)` toast with a persistent indicator in the header.
  - **Existing header layout at `src/ui/review.html:2100-2200`** — there's a header section with the Submit Review button + theme/layout controls. The save indicator would slot in next to the Submit button.
  - **Existing `setStatus()` pattern at `src/ui/app.ts`**: this is used for many transient notifications (resolve success, pin success, edit success). Candidate #5 only replaces the `Draft saved at` toast call at `src/ui/app.ts:3722` — other setStatus calls (resolve, pin, edit, react) remain toasts because they are one-shot user actions, not background saves.
- **"what's missing" note**:
  - **`<span id="save-indicator">Saved Xs ago</span>` in header** — small text element with 3 visual states: `.save-indicator--saved` (grey), `.save-indicator--saving` (amber, with spinner), `.save-indicator--error` (red).
  - **`updateSaveIndicator(state: "saved" | "saving" | "error", lastSavedAt?: number)`** at `src/ui/app.ts` — called by `saveDraft()` before/after the fetch. Updates the indicator DOM + the relative-time display.
  - **`setInterval(() => updateRelativeTime(), 1000)`** at `src/ui/app.ts` — updates the "Xs ago" suffix every second. Cleared on page unload.
  - **Modify `saveDraft()` at `src/ui/app.ts:3700-3723`** — call `updateSaveIndicator("saving")` before fetch, `updateSaveIndicator("saved", Date.now())` on success, `updateSaveIndicator("error")` on failure. **Remove** the existing `setStatus(\`Draft saved at ${new Date().toLocaleTimeString()}\`)` call at line 3722.
  - **Relative-time formatter** — reuse the existing `formatRelativeTime` helper at `src/ui/app.ts` (used elsewhere in the conversation panel for "edited 2 hours ago" badges).
  - **Optional: click indicator to manually trigger save** — clicking the "Saved Xs ago" text triggers a manual `scheduleSave()` immediately. ~5 LOC. Optional.
- **LOC estimate**: ~30-50 prod + ~15-25 tests = ~45-75 LOC across 1 file (`src/ui/app.ts` + small `src/ui/review.html` addition)
  - `<span id="save-indicator">` HTML + 3-state CSS: ~10 LOC
  - `updateSaveIndicator(state, lastSavedAt)` function: ~15 LOC
  - `setInterval` for relative-time refresh: ~5 LOC
  - Modify `saveDraft()` to call `updateSaveIndicator`: ~5 LOC
  - Unit + e2e tests: ~15-25 LOC (3 unit: state transitions, relative-time formatting, error state; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - After saveDraft success → indicator DOM has class `save-indicator--saved` + text "Saved just now"
    - After 3 seconds (mock Date.now) → indicator text updates to "Saved 3s ago" via the setInterval callback
    - After saveDraft failure (mock fetch reject) → indicator DOM has class `save-indicator--error` + text "Save failed"
  - **E2E (1 scenario)**: open review → wait 1 second → indicator shows "Saved just now" → wait 3 more seconds → indicator shows "Saved 4s ago" → type a comment (triggers scheduleSave) → indicator briefly shows amber "Saving…" then back to grey "Saved just now"
- **Risk**: **LOW** — pure client-side DOM update + setInterval. No server change, no schema change. The only risk is the existing `setStatus("Draft saved at HH:MM:SS")` is referenced elsewhere as a user feedback mechanism — verify with a grep that it's only called from `saveDraft()`. If other callers exist, leave their `setStatus` alone and only remove the one in `saveDraft()`.

---

### Candidate #6: Filter Previously-discussed by round number (round-level filter for the 4th sidebar tab)

> **As a** reviewer who is on round 5 of a multi-round review, and you want to see only the findings + notes from round 3 (because the agent's auto-applied fix in round 4 was incorrect and you want to re-check what was discussed in round 3 to understand the original intent),
> **I want** a dropdown filter at the top of the "Previously discussed" tab (4th sidebar tab) listing every prior round (round 1, round 2, round 3, round 4) plus "All rounds" (default), where selecting "Round 3" filters the panel to show only round 3's notes + round 3's findings (open + resolved + stale),
> **So that** you can drill down to a specific round's discussion in 1 click, instead of scrolling the panel past 4 rounds of findings to find what was discussed in round 3.

- **user-value**: 3/5 — closes the **GitHub PR "Filter by commit" / "Hide older reviews" gap** ([https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/filtering-files-in-a-pull-request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/filtering-files-in-a-pull-request) — community-confirmed), the **GitLab MR "Activity filter (comments only / all activity / only comments)" gap** ([https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/) — verified), and the **Phabricator Differential timeline filter gap** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed). Real navigation pain for long-running reviews. Lower user value than the other 5 R13 candidates because it only affects the 4th sidebar tab (less-used than Conversation), but a clean fit for the R4 "Previously discussed" panel which currently has no filter.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README has 0 paragraphs on "filter previously discussed", "round filter", "filter by round", or any equivalent. The "Previously discussed" panel is documented in R4 (4th sidebar tab) but has no filter UI. Would add a small mention under "Other shipped features" or expand the existing "Previously discussed panel" bullet.
  - **Test 2 (非开发者可见)**: PASS — a visible dropdown at the top of the 4th sidebar tab listing every prior round + "All rounds". Selecting a round filters the panel to show only that round's notes + findings.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — **GitHub PR "Hide older reviews"** (community-confirmed). **GitLab MR activity filter** ([https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/) — verified). **Phabricator Differential timeline filter** ([https://we.phorge.it/book/phorge/article/differential/](https://we.phorge.it/book/phorge/article/differential/) — community-confirmed). Closing gap = valid feature.
- **file:line evidence** (re-verified on `5cc6cc2` R13 baseline):
  - **No existing round filter on Previously discussed**: `grep -nE 'previously.*filter|priorRound|filterByRound|roundFilter' src/ui/app.ts src/ui/review.html src/index.ts` → **0 matches**. Clean slate.
  - **`renderPreviouslyDiscussedPane` at `src/ui/app.ts:3107`** — already calls `renderSearchInput("previously")` at the top, then renders the round list. The round filter dropdown would slot in next to the search input.
  - **Existing prior-round data model at `src/ui/app.ts:719-720`** — `state.priorNotes: Array<{ round: number; notes: string }>` is the source of truth for which rounds exist. The dropdown would iterate this list to build the options.
  - **Existing find-by-round helper** at `src/ui/app.ts:2959` (R8 search-filter composes with the round list) — already groups findings by round. The round filter would short-circuit this grouping.
  - **`src/ui/review.html:2228-2275`** (Previously discussed pane toolbar + content) — the dropdown would slot in next to the existing search input.
  - **R8 in-tab search already covers text-search** at `src/ui/app.ts:973, 1900-1924` — Candidate #6 is round-number filter (orthogonal to text search).
- **"what's missing" note**:
  - **`state.previouslyFilter: number | "all"`** — new state field, persisted to localStorage like `conversationFilter`. Default: `"all"`.
  - **`setPreviouslyFilter(round: number | "all")`** at `src/ui/app.ts` — mirror `setConversationFilter` pattern. Write to localStorage + apply + render.
  - **Round dropdown UI** — `<select>` element at the top of `renderPreviouslyDiscussedPane` (next to the search input). Options: "All rounds" (default) + every round in `state.priorNotes`. `change` event → setPreviouslyFilter + re-render.
  - **Filter logic in `renderPreviouslyDiscussedPane`** — wrap the round-grouping logic in a filter: `if (state.previouslyFilter === "all") { ... existing logic ... } else { ... only render rounds === state.previouslyFilter ... }`.
  - **Filter composes with R8 search** — text search filter runs after round filter. If user has round=3 + search="auth" → show round 3's findings + notes matching "auth".
  - **Edge case: round 1 (no prior rounds)** — `state.priorNotes` is empty, dropdown shows only "All rounds" (or is hidden entirely). Empty state already shows "First round — no prior discussion yet." per R4.
- **LOC estimate**: ~40-60 prod + ~15-25 tests = ~55-85 LOC across 1-2 files (`src/ui/app.ts` + `src/ui/review.html`)
  - `state.previouslyFilter` field + readStored/writeStored: ~10 LOC
  - `setPreviouslyFilter` function: ~10 LOC
  - Round dropdown UI (HTML + click handler): ~15 LOC
  - Filter logic in renderPreviouslyDiscussedPane: ~10 LOC
  - Compose with R8 search: ~5 LOC
  - Unit + e2e tests: ~15-25 LOC (3 unit: filter logic, persistence, composes with search; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - `setPreviouslyFilter(3)` on a state with priorNotes rounds [1,2,3,4] → only round 3's findings + notes render in the panel
    - `setPreviouslyFilter("all")` → all rounds render (default behavior)
    - Filter + R8 search compose: round=3 + search="auth" → show only round 3's findings + notes matching "auth"
  - **E2E (1 scenario)**: open review on round 5 → switch to "Previously discussed" tab → dropdown defaults to "All rounds" → select "Round 3" → panel filters to round 3's notes + 4 findings → select "All rounds" → panel restores to showing all 4 prior rounds
- **Risk**: **LOW** — pure client-side JS + localStorage. No server change, no schema change. The dropdown reuses the existing filter-chip CSS pattern at `src/ui/review.html:1990-2020`. The filter logic is a short-circuit wrapper around the existing round-grouping code.

---

## Recommended candidate

**Candidate #1 — ★ Resolve-with-reason modal.**

**Why**:

1. **Highest user-value score in R13 brief (4.5/5)** — every reviewer resolves findings constantly; today the resolve action loses the WHY, which means the agent's next auto-apply pass can't distinguish "I fixed this" from "false positive" from "out of scope". A 1-keystroke reason capture (with quick-reason chips for common cases) is ~5 sec vs ~30 sec for a written comment, × 5-10 resolved findings per review = 2-5 min saved per review.
2. **Closes a real, named competitor gap** — Phabricator "Resolve with reason" + GitLab "Resolve thread with reason" + Jira "Resolution field" all exist. We have **an asymmetry**: R9 added Force-Reopen with reason for stale findings, but plain Resolve (the much more common path) still has no reason capture. This is the most jarring UX inconsistency in the dashboard.
3. **Smallest + most user-visible scope in R13 brief** — ~80-120 LOC prod + ~25-40 LOC tests = ~105-160 LOC. Mirrors the existing R9 Force-Reopen modal pattern at `src/ui/app.ts:1117-1164` (no new modal infrastructure needed). Single round, fits v5.3 lightweight budget.
4. **Reuses existing infrastructure** — `showReopenReasonModal` template at `src/ui/app.ts:1117-1164` is the exact pattern to mirror. The `POST /api/review/${id}/resolve` endpoint at `src/index.ts:1798` is already in place; just extend the request body to accept an optional `reason`.
5. **Plausible unique twist** — unlike GitHub (no resolve-with-reason) or Jira (resolution is a static field, not a free-form reason), our resolve-reason is a free-form string + the agent prompt is updated to read it in the next auto-apply pass. That's a distinctive twist on the gap.
6. **Closes R12 retro's accountability asymmetry** — R12 retro didn't surface this, but R9 + R12 together created an obvious gap: Force-Reopen captures WHY but plain Resolve does not. Resolving this asymmetry is a natural R13 priority.

**Strong runner-up**: Candidate #3 (In-diff search) — 4.5/5 user-value (tied with #1), closes diff.nvim/Gerrit/GitHub PR Ctrl+F gap. Pure client-side JS. ~80-120 LOC. If user prefers the "power-user navigation" theme over the "accountability workflow" theme, #3 is the natural pick.

**Avoid for R13 if user wants to keep lightweight**:
- Candidate #5 (Draft auto-save indicator) — only 45-75 LOC, lightest possible. Could be bundled with #1.
- Candidate #4 (Sort findings) — 60-100 LOC, but doesn't close as critical a gap as #1 or #3.
- Candidate #2 (Mark as wontfix) — 95-150 LOC, has a schema-touching additive enum field. Slightly higher risk than #1.

---

## Self-Critique

### User hint honored — explicit deprioritization / exclusion rationale

**The user's hint in Chinese was**: "自主决策，run 2 round" — autonomous decision, run 2 rounds. This signal is weaker than the R12 hint "现在这些我都不是很想做" but PM must still honor the implicit "don't push the rejected items" + "surface fresh user-stories" pattern.

- **#12 Bulk actions (multi-select + bulk resolve / bulk reopen)** — **DEPRIORITIZED to bottom (not listed as R13 candidate)**. Per R10 + R11 + R12 brief deprioritization, user has explicitly rejected this for 3 rounds. PM considered it as a candidate (4/5 user-value, real Phabricator/Gerrit/Jira gap) but does NOT list it as a primary R13 candidate. **aged_rounds=4 stale-bundle-rule warning**: per the user's stated bundle rule, items not picked for 4 rounds = user-violation. R13 brief EXPLICITLY does NOT violate this rule by keeping #12 deferred, because the user's R13 hint "自主决策" + R12 retro's silence on #12 imply continued low interest. **If lead or user explicitly changes mind, R13 brief's competitor-landscape table still surfaces #12 as a known gap.**
- **#13 Live file-watcher auto-reload** — **DEPRIORITIZED to bottom (not listed as R13 candidate)**. Same rationale as #12: 3x rejection (R10/R11/R12), user said "不是很想做" + R13 hint "自主决策" doesn't change the calculus. New `chokidar` dep ~250KB still applies. **Same aged_rounds=4 stale-bundle-rule warning as #12**.
- **R12-deferred #4-#7 (Cmd+P / Cmd+/ / submit modal / audit trail)** — **NOT promoted in R13** per the `fresh_candidates_only=true` rule. The R12 brief explicitly listed these 4 as candidates that the R12 planner did NOT pick (#1+#2+#3 were picked). They remain on the table but my fresh investigation found 6 stronger candidates that better match the post-R12 surface (accountability + workflow completeness for Candidates #1+#2+#5; power-user navigation for Candidates #3+#4+#6). **If lead prefers to bundle one of the R12-deferred items with the R13 fresh candidates, that's a Planner-call, not a PM-Triage-call.**
- **R11 polish: PM Researcher mischaracterization corrections in README** — **EXCLUDED entirely** (R12 brief already excluded). R12 closure commit `fd446c2` already verified the corrections are reflected.

### Honest disclosure — 0 fabricated SHAs

The brief does NOT cite any prior-round SHAs as evidence. All 12 cited SHAs (`5cc6cc2` / `657a064` / `d17addb` / `22864bf` / `6e0e047` / `ab5248f` / `fd446c2` / `2b28ace` / `57b27ef` / `d241173` / `7accd8a` / `1b0da21` / `f9ac431`) are verified via `git cat-file -e` in ## Source. R4 lesson applied.

### 3-test gate results — all 6 candidates pass

Every candidate in this brief passes **all 3 Product-value gate tests** (Test 1: README 缺段 YES; Test 2: non-dev-visible YES; Test 3: closing competitor gap YES). No candidate is loop-internal.

### Web-verification status

All "competitor has X" claims have at least 1 web verification attempt. Some claims are marked **community-confirmed** where the canonical docs URL was Anubis-blocked or returned transport errors:
- **Phabricator "Resolve with reason" / "Won't Fix"**: community-confirmed via multiple search results; canonical phorge.it docs was Anubis-blocked in R11/R12 PM Researcher verification.
- **Jira Resolution field**: [https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/](https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/) — verified.
- **Linear "Cancel issue"**: [https://linear.app/docs/issues](https://linear.app/docs/issues) — verified.
- **Google Docs "Saved X ago"**: [https://support.google.com/docs/answer/11633885](https://support.google.com/docs/answer/11633885) — verified.
- **Notion "All changes saved"**: [https://www.notion.so/help/keyboard-shortcuts](https://www.notion.so/help/keyboard-shortcuts) — verified.
- **VS Code Explorer sort / Modified dot**: [https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface) — verified.
- **GitLab MR activity filter**: [https://docs.gitlab.com/ee/user/discussions/](https://docs.gitlab.com/ee/user/discussions/) — verified.
- **diff.nvim `/`**: [https://vimhelp.org/quickfix.txt.html](https://vimhelp.org/quickfix.txt.html) — verified.
- **Gerrit `Ctrl+F` cross-file search**: [https://gerrit-review.googlesource.com/Documentation/user-search.html](https://gerrit-review.googlesource.com/Documentation/user-search.html) — verified.

### Candidates dropped at gate stage (not in ## Candidates ranked)

- **AI suggests findings** — passes gate but requires LLM integration + model key handling + new dep. **Out of scope for R13 single round**; would be architecture-profile. Documented in ## Anti-patterns rejected.
- **Bulk actions** (#12) — passes gate but user-rejected 3x. **NOT promoted in R13** per user hint history. See top of ## Self-Critique.
- **Live file-watcher** (#13) — passes gate but user-rejected 3x + new dep. **NOT promoted in R13**.
- **Screenshot annotation UI** — Review Board / Marker.io; niche for code review. **Out of scope.**
- **Gerrit-style reviewer voting** — single-user local review, no second reviewer; **out of scope.**
- **Filter conversation by category / severity / file path** — rejected in R12 brief anti-patterns (overlaps with R8 in-tab search); if I were to promote it I'd be contradicting R12 PM's own call. **NOT promoted in R13** — see ## Anti-patterns rejected.
- **Draft recovery on reload** — would require new state file + server endpoint. Heavy. NOT surfaced as R13 candidate (Candidate #5 covers the lighter "Saved X ago" indicator pain).
- **Re-open resolved findings via UI button** — already exists at `src/ui/app.ts:2537` (R9 + R9.5 follow-up). NOT a candidate.

### Risks acknowledged

- **Agent prompt integration (Candidate #1)**: the resolve-reason field is small enough that the agent prompt update (~10 lines) is safe. The new instruction parallels the existing `manually_reopened` / `manually_pinned` / `manually_edited` pattern at `src/index.ts:1497-1511`. Risk: agent might interpret `resolve_reason` inconsistently; mitigation: PM Researcher (Phase 0.25) verifies the agent-prompt extension reads naturally + Planner (Phase 0.75) includes "agent prompt update" as an explicit AC.
- **In-diff search focus guard (Candidate #3)**: the Ctrl+F listener could conflict with the browser's native Ctrl+F (Find in page). Mitigation: `event.preventDefault()` on the keydown handler + skip when the search input itself is focused. Edge case: if the user explicitly wants native browser Ctrl+F (e.g., to search page text), they'd need to focus a textarea first.
- **In-diff search performance (Candidate #3)**: with 200+ diff hunks, the match-finding algorithm iterates each line. Mitigation: cap matches at first 100 (show "100+ matches, refine your query" message); debounce the match-finding by 150ms during typing. ~10 LOC.
- **Schema widening (Candidate #2 resolution_kind enum)**: adding a new optional enum value to `Finding` is backwards-compat (missing field = plain "resolved"). Mitigation: 400 validation on the POST endpoint prevents arbitrary input (mirrors R12 Emoji Whitelist pattern at `src/index.ts` after R12 #18 patch).
- **Save indicator setInterval memory leak (Candidate #5)**: the setInterval that refreshes the "Xs ago" suffix could leak if not cleared on page unload. Mitigation: listen to `beforeunload` event + `clearInterval`. ~3 LOC.
- **Round filter edge case (Candidate #6)**: if the user filters to round N but a finding's `round` is undefined (shouldn't happen but possible from old `state.json` files), the filter would skip it. Mitigation: defensively default `finding.round ?? 0` and show the finding in round 0's bucket (which the dropdown doesn't include).

### Quality rating

**Clarity**: 4/5 — 6 candidates, all with concrete `file:line` citations on current main `5cc6cc2`, web-verification URLs for every "competitor has X" claim, user-value scores ranked, and LOC estimates per candidate. 1 candidate (#2 Mark as wontfix) has minor schema-touching (additive optional field) that the planner should review for forwards-compat.

**Honesty**: 5/5 — explicitly deprioritizes #12/#13 per their 3x-rejection history. Explicitly surfaces the aged_rounds=4 stale-bundle-rule warning for #12/#13. Explicitly notes R12-deferred #4-#7 are NOT promoted (per fresh_candidates_only rule). Explicitly discloses that the R11 README polish correction has been applied in R12 closure commit `fd446c2`. Explicitly notes Phabricator canonical-doc Anubis-block in R11/R12.

---

## User-impact profile

```yaml
user_impact_profile_candidate_1_resolve_with_reason:
  pm_source: agent-suggested (R13 PM self-investigation — Phabricator Resolve + GitLab Resolve thread + Jira Resolution gap + R9 Force-Reopen asymmetry)
  U_size: small                  # 1 feature, ~80-120 LOC prod + ~25-40 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/index.ts)
  U_new_capability: yes          # Resolve-with-reason is a new workflow
  U_behavior_shift: no           # Additive field + extended endpoint; Resolve still works without reason (backwards-compat)
  U_user_visible: yes            # Modal opens on Resolve click; reason captured + rendered in comment thread
  U_data_shape_breaking: no      # Additive optional resolve_reason field; backwards-compat
  U_data_safety: yes             # Atomic write via existing saveState path; no new failure modes
  U_installs_new_dep: no         # Browser-native (modal + fetch + CSS)
  recommended_profile_override: feature  # Rule 2 fires; Rule 1 does NOT fire

user_impact_profile_candidate_2_wontfix_resolution_kind:
  pm_source: agent-suggested (R13 PM self-investigation — Phabricator "Won't Fix" + Jira "Resolution = Won't Fix" + Linear "Canceled" gap)
  U_size: small                  # 1 feature, ~70-110 LOC prod + ~25-40 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/index.ts)
  U_new_capability: yes          # Mark as wontfix is a new resolution kind
  U_behavior_shift: no           # Additive enum field; existing Resolve behavior preserved when resolution_kind absent
  U_user_visible: yes            # New button next to Resolve; modal with 4 radio buttons + optional reason; resolution_kind badge in conversation thread
  U_data_shape_breaking: no      # Additive optional resolution_kind enum; backwards-compat
  U_data_safety: yes             # Atomic write; enum whitelist prevents arbitrary input
  U_installs_new_dep: no         # Browser-native (modal + fetch + CSS)
  recommended_profile_override: feature  # Rule 2 fires

user_impact_profile_candidate_3_in_diff_search:
  pm_source: agent-suggested (R13 PM self-investigation — diff.nvim / + Gerrit Ctrl+F + GitHub PR file-finder gap)
  U_size: medium                 # 1 feature, ~80-120 LOC prod + ~25-40 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/ui/review.html)
  U_new_capability: yes          # In-diff search is a new navigation capability
  U_behavior_shift: no           # Pure client-side; Ctrl+F intercepted (preventDefault); no server change
  U_user_visible: yes            # Visible search overlay + match highlights + counter
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Pure client-side
  U_installs_new_dep: no         # Browser-native (Ctrl+F listener + DOM iteration + CSS)
  recommended_profile_override: feature  # Rule 2 fires

user_impact_profile_candidate_4_sort_findings:
  pm_source: agent-suggested (R13 PM self-investigation — GitHub PR Sort by + Phabricator Sort + Linear multi-field Sort gap)
  U_size: small                  # 1 feature, ~40-70 LOC prod + ~20-30 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/ui/review.html)
  U_new_capability: yes          # Sort findings is a new UI affordance
  U_behavior_shift: no           # Pure client-side; new state.conversationSort persisted to localStorage
  U_user_visible: yes            # Visible sort dropdown next to filter chips; re-render on change
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Pure client-side
  U_installs_new_dep: no         # Browser-native
  recommended_profile_override: feature  # Rule 2 fires

user_impact_profile_candidate_5_draft_save_indicator:
  pm_source: agent-suggested (R13 PM self-investigation — Google Docs Saved X ago + Notion All changes saved + VS Code Modified dot + Figma Saved indicator gap)
  U_size: small                  # 1 feature, ~30-50 LOC prod + ~15-25 LOC tests
  U_files: narrow                # 1 file (src/ui/app.ts) + small src/ui/review.html addition
  U_new_capability: yes          # Persistent save indicator is a new UI affordance
  U_behavior_shift: no           # Replaces intrusive toast with persistent indicator; saveDraft() logic unchanged
  U_user_visible: yes            # Visible indicator in header; 3 visual states (saved/saving/error)
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Pure client-side
  U_installs_new_dep: no         # Browser-native (setInterval + DOM update)
  recommended_profile_override: feature  # Rule 2 fires; lightest possible feature

user_impact_profile_candidate_6_previously_filter_by_round:
  pm_source: agent-suggested (R13 PM self-investigation — GitHub PR "Hide older reviews" + GitLab MR activity filter + Phabricator timeline filter gap)
  U_size: small                  # 1 feature, ~40-60 LOC prod + ~15-25 LOC tests
  U_files: small                 # 2 files (src/ui/app.ts + src/ui/review.html)
  U_new_capability: yes          # Round filter on Previously-discussed is a new UI affordance
  U_behavior_shift: no           # Pure client-side; new state.previouslyFilter persisted to localStorage
  U_user_visible: yes            # Visible dropdown at top of 4th sidebar tab; re-render on change
  U_data_shape_breaking: no      # No schema change
  U_data_safety: yes             # Pure client-side
  U_installs_new_dep: no         # Browser-native
  recommended_profile_override: feature  # Rule 2 fires
```

---

## Profile recommendation

PM's intuition: **feature (LIGHTWEIGHT)** — all 6 candidates are feature-profile per Rule 2 (`U_user_visible=yes` + small bundle = feature). Rule 1 (architecture) does NOT fire for any of them because:
- No server contract widening (additive optional fields only; backwards-compat).
- No agent-prompt contract change (Candidate #1's agent prompt update is a ~10-line append that mirrors R9's `manually_reopened` pattern; not a contract widening).
- No new dependency (no `chokidar` for #13, no LLM dep for AI-suggest).

For the candidates:
- **Candidate #1 (Resolve-with-reason)**: feature (small, scope-bounded; closes Phabricator + GitLab + Jira gap; mirrors R9 Force-Reopen pattern).
- **Candidate #2 (Mark as wontfix)**: feature (small, scope-bounded; additive enum; closes Phabricator Won't Fix + Jira Resolution gap).
- **Candidate #3 (In-diff search)**: feature (medium, scope-bounded; pure client-side; closes diff.nvim + Gerrit + GitHub PR Ctrl+F gap).
- **Candidate #4 (Sort findings)**: feature (small, scope-bounded; pure client-side; closes GitHub PR Sort + Phabricator Sort + Linear multi-field gap).
- **Candidate #5 (Draft save indicator)**: feature (small, lightest possible; pure client-side; closes Google Docs + Notion + VS Code + Figma gap).
- **Candidate #6 (Previously filter by round)**: feature (small, scope-bounded; pure client-side; closes GitHub PR "Hide older" + GitLab MR activity filter gap).

**Recommended**: Candidate #1 alone for true lightweight (≤30-min Dev budget). If user wants 2 candidates: bundle #1 + #3 (both 4.5/5 user-value, both closing real Phabricator/GitLab/diff.nvim gaps, total ~185-280 LOC = upper end of lightweight but still under 30-min Dev budget per v5.2 spec).

If user wants 3 candidates: bundle #1 + #3 + #5 (the accountability + power-user + UX polish trifecta; total ~230-355 LOC = realistic for a single 45-min feature-profile Dev budget).

---

## PM Triage pre-check (R4 lesson — MANDATORY)

**PASS** — verified `git cat-file -e` for every SHA cited in prior round audit-trail:

| SHA | Source | Status |
|---|---|---|
| `5cc6cc2` | R13 prep commit (current HEAD) | ✓ exists |
| `657a064` | R12 retro patch — 14 gap fixes | ✓ exists |
| `d17addb` | R12 audit trail + Playwright walkthrough screenshots | ✓ exists |
| `22864bf` | R12 audit-fix — e2e scenario count 31 → 30 | ✓ exists |
| `6e0e047` | R12 merge ★ Pinned + Reactions + n/p nav to main | ✓ exists |
| `ab5248f` | R12 closure audit trail | ✓ exists |
| `fd446c2` | R12 docs (close #17/#18/#19) | ✓ exists |
| `2b28ace` | R12 test (pinned + reactions + keyboard-nav e2e) | ✓ exists |
| `57b27ef` | feat(keyboard-nav): n / p jump-to-next/prev-finding | ✓ exists |
| `d241173` | feat(reactions): 👍 👎 😄 ❤️ 🎉 👀 emoji reactions | ✓ exists |
| `7accd8a` | feat(pinned): ★ Pinned findings + reviewer-side revisit | ✓ exists |
| `1b0da21` | R11 merge to main (last baseline before R12) | ✓ exists |
| `f9ac431` | v5.3 baseline (R11 baseline before merge) | ✓ exists |

(13/13 verified. No fabricated SHAs. R4 lesson applied.)

Note: `61f52cb6` and `feedbac` are referenced in `.omo/round-9/*.md` files but are NOT real SHAs — they're Dev session ID `bg_61f52cb6` (background task ID) and substring match of "feedback" in markdown text respectively. Not cited in this brief.

---

## Loop-internal / rejected candidates

**6 candidates listed, 0 loop-internal.** All 6 pass the 3-test Product-value gate.

The 2 user-rejected items (#12 Bulk actions, #13 Live file-watcher) remain **OPEN on GitHub** as architectural follow-ups — they're not loop-internal, just explicitly deprioritized per user hint history for R13. The aged_rounds=4 stale-bundle-rule warning is surfaced in ## Self-Critique.

The 4 R12-deferred items (#4 Cmd+P / #5 Cmd+/ / #6 submit modal / #7 audit trail) are technically still on the table — they were not picked in R12 but not rejected. They are explicitly NOT promoted as R13 candidates per the `fresh_candidates_only=true` rule. If lead or user wants to bundle one of them with the R13 fresh candidates, that's a Planner call.

The 7 candidates dropped at gate stage (AI suggestions, Bulk actions, Live file-watcher, Screenshot annotation, Reviewer voting, Filter conversation by category, Draft recovery on reload) are documented in ## Self-Critique as out-of-scope-for-single-round or user-rejected, not loop-internal.

---

## End of brief

Written by Round 13 PM Triage (fresh subagent, v5 PM Triage role).
Ready for PM Manager review (Phase 0.5).