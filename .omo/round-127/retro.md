# R127 Retro — Escape-key dismissal for reconcile-listing popup (R123 retro flag)

## What Shipped

Issue: R123 retro + R126 retro both flagged "No Escape-key dismissal on reconcile-listing popup" as a 4-round-old observation. R127 closes it.

User-facing delivery (pure a11y polish):
- **Escape key dismisses the reconcile-listing popup**: keyboard user can open listing (via tab) and dismiss with Escape, matching every other dialog in the app
- Click-outside dismiss preserved (R123 regression)
- Symmetric cleanup: both click and keydown listeners removed on close

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| showReconcileListing has keydown listener | ✓ L6897 |
| keydown handler checks "Escape" | ✓ L6890 |
| keydown handler removes listing | ✓ L6891 |
| keydown handler removes keydown listener (cleanup) | ✓ L6892 |
| setTimeout(0) prevents double-fire | ✓ L6895-6899 |
| Click-outside dismiss preserved (R123 regression) | ✓ L6883-6887 |
| dismiss handler also removes keydown listener | ✓ L6887 |
| role="dialog" preserved on listing element | ✓ R123 |
| installModalA11y not imported | ✓ inline handler, no installModalA11y call |
| Regression R117-R126 | ✓ 105 prior tests still pass |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for single-polish round.
- Implementation: ~10 LOC in app.ts (1 keydown handler + 1 listener cleanup).
- 1 mid-implementation stumble: test window size 2000 was too small — the keydown listener is at L6897 which is ~47 chars from function start, BUT the function itself is 50 lines long so 2000 chars is enough. Actually the issue was that the test code had an extra `});` from interrupted edits — fixed by rewriting test file from scratch.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R127 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R123 retro flag: Escape-key dismissal on reconcile-listing popup (4 rounds deferred): SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY. Only 1 remaining a11y gap on reconcile-listing: no focus trap (out of scope for inline handler — installModalA11y is the right tool but is heavier).

## Self-Improvement Observations

- **`handleKey` closure pattern**: defining the keydown handler inside `showReconcileListing` (closure over `listing`) makes cleanup trivial — `removeEventListener("keydown", handleKey)` with the same reference. No name strings, no leak risk.
- **Same listener-pair cleanup pattern**: both `dismiss` (click) and `handleKey` (keydown) must be removed together. By having each remove the other, the cleanup is automatic and safe regardless of which dismiss path is taken.

## Risks Surfaced (no action this round)

- **No focus trap on reconcile-listing popup**: still missing (R123 retro flag — heavier, requires installModalA11y or custom)
- **Approve path doesn't lock worktree (R116)**: still deferred
- **No CSS for dark mode variants**: not addressed

## v6 Compliance

- Hard caps: 0 feature (≤3) + 0 bugfix (≤5) + 1 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Polish: 1 (R123 retro flag: Escape dismissal)
- Total: 1
- Subagents: 0
- Time: ~10 minutes