# R139 Discovery — hoist `fallbackCopy` to file scope

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R138 retro carry-over**: none (5-round worktree drift closed)
- **proposals.jsonl last entry**: R138 (per-SHIP discipline maintained)
- **Last full feature**: R137 (Next is feature-counter reset)

## Surfaced candidates

### C1 — Hoist `fallbackCopy` to file scope (R137 retro #2)

**Evidence** (verified):
- 4 sites in `src/ui/app.ts` with **identical** `const fallbackCopy = (text: string) => {…}` bodies:
  - L390 (`copyFindingPermalinkToClipboard`)
  - L471 (`copyAsMarkdown`)
  - L1768 (`copyBranchNameToClipboard`)
  - L1815 (`copyRoundNotesToClipboard`, added in R137)
- Each duplicate body is ~12 lines; total ~48 lines of dead-duplicate code
- All 4 callers invoke the exact same shape: `navigator.clipboard.writeText` → try/catch → `fallbackCopy(text)` on rejection
- `r73-copied-timer-leak.test.ts` already covers the timer-leak invariant for `copyAsMarkdown` and `copyFindingPermalink` — those tests will keep passing as long as the behavior contract holds

**Why**: R137 retro explicitly surfaced this. Real refactor value:
- DRY: 4 identical 12-line bodies → 1 file-scope 12-line function (net -36 LOC)
- Future rounds only have to fix bugs in one place (not 4)
- Test surface: same behavior should still hold; no test changes needed except possibly one direct test of the hoisted function

**Cost**: ≤1 src file modified (`app.ts`) + 1 new test + 1 proposals.jsonl append. Net -36 LOC.

**Profile**: housekeeping/refactor. 0 features / 0 bugfixes / 0 polish.

### C2 — R137 button label/title → `data-i18n-title` (R137 retro #4)

**Why not this round**: Sub-10 LOC polish. Could batch with C1 (small addition to the refactor commit) but technically a separate concern. Will defer to maintain R139's tight scope.

### C3 — formatRelativeTime > 1 year as calendar date (R137 retro #5)

**Why not this round**: Preventive only, no current surface. Same as R133 retro's "data-i18n-placeholder" risk.

## Selection

Pick **C1 — hoist `fallbackCopy`**. Real refactor with measurable LOC reduction, closes a real R137 retro flag, fits the housekeeping profile (0 features / 0 bugfixes / 0 polish).

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| total | 1 (housekeeping, not feature/bugfix/polish) | ≤8 | OK |

## Hardening included

- Append R138 entry to `.omo/proposals.jsonl` (per-SHIP append discipline per R134 retro lesson)
- One direct test on the hoisted function to anchor the contract independent of any single caller