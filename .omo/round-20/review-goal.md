# R20 Lens #1 — Goal / AC Verification

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Source**: `.omo/round-20/plan.md` ACs

## Per-AC verdict

| AC | Source | Plan claim | Verified at | Verdict |
|---|---|---|---|---|
| AC1.1 | plan §2 | Sidebar header shows "X / Y reviewed (Z%)" | app.ts:renderReviewProgress + i18n.ts:sidebar.reviewProgress | PASS |
| AC1.2 | plan §2 | Counter updates live when toggleRead | applyFileState → renderReviewProgress call | PASS |
| AC1.3 | plan §2 | Visual progress bar < 6px tall | review.html .sidebar-progress + CSS | PASS |
| AC1.4 | plan §2 | Counter text via t('sidebar.reviewProgress', params) | review-progress.ts + i18n.ts | PASS |
| AC1.5 | plan §2 | STRINGS has both en + zh-CN | i18n.ts: STRINGS.sidebar.reviewProgress | PASS |
| AC2.1 | plan §2 | Sidebar header shows "Show only unread" chip | review.html #filter-unread + data-i18n | PASS |
| AC2.2 | plan §2 | Toggle sets state.filterUnread + filter list | app.ts:renderFilesPane filter logic | PASS |
| AC2.3 | plan §2 | localStorage 'diff-review:filter-unread' persistence | app.ts init + toggle | PASS |
| AC2.4 | plan §2 | Chip text via t('sidebar.filter.unread') | i18n.ts + registerUITranslator | PASS |
| AC2.5 | plan §2 | Counter shows TOTAL count (not filtered) | app.ts:renderReviewProgress uses totalFiles (not filtered) | PASS |
| AC3.1 | plan §2 | When search input focused, dropdown shows last 5 | search-history.ts + app.ts | PASS |
| AC3.2 | plan §2 | Click recent populates + re-runs search | search-history.ts + app.ts | PASS |
| AC3.3 | plan §2 | Deduped, max 5 | search-history.ts:addRecentSearch | PASS |
| AC3.4 | plan §2 | localStorage 'diff-review:recent-searches' JSON | search-history.ts:getRecentSearches | PASS |
| AC3.5 | plan §2 | Title via t('search.recent.title') | i18n.ts + app.ts dynamic t() | PASS |

## All 15 ACs: PASS

## Issues found

**Minor**: AC3.3 history granularity — captures intermediate keystrokes. Should debounce 300ms before commit. R21+ polish candidate.

## Goal achievement summary

- 100% (15/15) ACs PASS
- 0 FAIL
- 0 PARTIAL
- 0 NOT-VERIFIED

## Sign-off

Lead-direct verdict: **PASS**. R20 ready for ship to main.