# R119 Research — First-pass resolve time binned histogram (R118.2)

## Files involved

- `src/ui/app.ts` — add `aggregateFirstPassBuckets` (L~3525, near `aggregateFirstPass`) + `renderHistogramBar` (L~3565, near `renderSparkline`) + extend `renderStatsPane` firstPass section (L3627-3642)
- `src/ui/i18n.ts` — add 4 new keys × 2 locales (`view.stats.firstPass.bucket.{underHour,dayOne,weekOne,overWeek}`)
- `src/r119-histogram.test.ts` — NEW file (12 structural regex tests)

## Existing patterns to reuse

**Aggregation helpers (L3476-3525)**:
- `aggregateByRound`, `aggregateByCategory`, `aggregateRoundIntervals` use the same shape: take `findings: Finding[]` (or derived array), return Map or values array.
- For our case, `aggregateFirstPass(findings)` already returns `{ avgMs, values }` — we can either extend it OR add a sibling `aggregateFirstPassBuckets(values)` that takes the raw ms array. Going with sibling for separation of concerns (R118 aggregation is "stat", R119 is "distribution").

**Sparkline + SVG rendering (L3527-3563)**:
- `renderSparkline` uses `document.createElementNS("http://www.w3.org/2000/svg", ...)` — same pattern for histogram bars.
- For bars, simpler element: `<rect>` with width proportional to count/max. No need for polyline.

**i18n (src/ui/i18n.ts L90-95)**:
- Existing `view.stats.firstPass.heading`, `view.stats.firstPass.avgMs`, `view.stats.firstPass.histogram` keys.
- `view.stats.firstPass.histogram` (L95) is the "Distribution" / "分布" key — currently UNBOUND. R119 binds it as the histogram heading.

**Stats tab pane in renderStatsPane (L3627-3642)**:
- Already builds `<section class="stats-section">` for firstPass.
- Already calls `renderSparkline` for raw values.
- We append 4 bar elements after the sparkline, under a `Distribution` heading.

## Simplest change (R119 fact sheet)

1. Add `aggregateFirstPassBuckets(values: number[]): Record<FirstPassBucket, number>` — pure function, easy to test via direct unit if needed (skipped — test via file content per project convention)
2. Add `renderHistogramBar(label, count, max)` returning `HTMLElement` — small DOM helper
3. In `renderStatsPane` firstPass section, after `spark2` is appended, build a 4-bar row using buckets
4. Add 4 i18n keys × 2 locales (8 strings)
5. Write 12 structural regex tests

## Test convention

Project uses **structural regex tests** (read file source, assert content patterns) — NOT direct unit tests. Each R119 test will:
- `readFile(src/ui/app.ts)` 
- `slice` the relevant function window
- `expect(window).toMatch(/pattern/)`

This is the same pattern as `src/r118-review-velocity.test.ts` (140 lines, 14 tests).

## Risk assessment

- **Low**: aggregation is pure arithmetic, no DOM, no async
- **Low**: SVG rendering reuses proven namespace pattern
- **Low**: i18n adds 8 strings total, parity check is mechanical
- **Medium**: renderStatsPane extension must preserve existing R118 behavior — easy to regress via incorrect splice

Mitigation: after implement, run R118 tests + R119 tests in same `bun test` invocation. If R118 tests fail, regression.

## Existing i18n key reuse

R118 retro mentioned the `view.stats.firstPass.histogram` key but the brief didn't add a binding. Now we bind it: heading text = "Distribution" / "分布". No need to remove or rename — perfectly reuses what R118 left behind.

## v6 compliance

- 1 feature ≤3 ✓
- 0 bugfix ≤5 ✓
- 0 polish ≤1 ✓ (this IS the feature, not polish-class)
- 1 total ≤8 ✓
