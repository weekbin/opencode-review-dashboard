# R26 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 7, R26)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #53 | Per-finding delete from history | 3×2 = **6** | 5 (3/3 competitors) | 4×2 = **8** (vanilla, low risk) | 5 | **24/35** | feature |
| #54 | Bulk delete in conversation tab | 2×2 = **4** | 4 (GitHub + VS Code) | 4×2 = **8** (vanilla, low risk) | 5 | **21/35** | polish |

## Caps check

| Cap | Limit | R26 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (per-finding delete) + 1 polish | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (bulk delete conversation) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R21-R25 closed all pm-manager-approved). R26 candidates fresh.

## Selected scope

**R26 SHIP SCOPE**:
1. **#53 Per-finding "delete from history" (feature)** — 100-150 LOC, extends R25 #48 `removeRecentSearches()` pattern. AC: per-entry delete button, click removes single entry, R22 Clear + R25 bulk still work.
2. **#54 Bulk delete in conversation tab (polish)** — 30-50 LOC, reuses R25 #52 sidebar bulk delete pattern. AC: per-finding checkbox, bulk action removes selected, conversation state preserved.

## Order rationale

**#53 FIRST, #54 SECOND**:
- #53 is bigger feature (new per-entry button + handler)
- #54 is tiny polish (mirrors R25 #52 pattern)
- Rationale: feature first to clear the bigger change, then polish on clean baseline.
- (Alternative: polish first then feature. Both work; feature-first chosen for cleaner test signal.)

## Risk note

- #53 must NOT break R22 #45 Clear button (separate action)
- #53 must NOT break R25 #48 bulk delete (different action)
- #54 must NOT break existing conversation state
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — subagent double-write: SG.R24.1 — verify `pwd == worktree` AFTER every Write/Edit (v5.3.8 embed working — R25 SUCCESS).
- both — bilingual lockstep: SG.R22.1 — pre-commit `grep -c` verify before commit (apply SG.R25.1 candidate idea).
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#53** (atomic commit 1):
- `src/ui/app.ts` (modify renderRecentSearches to add per-entry delete button + handler)
- `src/ui/i18n.ts` (2 STRINGS keys: search.recent.delete + search.recent.delete.confirm)
- `src/ui/search-history.test.ts` (add per-entry delete unit test)
- 3 file touches, ~120 LOC

**#54** (atomic commit 2):
- `src/ui/app.ts` (modify renderConversationPane to add per-finding checkbox + bulk button)
- `src/ui/i18n.ts` (2 STRINGS keys: conversation.bulkDelete + conversation.selected)
- `src/ui/app.test.ts` OR new file (UI test)
- 3 file touches, ~40 LOC

## Subagent budget

Per v5.3.8, 5-20 min per subagent. R26 has 2 subagent calls.

## PASS criteria for Phase 3

- 8-12 ACs total
- All ACs PASS or explicitly noted as partial in SHIP-WITH-NOTES
- Phase 3c Playwright Gap #14 covers: per-entry delete, bulk delete conversation
- i18n regression-guard test passes with 4 new keys
- SG.R22.1 bilingual lockstep verified
- SG.R24.1 per-Edit verification applied to subagent prompts (v5.3.8 SUCCESS)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable. ✓ ACs testable. ✓ i18n plan complete (4 keys). Branch + worktree pre-declared. SG.R24.1 to apply at Phase 2.