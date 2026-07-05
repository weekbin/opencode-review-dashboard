# R127 Brief — Escape-key dismissal for reconcile-listing popup (R123 retro flag)

## Goal

Add Escape-key dismissal to the reconcile-listing popup (R123) so keyboard users can close it with the standard Escape key. Currently only click-outside dismisses (R123 shipped that, missing Escape).

## Why

R123 retro + R126 retro both flagged "No Escape-key dismissal on reconcile-listing popup" as an a11y gap. R123 set `role="dialog"` but never installed a keydown listener. R124 retro + R125 retro + R126 retro all noted it as still-deferred.

User-facing improvement: keyboard user opens listing (by tabbing to a badge), presses Escape → listing closes. Matches every other dialog in the app (`installModalA11y` helper from R19 #38 already handles this for other modals).

## Scope

### 1. `src/ui/app.ts` — extend `showReconcileListing` (L6850-6889)

Add a `keydown` listener on `document` for the lifetime of the listing:
- If `event.key === "Escape"`: remove listing + remove both listeners
- Add alongside the existing `dismiss` click listener
- Same lifecycle: `setTimeout(0)` to avoid firing on the same Escape that opened the popup (if any)

```typescript
const handleKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    listing.remove();
    document.removeEventListener("keydown", handleKey);
    document.removeEventListener("click", dismiss);
  }
};
setTimeout(() => document.addEventListener("keydown", handleKey), 0);
```

### 2. No i18n changes
### 3. No CSS changes

## Tests (src/r127-listing-escape.test.ts — NEW)

10 structural regex tests:
- AC1: `showReconcileListing` has `keydown` listener setup
- AC2: keydown handler checks for `Escape` key
- AC3: keydown handler removes listing
- AC4: keydown handler removes keydown listener (cleanup)
- AC5: keydown listener uses `setTimeout(0)` to avoid firing immediately
- AC6: existing click-outside dismiss preserved (regression for R123)
- AC7: listing cleanup removes both keydown + click listeners
- AC8: `role="dialog"` preserved on listing element
- AC9: `installModalA11y` import NOT required (we handle Escape inline for simplicity)
- AC10: regression — R117 + R118-R126 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| Escape fired on the same click that opened listing | setTimeout(0) defers listener registration past current event loop |
| Other Escape handlers in app conflict | Only fires when listing is open; cleanup removes listener on close |
| Focus trap not implemented | Out of scope (R123 already flagged this separately) |

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R123 retro flag: Escape-key dismissal)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~10 (1 keydown handler + 1 listener cleanup)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R127 tests GREEN
- 0 regressions in R117-R126 tests (105 prior tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)