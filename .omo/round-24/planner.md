# R24 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 5, R24)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #49 | Per-hunk expand/collapse | 4×2 = **8** | 5 (3/3 competitors) | 3×2 = **6** (MEDIUM risk) | 4 | **23/35** | feature |
| #50 | Toast screenshots | 2×2 = **4** | 3 (modern apps) | 4×2 = **8** (docs-only, low) | 5 | **20/35** | polish |

## Caps check

| Cap | Limit | R24 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (per-hunk expand/collapse) + 1 polish | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (toast screenshots) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R22 + R23 closed all pm-manager-approved). R24 candidates fresh.

## Selected scope

**R24 SHIP SCOPE**:
1. **#49 Per-hunk diff expand/collapse (feature)** — 200-350 LOC, extends R23 #47 virtualization, vanilla IntersectionObserver pattern reused. AC: collapse button visible, collapsed → placeholder, expand → full render, per-file "Expand all"/"Collapse all" buttons.
2. **#50 Toast screenshots (polish docs)** — 10-20 LOC + 4 screenshots, updates README to reference screenshots. AC: 4 screenshots in docs/screenshots/, README sections updated, bilingual lockstep verified.

## Order rationale

**#50 FIRST, #49 SECOND**:
- #50 is tiny docs polish, fast win.
- #49 is bigger feature with new rendering state (higher risk).
- Rationale: polish first to clear quick win, then feature lands on clean baseline.
- (Alternative: feature first then polish. Both work; polish-first chosen for cleaner test signal.)

## Risk note

- #49 extends R23 virtualization. Must NOT break R23 DiffVirtualizer (regression test required).
- #49 per-hunk state in module-level Map; preserve state across re-renders.
- #50 is docs-only, low risk.
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — bilingual lockstep: SG.R22.1 — pre-commit `grep -c` verify before commit.
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#50** (atomic commit 1):
- `docs/screenshots/r24-s{1,2,3,4}-toast-*.png` (4 new screenshots)
- `README.md` (reference screenshots in toast + auto-save sections)
- `README.zh-CN.md` (parallel)
- 2 file changes (4 images + 2 READMEs)

**#49** (atomic commit 2):
- `src/ui/diff-virtualization.ts` (add per-hunk state + collapse button rendering)
- `src/ui/app.ts` (wire per-file "Expand all"/"Collapse all" buttons)
- `src/ui/i18n.ts` (2 STRINGS keys: diff.hunk.collapse + diff.hunk.expand)
- `src/ui/diff-virtualization.test.ts` (per-hunk collapse tests)
- 3-4 file touches, ~250 LOC

## Subagent budget

Per v5.3.7, 5-20 min per subagent. R24 has 2 subagent calls.

## PASS criteria for Phase 3

- 8-12 ACs total
- All ACs PASS or explicitly noted as partial
- Phase 3c Playwright Gap #14 covers: per-hunk collapse UI, "Expand all" button, toast screenshots reference
- i18n regression-guard test passes with 2 new keys
- SG.R22.1 bilingual lockstep verified before Phase 4
- mock-server still serves at http://localhost:8890

## OK to proceed

✓ All caps honored. ✓ Risk reasonable. ✓ ACs testable. ✓ i18n plan complete (2 keys). Branch + worktree pre-declared.