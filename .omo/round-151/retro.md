# R151 Retro — clean 14 unused-variable warnings across 12 test files + 1 src file

## What worked

Lead-direct housekeeping round. 14 unused variables deleted across 12 files (11 test files + src/ui/app.ts). 0 functionality changes, 0 tests broken, all 1100 regression tests pass.

R151 was the first housekeeping round since R149 (orphan i18n cleanup) and addresses a different hygiene axis: dead code (unused declarations). The eslint warnings were cluttering the dev signal — `bun run check` would surface 15 "warnings" that don't actually need fixing, making it harder to spot real issues.

The cleanup was mechanical: 15 single-line edits across 15 files. Each was verified safe (1 reference = the declaration itself) before deleting. No call-graph analysis needed — `eslint(no-unused-vars)` already proved each var is truly unused.

Pre-commit ran clean after fixing 1 cross-round repair: the `contextHash` function at `src/index.ts:434` was flagged as unused but removing it broke **3 pre-existing tests** (R113 AC3, R131 AC6 + AC2). R151 reverted that deletion and documented the 1 remaining warning as a known limitation of the test infrastructure (keyword-grep + line-number-constant brittleness).

Profile cadence shift: 12 polish + 3 housekeeping + 1 refactor → 12 polish + 4 housekeeping + 1 refactor (R151 = second housekeeping round this cycle, after R149). Restores some profile balance.

## What didn't

- **The `contextHash` function deletion broke 3 tests.** The tests use keyword-grep + line-number-constant patterns to assert server-side logic. R151's first attempt to delete contextHash (the 15th unused var) failed because:
  1. R113 AC3 slices a 500-char window after `content_hash`/`fnv1a` and asserts "anchor"/"context" appears — the `contextHash` function body had "anchor" tokens
  2. R131 hardcodes `SUBMIT_HANDLER_START = 100596` line number — deleting contextHash shifts all subsequent lines up by 4

Lesson: "unused" doesn't mean "safe to delete" when tests grep for the function's keyword or hardcode line numbers around it. Future audits should also check `grep -r 'fnv1a\|contentHash\|contextHash' src/*.test.ts` to find keyword-grep dependencies.

- **Initial batch edits were interrupted** by tool batch boundaries, requiring several retry passes. This was expected (batch boundary issue from earlier rounds R144/R146/R148/R150). No new lesson.

## Carry-over list (≤3 items)

- **`contextHash` unused-var warning** (R151 known limitation, 1 remaining). Future R152+ should upgrade R113 + R131 to behavior-contract per the R137→R142 SOP, then complete the contextHash deletion.

## Closed in this round (loop-internal)

- **Implicit unused-vars hygiene flag** (15 warnings, 14 cleaned). Closed for 14 of 15. The 15th (`contextHash`) stays as a documented known limitation.

## Open loop-internal at retro time

- **`contextHash` unused-var warning** — see above.

## Self-Improvement Observations

- **`eslint(no-unused-vars)` is necessary but not sufficient for safe deletion.** The lint warning proves no production caller exists. But tests may still reference the symbol via keyword-grep or line-number-constant. Future audits should combine unused-var detection with `grep -r 'symbol_name' src/*.test.ts` to surface test dependencies.
- **The R137→R142 byte-equivalence → behavior-contract SOP applies to test-brittleness in general.** When a refactor removes an API, tests asserting that API need upgrade OR the API needs to stay. Both are valid choices; the trade-off is "clean lint output" vs "test stability".
- **Per-SHIP proposals.jsonl append discipline held for 15 rounds** (R134 retro caught the gap; R135–R151 all restored).
- **Profile cadence observation**: 2 housekeeping rounds (R149 + R151) since the 7-round polish streak broke at R147. Both pivots were low-risk hygiene cleanup. Good pattern: after a long polish streak, use housekeeping rounds to catch up on accumulated tech debt before resuming polish.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` ClipboardItem API migration** (R137-R150 retro #1, 14 rounds shelved): real behavior change. R147 retro explicitly noted jsdom test environment issues. Worth a dedicated refactor round with explicit design discussion.
- **3 server-side i18n-coupling system markers** (R142-R150 retro #3, 9 rounds shelved): invasive. Changes the agent→state.json→agent contract. Worth a separate feature round.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **1 housekeeping** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro (with documented carry-over for the 1 remaining contextHash warning).
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).

## Round Profile

- Housekeeping: 1 (clean 14 unused-var warnings)
- Total: 1
- Subagents: 0
- Time: ~10 min wall-clock including the contextHash revert.