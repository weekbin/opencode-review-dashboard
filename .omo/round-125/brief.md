# R125 Brief — Per-hunk reconcile badges (R117.1)

## Goal

When reconcile mode is active, add a small badge inside each hunk wrapper (`<div data-hunk="N">`) showing how many findings land in that specific hunk's line range. Click → jump to first finding in that hunk.

## Why

R117 retro listed per-hunk reconcile as a 7-round-deferred enhancement. R118-R124 retros all noted it as still-deferred. Closes the R117 polish arc fully (R117 was per-file; R123 added click-to-expand per-file; R125 completes per-hunk granularity).

## Scope

### 1. `src/ui/app.ts`

**Helper** (pure data):
```typescript
function findingsInHunk(
  findings: Finding[],
  hunkRange: { startLine: number; endLine: number },
  filePath: string,
): Finding[] {
  return findings.filter(
    (f) =>
      f.file === filePath &&
      f.start_line >= hunkRange.startLine &&
      f.start_line <= hunkRange.endLine,
  );
}
```

**Renderer** (extends existing `injectHunkCollapseButtons`):
- For each `<div data-hunk>` wrapper
- Get hunk index, look up `HunkRange` via `virtualizer.getHunkRanges(filePath)[hunkIndex]`
- If `state.reconcileMode === true` AND `findingsInHunk(...).length > 0`:
  - Render `<button class="reconcile-hunk-badge" data-hunk-index="N">N in this hunk</button>`
  - Click handler: `e.stopPropagation()` + `jumpToFindingById(hunkFindings[0].id)`

### 2. i18n (1 new key × 2 locales)

```typescript
"reconcile.hunk.badge": { en: "{count} in this hunk", "zh-CN": "本代码块内 {count} 项" },
```

### 3. Tests (src/r125-per-hunk-reconcile.test.ts — NEW)

10 structural regex tests:
- AC1: `findingsInHunk` function exists in app.ts
- AC2: per-hunk reconcile badge rendered inside `[data-hunk]` wrapper when reconcile mode on
- AC3: badge click handler delegates to jumpToFindingById
- AC4: badge only rendered when count > 0
- AC5: badge only rendered when reconcile mode is on
- AC6: findings filter uses start_line between startLine and endLine
- AC7: i18n key `reconcile.hunk.badge` in en
- AC8: i18n key `reconcile.hunk.badge` in zh-CN
- AC9: HunkRange interface has hunkIndex/startLine/endLine fields (R125 prerequisite)
- AC10: regression — R117 + R118-R124 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| `virtualizer.getHunkRanges()` may not exist as public method | Add public getter if needed |
| Badge click + collapse button click could conflict | Use e.stopPropagation() on badge click |
| Visual stacking: badge inside wrapper near collapse button | Insert via insertBefore with btn.nextSibling |

## Round Profile

- Feature: 1 (R117.1 per-hunk reconcile)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~50 (1 helper + 1 injector extension + 1 i18n key × 2 + 10 tests)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R125 tests GREEN
- 0 regressions in R117-R124 tests (94 prior tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓
- ≤8 total ✓ (1)