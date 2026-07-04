# R114 Brief

## Scope (1 feature)

**#82** Silent round auto-summary — Add `RoundSystemNote` entity to state.json (parallel to `findings[]`, append-only). Post-submit hook detects silent round (0 new findings + 0 new notes in this round) and appends a template-rendered summary. Display in conversation pane header. Cap at last 50 entries (rolling). ~250-320 LOC across `src/index.ts` + `src/ui/app.ts` + `src/ui/i18n.ts`.

## Why

User-stated: "这个需求有点实际用处" — traceability for silent rounds. Today no record exists when user submits a round with no findings and no notes; agent-only response. State.json becomes unverifiable for 3-month-old reviews.

## Risk

- Schema additive: `state.roundSystemNotes` is optional array; old state.json files continue to deserialize (no field = empty array).
- Per-round dedup: same round number never generates two summaries (idempotent trigger).
- Cap is rolling (drop oldest) — never grows unbounded.
- Fixed template (per user requirement) — no formatting drift across rounds.

## Acceptance

- S1: `state.roundSystemNotes[]` is appended when round has 0 new findings + 0 notes; existing rounds unchanged.
- S2: Template renders exactly the user-specified format (`Files changed since round N-1:` / `Findings state transitions:` / `Open findings carried forward (N → N+1):`).
- S3: Display in conversation pane header when summary exists for current round.
- S4: Cap at 50 entries — oldest dropped when threshold exceeded.
- S5: All test cases pass; pre-commit 8/8; no regression.

Verify: `bun test 2>&1 | tail -5` + `bash .husky/pre-commit 2>&1 | tail -10` + commit + push + decision.md "SHIP".