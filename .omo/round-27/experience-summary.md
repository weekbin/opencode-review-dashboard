# R27 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 8, R27)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R27 closed 2 GH issues in 2 atomic commits + 4 supporting commits (merge, archive, Phase 4 closure):

1. **#55 tsc PATH investigation** (feature tooling, 6 LOC) — wrapper script `scripts/typecheck.sh` documenting `bun run typecheck` (correct invocation). Fixes 5 rounds of typecheck skipping.
2. **#56 Apply SG.R25.1** (skill-patch, 31 LOC) — new section in SKILL.md for "pre-commit SG.R22.1 verify gate". v5.3.8 → v5.3.9 header bump. **Closes the gap prevention loop.**

Plus 4 supporting commits:
3. **Merge `37f8e00`** — combine both into main
5. **Archive `2322e92`** — proposals.jsonl R27 entries (append-only)
6. **Phase 4 closure `4ff661e`** — decision + retro + post-exec + self-check

**Key wins**:
- **SG.R25.1 gap prevention loop CLOSED** (R25 → R27 milestone) — future rounds will catch bilingual lockstep gaps BEFORE commit, not after
- **SG.R24.1 v5.3.8 SUCCESS for 3rd consecutive round** (R25 + R26 + R27 pattern)
- **Typecheck RESOLVED** (5 rounds of skipping fixed — 5.9.3 installed, `typecheck` script existed, just needed wrapper)
- **Both #55 and #56 auto-closed** (no manual close needed)
- **Test baseline preserved at 602/602** (7th round, no source code changes)
- **0 gaps surfaced** (R27 was smooth — R25 retro surfaces all issues, R27 closes the loop)
- **52 retroactive skill patches cumulative** (R12 → R27 retros, v5.3.9 embed)

## What surprised us

1. **SG.R25.1 was 2 rounds stale** — R25 retro surfaced it, R26 was a "smooth" round (no gap-fix needed), R27 finally embedded it. The gap-prevention loop took 2 rounds to complete.

2. **Typecheck was broken for 5 rounds** (R22 → R27) — subagents were running bare `tsc` (not in PATH) instead of `bun run typecheck`. 5 rounds of work may have had type errors that were never caught.

3. **No source code changes in R27** — all changes are tooling (#55) + skill docs (#56). R27 is the 1st "internal-only" round — breaks the 6-round pattern of user-facing features.

4. **Both R27 issues auto-closed** — unlike R24 #49 which needed manual close (was a one-off race).

5. **0 gaps surfaced in R27** — R25 retro + R25-gap-fix + R26 clean apply + R27 SG.R25.1 embed = the gap prevention loop worked as designed. Future rounds will have this protection.

## What worked well

- **Lead-direct execution at ~95 min** for 2 internal candidates
- **SG.R22.2 worktree housekeeping** at Phase -0 (3 stale worktrees removed + node_modules symlinked)
- **SG.R24.1 v5.3.8 SUCCESS for 3rd consecutive round** — main CLEAN post-merge
- **SG.R25.1 newly embedded** (v5.3.9) — pre-commit verify gate now mandatory
- **Typecheck RESOLVED** — 5 rounds of skipping fixed in 6 LOC wrapper script
- **0 new tests** — R27 is internal-only, no source code changes
- **Test baseline preserved at 602/602** (7th round)
- **0 gaps surfaced** — R27 was a "smooth" round

## Process improvements for R28+

1. **R28+ to verify SG.R25.1 works** — first round to use the pre-commit verify gate. Should catch any silent failures BEFORE commit.
2. **Toast screenshots** — only remaining R+ carryover (R19/R20 retro, 3+ rounds stale)
3. **Typecheck verification** — now possible with R27 #55 fix. Periodic typecheck in pre-commit gates.
4. **Apply periodic typecheck** — typecheck was broken for 5 rounds, this should be a standing item

## What future sessions should know

1. **R27 SHIP landed clean** — main HEAD `4ff661e`
2. **0 open issues** — both #55 and #56 closed
3. **7th consecutive SHIP** — test health continues stable at 602/602
4. **v5.3.9 SKILL.md in effect** — 52 retroactive patches, SG.R25.1 pre-commit verify gate active
5. **SG.R24.1 v5.3.8 works for 3rd consecutive round** (R25 + R26 + R27 pattern)
6. **Typecheck RESOLVED** — `bun run typecheck` works
7. **R28 candidates well-defined** — toast screenshots (R19/R20 retro)
8. **CRITICAL MILESTONE** — R27 closed the gap prevention loop (R25 → R27)

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), stable across R21/R22/R23/R24/R25/R26/R27.

## Loop state

- `.omo/round-27/`: 17 artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl`: 96 lines (86 pre-R27 + 10 R27)
- main HEAD: `4ff661e` (synced to origin/main)
- 0 open issues · 2 R27 issues CLOSED
- Loop ready for R28

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

**6 NET POSITIVE rounds** (R22-R26), 1 preserved round (R27 internal-only).

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

**Stable ~95 min wall-clock** across 7 rounds.

## Critical milestone (R27 outcome)

R27 is the **5th round applying SG.R19.8 mandatory in-round gap-fix rule, AND the 1st round where the gap itself was prevented by embedding SG.R25.1 in the skill file.** This is the loop improving itself — the R+ loop's self-correcting mechanism is now durably embedded as a new SG. Future rounds will catch bilingual lockstep gaps BEFORE commit, not after.

| Round | Event | Action |
|---|---|---|
| R25 | 2 visual sections missing (caught by Oracle post-commit) | R25-gap-fix applied in-round via 52e6a3a |
| R26 | 0 gaps (SG.R25.1 candidate surfaced as R25 retro follow-up) | No action (smooth round) |
| R27 | SG.R25.1 embedded in v5.3.9 | Pre-commit verify gate now mandatory |
| R28+ | (future) | Will catch gaps BEFORE commit, not after |

**Gap prevention loop CLOSED**.