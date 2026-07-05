# R121 Discovery — Per-round resolution-rate sparkline (R118.1)

## Backlog Scan

**R118 retro risks-surfaced (deferred 3 rounds now):**
- ~~R118.2 histogram bins~~ — closed by R119
- ~~R118.3 sparkline tooltips~~ — closed by R120
- **R118.1 (PICKED)**: per-round sparkline resolution rate trend

**R120 retro risks-surfaced (carry-over):**
- Per-hunk reconcile (R117.1)
- Per-round sparkline resolution rate (R118.1) — picked now
- Histogram bar baseline = min not zero

**R119 retro risks-surfaced (carry-over):**
- Per-hunk reconcile (R117.1)
- Histogram bar baseline = min not zero

## Decision

Pick **R118.1 (per-round sparkline resolution rate)** as R121's single polish-class feature:
- R118 just shipped the byRound table (Round N: total/resolved/rate). Adding an inline SVG sparkline of resolution rate per round converts that flat row-by-row view into a single line chart visualization — instantly shows "is my resolution rate trending up over rounds?"
- Reuses existing `aggregateByRound` from R118, no new aggregation
- Reuses existing `renderSparkline` from R118, no new SVG renderer
- Pure additive: no schema break, 0 new i18n keys needed (caption uses existing "Distribution" or "Resolution rate" key)
- This has been deferred THREE times now (R118 retro → R119 retro → R120 retro) — high-value additive polish

## Why R121 ≠ R121.x

The R118 retro used "R118.x" notation to mean "polish-class continuation of R118." R119 was R118.2, R120 was R118.3. R121 takes R118.1 next — its own round.

## Round Profile

- Feature: 1 (R118.1 per-round resolution-rate sparkline trend)
- Bugfix: 0
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~50 (1 trend renderer + caption + 10 tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (none — this is feature-class)
- ≤8 total ✓ (1)