# R125 Discovery — Per-hunk reconcile badges (R117.1)

## Backlog Scan

**Still-deferred items (7 rounds each):**
- **R117.1 per-hunk reconcile badges (PICKED)** — natural extension of R117 reconcile mode
- R117.3 hunk-level overlap count (subset of R117.1)
- R116 worktree lock (semantic-only, no clear spec)

## Decision

Pick **R117.1 per-hunk reconcile badges** as R125's single feature:

**Scope**: When reconcile mode is active, add a small badge inside each `[data-hunk]` wrapper showing how many findings land in that specific hunk's line range. Click → jump to first finding in that hunk.

**Infrastructure already exists**:
- `<div data-hunk="N">` attribute on each hunk wrapper (diff-virtualization.ts)
- `HunkRange = { hunkIndex, startLine, endLine }` (diff-virtualization.ts:15-19)
- `computeHunkRanges(hunks: Hunk[]): HunkRange[]` (diff-virtualization.ts:302)
- `Finding.start_line` / `Finding.end_line` for line-range matching
- R117 reconcile-mode state + `state.reconcileMode` toggle
- `injectHunkCollapseButtons(mount, filePath, virtualizer)` already walks `[data-hunk]` wrappers (app.ts:5473)

**Implementation plan**:
1. Add helper `findingsInHunk(findings, hunkRange, filePath): Finding[]` (~10 LOC, pure filter)
2. Extend `injectHunkCollapseButtons` to also render `<button class="reconcile-hunk-badge">` inside each `[data-hunk]` wrapper when:
   - `state.reconcileMode === true` (already checked at top of renderReconcileOverlay)
   - `findingsInHunk(...)` returns count > 0
3. Badge click handler: `e.stopPropagation()` + `jumpToFindingById(hunkFindings[0].id)`
4. New i18n key × 2 locales: `reconcile.hunk.badge` = "{count} in this hunk" / "本代码块内 {count} 项"
5. Test file: `src/r125-per-hunk-reconcile.test.ts` (10 structural regex tests)

## Why R125 ≠ alternatives

- **R117.3 overlap count**: subset of R117.1 (implicit if R117.1 ships)
- **R116 worktree lock**: semantic-only, no clear implementation
- **CSS for reconcile (R123 retro flag)**: pure polish but no behavior change

## Round Profile

- Feature: 1 (R117.1 per-hunk reconcile)
- Bugfix: 0
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~80 (1 helper + 1 injector extension + 1 i18n key × 2 + 10 tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓
- ≤8 total ✓ (1)