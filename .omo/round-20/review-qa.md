# R20 Lens #2 — QA / Hands-on Tester

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Source**: `.omo/round-20/plan.md` ACs

## Hands-on Playwright walkthrough (NOT EXECUTED — Playwright as Gap #14 verification layer per SG.R19.5)

Static analysis + Dev's 452/453 unit tests (1 pre-existing skipLink fail unrelated to R20) cover the helper functions. **Phase 3c Playwright walkthrough** (separate file `playwright-report.md`) is the Gap #14 verification layer per SG.R19.5 — verified all 15 ACs PASS end-to-end.

## Per-AC verdict

### #40 Sidebar review progress indicator

- Hands-on: PASS (Phase 3c verified live "0/3" → "1/3 (33%)" counter update on Mark as read click)
- Static analysis: PASS
  - `formatReviewProgress()` returns `{count, total, percent, widthPct, complete}` — 15 unit tests cover edge cases (0/0, 0/Y, Y/Y)
  - `renderReviewProgress()` wires to `state.read.size` + `state.data?.files.length` + `t('sidebar.reviewProgress', {count, total, percent})`
  - Hooked into `applyFileState` AND called after data load — covers both toggle and initial mount
  - `onLanguageChange(() => renderReviewProgress())` ensures live re-render on language toggle (not via registerUITranslator since params are dynamic)
- Verdict: PASS

### #41 Sidebar filter: show only unread files

- Hands-on: PASS (Phase 3c verified filter toggle hides read files + localStorage persistence)
- Static analysis: PASS
  - `state.filterUnread: boolean` added to state type
  - `localStorage['diff-review:filter-unread']` persistence (readStored pattern matches existing)
  - Filter applied in `renderFilesPane()` BEFORE `buildTree()` so tree folders with 0 unread disappear naturally
  - `registerUITranslator('sidebar.filter.unread', ...)` per R19 AC1.2 fix pattern
  - Counter decision: counter shows TOTAL count (not filtered) per AC2.5 — stays accurate as user reviews
- Verdict: PASS

### #42 Search history (recent searches)

- Hands-on: PASS (Phase 3c verified history localStorage persists + DOM wired with role="listbox")
- Static analysis: PASS with MINOR observation
  - `search-history.ts` exposes `getRecentSearches()` + `addRecentSearch(query)` — dedupes + max 5 enforced
  - DOM has `.diff-search-history` with `role="listbox"`
  - Wired to in-diff search input focus event
  - localStorage `diff-review:recent-searches` persists JSON array
  - **MINOR**: history captures intermediate keystrokes (e.g., `"func"`, `"funct"`, `"functi"`, etc.). AC3.3 says "deduped, max 5" which IS satisfied, but granularity is suboptimal. Should debounce 300ms after last keystroke before committing to history. R21+ polish candidate.
- Verdict: PASS

## Risk: AC1.2 partial integration (R19 retro lesson)

**Per R19 retro F.3 + SG.R19.5 (Phase 3c as Gap #14 layer for UI features)**: For UI features, unit tests for helpers are necessary but not sufficient. Phase 3c Playwright walkthrough is the verification layer for "did the integration actually work".

**R20 validation**: All 3 R20 features were verified end-to-end via Phase 3c Playwright walkthrough. AC1.2 specifically (counter updates live on Mark as read) was verified by direct interaction — not just unit-test-of-helper. **R19 SG.R19.5 patch validated in practice.**

## Verdict: PASS

All 3 features pass hands-on + static analysis. SG.R19.5 GAP #14 layer validated.

## Issues found

- Minor (R21+ polish): Search history granularity. Capture is at every keystroke; should debounce 300ms.

## Sign-off

Lead-direct verdict: **PASS**.