# R25 Plan — Diff virtualization toggle (feature) + Sidebar bulk delete (polish)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-25-diff-virt-toggle-and-sidebar-bulk-delete`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-25`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)
> **NEW v5.3.8 SG.R24.1**: Subagent MUST verify `pwd == worktree` AFTER every Write/Edit

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#52 Bulk delete in sidebar review progress (polish)** — multi-select checkbox + bulk "Mark as reviewed"
- **#51 Diff virtualization toggle in settings (feature)** — extends R22 settings modal + R23/R24 virtualization

## 2. Non-goals

- NO new dependencies (vanilla DOM + existing IntersectionObserver)
- NO schema changes (R20 #40 reviewed state preserved)
- NO mock-server changes
- NO existing settings modal rewrite (only ADD toggle)
- NO R23/R24 virtualization rewrite (only ADD toggle bypass)

## 3. AC trace (acceptance criteria, testable)

### Issue #52 — Bulk delete in sidebar review progress (6 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 12.1 | Per-file-card checkbox visible in sidebar | unit + DOM | `src/ui/app.ts` |
| 12.2 | Click checkbox → file marked selected | unit | `src/ui/app.test.ts` |
| 12.3 | ≥1 selected → "Mark as reviewed" button visible | unit + DOM | `src/ui/app.test.ts` |
| 12.4 | Click bulk → all selected files marked as reviewed | unit | `src/ui/app.test.ts` |
| 12.5 | R20 #40 progress count updates (X/Y reviewed) | unit | `src/ui/app.test.ts` |
| 12.6 | localStorage: 0 keys added (uses existing reviewed) | unit | `src/ui/app.test.ts` |

### Issue #51 — Diff virtualization toggle in settings (8 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 11.1 | "Diff virtualization" toggle visible in settings modal Appearance section | unit + DOM | `src/ui/app.ts` |
| 11.2 | Toggle defaults to ON | unit | `src/ui/app.test.ts` |
| 11.3 | Toggle ON → IntersectionObserver virtualization works (R23 #47 preserved) | regression | `src/ui/diff-virtualization.test.ts` |
| 11.4 | Toggle OFF → all hunks render eagerly (no IntersectionObserver) | unit | `src/ui/diff-virtualization.test.ts` |
| 11.5 | Toggle state persists in localStorage `diff-review:virtualization` | unit | `src/ui/app.test.ts` |
| 11.6 | R24 #49 per-hunk collapse still works regardless of toggle | regression | `src/ui/diff-virtualization.test.ts` |
| 11.7 | i18n: 2 new keys (settings.virtualization.label + description) | unit | `src/ui/i18n.test.ts` |
| 11.8 | Settings modal a11y preserved (R22 #44 installModalA11y) | unit | `src/ui/app.test.ts` |

**Total ACs**: 14 (6 + 8)

## 4. Files

### Issue #52 (atomic commit 1)
- `src/ui/app.ts` (modify renderFilesPane + add bulk button + checkbox)
- `src/ui/i18n.ts` (2 STRINGS keys: sidebar.bulkDelete + sidebar.selected)
- `src/ui/app.test.ts` OR new file (UI tests)
- 2-3 file touches, ~40 LOC

### Issue #51 (atomic commit 2)
- `src/ui/diff-virtualization.ts` (modify constructor to accept virtualization flag)
- `src/ui/app.ts` (wire settings toggle + pass flag to DiffVirtualizer)
- `src/ui/i18n.ts` (2 STRINGS keys: settings.virtualization.label + description)
- `src/ui/diff-virtualization.test.ts` (new tests for toggle behavior)
- `src/ui/app.test.ts` (settings modal tests)
- 3-4 file touches, ~120 LOC

## 5. Strategy & approach

### #52 — Bulk delete in sidebar pattern (reuse R23 #48)

**Pattern A (preferred): Add checkbox + bulk button to renderFilesPane**
```typescript
function renderFilesPane() {
  // Existing render code...
  for each file:
    item.innerHTML = `
      <input type="checkbox" class="sidebar-file-checkbox" data-path="${file.path}">
      <span class="sidebar-file-name">${file.name}</span>
      <span class="sidebar-file-status">${file.status}</span>
    `;
  
  // New bulk action toolbar (shown when ≥1 selected)
  if (state.selectedFiles.size > 0) {
    bulkToolbar.innerHTML = `
      <button class="sidebar-bulk-delete">Mark as reviewed (${state.selectedFiles.size})</button>
    `;
  }
}
```

**Pattern B: Bulk action handler**
- Click "Mark as reviewed (N)" → add all `selectedFiles` to `state.read` Set
- Trigger R20 #40 progress count update
- Clear selection

### #51 — Diff virtualization toggle pattern

**Pattern A: Add setting to localStorage + DiffVirtualizer constructor**
```typescript
// In app.ts
const DIFF_VIRTUALIZATION_KEY = "diff-review:virtualization";
function isVirtualizationEnabled(): boolean {
  return localStorage.getItem(DIFF_VIRTUALIZATION_KEY) !== "false"; // default ON
}

// In settings modal (extends R22 #44)
const virtualizationToggle = document.querySelector("#settings-virtualization-toggle");
virtualizationToggle.checked = isVirtualizationEnabled();
virtualizationToggle.addEventListener("change", () => {
  localStorage.setItem(DIFF_VIRTUALIZATION_KEY, String(virtualizationToggle.checked));
  // Trigger re-render
});

// In DiffVirtualizer constructor
class DiffVirtualizer {
  constructor(mount: HTMLElement, private enabled: boolean = true) {
    if (enabled) {
      this.setupIntersectionObserver();
    }
  }
}

// In createView
const virtualizer = new DiffVirtualizer(mount, isVirtualizationEnabled());
```

### STRINGS table additions

**Issue #52** (sidebar bulk delete):
- `sidebar.bulkDelete` (en: "Mark selected as reviewed", zh-CN: "标记已审查")
- `sidebar.selected` (en: "Selected", zh-CN: "已选")

**Issue #51** (diff virtualization toggle):
- `settings.virtualization.label` (en: "Diff virtualization", zh-CN: "Diff 虚拟化")
- `settings.virtualization.description` (en: "Render only visible hunks for faster scrolling", zh-CN: "仅渲染可见 hunk，加快滚动速度")

## 6. STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3 + SG.R22.1)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `sidebar.bulkDelete` | "Mark selected as reviewed" | "标记已审查" | Bulk delete button |
| `sidebar.selected` | "Selected" | "已选" | Selected count badge |
| `settings.virtualization.label` | "Diff virtualization" | "Diff 虚拟化" | Toggle label |
| `settings.virtualization.description` | "Render only visible hunks for faster scrolling" | "仅渲染可见 hunk，加快滚动速度" | Toggle description |

**Total**: 4 keys × 2 locales = 8 STRINGS entries. All required.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #51 — break R23 #47 + R24 #49 virtualization | AC 11.3 + 11.6 regression tests |
| #51 — settings modal a11y broken | AC 11.8 regression on R22 installModalA11y |
| #51 — toggle bypass bug | AC 11.4 explicit test for OFF behavior |
| #52 — bulk action conflicts with R20 #40 individual click | AC 12.5 regression test on progress count |
| #52 — checkbox state lost on re-render | Module-level Set (like R23 #48) |
| both — out of worktree dir | SG.R19.4 sanity check + SG.R24.1 per-Edit verify |
| both — missing node_modules in worktree | SG.R22.2 symlink from main |
| both — subagent writes to main dir | SG.R24.1 per-Edit `pwd` verification |
| both — malformed commit message | Use heredoc `git commit -F- <<EOF` |
| both — bilingual lockstep silent failure | SG.R22.1 pre-commit `grep -c` verify |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 14 ACs total: 6 PASS for #52 + 8 PASS for #51 = 14/14
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright: all PASS
- i18n regression-guard test passes with 4 new keys (was 27, target 31)
- Full suite: 555 + ~8 = ~563 pass / 0 fail
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates + SG.R22.1 bilingual lockstep verify
- GH issues #51 + #52 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R26+)

- Per-finding "delete from history" (R23 retro)
- tsc PATH investigation (R22 carryover)

## 10. References

- brief.md: `.omo/round-25/brief.md`
- R22 settings modal: `src/ui/app.ts` (L1645 `settings-modal`)
- R23 DiffVirtualizer: `src/ui/diff-virtualization.ts`
- R24 #49 per-hunk collapse: extends DiffVirtualizer with collapse state
- R20 #40 sidebar review progress: `src/ui/app.ts` (renderFilesPane at L3142)
- v5.3.8 SKILL.md: SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1 all embedded
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol