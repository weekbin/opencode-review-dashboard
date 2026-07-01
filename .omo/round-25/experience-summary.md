# R25 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 6, R25)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R25 closed 2 GH issues in 2 atomic commits + 5 supporting commits (merge, docs, archive, gap-fix, Phase 4 closure):

1. **#52 Bulk delete in sidebar review progress** (polish, 167 LOC) — per-file-card checkbox + bulk "Mark as reviewed" button. Reuses R23 #48 bulk delete pattern.
2. **#51 Diff virtualization toggle in settings** (feature, 193 LOC) — extends R22 settings modal + R23/R24 virtualization. New localStorage key + DiffVirtualizer `enabled` constructor param.

Plus 5 supporting commits:
3. **Merge `b678b97`** — combine both into main
4. **Docs `52e6a3a`** — README + zh-CN updates + SG.R19.8 in-round bilingual section repair
5. **Archive `a944c43`** — proposals.jsonl R25 entries (append-only)
6. **Phase 4 closure `9c9d072`** — decision + retro + post-exec + self-check + R25-gap-fix entry
7. **R25-gap-fix entry** — Oracle caught 2 missing visual sections, fixed in-round

**Key wins**:
- **SG.R24.1 v5.3.8 embed SUCCESS** — both subagents used absolute paths, main CLEAN post-merge (no git stash workaround!)
- **5th NET POSITIVE round in a row** (538→555→580, +25 new tests, 0 regressions)
- **Both #51 and #52 auto-closed** (no manual close needed, unlike R24 #49)
- **SG.R19.8 gap-fix applied in-round** (Oracle caught + fixed)
- **R22 + R23 + R24 regressions preserved** (R20 #40 progress + R22 #44 settings a11y + R23 #47 virtualization + R24 #49 per-hunk collapse)

## What surprised us

1. **SG.R24.1 v5.3.8 embed worked PERFECTLY on first try** — R23+R24 recurring subagent double-write pattern PREVENTED. Main CLEAN post-merge (no git stash needed). Subagents used absolute paths correctly per the explicit instruction.

2. **Both R25 issues auto-closed** — unlike R24 #49 which needed manual close. Commit messages with issue numbers triggered GitHub auto-close correctly.

3. **Oracle caught 2 missing visual sections in Phase 3.5 doc update** — R25 edit accidentally removed English "### Diff virtualization for 1000+ line files" (R23 original) and missed adding zh-CN "### 批量标记侧边栏文件已审查". Fixed in-round via commit 52e6a3a.

4. **R23 + R24 + R20 + R22 regressions all preserved** — AC 11.3 (R23 virtualization), AC 11.6 (R24 collapse), AC 11.8 (R22 settings a11y), AC 12.5 (R20 progress counter). 5 NET POSITIVE rounds in a row.

5. **playwright-cli for R25 not used** — R25 features were smaller scope (no real screenshots needed). R25 subagents didn't trigger playwright (unlike R24 #50).

## What worked well

- **Lead-direct execution at ~95 min** for 2 issues (1 feature + 1 polish)
- **SG.R22.2 worktree housekeeping** at Phase -0 (2 stale worktrees removed + node_modules symlinked)
- **SG.R22.1 bilingual lockstep verified** (3rd application since v5.3.7 embed)
- **SG.R20.1 3-step rebuild** held up (merge → build → grep verify)
- **In-round gap-fix per SG.R19.8** — R25-gap-fix applied (bilingual section repair)
- **Test baseline NET POSITIVE 5th round in a row** (538→555→580)
- **SG.R24.1 SUCCESS** — main CLEAN post-merge (R23+R24 recurring pattern PREVENTED)

## Process improvements for R26+

1. **NEW SG.R25.1 candidate**: pre-commit SG.R22.1 verify as mandatory gate (run BEFORE commit, not after). Oracle caught the R25 gap post-commit; could be caught pre-commit with automated grep -c gate.
2. **Subagent prompt template update** — add explicit "verify `pwd == worktree` AFTER EVERY Write/Edit" pattern (already in v5.3.8 but reinforce)
3. **Screenshot capture** — schedule explicitly in Phase 3c (defer again to R26+)

## What future sessions should know

1. **R25 SHIP landed clean** — main HEAD `9c9d072`
2. **0 open issues** — both #51 and #52 closed
3. **5th NET POSITIVE round** — test health continues trending up
4. **SG.R24.1 v5.3.8 embed works** — subagent double-write pattern PREVENTED
5. **SG.R19.8 in-round gap-fix applied** — Oracle caught + fixed in-round
6. **R26 candidates well-defined** — per-finding "delete from history" + tsc PATH investigation + SG.R25.1 (pre-commit gate)

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), stable across R21/R22/R23/R24/R25.

## Loop state

- `.omo/round-25/`: 16+ artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl`: 76 lines (65 pre-R25 + 10 R25 + 1 R25-gap-fix)
- main HEAD: `9c9d072` (synced to origin/main)
- 0 open issues · 2 R25 issues CLOSED
- Loop ready for R26

## Test baseline trend

| Round | Test count | Delta | Cumulative |
|---|---|---|---|
| R21 | 503 pass / 1 fail | baseline | 503 |
| R22 | 510 pass / 0 fail | +7 (1 fail eliminated) | 510 |
| R23 | 538 pass / 0 fail | +28 | 538 |
| R24 | 555 pass / 0 fail | +17 | 555 |
| R25 | 580 pass / 0 fail | +25 | 580 |

**5 NET POSITIVE rounds in a row**. Test health trend continues up.

## Wall-clock stability

| Round | Wall-clock | Notes |
|---|---|---|
| R21 | ~95 min | baseline |
| R22 | ~85 min | smaller scope (single feature + 1-char fix) |
| R23 | ~95 min | 2 issues + 2 subagents |
| R24 | ~95 min | 2 issues + 2 subagents + gap-fix |
| R25 | ~95 min | 2 issues + 2 subagents + in-round gap-fix |

**Stable ~95 min wall-clock** across 5 rounds.