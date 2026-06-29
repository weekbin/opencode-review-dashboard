# Round 4 Brief — v3 (re-grounded in current main)

> **Date**: 2026-06-29
> **Author**: Round 4 PM Triage (Sisyphus-Junior, fresh subagent)
> **Status**: PM brief, awaiting PM Manager review
> **Predecessor**: `.omo/round-4/brief.md` was invalidated 2026-06-29 by audit-trail-integrity finding. R3 audit-trail files are DESIGN-ONLY, not SHIP records. See `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md` for the full integrity evidence chain (6/6 verified). R3's design intent (prior-round context surface) is **valid as a USER PAIN** and is the anchor for candidate #1 below. The R3 implementation claims (R3 commit SHAs `57a447a` / `b4bc02e` / `e14c943`; `state.notes_history`; `src/format.test.ts`; payload `session_id` / `prior_notes` / `resolved[]`) are **NOT in current main** and **MUST NOT be cited as if they are**.

## Source

- `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md` (R3 code commits MISSING from git history; `state.notes_history` MISSING; `src/format.test.ts` MISSING; R3 tool response at `src/index.ts:1835-1845` is `{ok, round, json_path, md_path}` only)
- `.omo/round-4/pm-manager-review.md` (CLARIFY on previous R4 brief; suggested rewrite focuses on UI surfacing without fabricated R3 payload fields)
- `.omo/round-3/playwright-report.md:15` + `.omo/round-3/decision.md:73` (real R3 forward-reference: "Surfacing `resolved[]` or `prior_notes` as a 'Previously discussed' panel in the UI is a separate Round 4 candidate")
- `gh issue list --state all` — 0 open, 2 closed (both pre-R1 worktrees / diff-range bugs); **no fresh user complaints**
- `.omo/proposals.jsonl` (last 4 entries) — R1-3 `follow_up_candidates` are stale: #3 Reopen anchor end_line, #4 E2E coverage gap, #5 take-screenshots.mjs dead code. Per backlog-freshness gate (commit `961345d`), this brief surfaces 4 fresh user-stories via self-investigation
- `git log --oneline -20` (R1 commit `27d73cb` atomic writes, R2 commit `3f24272` worktree fix, R3 = skill patches `961345d` + audit-trail note `870a507`. **No R3 code commits.**)
- Current main inspection: `src/index.ts:71-79` `State = { session_id, round, findings, draft?, diff_base?, previous_diff_base?, updated_at }`; `src/index.ts:28-46` `Finding` with optional `comments?: FindingComment[]`; `src/index.ts:415` `format()` filters to `status === "open"` only; `src/index.ts:422-431` strips `comments[]` from the agent's outbound payload; `src/ui/app.ts:1603-1712` `renderConversationPanel` with 3-status filter at `:497-506`; `src/ui/app.ts:1553-1569` yellow "diff range changed" banner

## User pain

A developer running **round 2+** of `/diff-review-dashboard` sees three compounding frictions, all rooted in the same gap: **the tool's return payload and the review UI both treat "prior round" context as second-class**.

1. **The agent doesn't see the prior round's discussion.** The `add_review_comment` tool at `src/index.ts:1929` lets the user (in the UI) and the agent (Post-Apply Trace per `src/index.ts:1358`) hold a back-and-forth thread on a finding. But `format()` at `src/index.ts:415` filters to `status === "open"` only, and the `findings[]` it returns at `:422-431` is mapped to `{id, severity, category, file, start_line, end_line, side, comment}` — `comments[]` is dropped, and resolved findings are dropped entirely. The agent prompt at `src/index.ts:1336-1341` is forced to instruct the agent to read `.opencode/reviews/<session>/state.json` manually. The user feels this as: "I commented on a finding, the agent acts like it didn't see the comment in the next round's auto-apply."

2. **The UI has no prior-round surface.** The Conversation tab (`src/ui/review.html:1710`, `src/ui/app.ts:1603`) lists every finding ever made in the session, sorted by round descending (`app.ts:1656-1659`), with a per-entry round badge (`:1765-1767`). But the user can't filter to "only round 2" or "only this round", can't see the prior round's `notes` (which lives only in `round-NNN.md` at `src/index.ts:1808-1819`, never in UI), and the resolved findings are mixed in with the open ones (mitigated only by the 3-status filter at `app.ts:497-506`). A 5-round review produces a Conversation panel with 30+ entries, no way to focus, no way to see "what did I write as notes in round 3" without opening a terminal.

