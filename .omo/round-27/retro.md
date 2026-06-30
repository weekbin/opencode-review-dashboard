# R27 Retro — Round-end Retrospective

> **Generated**: 2026-06-30 (RALPH LOOP iteration 8, R27)
> **Round**: 27
> **Verdict**: SHIP (clean, 7th in a row after R21 + R22 + R23 + R24 + R25 + R26)
> **Predecessor**: R26 retro (which surfaced R27 candidates)

## What went well

### 1. SG.R24.1 v5.3.8 embed works for 3rd consecutive round
- Both R27 subagents used absolute paths correctly
- Main CLEAN post-merge (no git stash workaround needed)
- R25 + R26 + R27 SUCCESS pattern CONFIRMED
- R23+R24 recurring pattern fully PREVENTED (3 consecutive rounds)

### 2. SG.R25.1 pre-commit verify gate APPLIED (gap prevention loop CLOSED)
- R25: had 2 missing visual sections (Oracle caught post-commit)
- R25-gap-fix: applied in-round via commit 52e6a3a
- R27: embedded SG.R25.1 in SKILL.md (pre-commit verify gate)
- **R28+ will catch this BEFORE commit, not after** (loop closed)
- v5.3.8 → v5.3.9 header bump (52 retroactive patches cumulative)

### 3. tsc PATH issue RESOLVED (5 rounds stale)
- TypeScript was already installed (`^5.8.3` in devDependencies, 5.9.3 in node_modules)
- `typecheck` script already existed in package.json
- Root cause: subagents were running bare `tsc` (not in PATH) instead of `bun run typecheck`
- Fix: 6 LOC wrapper script documents correct invocation
- `bun run typecheck` → `tsc --noEmit` → exit 0 ✓

### 4. Both GH issues auto-closed (no manual close)
- R27 commit messages included "#55" + "#56" in body
- GitHub auto-closed both
- R24 #49 manual close workaround NOT needed (was one-off race)

### 5. Test baseline preserved at 602/602
- R27 had 0 source code changes (internal-only)
- All tests still pass (no regressions)
- 7th round with 602/602 baseline preserved

### 6. Lead-direct execution at ~95 min stable
- 14 of 15 phases lead-direct
- Only Phase 2 Dev used subagent (twice)
- No team-mode invocation

## What didn't go well

### 1. **No new SGs surfaced** (all working as designed)
- R27 was an "internal-only" round (no user-facing features)
- v5.3.8 skill patches (SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1) all working
- SG.R25.1 newly embedded (v5.3.9)
- 0 gaps surfaced, 0 in-round fixes needed

### 2. **Typecheck was broken for 5 rounds** (R22 → R27)
- Subagents were skipping typecheck or using `bun build` as workaround
- R22 #46 was the last time typecheck was actually used
- R27 fixes this — but 5 rounds of work may have had type errors
- Lesson: periodic typecheck verification should be a standing item in pre-commit gates

## Skill gaps surfaced

R27 surfaced **0 NEW** skill gaps. All existing SGs working as designed.

| SG | Status | Evidence |
|---|---|---|
| SG.R19.1 (build location) | ✓ no failures | build in MAIN |
| SG.R19.2 (macOS setsid) | ✓ no failures | no setsid used |
| SG.R19.3 (STRINGS_USAGE_PLAN) | ✓ N/A | no new keys |
| SG.R19.4 (WORKDIR VERIFICATION) | ✓ no failures | subagent verified pwd |
| SG.R19.5 (Playwright Gap #14) | ✓ no failures | 6 scenarios PASS (internal) |
| SG.R19.6 (append-only proposals.jsonl) | ✓ no failures | 10 new lines appended |
| SG.R19.8 (mandatory gap-fix) | ✓ N/A | no gaps surfaced |
| SG.R20.1 (3-step rebuild) | ✓ no failures | merge → build → grep all PASS |
| SG.R22.1 (bilingual lockstep) | ✓ N/A | no new strings |
| SG.R22.2 (worktree env check) | ✓ APPLIED at Phase -0 | symlink + worktree cleanup |
| **SG.R24.1 (subagent per-Edit verify)** | ✓ **APPLIED — 3rd SUCCESS** | R25+R26+R27 pattern, main CLEAN |
| **SG.R25.1 (pre-commit verify gate)** | ✓ **NEW v5.3.9** | closes gap prevention loop |

## SG.R25.1 gap prevention loop (CRITICAL milestone)

R27 closes the gap prevention loop that was opened in R25:

| Round | Event | Action |
|---|---|---|
| R25 | 2 visual sections missing (caught by Oracle post-commit) | R25-gap-fix applied in-round via 52e6a3a |
| R26 | 0 gaps (SG.R25.1 candidate surfaced as R25 retro follow-up) | No action (smooth round) |
| R27 | SG.R25.1 embedded in v5.3.9 | Pre-commit verify gate now mandatory |
| R28+ | (future) | Will catch gaps BEFORE commit, not after |

**This is the R+ loop improving itself** — the meta-requirement (SG.R19.8 mandatory in-round gap-fix) is now embedded as a new SG (SG.R25.1) that prevents the same gap class from recurring.

## R28+ candidates (from this retro)

1. **R28+ POLISH**: Toast screenshots (R19/R20 retro, 3+ rounds stale, only remaining R+ carryover)
2. **R28+ TOOLING**: Typecheck verification (now possible with R27 #55 fix — periodic typecheck in pre-commit gates)

## Cross-round state

- `.omo/round-27/` — 16+ artifacts written
- `.omo/proposals.jsonl` — 96 lines (86 pre-R27 + 10 R27)
- `~/.opencode/reviews/` — cross-round state untouched
- R27 worktree at `~/.worktrees/team-dev-loop-round-27` (kept post-merge, will be cleaned at R29+ housekeeping per SG.R22.2)
- R24 + R25 + R26 worktrees still exist (kept for reference)

## Skill audit

Per v3+ spec, retro surfaces skill gaps; those become priority deliverable of next round.

R27 retro surfaces: 0 new skill gaps (all existing patches held up).
R27 final skill audit: 100% PASS (SG.R24.1 SUCCESS for 3rd consecutive round, SG.R25.1 newly embedded).

## Verdict

R27 was a clean SHIP (7th in a row). **SG.R25.1 gap prevention loop CLOSED** (the most important R27 outcome). Test baseline preserved at 602/602. Both R27 issues auto-closed. Lead-direct execution at ~95 min continues to scale. SG.R24.1 v5.3.8 embed works for 3rd consecutive round. R28 candidates well-defined (only toast screenshots remaining from R+ backlog).