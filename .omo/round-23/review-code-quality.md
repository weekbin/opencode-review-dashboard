# R23 Review — Code Quality

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Lens**: L2 — Code quality (idioms, structure, complexity)
> **Round**: 23 · **Merge SHA**: `b4905b6`

## Diff summary

```
 src/ui/app.ts                       |  71 +++++-
 src/ui/diff-virtualization.test.ts  | 442 ++++++++++++++++++++++++++++++++++++++
 src/ui/diff-virtualization.ts       | 204 +++++++++++++++++
 src/ui/i18n.test.ts                 |  16 ++
 src/ui/i18n.ts                      |   2 +
 src/ui/recent-searches-bulk.test.ts | 124 ++++++++++
 src/ui/search-history.test.ts       |  49 ++++
 src/ui/search-history.ts            |  16 ++
 8 files changed, 916 insertions(+), 8 deletions(-)
```

## Per-file analysis

### `src/ui/search-history.ts` (+16 LOC) — `#48 removeRecentSearches`
- **Idiom**: Filter + write pattern matches existing `clearRecentSearches` (R22). Set-based O(1) lookup. Standard.
- **Structure**: 1 new exported fn, follows existing pattern.
- **Complexity**: O(n) for filter, O(1) per Set lookup.
- **Risk**: low — additive, no breaking change.

### `src/ui/app.ts` (+71 / -8 LOC) — `#48 + #47 wire-up`
- **Idiom**: renderRecentSearches extension (per-item checkbox + bulk delete button) + DiffVirtualizer integration (per-view instance).
- **Structure**: DiffVirtualizer stored in `View` type, cleanup on renderDiffPanel re-render. Clean separation.
- **Risk**: medium — two IntersectionObservers (scrollSpy + DiffVirtualizer), different targets, no conflict verified by AC 7.6.

### `src/ui/i18n.ts` (+2 LOC) — `#48 2 STRINGS keys`
- **Idiom**: Standard STRINGS table format, 2 keys × 2 locales.
- **Risk**: zero.

### `src/ui/diff-virtualization.ts` (+204 LOC new) — `#47 core`
- **Idiom**: Class-based DiffVirtualizer with IntersectionObserver. Helper `computeHunkRanges`.
- **Structure**: observe/disconnect lifecycle + placeholder management.
- **Risk**: medium — new module, but contained.

### `src/ui/search-history.test.ts` (+49 LOC) + `src/ui/recent-searches-bulk.test.ts` (+124 LOC new) — `#48 tests`
- **Coverage**: 16 tests for AC 8.1-8.6 (DOM + state + localStorage + regression).
- **Quality**: jsdom-based, clean assertions.

### `src/ui/diff-virtualization.test.ts` (+442 LOC new) — `#47 tests`
- **Coverage**: 12 tests for AC 7.1-7.6 + computeHunkRanges sub-tests.
- **Quality**: 1000-mock-hunk stress test, IntersectionObserver mock setup.

## Code smells check

| Smell | Found? |
|---|---|
| Type suppression (`as any`, `@ts-ignore`) | NO |
| Empty catch blocks | NO |
| Magic numbers (without named const) | MINOR — rootMargin default 200px not named const. Acceptable, follows scrollSpy pattern. |
| Dead code | NO |
| Copy-paste duplication | NO |
| Oversized files (>250 LOC) | NO (diff-virtualization.ts is 204 LOC, within limit) |
| Missing JSDoc on exported functions | MINOR — DiffVirtualizer class follows existing no-JSDoc pattern |

## Verdict

**PASS** — code quality consistent with R19-R22 style. No smells, no idiomatic drift.