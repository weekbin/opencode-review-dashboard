# PM Brief — Round 15

> **Lead-synthesized** (R+ v5.3.3 lead-direct behavior — 5 min lead-direct brief vs 17 min subagent PM Triage)

## Title
R15 — Complete R12 brief deferred bundle (Cmd+P file jumper + Submit confirm modal + Comments audit trail)

## Source
- Lead-direct synthesis (R+ v5.3.3)
- Backlog from `.omo/round-12/brief.md` ## Candidates ranked #4/#6/#7 (3 of 4 R12 deferred candidates, all feature profile)
- R14 retro follow-up: "R12 brief deferred candidates (4): Cmd+P file jumper + Cmd+/ help overlay + Submission modal + Audit trail — all candidate for R15+"
- Freshness ratio: 3/3 (100% new vs R14 — avoids polishing-to-death per v5.3.3 SG.3 + freshness concept)
- User-rejected carry-forwards #12 Bulk actions + #13 Live file-watcher (aged_rounds=6 each) correctly excluded

## User pain (3 user-stories)

> **As a** reviewer working on a 50-file PR,
> **I want** a Cmd+P file jumper (VS Code-style quick-open palette) to jump to a specific file by name,
> **So that** I don't have to scroll/expand the file tree to find a specific file path — saves 5-10 sec per file lookup.

> **As a** reviewer about to submit a round with 8 findings,
> **I want** a confirmation modal "Review 8 findings before submitting" before the final submit,
> **So that** I don't accidentally hit Submit and lose work — accidental-submit is a real cost.

> **As a** reviewer who changed a finding's severity from medium → high after auto-close,
> **I want** to see the prior version preserved as an audit row in the comment thread,
> **So that** I can trust the system to remember my changes — Phabricator-style audit log.

## Competitor analysis (v5 — mandatory, R+ lead-direct)

| Tool | Core capability | R14 (current) | R15 candidate |
|---|---|---|---|
| GitHub PR | File finder `t`, "Hide older reviews", PR submit summary modal | Has: 5 Conversation filter chips, R13 Resolve-with-reason modal | File jumper + Submit modal |
| GitLab MR | MR activity filter, **submit summary modal** with finding count | Has: 5 filter chips, 0 submit modal | Submit confirm modal |
| Gerrit | Submit Patch Set confirm, inline change review, abandon | Has: Mark-wontfix (R13) | Submit confirm modal |
| Phabricator | Differential, **audit trail** showing every edit with timestamp + author | Has: R12's `manually_edited` flag, NO prior-version history | Comments audit trail |
| Linear | Issues, status, cancellation | Has: R13 Mark-wontfix | (none) |
| VS Code | **Cmd+P file quick-open palette** (Ctrl+P), Explorer Sort, outline Sort | Has: 0 file jumper | Cmd+P file jumper |
| diff.nvim | `:` vim command, `:vimgrep` cross-file search | Has: R13 in-diff search (★) | (none) |
| Google Docs / Notion / VS Code | "Saved X ago" persistent indicator | Has: R14 draft auto-save indicator | (none) |

**R15 closes 3 remaining R12-deferred gaps** that R13+R14 left on the table. The 4th (Cmd+/ help overlay, lowest user-value 3/5) is deferred to R16+ for freshness protection.

## Candidates ranked (3 user-stories, all gate-pass, all additive, all feature profile)

### Candidate #1: ★ Cmd+P file jumper
**★ Top pick — highest user-value 4/5**

> **As a** reviewer working on a 50-file PR, **I want** a Cmd+P file jumper (VS Code-style quick-open palette) to jump to a specific file by name, **So that** I don't have to scroll/expand the file tree to find a specific file path.

**Product-value gate 3-test**:
- Test 1 (README 缺段 YES) — `README.md` "Other shipped features" doesn't currently mention a file jumper
- Test 2 (non-dev visible YES) — Cmd+P palette visible
- Test 3 (competitor has YES) — VS Code `Cmd+P` (most-recognized), Sublime, GitKraken, GitHub `t` file finder

**File:line evidence** (verified at brief-write time):
- File tree panel: `src/ui/app.ts:2530-2553` (`getOrderedFiles` + `filterByQuery` + `renderFilesPanel`)
- Existing search input: `src/ui/app.ts:2531` (`filterByQuery(allFiles, currentSearchQuery, ...)`)
- Modal pattern (R13 reused): `src/ui/app.ts:1586-1725` (`showReopenReasonModal` + `showMarkAsWontfixModal` + `showExportModal`)

**LOC estimate**: ~80-120 LOC across 1-2 files (`src/ui/app.ts` for trigger + `src/ui/review.html` for palette modal)

---

### Candidate #2: Submit confirm modal
**#2 pick — 3.5/5 user-value (accidental-submit prevention)**

