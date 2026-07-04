# R117 Brief — Reconcile mode overlay (#74)

## Goal

Ship the per-file reconcile overlay with green-resolved badge only. Visualizes which findings the agent addressed across rounds by overlaying a per-file count badge on each file card in the diff panel.

## Implementation Plan

### 1. i18n (src/ui/i18n.ts)

Add ~6 new STRINGS keys × 2 locales:

- `toolbar.reconcile`: "Reconcile" / "对账"
- `toolbar.reconcile.tooltip`: "Show per-file cross-round reconciliation status" / "..."
- `reconcile.badge.resolved`: "{count} resolved" / "{count} 个已解决"
- `reconcile.banner.hint`: "Reconcile mode: hover badges to see which findings the agent addressed" / "..."
- `reconcile.badge.none`: "(none in this file)" / "（本文件无）"
- `findbar.reconcile.off`: "Reconcile mode is off" / "对账模式未开启"

### 2. Client (src/ui/app.ts)

**State**:
```typescript
const state = {
  // ... existing
  reconcileMode: readStored("reconcile-mode", ["on", "off"], "off") === "on",
};
```

**Toggle button** (in diff toolbar):
```typescript
const reconcileToggle = document.createElement("button");
reconcileToggle.className = "btn btn-secondary";
reconcileToggle.id = "reconcile-toggle";
reconcileToggle.dataset.state = state.reconcileMode ? "on" : "off";
// Click → flip state.reconcileMode, persist, re-render diff panel
reconcileToggle.addEventListener("click", () => {
  state.reconcileMode = !state.reconcileMode;
  reconcileToggle.dataset.state = state.reconcileMode ? "on" : "off";
  localStorage.setItem("reconcile-mode", state.reconcileMode ? "on" : "off");
  renderDiffPanel();
});
```

**Per-file reconcile badge injection** (inside `renderDiffPanel`):
- After each `.card[data-file]` is rendered, query its `data-file`
- Count findings in `state.existing` + `state.fresh` where:
  - `finding.file === file.path` AND
  - `finding.status === "resolved"` AND
  - `finding.resolution_kind` is user-set (not auto-stale — i.e. NOT `"content_match"` from auto-resolve)
- Inject badge: `<span class="reconcile-badge reconcile-badge--resolved">N resolved</span>`
- Click handler: `flashLine(file.path, finding.start_line, finding.end_line); state.findingFocus = finding.id;`

### 3. CSS hook

A minimal class (reconcile-badge + reconcile-badge--resolved) added to review.html or inline. Keep palette-aligned (green for resolved matches user's mental model).

### 4. Tests

New file: `src/r117-reconcile-overlay.test.ts`

10 structural tests covering:
- AC1: Toolbar has #reconcile-toggle button
- AC2: i18n has all 6 new keys (en + zh-CN)
- AC3: state.reconcileMode defaults from localStorage
- AC4: Click handler flips state
- AC5: renderDiffPanel injects .reconcile-badge--resolved per file
- AC6: Click badge triggers flashLine + scroll
- AC7: Toggle off → no badge injection
- AC8: localStorage persists between renders
- AC9: Badge text interpolates {count} correctly
- AC10: When 0 resolved findings in file, badge shows "(none)" or hidden

## Round Profile

- Feature: 1 (per-file green-resolved reconcile badge)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0

## Risk

- Hunk-vs-file granularity: file-level is coarser than hunk-level but avoids
  per-hunk DOM-query overhead. R117.x will refine if user feedback shows
  file-level is too coarse.
- Performance: O(F * K) per re-render where F = files, K = findings. Linear +
  filters; acceptable for typical review sizes (~50 files × 200 findings).

## v6 Compliance

- Hard caps: 1 feature ≤3 ✓, 0 bugfix ≤5 ✓, 0 polish ≤1 ✓, 1 total ≤8 ✓
- 0 subagents (lead-direct per v6 spec)
- 0 open-loop-internal at retro (must close in current worktree)
