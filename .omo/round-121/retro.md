# R121 Retro — Per-round resolution-rate sparkline trend (R118.1)

## What Shipped

Issue: R118 retro listed R118.1 (per-round sparkline resolution rate) as risk-surfaced-no-action. R119 retro + R120 retro both noted it as still-deferred. R121 closes it as the last remaining R118.x polish item.

User-facing delivery:
- **Per-round resolution-rate sparkline** rendered under the existing byRound table in the Stats tab
- Inline SVG line chart at 280×32 (longer than default 120×24 for full-pane-width visibility)
- Y-axis: resolution rate % (0-100), X-axis: round number (1 → N)
- Reuses existing `aggregateByRound` from R118 (no new aggregation)
- Reuses existing `renderSparkline` from R118 (no new SVG primitive)
- R120 `dataPoints` reuse: each polyline data point gets browser-native hover tooltip ("Round 3: 75%")
- Caption "Resolution rate trend" / "解决率趋势" (i18n-aware, new key × 2 locales)
- Renders ONLY when ≥2 rounds exist — single-round users see existing table only (matches renderSparkline empty branch semantics)

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| byRound section appends renderSparkline for trend | ✓ app.ts:3620-3641 |
| rates array computed from aggregateByRound | ✓ same sorted entries |
| trend sparkline 280×32 | ✓ |
| trend sparkline passes dataPoints | ✓ R120 compat |
| i18n view.stats.byRound.trend in en | ✓ "Resolution rate trend" |
| i18n view.stats.byRound.trend in zh-CN | ✓ "解决率趋势" |
| trend div with stats-by-round-trend class | ✓ |
| caption uses t("view.stats.byRound.trend") | ✓ |
| trend renders after byRoundTable | ✓ |
| ≥2 rounds guard | ✓ `if (sortedRounds.length >= 2)` |
| regression — R118 + R119 + R120 | ✓ all 38 prior tests still pass |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec.
- Implementation: ~25 LOC in app.ts (sort once, compute rates, conditional render) + 1 i18n key × 2 locales + 10 tests.
- 1 mid-implementation stumble: AC2 regex assumed `agg.resolved / agg.total * 100` but actual code has `(agg.resolved / agg.total) * 100` with parens. Fixed regex by using `[\s\S]*?` for cross-token gaps.
- 1 retest pass had to overwrite stale r121 test file due to dup describe line.
- 3/10 tests pass on initial RED (because R118 + i18n + renderSparkline code already exists from prior rounds); 7/10 need real implementation.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R121 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R118.1 per-round sparkline trend (R118-retro risk-surfaced, deferred 3 rounds): SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY. All R118.x polish items now closed (R118.2 in R119, R118.3 in R120, R118.1 in R121).

## Self-Improvement Observations

- **All R118.x polish items now closed**: R118.2 (histogram), R118.3 (tooltips), R118.1 (trend). The 3-round polish arc finished cleanly. Next polish cycles should pivot to other rounds' deferrals (R116 updateSubmitButtons reactive, R117 per-hunk reconcile, R119 histogram bar baseline = min not zero).
- **Cross-line regex `[\s\S]*?` is the right tool**: when matching patterns that may include parens, brackets, or other chars between two anchor terms, dot doesn't work in JS but `[\s\S]*?` does. Standardize in future tests.
- **Pattern of "use the SAME sorted entries for table + trend" avoids duplicate sort**: `const sortedRounds = [...aggregateByRound(findings).entries()].sort(...)` then iterate `sortedRounds` for table + `sortedRounds.map(...)` for trend. Cleaner than re-sorting inside.

## Risks Surfaced (no action this round)

- **Histogram bar baseline is min not zero**: noted in R119 retro, still deferred (R122+ candidate)
- **Per-hunk reconcile (R117.1)**: still deferred per R117 retro
- **updateSubmitButtons reactive (R116.1)**: still deferred per R116 retro

## v6 Compliance

- Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 1 (R118.1 per-round trend sparkline)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~20 minutes