3. **The R3 forward-reference explicitly punted this UI surface to a "future round".** `.omo/round-3/playwright-report.md:15`: "If a future round wants to surface `resolved[]` or `prior_notes` in the UI (e.g., as a 'Previously discussed' panel), that would be a separate Round 4 candidate." And `.omo/round-3/decision.md:73`: "Surfacing `resolved[]` or `prior_notes` as a 'Previously discussed' panel in the UI is a separate Round 4 candidate." The R3 design intent is real, the punt is real, and the work is undone because R3 itself was DESIGN-ONLY.

## Candidates ranked (by user value, top = highest)

### #1 — "Previously discussed" panel in the Conversation tab (R3 forward-reference, re-grounded for current main)

> **As a** developer running round 3+ of `/diff-review-dashboard`
> **I want** a single panel that surfaces prior-round context — the prior rounds' `notes` (read from existing `round-NNN.md` exports) and any prior-round findings (open, resolved, **and their full comment thread**)
> **So that** I can scan "what did I tell the agent last round, and what did the agent say back" in one glance, without opening a terminal or scrolling through 30+ conversation entries.

- **User value**: 5/5. Directly addresses the R3 forward-reference (`playwright-report.md:15`, `decision.md:73`) — a known user need that R3 designed but never shipped. The data already exists in current main: `round-NNN.md` exports (`src/index.ts:1808-1819`) hold prior `notes`; `state.findings[]` (`src/index.ts:74`, `app.ts:1603-1627`) holds every finding with `round`, `comments[]`, `status`, `closed_at`. **No state change required.**
- **File:line evidence (VERIFIED)**: `src/index.ts:1808-1819` (round-NNN.md written each round), `src/index.ts:74` (state.findings[]), `src/ui/app.ts:1603-1712` (renderConversationPanel renders existing findings), `src/ui/review.html:1710` (Conversation tab button), `src/index.ts:21-26` (FindingComment type with `author: "user" | "agent"`), `src/index.ts:43-44` (closed_at / close_reason)
- **What's missing for the user**: no UI element today shows prior-round `notes` or the `comments[]` thread on a prior finding as a single glanceable view. The 3-status filter (open/resolved/all at `app.ts:497-506`) is the closest existing affordance and is sufficient for filtering, but not for surfacing notes or comment threads across rounds.
- **Implementation shape** (PM scope hint, not PM decision): 4th sidebar tab "Previously discussed" (`src/ui/review.html` adds 1 `<button data-tab="previously">` at line 1710-ish), new `renderPreviouslyDiscussedPanel` in `src/ui/app.ts` reading `state.findings[]` (already in `state.existing` at `:1603-1611`) + reading `round-NNN.md` files via a new GET endpoint (`src/index.ts` adds `GET /api/review/${id}/prior-notes` returning the parsed prior `notes` per round). Estimated: 2-3 files (HTML + app.ts + index.ts), ~150 LOC.
- **Scenarios to gate on**: e2e harness adds `previously-discussed-panel` scenario (3 rounds, verify the panel shows round-1 notes + round-2 notes + all comment threads).
- **Dependencies**: none.

### #2 — Filter Conversation panel by round

> **As a** developer in round 4 of a long review (30+ findings across rounds)
> **I want** a round-filter dropdown in the Conversation tab (e.g. "All rounds / Round 1 / Round 2 / Round 3 / Round 4 / Only this round")
> **So that** I can focus on one round's findings without scrolling past everything else.

