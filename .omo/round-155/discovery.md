# R155 Discovery — close R142-R152 retro #3 carry-over: complete regression coverage for 5 server-side marker locations

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R154 retro carry-over** (1 item): 3 server-side i18n-coupling system markers (R142-R152 retro #3, 10 rounds shelved). R154 added a partial regression test (5 tests covering 2 call sites + 2 AGENT_PROMPT references + 1 meta-test). R155 = complete the formal closure.
- **Profile cadence last 18 rounds**: 12 polish + 4 housekeeping + 1 refactor — heavy polish fatigue. R149/R151/R154 were housekeeping pivots.
- **Test pass rate**: 1103/1103 PASS.
- **Fresh surface audit**: clean (0 lint warnings, 0 type errors, 0 orphans).

## Surfaced candidates

### C1 — Complete R154 regression coverage + minimal contract reference (R155 housekeeping)

**Evidence** (R154 regression test current state):

The R154 test covers 4 marker locations + 1 meta-test. The R142-R152 retro #3 conclusion stands: these markers are agent contract (not i18n candidates). R155 = formal closure of the carry-over by completing the regression net.

**Why this matters**: R154 retro explicitly flagged this as a carry-over. The current regression test prevents unintended future changes. A minimal contract reference at the AGENT_PROMPT explains the decision for future maintainers.

**Cost**: ≤1 src file modified (minimal contract reference at `src/index.ts`) + 1 housekeeping append. ~5 LOC net.

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish). Closes R142-R152 retro #3 carry-over (10 rounds shelved).

### C2 — Localize 3 server-side markers with i18n keys

**Why not this round**: The cleanest approach would add `comments.manuallyReopened` + `comments.editedByUser` keys to `src/ui/i18n.ts` and use `t()` in `src/index.ts`. But `src/ui/i18n.ts` has DOM dependencies (`document.querySelectorAll`, `MutationObserver`) at module init — `src/index.ts` is a Node.js plugin that can't import it. Full localization requires extracting `src/server-i18n.ts` (no DOM deps). Out of R155 scope.

### C3 — Calendar-accurate formatRelativeTime

**Why not this round**: Preventive only. R148 retro noted "worth a future round if precision matters". No current surface triggers this edge case.

## Selection

Pick **C1** — close the 10-round-shelved flag with complete regression coverage. Tight housekeeping, ≤1 src file + 1 housekeeping append.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| refactor | 0 | n/a | OK |
| housekeeping | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R154 entry to `.omo/proposals.jsonl` (per-SHIP discipline)