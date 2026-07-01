# R21 Review — Code Quality

> **Generated**: 2026-06-30
> **Lens**: L2 — Code quality (idioms, structure, complexity)
> **Round**: 21 · **Merge SHA**: `7a4c045`

## Diff summary

```
 src/ui/app.ts                 | 100 ++++++++++++++++++++-
 src/ui/i18n.ts                |  16 ++++
 src/ui/review.html            | 152 +++++++++++++++++++++++++++++++
 src/ui/search-history.test.ts |  87 ++++++++++++++++++
 src/ui/search-history.ts      |  43 +++++++++
 src/ui/settings.test.ts       | 204 ++++++++++++++++++++++++++++++++++++++++++
 6 files changed, 598 insertions(+), 4 deletions(-)
```

## Per-file analysis

### `src/ui/search-history.ts` (+43 LOC) — `#43 debounce`
- **Idiom**: vanilla `setTimeout` + cancellation pattern. Standard.
- **Structure**: 3 new exported fns (`commitRecentSearch`, `commitRecentSearchImmediate`, `cancelPendingCommit`). Clear separation of debounce-vs-immediate paths.
- **Complexity**: O(1) per keystroke. No nested logic.
- **Risk**: timer leak mitigated by `beforeunload` cancel.

### `src/ui/app.ts` (+100 / -4 LOC) — `#43 + #44 wire-up`
- **Idiom**: enter-key handler dispatches to immediate-commit path; non-Enter path uses debounce. Clean separation.
- **Structure**: ⚙ button + settings modal handlers reuse `installModalA11y` from R19 (no reinvention).
- **Complexity**: 6 setting handlers + 1 reset handler. Each is a single-line localStorage write + UI re-render.
- **Risk**: toolbar-vs-settings duplication avoided — both call same handlers.

### `src/ui/i18n.ts` (+16 LOC) — `#44 15 STRINGS keys`
- **Idiom**: 15 keys × 2 locales added in 1 block. Follows existing STRINGS table format.
- **Structure**: keys grouped by prefix (`toolbar.settings`, `settings.title`, `settings.section.*`, `settings.theme.*`, `settings.layout.*`, `settings.search.*`).
- **Risk**: pre-existing `skipLink` test fail unrelated to R21 (verified).

### `src/ui/review.html` (+152 LOC) — `#44 markup`
- **Idiom**: standard `<div role="dialog" aria-modal="true">` pattern. Reused from R19 modal pattern.
- **Structure**: ⚙ button in header + settings modal body with 4 `<section>` blocks + Reset button.
- **Complexity**: flat markup, no nested logic.
- **Risk**: a11y depends on `installModalA11y` helper (verified via R19 reuse).

### `src/ui/search-history.test.ts` (+87 LOC) — `#43 tests`
- **Coverage**: 6 ACs (3.1-3.6) directly tested. Both happy-path and edge-case (debounce cancel, immediate Enter) covered.
- **Quality**: uses `vi.useFakeTimers()` for deterministic timing. Clean.

### `src/ui/settings.test.ts` (+204 LOC new) — `#44 tests`
- **Coverage**: 41 tests covering AC 4.1-4.9 + i18n coverage + edge cases.
- **Quality**: tests use jsdom + happy-dom, query DOM for assertion. Comprehensive.

## Code smells check

| Smell | Found? |
|---|---|
| Type suppression (`as any`, `@ts-ignore`) | NO |
| Empty catch blocks | NO |
| Magic numbers (without named const) | MINOR — 300ms debounce not named. Acceptable, follows GitHub convention. |
| Dead code | NO |
| Copy-paste duplication | NO |
| Oversized files (>250 LOC) | NO |
| Missing JSDoc on exported functions | MINOR — R19 pattern lacks JSDoc too, follow existing convention |

## Verdict

**PASS** — code quality consistent with R19-R20 style. No smells, no idiomatic drift.