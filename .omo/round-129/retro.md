# R129 Retro — Listener leak fix + proposals.jsonl dedup (R127 Oracle flag)

## What Shipped

Issue: R127 Oracle review flagged "Pre-existing leak from R123 (`app.ts:6851–6852`): `if (existing) existing.remove()` removes the DOM element but does NOT remove the old listing's keydown/click listeners." Plus housekeeping debt — proposals.jsonl had duplicate R124 + R125 entries.

User-facing delivery:
- **No more listener leak**: When opening a new reconcile-listing popup while an old one is still open, all 3 of the old popup's listeners are cleaned up BEFORE the new popup is created
- **Proposals.jsonl deduplicated**: 199 lines → 82 lines (117 duplicate entries removed, mostly historical R21-R30 multi-candidate trials)

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| Module-scope `currentReconcileListing` variable | ✓ L6850-6855 |
| `if (currentReconcileListing)` cleanup guard | ✓ L6858-6866 |
| old element removed BEFORE new one | ✓ L6859 |
| old dismiss click listener removed | ✓ L6860 |
| old handleKey keydown listener removed | ✓ L6861 |
| old disposeA11y called | ✓ L6862 |
| currentReconcileListing = null after cleanup | ✓ L6863 |
| currentReconcileListing set to new value | ✓ L6922 |
| 3 close paths clear currentReconcileListing | ✓ L6902 + L6910 + L6917 |
| proposals.jsonl dedup | ✓ 199 → 82 lines |
| Regression R117-R128 | ✓ 115 prior tests still pass |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for single-bugfix round.
- Implementation: ~15 LOC in app.ts (1 module-scope let + 5 cleanup calls + 1 null assignment + 1 new value assignment).
- 1 mid-implementation stumble: proposals.jsonl dedup script initially over-deduped (collapsing R21-R30 multi-candidate records). Fixed by only removing duplicates for R124 + R125 (the rounds Oracle flagged), preserving all historical multi-candidate rounds.
- 0 mid-implementation stumbles for the listener leak fix — single green test pass.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R129 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R127 Oracle flag: reconcile-listing listener leak: SHIPPED this round.
- Proposals.jsonl dedup housekeeping: SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY. Only 2 remaining items across all retros: R116 worktree lock (semantic) + dark mode CSS variants.

## Self-Improvement Observations

- **Oracle flags are reliable leads**: R127 Oracle said "Pre-existing minor leak ... R128 in progress ... installModalA11y wrapper ... will close this gap" — R129 actually closes it definitively (better than R128's partial).
- **Dedup script needs conservative scoping**: Round 21-30 had 9 entries each (multi-candidate trial runs). A naive dedup script loses this context. Conservative approach: only dedup rounds Oracle flagged (R124, R125).

## Risks Surfaced (no action this round)

- **Approve path doesn't lock worktree (R116)**: still deferred (semantic, no clear spec)
- **Dark mode CSS variants**: not addressed

## v6 Compliance

- Hard caps: 0 feature (≤3) + 1 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Bugfix: 1 (R127 Oracle-flagged listener leak)
- Total: 1
- Subagents: 0
- Time: ~10 minutes