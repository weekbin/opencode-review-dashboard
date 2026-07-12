# R137 Discovery

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R136 retro carry-over**: none — all surfaced risks closed
- **proposals.jsonl last entry**: R136 (per-SHIP append discipline restored)
- **Last feature round**: R132 (R133–R136 have all been polish) — overdue for a feature

## Surfaced candidates

### C1 — "Copy round notes" button in Previously-discussed panel (R137 feature)

**Evidence** (1 site in `src/ui/app.ts`):
- L5381-L5393: the existing notes block renders `roundEntry.notes` text + label "Notes you sent to the agent"
- No way for the user to share round notes with the agent in the next round without manually selecting + copying text
- Established copy pattern at L408-L516 (Copy as MD), L1758-L1786 (Copy branch), L4013 (Copy commit SHA) — same `navigator.clipboard.writeText` + `fallbackCopy` + button text feedback timer + toast + setStatus shape

**Why**: User-visible feature. Round notes are the most important context the agent sees in the next round. Currently the user has to manually select the notes text and copy. A one-click copy button saves a small but meaningful amount of friction every round.

**Cost**: ≤1 src file modified (`app.ts`) + 1 new test + 1 proposals.jsonl append. ~35 LOC net. 2 new i18n keys × 2 locales = 4 strings.

**Profile**: feature (new UI control with click handler).

### C2 — Worktree cleanup (5 untracked PNGs + .agents/ + skills-lock.json)

**Why not this round**: Pure hygiene, no user-visible value. Deferred to housekeeping round.

### C3 — `formatRelativeTime > 1 year` as calendar date

**Why not this round**: Preventive only, no current surface triggers this.

## Selection

Pick **C1 — Copy round notes button**. User-visible feature, reuses established copy pattern, ~35 LOC. Break the polish streak (R133–R136) with a real feature.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 1 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R136 entry to `.omo/proposals.jsonl` (per-SHIP append discipline per R134 retro lesson)