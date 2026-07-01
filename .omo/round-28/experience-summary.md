# R28 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 9, R28)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R28 closed 2 GH issues + 3 supporting commits (merge, archive, Phase 4 closure):

1. **#57 Toast screenshots** (polish docs, 26/8 LOC) — README + zh-CN reference 5 R24 captured toast screenshots in a markdown table format
2. **#58 R28 first round SG.R25.1** (skill-validation, 0 LOC) — validated the new pre-commit verify gate (embedded in v5.3.9 by R27)

Plus 3 supporting commits:
3. **Merge `2804106`** — combine into main
4. **Archive `23750b0`** — proposals.jsonl R28 entries (append-only)
5. **Phase 4 closure `b56e913`** — decision + retro + post-exec + self-check

**Key wins**:
- **SG.R25.1 FIRST-TIME APPLY SUCCESS** — gap prevention loop CLOSED (R25 → R27 → R28 milestone)
- **SG.R24.1 v5.3.8 SUCCESS for 4th consecutive round** (R25 + R26 + R27 + R28)
- **Both #57 and #58 closed** (#57 auto, #58 manual with SG.R25.1 validation comment)
- **Test baseline preserved at 602/602** (8th round, no source code changes)
- **Toast screenshots carryover FINALLY closed** (9 rounds stale)
- **0 gaps surfaced** (SG.R25.1 first-time apply worked as designed)

## What surprised us

1. **SG.R25.1 first-time apply WORKED** — no false positive, no R28-gap-fix needed. Subagent applied grep -c counts before commit, counts matched 1=1. Gap prevention loop CLOSED.

2. **Initial audit false alarm** — initial grep -c for raw markdown returned 0 for r24-s2, s3, s4. Re-verification showed subagent used TABLE format. All 5 r24-s* ARE referenced. No R28-gap-fix needed.

3. **Initial Phase 2.6 merge failed** — my in-round gap-fix attempts caused uncommitted changes. Resolved with `git stash push -u` + merge + `git stash drop`. The merge then brought the worktree commit (which had all 5 references) into main. **Lesson**: Don't manually edit files in main if worktree is already ahead.

4. **Toast screenshots already existed** (R24 captured them 4 rounds ago) — R28 just referenced them in README/zh-CN. No new screenshots needed.

5. **R26 sections preserved** — all 4/4 en + 3/3 zh-CN sections intact (SG.R22.1 verified 1=1).

## What worked well

- **Lead-direct execution at ~95 min** for 1 commit + 1 validation
- **SG.R22.2 worktree housekeeping** at Phase -0 (1 stale worktree removed + node_modules symlinked)
- **SG.R24.1 v5.3.8 SUCCESS for 4th consecutive round** — main CLEAN post-merge
- **SG.R25.1 newly embedded** (v5.3.9) — pre-commit verify gate worked as designed
- **No new tests** — R28 is docs-only, no source code changes
- **Test baseline preserved at 602/602** (8th round)
- **0 gaps surfaced** — R28 was a "smooth" round (SG.R25.1 first-time apply SUCCESS)

## Process improvements for R29+

1. **R29+ to continue SG.R25.1 first-time apply SUCCESS pattern** — pre-commit grep -c verify gate should be standard practice
2. **R29+ TOOLING**: Typecheck periodic verification (R22 carryover, R27 #55 fix unblocks)
3. **R29+ TOOLING**: Housekeeping — clean up pre-existing orphans `.omo/round-{21,22,23,24,25,26,27,28}/` (Oracle flagged in R27)
4. **R29+ TOOLING**: SG.R25.1 evolution — automate via pre-commit hook (e.g., husky, lint-staged)
5. **R29+ to use TABLE format for screenshot references** (R28 pattern) — cleaner than raw markdown

## What future sessions should know

1. **R28 SHIP landed clean** — main HEAD `b56e913`
2. **0 open issues** — both #57 and #58 closed
3. **8th consecutive SHIP** — test health continues stable at 602/602
4. **v5.3.9 SKILL.md in effect** — 52 retroactive patches, SG.R25.1 pre-commit verify gate active
5. **SG.R24.1 v5.3.8 works for 4th consecutive round** (R25 + R26 + R27 + R28 pattern)
6. **SG.R25.1 v5.3.9 first-time apply SUCCESS** — gap prevention loop CLOSED
7. **R29 candidates well-defined** — typecheck periodic + housekeeping + SG.R25.1 evolution
8. **CRITICAL MILESTONE** — R28 closed the 2nd loop improvement in R+ history (SG.R25.1)

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), stable across R21/R22/R23/R24/R25/R26/R27/R28.

## Loop state

- `.omo/round-28/`: 17 artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl`: 106 lines (96 pre-R28 + 10 R28)
- main HEAD: `b56e913` (synced to origin/main)
- 0 open issues · 2 R28 issues CLOSED
- Loop ready for R29

## Test baseline trend

| Round | Test count | Delta | Cumulative |
|---|---|---|---|
| R21 | 503 pass / 1 fail | baseline | 503 |
| R22 | 510 pass / 0 fail | +7 (1 fail eliminated) | 510 |
| R23 | 538 pass / 0 fail | +28 | 538 |
| R24 | 555 pass / 0 fail | +17 | 555 |
| R25 | 580 pass / 0 fail | +25 | 580 |
| R26 | 602 pass / 0 fail | +22 | 602 |
| R27 | 602 pass / 0 fail | 0 (internal-only) | 602 |
| R28 | 602 pass / 0 fail | 0 (docs-only) | 602 |

**6 NET POSITIVE rounds** (R22-R26), 2 preserved rounds (R27 + R28).

## Wall-clock stability

| Round | Wall-clock | Notes |
|---|---|---|
| R21 | ~95 min | baseline |
| R22 | ~85 min | smaller scope |
| R23 | ~95 min | 2 issues + 2 subagents |
| R24 | ~95 min | 2 issues + 2 subagents + gap-fix |
| R25 | ~95 min | 2 issues + 2 subagents + in-round gap-fix |
| R26 | ~95 min | 2 issues + 2 subagents, no gap-fix needed |
| R27 | ~95 min | 2 internal issues + 2 subagents, no gap-fix needed |
| R28 | ~95 min | 1 polish + 1 validation, docs-only |

**Stable ~95 min wall-clock** across 8 rounds.

## Critical milestone (R28 outcome)

R28 is the **8th round applying SG.R19.8 mandatory in-round gap-fix rule, AND the 1st round to actually USE the SG.R25.1 pre-commit verify gate** (embedded in v5.3.9 by R27). The gate worked as designed — subagent applied grep -c counts before commit, counts matched 1=1, no false positive, no R28-gap-fix needed. Gap prevention loop CLOSED.

**This is the 2nd loop improvement in R+ history**:
- 1st: SG.R19.8 (in-round gap-fix, R19 retro) — self-correcting mechanism
- 2nd: SG.R25.1 (pre-commit verify gate, R25 retro) — gap prevention loop

**Both improvements are durably embedded in SKILL.md** (v5.3.9 header, 52 retroactive patches cumulative). Future rounds benefit from BOTH improvements automatically.