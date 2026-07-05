# R120 Research — Sparkline tooltips (R118.3)

## Files involved

- `src/ui/app.ts` — modify `renderSparkline` (L3543-3578) + R119 histogram block (L3675-3703)
- `src/r120-tooltip.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**renderSparkline (L3543-3578)**:
- Returns `SVGSVGElement`
- Builds polyline from `values: number[]`
- Two call sites in renderStatsPane:
  - L3638: `renderSparkline(gaps, { ariaLabel: "Round interval sparkline" })` — gaps is gaps between consecutive rounds
  - L3653: `renderSparkline(firstPass.values, { ariaLabel: "First-pass resolve time sparkline" })`

**Histogram bars (R119, L3675-3703)**:
- Each cell wraps an inner SVG with one `<rect>` 
- 4 bucket labels: `<1h`, `1-24h`, `1-7d`, `7d+`
- Already uses `t(def.i18nKey)` for translated label

## Simplest change

1. Extend `renderSparkline` opts with `dataPoints?: Array<{ label: string; value: number }>` (or just `valueFormatter?`). When provided, generate `<title>` child for each polyline node.
2. Add `<title>` to each histogram `<rect>` directly in the for-loop.
3. No new i18n keys — tooltip text uses raw numbers + existing bucket labels.

## Test convention

Project uses structural regex tests (read source, assert content). 10 tests follow R118/R119 pattern.

## Risk assessment

- **Low**: SVG `<title>` is universal browser standard since SVG 1.0 (2001). No support concerns.
- **Low**: Pure additive — existing code works without `dataPoints`.
- **Low**: i18n parity preserved — bucket labels already translated.
- **Low**: Test count drift — 10 new tests additive to 928.

## v6 compliance

- 1 feature ≤3 ✓
- 0 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓
