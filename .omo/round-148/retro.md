# R148 Retro — add years threshold to formatRelativeTime (close R142 retro #2 preventive)

## What worked

Lead-direct polish round across 2 src files modified (`i18n.ts`, `app.ts`) + 1 R134 test upgrade + 1 new test file + 1 housekeeping append. Closes the 5-round-shelved R142 retro #2 preventive flag: timestamps ≥ 365 days now render as "n years ago" instead of the imprecise "n months ago" (e.g., "13mo ago" for a 1-year-old entry).

The 6-threshold ladder now covers the full range: justNow (60s) → minutes (60min) → hours (24h) → days (30d) → months (365d) → years (∞). The implementation is a single new `if (diff < 31_536_000_000)` branch with a new i18n key.

Pre-commit ran clean after a regex-bug fix. The initial R148 test #1 used `[^{}]*` to avoid matching braces inside the value, but `{n}` template literals contain both `{` and `}` — the regex couldn't traverse the value field. Fixed by switching to line-anchored split (`src.split("\n").find(...)`). Same gotcha as R144's `uncommittedBadge.title` regex.

R134 test upgrade was atomic: REQUIRED_KEYS list + threshold-list assertion both extended in the same commit. All 6 R134 tests pass after upgrade.

Per-SHIP append discipline preserved. All 5 v6 hard gates PASS.

## What didn't

- **Initial R148 test regex was buggy**: `[^{}]*` can't traverse `{n}` template literals. Caught immediately by bun test (3/3 with regex error vs 3/3 with line-anchored match). Lesson: when i18n values contain `{n}` template-literal markers, use line-anchored match, not bracket-balanced regex.
- **i18n.ts had a duplicate key entry** in one of the earlier interrupted edit batches. Fixed before pre-commit.
- **The 30-day "months" approximation** isn't calendar-accurate (doesn't account for variable month length), and the 365-day "years" approximation isn't calendar-accurate either (doesn't account for leap years). R148 is a polish round, not a calendar refactor. Worth a future round if the precision matters.

## Carry-over list (≤3 items)

None — R148 closes the R142 retro #2 preventive flag. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R142 retro #2** (`formatRelativeTime > 1 year` preventive): closed. R148 adds the years threshold.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **6-threshold ladder is now complete** for the common timestamp range. Future additions would be edge cases (e.g., "decades", "centuries") — unlikely to need them.
- **`{n}` template-literal regex trap is now documented** in the R148 verify self-improvement section. Future i18n tests with `{n}` placeholders should use line-anchored match from the start. Same gotcha hit by R144 retro (`uncommittedBadge.title` regex).
- **R134 test was easy to upgrade** because it was already structured as a behavior-contract (asserts the 5 threshold constants exist + 5 keys exist in REQUIRED_KEYS). Just add one constant + one key. R142 SOP applied retroactively.
- **Per-SHIP proposals.jsonl append discipline held for 12 rounds** (R134 retro caught the gap; R135–R148 all restored).

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` ClipboardItem API migration** (R137-R147 retro #1, 11 rounds shelved). Real behavior change. Future refactor round.
- **3 server-side i18n-coupling system markers** (R142-R147 retro #3): invasive, changes agent→state.json→agent contract.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — `en ≠ zh-CN` for the new key.

## Round Profile

- Polish: 1 (add years threshold to formatRelativeTime)
- Total: 1
- Subagents: 0
- Time: ~12 min wall-clock including the regex-bug fix iteration.