# Phase 0.75 Planner — Round 36

**Date**: 2026-07-01 (lead-direct)
**Verdict**: PROCEED

## Round profile

- **Profile**: polish (R36 is the 1 polish-budgeted round for R34-R36 cycle)
- **Hard caps**: feature ≤3 ✓ (1 selected: AC3) | bugfix ≤5 ✓ (2 selected: AC1+AC2) | polish ≤1 ✓ (R36 is the 1) | total ≤8 ✓ (3) | architecture ≤1 ✓ (0)
- **Result**: PROCEED with 3 items

## Ranking table (composite math)

| Rank | Item | User-value (10) | Effort-inverted (10) | Risk-inverted (5) | Total /25 |
|---|---|---|---|---|---|
| 1 | AC1 (test fail fix) | 8 (test integrity restored) | 10 (5 min, 1-line) | 5 (typing) | **23** |
| 2 | AC2 (Previously discussed redesign) | 6 (user-pain: "完全是不能接受的") | 7 (1-2h via 1 subagent) | 4 (CSS redesign) | **17** |
| 3 | AC3 (worktree copy button) | 6 (user-pain: NEW feature request) | 8 (1-1.5h via 1 subagent) | 4 (new feature) | **18** |

Items by priority: AC1 → AC3 → AC2 (test integrity first, then new feature, then redesign).

## Scope selected (R36)

```yaml
planner_scope:
  round: 36
  items:
    - id: AC1
      type: bugfix (1 line)
      target: src/ui/i18n.ts
      desc: "Add 'skipLink' key to STRINGS table (or remove from review.html) to fix AC1.2 i18n test"
      executor: lead-direct (no subagent needed, <15 min wall)
    - id: AC3
      type: feature
      target: src/ui/app.ts + src/ui/review.html
      desc: "Worktree branch copy button (per v5.3.12 Patch 1: 1 subagent = 1 AC, ≤15min wall)"
    - id: AC2
      type: bugfix
      target: src/ui/review.html
      desc: "Previously discussed tab redesign (per v5.3.12 Patch 1: 1 subagent = 1 AC, ≤15min wall)"
  dropped: []
  total_loc: ~205
  profile: polish
  total_atomic_commits: 3 (1 lead-direct + 2 subagent)
  subagent_dispatch: 2 parallel (AC2 + AC3, 1 AC each)
```

## Decision rationale

**Why this order**:
1. **AC1 first** (lead-direct) — fixes pre-existing 1 test fail. Unblocks 100% R36 test pass rate. No subagent needed (1 line change). Also establishes the baseline for AC2+AC3 to test against.
2. **AC3 second** (1 subagent) — NEW feature, smaller scope (1 button + i18n key). Higher risk → ship earlier so R36 doesn't fail at AC2 (larger scope) at the end.
3. **AC2 third** (1 subagent) — LARGEST scope (1-2h, ~150 LOC redesign). Ship last when more time available; if it fails, can defer to R37.

**Why 2 subagents not 1**:
- v5.3.12 Patch 1 (NEW): "Default: 1 subagent = 1 AC, ≤15min wall"
- AC2 + AC3 are SEPARATE ACs → dispatch as 2 PARALLEL sub-tasks
- If combined: would hit 30min cap (M3 model unstable for multi-AC)
- If parallel: 2 sub-tasks × 15min wall = 15min total (better)

## Backlog freshness gate

PLANNER SELF-CHECK: 12 stale worktrees (R12-R17) already cleaned in R34 AC5. R21-R31 retro cleanup (33 files) committed in R35 AC3. R35 retro closure (33 files) committed in R35 AC4. No new backlog candidates at freshness age ≥3 rounds.

R36 PROCEED is appropriate.

## Inherited scope from PM Manager

Copied verbatim from `pm-manager-review.md ## Validated for next round` section. No truncation.

## Phase 0.75 verdict

**PROCEED** with 3 items (AC1 lead-direct, AC2 + AC3 parallel sub-tasks). Phase 1 Architect can proceed.
