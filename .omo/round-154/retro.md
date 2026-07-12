# R154 Retro — close R153 leftover stale deprecation comment + add regression net for 3 server-side markers

## What worked

Lead-direct housekeeping round. 1 src file modified (3 lines of comment deletion) + 1 new test file (5 regression-net tests) + 1 housekeeping append. Two distinct goals achieved in one tight round:

1. **Closed R153 leftover**: the 3-line deprecation docstring on the now-deleted `legacyExecCommandCopy` function was stale documentation. Removed.
2. **Added regression net** for the 10-round-shelved 3 server-side markers (R142-R152 retro #3). The test prevents unintended future changes to these markers without changing the markers themselves.

Profile cadence shift: 12 polish + 4 housekeeping + 1 refactor → 12 polish + 5 housekeeping + 1 refactor (R154 = 3rd housekeeping round this cycle after R149 + R151).

Pre-commit ran clean. The "stale test file" mistake (asserting 'Conversation tab' which isn't actually in the agent prompt) was caught and fixed by deleting the stale test file and keeping the correct one. Zero net post-commit repairs.

## What didn't

- **First test file asserted a non-existent marker**: `src/r154-server-side-markers-contract.test.ts` checked for 'Conversation tab' in agent prompt, but that string isn't actually in `src/index.ts`. The grep at the start of the round showed it in `.ts` files including `i18n.ts` comments (R142 audit had false positives). Fixed by deleting the stale test file and keeping only the correct regression test (`r154-server-markers-regression.test.ts`).

## Carry-over list (≤3 items)

- **3 server-side i18n-coupling system markers** (R142-R152 retro #3, 10 rounds shelved): invasive. Agent parses these as literal prefixes. Documented as future feature round.

## Closed in this round (loop-internal)

- **R153 leftover**: stale deprecation docstring (3 lines) for the now-deleted `legacyExecCommandCopy` function. Removed.
- **Lightest-possible closure of the 10-round-shelved server-side marker flag**: regression test added to catch unintended future changes. The markers themselves are unchanged.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **Initial grep + read cycle is essential for test-based contracts**: my initial audit grep showed 'Conversation tab' in src/.ts files (including i18n.ts), but the R154 test assertion specifically checked `src/index.ts` agent prompt. The grep matched i18n.ts comments, not the actual agent contract. Lesson: when auditing agent contracts, check the SPECIFIC file the test asserts against, not a broad `grep -r`. (R142 audit had false positives too — same root cause.)
- **Regression net for shelved contracts is a low-cost hedge**: the 3 server-side markers (10 rounds shelved) can be partially addressed by adding a test that catches unintended future changes. The full fix (localizing the markers) is invasive and documented as future feature work; meanwhile the test ensures the next refactor doesn't accidentally break the agent contract.
- **Stale docstrings from removed functions linger**: R153 focused on the function deletion + 4 call site simplifications + test upgrades, but the docstring at the function definition wasn't deleted. This is a recurring pattern (the same happened with R139's `legacyExecCommandCopy` function name in the test file). Future function deletions should grep for the function name across the entire src/ to catch all references (including docstrings).
- **Per-SHIP append discipline held for 18 rounds** (R134 retro caught the gap; R135–R154 all restored).

## Risks Surfaced (not actioned this round)

- **3 server-side i18n-coupling system markers** (R142-R152 retro #3, 10 rounds shelved): invasive. Agent parses these as literal prefixes. Documented as future feature round.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **1 housekeeping** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Housekeeping: 1 (delete R153 leftover + add regression net for server-side markers)
- Total: 1
- Subagents: 0
- Time: ~10 min wall-clock.