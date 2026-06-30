# R20 Planner — Autonomous Scope Selection

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up)
> **Round**: 20
> **Inputs**: `brief.md` + `pm-manager-review.md` + `competitor-landscape.md`

## Verdict: **PROCEED**

All 3 PM Manager-validated candidates selected within hard caps.

## Ranking (composite score)

Composite formula (v5.3): `(user_value × 2) + freshness_bonus - loc_penalty`

| # | Candidate | User-value (0-5) | Freshness | LOC est | Composite | Rank |
|---|---|---|---|---|---|---|
| #40 | Sidebar progress | 3.5 | +1 (fresh self-investigation) | 0 (50-80 LOC) | 3.5×2 + 1 + 0 = **8.0** | 1 |
| #41 | Unread-only filter | 3 | +1 (fresh self-investigation) | 0 (60-90 LOC) | 3×2 + 1 + 0 = **7.0** | 2 |
| #42 | Search history | 3 | +1 (fresh self-investigation) | 0 (70-100 LOC) | 3×2 + 1 + 0 = **7.0** | 3 |

**Tie-break** (v5.2 rule: aged_rounds ASC → user_value DESC → est_loc ASC):
- All 3 have aged_rounds=0 (fresh, never selected before)
- #40 wins on user-value (3.5 > 3.0) → 1st pick
- #41 vs #42 tie on user-value; #41 wins on LOC (60-90 < 70-100) → 2nd pick

## Scope selected

**All 3 candidates selected** (under feature ≤ 3 cap exactly):

| # | Issue | Title | LOC est | File count | Profile |
|---|---|---|---|---|---|
| #40 | 40 | Sidebar review progress indicator | 50-80 | 1-2 src + 1 test | feature |
| #41 | 41 | Sidebar filter: show only unread files | 60-90 | 1-2 src + 1 test | feature |
| #42 | 42 | Search history (recent searches) | 70-100 | 1-2 src + 1 test | feature |
| **TOTAL** | | | **180-270** | **3-6** | **feature** |

## Hard caps verification

| Cap | Limit | Selected | Status |
|---|---|---|---|
| feature | ≤ 3 | 3 | ✓ at cap |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 3 | ✓ |
| polish | ≤ 1 | 0 | ✓ |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate (R12 retro)

- Stale candidates: #12 Bulk actions (aged_rounds=6) + #13 Live file-watcher (aged_rounds=6)
- Both at violation threshold (6 cycles × user-rejected) per R12 retro rule
- **2 stale** = at boundary, no fresh-investigation trigger
- R20 candidates are all fresh from self-investigation (R20 is the first round after R+ retro closure `03cd113`)

## Pre-check (R3-fabrication defense)

```bash
$ git cat-file -e 03cd113
[exit 0]  # PASS
```

## Decision rationale

All 3 candidates are:
1. **Within hard caps** (feature=3/3, total=3/8)
2. **All gate-pass** (3-test per PM Triage brief)
3. **All APPROVE** (PM Manager verdict)
4. **All verified** (PM Researcher no mischaracterizations)
5. **All fresh** (self-investigation, no user-rejected backlog)
6. **All feature profile** (consistent execution)
7. **All additive** (no schema break, no new dep)

Bundle rationale: #40 + #41 are tightly coupled (progress indicator + unread filter are natural review-workflow pair). #42 (search history) is an independent extension of R13 in-diff search. All 3 fit within feature ≤ 3 cap exactly.

## Selected scope

```yaml
round: 20
profile: feature
candidates:
  - issue: 40
    type: feature
    title: "Sidebar review progress indicator (X/Y reviewed + %)"
    priority: 1
    est_loc: 50-80
    builds_on: "src/ui/app.ts:2305 state.read (existing)"
  - issue: 41
    type: feature
    title: "Sidebar filter: show only unread files"
    priority: 2
    est_loc: 60-90
    pairs_with: 40
  - issue: 42
    type: feature
    title: "Search history (recent searches dropdown)"
    priority: 3
    est_loc: 70-100
    extends: "R13 in-diff search (.diff-search-bar)"
total_loc_estimate: 180-270
total_files_estimate: 3-6
```

## Notes

- No user-pick (v5 final spec: Planner autonomous per memory #417)
- Per `pm-manager-review.md` ## Validated for next round
- All 3 candidates preserved from PM Manager's pre-validated list
- Lead-direct execution model: Phase 1 Architect will write plan.md directly (with SG.R19.3 STRINGS_USAGE_PLAN), Phase 2 Dev will run as subagent (only subagent in v5.3.3 model)
- Phase 3c Playwright minimum (SG.20) applies — all 3 features are UI changes, walkthrough REQUIRED
- SG.R19.8 end-of-round mandatory gap-fix applies — any R20 gaps MUST be fixed in-round