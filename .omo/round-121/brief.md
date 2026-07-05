# R121 Brief — Per-round resolution-rate sparkline trend (R118.1)

## Goal

Add an inline SVG sparkline showing the **resolution rate (%) per round** as a trend line, rendered under the existing byRound table in the Stats tab. Converts the static row-by-row view ("Round 1: 80%, Round 2: 60%, ...") into an immediately readable visual trend ("am I getting better at closing findings each round?").

Mirrors GitHub Pulse weekly trend sparkline + WakaTime daily coding bars pattern.

## Why

R118 retro listed R118.1 as risk-surfaced-no-action. R119 retro + R120 retro both noted it as still-deferred. R121 finally closes it.

## Scope

### 1. Renderer (src/ui/app.ts)

After byRoundTable.appendChild loop (currently L3613-3620), add:
- Compute `rates = [...aggregateByRound(findings).entries()].sort().map(agg => Math.round(agg.resolved/agg.total*100))`
- Append `renderSparkline(rates, {width: 280, height: 32, ariaLabel: "Per-round resolution rate trend", dataPoints: rates.map((r, i) => ({label: `Round ${i+1}`, value: `${r}%`}))})`
- Append caption `<div>` with `view.stats.byRound.trend` i18n key

### 2. i18n (src/ui/i18n.ts)

Add 1 key × 2 locales:

```typescript
"view.stats.byRound.trend": { en: "Resolution rate trend", "zh-CN": "解决率趋势" },
```

### 3. Tests (src/r121-by-round-trend.test.ts — NEW)

10 structural regex tests:
- AC1: renderStatsPane byRound section appends `renderSparkline` after byRoundTable
- AC2: rates array computed from aggregateByRound resolution/total*100
- AC3: trend sparkline uses 280×32 dimensions (longer than default 120×24)
- AC4: trend sparkline passes `dataPoints` for per-point tooltips (R120 reuse)
- AC5: i18n has `view.stats.byRound.trend` key in en
- AC6: i18n has `view.stats.byRound.trend` key in zh-CN
- AC7: byRoundSection appends trend div with `stats-by-round-trend` class
- AC8: trend caption uses `t("view.stats.byRound.trend")` (i18n-aware)
- AC9: trend renders after byRoundTable, before byRoundSection is appended to root
- AC10: regression — R118 + R119 + R120 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| Existing R118 tests regress | AC1-AC4 use file-content pattern; tests for R118 still pass |
| Re-using renderSparkline grows renderStatsPane further (already 6600 chars after R120) | Window = 10000 (already in R120 tests, will match) |
| Edge: single-round users see no sparkline (renderSparkline shows dash for <2 values) | Already handled by R118 renderSparkline empty branch |
| Caption adds 1 i18n key — potential 1-key-parity drift | AC5+AC6 verify both locales |

## Round Profile

- Feature: 1 (R118.1 per-round resolution-rate sparkline trend)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~50 (1 trend renderer + 1 i18n key × 2 locales + 10 tests)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R121 tests GREEN
- 0 regressions in R118 (14) + R119 (20) + R120 (10) tests
- locale parity: en + zh-CN both have `view.stats.byRound.trend`
- Code reuse: trend uses existing `renderSparkline` from R118 + `dataPoints` from R120

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓
- ≤8 total ✓ (1)