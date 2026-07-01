# Phase 0.75 Planner — Round 34

**Date**: 2026-07-01 (lead-direct)
**Verdict**: PROCEED

## Round profile

- **Profile**: bugfix (5 of 8 budget for ≤5 bugfix per round)
- **Hard caps**: feature ≤3 ✓ (0 in R34, 1 in R35) | bugfix ≤5 ✓ (4 selected: AC2/3/4 + AC5 plumbing tracks as bugfix-flavor) | polish ≤1 ✓ (R34 is the 1, #69 deferred) | total ≤8 ✓ (5) | architecture ≤1 ✓ (0)
- **Result**: PROCEED with 5 items

## Ranking table (composite math)

| Rank | Item | User-value (10) | Effort-inverted (10) | Risk-inverted (5) | Total /25 |
|---|---|---|---|---|---|
| 1 | AC2 (#65 settings) | 9 (3 panel bugs, biggest user-pain) | 7 (1-2 h, ~150 LOC) | 4 (modal close semantics tricky) | **20** |
| 2 | AC3 (#67 conversation) | 7 (4 UX issues) | 7 (1-2 h, ~50 LOC) | 4 (toolbar findability) | **18** |
| 3 | AC5 (worktree cleanup) | n/a (plumbing) | 9 (1 h script run, 0 code changes) | 5 (git ops, low risk if done post-merge) | **14** |
| 4 | AC4 (TS fix) | 0 user-visible | 9 (30 min, ~5 LOC) | 5 (type narrowing) | **14** |
| 5 | AC1 (SG.R28.1 amend) | 0 (process) | 10 (5 min, ~10 LOC) | 5 (skill patch) | **15** |

Items by ID priority: AC1 → AC5 → AC4 → AC3 → AC2. Process-fix-first ordering per R+ retroactive skill patch tradition.

## Scope selected (R34)

```yaml
planner_scope:
  round: 34
  items:
    - id: AC1
      type: skill patch
      target: .opencode/skills/team-dev-loop/SKILL.md
      desc: "Amend SG.R28.1 with skill-availability fallback (visual-engineering not loadable → fallback chain)"
    - id: AC5
      type: plumbing
      target: ~ 12 git worktree remove commands
      desc: "Remove 12 stale worktrees R4-R17 + R33 (per SG.R22.2 Step 3)"
    - id: AC4
      type: bugfix
      target: src/runtime-compat.ts line 283
      desc: "Fix 'Property unref does not exist on type never' TS error"
    - id: AC3
      type: bugfix
      target: src/ui/app.ts + src/ui/review.html
      desc: "Conversation panel: layout compact + comment button className统一 + select-all checkbox + finding key info"
    - id: AC2
      type: bugfix
      target: src/ui/app.ts + src/ui/review.html + src/ui/i18n.ts
      desc: "Settings panel 3 bugs + i18n post-submit banner"
  dropped: ["#69 (previously discussed redesign) → R35", "#72 (worktree copy button NEW feature) → R35"]
  total_loc_estimate: 215
  profile: bugfix
  total_atomic_commits: 5
  plumbing_separate: true  # AC5 is plumbing (post-commit git ops, not part of feature commits)
```

## Decision rationale

**Why these 5 and not all 7** (deferred to R35):
- **AC1 FIRST**: skill patch (5 min) — R33 retro gap-fix, must apply before R35 cycle per SG.R19.8
- **AC5 SECOND**: plumbing (1 h) — strict plumbing, no code risk, 0 LOC, "easy win" before tackling hard UX work
- **AC4 THIRD**: TS fix (30 min) — enables husky gate to work properly going forward (unblocks --no-verify workaround)
- **AC3 FOURTH**: #67 conversation (1-2 h) — medium-complexity UX fix
- **AC2 FIFTH**: #65 settings panel (1-2 h) — biggest user-pain issue from R33 deferred

**Order**: skill patch → plumbing → TS fix → conversation → settings. Process fixes first, then plumbing, then bugfixes (smaller before larger).

## Backlog freshness gate

PLANNER SELF-CHECK: 12 stale worktrees from R4-R17 (Phase -0.3 detection). **IN R34 SCOPE** (AC5). Not deferred.

No other backlog candidates at freshness age ≥3 rounds. R34 PROCEED is appropriate.

## Inherited scope from PM Manager

Copied verbatim from `pm-manager-review.md ## Validated for next round` section. No truncation, no augmentation.

## Phase 0.75 verdict

**PROCEED** with 5 items. Phase 1 Architect can proceed.
