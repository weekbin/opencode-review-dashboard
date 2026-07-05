# R129 Research — Listener leak fix + proposals.jsonl dedup

## Files involved

- `src/ui/app.ts` — add 3 module-scoped vars to track previous listing handlers + dispose
- `.omo/proposals.jsonl` — deduplicate R124 (2→1), R127 (2→1)
- `src/r129-listener-leak.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**Listener leak source** (app.ts:6851):
```typescript
const existing = document.querySelector(".reconcile-listing");
if (existing) existing.remove();
```

**Leak mechanism**:
- Old listing's `dismiss` and `handleKey` listeners are registered on `document`
- Old listing's `installModalA11y` registers window keydown listener
- When new listing comes in, `existing.remove()` only removes the DOM node
- The old listeners still fire on global events (no-op on removed node, but linger)

**Cleanup pattern** (existing close handlers):
```typescript
listing.remove();
document.removeEventListener("click", dismiss);
document.removeEventListener("keydown", handleKey);
disposeA11y();
```

## Simplest change

1. Add 3 module-scoped vars BEFORE `showReconcileListing` function definition
2. In `showReconcileListing`:
   - When `existing` found: call its tracked cleanup vars before `existing.remove()`
   - Always store current run's `disposeA11y`, `dismiss`, `handleKey` in module-scoped vars at end
3. Run dedup script on `.omo/proposals.jsonl`

## Risk assessment

- **Low**: Module-scoped vars pattern is standard
- **Low**: disposeA11y idempotent (safe to call multiple times)
- **Medium**: proposals.jsonl edit must preserve JSONL format (one JSON object per line, trailing newline)

## Test convention

Structural regex per project standard. 10 tests, 10 ACs.

## v6 compliance

- 0 features ≤3 ✓
- 1 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