# R124 Brief — Histogram bar baseline = absolute count (R119.2)

## Goal

Change histogram bar height normalization in Stats tab from max-bucket-relative to total-count-relative. Bars now visually represent each bucket's share of total resolutions (0-100%), giving users an at-a-glance sense of relative distribution.

## Why

R119 retro listed this as risk-surfaced-no-action. R120-R123 retros all mentioned it as still-deferred. 5 rounds deferred is at v6 NO DEFERRAL threshold.

User benefit: User sees `<1h: 80, 1-24h: 15, 1-7d: 5, 7d+: 0` → bars clearly show 80% in <1h, 15% in 1-24h, 5% in 1-7d, 0% in 7d+ → instant understanding of where time goes.

## Scope

### 1. `src/ui/app.ts` (1 line change, L3715)

Replace:
```typescript
const maxCount = Math.max(...bucketDefs.map((b) => buckets[b.key]), 1);
```

With:
```typescript
const totalCount = bucketDefs.reduce((sum, b) => sum + buckets[b.key], 0);
const maxCount = Math.max(totalCount, 1);
```

`barHeight = (count / maxCount) * 28` formula stays — but `maxCount` is now TOTAL count, not MAX bucket count.

### 2. No i18n changes (cosmetic only)

### 3. Tests (src/r124-histogram-baseline.test.ts — NEW)

8 structural regex tests:

- AC1: histogram block uses `totalCount` variable (sum across all buckets) — not just max
- AC2: histogram block no longer uses `Math.max(...bucketDefs.map(b => buckets[b.key]))` directly for normalization
- AC3: `barHeight` formula still uses `count / maxCount * 28`
- AC4: bar opacity for count=0 still 0.15 (preserved)
- AC5: 4 buckets still rendered (regression — R119)
- AC6: `view.stats.firstPass.histogram` heading bound (regression — R119)
- AC7: bucket label keys still used (regression — R119)
- AC8: regression — R119 + R120 + R121 + R122 + R123 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| User expects max-relative (R119 default) and is confused | The new behavior is what users intuitively expect from bar charts |
| Empty buckets all show empty (0/0) — same as 0/total | `totalCount = 0` triggers `Math.max(0, 1) = 1` so all buckets get height 0 (no division error) |
| Visual proportion feels wrong for users with extreme skew | Same as before; this IS the goal of the fix |
| Pre-existing R119 histogram regression | AC5+AC6+AC7 explicit regression |

## Round Profile

- Feature: 0
- Bugfix: 1 (R119.2 histogram baseline normalization)
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~5 (1 line change + 8 tests)

## Acceptance

- Pre-commit 8/8 PASS
- All 8 R124 tests GREEN
- 0 regressions in R119-R123 tests

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (1)
- ≤1 polish ✓
- ≤8 total ✓ (1)