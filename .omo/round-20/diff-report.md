# R20 Diff Report

> **Reviewer**: lead (R4 retro Gap 2 default — lead-direct)
> **Date**: 2026-06-30
> **Range**: `03cd113..4f1b6c2` (R+ retro closure → R20)
> **Commits**: 3 atomic feat + 1 merge

## File-level summary

| File | Status | Lines | Notes |
|---|---|---|---|
| `src/ui/review-progress.ts` | NEW | +71 | `formatReviewProgress(readCount, totalCount)` helper, returns `{count, total, percent, widthPct, complete}` |
| `src/ui/review-progress.test.ts` | NEW | +166 | 15 unit tests covering edge cases (0/0, 0/Y, Y/Y, negative, NaN) |
| `src/ui/search-history.ts` | NEW | +87 | localStorage wrapper with dedup + max 5 |
| `src/ui/search-history.test.ts` | NEW | +166 | 15 unit tests (mock localStorage, test dedup, cap, persistence) |
| `src/ui/i18n.ts` | MODIFIED | +6 | 3 new STRINGS keys (sidebar.reviewProgress, sidebar.filter.unread, search.recent.title) with both en + zh-CN |
| `src/ui/i18n.test.ts` | MODIFIED | +46 | 3 new AC1.2-style regression tests for new STRINGS keys |
| `src/ui/review.html` | MODIFIED | +120 | Filter chip + progress container + history dropdown markup |
| `src/ui/app.ts` | MODIFIED | +217 / -8 | Wire-up: renderReviewProgress + filterUnread + search-history + registerUITranslator calls |

**Total**: 8 files changed, +879 / -8

## Critical findings

### File: src/ui/app.ts (MODIFIED +217 / -8)

| Change | Impact | Risk |
|---|---|---|
| `renderReviewProgress()` function | Live counter update from `state.read.size` + total | LOW |
| `state.filterUnread` + localStorage `diff-review:filter-unread` | New UI filter state | LOW |
| `getRecentSearches()` + `addRecentSearch()` wiring | Search history dropdown wired to in-diff search input | LOW |
| `registerUITranslator('sidebar.filter.unread', ...)` | i18n integration per R19 AC1.2 pattern | LOW |
| `onLanguageChange(() => renderReviewProgress())` | Live re-render on language toggle | LOW |
| Filter logic in `renderFilesPane()` (search → unread → tree) | Sidebar list filters hidden files | LOW |

### File: src/ui/review.html (MODIFIED +120)

| Change | Impact | Risk |
|---|---|---|
| `<div id="sidebar-progress">` container | Visual progress indicator | LOW |
| `<input type="checkbox" id="filter-unread">` chip | Filter toggle | LOW |
| `<span data-i18n="sidebar.filter.unread">` | i18n integration | LOW |
| `.sidebar-progress-bar` CSS | Visual progress fill | LOW |

### File: src/ui/i18n.ts (MODIFIED +6)

| Change | Impact | Risk |
|---|---|---|
| `sidebar.reviewProgress` STRINGS key | i18n template with {count}/{total}/{percent} | LOW |
| `sidebar.filter.unread` STRINGS key | i18n label | LOW |
| `search.recent.title` STRINGS key | i18n dropdown title | LOW |

## Commit-level summary

| SHA | Type | Description |
|---|---|---|
| `c2d76a5` | feat(r20) | Sidebar review progress indicator (close #40) |
| `5673a23` | feat(r20) | Sidebar filter show-only-unread (close #41) |
| `ab51010` | feat(r20) | Search history recent-searches dropdown (close #42) |
| `4f1b6c2` | merge | Round 20: review workflow completeness (close #40, #41, #42) |

## Test impact

- Tests added: 32 (15 review-progress + 15 search-history + 3 i18n regression - 1 pre-existing skipLink fail not introduced by R20)
- Tests removed: 0
- Tests modified: 0
- Tests pre-existing passing: 420 → 452 (net +32)

## Build impact

- Build clean: PASS (304 files, 10974.07 kB, 305ms)
- Lint: 0 warnings, 0 errors (95 rules, 41 files)
- Typecheck: clean
- Format: clean

## Backward compatibility

- All existing flows preserved (no breaking changes)
- Existing utility functions NOT modified (R16 SG.14 add-only rule honored)
- localStorage keys added without conflicts (`diff-review:filter-unread`, `diff-review:recent-searches` are new keys)

## Critical findings summary

- **NO CRITICAL findings**
- **NO MAJOR findings**
- **1 MINOR** (R21+ polish candidate): Search history granularity — captures every keystroke vs only Enter-pressed queries
- **0 nitpicks** at file-level

## Lead-direct verdict: **PASS**

Diff is consistent with plan.md scope. No architectural changes, no schema breaks, no new dependencies. Ready for ship.