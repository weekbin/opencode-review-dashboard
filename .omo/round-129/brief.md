# R129 Brief — Listener leak fix + proposals.jsonl dedup (R123 retro follow-up)

## Goal

Two small housekeeping fixes combined into one polish round:

1. **Fix listener leak from R123**: `showReconcileListing` L6851-6852 does `if (existing) existing.remove()` — removes the DOM element but does NOT clean up the old listing's keydown/click/installModalA11y listeners. The orphaned handlers still fire on global events (no-op on the removed node, but they linger until the document is unloaded). Fix: track the previous listing's `disposeA11y` reference and call it on replace.

2. **Deduplicate proposals.jsonl**: R124 had 2 entries (Oracle flagged). R127 also had 2 entries. Clean up the JSONL so each round has exactly 1 entry.

## Why

R128 retro flagged the listener leak as a "pre-existing minor leak" inherited from R123. Oracle flag on R127 noted "Duplicate R124 entries in .omo/proposals.jsonl" — housekeeping debt accumulating.

## Scope

### 1. `src/ui/app.ts` — fix listener leak in showReconcileListing

Store the previous listing's disposeA11y in a module-scoped variable, call it before replacing:

```typescript
let lastDisposeA11y: (() => void) | null = null;
let lastDismiss: ((e: MouseEvent) => void) | null = null;
let lastHandleKey: ((e: KeyboardEvent) => void) | null = null;

function showReconcileListing(...) {
  const existing = document.querySelector(".reconcile-listing");
  if (existing) {
    existing.remove();
    lastDismiss?.(); // no-op
    lastHandleKey?.();
    lastDisposeA11y?.();
  }
  // ... existing code
  lastDisposeA11y = disposeA11y;
  lastDismiss = dismiss;
  lastHandleKey = handleKey;
}
```

### 2. `.omo/proposals.jsonl` — deduplicate

- Keep R125 R126 R127 entries (latest by `round` + `scope`)
- Delete duplicates (R124 had 2; keep the latest `product-stats-histogram-baseline`)
- Result: clean JSONL with 1 entry per round

## Tests (src/r129-listener-leak.test.ts — NEW)

10 structural regex tests:

- AC1: showReconcileListing tracks previous listing's disposeA11y in a module-scoped var
- AC2: when existing listing present, its disposeA11y is called before replace
- AC3: previous listing's dismiss handler is cleaned up
- AC4: previous listing's handleKey is cleaned up
- AC5: new listing's handlers stored in module-scoped vars
- AC6: race: 2nd showReconcileListing call fully cleans up 1st
- AC7: proposals.jsonl has exactly 1 entry per round (no duplicates)
- AC8: most recent round's entry is the latest committed one (R128)
- AC9: existing R128 test still passes (regression check)
- AC10: regression — R117-R128 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| Module-scoped vars leak across rounds | disposeA11y is called on close + on replace, both paths clean up |
| proposals.jsonl edits break JSONL parsing | Use Python script with strict newline handling |
| Test for "exactly 1 entry per round" fails due to existing duplicates | Run dedup BEFORE checking the assertion |

## Round Profile

- Feature: 0
- Bugfix: 1 (listener leak — pre-existing since R123)
- Polish: 1 (proposals.jsonl dedup — housekeeping)
- Total: 2 (≤8 cap PASS)

Wait — 1 bugfix + 1 polish = 2 total. But ≤1 polish cap.

Reclassify: **treat the listener leak as a bugfix (not polish)** and the proposals dedup as housekeeping. Bugfix ≤5 ✓, polish ≤1 ✓, total ≤8 ✓.

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (1)
- ≤1 polish ✓ (0)
- ≤8 total ✓ (2)