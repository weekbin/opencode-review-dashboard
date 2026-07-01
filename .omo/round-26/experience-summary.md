# R26 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 7, R26)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R26 closed 2 GH issues in 2 atomic commits + 5 supporting commits (merge, docs, archive, Phase 4 closure):

1. **#53 Per-finding "delete from history"** (feature, 118 LOC) — per-entry × button in Recent Searches dropdown. Reuses R25 #48 `removeRecentSearches()` pattern.
2. **#54 Bulk delete in conversation tab** (polish, 190 LOC) — per-finding checkbox + bulk "Delete selected" button. Reuses R25 #52 sidebar pattern.

Plus 5 supporting commits:
3. **Merge `123d86a`** — combine both into main
4. **Docs `65a1c43`** — README + zh-CN updates (2 new sections + 2 feature list entries each)
5. **Archive `adbc7a7`** — proposals.jsonl R26 entries (append-only)
6. **Phase 4 closure `ba648e5`** — decision + retro + post-exec + self-check
7. **No R26-gap-fix needed** — R26 had 0 gaps (clean doc update, SG.R24.1 worked)

**Key wins**:
- **SG.R24.1 v5.3.8 embed SUCCESS for 2nd consecutive round** (R25 + R26 SUCCESS pattern) — main CLEAN post-merge, no git stash workaround
- **6th NET POSITIVE round in a row** (538→555→580→602, +22 new tests, 0 regressions)
- **Both #53 and #54 auto-closed** (no manual close needed)
- **R23/R24/R25 sections preserved** (no accidental removal, unlike R25)
- **SG.R22.1 verified pre-commit** (4th application since v5.3.8 embed, zero silent failures)
- **0 gaps surfaced** (clean round)

## What surprised us

1. **SG.R24.1 worked for 2nd consecutive round** — R25 + R26 SUCCESS pattern CONFIRMED. Subagent double-write pattern fully PREVENTED.

2. **No R26-gap-fix needed** — R25 had a unique 2-section gap (accidental removal), R26 was clean from start. This is the EXPECTED behavior.

3. **Both R26 issues auto-closed** — unlike R24 #49 which needed manual close. Commit messages with issue numbers trigger GitHub auto-close correctly.

4. **R23/R24/R25 sections preserved** — R25 had a gap, R26 did NOT. The R25 gap-fix entry is working as designed (R25 retro surfaced the gap, R25-gap-fix applied in-round, R26 doesn't repeat).

5. **Test baseline NET POSITIVE 6th round in a row** — R21 503→R22 510→R23 538→R24 555→R25 580→R26 602.

## What worked well

- **Lead-direct execution at ~95 min** for 2 issues (1 feature + 1 polish)
- **SG.R22.2 worktree housekeeping** at Phase -0 (2 stale worktrees removed + node_modules symlinked)
- **SG.R22.1 bilingual lockstep verified** (4th application since v5.3.8 embed, no accidental removals)
- **SG.R20.1 3-step rebuild** held up (merge → build → grep verify)
- **SG.R24.1 SUCCESS** — main CLEAN post-merge (R25 + R26 SUCCESS pattern)
- **Test baseline NET POSITIVE 6th round in a row** (580→602)
- **0 gaps surfaced** — R26 was a "smooth" round (all SGs working as designed)

## Process improvements for R27+

1. **Apply SG.R25.1** — pre-commit SG.R22.1 verify mandatory gate (R25 retro candidate, deferred to R27+)
2. **tsc PATH investigation** — R22 carryover, 2 rounds stale
3. **Toast screenshots** — R19/R20 retro, 3+ rounds stale
4. **Screenshot capture** — schedule explicitly in Phase 3c (defer again to R27+)

## What future sessions should know

1. **R26 SHIP landed clean** — main HEAD `ba648e5`
2. **0 open issues** — both #53 and #54 closed
3. **6th NET POSITIVE round** — test health continues trending up
4. **SG.R24.1 v5.3.8 embed works for 2nd consecutive round** — subagent double-write pattern PREVENTED
5. **R27 candidates well-defined** — tsc PATH + SG.R25.1 + toast screenshots
6. **R25 + R26 SUCCESS pattern CONFIRMED** — lead-direct execution model continues to scale

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), stable across R21/R22/R23/R24/R25/R26.

## Loop state

- `.omo/round-26/`: 17 artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl`: 86 lines (76 pre-R26 + 10 R26)
- main HEAD: `ba648e5` (synced to origin/main)
- 0 open issues · 2 R26 issues CLOSED
- Loop ready for R27

## Test baseline trend

| Round | Test count | Delta | Cumulative |
|---|---|---|---|
| R21 | 503 pass / 1 fail | baseline | 503 |
| R22 | 510 pass / 0 fail | +7 (1 fail eliminated) | 510 |
| R23 | 538 pass / 0 fail | +28 | 538 |
| R24 | 555 pass / 0 fail | +17 | 555 |
| R25 | 580 pass / 0 fail | +25 | 580 |
| R26 | 602 pass / 0 fail | +22 | 602 |

**6 NET POSITIVE rounds in a row**. Test health trend continues up.

## Wall-clock stability

| Round | Wall-clock | Notes |
|---|---|---|
| R21 | ~95 min | baseline |
| R22 | ~85 min | smaller scope |
| R23 | ~95 min | 2 issues + 2 subagents |
| R24 | ~95 min | 2 issues + 2 subagents + gap-fix |
| R25 | ~95 min | 2 issues + 2 subagents + in-round gap-fix |
| R26 | ~95 min | 2 issues + 2 subagents, no gap-fix needed |

**Stable ~95 min wall-clock** across 6 rounds.