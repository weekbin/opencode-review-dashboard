# R121 Research — Per-round resolution-rate sparkline trend (R118.1)

## Files involved

- `src/ui/app.ts` — extend byRound section in `renderStatsPane` (L3606-3622) + reuse existing `aggregateByRound` + `renderSparkline`
- `src/ui/i18n.ts` — add 1 key × 2 locales (`view.stats.byRound.trend`)
- `src/r121-by-round-trend.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**`aggregateByRound` (L3458-3468)**:
- Returns `Map<number, RoundAggregate>` where `RoundAggregate = { round, total, resolved }`
- Already used in byRound table loop at L3613
- Already sorts by round ascending at L3614

**`renderSparkline` (L3543-3589)**:
- Returns `SVGSVGElement`
- Builds polyline from `values: number[]`
- After R120: accepts `dataPoints?: Array<{label, value}>` for tooltip support
- Width 120 / height 24 default — we want 280 / 32 for per-round trend (longer timeline)

**Existing byRound table (L3613-3621)**:
```typescript
for (const [round, agg] of [...aggregateByRound(findings).entries()].sort(
  (a, b) => a[0] - b[0],
)) {
  const row = document.createElement("tr");
  const rate = agg.total > 0 ? Math.round((agg.resolved / agg.total) * 100) : 0;
  row.innerHTML = `<td>Round ${round}</td><td>${agg.total} ${t("view.stats.byRound.total")}</td>...`;
  byRoundTable.appendChild(row);
}
byRoundSection.appendChild(byRoundTable);
root.appendChild(byRoundSection);
```

`rate` is exactly what we plot in the sparkline.

## Simplest change (R121 fact sheet)

1. Add `view.stats.byRound.trend` key × 2 locales (i18n.ts)
2. After byRoundTable.appendChild loop in renderStatsPane:
   - Compute rates array from `aggregateByRound` (same map, sorted by round)
   - Append `renderSparkline(rates, {width: 280, height: 32, ariaLabel: "Per-round resolution rate trend", dataPoints: ...})`
   - Append caption div with i18n key
3. Test that 10 ACs pass

## Test convention

Structural regex (project standard) — read app.ts source, slice relevant window, assert content patterns. Window size: 10000 (function now ~6500 chars after R119 + R120 extensions; R121 adds ~50 chars so well within window).

## Risk assessment

- **Low**: aggregation is pure reuse
- **Low**: SVG rendering reuses proven `renderSparkline` from R118 + R120 tooltip support
- **Low**: i18n adds 1 key × 2 locales = 2 strings, parity check trivial
- **Medium**: renderStatsPane grows from ~6600 → ~6700 chars. Test windows 10000 still OK.

## v6 compliance

- 1 feature ≤3 ✓
- 0 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