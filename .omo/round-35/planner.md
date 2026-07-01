# Phase 0.75 Planner — Round 35

**Date**: 2026-07-01 (lead-direct)
**Verdict**: PROCEED

## Round profile

- **Profile**: bugfix (5 housekeeping items, all dev-process)
- **Hard caps**: feature ≤3 ✓ (0 selected) | bugfix ≤5 ✓ (5 selected) | polish ≤1 ✓ (R34 was the 1) | total ≤8 ✓ (5) | architecture ≤1 ✓ (0)
- **Result**: PROCEED with 5 items

## Ranking table (composite math)

| Rank | Item | User-value (10) | Effort-inverted (10) | Risk-inverted (5) | Total /25 |
|---|---|---|---|---|---|
| 1 | AC1 (husky wire) | 6 (unblocks future husky gate) | 10 (5 min) | 5 (bun install safe) | **21** |
| 2 | AC5 (TS error fix) | 7 (unblocks husky gate immediately) | 10 (5 min, 1-line) | 5 (typing) | **22** |
| 3 | AC3 (R21-R31 retro defect) | 8 (data loss risk) | 7 (~30 min, 10 files) | 4 (modifications old) | **19** |
| 4 | AC4 (husky verify) | 5 (validation only) | 9 (10 min) | 5 (verification) | **19** |
| 5 | AC2 (stale branches) | 2 (cosmetic) | 10 (5 min) | 5 (git ops) | **17** |

Items by ID priority: AC5 → AC1 → AC4 → AC3 → AC2 (TS error first, then husky wire + verify, then retro defect, then branches).

## Scope selected (R35)

```yaml
planner_scope:
  round: 35
  items:
    - id: AC5
      type: bugfix
      target: src/index.ts
      desc: "Fix 'Expected 0 arguments, but got 1' TS error at line 2470 (R32-era)"
    - id: AC1
      type: plumbing
      target: package.json + .husky/
      desc: "Run 'bun install' to wire .git/hooks/pre-commit (R30 #61 husky config was added but never wired)"
    - id: AC4
      type: skill patch
      target: .husky/pre-commit
      desc: "Verify husky gate works after AC1 wire (run 'bun run check' + 'bun test' pre-commit)"
    - id: AC3
      type: bugfix
      target: 10 files (.omo/proposals.jsonl + src/{index, ui/{conversation-bulk.test, diff-virtualization.test, diff-virtualization, i18n.test, i18n, settings.test, sidebar-bulk.test}}.ts)
      desc: "Pop R21-R31 stash, commit pre-existing modifications as 'R21-R31 retro defect cleanup' commit"
    - id: AC2
      type: plumbing
      target: refs/heads/
      desc: "Delete 8 stale branches (R12-R17 + R33 + R34) via 'git branch -D'"
  dropped: ['#69 (R36)', '#72 (R36)']
  total_loc: ~225 / -70 across ~12 files
  profile: bugfix
  total_atomic_commits: 3-5 (AC5+AC1+AC4 may be bundled; AC3 standalone; AC2 standalone)
```

## Decision rationale

**Why this order**:
1. **AC5 first** (TS error fix) — unblocks husky gate immediately. Without this, AC4 verify won't work.
2. **AC1 second** (husky wire) — runs `bun install` which now passes husky gate (thanks to AC5).
3. **AC4 third** (husky verify) — confirm gate works.
4. **AC3 fourth** (R21-R31 retro defect commit) — biggest change, done with husky gate now working (cleaner commit).
5. **AC2 fifth** (stale branches) — cosmetic cleanup, do last.

## Backlog freshness gate

PLANNER SELF-CHECK: 12 stale worktrees from R4-R17 detected in Phase -0 sync. **ALREADY ADDRESSED** in R34 AC5 (14 worktrees removed). R35 AC2 will delete the branch refs.

No other backlog candidates at freshness age ≥3 rounds. R35 PROCEED is appropriate.

## Inherited scope from PM Manager

Copied verbatim from `pm-manager-review.md ## Validated for next round` section. No truncation, no augmentation.

## Phase 0.75 verdict

**PROCEED** with 5 items. Phase 1 Architect can proceed.
