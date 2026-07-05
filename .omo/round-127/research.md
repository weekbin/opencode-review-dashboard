# R127 Research — Escape-key dismissal for reconcile-listing popup

## Files involved

- `src/ui/app.ts` — extend `showReconcileListing` (L6850-6889) with Escape handler
- `src/r127-listing-escape.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**`showReconcileListing` (L6850)**:
- Already creates listing with `role="dialog"`
- Already has click-outside dismiss via `setTimeout(0)` + `document.addEventListener("click", dismiss)`
- Pattern: create element → append to body → setTimeout(0) → addEventListener → cleanup on close

**`installModalA11y` (modal-a11y.ts)**:
- Pre-existing helper from R19 #38
- Handles Escape + focus trap + initial focus
- But: it expects a `dialog` element with proper structure (close button etc.)
- For R127, listing is simpler (just items, no close button)
- Decision: write inline Escape handler rather than call `installModalA11y` (lighter touch, no focus trap)

**Other Escape handlers in app**:
- L630 `window.addEventListener("keydown", ...)` handles in-diff search Escape
- Modal Escape handlers via `installModalA11y` close the dialog
- New R127 keydown handler is local to listing lifetime — minimal scope

## Simplest change (R127 fact sheet)

1. Add `handleKey` function inside `showReconcileListing` (closure over `listing`)
2. Add `setTimeout(() => document.addEventListener("keydown", handleKey), 0)` after the existing click listener setup
3. Inside `handleKey`: if Escape → remove listing + remove both listeners
4. Inside the existing `dismiss` click handler: also remove `handleKey` listener

## Risk assessment

- **Low**: Escape handler is identical to click dismiss pattern
- **Low**: setTimeout(0) prevents double-fire on same event loop
- **Low**: cleanup on close is symmetric (both listeners removed)
- **Low**: no new dependencies

## Test convention

Structural regex per project standard. 10 tests, 10 ACs.

## v6 compliance

- 0 features ≤3 ✓
- 0 bugfix ≤5 ✓
- 1 polish ≤1 ✓
- 1 total ≤8 ✓