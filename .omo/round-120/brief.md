# R120 Brief — Sparkline tooltips on stats visualizations (R118.3)

## Goal

Add browser-native hover tooltips to every data point in the Stats tab's existing visualizations so reviewers can see exact values without leaning on `aria-label`. Uses SVG `<title>` child elements (browsers render native tooltip on hover via `<title>` tag).

## Why

R118 retro listed **R118.3** as risk-surfaced-no-action. R119 retro mentioned it again as still-deferred. R120 closes it. The current state:
- `renderSparkline` (L3543-3578) sets `aria-label` on the SVG but not per-point titles
- Histogram bars (R119's new block L3679-3692) have no titles at all — just `role="img"` + the bucket label div below
- Screen-reader users with `aria-label="First-pass resolve time sparkline"` hear nothing about specific values

Adding `<title>` to:
- Each polyline node (sparkline data points)
- Each histogram `<rect>`

turns each into a hover-revealed tooltip showing "Round 3: 5 resolved of 7 (71%)" or "< 1 hour: 4 findings" etc. Browsers render these as native popups.

## Scope

### 1. `src/ui/app.ts` (single file, ~30 LOC)

**Modify `renderSparkline` signature**: add optional `dataPoints?: Array<{ label: string; value: number }>` to opts. When provided, create one `<title>` child per polyline point and append to polyline as `<title>{label}: {value}</title>`.

**Modify R119 histogram block** (L3675-3703): for each of 4 bucket cells, add `<title>` to the `<rect>` with `"{translated label}: {count} findings"` text. HTML <title> attribute doesn't work inside SVG — must use SVG `<title>` child.

### 2. No i18n changes

Tooltip text is computed at render time using `t()` for bucket labels. `view.stats.firstPass.bucket.*` keys from R119 are reused.

### 3. NEW `src/r120-tooltip.test.ts`

10 structural regex tests:
- AC1: renderSparkline creates `<title>` child via createElementNS when dataPoints provided
- AC2: histogram `<rect>` creates `<title>` child via createElementNS
- AC3: tooltip text contains the value (numeric substring)
- AC4: tooltip text contains the label (bucket/point label)
- AC5: round-intervals sparkline call passes dataPoints (or compatible opts)
- AC6: first-pass sparkline call passes dataPoints
- AC7: histogram 4 cells each emit title — total 4 `<title>` elements inside histogramRow
- AC8: empty sparkline (no values) does NOT crash when dataPoints absent
- AC9: title elements are SVG-namespace (createElementNS with svg), not HTML title attribute
- AC10: regression — R119 + R118 tests still PASS

## Risk Register

| Risk | Mitigation |
|------|------------|
| `<title>` inside SVG vs HTML | Use `createElementNS("http://www.w3.org/2000/svg", "title")` always (per AC9 test) |
| Date-fns-format not needed | R120 formats ms as `"Xms"` matching R118 sparkline area text |
| Browser tooltip rendering varies | `<title>` is the standard SVG tooltip — Chromium/Firefox/Safari all render |
| Regressing R118/R119 tests | AC10 explicit regression check; lockstep run after impl |

## Round Profile

- Feature: 1 (R118.3 sparkline tooltips)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~30 (sparkline opts + dataPoints wiring) + ~15 (histogram title children) + ~100 (test file)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R120 tests GREEN
- 0 regressions in R118 (14 tests) + R119 (20 tests)
- Native browser tooltip pops on hover over each sparkline polyline node + each histogram bar
- Title elements use SVG namespace (NOT HTML title attribute)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (this is feature-class: visible UI addition)
- ≤8 total ✓ (1)
