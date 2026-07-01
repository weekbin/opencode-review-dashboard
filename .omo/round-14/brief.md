# PM Brief — Round 14

> **Lead-synthesized brief** (R13 autonomous run established lead-direct pattern; saves 17-min PM Triage subagent round-trip; consistent with R12 retro Gap #1 "Honesty > coverage")

## Title
R14 — Complete the R13 deferred bundle (sort findings + filter previously-discussed by round + draft auto-save indicator)

## Source
- Lead-synthesized (autonomous R14 run per user directive `自主决策，run 2 round`)
- Backlog from R13 PM Triage (.omo/round-13/brief.md) + R13 Planner's excluded bottom-3
- Round 13 retro (TBD, see `# Note` below)

## User pain
After shipping R12 (★ Pinned / Reactions / Keyboard nav) + R13 (★ Resolve-with-reason / Mark-wontfix / In-diff search), users reviewing 20+ findings still face three friction points that R13 didn't address:
1. **No way to sort findings by priority** — chronological-only order forces reviewers to scroll through high/medium/low in sequence. GitHub PR / Phabricator / Linear all offer sort dropdowns.
2. **Cannot filter Previously-discussed by round number** — once a session has 5+ rounds, scrolling the 4th sidebar tab is painful. GitHub PR "Hide older reviews" + GitLab MR activity filter + Phabricator date-range filter all address this.
3. **No "Saved X ago" indicator for draft state** — current "Draft saved at HH:MM:SS" toast is intrusive; modern editors (Google Docs / Notion / VS Code Modified-dot) use persistent subtle indicators.

## Competitor analysis (v5 — mandatory)

| Tool | Core capability | opencode-review-dashboard R13 | R14 candidate |
|---|---|---|---|
| GitHub PR | Inline comments, suggested changes, draft review, `<finding>`-level reactions, file-finder `t`, "Save for later", "Hide older reviews", sort by Newest/Oldest, submission modal | Has: inline findings + multi-round review + reactions + Pinned + Resolve-with-reason + In-diff search | Sort + filter previously-discussed — DIRECT competitor gap |
| GitLab MR | Approvals, multi-reviewer, MR rules, **MR activity filter** (Show all activity / Comments only / History only), thread resolution with reason, draft review | Has: single-user local review + auto-apply + same-thread reason flow | Same |
| Gerrit | Code review voting, patch sets, **:comment/:path/:file cross-file search**, `Abandon Revision` action | Has: in-diff search (R13) + abandon equivalents via Mark-wontfix (R13) | Same |
| Phabricator | Differential, audit trail, herald rules, **sort by Author/Activity**, **Abandon** action, star revisions, in-line browser Find | Has: resolve-with-reason + wontfix (R13) + in-diff search (R13) | Same |
| Linear | Issues, sort by `Status/Priority/Last created/Last updated`, filter by date range | Has: 5 Conversation-tab filter chips (R8 + R12/R13 expanded) | Sort + filter — DIRECT gap |
| VS Code | `Ctrl+F` in-diff search, Explorer **Sort By** modes (`Modified date`, `Name`, `Type`), outline Sort, `Modified` dot | Has: in-diff `Ctrl+F` (R13) + no sort dot for conversations | Sort — DIRECT gap |
| Sourcetree / GitKraken | Visual diff, no review; filter "Show all / file types" | Partial: no review surface | Minor reference |
| Google Docs / Notion / Figma | "Saved X ago" persistent indicator in header; auto-save UX | Has: intrusive toast | Draft auto-save indicator — DIRECT gap |

**R14 closes 3 remaining gaps that R12 + R13 did not (deliberately deferred to leave feature ≤ 3 headroom; planner top-3 was the highest-value 3)**.

## Candidates ranked (3 user-stories, all gate-pass)

### Candidate #1: ★ Sort findings by severity / file / created_at
**★ user-pick recommended**

> **As a** reviewer working through 20+ findings,
> **I want** to sort the Conversation panel by severity (high → medium → low), or by file, or by created_at,
> **So that** I can prioritize the critical-issues view OR group by file for batch decisions, instead of scrolling chronologically.

**Product-value gate 3-test**:
- Test 1 (README 缺段 YES) — `README.md` "Other shipped features" doesn't currently mention a sort dropdown; a bullet would fit in section L62-65.
- Test 2 (non-developer visible YES) — Conversation panel sort dropdown = visible UI
- Test 3 (competitor has YES) — GitHub PR Sort by Newest/Oldest + Phabricator sort by Author/Activity + Linear multiple Ordering properties.

**File:line evidence**:
- Conversation panel rendering: `src/ui/app.ts:2230-2270` (`renderConversationPanel`)
- Filter chips toolbar: `src/ui/review.html:2208-2224` (existing 5 filter chips — append "★ Sort" dropdown next to them)
- `state.existing_findings` array: `src/index.ts:2008-2056` (sort reducer opportunity)
- `Finding` fields available for sort: `severity`, `file`, `created_at`, `updated_at`, `category` (`src/index.ts:50-90`)

**Competitor docs verified** (per `.omo/round-13/competitor-landscape.md`):
- GitHub blog "Sorting pull request reviews" — NEWEST FIRST / OLDEST FIRST dropdown
- Linear docs "Display Options" — multiple Order properties (Status, Priority, Last created, Manual)
- VS Code UI docs Explorer Sort — Modified date / Name / Type / Size

**LOC estimate**: ~60-100 LOC across 2 files (UI dropdown + reducer)

---

### Candidate #2: Filter Previously-discussed by round
**#2 pick**

> **As a** reviewer with a 5+ round review session,
> **I want** to filter the "Previously discussed" tab by round number (e.g., only show round 2-4),
> **So that** I can focus on recent context instead of scrolling through 30+ prior findings.

**Product-value gate 3-test**:
- Test 1 (README 缺段 YES) — `README.md` "Other shipped features" doesn't mention a round filter; new bullet would fit.
- Test 2 (non-dev visible YES) — A new chip in Previously-discussed tab filter row.
- Test 3 (competitor has YES) — GitHub PR "Hide older reviews" + GitLab MR activity filter + Phabricator date-range filter.

**File:line evidence**:
- Render function: `src/ui/app.ts:2943` (`renderPreviouslyDiscussedPanel`)
- Filter state location: add `state.previouslyFilterByRound?: number` to `src/index.ts:50-74`
- Existing chip pattern: `src/ui/review.html:2208-2224` (mirror for round-filter chip)

**LOC estimate**: ~55-85 LOC across 1-2 files

---

### Candidate #3: Draft auto-save indicator (persistent "Saved X ago")
**#3 pick (lightest polish)**

> **As a** reviewer writing notes for 5+ minutes,
> **I want** a persistent "Saved X seconds ago" indicator in the header instead of an intrusive toast notification,
> **So that** I can glance at the draft state without losing focus on my writing — modern editors all use this pattern.

**Product-value gate 3-test**:
- Test 1 (README 缺段 YES) — minor polish; could fit under existing "Other shipped features" without dedicated section.
- Test 2 (non-dev visible YES) — Indicator in header next to draft state.
- Test 3 (competitor has YES) — Google Docs "All changes saved in Drive" indicator + Notion "All changes saved" + VS Code Modified-dot pattern.

**File:line evidence**:
- Draft save flow: `src/ui/app.ts:3725-3740` (`scheduleSave` calls `setStatus("Draft saved at HH:MM:SS")`)
- Header rendering: `src/ui/app.ts` top banner area
- Mirror pattern: Google Docs status indicator (9to5Google 2020 + nerdtechy + intelligencepartner 2020 = 3+ sources)

**LOC estimate**: ~45-75 LOC across 1 file

---

## Recommended candidate
**Candidate #1 (Sort findings)** — highest user-value × closing-gap, mirrors GitHub / Linear / Phabricator patterns that all real review tools ship. Recommended bundle: all 3 candidates (#1 + #2 + #3, exactly hits feature ≤ 3 cap with 0 headroom, matches R12/R13 density pattern).

## Self-Critique
- **Honest disclosure**: All 3 candidates were deferred from R13's bottom-of-composite-ranking pool (R13 shipped ★In-diff-search + Resolve-with-reason + Mark-wontfix). User either accepts this bundle OR may want different R14 priorities.
- **Composability**: All 3 features are orthogonal — Sort doesn't depend on Filter which doesn't depend on Auto-save indicator. They can ship in any order.
- **Risk**: All 3 are feature-profile, all additive, no schema break, no new dep.
- **No user-rejected carry-forwards**: #12 Bulk actions (aged_rounds=5) + #13 Live file-watcher (aged_rounds=5) remain user-rejected per R12/R13 user hint. R14 does NOT touch these.
- **No multi-round ACs**: All 3 are simple UI affordances verifiable in a single round.

## User-impact profile (U_* fields)

Per candidate U_* aggregation:

| Signal | #1 Sort | #2 Filter Previously | #3 Auto-save |
|---|---|---|---|
| U_size | small (1-2 files) | small (1-2 files) | small (1 file) |
| U_files | small (2-3) | small (2-3) | small (1-2) |
| U_new_capability | yes | yes | yes (UX change) |
| U_behavior_shift | no (sort is reorder of existing data) | no | no |
| U_user_visible | yes | yes | yes |
| U_data_shape_breaking | no | no | no |
| U_data_safety | no | no | no (auto-save is read-only state) |
| U_installs_new_dep | no | no | no |

Per-feature totals (each in 5-7 range, all feature profile).

## Profile recommendation
**feature** — Rule 2 fires for all 3 (U_user_visible=yes, total ≥ 3). Rule 1 doesn't fire (no U_behavior_shift / U_data_shape_breaking / U_installs_new_dep). Per-profile Dev timeout **30 min** per R9 retro Gap L.

# Note

This brief was written directly by the lead (not by a PM Triage subagent) to optimize the v5 loop's wall-time — per R12 retro Gap #1 ("Honesty > coverage") + R13 retro lead-takes-over-PM-Triage pattern. If you'd prefer a fresh PM Triage subagent run for R14 (similar to R13's 17-min wall-time), let me know and I'll fire one. Otherwise continuing with R14's 3-feature bundle autonomously.
