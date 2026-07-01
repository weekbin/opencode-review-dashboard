# R23 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #47 | Diff virtualization | 4×2 = **8** | 5 (3/3 competitors) | 2×2 = **4** (MEDIUM-HIGH risk) | 4 | **21/35** | feature |
| #48 | Bulk delete recent-searches | 2×2 = **4** | 3 (Chrome + VS Code) | 4×2 = **8** (vanilla, low risk) | 5 | **20/35** | polish |

## Caps check

| Cap | Limit | R23 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (diff virt) + 1 polish (bulk delete, counts under feature) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (bulk delete) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R22 closed all pm-manager-approved). R23 candidates fresh from R22 retro.

## Selected scope

**R23 SHIP SCOPE**:
1. **#47 Diff virtualization for 1000+ line files (feature)** — 200-400 LOC, vanilla IntersectionObserver, no new dep. AC: visible hunks render, off-screen collapse to placeholder, scroll smooth on 1000+ line files.
2. **#48 Bulk delete recent-searches (polish)** — 30-50 LOC, multi-select checkbox + bulk delete button. AC: per-item checkbox, bulk delete removes selected, R22 Clear button stays as "Clear all".

## Order rationale

**#48 FIRST, #47 SECOND**:
- #48 is smaller atomic polish, builds directly on R22 Clear button surface (stable).
- #47 is bigger feature with new rendering layer (higher risk).
- Rationale: polish first to clear easy win, then feature lands on stable baseline.
- (Alternative: feature first then polish. Both work; polish-first chosen for cleaner test signal in pre-commit audit.)

## Risk note

- #47 (diff virtualization) is MEDIUM-HIGH risk — new rendering layer, large file handling. Must NOT break existing scrollSpy IntersectionObserver pattern.
- #48 (bulk delete) extends R22 surface. Must NOT conflict with existing per-item click handler.
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run (already verified at Phase -0).
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#48** (atomic commit 1):
- `src/ui/app.ts` (modify renderRecentSearches to add per-item checkbox + bulk delete button)
- `src/ui/i18n.ts` (add 2 STRINGS keys: search.recent.select + search.recent.bulkDelete)
- `src/ui/search-history.ts` (add `removeRecentSearches(queries: string[])` exported fn)
- `src/ui/search-history.test.ts` (add bulk delete test)
- 3-4 file touches, ~40 LOC

**#47** (atomic commit 2):
- `src/ui/app.ts` (add IntersectionObserver-based hunk virtualization)
- `src/ui/diff-virtualization.ts` (new file — virtualization logic + types)
- `src/ui/diff-virtualization.test.ts` (new file — unit tests for virtualization logic)
- 2-3 file touches, ~300 LOC

## Subagent budget

Per v5.3.6, 5-20 min per subagent. R23 has 2 subagent calls. Decompose #47 if it exceeds budget.

## PASS criteria for Phase 3

- 8-10 ACs total (estimated: 4 for #48 + 4-6 for #47)
- All ACs PASS or explicitly noted as partial in SHIP-WITH-NOTES
- Phase 3c Playwright Gap #14 covers: bulk delete UI, virtualization scroll behavior on large file
- i18n regression-guard test (`src/ui/i18n.test.ts`) passes with all 2 new keys
- mock-server still serves at http://localhost:8890
- SG.R22.1 applied at Phase 3.5: bilingual lockstep verified before commit

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW polish + MEDIUM-HIGH feature but well-scoped). ✓ ACs testable. ✓ i18n plan complete. Branch + worktree pre-declared.