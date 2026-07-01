# Phase 0.75 Planner — Round 33

**Date**: 2026-07-01 (lead-direct)
**Verdict**: PROCEED

## Round profile

- **Profile**: POLISH (round is 100% UX/CSS/i18n fixes; treated as ≤1 polish budget)
- **Hard caps**: feature ≤3 ✓ (0 selected) | bugfix ≤5 ✓ (4 selected) | polish ≤1 ✓ (R33 is the 1) | total ≤8 ✓ (4) | architecture ≤1 ✓ (0)
- **Result**: PROCEED with 4 items

## Ranking table (composite math)

| Rank | Issue | User-value (10) | Effort-inverted (10) | Risk-inverted (5) | Total /25 |
|---|---|---|---|---|---|
| 1 | #66 port | 9 (silent data loss) | 10 (5 min, 1-line) | 5 (revert-safe) | **24** |
| 2 | #68 stat bug | 8 (data correctness) | 10 (3 min, 3-line) | 5 (additive only) | **23** |
| 3 | #70 overlay | 6 (visual bug) | 10 (5 min, 3-line CSS) | 5 (CSS-only) | **21** |
| 4 | #71 ignore-ws | 6 (a11y/i18n) | 7 (1.5h, ~80 LOC) | 4 (touches existing button + i18n) | **17** |

## Scope selected (R33)

```yaml
planner_scope:
  round: 33
  items:
    - id: #66
      title: "Plugin HTTP server uses port: 0 — random port per restart breaks localStorage persistence"
      type: bugfix
      files: [src/index.ts]
      atomic_commit_sha_prefix: "r33-fix-66-port"
    - id: #68
      title: "Submit dialog shows '0 open findings will be submitted' when user actually has open findings"
      type: bugfix
      files: [src/ui/app.ts]
      atomic_commit_sha_prefix: "r33-fix-68-stat"
    - id: #70
      title: "Post-submit close-tab overlay: no backdrop, content below shows through with 0.3 opacity (visual 错位)"
      type: bugfix
      files: [src/ui/review.html]
      atomic_commit_sha_prefix: "r33-fix-70-overlay"
    - id: #71
      title: "Toolbar 'Ignore ws' button has poor discoverability — label cryptic, title attribute hardcoded English, no aria-label"
      type: bugfix
      files: [src/ui/i18n.ts, src/ui/app.ts]
      atomic_commit_sha_prefix: "r33-fix-71-ignore-ws"
  dropped: [#65 #67 #69 #72 — deferred to R34]
  total_loc_estimate: 107
  profile: POLISH
  total_atomic_commits: 4
```

## Decision rationale

**Why these 4 and not the other 4** (deferred to R34):
- **#66 + #68 + #70**: All 3-15 min fixes, all additive (no behavior change for non-buggy path), all independently testable, all invisible-to-other-features. These are the "ship today" items.
- **#71**: Bigger (~80 LOC, 1.5h) but still self-contained. Inside R33 budget because of high polish value (i18n + a11y discoverability). Worth shipping this round.
- **Dropped #65**: 1-2h, large surface area, needs user input on modal close semantics. Not "ship it now" work.
- **Dropped #67 + #69**: Both require "fully redesign conversation/previously tab to match conversation style" — that's a design decision round, not a polish round.
- **Dropped #72**: It's an enhancement (new button), not bugfix. Better in its own round with user input on placement.

## Backlog freshness gate

PLANNER SELF-CHECK: 12 stale worktrees from R4-R17 detected (per Phase -0 sync). These represent past rounds that didn't close cleanly. **NOT in R33 scope** (would burn too much time); **scheduled for R34 housekeeping round** (separate round).

No other backlog candidates at freshness age ≥3 rounds. R33 PROCEED is appropriate.

## Inherited scope from PM Manager

Copied verbatim from `pm-manager-review.md ## Validated for next round` section. No truncation, no augmentation.

## Phase 0.75 verdict

**PROCEED** with 4 bugfix items. Phase 1 Architect can proceed.
