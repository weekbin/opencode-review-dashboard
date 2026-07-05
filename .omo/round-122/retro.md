# R122 Retro — updateSubmitButtons reactive bugfix (R116.1)

## What Shipped

Issue: R116 retro flagged R116.1 (updateSubmitButtons not wired into renderFindings / state changes) as a bug "Will close in current worktree before SHIP" but didn't. R116.1 hotfix landed only the dual-button #83 fix. R122 closes the original R116.1 bugfix that was deferred 5 rounds.

User-visible delivery:
- Approve Changes button now updates its enable/disable state reactively after any state change
- Before: resolve 5 findings → button stays disabled until reload / add another finding / submit attempt
- After: resolve 5 findings → button auto-enables when all findings resolved + notes non-empty
- Wired into: resolveFinding, reopenFinding, addFinding flow, notes input listener

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| updateSubmitButtons called from ≥5 places | ✓ 6 total (existing L6215 + L6498 + L6506 + new L5796 + L5828 + L6640 + L6713) |
| Called after resolveFinding | ✓ L5796 |
| Called after reopenFinding | ✓ L5828 |
| Called in addFinding flow | ✓ via L6640/L6713 in handler chain |
| Called after state.notes mutation | ✓ both notesArea input handlers |
| Function updateSubmitButtons preserved | ✓ L1518 untouched |
| Disabled assignment preserved | ✓ |
| Gate condition preserved | ✓ |
| Pre-existing L6496/L6504 dual-button preserved | ✓ R116.1 hotfix intact |
| Regression — R118-R121 still pass | ✓ 64 prior tests still green |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for bugfix.
- Implementation: ~4 LOC added (1 call in resolveFinding, 1 in reopenFinding, 2 in notes listeners).
- 1 mid-implementation stumble: AC5 test window didn't reach first `state.notes = ` site (L6637) because the second `notesArea.addEventListener("input"...)` site at L6710 was closer. Fixed by editing both occurrences.
- 1 mid-implementation stumble: AC2 + AC3 test windows were 1500 chars but resolveFinding/reopenFinding bodies are ~3600 chars. Bumped to 4500.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R122 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R116.1 updateSubmitButtons reactive (R116-retro bug, deferred 5 rounds): SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY.

## Self-Improvement Observations

- **Test windows must scale with function length**: AC2/AC3 originally used 1500-char windows based on resolveFinding being a ~600-char function in some earlier round. Now the body is ~3600 chars (URL handling grew). Lesson: when extending existing tested functions, audit ALL anchor windows in dependent tests.
- **Multiple identical edits need exact context**: notesArea.addEventListener pattern exists at 2 sites with identical bodies. First edit failed (multiple matches). Required including `notesArea.value = state.notes ?? "";` line to disambiguate.
- **5 rounds deferred = stale-bundle risk**: per R12 retro rule, items deferred 5+ rounds get auto-promoted to top of next-feature-pick round. R122 honored that for R116.1.

## Risks Surfaced (no action this round)

- **Histogram bar baseline is min not zero (R119)**: still deferred
- **Per-hunk reconcile (R117.1)**: still deferred
- **Approve path doesn't lock the worktree (R116)**: still deferred (probably should be a separate GH issue if user wants it)

## v6 Compliance

- Hard caps: 0 feature (≤3) + 1 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 0
- Bugfix: 1 (R116.1 updateSubmitButtons reactive)
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~15 minutes