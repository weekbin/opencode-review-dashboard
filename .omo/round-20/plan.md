# R20 Architect — Plan

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up — first round applying SG.R19.3 STRINGS_USAGE_PLAN + SG.R19.8 mandatory gap-fix)
> **Round**: 20
> **Inherited scope from planner.md**: 3 features (#40 Sidebar progress + #41 Unread filter + #42 Search history)
> **Profile**: feature (3 features, 0 bugfix, 0 polish, total=3 — at feature cap exactly)
> **Baseline SHA**: `03cd11327167f6...` (R+ retro closure)

## 1. Goal

Ship 3 review-workflow completeness features in one round:

1. **#40 Sidebar review progress indicator** — visible "X / Y reviewed (Z%)" counter at top of sidebar, updates live as user toggles read state
2. **#41 Sidebar filter: show only unread files** — chip in sidebar header; toggles a `filterUnread` state that filters the file list
3. **#42 Search history (recent searches dropdown)** — when `.diff-search-bar` is focused, dropdown shows last 5 searches; click → re-run

All 3 are additive, no schema break, no new dep. Profile: feature.

## 2. Acceptance Criteria (ACs)

### AC1 (Sidebar progress, MR — multi-round AC)

- **AC1.1**: Sidebar header shows "X / Y reviewed (Z%)" text where X = `state.read.size`, Y = total files, Z = Math.round(X/Y * 100).
- **AC1.2**: Progress counter updates live when user toggles read state via `readBtn` (existing at `src/ui/app.ts:4332`).
- **AC1.3**: Visual progress bar (subtle, < 6px tall) renders below the counter text, width proportional to X/Y.
- **AC1.4**: Counter text wrapped in `t('sidebar.reviewProgress', {count: X, total: Y, percent: Z})` per SG.R19.3.
- **AC1.5**: STRINGS table contains both `en` AND `zh-CN` translations for `sidebar.reviewProgress`.

**AC1 is MR (multi-round)**: progress UI depends on `state.read.size` and total file count — both runtime values. Per loop-decision.md, MR ACs MUST use direct unit tests on the function that builds the counter text (e.g., `formatReviewProgress(readCount, totalCount)`).

### AC2 (Unread filter, SR — single-round AC)

- **AC2.1**: Sidebar header shows "Show only unread" chip/checkbox.
- **AC2.2**: Toggling the chip sets `state.filterUnread = true`; sidebar list filters out files where `state.read.has(file.path)` is true.
- **AC2.3**: Filter state persists in localStorage `diff-review:filter-unread` (matches existing localStorage patterns).
- **AC2.4**: Filter chip wraps text in `t('sidebar.filter.unread')` per SG.R19.3.
- **AC2.5**: Counter from AC1 updates correctly when filter is on/off (counter shows X / Y where Y is filtered count or total count, decide in plan).

### AC3 (Search history, SR — single-round AC)

- **AC3.1**: When `.diff-search-bar` input is focused, dropdown shows last 5 searches (most recent first).
- **AC3.2**: Clicking a recent search populates the input + re-runs the search.
- **AC3.3**: New searches are pushed to the history (deduped, max 5).
- **AC3.4**: History persists in localStorage `diff-review:recent-searches` (JSON array, max 5).
- **AC3.5**: Dropdown title wrapped in `t('search.recent.title')` per SG.R19.3.

### Total ACs

- 5 + 5 + 5 = **15 ACs** (5 MR + 10 SR)
- MR ACs: AC1.1-AC1.5 (sidebar progress — runtime values, needs unit tests on helper)
- SR ACs: AC2.1-AC2.5 + AC3.1-AC3.5 (filter + history, e2e + lint verifiable)

## 3. File changes (anticipated)

| File | Change | LOC est |
|---|---|---|
| `src/ui/review-progress.ts` (NEW) | `formatReviewProgress(readCount, totalCount)` helper | 30-50 |
| `src/ui/search-history.ts` (NEW) | `getRecentSearches()` / `addRecentSearch(query)` localStorage helpers | 40-60 |
| `src/ui/i18n.ts` | Add 3 new STRINGS keys (`sidebar.reviewProgress`, `sidebar.filter.unread`, `search.recent.title`) with both `en` AND `zh-CN` translations | 20-30 |
| `src/ui/review.html` | Add `data-i18n="sidebar.filter.unread"` chip + `data-i18n="sidebar.reviewProgress"` container | 10-15 |
| `src/ui/app.ts` | Wire sidebar progress indicator + filter chip + search history dropdown; registerUITranslator for new keys (per R19 AC1.2 pattern) | 100-150 |
| `src/ui/review-progress.test.ts` (NEW) | Unit tests for `formatReviewProgress` | 30-50 |
| `src/ui/search-history.test.ts` (NEW) | Unit tests for getRecentSearches/addRecentSearch (with localStorage mock) | 50-80 |
| `src/ui/i18n.test.ts` (existing) | Add 3 new AC1.2-style regression tests for new keys | 30-40 |
| **TOTAL** | 4 new + 4 modified | **310-475** (above brief estimate 180-270 but within tolerance for proper structure) |

**Note**: brief.md estimated 180-270 LOC. Plan increases to 310-475 with proper file structure (separate helper files per R16 SG.14). The increase is justified by R19 AC1.2 lesson: separate helper files + i18n test coverage catches integration gaps that single-file monoliths miss.

## 4. Implementation steps (R12 retro defense-in-depth: 1 commit per feature)

1. **Worktree setup** (with SG.R19.4 WORKDIR VERIFICATION):
   ```bash
   cd "$HOME/.worktrees" || mkdir -p "$HOME/.worktrees"
   git worktree add "$HOME/.worktrees/team-dev-loop-round-20" -b team-dev-loop-round-20-review-workflow
   cd "$WORKTREE_DIR"
   pwd && git rev-parse --abbrev-ref HEAD  # verify in worktree
   ```

2. **Commit 1**: Sidebar progress (#40)
   - Create `src/ui/review-progress.ts` with `formatReviewProgress(readCount, totalCount)` helper
   - Modify `src/ui/app.ts`: add progress DOM element + wire to `state.read` updates
   - Modify `src/ui/i18n.ts`: add `sidebar.reviewProgress` STRINGS key (en + zh-CN)
   - Create `src/ui/review-progress.test.ts` with AC1 tests
   - Add 1 AC1.2-style regression test to `src/ui/i18n.test.ts` for `sidebar.reviewProgress`
   - Run `bun run check && bun test`
   - Commit: `feat(r20): sidebar review progress indicator (close #40)`

3. **Commit 2**: Unread filter (#41)
   - Modify `src/ui/app.ts`: add filter chip + state.filterUnread + localStorage persistence
   - Modify `src/ui/i18n.ts`: add `sidebar.filter.unread` STRINGS key (en + zh-CN)
   - Modify `src/ui/review.html`: add `data-i18n="sidebar.filter.unread"` chip element
   - Add 1 AC1.2-style regression test to `src/ui/i18n.test.ts` for `sidebar.filter.unread`
   - Run `bun run check && bun test`
   - Commit: `feat(r20): sidebar filter show-only-unread (close #41)`

4. **Commit 3**: Search history (#42)
   - Create `src/ui/search-history.ts` with localStorage helpers
   - Modify `src/ui/app.ts`: wire dropdown to `.diff-search-bar` focus
   - Modify `src/ui/i18n.ts`: add `search.recent.title` STRINGS key (en + zh-CN)
   - Create `src/ui/search-history.test.ts` with AC3 tests
   - Add 1 AC1.2-style regression test to `src/ui/i18n.test.ts` for `search.recent.title`
   - Run `bun run check && bun test`
   - Commit: `feat(r20): search history recent-searches dropdown (close #42)`

5. **Verify all 3 commits**:
   ```bash
   git -C $WORKTREE_DIR log --oneline $BASELINE..HEAD
   ```

6. **NO merge/push from Dev subagent** (per v5.3.3 SG.4 — lead does Phase 2.6)

## 5. Test plan

- **Unit tests** (in each commit's test file): `formatReviewProgress`, `getRecentSearches/addRecentSearch`, i18n key regression guards
- **Integration tests**: existing `src/ui/i18n.test.ts` § AC1.2 tests verify each new key has data-i18n + registerUITranslator + STRINGS entry
- **E2E tests**: deferred to R21 (R12-R19 pattern — harness takes 90+ sec, not a pre-merge blocker)
- **Playwright walkthrough** (Phase 3c): REQUIRED per SG.20 + SG.R19.5 (all 3 features are UI changes). Capture 3 screenshots minimum.

## 6. Risk register

| Risk | Mitigation |
|---|---|
| i18n integration gap (R19 AC1.2 lesson) | SG.R19.3 STRINGS_USAGE_PLAN in plan.md + 3 new i18n regression tests catch integration gaps that unit tests miss |
| Filter counter interaction (AC2.5) | Decide: when filter ON, counter shows "X / Y" where Y is FILTERED count (matching what's visible). Document in code |
| localStorage quota | 5 searches × ~50 chars = 250 bytes; 1 boolean = 5 bytes. Total ~260 bytes. Trivial vs 5MB quota |
| Sidebar progress counter drift (live updates) | Use `applyFileState` already debounced for re-render; counter derives from state.read.size inside render function |
| Search history XSS | All searches via `textContent` (not innerHTML); no user-provided HTML rendered |
| Dev subagent workdir mis-pinning (R19 SG.R19.4) | Added WORKDIR VERIFICATION to Dev prompt |

## 7. Hand-off to Dev (subagent)

**Subagent scope** (Phase 2 Dev, the ONLY subagent in v5.3.3 model):

- Worktree: `$HOME/.worktrees/team-dev-loop-round-20`
- Branch: `team-dev-loop-round-20-review-workflow`
- 3 atomic commits in order: Sidebar progress → Unread filter → Search history
- **NO merge/push** (lead does Phase 2.6)
- **NO gh issue close** (lead does Phase 4.9)
- 5-20 min per commit budget

**MANDATORY WORKDIR VERIFICATION** (SG.R19.4 — NEW R19 retro):

```bash
cd "$HOME/.worktrees/team-dev-loop-round-20" || { echo "WORKTREE_MISSING"; exit 1; }
pwd
git rev-parse --abbrev-ref HEAD  # must show team-dev-loop-round-20-*
git status --short  # must be empty
```

R19 evidence: Dev accidentally committed initial Commit 1 to MAIN, required `git reset --hard HEAD~1` + redo. This step prevents that class of error.

**STRINGS_USAGE_PLAN** (SG.R19.3 — NEW R19 retro, MANDATORY for R20):

| Hardcoded string | File:line (planned) | t() key | Locales |
|---|---|---|---|
| "X / Y reviewed (Z%)" | src/ui/app.ts (new progress DOM) | sidebar.reviewProgress | en + zh-CN |
| "Show only unread" | src/ui/review.html (new chip) | sidebar.filter.unread | en + zh-CN |
| "Recent searches" | src/ui/app.ts (new dropdown title) | search.recent.title | en + zh-CN |

Dev MUST add all 3 keys to `STRINGS` table with both locales, AND wrap text with `t()` calls, AND register with `registerUITranslator()` (per R19 AC1.2 fix pattern). 3 new i18n regression tests in `src/ui/i18n.test.ts` will catch missing translations or missing registerUITranslator bindings.

**Dev prompt structure**:
- Read this plan.md
- Read existing `src/ui/app.ts` (one pass only — READ ONLY ONCE per SG.9)
- Run WORKDIR VERIFICATION
- Implement Commit 1 (Sidebar progress) → run bun test → commit
- Implement Commit 2 (Unread filter) → run bun test → commit
- Implement Commit 3 (Search history) → run bun test → commit
- Return: 3 commit SHAs + bun test results + AC trace per commit

**Dev's responsibilities**:
- DO NOT modify existing utility functions in src/ui/app.ts (R16 SG.14 add-only rule)
- DO add new helper files: review-progress.ts, search-history.ts (R16 SG.14)
- DO run `bun run check && bun test` after each commit
- DO capture `git cat-file -e <sha>` for each commit before returning
- DO wrap ALL 3 STRINGS keys per the plan table above

**Lead's responsibilities** (after Dev returns):
- Phase 2.5: git cat-file -e all 3 SHAs + scenario count drift check + 3 fast gates + **rebuild in MAIN** (SG.R19.1)
- Phase 2.6: git merge --no-ff + git push + verify GH auto-close via commit msg `close #40 #41 #42`

## 8. AC classification (multi-round vs single-round)

- **MR ACs (multi-round)**: AC1.1-AC1.5 (sidebar progress — runtime values, needs unit tests on `formatReviewProgress` helper)
- **SR ACs (single-round)**: AC2.1-AC2.5 (unread filter, e2e + lint verifiable) + AC3.1-AC3.5 (search history, e2e + lint verifiable)

Per loop-decision.md § multi-round AC test-design rule: MR ACs MUST use direct unit tests on the format/state-builder function (`formatReviewProgress(readCount, totalCount)`). Single-round harness structurally can't verify multi-round ACs.

## 9. Verification gates (lead-direct per v5.3.3)

| Gate | Command | Status |
|---|---|---|
| Worktree exists | `git worktree list \| grep round-20` | TBD |
| 3 atomic commits | `git -C $worktree log --oneline $baseline..HEAD` | TBD |
| All commits verifiable | `git cat-file -e` × 3 | TBD |
| Unit tests pass | `bun test` | TBD |
| Build clean | `bun run build` | TBD |
| Typecheck clean | `bun run check` | TBD |
| Format clean | `bun run check` | TBD |
| Lint clean | `bun run check` | TBD |
| E2E scenarios | 34 → 34 (no new R20 e2e per plan hand-off item 8) | TBD |
| 3 i18n regression tests | AC1.2-style guards for new keys | TBD |
| 3 issues auto-closed | `gh issue list --state closed --label pm-manager-approved` | TBD (Phase 4.9) |

## 10. Notes

- All 3 features are R20 fresh self-investigation (no user-rejected backlog items)
- R20 is the first round applying SG.R19.3 (STRINGS_USAGE_PLAN) + SG.R19.4 (Dev WORKDIR VERIFICATION) + SG.R19.8 (end-of-round mandatory gap-fix)
- Profile: feature → Phase 1 full plan (this file), Phase 3c Playwright walkthrough REQUIRED
- All 3 features are UI changes → Phase 3c walkthrough is Gap #14 verification layer (per SG.R19.5)
- No new dependency introduced (localStorage + DOM only)
- i18n: 3 new STRINGS keys, all with `en` + `zh-CN` translations
- Hard caps verified at selection (feature=3/3, total=3/8)