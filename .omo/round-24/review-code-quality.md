# R24 Review — Code Quality

> **Generated**: 2026-06-30 (RALPH LOOP iteration 5, R24)
> **Lens**: L2 — Code quality (idioms, structure, complexity)
> **Round**: 24 · **Merge SHA**: `e4bffb7`

## Diff summary

```
 README.md                                          |   4 +
 README.zh-CN.md                                    |   4 +
 docs/screenshots/r24-s1-toast-added-review.png     | Bin 0 -> 129681 bytes
 docs/screenshots/r24-s2-toast-copied-permalink.png | Bin 0 -> 130929 bytes
 docs/screenshots/r24-s3-toast-copied-markdown.png  | Bin 0 -> 130565 bytes
 docs/screenshots/r24-s4-toast-submitted-review.png | Bin 0 -> 130727 bytes
 docs/screenshots/r24-s5-autosave-indicator.png     | Bin 0 -> 129886 bytes
 src/ui/app.ts                                      |  80 +++++++-
 src/ui/diff-virtualization.test.ts                 | 219 +++++++++++++++++++++
 src/ui/diff-virtualization.ts                      | 100 +++++++++-
 src/ui/i18n.test.ts                                |  16 ++
 src/ui/i18n.ts                                     |   2 +
 12 files changed, 421 insertions(+), 4 deletions(-)
```

## Per-file analysis

### `src/ui/diff-virtualization.ts` (+100 LOC) — `#49 per-hunk collapse`
- **Idiom**: Module-level `Map<filePath, Set<hunkId>>` for collapsed state. Toggle pattern.
- **Structure**: 6 new methods (`toggleHunk`, `isCollapsed`, `expandAll`, `collapseAll`, `getCollapsedCount`, `userCollapseHunk`, `userExpandHunk`).
- **Complexity**: O(1) per toggle. State preserved across re-renders (module-level, not per-instance).
- **Risk**: low — additive, R23 IntersectionObserver untouched.

### `src/ui/app.ts` (+80 / -N LOC) — `#49 wire-up`
- **Idiom**: Per-file "Expand all"/"Collapse all" buttons in card header. Per-hunk button injection.
- **Structure**: Imports `parseDiffFromFile` + `computeHunkRanges` from Pierre/Diffs. 3 create*View functions updated.
- **Risk**: low — extends R23 virtualization pattern.

### `src/ui/i18n.ts` (+2 LOC) — `#49 2 STRINGS keys`
- **Idiom**: Standard STRINGS table format.
- **Risk**: zero.

### `src/ui/diff-virtualization.test.ts` (+219 LOC) — `#49 tests`
- **Coverage**: 17 tests for AC 9.1-9.10 + R23 regression.
- **Quality**: jsdom-based, clean assertions.

### `src/ui/i18n.test.ts` (+16 LOC) — `#49 i18n regression guard`
- **Coverage**: 2 new STRINGS keys × 2 locales = 4 assertions.
- **Quality**: Follows R20 retro AC1.2 pattern.

### `README.md` + `README.zh-CN.md` (+4 each) — `#50 docs`
- **Idiom**: Image references with captions.
- **Quality**: Bilingual lockstep verified per SG.R22.1.

### `docs/screenshots/r24-s*.png` (5 new files) — `#50 screenshots`
- **Method**: playwright-cli (real browser screenshots).
- **Quality**: 5 PNG files, ~130 kB each.

## Code smells check

| Smell | Found? |
|---|---|
| Type suppression (`as any`, `@ts-ignore`) | NO |
| Empty catch blocks | NO |
| Magic numbers (without named const) | NO |
| Dead code | NO |
| Copy-paste duplication | NO |
| Oversized files (>250 LOC) | NO |
| Missing JSDoc on exported functions | MINOR — DiffVirtualizer extensions follow existing no-JSDoc pattern |

## Verdict

**PASS** — code quality consistent with R19-R23 style. No smells, no idiomatic drift.