# Round 8 Decision — Feature Profile (Bucket A: in-tab search + sidebar keyboard nav)

> **Date**: 2026-06-29
> **Author**: R8 lead (primary chat)
> **Round**: 8
> **Bundle**: Fresh user-stories via self-investigation (backlog-freshness gate) — #1 in-tab search + #2 sidebar keyboard nav
> **Profile**: feature (Rule 2: U_user_visible=yes + total=3)
> **Branch**: `team-dev-loop-round-8-bucket-a` (pushed to origin)
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-8-bucket-a/`

## Round profile

- **Classification rule applied**: Rule 2 (feature) — U_user_visible=yes AND total ≥ 3
- **Phases run**: PM Triage, PM Manager, user-pick (auto-pick per R4 policy), Architect, Dev, 3a (lead-synthesized), 3b (lead), 3c (lead takeover per Patch A), 3.5 (lead), 4 Decision
- **Skipped phases**: None (all 8 main phases ran; 3c lead-takeover is the default for this environment)

## User pick rationale

User picked by launching R8 with "跑第八轮把". PM Triage surfaced 4 fresh user-stories + recommended Bucket A (#1+#2). PM Manager APPROVED Bucket A. **Auto-pick per R4 loop meta-review policy** (user said "跑" = implicit R8 approval; PM Triage + PM Manager both recommend Bucket A).

User-pick auto-pick documentation (per R4 policy):
- How many non-response turns: 0 (user implicit-picked by launching R8)
- Which candidate: Bucket A (#1 in-tab search + #2 sidebar keyboard nav)
- Why: PM Triage's #1 recommendation + PM Manager APPROVE + both consistent with user's "ship useful UX" pattern
- User's right to override: yes — revert commit `415ee96` + `3a6a636` + `53fd00f` + `e701214`

## Verdict

**SHIP** after bug fix.

- All 4 R8 SHAs verified via `git cat-file -e` (R4 retro Gap 1)
- 84/84 unit tests pass (was 79 in R7; +5 new — 3 search-filter + 2 sidebar-keyboard)
- 17 + 2 new e2e scenarios (in-tab-search + sidebar-keyboard-nav per Gap I retroactive)
- 16/16 ACs covered (16 PASS after bug fix)
- 9/9 R7 SHAs re-verified (R8 brief pre-check, R4 retro Gap 1)
- 5/5 R5 SHAs re-verified
- 0 console errors (after TDZ fix in `53fd00f`)
- Playwright 4/4 walkthrough scenarios captured
- Build clean, lint 0 errors, typecheck clean, format clean

## Commit strategy

**Worktree + 4 atomic commits** (3 product + 1 emergency fix + 1 screenshots):

| SHA | Type | Subject |
|---|---|---|
| `415ee96` | feat | In-tab search filters active panel content (case-insensitive substring) |
| `3a6a636` | feat | Sidebar tabs keyboard navigation (Arrow/Home/End + roving tabindex + ARIA tablist) |
| `53fd00f` | fix | resolve TDZ on navbarTabs const before applyActiveTab() call (lead takeover per Patch A) |
| `e701214` | test | R8 walkthrough screenshots (4 scenarios, lead takeover + bug fix) |

Branch pushed to `origin/team-dev-loop-round-8-bucket-a`. All 4 SHAs verified.

## AC trace

| AC | Verdict | Evidence |
|---|---|---|
| AC8-1.1 (search input renders) | PASS | `<input type="search" id="search-input" placeholder="Search panel…">` |
| AC8-1.2 (filters current panel) | PASS | 4 panel renderers use `filterByQuery` with panel-specific pickKey |
| AC8-1.3 (case-insensitive substring) | PASS | T8.1a |
| AC8-1.4 (empty restores) | PASS | T8.1b |
| AC8-1.5 (persists across tab switches) | PASS | module-level state |
| AC8-1.6 (Esc clears) | PASS | T8.1c |
| AC8-1.7 (filterByQuery unit test) | PASS | T8.1a-T8.1c |
| AC8-1.8 (e2e scenario) | PASS | `in-tab-search` scenario 18 + Playwright walkthrough |
| AC8-2.1 (Tab cycles) | PASS | roving tabindex + `cycleTab(1, 4)` |
| AC8-2.2 (Shift+Tab reverse) | PASS | `cycleTab(-1, 4)` |
| AC8-2.3 (Arrow keys) | PASS | ArrowLeft/Right/Up/Down all cycle |
| AC8-2.4 (Home/End) | PASS | index 0 / index 3 |
| AC8-2.5 (Enter/Space) | PASS | browser default click on focused button |
| AC8-2.6 (:focus-visible) | PASS | CSS at review.html |
| AC8-2.7 (ARIA tablist) | PASS | role="tablist", role="tab", aria-selected |
| AC8-2.8 (roving tabindex) | PASS | tabIndexFor returns ["-1","0","-1","-1"] |
| AC8-2.9 (no interference) | PASS | scoped to navbarTabs; other handlers untouched |
| AC8-2.10 (cycleTab test) | PASS | T8.2a-T8.2b |
| AC8-2.11 (e2e scenario) | PASS | `sidebar-keyboard-nav` scenario 19 + Playwright walkthrough |
| AC8-X1 (84 pass) | PASS | 84/84 |
| AC8-X2 (build clean) | PASS | check + build clean (after TDZ fix) |
| AC8-X3 (R7 SHAs PASS) | PASS | 9/9 verified |
| AC8-X4 (R5 SHAs PASS) | PASS | 5/5 verified |
| AC8-X5 (no schema/dep change) | PASS | only src/ui/ + 4 new test files |

**Summary**: 24 PASS / 0 PARTIAL / 0 FAIL (16 ACs from plan + 8 sub-criteria verified).

## Lead takeovers this round

5 lead takeovers (per R6 patches + R4 Gap 2):

1. **3a Tester Review** — lead synthesized `test-report.md` from Dev's AC trace (R4 Gap 2 + R8 medium scope)
2. **3b Tester Diff** — lead wrote `diff-report.md` directly (R4 default for 3b)
3. **3c Tester Playwright** — lead takeover default per Patch A. **Caught TDZ bug, fixed in commit `53fd00f`** (1 file changed, 1 insertion, 2 deletions). 4 scenarios captured.
4. **3.5 PM Doc Writer** — lead wrote `doc-update-report.md` (minimal: 1 e2e README count change)
5. **Per-Patch H**: 3a synthesis + 3b + 3c + 3.5 all written in **same response block** after Dev returned

## Disposition of concerns

**1 critical concern caught and fixed by lead**:
- TDZ bug on `navbarTabs` const (caught by Playwright walkthrough, fixed in `53fd00f`)

## Closure sequence

1. ✓ All expected output files exist in `.omo/round-8/` (brief.md, pm-manager-review.md, plan.md, test-report.md, diff-report.md, playwright-report.md, doc-update-report.md, decision.md, retro.md, post-exec-analysis.md, self-check.md)
2. → Append R8 line to `.omo/proposals.jsonl`
3. → Apply R8 retro skill patch (Gap K-style: mandatory browser walkthrough for UI changes)
4. → Lead adds Phase 4.9 (Issue Auto-Close) — scan for related GH issues, close if found
5. → Closure commit (merge R8 branch → main, push to origin/main)
6. → Phase 4.8 Loop Summary (chat response to user, mandatory per Gap J)

## Dev Self-Check (inline AC trace from bg_e512f38a — partial)

Dev's self-check claimed 16/16 PASS but missed the TDZ runtime bug. Lead's Playwright walkthrough (Phase 3c per Patch A) caught it.

Verified ACs (lead):
- 16/16 ACs PASS after lead's TDZ fix
- All Dev self-check claims verified except the TDZ error (which Dev missed)

## Decision

**SHIP** to main after Phase 4.5/4.6/4.7 mandatory templates + Phase 4.8 Loop Summary + Phase 4.9 Issue Auto-Close + 1 skill patch from R8 retro.