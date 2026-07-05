# R120 Discovery — Sparkline tooltips on stats visualizations (R118.3)

## Backlog Scan

**R118 retro risks-surfaced (no action this round):**
- ~~R118.1: per-round sparkline resolution rate~~ — out of scope for R120 (bigger, would need new aggregation)
- ~~R118.2: histogram bins~~ — closed by R119
- **R118.3 (PICKED):** sparkline tooltips on data points — `aria-label` only, no hover detail

**R119 retro risks-surfaced (carry-over):**
- R118.1 still deferred (per-round sparkline)
- **R118.3 still deferred** — picked now

**R117 retro risks-surfaced (carry-over):**
- Per-hunk granularity
- Click-to-expand listing

**R116 retro risks-surfaced (carry-over):**
- updateSubmitButtons reactive wiring (bugfix)

## Decision

Pick **R118.3 (sparkline tooltips)** as R120's single polish-class feature:
- Add `<title>` child to each sparkline polyline + to each histogram bar `<rect>` so browser-native hover shows data values
- R118.3 has been deferred twice (R118 retro, R119 retro). R120 closes it as an additive accessibility/UX improvement
- No new dependencies, reuses existing inline-SVG infrastructure
- Pure additive: no schema break, no new i18n strings (tooltip text uses raw numbers + bucket label)

## Scope

### Changes

1. **`src/ui/app.ts`** — modify `renderSparkline` to accept an optional `dataPoints` array for `<title>` elements. Apply to both call sites in `renderStatsPane` (round intervals + first-pass).
2. **`src/ui/app.ts`** — modify histogram bar renderer in R119 block to add `<title>` to each `<rect>` showing bucket label + count.
3. **No i18n changes** — tooltip text is computed at render time.
4. **NEW `src/r120-sparkline-tooltip.test.ts`** — 10 structural regex tests:
   - AC1: renderSparkline creates `<title>` child elements per data point
   - AC2: histogram bar `<rect>` creates `<title>` child elements
   - AC3: tooltip text includes the value
   - AC4: tooltip text includes label/aria where applicable
   - AC5: round-intervals sparkline uses dataPoints (if provided)
   - AC6: first-pass sparkline uses dataPoints (if provided)
   - AC7: histogram 4 buckets each have title elements
   - AC8: empty sparkline (no values) does NOT crash
   - AC9: tooltip uses `<title>` element (not `aria-tooltip` or `title` attribute) — browser-native rendering
   - AC10: regression — R119 tests still pass, R118 tests still pass

## Round Profile

- Feature: 1 (R118.3 sparkline tooltips)
- Bugfix: 0
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~50 (sparkline modification + histogram bar `<title>` children + tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (none)
- ≤1 polish ✓ (none — this is feature-class)
- ≤8 total ✓ (1)

## Why this candidate over alternatives

| Candidate | Verdict |
|-----------|---------|
| R118.1 (per-round sparkline) | Bigger feature, would need aggregation changes. Save for R121+ |
| R118.3 (sparkline tooltips) | **PICKED** — small additive a11y win |
| R116 bug (updateSubmitButtons reactive) | Bugfix, mix into R121+ bugfix round |
| R117 per-hunk granularity | Bigger, save for R122+ |
| Click-to-expand listing | UX feature, save for R123+ |
| Doc update for R118 + R119 | Doc-only — would need ≥1 src change to qualify as feature |
