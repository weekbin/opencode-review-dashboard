# R128 Research — Focus trap on reconcile-listing popup

## Files involved

- `src/ui/app.ts` — modify `showReconcileListing` (L6850) to call `installModalA11y`
- `src/r128-listing-focus-trap.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**`installModalA11y(dialog, onClose)`** (modal-a11y.ts:53):
- Returns `() => void` dispose function
- Sets `role="dialog"` if missing (defensive)
- Sets `aria-modal="true"` if missing (defensive)
- Records `document.activeElement` for restore-on-close
- Focuses first focusable child inside dialog on next animation frame
- Listens for Escape → calls onClose (with preventDefault + stopPropagation)
- Listens for Tab → focus trap (cycles within dialog)

**Existing calls** (8+ in app.ts, e.g., L1286, L1885, L2437, L2492, L2545, L2635, L4368):
- All wrap modals with `installModalA11y(dialog, close)`

## Simplest change (R128 fact sheet)

In `showReconcileListing` (after listing is appended to body):

```typescript
const disposeA11y = installModalA11y(listing, () => {
  listing.remove();
  document.removeEventListener("click", dismiss);
  document.removeEventListener("keydown", handleKey);
  disposeA11y();
});
```

R128 does NOT remove the R127 inline handleKey (since it's still functional and the duplicate-Escape is idempotent). Future round could clean up.

## Risk assessment

- **Low**: installModalA11y is mature + already used 8+ times in app
- **Low**: disposeA11y pattern is standard
- **Low**: focus trap is pure addition (doesn't change existing behavior)
- **Medium**: R127 inline Escape + installModalA11y Escape both fire on Escape press. Idempotent — second removal is no-op. But cosmetic: 2 handlers for same event.
- **Low**: Pre-existing R123 listener leak (old listing's listeners not cleaned up on new listing create) — out of scope for R128

## Test convention

Structural regex per project standard. 10 tests, 10 ACs.

## v6 compliance

- 0 features ≤3 ✓
- 0 bugfix ≤5 ✓
- 1 polish ≤1 ✓
- 1 total ≤8 ✓