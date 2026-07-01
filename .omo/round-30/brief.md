# R30 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 11, R30)
> **Inputs**: R29 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-29/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.9 spec — no user pick)
> **CRITICAL**: R30 is the 3rd round to use SG.R25.1 pre-commit verify gate

## Round context

R29 SHIP landed clean (9th NET POSITIVE preserved: 602/602 tests, 0 open issues). R29 was the 2nd round to use SG.R25.1 pre-commit verify gate (embedded in v5.3.9 by R27). Gate WORKED as designed. Sync confirms main HEAD `0a3b9ab` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 602/602 tests baseline.

## R30 candidates (from R29 retro + R28 retro)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R28 retro | **SG.R25.1 evolution** — husky pre-commit hook automation (R28 retro candidate, deferred to R30+) | skill-patch | 5-10 | LOW | 0/5 (internal, automation) |
| 2 | R29 retro | **Pre-existing orphans cleanup** — investigate `.omo/round-{21..28}/*.md` working files (selective commit pattern or ignore) | tooling | 5-10 | LOW | 0/5 (internal, housekeeping) |
| 3 | R22 carryover | Tsc PATH investigation (R29 #59 added GitHub Actions, but local dev experience still broken) | tooling | 5-15 | LOW | 0/5 (internal) |

## Backlog freshness check

Stale issues: **0** (R21-R29 closed all pm-manager-approved). R30 candidates are all internal carryovers (2 rounds stale for SG.R25.1 evolution, 3 rounds stale for housekeeping, 8 rounds stale for tsc).

## Candidate validation per PM product-value gate

### #1 SG.R25.1 evolution — husky pre-commit hook automation
- **README 缺段?** N/A (internal automation)
- **Non-developer visible?** Internal (automation)
- **竞品已有?** Yes (pre-commit hooks are standard)
- **Scope**: Install husky + lint-staged as devDeps. Create `.husky/pre-commit` hook that runs `bun run typecheck` + `grep -c` SG.R22.1 verification + `git status` clean check. Automates the manual verification steps.
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (automation prevents future gaps)

### #2 Pre-existing orphans cleanup
- **README 缺段?** N/A (internal housekeeping)
- **Non-developer visible?** Internal (housekeeping)
- **竞品已有?** N/A
- **Scope**: Investigate `.omo/round-{21..28}/*.md` working files. Either:
  - Option A: Commit selectively (closure docs only, matching R25+ pattern)
  - Option B: Add to .gitignore as permanently untracked
  - Option C: Leave as-is (established pattern)
- **STRINGS**: 0 new keys
- **VERDICT**: SELECT (investigation overdue)

### #3 Tsc PATH investigation (R22 carryover, 8 rounds stale)
- **Why deferred**: R29 #59 added GitHub Actions typecheck (PR-time). But local dev experience still broken (R23-R28 subagents all reported "tsc: command not found" before R27 #55 wrapper). R30 could add a shell config or devDep to fix local tsc.
- **VERDICT**: SELECT if budget allows (low priority — CI works via GitHub Actions)

## R30 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | SG.R25.1 evolution (husky pre-commit hook automation) | skill-patch | 5-10 | 1 |
| 2 | Pre-existing orphans cleanup | tooling | 5-10 | 1 |
| **TOTAL** | | | **10-20** | **2 atomic commits** |

## Caps check

| Cap | Limit | R30 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 0 + 2 tooling | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 0 | ✓ (within cap) |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN

**No new STRINGS keys** for R30 (all internal/tooling).

## Out-of-scope (deferred to R31+)

- Tsc PATH investigation (R22 carryover, 8 rounds stale)
- Any new feature from user feedback (R+ carryover)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-30-sg25-1-evolution`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-30`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)
- Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (SG.R24.1 — 5th consecutive SUCCESS pattern)
- **v5.3.9 SG.R25.1**: Pre-commit grep -c verify gate (R30 is 3rd round to use this gate)

## OK to proceed

✓ All caps honored. ✓ Risk LOW for both. ✓ ACs testable. ✓ No new STRINGS keys. Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. SG.R24.1 + SG.R25.1 will apply at Phase 2 subagent prompts.