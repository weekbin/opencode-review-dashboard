# R19 Architect — Plan

> **Generated**: 2026-06-30 (v5.3.4 lead-direct — R+ v5 cron-style)
> **Round**: 19
> **Inherited scope from planner.md**: 3 features (#33 Language toggle + #37 Toast + #38 A11y audit)
> **Profile**: feature (3 features, 0 bugfix, 0 polish, total=3 — at feature cap exactly)
> **Baseline SHA**: `a0e0361d0efce2f0cabb09d452f3c2f0976bf318`

## 1. Goal

Ship 3 user-experience polish features in one round:

1. **#33 Language toggle** — User can switch dashboard UI between English and Chinese via toolbar button
2. **#37 Toast notification system** — Brief confirmation toasts for actions (Copy as MD, Add finding, Resolve, etc.)
3. **#38 A11y audit + ARIA fixes** — Add `role="tablist"` to sidebar, `role="status"` to auto-save indicator, focus trap on modals, skip-to-content link, `<main>` landmark

All 3 are additive, no schema break, no new dep. Profile: feature.

## 2. Acceptance Criteria (ACs)

### AC1 (Language toggle, MR — multi-round AC)

- **AC1.1**: Toolbar shows a language toggle button (e.g., "EN | 中文") in the existing toolbar group at `src/ui/app.ts:1244-1263`
- **AC1.2**: Clicking the toggle switches all visible UI labels between English and Chinese
- **AC1.3**: Selected language persists in `localStorage` under key `diff-review:language` (matches `DIFF_SEARCH_KEY` pattern at `app.ts:605`)
- **AC1.4**: On page load, the persisted language is applied before UI renders
- **AC1.5**: All R19-added Chinese strings are UTF-8 encoded and survive build

**AC1 is MR (multi-round)**: language toggle persistence + UI rebuild cycle is structurally a UI-runtime behavior. Per loop-decision.md, MR ACs MUST use direct unit tests on the i18n helper function (translate(key, lang) returns expected string for each language). Do NOT rely solely on e2e browser tests.

### AC2 (Toast notification system, SR — single-round AC)

- **AC2.1**: `showToast(message)` helper appends a div with `role="status"` + `aria-live="polite"` to a top-right viewport container
- **AC2.2**: Toast auto-dismisses after 3s using `setTimeout` + `clearTimeout` cleanup pattern (matches existing auto-save indicator pattern at `app.ts:4822`)
- **AC2.3**: At minimum, the following actions trigger toasts: `copyFindingAsMarkdownToClipboard` (R16), `copyPermalink` (R11), `submitReview` (R15), `addFinding` (R3)
- **AC2.4**: Manual close button works (X icon, hides via `display: none`)

### AC3 (A11y audit, SR — single-round AC)

- **AC3.1**: Sidebar tabs element has `role="tablist"`; each tab has `role="tab"` + `aria-selected={true|false}` (W3C ARIA APG Tabs Pattern)
- **AC3.2**: Auto-save indicator (R14 #24) has `role="status"` + `aria-live="polite"`
- **AC3.3**: All modals (Submit, Resolve, Edit) have `role="dialog"` + `aria-modal="true"` + focus trap on open + Escape key closes
- **AC3.4**: Skip-to-content link added as first focusable element (visible on focus)
- **AC3.5**: `<main>` landmark wraps the dashboard content

### Total ACs

- 5 + 4 + 5 = **14 ACs** (5 MR + 9 SR)
- MR ACs: AC1.1-AC1.5 (language toggle — runtime behavior, unit-tested on translate helper)
- SR ACs: AC2.1-AC2.4 + AC3.1-AC3.5 (toast + a11y, verifiable via e2e + lint)

## 3. File changes (anticipated)

| File | Change | LOC est |
|---|---|---|
| `src/ui/i18n.ts` (NEW) | Roll-our-own i18n: `translate(key, lang)` + `setLanguage(lang)` + `STRINGS` map (en + zh-CN) | 100-150 |
| `src/ui/toast.ts` (NEW) | Toast helper: `showToast(message)` + auto-dismiss + ARIA live region | 60-90 |
| `src/ui/app.ts` | Integrate i18n (replace 30-50 hardcoded strings with `t('key')` calls); integrate toast (add trigger sites); integrate a11y (add role attrs + focus trap + skip link) | 200-350 |
| `src/ui/i18n.test.ts` (NEW) | Unit tests for `translate(key, lang)` per language | 60-100 |
| `src/ui/toast.test.ts` (NEW) | Unit tests for toast show/dismiss/aria | 40-60 |
| `src/ui/a11y.test.ts` (NEW) | Snapshot test for ARIA attrs presence | 40-60 |
| `src/ui/app.test.ts` (existing) | Add ARIA assertions for sidebar tabs + modals | 30-50 |
| **TOTAL** | 4 new + 2 modified | **530-860** (slightly over brief estimate 360-670, but still under feature cap) |

Note: brief.md estimated 360-670 LOC but did not account for separate i18n.ts + toast.ts helper files. Plan increases to 530-860 with proper file structure (R14 retro SG.14: extract helpers as separate files, do NOT modify existing app.ts monolith).

## 4. Implementation steps (R12 retro defense-in-depth: 1 commit per feature)

1. **Worktree**: `mkdir -p $HOME/.worktrees/team-dev-loop-round-19 && git worktree add $HOME/.worktrees/team-dev-loop-round-19 -b team-dev-loop-round-19-polish-bundle`

2. **Commit 1**: A11y audit (#38) — simplest, lowest risk, sets ARIA foundation
   - Add `role="tablist"` + `role="tab"` + `aria-selected` to sidebar tabs
   - Add `role="status"` + `aria-live="polite"` to auto-save indicator
   - Add `role="dialog"` + `aria-modal="true"` + focus trap + Escape handler to modals
   - Add skip-to-content link as first focusable element
   - Add `<main>` landmark wrapper
   - Add `src/ui/a11y.test.ts` (snapshot test for ARIA attrs presence)
   - Update `src/ui/app.test.ts` with ARIA assertions
   - Run `bun run check && bun test`

3. **Commit 2**: Toast notification system (#37) — medium complexity, depends on a11y role=status
   - Create `src/ui/toast.ts` with `showToast(message)` + auto-dismiss + ARIA live region
   - Create `src/ui/toast.test.ts`
   - Add trigger sites: copyFindingAsMarkdownToClipboard, copyPermalink, submitReview, addFinding
   - Run `bun run check && bun test`

4. **Commit 3**: Language toggle (#33) — highest LOC, most invasive
   - Create `src/ui/i18n.ts` with translate helper + STRINGS map (en + zh-CN ~30-50 keys)
   - Create `src/ui/i18n.test.ts`
   - Add toolbar toggle button at app.ts:1244-1263
   - Replace 30-50 hardcoded strings with `t('key')` calls
   - Add localStorage persistence on toggle
   - Run `bun run check && bun test`

5. **Verify all 3 commits**: `git -C $worktree log --oneline $baseline..HEAD` shows 3 atomic commits

6. **NO merge/push from Dev subagent** (per v5.3.3 SG.4 — lead does Phase 2.6)

## 5. Test plan

- **Unit tests** (in each commit's test file): translate(), showToast(), a11y attrs
- **Integration tests** (existing test files): language persistence, toast trigger sites
- **E2E tests**: deferred to R20 (R12 R13 R14 R15 R16 R17 all deferred e2e; harness takes 90+ sec to run full sweep)
- **Playwright walkthrough** (Phase 3c): REQUIRED per SG.20 (all 3 features are UI changes) — capture 3 screenshots minimum

## 6. Risk register

| Risk | Mitigation |
|---|---|
| i18n scope creep (200-400 LOC vs 530-860 actual) | Cut rare strings, defer error messages to v2 |
| Toast timing bugs (setTimeout cleanup) | Match existing R14 #24 auto-save indicator pattern (already battle-tested) |
| A11y regression (adding roles could break existing selectors) | Run e2e before claiming PASS; Phase 3c Playwright is REQUIRED |
| Browser-runtime only (all 3 features are UI) | Phase 3c walkthrough REQUIRED per SG.20, NOT skippable via quota-override |
| Existing tests break (R14 #24 auto-save indicator test might conflict with new role=status) | Lead-direct to verify in Phase 2.5 Pre-Commit Audit |
| localStorage quota (zh-CN strings ~5KB, well under 5MB limit) | N/A |

## 7. Hand-off to Dev (subagent)

**Subagent scope** (Phase 2 Dev, the ONLY subagent in v5.3.3 model):

- Worktree: `$HOME/.worktrees/team-dev-loop-round-19`
- Branch: `team-dev-loop-round-19-polish-bundle`
- 3 atomic commits in this order: A11y → Toast → Language
- **NO merge/push** (lead does Phase 2.6)
- **NO gh issue close** (lead does Phase 4.9)
- 5-20 min per commit budget. If any commit exceeds 20 min, lead takes over partial work.

**Dev prompt structure**:
- Read this plan.md
- Read existing `src/ui/app.ts` (one pass only — READ ONLY ONCE per SG.9)
- Implement Commit 1 (A11y) → run bun test → commit
- Implement Commit 2 (Toast) → run bun test → commit
- Implement Commit 3 (Language) → run bun test → commit
- Return: 3 commit SHAs + bun test results + AC trace per commit

**Dev's responsibilities**:
- DO NOT modify existing utility functions in src/ui/app.ts (R16 SG.14 add-only rule)
- DO add new helper files: i18n.ts, toast.ts (R14 SG.14)
- DO run `bun run check && bun test` after each commit
- DO capture `git cat-file -e <sha>` for each commit before returning

**Lead's responsibilities** (after Dev returns):
- Phase 2.5: git cat-file -e all 3 SHAs + scenario count drift check + file count sanity
- Phase 2.6: git merge --no-ff + git push + verify GH auto-close via commit msg `close #33 #37 #38`

## 8. AC classification (multi-round vs single-round)

- **MR ACs (multi-round)**: AC1.1-AC1.5 (language toggle runtime behavior — needs unit tests on translate helper)
- **SR ACs (single-round)**: AC2.1-AC2.4 (toast, e2e-verifiable) + AC3.1-AC3.5 (a11y, lint + e2e-verifiable)

Per loop-decision.md § multi-round AC test-design rule: MR ACs MUST use direct unit tests on the format/state-builder function (`translate()` helper). Single-round harness structurally can't verify multi-round ACs.

## 9. Verification gates (lead-direct per v5.3.3)

| Gate | Command | Status |
|---|---|---|
| Worktree exists | `git worktree list \| grep round-19` | TBD |
| 3 atomic commits | `git -C $worktree log --oneline $baseline..HEAD` | TBD |
| All commits verifiable | `git cat-file -e` × 3 | TBD |
| Unit tests pass | `bun test` | TBD |
| Build clean | `bun run build` | TBD |
| Typecheck clean | `bun run check` | TBD |
| Format clean | `bun run check` | TBD |
| Lint clean | `bun run check` | TBD |
| E2E scenarios | 33 → 33 (no new R19 e2e per plan hand-off item 8, but verify count) | TBD |
| 3 issues auto-closed | `gh issue list --state closed --label pm-manager-approved` | TBD (Phase 4.9) |

## 10. Notes

- All 3 features are R17-retro-deferred; R19 is the catching-up round
- R18 was a SKILL-only patch round, R19 resumes feature work
- v5.3.4 lead-direct model: 16/17 phases lead-direct, only Phase 2 Dev uses subagent
- Hard caps verified at selection (feature=3/3, total=3/8)
- Profile = feature → Phase 1 Architect full plan (this file), Phase 3c Playwright minimum
- All 3 features are user-visible UI changes → Phase 3c walkthrough REQUIRED
- No new dependency introduced (roll-our-own i18n, custom toast, native ARIA)