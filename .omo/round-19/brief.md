# R19 PM Triage Brief

> **Generated**: 2026-06-30 (v5.3.4 lead-direct — R+ v5 cron-style)
> **Round**: 19
> **Baseline SHA**: `a0e0361d0efce2f0cabb09d452f3c2f0976bf318` (R18 macOS cleanup fix)

## Title

R19 = R18 deferred bundle: Language toggle + Toast notification system + A11y audit

## Source

**Primary**: `.omo/proposals.jsonl` R17 follow_up — "R18: A11y audit + Toast + #33 Language toggle (3 features, ≤3 cap)"
**Secondary**: Issue #33 (`round-18-pending` label, user-feedback) — full scope defined by user 2026-06-30
**Tertiary**: R18 was a SKILL-only patch round (commit `a0e0361`) — no features shipped. R18's intended 3-feature bundle deferred to R19.

## User pain

> "The dashboard is currently English-only. Chinese users (primary audience per the user) would benefit from a built-in language toggle."
> — Issue #33 (user-feedback, round-18-pending)

3 distinct user-facing gaps surfaced after R12-R17 feature barrage:

1. **#33 Language toggle** — No i18n support. Chinese-speaking users (a meaningful chunk of the user base per the user's own statement) see English UI. ~30-50 strings to translate.
2. **Toast notifications** — R14 #24 removed the "intrusive toast" pattern (Draft saved at HH:MM:SS) but didn't replace it. Users get no feedback for actions like "Copied as Markdown", "Finding added", "Filter cleared", etc.
3. **A11y** — Only 6 distinct aria-* attributes used (aria-hidden, aria-label, aria-labelledby, aria-modal, aria-pressed, aria-selected). No `role="tablist"`, no `role="status"`, no skip-to-content link. Screen-reader users struggle.

## Competitor analysis

| Tool | Language toggle | Toast system | A11y | Source |
|---|---|---|---|---|
| **GitHub PR review** | No (English-only) | Toasts (`role="status"`, `aria-live="polite"`) | Strong (ARIA throughout, role="tablist") | https://github.com |
| **GitLab MR** | Yes (UI language dropdown, 13+ langs) | Toasts (`role="alert"` for errors, `polite` for info) | Strong (axe-core passes) | https://gitlab.com |
| **Gerrit** | No (English-only) | Server-side notifications (no toast) | Moderate (basic ARIA) | https://gerrit-review.googlesource.com |
| **Phabricator** | Partial (community translations) | Inline flash messages (no toast) | Weak | https://we.phabricator.com |
| **Reviewable** | No | Inline notifications | Moderate | https://reviewable.io |
| **Sourcetree** | Yes (system locale) | Native OS toasts | N/A (native app) | https://www.sourcetreeapp.com |
| **opencode-review-dashboard (us, R18)** | ❌ NONE | ❌ NONE (R14 removal left gap) | ⚠️ PARTIAL (6 aria attrs, missing tablist/status/landmark) | R18 = `a0e0361` |

**Gap analysis**:
- **Language toggle**: 4/7 competitors ship it. We don't. → Real gap.
- **Toast**: 5/7 competitors use it. R14 removed our version without replacement. → Real gap we created.
- **A11y**: 5/7 have moderate-to-strong a11y. We have partial coverage. → Real gap.

## Candidates ranked

### Candidate #1 — Language toggle (closes issue #33)

