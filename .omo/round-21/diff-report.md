# R21 Diff Report

> **Generated**: 2026-06-30
> **Round**: 21
> **Base SHA**: `521dfb4` (R20 gap-fix closure)
> **Tip SHA**: `7a4c045` (R21 merge)
> **Range**: `521dfb4..7a4c045`

## Commit chain

```
7a4c045  Merge branch 'team-dev-loop-round-21-settings-and-search-polish' into main
e6be856  feat(settings): #44 add centralized preferences panel with 15 i18n keys
690db2b  feat(search-history): #43 debounce 300ms + Enter-immediate commit
```

## Cumulative diff (521dfb4..7a4c045)

```
 src/ui/app.ts                 | 100 ++++++++++++++++++++-
 src/ui/i18n.ts                |  16 ++++
 src/ui/review.html            | 152 +++++++++++++++++++++++++++++++
 src/ui/search-history.test.ts |  87 ++++++++++++++++++
 src/ui/search-history.ts      |  43 +++++++++
 src/ui/settings.test.ts       | 204 ++++++++++++++++++++++++++++++++++++++++++
 6 files changed, 598 insertions(+), 4 deletions(-)
```

## Atomic commit breakdown

### Commit 1: `690db2b` — feat(search-history): #43 debounce 300ms + Enter-immediate commit
- **Profile**: polish
- **Files**: 3 (1 src + 1 src test + 1 src call-site change)
- **LOC**: +141 / -4
- **Closes**: #43

### Commit 2: `e6be856` — feat(settings): #44 add centralized preferences panel with 15 i18n keys
- **Profile**: feature
- **Files**: 4 (1 src markup + 1 src wire-up + 1 i18n + 1 new test)
- **LOC**: +458 / -1
- **Closes**: #44

## Files touched

| File | R21 total | Purpose |
|---|---|---|
| `src/ui/app.ts` | +100 / -4 | Wire up settings modal + debounce Enter handler |
| `src/ui/i18n.ts` | +16 / 0 | 15 STRINGS keys (en + zh-CN) |
| `src/ui/review.html` | +152 / 0 | ⚙ button + settings modal markup |
| `src/ui/search-history.ts` | +43 / 0 | Debounce primitive + cancel helper |
| `src/ui/search-history.test.ts` | +87 / 0 | AC 3.1-3.6 tests |
| `src/ui/settings.test.ts` | +204 / 0 | AC 4.1-4.9 tests (new file) |

## Risk surface

- New file: `src/ui/settings.test.ts` — low risk (test only)
- Modified production files: 4 — all in `src/ui/` (UI-only, no server changes)
- New dependencies: 0
- Schema changes: 0 (localStorage keys preserved)
- API changes: 0 (only internal `commitRecentSearch` / `commitRecentSearchImmediate` exports)

## Verdict

**Clean diff** — 6 files, +598 / -4, 0 deps, 0 schema breaks. Both commits atomic and self-contained.