- **User value**: 4/5. The data is fully present (`entry.round` is set on every entry at `src/ui/app.ts:1608`; the round badge renders at `:1765-1767`; sort already groups by round at `:1656-1659`). The friction is **navigation**, not data. A 1-line dropdown next to the existing `setConversationFilter` (`:497-506`) would unblock multi-round reviews.
- **File:line evidence (VERIFIED)**: `src/ui/app.ts:497-506` (existing `setConversationFilter` pattern), `src/ui/app.ts:1637-1642` (existing 3-status filter logic to extend), `src/ui/app.ts:1656-1659` (existing sort by round descending), `src/ui/app.ts:1765-1767` (existing round badge per entry), `src/ui/review.html:1710` (Conversation tab), `src/ui/app.ts:366-369` (existing `activeTab` + `readStored` pattern in `app.ts:113-115` area)
- **What's missing for the user**: the round is *visible* per entry but not *filterable*. With 4+ rounds and 30+ findings, the panel becomes a wall.
- **Implementation shape**: 1 new `<select>` in `src/ui/review.html` next to the conversation-filter buttons (`:1744` area); new `state.roundFilter: number | "all" | "current"` with `setRoundFilter` mirroring `setConversationFilter`; 1 new persisted localStorage key following the `CONV_FILTER_KEY` pattern at `app.ts:113`. Estimated: 2 files (HTML + app.ts), ~40 LOC.
- **Scenarios to gate on**: e2e harness adds `conversation-round-filter` scenario (3 rounds, select "Round 2 only", verify only round-2 entries render).
- **Dependencies**: none. Can ship independently of #1.
- **Synergy with #1**: if both ship, the "Previously discussed" tab can also respect the round filter. Recommend #1 if the chosen candidate; recommend #2 if a smaller-scope round is preferred.

### #3 — Agent sees prior-round comment thread in the tool's payload (the original R3 user-pain, minimal reimplementation)

> **As a** developer whose `/diff-review-dashboard` auto-apply agent has just fixed a finding that I commented on
> **I want** the next round's tool payload to include the comment thread I wrote AND the resolved findings from prior rounds
> **So that** the agent doesn't re-read `state.json` manually to discover context it should have received in the first place.

- **User value**: 4/5. This is the R3 user pain ("the agent's `format()` strips `comments[]` and filters to `status === 'open'` only, forcing the prompt at `src/index.ts:1336-1341` to instruct the manual state.json read"). The user-visible symptom: "I wrote a comment, the agent's next round didn't see it." A real, sharp, multi-round pain. Bigger than #1 (3 files) but more impactful for users running >2 rounds.
- **File:line evidence (VERIFIED)**: `src/index.ts:415` (filter to `status === "open"` only), `src/index.ts:422-431` (strip `comments[]` from outbound findings map), `src/index.ts:1336-1341` (agent prompt explicitly instructs manual state.json read because the payload is incomplete), `src/index.ts:1358` (Post-Apply Trace comment pattern the agent uses), `src/index.ts:21-26` (FindingComment type — already in main), `src/index.ts:43` (`closed_at` already populated for resolved findings at `:1632`)
- **What's missing for the user**: the `format()` output at `:433-446` returns `notes`, `findings` (open-only, comment-stripped), and `artifacts` — the agent has to do extra tool calls per round to reconstruct what should have been in the payload. The user's wait time per round goes up.
- **Implementation shape**: extend the `findings` map at `src/index.ts:422-431` to include `comments?: FindingComment[]` and `closed_at?: number`; add a new top-level field `resolved: Array<{id, severity, category, file, start_line, end_line, side, comment, comments?, closed_at?}>` sourced from `result.findings.filter(f => f.status === "resolved")`; update the agent prompt at `:1336-1341` to drop the "read state.json manually" instruction. Estimated: 1-2 files (`src/index.ts` + agent prompt at `:1320-1366`), ~60 LOC + 1 new e2e scenario.
- **Caveat from R3's mistake**: R3 tried to ship this AND `state.notes_history` AND `session_id` in the payload — and the design was a good one, but the audit-trail was fabricated. R4 should ship this candidate **in a tight, additive way** (no `notes_history`, no `session_id` change, no `format.test.ts`) to avoid repeating R3's scope inflation. The candidate is small enough to be safely scoped.
- **Scenarios to gate on**: e2e harness adds `payload-includes-comments` (1 round, post 2 comments on a finding, resolve it, run round 2, verify the round-2 payload contains the comments on the resolved finding and on the still-open finding).
- **Dependencies**: none. Can ship independently of #1 and #2.

### #4 — Surface prior-round `notes` in the UI (small, from current exports, no state change)

> **As a** developer in round 3 of a review
> **I want** a small "Previous round notes" badge above the notes textarea in the review drawer that expands to show what I wrote in round 2 and round 1
> **So that** I can reference my prior `notes` ("fix the auth middleware") when writing round 3's `notes` ("and add unit tests for the middleware"), without leaving the review UI.

