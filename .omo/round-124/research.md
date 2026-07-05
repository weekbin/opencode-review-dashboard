# R124 Research — Histogram bar baseline (R119.2)

## Files involved

- `src/ui/app.ts` — 1 line change at L3715
- `src/r124-histogram-baseline.test.ts` — NEW file, 8 structural regex tests

## Existing patterns to reuse

**Histogram block (L3700-3748)**:
```typescript
const buckets = aggregateFirstPassBuckets(firstPass.values);
const histogramHeading = document.createElement("h4");
histogramHeading.textContent = t("view.stats.firstPass.histogram");
// ...
const bucketDefs: { key: keyof typeof buckets; i18nKey: string }[] = [...];
const maxCount = Math.max(...bucketDefs.map((b) => buckets[b.key]), 1);
for (const def of bucketDefs) {
  const count = buckets[def.key];
  // ...
  const barHeight = (count / maxCount) * 28;
  // ...
}
```

## Simplest change

Replace `Math.max(...bucketDefs.map((b) => buckets[b.key]), 1)` with:
```typescript
const totalCount = bucketDefs.reduce((sum, b) => sum + buckets[b.key], 0);
const maxCount = Math.max(totalCount, 1);
```

This preserves the variable name `maxCount` so the `barHeight` formula at L3725 stays unchanged.

## Risk assessment

- **Low**: pure math change, no DOM structure change
- **Low**: preserves variable name + formula
- **Low**: 1-line addition (add totalCount calc)
- **Low**: handles 0-total case via Math.max(_, 1)

## Test convention

Structural regex per project standard. 8 tests, 8 ACs.

## v6 compliance

- 0 features ≤3 ✓
- 1 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