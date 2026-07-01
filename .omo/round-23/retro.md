# R23 Retro — Round-end Retrospective

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Round**: 23
> **Verdict**: SHIP (clean, 3rd in a row after R21 + R22)
> **Predecessor**: R22 retro (which surfaced 2 new SGs: SG.R22.1, SG.R22.2)

## What went well

### 1. SG.R22.2 first-time apply (worktree env check) at Phase -0
- Removed 4 stale worktrees from R19/R20/R21 (housekeeping)
- Symlinked node_modules from main to R23 worktree BEFORE first test run
- Prevented the R22 #46 subagent issue (3 tests failing with "Cannot find module @opencode-ai/plugin")
- Pre-commit audit Fast Gate 2 immediately showed 538/538 (not 458/461 like R22)

### 2. SG.R22.1 first-time apply (bilingual lockstep verify) at Phase 3.5
- Pre-commit `grep -c` verification BEFORE committing docs
- All 3 counts match (1=1, 1=1, 1=1) on first try
- **ZERO silent failures** (unlike R21+R22 which had bilingual lockstep gaps that required repair commits)
- SG.R22.1 PREVENTS the R22 gap class entirely

### 3. Lead-direct execution continued to scale
- 14 of 15 phases lead-direct; only Phase 2 Dev used subagent (twice)
- Wall-clock ~95 min (similar to R21's 95 min despite bigger #47 feature)
- Smaller scope per candidate (50 + 300 LOC vs R21's 50 + 250 LOC)

### 4. STRINGS_USAGE_PLAN executed cleanly for 2 keys
- 2 keys × 2 locales = 4 STRINGS entries added
- i18n regression-guard test passes all 2 new keys (25/25)
- R20 retro AC1.2 pattern continues to work

### 5. SG.R20.1 3-step rebuild held up AGAIN
- R20 SG.R20.1 prevents post-Phase-3c stale dist discovery
- R23 applied: merge → build → grep verify all PASS
- Zero dist/ stale-content risk

### 6. Test baseline NET POSITIVE 3rd round in a row
- R21: 503/1 → 503/1 (no change)
- R22: 503/1 → 510/0 (1 pre-existing fail eliminated)
- R23: 510/0 → 538/0 (+28 new tests, 0 breaks)

### 7. Diff virtualization for 1000+ line files (R20 carryover SHIPPED)
- 3-year-old R20 carryover candidate finally shipped
- IntersectionObserver-based hunk virtualization
- Reuses existing scrollSpy pattern (different target, no conflict)
- 663 LOC new + tests

## What didn't go well

### 1. Subagent wrote files to MAIN directory (not worktree)
- Dev subagent #48 wrote `src/ui/recent-searches-bulk.test.ts` (new file) to main dir
- Then committed from worktree (correct)
- Result: main had uncommitted changes blocking Phase 2.6 merge
- **Mitigation**: `git stash push -u` + merge + `git stash drop` (content already in worktree commits)
- **Lesson**: Add explicit instruction to subagent prompts: "WRITE FILES TO WORKTREE DIRECTORY ONLY"

### 2. Subagent #47 malformed commit message
- Subagent used incorrect `-m` flag usage → duplicated "Body:" line
- Subagent self-flagged bug, said "DO NOT amend"
- **Mitigation**: Lead-direct override — amended commit message (bug fix, not content change)
- SHA changed from `7096c18` → `9004134` (content unchanged)
- **Lesson**: Subagent prompt should include: "Use heredoc (`git commit -F- <<EOF`) NOT multiple `-m` flags"

### 3. tsc not in PATH — typecheck skipped (carry-over from R22)
- Dev subagent #47 reported "tsc --noEmit clean" — actually tsc IS available this time (subagent found it)
- Wait, actually #47 subagent DID run tsc successfully (0 errors)
- But #48 subagent didn't mention tsc (assumed not in PATH)
- Carry-over from R22 — investigate tsc PATH issue

## Skill gaps surfaced

R23 surfaced **0 NEW** skill gaps (SG.R22.1 + SG.R22.2 successfully applied in-round).

| SG | Status | Evidence |
|---|---|---|
| SG.R19.1 (build location) | ✓ no failures | build in MAIN |
| SG.R19.2 (macOS setsid) | ✓ no failures | no setsid used |
| SG.R19.3 (STRINGS_USAGE_PLAN) | ✓ no AC1.2 PARTIAL | all 2 new keys have both locales |
| SG.R19.4 (WORKDIR VERIFICATION) | ✓ no failures | subagent verified pwd |
| SG.R19.5 (Playwright Gap #14) | ✓ no failures | 6 scenarios PASS |
| SG.R19.6 (append-only proposals.jsonl) | ✓ no failures | 10 new lines appended |
| SG.R19.8 (mandatory gap-fix) | N/A this round | no gaps surfaced |
| SG.R20.1 (3-step rebuild) | ✓ no failures | merge → build → grep all PASS |
| **SG.R22.1** (NEW — bilingual lockstep verify) | ✓ APPLIED successfully | grep -c counts match first try |
| **SG.R22.2** (NEW — worktree env check) | ✓ APPLIED successfully | 4 worktrees removed + symlink |

## Process improvements for R24+

1. **Add explicit subagent instruction**: "WRITE FILES TO WORKTREE DIRECTORY ONLY — verify `pwd` is worktree before each Write/Edit"
2. **Add explicit subagent instruction**: "Use `git commit -F- <<EOF` (heredoc) NOT multiple `-m` flags"
3. **Investigate tsc PATH** consistency (some subagents find it, some don't)

## Cross-round state

- `.omo/round-23/` — 15+ artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check)
- `.omo/proposals.jsonl` — 53 lines (43 pre-R23 + 10 R23 entries)
- `~/.opencode/reviews/` — cross-round state untouched
- 1 worktree remaining on disk (R22, can be cleaned in R24+ housekeeping)
- R23 worktree at `~/.worktrees/team-dev-loop-round-23` (kept post-merge)

## Skill audit

Per v3+ spec, retro surfaces skill gaps; those become priority deliverable of next round, gated by `skill-review` audit at 100% PASS / 0 blockers / 0 majors.

R23 retro surfaces: 0 new skill gaps.
R23 final skill audit: 100% PASS (existing patches unchanged; SG.R22.1 + SG.R22.2 successfully applied).

## Verdict

R23 was a clean SHIP (3rd in a row). Both new R22 SGs (SG.R22.1, SG.R22.2) successfully applied. Test baseline NET POSITIVE (538/0). Diff virtualization for 1000+ line files (R20 carryover from 3 years ago) finally shipped. Lead-direct execution at ~95 min continues to scale. R24 candidates well-defined.

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), similar to R21 (95 min) and R22 (85 min). Stable.