# R51 Retro

## What worked
- Pivoted from 5-round housekeeping streak to product work — picked up GH#73 #7 (COMMits panel fold/unfold visual cue) that was deferred since R43 closure.
- Identified root cause quickly: existing click handler toggles `data-collapsed` but no chevron indicator. Pre-existing patterns (`card-chevron`, `folder-chevron`) made fix straightforward.
- CHEVRON_SVG constant + .commit-card-chevron CSS pattern: clean reuse.
- Test design caught a regex bug early (i18n test) — fixed before commit.
- pre-commit 8/8 PASS, 632/632 tests (was 626).
- v6 spec followed end-to-end: 6 artifacts, 7 capabilities, lead-direct 100%, 0 subagent dispatches.

## What didn't
- Initial i18n test regex used `/.../s` flag with `\s*` whitespace matching but failed because the regex engine treats `{` in the pattern specially. Lesson: when testing STRINGS table, use `match(/key[\s\S]*?\}/)` then check substring presence inside the match. Updated test.
- Initial code had minor format issues (oxfmt --check failed on first run). Resolved by running `bunx oxfmt` before commit. Lesson: run oxfmt as part of the Implement capability, not as a separate Verify step.

## Carry-over list
- (none — single-commit round, all scope shipped)

## Closed in this round (loop-internal)
- [x] GH#73 #7 (COMMits panel fold/unfold chevron) implemented in src/ui/review.html + src/ui/app.ts + src/ui/i18n.ts
- [x] 6 new regression tests in src/ui/r51-commits-toggle.test.ts
- [x] R51 round artifacts written to `.omo/round-51/`
- [x] proposals.jsonl appended (next step)

## Open loop-internal at retro time
(none)