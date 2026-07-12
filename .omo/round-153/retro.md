# R153 Retro — close 15-round-shelved R137 retro Risk #1: remove `legacyExecCommandCopy` fallback

## What worked

Lead-direct refactor round. 1 src file modified + 2 src test files upgraded + 2 test files deleted + 1 housekeeping append. Closes the longest-shelved risk in the project: R137 retro's `document.execCommand("copy")` deprecation flag (15 rounds shelved).

The cleanest path was not to migrate to ClipboardItem API (which R147 retro's "Worth a dedicated refactor round with jsdom test environment fixes" suggested) but to **delete the fallback entirely**. Modern browsers (Chrome 66+ / Firefox 63+ / Safari 13.1+) all support `navigator.clipboard.writeText` natively, the dashboard runs in localhost (secure context by default), and the existing `if (ok)` false branch already shows an error toast. The user-facing behavior for copy failures is now more honest (explicit error message instead of silent fallback to deprecated API).

Profile cadence shift: 12 polish + 4 housekeeping + 1 refactor → 12 polish + 4 housekeeping + 2 refactor (R153 = second refactor after R137's original hoist). Profile pivots from the polish streak.

Pre-commit ran clean after fixing 1 minor cross-round repair: first attempt to upgrade 4 tests had `oldString`/`newString` mismatches (whitespace/comments). Simplified the test assertions to minimum needed (just `ok = false` pattern in catch block).

## What didn't

- **R139 + R147 test files** were entirely about the removed `legacyExecCommandCopy` function. Could have written behavior-contract replacements, but they'd be empty tests ("the function doesn't exist" is a trivial assertion). Deletion is cleaner.
- **First 4 test file edits** had `oldString`/`newString` mismatches in the permalink.test.ts file (whitespace difference between current state and what I remembered). Fixed by reading the actual current state of the test file before editing.

## Carry-over list (≤3 items)

- **3 server-side i18n-coupling system markers** (R142-R152 retro #3, 10 rounds shelved): invasive. Changes the agent→state.json→agent contract. Worth a separate feature round with agent contract re-design.

## Closed in this round (loop-internal)

- **R137 retro Risk #1** (`document.execCommand("copy")` deprecation): closed permanently. Function deleted, 4 call sites simplified, 4 tests upgraded, 2 test files deleted.
- **R147 retro Risk #1** (15-round-shelved migration): closed permanently.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **R137→R142 SOP is now mature**. 17 documented occurrences (T11.2d, T16.8d, T16.10a, T16.10b, T10.1c, T14.23.7, T14.25.1, T12.K3b, T7.4b, T7.4g, plus R151's stash-and-test pattern, R152's R131 pathname upgrade + R113 contentMatches upgrade, R153's 4-test upgrade). Could be future-mechanized into a pre-commit helper that auto-upgrades byte-equivalence tests when the function under test is deleted.
- **Delete vs. upgrade** is a real choice when the function under test is removed. R153 chose delete for R139 + R147 (the entire purpose of the tests was to verify the function existed). R153 chose upgrade for T11.2d + T16.8d + T16.10a + T16.10b (the tests verify the call-site behavior, which still exists). Lesson: when removing a function, ask "is this test about the function's existence or the call-site's behavior?". Existence → delete. Behavior → upgrade.
- **The "remove the fallback entirely" decision** is a good pattern for deprecated APIs. R147 retro proposed migrating to ClipboardItem API (which has jsdom concerns). R153 chose to skip the migration and delete the fallback. The dashboard's error path (setStatus + showToast) was already designed for this — no UX regression.
- **Per-SHIP append discipline held for 17 rounds** (R134 retro caught the gap; R135–R153 all restored).
- **Profile pivot successful**: 12 polish rounds was a streak that needed breaking. R153 (refactor) + R149 (housekeeping) + R151 (housekeeping) since R148 show a healthy mix.

## Risks Surfaced (not actioned this round)

- **3 server-side i18n-coupling system markers** (R142-R152 retro #3, 10 rounds shelved): invasive. Changes the agent→state.json→agent contract.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **1 refactor** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Refactor: 1 (close R137 retro Risk #1: remove deprecated execCommand fallback)
- Total: 1
- Subagents: 0
- Time: ~15 min wall-clock including 1 minor cross-round repair.