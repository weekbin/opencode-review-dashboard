# R27 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 8, R27)
> **Inputs**: R26 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-26/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.8 spec — no user pick)

## Round context

R26 SHIP landed clean (6th NET POSITIVE: 602/602 tests, 0 open issues). R26 was a "smooth" round with 0 gaps. Sync confirms main HEAD `ba648e5` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 602/602 tests baseline.

## R27 candidates (from R26 retro + R25 retro + R22 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R22 carryover | **tsc PATH investigation** (5 rounds stale — carries since R22 #46 fix) | feature | 5-15 | LOW | 0/5 (internal, but unlocks future typecheck) |
| 2 | R25 retro | **Apply SG.R25.1** (pre-commit SG.R22.1 verify mandatory gate) | skill-patch | 5-10 | LOW | 0/5 (internal, prevents future bilingual lockstep gaps) |
| 3 | R19/R20 retro | Toast screenshots (3+ rounds stale) | polish | 10-20 | LOW | 2/5 |

## Backlog freshness check

Stale issues: **0** (R21-R26 closed all pm-manager-approved). R27 candidates are all carryovers (5 rounds stale for tsc, 2 rounds for SG.R25.1, 7+ rounds for toast screenshots).

## Candidate validation per PM product-value gate

### #1 tsc PATH investigation (R22 carryover)
- **README 缺段?** No — README doesn't mention tsc. ✓ honest
- **Non-developer visible?** Internal (developer tooling). But unlocks future typecheck for subagents. ✓ developer-experience
- **竞品已有?** N/A (development environment) ✓
- **Scope**: Investigate why `tsc` is not in PATH on this machine. Options: (1) add to PATH via shell config, (2) document `bun build --target=bun` as typecheck alternative, (3) install TypeScript locally as devDep.
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (carries since R22, time to resolve)

### #2 Apply SG.R25.1 skill patch (R25 retro candidate)
- **README 缺段?** No (internal skill file)
- **Non-developer visible?** Internal (skill file). Prevents future bilingual lockstep gaps (R25 had 2 missing visual sections caught by Oracle).
- **竞品已有?** N/A
- **Scope**: Add new section to SKILL.md for "pre-commit SG.R22.1 verify mandatory gate" (run grep -c BEFORE commit, not after). Embed the rule in phase-prompts.md or as a pre-commit hook.
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (skill-patch, prevents future gaps)

### #3 Toast screenshots (deferred)
- **Why deferred**: polish quota already used by #1 (or #2). Toast screenshots have been deferred 3+ rounds (R19/R20 retro); can wait for R28+.

## R27 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | tsc PATH investigation | feature | 5-15 | 1 |
| 2 | Apply SG.R25.1 (pre-commit SG.R22.1 verify gate) | skill-patch | 5-10 | 1 |
| **TOTAL** | | | **10-25** | **2 atomic commits** |

## Caps check

| Cap | Limit | R27 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (tsc) + 1 skill (SG.R25.1) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 0 | ✓ (within cap) |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN

**No new STRINGS keys** for R27 (both candidates are internal/tooling/skill-patch).

## Out-of-scope (deferred to R28+)

- Toast screenshots (R19/R20 retro, 3+ rounds stale)
- Any new feature from user feedback (R+ carryover)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-27-tsc-investigation-and-sg25-1-skill-patch`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-27`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)
- Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (SG.R24.1 — v5.3.8 embed, R25+R26 SUCCESS)

## OK to proceed

✓ All caps honored. ✓ Risk LOW for both. ✓ ACs testable. ✓ No i18n needed. Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. SG.R24.1 will apply at Phase 2 subagent prompts.