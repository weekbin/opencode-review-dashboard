# R24 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 5, R24)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R24 closed 2 GH issues in 2 atomic commits + 3 supporting commits (merge, archive, gap-fix):

1. **#50 Toast screenshots** (polish docs, 8 lines + 5 PNGs) — captured 5 real playwright-cli screenshots + updated README + README.zh-CN.md. R19/R20 carryover FINALLY closed after 5+ rounds.
2. **#49 Per-hunk diff expand/collapse** (feature, 413 LOC) — extends R23 #47 virtualization with per-hunk collapse state + "Expand all"/"Collapse all" buttons. R23 virtualization preserved via AC 9.6 regression test.

Plus 3 supporting commits:
3. **Merge `e4bffb7`** — combine both into main
4. **Archive `c05afe9`** — proposals.jsonl R24 entries (append-only)
5. **R24-gap-fix `40909fe`** — patch SKILL.md to v5.3.8 with SG.R24.1 (subagent double-write prevention) per SG.R19.8 mandatory in-round fix

**Key wins**:
- **4th NET POSITIVE round in a row** (538/0 → 555/0, +17 new tests)
- **v5.3.7 → v5.3.8** SKILL.md patch (SG.R24.1 embedded, 51 cumulative retroactive patches)
- **R19/R20 carryover finally closed** (toast screenshots)
- **R23 virtualization preserved** (per-hunk collapse adds to, not replaces, the R23 pattern)
- **SG.R19.8 mandatory gap-fix applied in-round** (no deferred gap-fixes)

## What surprised us

1. **Subagent double-write pattern** — R23 subagent #48 AND R24 subagent #49 both wrote to BOTH worktree AND main directory, despite v5.3.7 SG.R22.2 embed + explicit "WRITE TO WORKTREE DIRECTORY ONLY" instruction. Embedded SGs are NOT enough — subagent needs per-Edit `pwd` verification rule. **NEW SG.R24.1 captured**.

2. **playwright-cli for real screenshots** — R24 subagent used playwright-cli (real browser) instead of placeholder PNGs. 5 PNG files at ~130 kB each (better than 1x1 placeholders).

3. **#49 did not auto-close** — R24 subagent commit body DID mention "#49" but GitHub didn't auto-close (timing or format issue). #50 DID auto-close. Manual close with reference comment (30 sec).

4. **R23 DiffVirtualizer preserved** — #49 extended R23 #47 virtualization with per-hunk collapse state. AC 9.6 regression test + 1000-mock-hunk stress test both PASS. IntersectionObserver pattern reusable.

## What worked well

- **Lead-direct execution at ~95 min** for 2 issues (1 feature + 1 polish docs)
- **SG.R22.2 worktree housekeeping** at Phase -0 (v5.3.7 embed) — removed 4 stale worktrees + symlinked node_modules
- **SG.R22.1 bilingual lockstep verified pre-commit** (2nd application since v5.3.7 embed, zero silent failures)
- **SG.R20.1 3-step rebuild** held up (merge → build → grep verify)
- **In-round gap-fix per SG.R19.8** — R24 NEW SG.R24.1 applied, not deferred
- **Test baseline NET POSITIVE 4th round in a row** (538/0 → 555/0)
- **playwright-cli real screenshots** (R19/R20 carryover finally closed)

## Process improvements for R25+

1. **Subagent prompt MUST include**: "Before EVERY Write/Edit, run `pwd` and verify `pwd == <WORKTREE_PATH>`" (per SG.R24.1)
2. **Subagent should use absolute paths** in Write/Edit tool calls (not relative paths)
3. **#49 manual close pattern** — assume auto-close race, always have manual close as fallback

## What future sessions should know

1. **R24 SHIP landed clean** — main HEAD `40909fe` (after R24-gap-fix)
2. **0 open issues** — both #49 and #50 closed
3. **4th NET POSITIVE round** — test health continues trending up
4. **v5.3.8 SKILL.md in effect** — SG.R24.1 embedded for subagent double-write prevention
5. **R25 candidates well-defined** — diff virt toggle, per-finding delete, sidebar bulk delete, tsc PATH
6. **R23+R24 pattern documented** — embedding SGs alone is not enough; subagent needs explicit per-Edit verification

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), stable across R21/R22/R23/R24.

## Loop state

- `.omo/round-24/`: 16 artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl`: 65 lines (54 pre-R24 + 10 R24 + 1 R24-gap-fix)
- main HEAD: `40909fe` (synced to origin/main)
- 0 open issues · 2 R24 issues CLOSED
- Loop ready for R25

## Test baseline trend

| Round | Test count | Delta | Cumulative |
|---|---|---|---|
| R21 | 503 pass / 1 fail | baseline | 503 |
| R22 | 510 pass / 0 fail | +7 (1 fail eliminated) | 510 |
| R23 | 538 pass / 0 fail | +28 | 538 |
| R24 | 555 pass / 0 fail | +17 | 555 |

**4 NET POSITIVE rounds in a row**. Test health trend continues up.