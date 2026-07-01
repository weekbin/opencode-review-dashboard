# R28 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 9, R28)
> **Inputs**: R27 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-27/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.9 spec — no user pick)
> **CRITICAL**: R28 is the FIRST round to use SG.R25.1 pre-commit verify gate

## Round context

R27 SHIP landed clean (7th NET POSITIVE preserved: 602/602 tests, 0 open issues). R27 was the 5th round applying SG.R19.8 mandatory in-round gap-fix rule, AND the 1st round where the gap itself was prevented by embedding SG.R25.1 in the skill file (v5.3.9). R27 is the 1st "internal-only" round (no source code changes, no user-facing features). Sync confirms main HEAD `4ff661e` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 602/602 tests baseline.

## R28 candidates (from R27 retro + R19/R20 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R19/R20 retro | **Toast screenshots** (R19 + R20 + R21 + R22 + R23 + R24 + R25 + R26 + R27 — 9 rounds stale!) | polish | 10-20 | LOW | 2/5 |
| 2 | R27 retro | **R28+ verify SG.R25.1 works** (first round to use the pre-commit verify gate) | skill-validation | 5-10 | LOW | 0/5 (internal) |
| 3 | R22 carryover | Typecheck periodic verification (R27 #55 fix unblocks) | tooling | 5-15 | LOW | 0/5 (internal) |

## Backlog freshness check

Stale issues: **0** (R21-R27 closed all pm-manager-approved). R28 candidates are all carryovers (9 rounds stale for toast screenshots, 1 round for SG.R25.1 verification).

## Candidate validation per PM product-value gate

### #1 Toast screenshots (R19/R20 retro, 9 rounds stale)
- **README 缺段?** Yes — README "Toast notifications" + "Auto-save indicator" sections are text-only. ✓
- **Non-developer visible?** Yes — toast UI is user-facing. ✓ user-visible
- **竞品已有?** Yes (every modern app has toast screenshots in docs). ✓ defensible
- **Scope**: Capture 4 toast screenshots via playwright-cli (added review, copied permalink, copied as MD, submitted review) + update README + README.zh-CN.md to reference screenshots. 9 rounds stale — should have been done in R24 (which DID capture toast screenshots but only 4, missing some types).
- **STRINGS**: 0 new keys (just images)
- **VERDICT**: SELECT (9 rounds stale, definitely time to address)

### #2 R28+ verify SG.R25.1 works (R27 retro)
- **README 缺段?** N/A (internal)
- **Non-developer visible?** N/A (internal)
- **竞品已有?** N/A
- **Scope**: First round to use the pre-commit verify gate. Should catch any silent failures BEFORE commit, not after. If successful, no action needed (gap prevention loop working as designed).
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (validation of new SG)

### #3 Typecheck periodic verification (R22 carryover, R27 #55 fix unblocks)
- **Why deferred**: tooling, not user-facing. R27 #55 already fixed the tsc PATH issue. Periodic typecheck can be added to pre-commit gates in R29+.

## R28 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Toast screenshots (R19/R20 retro, 9 rounds stale) | polish | 10-20 | 1 |
| 2 | R28+ verify SG.R25.1 works (no-op if successful) | skill-validation | 0 (just test) | 0 (no commit) |
| **TOTAL** | | | **10-20** | **1 atomic commit** |

## Caps check

| Cap | Limit | R28 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 0 + 1 polish | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 1 | ✓ |
| polish | ≤ 1 | 1 (toast screenshots) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN

**No new STRINGS keys** for R28 (toast screenshots are just images, no new UI text).

## Out-of-scope (deferred to R29+)

- Typecheck periodic verification (R22 carryover, R27 #55 fix unblocks)
- Housekeeping: clean up pre-existing orphans `.omo/round-21/`, `.omo/round-22/`, `.omo/round-23/brief.md` (Oracle flagged in R27)
- Any new feature from user feedback (R+ carryover)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-28-toast-screenshots`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-28`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)
- Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (SG.R24.1 — v5.3.8 embed, R25+R26+R27 SUCCESS)
- **NEW v5.3.9**: Pre-commit SG.R22.1 verify gate (SG.R25.1) — subagent must run grep -c counts BEFORE git commit

## OK to proceed

✓ All caps honored. ✓ Risk LOW. ✓ ACs testable. ✓ No new STRINGS keys. Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. SG.R24.1 + SG.R25.1 will apply at Phase 2 subagent prompts.