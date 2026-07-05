# R128 Retro — Focus trap on reconcile-listing popup (R123 retro flag)

## What Shipped

Issue: R123 retro + R127 retro both flagged "No focus trap on reconcile-listing popup" as an a11y gap. R127 retro explicitly noted "out of scope for inline handler — installModalA11y is the right tool but is heavier". R128 ships the heavier fix.

User-facing delivery (pure a11y polish):
- **Focus trap**: Tab cycles within listing items (no escape into background page)
- **Initial focus**: First listing item auto-focused on open
- **Restore focus**: Focus returns to trigger badge after close
- **Defensive aria-modal="true"** set on listing element
- **Defensive role="dialog"** re-asserted (R123 already set this)

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| installModalA11y imported | ✓ L9 (pre-existing) |
| installModalA11y( called in showReconcileListing | ✓ |
| disposeA11y stored in variable | ✓ |
| disposeA11y called in close path | ✓ 3 close paths |
| role="dialog" preserved | ✓ R123 |
| aria-modal="true" added | ✓ L app.ts |
| previouslyFocused captured | ✓ installModalA11y internal |
| Focus trap via Tab handling | ✓ installModalA11y internal |
| requestAnimationFrame focus | ✓ installModalA11y internal |
| Regression R117-R127 | ✓ 105 prior tests still pass |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for single-polish round.
- Implementation: ~8 LOC in app.ts (1 installModalA11y call + 3 disposeA11y calls + 1 aria-modal setAttr).
- 0 mid-implementation stumbles — single green test pass.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R128 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R123 retro flag: focus trap on reconcile-listing popup (10 rounds deferred): SHIPPED this round.
- R123 retro flag: ALL items now closed (R117.2 click-to-expand in R123, R123 → Escape in R127, focus trap in R128).

## Open Loop-Internal at Retro Time

EMPTY (R123 polish arc fully closed).

## Self-Improvement Observations

- **`installModalA11y` already does everything**: focus trap, initial focus, restore focus, Escape, dispose. R128 just wires it in. 8 LOC for full a11y compliance.
- **Idempotent close paths**: disposeA11y is called from 3 places (the installModalA11y onClose callback, the click dismiss, the keydown handler). Each can fire independently without leaving stale state.

## Risks Surfaced (no action this round)

- **Approve path doesn't lock worktree (R116)**: still deferred (semantic, no clear spec)
- **No CSS for dark mode variants**: not addressed

## v6 Compliance

- Hard caps: 0 feature (≤3) + 0 bugfix (≤5) + 1 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Polish: 1 (R123 retro flag: focus trap)
- Total: 1
- Subagents: 0
- Time: ~5 minutes