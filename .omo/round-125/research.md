# R125 Research — Per-hunk reconcile badges (R117.1)

## Files involved

- `src/ui/app.ts` — new `findingsInHunk` helper + extend `injectHunkCollapseButtons`
- `src/ui/i18n.ts` — 1 new key × 2 locales (`reconcile.hunk.badge`)
- `src/r125-per-hunk-reconcile.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**`injectHunkCollapseButtons` (app.ts:5473)**:
- Already walks `[data-hunk]` wrappers (line selector `mount.querySelectorAll<HTMLElement>("[data-hunk]")`)
- Renders a collapse button inside each wrapper
- Called from per-file view setup (e.g., L3048, L3114, L3179)

**`HunkRange` interface** (diff-virtualization.ts:15-19):
```typescript
export interface HunkRange {
  hunkIndex: number;
  startLine: number;
  endLine: number;
}
```

**`DiffVirtualizer.hunkRanges` Map** (diff-virtualization.ts:34):
- `private hunkRanges: Map<string, HunkRange[]> = new Map();`
- Set via `markHunkBoundaries(hunkRanges, filePath)` (line 49)
- May need a public getter added to class

**`Finding.start_line` / `Finding.end_line`** — line-range matching

**`state.reconcileMode`** (L1571):
- Boolean toggle from R117
- localStorage-persisted

**`jumpToFindingById(id)`** (app.ts:6792) — already exists

## Simplest change (R125 fact sheet)

1. **Add public getter** `getHunkRanges(filePath: string): HunkRange[]` on `DiffVirtualizer` class (if not already public)
2. **Add helper** `findingsInHunk(findings, hunkRange, filePath): Finding[]` (~10 LOC, pure filter)
3. **Extend injectHunkCollapseButtons** to render per-hunk reconcile badge:
   - After the collapse button is appended
   - If `state.reconcileMode` AND `findingsInHunk(...).length > 0`:
     - Create `<button class="reconcile-hunk-badge" data-hunk-index="N">`
     - Wire click → `jumpToFindingById`
     - Insert before `btn.nextSibling` (between collapse button and hunk content)
4. **i18n**: add `reconcile.hunk.badge` key × 2 locales
5. Write 10 tests

## Risk assessment

- **Low**: helper is pure filter (no side effects)
- **Low**: badge click reuses existing `jumpToFindingById`
- **Medium**: `getHunkRanges` may need to be exposed as public (requires editing diff-virtualization.ts)
- **Low**: i18n adds 1 key × 2 locales = 2 strings, parity check trivial

## Test convention

Structural regex per project standard. 10 tests, 10 ACs.

## v6 compliance

- 1 feature ≤3 ✓
- 0 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