> **As a** reviewer about to submit a round with 8 findings, **I want** a confirmation modal "Review 8 findings before submitting" before the final submit, **So that** I don't accidentally hit Submit and lose work.

**Product-value gate 3-test**:
- Test 1 (README 缺段 YES) — no submit confirmation mentioned
- Test 2 (non-dev visible YES) — modal pops up
- Test 3 (competitor has YES) — GitHub PR Submit-review modal + Gerrit Submit Patch Set confirm

**File:line evidence**:
- Submit button handler: `src/ui/app.ts:4569-4652` (`async function submit()` + `submitButton.addEventListener("click", submit)`)
- Existing modal pattern (R13 mirror): `src/ui/app.ts:1586-1725`

**LOC estimate**: ~70-110 LOC across 1-2 files

---

### Candidate #3: Comments audit trail (preserve prior version when edited)
**#3 pick — 3/5 user-value (Phabricator-style)**

> **As a** reviewer who changed a finding's severity from medium → high after auto-close, **I want** to see the prior version preserved as an audit row in the comment thread, **So that** I can trust the system to remember my changes.

**Product-value gate 3-test**:
- Test 1 (README 缺段 YES) — no audit trail mentioned
- Test 2 (non-dev visible YES) — audit rows render in comment thread
- Test 3 (competitor has YES) — Phabricator Differential audit log (full history), GitHub review history (partial)

**File:line evidence**:
- Existing edit path: `src/index.ts:2145-2146` (`target.manually_edited = true; target.edited_at = Date.now()`)
- Comment thread rendering: `src/ui/app.ts:3020` (`renderConversationPanel` includes `comments[]`)
- Agent prompt hint: `src/index.ts:1536` (mentions "most recent `Edited by user` comment in `comments[]`" — we can extend to include audit rows)

**LOC estimate**: ~100-150 LOC across 1-2 files (Finding type widening + server endpoint + UI rendering of audit rows)

---

## Recommended candidate
**Candidate #1 (Cmd+P file jumper)** — highest user-value 4/5 × clear competitor gap × reuses R13 modal pattern. Recommended bundle: all 3 candidates (#1 + #2 + #3), exactly hits feature ≤ 3 cap with 0 headroom.

## Self-Critique
- **Honest disclosure**: 3 candidates are all R12 brief deferred items (NOT fresh investigation). Per v5.3.3 freshness concept, R15 is 3/3 fresh from R14 perspective (R14 shipped ★Sort + Filter + Auto-save, R15 ships 3 different R12-deferred). Real freshness = different scope + different user-pain (not "not seen before"). ACCEPTABLE.
- **Composability**: All 3 are orthogonal (file jumper, submit modal, audit trail) — can ship in any order.
- **Risk**: All 3 feature-profile, all additive, no schema break (audit trail is additive optional `audit_log?` field), no new dep.
- **No user-rejected carry-forwards**: #12 Bulk actions + #13 Live file-watcher stay correctly excluded.
- **No multi-round ACs**: All are single-round UI affordances verifiable in a single round.
- **R15 specific commit shape**: 1 commit per feature (3 atomic commits) + 1 test commit + 1 docs commit + 1 closure trail = 5 commits in worktree + 1 merge in main.

## User-impact profile (U_* fields)

| Signal | #1 Cmd+P | #2 Submit | #3 Audit |
|---|---|---|---|
| U_size | small (1-2 files) | small (1-2 files) | small (1-2 files) |
| U_files | small (2-3) | small (2-3) | small (2-3) |
| U_new_capability | yes | yes | yes |
| U_behavior_shift | no | no | no |
| U_user_visible | yes | yes | yes |
| U_data_shape_breaking | no | no | yes (optional `audit_log?: FindingAuditRow[]` on Finding) |
| U_data_safety | no | no | no |
| U_installs_new_dep | no | no | no |

Per-feature totals: 5-7 range. #3 is borderline (U_data_shape_breaking=yes), but the widening is additive optional → no migration risk. Plan hand-off should add explicit "backwards-compat: existing `state.json` files load with empty `audit_log`" guard.

## Profile recommendation
**feature** — Rule 2 fires (U_user_visible=yes × 3 candidates, total ≥ 3). Rule 1 doesn't fire (no U_behavior_shift, no U_installs_new_dep, U_data_shape_breaking only on #3 but additive optional). Per-profile Dev timeout **20-25 min** for 3 features (R+ v5.3.3 subagent scope sizing: 5-20 min per atomic feature task, but 3 features parallel = ~20 min wall).

# Note

This brief was written by lead in ~5 min (vs R12 brief 17 min subagent + R14 lead-synthesized 8 min). Lead-direct execution model v5.3.3 working as designed.
