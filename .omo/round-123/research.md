# R123 Research — Click-to-expand reconcile badge listing (R117.2)

## Files involved

- `src/ui/app.ts` — new `showReconcileListing` function + modify badge click handler at L6782-6789
- `src/ui/i18n.ts` — 1 new key × 2 locales (`reconcile.listing.heading`)
- `src/r123-reconcile-listing.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**renderReconcileOverlay (L5488-5537)**:
```typescript
const resolved = fileFindings.filter((f) => f.status === "resolved");
const open = fileFindings.filter((f) => f.status === "open");
const freshCount = fileFindings.filter(
  (f) => state.fresh.includes(f) && f.status !== "resolved",
).length;
```
Per-badge arrays already computed at render time. The full list of finding IDs is `resolved.map(f => f.id)`, `open.map(f => f.id)`, and `freshCount` doesn't need a list (it's a count only).

**Badge click handler (L6782-6789)**:
```typescript
const reconcileBadge = target.closest(".reconcile-badge[data-finding-id]");
if (reconcileBadge instanceof HTMLElement) {
  const findingId = reconcileBadge.getAttribute("data-finding-id");
  if (findingId) {
    event.stopPropagation();
    jumpToFindingById(findingId);
  }
}
```
Currently only fires if `data-finding-id` is set (which it is for resolved+open, not for fresh).

**jumpToFindingById (L6792-6800)**:
```typescript
function jumpToFindingById(id: string): void {
  const finding = [...state.existing, ...state.fresh].find((f) => f.id === id);
  if (!finding) return;
  state.activeTab = "conversation";
  renderConversationPane();
  requestAnimationFrame(() => {
    flashLine(finding.file, finding.start_line, finding.end_line);
  });
}
```
Pure side-effect-free jump-to-finding function. Safe to call from any click handler.

**Modal pattern (L2410-2437)**:
```typescript
const overlay = document.createElement("div");
overlay.className = "modal-overlay";
const dialog = document.createElement("div");
dialog.className = "modal-dialog";
dialog.setAttribute("role", "dialog");
installModalA11y(dialog, () => closeWith(null));
```
Established modal pattern with a11y. Can reuse for popup listing.

## Simplest change (R123 fact sheet)

1. Add `showReconcileListing(badge, findings)` function that:
   - Creates `<div class="reconcile-listing">` positioned via `getBoundingClientRect()`
   - Renders one `<button data-finding-id="...">` per finding
   - Each button: `{file}:{line} — {category} — {severity} — first 60 chars comment`
   - Click button → `jumpToFindingById(findingId)` + dismiss
   - Click outside → dismiss
   - Dismiss: `removeChild(listing)`
   - Title at top: "Findings in this file" / "本文件中的审查项"

2. Modify L6782 click handler:
   - Keep existing path for badges with 1 finding (or "fresh" data-finding-id)
   - Add new path for badges with ≥2 findings → showReconcileListing
   - Need to associate badge with full findings array — store in dataset OR re-derive from card path

3. Add 1 i18n key × 2 locales

4. Write 10 tests

## Risk assessment

- **Low**: renderReconcileOverlay already gives us badge + finding relationship
- **Low**: click delegation pattern is established (uses closest + stopPropagation)
- **Low**: dismiss pattern is established (removeChild + document listener cleanup)
- **Medium**: storing full findings array on badge requires careful serialization OR re-derivation
  - Mitigation: store badge color/category (already known), re-derive findings from state.fresh/state.existing + filter by filePath

## Test convention

Structural regex per project standard. 10 tests, 10 ACs.

## v6 compliance

- 1 feature ≤3 ✓
- 0 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