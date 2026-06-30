# R19 Planner — Autonomous Scope Selection

> **Generated**: 2026-06-30 (v5.3.4 lead-direct — R+ v5 cron-style)
> **Round**: 19
> **Inputs**: `brief.md` + `pm-manager-review.md` + `competitor-landscape.md`

## Verdict: **PROCEED**

All 3 PM Manager-validated candidates selected within hard caps.

## Ranking (composite score)

Composite formula (v5.3): `(user_value × 2) + freshness_bonus - loc_penalty`

| # | Candidate | User-value (0-5) | Freshness | LOC est | Composite | Rank |
|---|---|---|---|---|---|---|
| #33 | Language toggle | 3.5 | +1 (R17-retro-deferred, user-tagged) | -1 (200-400 LOC) | 3.5×2 + 1 - 1 = **7.0** | 1 |
| #37 | Toast | 3 | +1 (R14 #24 closure, fresh) | +1 (80-120 LOC) | 3×2 + 1 + 1 = **8.0** | 1 (tie) |
| #38 | A11y audit | 3 | +1 (R17-retro-deferred) | 0 (80-150 LOC) | 3×2 + 1 + 0 = **7.0** | 3 |

**Tie-break (v5.2 rule: aged_rounds ASC → user_value DESC → est_loc ASC)**:
- #37 Toast has no aged_rounds (fresh, never selected before)
- #33 Language toggle has aged_rounds=1 (R17 deferred once)
- #38 A11y has aged_rounds=1 (R17 deferred once)
- Tie-break: #37 wins on freshness → 1st pick; #33 vs #38 tie on aged_rounds, both pass

## Scope selected

**All 3 candidates selected** (under feature ≤ 3 cap exactly):

| # | Issue | Title | LOC est | File count | Profile |
|---|---|---|---|---|---|
| #33 | 33 | Language toggle (English ↔ Chinese) | 200-400 | 4-6 src + 1-2 tests | feature |
| #37 | 37 | Toast notification system | 80-120 | 2-3 src + 1 test | feature |
| #38 | 38 | A11y audit + ARIA fixes | 80-150 | 3-5 src + 1-2 tests | feature |
| **TOTAL** | | | **360-670** | **9-14** | **feature** |

## Hard caps verification

| Cap | Limit | Selected | Status |
|---|---|---|---|
| feature | ≤ 3 | 3 | ✓ at cap |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 3 | ✓ |
| polish | ≤ 1 | 0 | ✓ |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate (R12 retro)

- Stale candidates (#12 Bulk actions, #13 Live file-watcher): aged_rounds=6, user-rejected 6x
- Boundary at 2 stale (3+ would trigger fresh-investigation signal)
- **2 stale** = no trigger (correctly at boundary)
- R19 candidates are all fresh (R17-retro-deferred + issue #33 user-tagged)

## Pre-check (R3-fabrication defense)

```bash
$ git cat-file -e a0e0361  # R18 baseline
[exit 0]  # PASS
$ git log --oneline origin/main..HEAD  # local ahead
[empty]  # PASS
```

## Decision rationale

All 3 candidates are:
1. **Within hard caps** (feature=3/3, total=3/8)
2. **All gate-pass** (3-test per PM Triage brief)
3. **All APPROVE** (PM Manager verdict)
4. **All verified** (PM Researcher no mischaracterizations)
5. **Fresh backlog** (no fresh-investigation signal needed)
6. **All feature profile** (consistent execution)
7. **All additive** (no schema break, no new dep)

Single-attribute features (i18n OR toast OR a11y) would waste a round; bundling them maximizes value per round while staying within all caps. The 3 features are thematically related (all are "polish the user experience" without being core feature work).

## Selected scope

```yaml
round: 19
profile: feature
candidates:
  - issue: 33
    type: feature
    title: "Language toggle (English ↔ Chinese)"
    priority: 1
    est_loc: 200-400
  - issue: 37
    type: feature
    title: "Toast notification system (R14 #24 replacement)"
    priority: 2
    est_loc: 80-120
  - issue: 38
    type: feature
    title: "A11y audit + ARIA fixes (role=tablist, role=status, landmarks)"
    priority: 3
    est_loc: 80-150
total_loc_estimate: 360-670
total_files_estimate: 9-14
```

## Notes

- No user-pick (v5 final spec: Planner autonomous per memory #417)
- Per `pm-manager-review.md` ## Validated for next round
- All 3 candidates preserved from PM Manager's pre-validated list
- Lead-direct execution model: Phase 1 Architect will write plan.md directly, Phase 2 Dev will run as subagent (only subagent in v5.3.3 model)
- Phase 3c Playwright minimum (SG.20) applies — all 3 features are UI changes, walkthrough REQUIRED