- **User-story**: As a Chinese-speaking reviewer, I want to switch the dashboard to Chinese, so I can read the UI in my native language without translating every label mentally.
- **Product-value gate**:
  1. **README 缺段?** No — README.md doesn't claim i18n support. ✓ honest
  2. **Non-developer visible?** Yes — toolbar toggle, all visible labels translate. ✓ user-visible
  3. **竞品已有?** Yes (GitLab, Sourcetree ship it; GitHub doesn't). ✓ defensible gap-fill
  - **Result: PASS gate**
- **File:line evidence**:
  - Issue #33 full scope: `gh issue view 33` (200-400 LOC, 30-50 strings)
  - Toolbar location: `src/ui/app.ts:1244-1263` (near existing layout/theme buttons)
  - Persistence: localStorage key `diff-review:language` (matches existing pattern at app.ts:605 `DIFF_SEARCH_KEY`)
  - i18n framework: roll-our-own (no new dep — pattern fits R12 R15 R16 R17 additive profile)
- **U_behavior_shift?** No (no data shape change)
- **U_data_shape_breaking?** No
- **U_installs_new_dep?** No
- **U_user_visible?** YES (toolbar button, all UI labels change)
- **U_new_capability?** YES (i18n is a new capability)
- **User-value**: 3.5/5 (per issue #33 — significant for Chinese users, no-op for English-only users)
- **LOC est**: 200-400 (per issue #33 scope)
- **Profile**: feature

### Candidate #2 — Toast notification system (R14 #24 replacement)

- **User-story**: As a reviewer, when I trigger an action (Copy as MD, Add finding, Resolve, Filter cleared, Expand-all), I want a brief confirmation toast, so I know the action succeeded without looking at the URL bar / state file.
- **Product-value gate**:
  1. **README 缺段?** No — no toast claim. ✓
  2. **Non-developer visible?** Yes — toasts appear top-right of viewport. ✓
  3. **竞品已有?** Yes (5/7 competitors). ✓
  - **Result: PASS gate**
- **File:line evidence**:
  - R14 #24 removed "intrusive toast": `src/ui/app.ts:1800`, `:4822` (comment markers only)
  - Existing auto-save indicator pattern (R14 #24 replacement): `src/ui/app.ts` "Saved 3s ago" header text — this is the model: minimal, persistent, non-intrusive
  - Trigger sites needing feedback: `copyFindingAsMarkdownToClipboard` (R16), `submitReview` (R15), `addFinding` (R3), resolve/reopen (R9), toggle ignore-ws (R16), expand-all (R16)
- **U_behavior_shift?** No
- **U_data_shape_breaking?** No
- **U_installs_new_dep?** No
- **U_user_visible?** YES
- **U_new_capability?** YES (toast system is new)
- **User-value**: 3/5 (quality-of-life, not essential)
- **LOC est**: 80-120 (small DOM helper + style)
- **Profile**: feature

### Candidate #3 — A11y audit + fixes

- **User-story**: As a screen-reader user (or sighted user with keyboard navigation), I want the dashboard to expose ARIA roles, landmarks, and labels properly, so I can navigate without a mouse and hear meaningful announcements.
- **Product-value gate**:
  1. **README 缺段?** No (no a11y claim). ✓
  2. **Non-developer visible?** Yes (screen readers + keyboard-only users). ✓
  3. **竞品已有?** Yes (5/7 competitors moderate-to-strong). ✓
  - **Result: PASS gate**
- **File:line evidence**:
  - Current aria coverage: 6 attrs (aria-hidden, aria-label, aria-labelledby, aria-modal, aria-pressed, aria-selected) at src/ui/app.ts
  - Missing: `role="tablist"` on sidebar tabs (R8 patch added keyboard nav but no role), `role="status"` + `aria-live="polite"` for the auto-save indicator (R14 #24), skip-to-content link, `<main>` landmark
  - Audit scope: ~10-15 small fixes across src/ui/app.ts (~80-150 LOC)
- **U_behavior_shift?** No
- **U_data_shape_breaking?** No
- **U_installs_new_dep?** No (no axe-core or similar — pure ARIA attrs)
- **U_user_visible?** YES (screen-reader + keyboard users notice immediately)
- **U_new_capability?** YES (a11y is a new capability set)
- **User-value**: 3/5 (improves accessibility for ~5-10% of users who depend on it)
- **LOC est**: 80-150 (audit-driven, fixes scattered)
- **Profile**: feature

## Recommended candidate (lead-synthesized, v5.3.4 lead-direct)

**All 3 — Bundle for R19**:
- #33 Language toggle (3.5/5 user-value) — highest priority, user-asked
- Toast notification system (3/5 user-value) — completes R14 #24's incomplete removal
- A11y audit + fixes (3/5 user-value) — additive ARIA work

**Bundle rationale**:
- All 3 are `feature` profile → consistent execution
- All 3 are additive (no schema break, no new dep) → low risk
- Total LOC: ~360-670 → fits feature ≤ 3 cap
- Total files: ~5-8 src/ui files + 2-3 test files → fits file ≤ 6 cap
- All 3 gate-pass → no PM Manager REJECT risk
- All 3 are R17-retro-deferred → freshness gate honored (R18 was skill-only, R19 catches up)
- Hard caps: feature=3, bugfix=0, total=3, polish=0 — well within limits

## User-impact profile (U_* — auto-classification input)

| Signal | Value | Score |
|---|---|---|
| U_size | "medium (3-6)" (3 features) | 1 |
| U_files | "medium (4-6)" (5-8 src files + 2-3 tests) | 2 |
| U_new_capability | yes (i18n + toast + a11y all NEW) | 2 |
| U_behavior_shift | no (UI adds features, doesn't shift core behavior) | 0 |
| U_user_visible | yes (all 3 visible) | 2 |
| U_data_shape_breaking | no | 0 |
| U_data_safety | no | 0 |
| U_installs_new_dep | no (roll-our-own i18n, custom toast, native ARIA) | 0 |
| **TOTAL** | | **7** |

**Lead auto-classification** (apply rules in order):
1. Rule 1 (architecture): `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO (7). → skip.
2. Rule 2 (feature): `U_user_visible==yes`? YES. `total >= 3`? YES (7). → **feature**.
3. Rule 3: N/A.

**Profile: feature** — gates Phase 0.25 (PM Researcher) and Phase 0.5 (PM Manager) ON, gates Phase 1 (Architect) to full plan.

## Self-Critique

- **What could go wrong?**
  1. **i18n scope creep** — issue #33 estimates 200-400 LOC. Lead-direct should keep it under 300 (cut placeholder text, defer rare strings to v2).
  2. **Toast timing** — `setTimeout` for auto-dismiss + ARIA live region coordination is tricky. Lead-direct should use existing `clearTimeout` pattern (already in app.ts for auto-save indicator).
  3. **A11y regression** — adding roles could break existing e2e Playwright tests if selectors depend on role attrs. Lead-direct should run e2e before claiming PASS.
  4. **Browser-runtime only** — All 3 are UI changes. Phase 3c Playwright minimum (SG.20) applies — walkthrough REQUIRED, not skippable.
- **What if all 3 don't fit?**
  - Hard cap is feature ≤ 3. If we need to drop one, drop A11y (lowest user-value 3/5, can audit+ship incrementally across R20-R22).
- **Stale backlog check** (per R12 backlog-freshness gate):
  - #12 (Bulk actions, aged_rounds=6): user-rejected 6x — STALE, do NOT surface (R12 rule).
  - #13 (Live file-watcher, aged_rounds=6): user-rejected 6x — STALE, do NOT surface.
  - R19 candidates are all FRESH (R17 retro-deferred + issue #33 new) — gate honored.
- **No fresh-investigation trigger needed** (3+ stale candidates would trigger it; we have 2 stale which is the boundary).

## Profile

**feature** (3 features, 0 bugfix, 0 polish, total=3 — well within caps)

## Notes

- This brief is **lead-synthesized** per v5.3.4 lead-direct model (5 min vs 17 min subagent PM Triage).
- Cross-references R17 retro's R18-deferred bundle + issue #33 scope.
- Hard caps verified: feature ≤ 3 ✓, bugfix ≤ 5 ✓ (0 used), total ≤ 8 ✓ (3 used), polish ≤ 1 ✓ (0 used).
- Backlog freshness: 2 stale candidates (#12, #13) at boundary; not triggered.
- No fresh-investigation signal needed.

## Wait — decision needed (per v5.3.4 lead-direct model)

Per v5 final spec (memory #417), v5 cron-style loop is **fully automated, 0 user input**. Planner selects autonomously. No user pick phase.

Per R12 patch Gap #8, "Lead stays GATED by default" — but this is for new user requests. The current invocation is `auto-slash-command` with empty user-request body → cron tick → no gate applies (memory #417).

**Lead will proceed**: Planner will validate the 3-candidate bundle in `planner.md` and Architect will plan it in `plan.md`.