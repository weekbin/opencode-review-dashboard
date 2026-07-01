# R25 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 6, R25)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #51 | Diff virtualization toggle | 3×2 = **6** | 5 (3/3 competitors) | 4×2 = **8** (LOW-MEDIUM risk) | 4 | **23/35** | feature |
| #52 | Bulk delete sidebar | 2×2 = **4** | 4 (GitHub + VS Code) | 4×2 = **8** (vanilla, low risk) | 5 | **21/35** | polish |

## Caps check

| Cap | Limit | R25 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (diff virt toggle) + 1 polish | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (sidebar bulk delete) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R22 + R23 + R24 closed all pm-manager-approved). R25 candidates fresh.

## Selected scope

**R25 SHIP SCOPE**:
1. **#51 Diff virtualization toggle in settings (feature)** — 100-150 LOC, extends R22 settings modal. AC: toggle visible in Appearance section, default ON, when OFF no IntersectionObserver.
2. **#52 Bulk delete in sidebar review progress (polish)** — 30-50 LOC, multi-select checkbox + bulk "Mark as reviewed" button. AC: per-file checkbox, bulk action updates reviewed state, R20 #40 progress count updates.

## Order rationale

**#52 FIRST, #51 SECOND**:
- #52 is tiny atomic polish, builds directly on R23 #48 bulk delete pattern (reusable code).
- #51 is bigger feature with new settings toggle (touches DiffVirtualizer constructor signature).
- Rationale: polish first to clear quick win, then feature lands on clean baseline.

## Risk note

- #51 touches DiffVirtualizer constructor — must NOT break R23 #47 + R24 #49 functionality.
- #51 adds new localStorage key `diff-review:virtualization` — must NOT conflict with existing keys.
- #52 reuses R23 #48 pattern — careful about naming conflicts.
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — subagent double-write: SG.R24.1 — verify `pwd == worktree` AFTER every Write/Edit (NEW v5.3.8).
- both — bilingual lockstep: SG.R22.1 — pre-commit `grep -c` verify before commit.
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#52** (atomic commit 1):
- `src/ui/app.ts` (modify renderFilesPane to add per-file checkbox + bulk button)
- `src/ui/i18n.ts` (2 STRINGS keys: sidebar.bulkDelete + sidebar.selected)
- `src/ui/app.test.ts` OR new file (UI test)
- 2-3 file touches, ~40 LOC

**#51** (atomic commit 2):
- `src/ui/diff-virtualization.ts` (modify DiffVirtualizer constructor + observe behavior)
- `src/ui/app.ts` (wire settings toggle + pass virtualization flag to DiffVirtualizer)
- `src/ui/i18n.ts` (2 STRINGS keys: settings.virtualization.label + settings.virtualization.description)
- `src/ui/diff-virtualization.test.ts` (new tests for toggle behavior)
- 3-4 file touches, ~120 LOC

## Subagent budget

Per v5.3.8, 5-20 min per subagent. R25 has 2 subagent calls.

## PASS criteria for Phase 3

- 8-12 ACs total
- All ACs PASS or explicitly noted as partial
- Phase 3c Playwright Gap #14 covers: settings toggle, sidebar bulk delete
- i18n regression-guard test passes with 4 new keys
- SG.R22.1 bilingual lockstep verified
- mock-server still serves at http://localhost:8890
- SG.R24.1 per-Edit verification applied to subagent prompts (NEW)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable. ✓ ACs testable. ✓ i18n plan complete (4 keys). Branch + worktree pre-declared. SG.R24.1 to apply at Phase 2.