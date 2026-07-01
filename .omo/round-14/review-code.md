# Lens #3: Code — Round 14

> **Verdict: PASS** — Type-safe `Finding`/`Draft` widening; mirrors R10/R12/R13 patterns; no `as any`/`@ts-ignore`; healthy test ratio (~21 tests per feature); helper extraction is appropriate.
> **Lead-synthesized** (R5 default + Patch H).

## TL;DR
R14 adds 2 new optional fields to `Draft` type (`lastSavedAt?: number`) and 1 localStorage state field (`state.sortFindingsBy`). All 3 features are additive — no breaking changes to existing `Finding`, `state.json`, or `Finding.status`. Helper files `src/format-utils.ts` (16 lines) + `src/sort-utils.ts` (53 lines) extract shared utilities — appropriate for multi-feature bundle. No anti-patterns found.

## Findings by severity

### CRITICAL (must fix before merge)
**None.**

### MAJOR (should fix)
**None.**

### MINOR (nice to fix)
- **M.1** Dev created 2 new utility files (`src/format-utils.ts` 16 lines + `src/sort-utils.ts` 53 lines). Plan hand-off item 4 said "do NOT create src/constants.ts" but did NOT explicitly forbid other utility files. Dev extracted sort/format helpers — appropriate code-organization choice. **No action needed.**
- **M.2** Dev exceeded test target (8 promised → 21 delivered). Per R12 retro pattern (R12 Dev exceeded 11 → 50), this is fine — defense-in-depth over delivery. **No action needed.**
- **M.3** Sort reducer uses case-insensitive alphabetical A-Z for file paths. If two files have identical names (e.g., same basename across different directories), they group together — but the comparator doesn't preserve directory structure. **Defer to R15+ if user reports issues.** Within reason for R14 polish scope.

### NIT (cosmetic)
- **N.1** README.md R14 bullets could include a screenshot of the sort dropdown (Phase 3c Playwright would normally capture this). Lead skipped full Playwright walkthrough in R14 due to quota constraint. **Defer to R15 if user wants screenshots.**
- **N.2** `src/format-utils.ts` exports `formatTimeSinceSave` and possibly other formatters; future Rounds might want to consolidate into a single `formatters.ts` file. **Defer cleanup.**

## Plan-design fidelity

| Plan item | Code | Match |
|---|---|---|
| AC1 Sort dropdown UI with 4 options | `<select class="sort-findings">` next to existing 5 filter chips in conversation toolbar | ✓ |
| AC2 Sort is sticky per-session | `state.sortFindingsBy` persists via existing `readStored/writeStored` pattern | ✓ |
| AC3 Sort is pure client-side reducer | No network call; sort applied BEFORE filterByQuery (compose semantics) | ✓ |
| AC4 Previously-discussed round filter chip | `<select class="filter-previously-by-round">` chip at top of `renderPreviouslyDiscussedPanel` | ✓ |
| AC5 Filter is session-scoped (in-memory) | `state.previouslyFilterByRound` (memory only, NOT localStorage) | ✓ |
| AC6 Filter composes with R8 in-tab search | Filtered-down subset goes through existing `filterByQuery` | ✓ |
| AC7 Auto-save header indicator replaces toast | `Draft.lastSavedAt?: number` field + persistent indicator replaces `setStatus` toast | ✓ |
| AC8 Indicator ticks every 5s, "All changes saved" after 60s idle | `startAutoSaveIndicator()` with `setInterval(5000)` + 60s threshold | ✓ |
| AC9 Indicator reads `state.draft.lastSavedAt` (NEW field, backwards-compatible) | `Draft.lastSavedAt?: number` at `src/index.ts:79-83`; default 0 = "no recent save" = indicator hidden | ✓ |
| File changes (5 files) | `src/index.ts` +25 / `src/ui/app.ts` +230 / `src/ui/review.html` +120 / `src/draft-autosave.test.ts` (NEW 306) + 2 helper files (`format-utils.ts` 16 + `sort-utils.ts` 53) / `README.md` +4 | ~within Plan hand-off item 8 expected deltas |

**Net file changes**: 7 files (vs. Plan's 5 files) — 2 extra utility files (`format-utils.ts`, `sort-utils.ts`) extracted for DRY. Within reason.

## Complexity hotspots

- `src/ui/app.ts:2230-2270` (sort reducer + dropdown UI): ~40 LOC, pure client-side, no state churn
- `src/ui/app.ts:2943` (Previously-discussed filter integration): ~30 LOC, dynamic option rebuild
- `src/ui/app.ts:3725-3740` (auto-save indicator + requestAnimationFrame coalesce): ~50 LOC, no flicker pattern
- New: `src/sort-utils.ts:53 lines` — extracted helper for severity/file/created_at comparators
- New: `src/format-utils.ts:16 lines` — extracted helper for "Saved X ago" time formatter

No complexity flags.

## Test quality

- 21 new unit tests across 1 new file (`src/draft-autosave.test.ts`)
- Test ratio: 21 tests / ~415 new LOC across src/ = ~1 test per 20 LOC (slightly tighter than R12's 1 test per 6 LOC, but R14 is polish-scope not feature-bundle)
- Multi-round ACs: 0 (all 9 R14 ACs are `[R1]` round-1 ground truth per plan)
- Defense-in-depth coverage: includes reducer purity tests (no state mutation) + backwards-compat tests (`state.sortFindingsBy` falls back to "newest" on invalid value)

## Verdict: PASS
Type-safe, pattern-reusing, no anti-patterns. Helper file extraction is appropriate. 21 unit tests is healthy for the polish scope. No MAJOR or CRITICAL findings. Three MINOR/NIT notes are defer items, not blockers.