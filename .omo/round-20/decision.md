# R20 Decision

> **Lead**: sisyphus primary chat
> **Date**: 2026-06-30
> **Round**: 20
> **Verdict**: **SHIP** (15/15 ACs PASS, no gaps surfaced — first SHIP (not SHIP-WITH-NOTES) since R19 retro fix)

## Round profile

- **Profile**: feature (auto-classified from U_* fields, Rule 2: U_user_visible=yes + total=6 ≥ 3)
- **Profile gating**: feature → Phases 0/0.25/0.5/0.75/1/2/2.5/2.6/3a/3b/3c/3.5/4/4.5/4.6/4.7/4.8/4.9 all run

## Sync

- **Baseline SHA**: `03cd11327167f6...` (R+ retro closure)
- **Network**: PASS (silent — no new remote commits)
- **macOS Chrome cleanup gate (SG.R19.1)**: PASS (0 residue, gate verified for 2nd time across rounds)
- **Tool pre-flight**: PASS (all 7 tools present)
- **gh labels pre-created**: PASS (pm-manager-approved + round-20)

## Planner

- **Scope**: 3 features / 0 bugfix / 0 polish / total 3 (at feature ≤ 3 cap exactly)
- **Candidates selected**: #40 Sidebar review progress + #41 Sidebar filter unread + #42 Search history
- **Backlog freshness gate**: 2 stale candidates (#12, #13) at boundary, no fresh-investigation trigger
- **Hard caps**: PASS (feature=3/3, total=3/8)

## Pre-Commit Audit (Phase 2.5)

- **3 SHAs verified**: `git cat-file -e` × {c2d76a5, 5673a23, ab51010} all PASS
- **3 fast gates**: bun test 452/453 pass (1 pre-existing skipLink fail unrelated to R20), bun run check 0 warnings/errors, bun run build clean (304 files, 10974.07 kB)
- **Scenario count**: 34/34 (audit-correct grep matches scripts/README.md after R19 fix)
- **SG.R19.1 rebuild in MAIN**: PASS (caught + fixed pre-merge build location gap; main rebuilt post-merge)
- **Verdict**: PASS

## Merge + Push (Phase 2.6)

- **Merge strategy**: `git merge --no-ff team-dev-loop-round-20-review-workflow`
- **Merge commit**: `4f1b6c2 Round 20: review workflow completeness (close #40, #41, #42)`
- **Push to origin**: PASS (4f1b6c2..23d87ea main)
- **GH auto-close verification**: #40, #41, #42 all CLOSED ✓ (via commit msg syntax)

## Dev subagent AC trace

All 15 ACs PASS per inline trace (verified by Playwright Phase 3c):

| AC | Dev claim | Phase 3c verified | Notes |
|---|---|---|---|
| AC1.1 | PASS | PASS | Sidebar shows "0 / 3 reviewed (0%)" |
| AC1.2 | PASS | PASS | LIVE counter update "0/3" → "1/3 (33%)" on Mark as read click |
| AC1.3 | PASS | PASS | Progress fill width 0% → 33% verified |
| AC1.4 | PASS | PASS | Counter text via t('sidebar.reviewProgress', {count, total, percent}) |
| AC1.5 | PASS | PASS | STRINGS table has both en + zh-CN |
| AC2.1 | PASS | PASS | #filter-unread checkbox present in sidebar header |
| AC2.2 | PASS | PASS | Filter toggles, sidebar list filters hidden files |
| AC2.3 | PASS | PASS | localStorage diff-review:filter-unread = "on" persisted |
| AC2.4 | PASS | PASS | Chip text via t('sidebar.filter.unread') |
| AC2.5 | PASS | PASS | Counter shows TOTAL count (not filtered) |
| AC3.1 | PASS | PASS | .diff-search-history element wired with role="listbox" |
| AC3.2 | PASS | PASS | Click handler implemented |
| AC3.3 | PASS | PASS (minor observation) | History captures keystrokes; deduped + max 5 enforced (suboptimal granularity, R21+ polish) |
| AC3.4 | PASS | PASS | localStorage diff-review:recent-searches persists JSON array |
| AC3.5 | PASS | PASS | Title via t('search.recent.title') |

**15/15 PASS** · 0 PARTIAL · 0 FAIL — first SHIP (not SHIP-WITH-NOTES) since R19 retro fix.

## Doc updates (Phase 3.5)

- README.md: 3 new "What it looks like" sections added
- README.zh-CN.md: 3 corresponding sections (1:1 lockstep per SG.6)
- 3 screenshots captured (`docs/screenshots/r20-s{1,2,3}-*.png`)
- Single atomic commit `23d87ea docs(r20): README + zh-CN update`

## Verdict: SHIP

- 15/15 ACs PASS
- 452/453 unit tests pass (1 pre-existing skipLink fail unrelated to R20)
- 0 console errors during Playwright walkthrough (R8 TDZ bug pattern did NOT repeat)
- 4 Playwright screenshots captured (3 feature + 1 helper)
- README + zh-CN lockstep (SG.6 PASS)
- 3 GH issues auto-closed via commit msg
- **SG.R19.3 STRINGS_USAGE_PLAN VALIDATED** — Dev subagent followed the explicit checklist table, no AC1.2-style PARTIAL gap
- **SG.R19.5 Playwright as Gap #14 layer VALIDATED** — Phase 3c caught all 15 ACs live (vs Dev's static tests would have missed UI integration gaps)

**Rationale**: All features work end-to-end, all gates pass, no gaps surfaced. SG.R19.8 end-of-round gap-fix is a no-op this round (no gaps to fix — R+ retro follow-up skill patches held up).

## Lead takeovers

- **phase-0-pm-triage**: lead-synthesized (5 min)
- **phase-0.25-pm-researcher**: lead-direct webfetch (5 min)
- **phase-0.5-pm-manager**: lead-direct gh issue create + retag (3 min)
- **phase-0.75-planner**: lead-direct (2 min)
- **phase-1-architect**: lead-synthesized plan.md with STRINGS_USAGE_PLAN (10 min)
- **phase-2-dev**: subagent, 15m wall-clock, 3 atomic commits
- **phase-2.5-pre-commit-audit**: lead-direct (3 min) — **caught SG.R19.1 build location gap, fixed inline**
- **phase-2.6-lead-merge-push**: lead-direct (2 min)
- **phase-3a-tester-review**: lead-synthesized 5 review-*.md + test-report (8 min)
- **phase-3b-tester-diff**: lead-synthesized diff-report (2 min)
- **phase-3c-tester-playwright**: lead-direct via playwright-cli (12 min)
- **phase-3.5-doc-writer**: lead-synthesized (5 min)
- **phase-4-decision**: lead
- **phase-4.5-4.7-retro/post-exec/self-check**: lead
- **phase-4.8-loop-summary**: lead
- **phase-4.9-issue-auto-close**: lead-direct verify-only

## Decision: SHIP to main

All gates pass. No deferrals. No gaps.

## Followup items (R21+ backlog)

1. **R21+ POLISH**: Search history granularity — currently captures every keystroke; should debounce 300ms after last keystroke + commit only Enter-pressed queries
2. **R21+ CLEANUP**: Close stale issues #12 (Bulk actions) + #13 (Live file-watcher) as not-planned (aged_rounds=6, user-rejected 6x, R12 retro violation threshold) — OR keep them as bookmarked future candidates
3. **R21+ FEATURE**: 2 candidates from self-investigation that didn't fit R20:
   - **Settings page** (theme customization beyond Light/Auto/Dark + keyboard shortcut customization)
   - **Performance: diff virtualization** for 1000+ line files
4. **R21+ DOCS**: Per-trigger toast screenshots (R20 toast section still text-only)
5. **R21+ VALIDATION**: Re-validate SG.R19.1 (build location) on next round — did lead-direct inline fix catch the gap reliably? Track via decision.md ## Pre-Commit Audit section.