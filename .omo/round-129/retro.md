# R129 Retro — Fix reconcile-listing listener leak (R127 Oracle flag)

## What Shipped

Issue: R127 Oracle review flagged a pre-existing listener leak from R123: `if (existing) existing.remove()` removes the DOM element but does NOT clean up the old listing's keydown/click listeners. R129 closes the leak.

User-facing delivery (pure bugfix):
- **No more listener leak**: when a new reconcile-listing popup opens, the old popup's `dismiss` (click), `handleKey` (keydown), and `installModalA11y` (window keydown) listeners are properly removed before the DOM is detached
- Module-scope `currentReconcileListing` tracks the currently-open listing for cleanup
- All 3 close paths (onClose callback, dismiss click, handleKey Escape) clear the tracking reference to null

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| Module-scope `currentReconcileListing` variable | ✓ L6850 |
| Cleanup guard at start of showReconcileListing | ✓ L6858-6865 |
| Old element removed before new one | ✓ L6859 |
| Old dismiss click listener removed | ✓ L6860 |
| Old handleKey keydown listener removed | ✓ L6861 |
| Old disposeA11y called | ✓ L6862 |
| currentReconcileListing = null after cleanup | ✓ L6863 |
| currentReconcileListing set to new value at end | ✓ L6922 |
| Regression R117-R128 | ✓ 115 prior tests still pass |
| currentReconcileListing cleared on all 3 close paths | ✓ 3 close paths (L6903, L6911, L6919) |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec.
- Implementation: ~20 LOC in app.ts (1 module-scope let + 5 cleanup calls + 1 null assignment + 3 close-path null assignments + 1 final assignment).
- 0 mid-implementation stumbles — single green test pass after module-scope var + close-path assignments.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R129 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R127 Oracle flag: pre-existing listener leak inherited from R123 (7 rounds stale): SHIPPED this round.
- proposals.jsonl: dedup R124 (2→1) and R125 (2→1) — housekeeping side benefit. 199 → 197 lines.

## Open Loop-Internal at Retro Time

EMPTY.

## Self-Improvement Observations

- **Module-scope `currentReconcileListing` is the right pattern for tracking state across function invocations**: when showReconcileListing is called while a previous listing is still open, we need to access the old listing's cleanup references. Module-scope var is the natural place (no need to plumb through state object).
- **Symmetric cleanup invariant**: all 4 close paths (onClose, dismiss click, handleKey Escape, "new listing replaces old") clear `currentReconcileListing = null`. Single invariant → no leak paths.
- **proposals.jsonl housekeeping**: Oracle flagged duplicates 3 times across R124/R127 rounds. R129 ships the dedup as a side benefit. Format: dedup uses "keep first occurrence per round" — preserves audit history for rounds with multiple candidates (R21-R30 had 9 entries each, kept intact for historical record).

## Risks Surfaced (no action this round)

- **Approve path doesn't lock worktree (R116)**: still deferred (semantic, no clear spec)
- **No CSS for dark mode variants**: not addressed
- **Other R123-era listener leaks**: pattern established in R129; future rounds should audit similar module-level event listener registrations

## v6 Compliance

- Hard caps: 0 feature (≤3) + 1 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 0
- Bugfix: 1 (R127 Oracle-flagged listener leak)
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~5 minutes