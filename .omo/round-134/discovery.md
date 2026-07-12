# R134 Discovery

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R133 retro carry-over**: none (R133 closed everything)
- **proposals.jsonl**: last entry is **R131** (R132 + R133 entries were never appended — v6 procedure gap, will fix in R134 retro)
- **Code TODO/FIXME scan**: 1 file (`src/ui/search-history.test.ts`) — all matches are string literals in test names, not actual TODOs in source

## Surfaced candidates (from codebase)

### C1 — Relative timestamp on persistent lock banner (R132 retro risk surfaced)

**Evidence**:
- `src/index.ts:196` and `src/ui/app.ts:174`: `state.locked = { at: number; round: number; by: "user" }`. The `at` field is a millisecond timestamp.
- R132 added the persistent banner in `app.ts:renderStatsPane` that reads `state.locked` and shows `view.stats.locked.detail` ("Locked after round {round}; no further changes can be made."). The `at` timestamp is **never used** — only the round number.
- R132 retro explicitly flagged: "state.locked.at is currently only used for explanatory text-free routing; a future round could add a relative timestamp ('locked 3h ago') without changing the contract. Scheduled as R132.1 if surfaced by user feedback."

**Why**: User-visible UX improvement with zero behavior change, zero new endpoint, zero new schema. Closes the explicit R132 retro risk-surface. ~30-50 LOC, ≤3 src files.

**Profile**: polish (UX-only improvement).

### C2 — Add `data-i18n-placeholder` to attribute translator (R133 retro risk surfaced)

**Evidence**:
- R133 retro "Risks Surfaced" said: "data-i18n-placeholder and similar attributes are not yet wired. Surface scan: zero matches in `review.html`, so this is preventive, not present."
- No current surface to fix. Pure preventive.

**Decision**: Skip — preventive only, no current user impact. Fails the user-visible test.

### C3 — Persistent banner "jump to locked round" link

**Evidence**:
- R132 retro "Risks Surfaced" mentioned: "The persistent banner does not link to the round that locked the review. Acceptable for v1 because the round number is visible in the banner copy."

**Why not this round**: Requires server-side change to embed round notes (state.locked doesn't carry them today) and a new UI control with click-to-scroll behavior. Feature profile (~80-120 LOC, ≤5 src files). Out of polish budget; saved for R135 or later if surfaced.

## Selection

Pick **C1 — Relative timestamp on persistent lock banner**. User-visible polish, closes the R132 retro risk-surface, no schema change, no server change, ≤3 src files, ≤1 polish slot.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 1 | ≤1 | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## v6 procedure gap noticed

`proposals.jsonl` last entry is R131 — R132 and R133 entries were not appended per v6's "always present + append-only" rule. Will close in R134 retro (or as part of the round commit) to satisfy the v6 invariant for future readers.