- **User value**: 3/5. Narrow but high-quality: the data is already in `round-NNN.md` exports (`src/index.ts:1808-1819`) — read it via a new GET endpoint, render a collapsible badge in the drawer. No state change. The user pain is "I forget what I told myself last round."
- **File:line evidence (VERIFIED)**: `src/index.ts:1808-1819` (round-NNN.md written with `notes` per round), `src/index.ts:452-456` (markdown export includes notes via `markdown({notes, ...})`), `src/ui/app.ts:2215` (notes textarea state in UI), `src/ui/review.html:1744-` (drawer area for notes)
- **What's missing for the user**: the notes textarea at `src/ui/app.ts:2215` is empty at round start. The user has no in-UI way to see what they wrote in prior rounds.
- **Implementation shape**: new GET endpoint `/api/review/${id}/prior-notes` in `src/index.ts` reading `round-NNN.md` files in the session dir, parsing the `# Notes` section; new `<details>` element in the review drawer near the notes textarea showing prior rounds' notes (collapsed by default, expandable). Estimated: 2 files (`src/index.ts` + `src/ui/review.html`), ~50 LOC.
- **Scenarios to gate on**: e2e harness adds `drawer-shows-prior-notes` (3 rounds, each with a different `notes` text, open round 3, verify the drawer shows round 1 + round 2 notes).
- **Dependencies**: none. Can ship independently of #1, #2, #3.
- **Overlap with #1**: #1's "Previously discussed" panel subsumes this. If #1 ships, #4 becomes redundant. If #1 doesn't ship, #4 is the smallest viable prior-round surface.

### #5 — Stale backlog: Reopen anchor `end_line` reset (R1+2 follow-up #3)

> **As a** developer who resolved a finding in round 2 and reopens it in round 3 to fix it again
> **I want** the finding's `end_line` (and the anchor's selected region) to reflect the current code, not the round-1 selection
> **So that** when I add a new comment, the anchor matches the code I'm actually pointing at.

- **User value**: 2/5. Real bug carried from R1 (`commit 243ce68`) and R2 (`commit 3f24272`) — when a finding is reopened via `POST /api/review/${id}/reopen` at `src/index.ts:1643-1722`, the `target.closed_at = undefined` is reset (line 1710) but the `end_line` / `anchor.selected` is not re-derived from current code. The user pain is mild but real: a stale anchor can be misleading on the next comment.
- **File:line evidence (VERIFIED)**: `src/index.ts:1643-1722` (reopen handler), `src/index.ts:1709-1711` (resets `updated_at` + `closed_at` only), `src/index.ts:308-345` (reconcile() function which is the natural place to re-derive anchors)
- **What's missing for the user**: the reopened finding's anchor still points at the original (possibly stale) line range. Adding a comment / new finding references stale code.
- **Implementation shape**: call `reconcile()` (`:308`) on the reopened finding, or call `remap()` (`:285-306`) on the finding before un-resolving. Estimated: 1 file (`src/index.ts`), ~15 LOC + 1 new e2e scenario.
- **Note**: this is the R1+2 follow-up candidate, not a fresh user-story. Listed for completeness because it's the highest-value of the 3 stale backlog items. The PM Manager review's previous brief demoted #3-#5 to "considered, not selected" — same disposition here.

## Recommended candidate

**#1 — "Previously discussed" panel in the Conversation tab.**

Rationale:

1. **Directly honors the real R3 forward-reference** (`playwright-report.md:15`, `decision.md:73`) without depending on the fabricated R3 implementation. R3 punted the UI surface to "a future round"; that future round is R4.
2. **No state change.** All data needed (`state.findings[]` with `comments[]`, `round`, `status`, `closed_at`; per-round `notes` in `round-NNN.md` exports) is already in current main. Avoids the R3 scope inflation trap (no `notes_history` field, no `session_id` change, no `format.test.ts`).
3. **Highest user value** of the 4 fresh candidates. The pain is real, sharp, and affects every multi-round review.
4. **Smallest blast radius** for a 4th-tab UI feature: 2-3 files, ~150 LOC, one new e2e scenario.
5. **Profile**: `feature` (PM Manager's v3 auto-classification Rule 2 — U_user_visible=yes + total=5).

If the team prefers the **smaller** recommendation (2-tab scope, lower risk): **#2 — Filter Conversation panel by round.** It's 40 LOC, 2 files, and unblocks multi-round reviews without a new tab.

If the team prefers the **agent-side** recommendation (fixes the auto-apply loop directly): **#3 — Agent sees prior-round comment thread in the tool's payload.** This is the original R3 user-pain re-implemented minimally (no `notes_history`, just `comments[]` + `resolved` in the payload). Risk: re-touching `format()` invites R3's scope inflation.

## Self-Critique

**Did I verify every file:line cite against current main?**

Yes. All 25 file:line citations in this brief were verified against `main` (`870a507`) via `grep -n` / `sed -n` during this PM Triage run. Key verified anchors:

- `src/index.ts:71-79` — `State` type: confirmed `session_id, round, findings, draft?, diff_base?, previous_diff_base?, updated_at` — **NO `notes_history`**
- `src/index.ts:1835-1845` — tool response: confirmed `{ok, round, json_path, md_path}` only — **NO `session_id`, NO `prior_notes`, NO `resolved[]`**
- `src/index.ts:415` — `format()` open-only filter: confirmed
- `src/index.ts:422-431` — `format()` findings map: confirmed drops `comments[]`
- `src/index.ts:1336-1341` — agent prompt manual state.json read: confirmed
- `src/index.ts:1808-1819` — round-NNN.md export: confirmed
- `src/ui/app.ts:1603-1712` — `renderConversationPanel`: confirmed
- `src/ui/app.ts:497-506` — `setConversationFilter` pattern: confirmed
- `src/ui/app.ts:1553-1569` — yellow range-drift banner: confirmed
- `src/ui/review.html:1702, 1706, 1710` — sidebar tabs (Files / Commits / Conversation): confirmed
- `src/index.ts:1929` — `add_review_comment` tool: confirmed
- `src/index.ts:21-26` — FindingComment type: confirmed
- `src/index.ts:308-345` — `reconcile()` function: confirmed
- `src/index.ts:1643-1722` — reopen handler: confirmed

**Did I avoid citing R3's fabricated fields?**

Yes. R3-fabricated items I explicitly did NOT cite as if they exist:

- `state.notes_history` — does not exist in `src/state-store.ts` or `src/index.ts:71-79`. Verified by `grep -r "notes_history" src/` → zero matches.
- `src/format.test.ts` — does not exist. Verified by `ls src/format.test.ts` → ENOENT.
- R3 commit SHAs `57a447a`, `b4bc02e`, `e14c943` — all missing. Verified by `git cat-file -e` returning "Not a valid object name" for all 3.
- Payload fields `session_id`, `prior_notes`, `resolved[]` — do not exist in the current `format()` output at `src/index.ts:433-446`. Only `{round, cancelled, open_count, by_severity, by_category, notes, findings, artifacts}` is returned. The actual on-the-wire response at `:1835-1845` is `{ok, round, json_path, md_path}` only.

The R3 forward-references I DID cite (with their real locations) are:

- `.omo/round-3/playwright-report.md:15` — "If a future round wants to surface `resolved[]` or `prior_notes` in the UI (e.g., as a 'Previously discussed' panel), that would be a separate Round 4 candidate."
- `.omo/round-3/decision.md:73` — "Surfacing `resolved[]` or `prior_notes` as a 'Previously discussed' panel in the UI is a separate Round 4 candidate."

Both are valid as USER PAIN anchors for candidate #1, but the implementation must be re-framed for the current `main` (no R3 payload fields to surface — surface the data that's actually in `state.findings[]` + `round-NNN.md`).

**Are any candidates stale backlog (R1-3 follow_up_candidates)?**

Yes, candidate #5 is the stale R1+2 follow-up #3 ("Reopen anchor `end_line`"). Per the PM Manager review's previous-brief guidance, demoted to "considered, not selected" with a 1-sentence rationale (low user value, real bug, not a fresh user-story).

The R1+2 follow-ups #4 (E2E coverage gap for `add_review_comment` flow) and #5 (take-screenshots.mjs dead code) are not listed as candidates — they are dev-only and not user-stories. The R3 `follow_up_candidates` ("Round 4 PM triage — surface a fresh user-story not in Round 1-3 backlog") is honored by candidates #1, #2, #3, #4.

**Did I satisfy the backlog-freshness gate (commit 961345d)?**

Yes. Of the 5 candidates listed, 4 (#1, #2, #3, #4) are fresh user-stories derived from self-investigation of the current `main` code + the real R3 forward-reference. Only #5 is a stale R1+2 backlog carry-over. The user prompt is empty (`<user_message>` is blank in the lead's task brief), and `gh issue list --state open --limit 30` returns `[]`, so self-investigation was the only signal source.

**Did I avoid ranking by "severity" or "bug-ness"?**

Yes. All 4 fresh candidates are **features**, ranked by user value (5/5 → 3/5). Candidate #5 is the only bugfix and is listed last with a low user-value score. Profile is `feature` for #1-#4 and `bugfix` for #5 (per the per-round auto-classification, candidate #5 alone would trigger `bugfix` profile; the others trigger `feature` profile).

## User-impact profile

Per the v3 PM-as-user-story-advocate schema (commit `f928f6e`), each candidate is scored 0-2 (yes=2, no=0) on 8 dimensions. `U_size` and `U_files` are gradations.

### Candidate #1 — "Previously discussed" panel

| Dimension | Score | Notes |
|---|---|---|
| U_size | medium (3-6) | ~150 LOC across 3 files (HTML button + app.ts render + index.ts GET endpoint) |
| U_files | small (2-3) | `src/ui/review.html`, `src/ui/app.ts`, `src/index.ts` |
| U_new_capability | 2 (yes) | 4th sidebar tab; new GET endpoint; new render fn |
| U_behavior_shift | 2 (yes) | Users can now filter to "previously discussed" mode without leaving the review |
| U_user_visible | 2 (yes) | New visible tab + new panel |
| U_data_shape_breaking | 0 (no) | No state schema change; reads existing `state.findings[]` and existing `round-NNN.md` files |
| U_data_safety | 2 (yes) | Read-only on `state.json` and `round-NNN.md`; no writes |
| U_installs_new_dep | 0 (no) | Pure addition to existing stack |
| **recommended_profile** | **feature** | U_user_visible=yes + total=8 → Rule 2 (feature) |

### Candidate #2 — Filter Conversation panel by round

| Dimension | Score | Notes |
|---|---|---|
| U_size | small (1-2) | ~40 LOC across 2 files |
| U_files | narrow (1) | `src/ui/review.html` (1 new `<select>`), `src/ui/app.ts` (1 new `setRoundFilter`) |
| U_new_capability | 2 (yes) | New filter dimension (round) on the existing Conversation panel |
| U_behavior_shift | 0 (no) | No change to the existing data model; just an additional filter |
| U_user_visible | 2 (yes) | New dropdown in the existing tab |
| U_data_shape_breaking | 0 (no) | Pure localStorage addition |
| U_data_safety | 2 (yes) | localStorage only |
| U_installs_new_dep | 0 (no) | Pure addition |
| **recommended_profile** | **feature** | U_user_visible=yes + total=6 → Rule 2 (feature) |

### Candidate #3 — Agent sees prior-round comment thread in tool payload

| Dimension | Score | Notes |
|---|---|---|
| U_size | small-medium (2-4) | ~60 LOC + 1 e2e scenario |
| U_files | narrow-small (1-2) | `src/index.ts` (format() + agent prompt at `:1320-1366`) |
| U_new_capability | 2 (yes) | New `resolved` array in payload; `comments[]` on findings |
| U_behavior_shift | 2 (yes) | Agent's auto-apply loop no longer needs manual state.json read; user sees faster round-N+1 |
| U_user_visible | 2 (yes) | Visible via the agent's reduced wait time + improved context awareness |
| U_data_shape_breaking | 0 (no) | Additive only (new fields on existing payload shape) |
| U_data_safety | 2 (yes) | Read-only on `state.findings[]` and `state.notes` |
| U_installs_new_dep | 0 (no) | Pure addition |
| **recommended_profile** | **feature** | U_user_visible=yes + total=8 → Rule 2 (feature) |

### Candidate #4 — Surface prior-round `notes` in the UI (no state change)

| Dimension | Score | Notes |
|---|---|---|
| U_size | small (1-2) | ~50 LOC across 2 files |
| U_files | narrow (1) | `src/index.ts` (new GET endpoint), `src/ui/review.html` (1 new `<details>` element near notes textarea) |
| U_new_capability | 2 (yes) | Prior notes visible in the review drawer |
| U_behavior_shift | 2 (yes) | User can reference prior `notes` when writing current `notes` |
| U_user_visible | 2 (yes) | New badge / collapsible element in the drawer |
| U_data_shape_breaking | 0 (no) | No state change; reads existing `round-NNN.md` files |
| U_data_safety | 2 (yes) | Read-only on `round-NNN.md` |
| U_installs_new_dep | 0 (no) | Pure addition |
| **recommended_profile** | **feature** | U_user_visible=yes + total=8 → Rule 2 (feature) |

### Candidate #5 — Stale backlog #3: Reopen anchor `end_line` reset

| Dimension | Score | Notes |
|---|---|---|
| U_size | small (1) | ~15 LOC, 1 file |
| U_files | narrow (1) | `src/index.ts` (reopen handler at `:1643-1722` + reconcile at `:308`) |
| U_new_capability | 0 (no) | Bug fix only |
| U_behavior_shift | 0 (no) | Existing reopen flow already exists; this is a correctness fix |
| U_user_visible | 2 (yes) | User sees the finding's anchor re-derive to current code |
| U_data_shape_breaking | 0 (no) | No state shape change |
| U_data_safety | 2 (yes) | State-mutating only on the reopened finding |
| U_installs_new_dep | 0 (no) | Pure fix |
| **recommended_profile** | **bugfix** | U_user_visible=yes + total=4 → Rule 1 (bugfix). Listed for completeness, not recommended. |

## Profile recommendation

**Profile: `feature` (Rule 2 — U_user_visible=yes + total=8 across recommended candidate #1's dimensions).**

Sub-rule clarifications:
- Not a bugfix (no production incident, no test failure, no defect report).
- Not architecture (no schema change, no module boundary change, no public API redesign). The recommended candidate #1 is additive UI + additive GET endpoint, both small.
- U_user_visible=yes is the dominant signal: the entire user pain is "I can't see prior-round context in the UI."

## Skill updates

Per the R3 retro lineage (commits `961345d` + `870a507`):

- **Inherited from R3 retro (commit 961345d)** — 4 skill patches remain valid as design lessons and will be exercised in R4:
  1. **Worktree path templating** — R4 dev work happens in a worktree (default per `.omo/run-continuation`); the `worktree` path is templated into the dev prompt
  2. **Multi-round AC test design** — R4's candidate #1 spans the conversation panel + state.findings + round-NNN.md exports; AC tests must verify all 3 sources, not just the UI
  3. **Lead-takeover defaulting** — Per the per-phase default executor from `961345d`: 3b Tester Diff lead-by-default, 3c Playwright subagent for UI-heavy, 4/4.5/patches/audit lead-always. R4's profile is `feature` (UI-heavy), so 3c Playwright subagent is the default; lead takes over only if Playwright MCP is unavailable
  4. **Backlog-freshness gate** — Honored in this brief: 4 of 5 candidates are fresh from self-investigation, not from R1-3 follow_up_candidates

- **Inherited from this commit (870a507)** — 1 skill patch:
  5. **Audit-trail integrity note** — R3 audit-trail files marked DESIGN-ONLY. R4 PM Triage was re-run with the integrity note as priority-1 context. R4's brief must similarly be re-validated if any R3-code claim is cited. **R4 will add the same status-notice pattern to the R4 audit-trail if R4 itself becomes a candidate for invalidation** (e.g. if R4's chosen-candidate's AC trace references code that doesn't ship).

- **Inherited from R3 retro (R3 line numbers, per `b549e3d`)** — 2 additional lessons for R4:
  6. **U_user_visible sharpened** — R4's PM Triage explicitly uses U_user_visible=yes as the dominant signal for `feature` profile, per the v3 PM-as-user-story-advocate schema
  7. **Harness limitation section** — R4's test report must include a "Harness limitation" section if the e2e harness cannot fully exercise the chosen candidate (e.g. for #1, the prior-notes endpoint needs round-NNN.md fixture files; for #3, the new `resolved` field needs a 2-round scenario)

No new skill updates are required from R4 PM Triage — the existing 7 patches are sufficient. If R4 ships a `feature` profile, the 3c Playwright subagent default is exercised; if R4 ships a `bugfix` profile (e.g. candidate #5), the 3b Tester Diff lead-by-default is exercised. R4 does not need a new skill patch.
