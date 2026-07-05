# R127 Discovery — Escape-key dismissal for reconcile-listing popup (R123 retro flag)

## Backlog Scan

**Still-deferred items (8+ rounds each):**
- R116 worktree lock (semantic, no clear spec)
- **R123 retro flag: Escape-key dismissal on reconcile-listing popup (PICKED)**
- Dark mode CSS variants (R126 retro flag)

R123 retro + R126 retro both flagged missing Escape key. 4 rounds deferred.

## Decision

Pick **Escape-key dismissal for reconcile-listing popup** as R127's single polish-class fix:

**Scope**: Add a `keydown` listener on `document` for the lifetime of the listing. Escape key removes listing + both listeners.

**Infrastructure already exists**:
- `showReconcileListing` (app.ts:6850) already creates listing + sets up click-outside dismiss
- `installModalA11y` (modal-a11y.ts) already exists for full modal a11y — but R127 picks inline Escape (lighter weight, no focus trap)

## Why R127

- Pure polish — a11y gap, no schema, no logic
- Small scope (~10 LOC) — quick ship
- Closes a 4-round-old retro flag from R123
- Closes 1 of 2 remaining a11y gaps on reconcile UI (the other is focus trap, harder)

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R123 retro flag: Escape dismissal)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~10 (1 keydown handler + 1 listener cleanup)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)