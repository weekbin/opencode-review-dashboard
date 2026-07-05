# R119 Brief — First-pass resolve time binned histogram (R118.2)

## Goal

Add a binned histogram section to the Stats tab's First-pass resolve area, so reviewers can see at-a-glance how their resolution times distribute across actionable buckets (<1h, 1-24h, 1-7d, 7d+) instead of just an average. Mirrors GitHub Pulse activity graph shape — bars over time/category.

## Why

R118 retro listed this as **R118.2** risk-surfaced with no action. R118 shipped firstPass as `avgMs` + sparkline only. Users can see "average 4.5h" but not "is that from 10 sub-hour resolves or 1 multi-day one?" — the histogram answers that.

Also, `view.stats.firstPass.histogram` i18n key already exists in i18n.ts L95 ("Distribution"/"分布") with no binding — R119 closes that loose end.

## Scope

### 1. Aggregation (src/ui/app.ts)

Add **1 new function** following the existing R118 pattern:

```typescript
type FirstPassBucket = "<1h" | "1-24h" | "1-7d" | "7d+";

function aggregateFirstPassBuckets(values: number[]): Record<FirstPassBucket, number> {
  const HOUR = 3600 * 1000;
  const DAY = 24 * HOUR;
  return {
    "<1h": values.filter((v) => v < HOUR).length,
    "1-24h": values.filter((v) => v >= HOUR && v < DAY).length,
    "1-7d": values.filter((v) => v >= DAY && v < 7 * DAY).length,
    "7d+": values.filter((v) => v >= 7 * DAY).length,
  };
}
```

### 2. Renderer (src/ui/app.ts)

Add histogram bar renderer reusing inline SVG pattern from renderSparkline:

```typescript
function renderHistogramBar(label: FirstPassBucket, count: number, max: number): HTMLElement { ... }
```

Then extend the first-pass section in `renderStatsPane` (currently L3627-3642) to:
1. Compute buckets via `aggregateFirstPassBuckets(firstPass.values)`
2. Find max count for bar normalization
3. Append a row of 4 bars + counts + `view.stats.firstPass.histogram` heading

### 3. i18n (src/ui/i18n.ts)

Add 4 new keys × 2 locales (8 total):

```typescript
"view.stats.firstPass.bucket.underHour": { en: "< 1 hour", "zh-CN": "< 1 小时" },
"view.stats.firstPass.bucket.dayOne":     { en: "1–24 hours", "zh-CN": "1–24 小时" },
"view.stats.firstPass.bucket.weekOne":    { en: "1–7 days",  "zh-CN": "1–7 天" },
"view.stats.firstPass.bucket.overWeek":   { en: "7+ days",   "zh-CN": "7+ 天" },
```

(The existing `view.stats.firstPass.histogram` key "Distribution"/"分布" is reused as the section heading — no new key needed.)

### 4. Tests (src/r119-histogram.test.ts — NEW)

12 structural regex tests following the R118 test pattern:

- AC1: `aggregateFirstPassBuckets` function exists in app.ts
- AC2: histogram uses inline SVG namespace (`createElementNS` with svg)
- AC3: 4 bucket labels exist in i18n (en + zh-CN)
- AC4: renderStatsPane calls aggregateFirstPassBuckets inside firstPass section
- AC5: bucket helper returns Record with 4 keys (underHour/dayOne/weekOne/overWeek)
- AC6: math correctness — values < 1h go to underHour bucket
- AC7: math correctness — values 1h-24h go to dayOne bucket
- AC8: math correctness — values 24h-7d go to weekOne bucket
- AC9: math correctness — values 7d+ go to overWeek bucket
- AC10: empty state — when values=[], buckets all 0
- AC11: histogram rendered only when values.length > 0 (no empty histogram noise)
- AC12: existing R118 i18n key `view.stats.firstPass.histogram` is referenced in renderStatsPane

## Risk Register

| Risk | Mitigation |
|------|------------|
| Bucket boundaries (24h, 7d) feel arbitrary | Use GitHub Pulse-style quartile boundaries familiar to most users; ≤24h is "yesterday's work", 1-7d is "this week", 7d+ is "stale" |
| Inline SVG adds DOM cost (4 bars × 4 elements × N findings) | Reuse renderSparkline pattern; bars are static per render — no per-render hot path |
| i18n key `firstPass.histogram` already exists but never bound — risk of confusing test reading | AC12 explicitly asserts it's bound in renderStatsPane |
| Bucket label hardcoded vs translated | AC3+AC12 explicitly test both locales |

## Round Profile

- Feature: 1 (#81 R118.2 polish — binned histogram)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~120 (1 new function + 1 renderer + 4 i18n keys × 2 locales + 12 tests)

## Acceptance

- Pre-commit 8/8 PASS
- All 12 R119 tests GREEN
- 0 regressions in R118 tests
- locale parity: en + zh-CN both have 4 bucket labels
- Code reuse: histogram bars built with existing inline-SVG pattern (no new chart lib)
