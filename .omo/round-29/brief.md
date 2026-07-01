# R29 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 10, R29)
> **Inputs**: R28 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-28/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.9 spec — no user pick)
> **CRITICAL**: R29 is the 2nd round to use SG.R25.1 pre-commit verify gate

## Round context

R28 SHIP landed clean (8th NET POSITIVE preserved: 602/602 tests, 0 open issues). R28 was the FIRST round to use SG.R25.1 pre-commit verify gate (embedded in v5.3.9 by R27). Gate WORKED as designed. Sync confirms main HEAD `b56e913` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 602/602 tests baseline.

## R29 candidates (from R28 retro + R22 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R22 carryover | **Typecheck periodic verification** (R22 #46 fix unblocks — R27 #55 added `bun run typecheck` script) | tooling | 5-15 | LOW | 0/5 (internal, but unblocks future typecheck) |
| 2 | Oracle flagged R27 | **Housekeeping: clean up pre-existing orphans** `.omo/round-{21,22,23,24,25,26,27,28}/*.md` | tooling | 5-10 | LOW | 0/5 (internal, housekeeping) |
| 3 | R28 retro | **SG.R25.1 evolution** — automate via pre-commit hook (e.g., husky, lint-staged) | skill-patch | 5-10 | LOW | 0/5 (internal, automation) |

## Backlog freshness check

Stale issues: **0** (R21-R28 closed all pm-manager-approved). R29 candidates are all internal carryovers (2 rounds stale for typecheck, 1 round for housekeeping, 1 round for SG.R25.1 evolution).

## Candidate validation per PM product-value gate

### #1 Typecheck periodic verification (R22 carryover, R28 unblock)
- **README 缺段?** No — README doesn't mention typecheck. ✓ honest
- **Non-developer visible?** Internal (developer tooling). But unlocks future typecheck for subagents. ✓ developer-experience
- **竞品已有?** N/A (development environment) ✓
- **Scope**: Add a `typecheck` script to package.json OR add pre-commit typecheck hook. R27 #55 already added `scripts/typecheck.sh` (wraps `bun run typecheck`). R29 could add periodic typecheck to pre-commit gates.
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (R22 carryover, time to address)

### #2 Housekeeping: clean up pre-existing orphans (Oracle flagged R27)
- **README 缺段?** N/A (internal)
- **Non-developer visible?** Internal (housekeeping)
- **竞品已有?** N/A
- **Scope**: Commit `.omo/round-{21,22,23,24,25,26,27,28}/*.md` to git OR delete them. The `.gitignore` says `.omo/round-N/` is "IS tracked" but R21-R28 dirs were orphaned in their original rounds.
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (Oracle flagged in R27, time to address)

### #3 SG.R25.1 evolution — automate via pre-commit hook (R28 retro candidate)
- **Why deferred**: skill-patch is internal. R28 already validated SG.R25.1 manually (subagent applied grep -c before commit). Automation via pre-commit hook would be the next step but requires more setup.
- **VERDICT**: SELECT if budget allows (low LOC, low risk)

## R29 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Typecheck periodic verification (R22 carryover) | tooling | 5-15 | 1 |
| 2 | Housekeeping: clean up pre-existing orphans | tooling | 5-10 | 1 |
| **TOTAL** | | | **10-25** | **2 atomic commits** |

## Caps check

| Cap | Limit | R29 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 0 + 2 tooling | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 0 | ✓ (within cap) |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN

**No new STRINGS keys** for R29 (all internal/tooling).

## Out-of-scope (deferred to R30+)

- SG.R25.1 evolution (pre-commit hook) — if budget allows, can be added; otherwise R30+
- Any new feature from user feedback (R+ carryover)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-29-typecheck-and-housekeeping`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-29`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)
- Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (SG.R24.1 — v5.3.8 embed, R25+R26+R27+R28 SUCCESS)
- **v5.3.9 SG.R25.1**: Pre-commit grep -c verify gate (R29 is 2nd round to use)

## OK to proceed

✓ All caps honored. ✓ Risk LOW for both. ✓ ACs testable. ✓ No new STRINGS keys. Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. SG.R24.1 + SG.R25.1 will apply at Phase 2 subagent prompts.