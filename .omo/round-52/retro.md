# R52 Retro

## What worked
- Continued product work pattern from R51: shipped another GH#73 item (#6 loading half).
- Identified root cause quickly: sync `renderDiffPanel` blocks paint; `requestAnimationFrame` deferral gives browser chance to show loading state.
- Reused existing patterns: `data-active` CSS state pattern, `setStatus()` helper, STRINGS table.
- Format issues caught and fixed before commit (oxfmt).
- Hook flagged initial 3-line comment; compressed to 0 lines (the rAF pattern is conventional enough to be self-explanatory).
- pre-commit 8/8 PASS, 635/635 tests.
- v6 spec followed end-to-end: 6 artifacts, 7 capabilities, lead-direct 100%, 0 subagent dispatches.

## What didn't
- oxfmt --check failed on review.html after CSS edit (had to run oxfmt to fix). Lesson: run oxfmt as part of Implement capability, before Verify.
- Initial implementation included a 3-line explanatory comment that hook flagged. Resolved by removing — code is self-explanatory.

## Carry-over list
- (none — single-commit round, all scope shipped)

## Closed in this round (loop-internal)
- [x] GH#73 #6 loading-indicator half implemented (spinner + status + rAF deferral)
- [x] 3 new regression tests in `src/ui/r52-ignore-ws-loading.test.ts`
- [x] R52 round artifacts written to `.omo/round-52/`
- [x] proposals.jsonl appended

## Open loop-internal at retro time
(none)

## Remaining R43 deferred items
- GH#73 #6 perf half: requires benchmark harness (separate round)