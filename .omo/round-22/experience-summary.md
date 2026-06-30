# R22 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 3, R22)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R22 closed 2 GH issues in 2 atomic commits + 3 supporting commits (docs, archive, repair):

1. **#46 Fix skipLink i18n test fail** (polish, 1-char) — quote `skipLink` key in STRINGS table to match test assertion
2. **#45 Reset-restore search-history button** (feature, 81 LOC) — add Clear button to Recent Searches dropdown with toast confirmation

Plus:
3. **Repair commit `614806e`** — fix bilingual lockstep gap (R21 + R22 zh-CN visual sections missing)

**Key win**: Pre-existing `skipLink` test fail (since R19) **ELIMINATED**. Test baseline went from 503 pass / 1 fail to **510 pass / 0 fail** (first 100% pass rate in R19-R21-R22 history).

## What surprised us

1. **node_modules env issue in worktree** — discovered when Dev subagent #46 reported 458/3 instead of expected 504/0. Root cause: git worktree doesn't auto-inherit node_modules. Fixed by symlinking from main. **NEW SG.R22.2 (worktree env check)** should be applied in R23.

2. **Bilingual lockstep silent failure** — both R21 #93bc1c7 and R22 #36f69fa added visual sections to README.md successfully but the parallel zh-CN edits failed silently (Edit tool returned "Could not find oldString"). Caught post-commit, repaired via `614806e`. **NEW SG.R22.1 (bilingual lockstep verification)** should be applied in R23.

3. **tsc not in PATH** — both Dev subagents skipped typecheck. Validated by bun test (no TS errors during test execution). Carry forward as typecheck-skip pattern OR investigate.

## What worked well

- **Lead-direct execution at ~85 min** for 2 issues + repair (faster than R21's 95 min due to smaller scope)
- **STRINGS_USAGE_PLAN executed cleanly** for 2 keys × 2 locales
- **SG.R20.1 3-step rebuild held up** (merge → build → grep verify)
- **In-round gap-fix per SG.R19.8** — bilingual lockstep repair committed before final commit, not deferred
- **Composite scoring + cap enforcement** — both candidates within feature+polish caps

## Skill patches to apply in R23

| SG | Description | When to apply |
|---|---|---|
| **SG.R22.1** (NEW) | Pre-commit bilingual lockstep verification: `grep -c <new-section> README.md` AND `grep -c <new-section> README.zh-CN.md` must match | R23 Phase 3.5 doc commits |
| **SG.R22.2** (NEW) | Worktree env check: after `git worktree add`, verify `node_modules` is symlinked OR `bun install` was run before running tests | R23 Phase -0 Sync |

## What future sessions should know

1. **R22 SHIP landed clean** — main HEAD `614806e`, 510/510 tests pass
2. **0 open issues** — both #45 and #46 auto-closed
3. **Skill audit pending** — apply SG.R22.1 + SG.R22.2 in R23
4. **R23 candidates well-defined** — Diff virtualization (big feature), bulk delete recent-searches (polish), toast screenshots (docs), bilingual lockstep skill patch (skill)
5. **Bilingual lockstep pattern is fragile** — silent failures are real; pre-commit verification is essential
6. **Worktrees need manual node_modules setup** — symlink or install before running tests

## Loop state

- `.omo/round-22/`: 15+ artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check)
- `.omo/proposals.jsonl`: 43 lines (append-only per SG.R19.6)
- main HEAD: `614806e` (synced to origin/main)
- 0 open issues · 2 R22 issues CLOSED
- Loop ready for R23

## Wall-clock

~85 min lead-direct (Phase -0 through 4.9), faster than R21 (95 min) due to smaller scope.