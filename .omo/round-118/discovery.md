# R118 Discovery — Review Velocity analytics (#81)

## Issue Scope

**#81 (round-116 tag)**: Review Velocity 分析面板（per-round/per-category dashboards）

Solo reviewers using ORD for 3+ months have no feedback on their own review pattern. The issue states: "用户本能感觉'自己是不是在写 wontfix 太多'" (users instinctively wonder if they're writing too many wontfix markers). No existing dashboard surfaces this.

**Fix**: New "Stats" sub-tab — parallel to "conversation" and "previously discussed" tabs. Renders 4 metric categories using inline SVG sparklines + tables. Zero external dependencies. Data from `state.findings[]` (already has all needed timestamps).

**Goal**: Single-reviewer can self-audit review pace, category distribution, resolution pattern.

## Current ORD Code State

- `src/index.ts:82-100` Finding type has timestamps: `created_at`, `edited_at`, `resolved_at`, `pinned_at`, `round`
- `src/ui/app.ts` only renders timestamps as relative-time strings (e.g. "3 min ago")
- 0 occurrences of: `chart`, `graph`, `sparkline`, `aggregate`, `stat` (verbatim grep confirmed)
- Tab infrastructure already supports N tabs via `state.activeTab` (file/commits/conversation/previously)
- Findings stay in `state.findings[]` across rounds — natural time-series available

## 4 Metric Categories

1. **Per-round finding total + resolution rate**: For each round N, show total findings created + how many resolved by end. Resolution rate = resolved/total.
2. **Per-category resolve/unresolved/wontfix ratio**: Stacked bar showing distribution of category (bug/style/perf/question/recommend) vs status.
3. **Round interval time**: Time gap between consecutive rounds (between last finding `created_at` of round N and first of round N+1).
4. **First-pass-resolve average elapsed time**: For resolved findings, average `resolved_at - created_at`.

All rendered as inline SVG sparklines (no chart library, no external deps).

## Tab Integration

Per issue: "tools 与 conversation / previously-discussed 平行" (tools in parallel with conversation/previously-discussed).

Current tabs: `files` / `commits` / `conversation` / `previously`. Adding `stats` makes 5 tabs. The 5th tab fits naturally in the tab row.

## Files To Touch (estimated 250-400 LOC)

- `src/ui/i18n.ts`: ~15-20 new STRINGS keys × 2 locales
- `src/ui/app.ts`: 
  - `STATS_TAB_KEY` localStorage persistence
  - `state.activeTab` extend with `"stats"` literal
  - New `renderStatsPane()` function (200+ LOC — tab content + 4 metric renderers)
  - `renderSparkline(values: number[], opts)` helper for inline SVG
  - Stats data aggregation functions: `aggregateByRound()`, `aggregateByCategory()`, `aggregateRoundIntervals()`, `aggregateFirstPassResolveTime()`
- `src/ui/review.html`: Add 5th tab button "Stats"
- New file: `src/r118-review-velocity.test.ts` (~10-15 tests, structural regex per project convention)

## Acceptance Criteria

- AC1: 5th tab "Stats" visible parallel to existing 4 tabs
- AC2: Click Stats → tab content renders (no error)
- AC3: Per-round metric shows N round labels + sparkline
- AC4: Per-category metric shows 5 categories stacked bar
- AC5: Round interval metric shows sparkline of gaps
- AC6: First-pass-resolve metric shows average ms + sparkline
- AC7: Tab persists across reload via localStorage
- AC8: i18n keys present in both en + zh-CN
- AC9: All renderers use inline SVG (no external chart lib)
- AC10: Empty state when findings[] is empty (round 0 / new install)

## Round Profile

- Feature: 1 (#81)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)