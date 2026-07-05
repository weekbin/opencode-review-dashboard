# R128 Brief — Focus trap on reconcile-listing popup (R123 retro flag)

## Goal

Use the existing `installModalA11y` helper from `src/ui/modal-a11y.ts` to add focus trap + initial focus + restore focus on the reconcile-listing popup. Closes last remaining R123 retro flag.

## Why

R123 retro + R127 retro flagged "No focus trap on reconcile-listing popup" as an a11y gap. R123 used `role="dialog"` + click-outside dismiss but never installed a11y. R127 added Escape but R127's brief explicitly noted "out of scope for inline handler — installModalA11y is the right tool but is heavier". R128 ships the heavier fix.

`installModalA11y` already exists (R19 #38), used 10+ times in the app for other modals. Listing just needs to call it.

## Scope

### 1. `src/ui/app.ts` — call `installModalA11y` in `showReconcileListing`

```typescript
const disposeA11y = installModalA11y(listing, () => {
  listing.remove();
  document.removeEventListener("click", dismiss);
  document.removeEventListener("keydown", handleKey);
});

// Also call disposeA11y in the existing dismiss + handleKey handlers
```

But: `installModalA11y` already handles Escape. So R128 can simplify by removing the R127 inline `handleKey` and using `installModalA11y`'s Escape handler.

### Simplification (if R128 happens AFTER R127 in same branch):
- Remove inline `handleKey` (R127)
- Replace with `installModalA11y(listing, () => { listing.remove(); ... })`
- This gives Escape + focus trap + initial focus + restore focus

### 2. No i18n changes
### 3. No CSS changes

## Tests (src/r128-listing-focus-trap.test.ts — NEW)

10 structural regex tests:
- AC1: `installModalA11y` is imported in app.ts
- AC2: `installModalA11y(` called inside `showReconcileListing`
- AC3: disposeA11y stored in a variable (not ignored)
- AC4: disposeA11y called on listing close (in dismiss OR onClose callback)
- AC5: Escape handler in installModalA11y (not the R127 inline one)
- AC6: Tab key handling (focus trap)
- AC7: existing R127 inline handleKey may or may not remain — but if it does, the listing has duplicate Escape handlers (acceptable)
- AC8: role="dialog" preserved (R123 regression)
- AC9: aria-modal="true" set on listing (installModalA11y adds this)
- AC10: regression — R117 + R118-R127 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| R127 inline Escape + installModalA11y Escape both fire | Two Escape handlers calling listing.remove() twice is idempotent — second call no-ops on already-removed element |
| Focus trap interferes with R123 click-outside dismiss | Click-outside fires only on mouse, focus trap fires only on Tab — no conflict |
| installModalA11y adds aria-modal="true" — duplicates existing role="dialog" | Helper handles this defensively (re-asserts only if missing) |

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R123 retro flag: focus trap)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~5 (add installModalA11y call + dispose)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R128 tests GREEN
- 0 regressions in R117-R127 tests (105 prior tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)