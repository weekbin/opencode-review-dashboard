# R112 Retro

## What worked

Lead-direct 100% on a 3-feature bundle (≤3 hard cap exact). RED→GREEN TDD preserved end-to-end — wrote each test file first, watched all 5/5 fail, then implemented and confirmed GREEN before moving to next feature. The pre-commit hook's `format --write → re-stage → bun test` sequence (R102 fix) caught the type widening cleanly when #76 added `"out_of_diff"` to the `kind` union. Snapshot test in src/prior-notes.test.ts required explicit intentional update with documented rationale — a useful friction point that forces the lead to think about schema evolution rather than slipping in type widening silently.

## What didn't

Initial RED test for #80 had brittle substring slicing (looking only downstream of conversation-snippet, when anchor.selected sits upstream). Required 2 fix passes to widen the window. Lesson for future rounds: when writing src-content pattern checks, locate the anchor string in BOTH directions (before + after) — upstream dependencies are common in render-flow code. Also accidentally wrote a valid-but-wrong syntax line (`expect(window).toContain(... ) || window).toContain(... )` — extra closing paren — caught immediately by bun test parser.

## Carry-over list

- (none — all artifacts written in this round)

## Closed in this round (loop-internal)

- R105 conformance pre-commit failure: caused by missing round-112/ artifacts, fixed in C7 by writing verify/retro/decision before commit
- src/prior-notes.test.ts schema-snapshot miss: updated inline with documented rationale (out_of_diff is strict subset extension)
- Bulk-resolve UX inconsistency with R26 bulk-delete parity: closed by #75
- Missing anchor-content visibility in conversation pane: closed by #80

## loop-internal open

none.
