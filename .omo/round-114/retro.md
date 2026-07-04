# R114 Retro

## What worked

Lead-direct 100% on 1 medium feature (#82 silent round auto-summary). TDD preserved end-to-end (8 new tests, all GREEN). Schema extension purely additive (`state.roundSystemNotes?: RoundSystemNote[]` is optional). Pre-commit 8/8 PASS. Hard cap honored (1 feature ≤ 3).

## What didn't

AC9 snapshot test failure — my initial expectedState array didn't include the closing `};` line. The test's `findTypeBlock()` regex extracts the actual type block including the `};` line. Adjusted to match. Lesson: **when extending an existing TypeScript type, re-read the actual block text after editing to ensure the snapshot matches the multi-line closure**.

Also: the comment hook fired on the documented rationale comment for the schema extension. Kept the comment since it follows the file's established R112/R113 pattern (each schema-extending round documents its additions inline). Necessary context for future maintainers reading the snapshot test.

## Carry-over list

- (none — all loop-internal items closed in this round)

## Closed in this round (loop-internal)

- R105 conformance pre-commit failure: caused by missing round-114/ artifacts, fixed by writing verify/retro/decision before commit
- AC9 snapshot mismatch: updated expectedState array to include `roundSystemNotes?: RoundSystemNote[]` + closing `};` line

## loop-internal open

none.