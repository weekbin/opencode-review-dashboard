# R22 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 3, R22)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #45 | Reset-restore search-history | 3×2 = **6** | 4 (3/3 competitors) | 4×2 = **8** (vanilla, low risk) | 5 | **23/35** | feature |
| #46 | Fix skipLink i18n test fail | 1×2 = **2** | 2 (internal test) | 5×2 = **10** (1-char, no behavior) | 5 | **19/35** | polish |

## Caps check

| Cap | Limit | R22 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (reset-restore) + 1 polish (skipLink fix, counts under feature for caps) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (skipLink fix) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R21 closed all pm-manager-approved #12, #13, #43, #44). R22 candidates are fresh from R21/R20 retros.

## Selected scope

**R22 SHIP SCOPE**:
1. **#45 Reset-restore search-history (feature)** — 50-80 LOC, vanilla button + toast, no new dep. AC: button visible in dropdown, click clears localStorage + re-renders, toast confirmation, i18n both locales.
2. **#46 Fix skipLink i18n test fail (polish)** — 1-2 LOC, 1-character change in i18n.ts. AC: test goes from 503/1 → 504/0.

## Order rationale

**#46 FIRST, #45 SECOND**:
- #46 is 1-character change + test verification. Tiny atomic polish, fast win.
- #45 builds on the stabilized search-history.ts from R21 (debounce landed clean).
- Rationale: polish first to clear the test gap, then feature lands on clean baseline.
- (Alternative: feature first then polish. Both work; polish-first chosen for cleaner test signal in pre-commit audit.)

## Risk note

- #45 (reset-restore) extends R21 debounce surface. Must use existing `commitRecentSearchImmediate` + `getRecentSearches` patterns.
- #46 (skipLink fix) is zero-risk (no behavior change, just quotes the key).
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#46** (atomic commit 1):
- `src/ui/i18n.ts` (1-char fix at line 104)
- 1 file, 1 LOC

**#45** (atomic commit 2):
- `src/ui/search-history.ts` (add public `clearRecentSearches()` exported)
- `src/ui/app.ts` (wire Clear button click handler + toast)
- `src/ui/i18n.ts` (add 2 STRINGS keys: search.recent.clear + search.recent.clear.confirm)
- `src/ui/search-history.test.ts` (add clearRecentSearches test)
- `src/ui/app.test.ts` OR new (add UI button click test)
- 3-4 file touches, ~60 LOC

## Subagent budget

Per v5.3.6, 5-20 min per subagent. R22 has 2 subagent calls (one per atomic commit). Both within budget.

## PASS criteria for Phase 3

- 8-10 ACs total (estimated: 6 for #45 + 1-2 for #46)
- All ACs PASS or explicitly noted as partial in SHIP-WITH-NOTES
- Phase 3c Playwright Gap #14 covers: Clear button visible, click clears dropdown, toast appears
- i18n regression-guard test (`src/ui/i18n.test.ts`) passes with all 2 new keys + skipLink fix
- mock-server still serves at http://localhost:8890

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW for both). ✓ ACs testable. ✓ i18n plan complete. Branch + worktree pre-declared.