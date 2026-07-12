# R150 Retro — localize 2 hardcoded English strings in app.ts (closes R146 audit gap)

## What worked

Lead-direct polish round across 3 src files modified (`app.ts`, `i18n.ts`, 2 test upgrades) + 1 new test file + 1 housekeeping append. Closes the R146 audit gap: R140-R146 swept `review.html` + `app.ts` textContent assignments in innerHTML literals but missed 2 hardcoded English strings in app.ts (`L619` nav hint + `L5358` prior rounds hint). R150 catches both.

The fix is minimal:
- 2 new i18n keys × 2 locales = 4 strings (`navHint.navigate`, `previously.panelHint`)
- 2 call-site wraps with `t(...)` lookups
- 1 new test file with 4 contract tests
- 3 byte-equivalence tests upgraded to behavior-contract per the R137→R142 SOP (T12.K3b, T7.4b, T7.4g)

Pre-commit ran clean after fixing 2 cross-round repairs:
1. **Duplicate i18n.ts entries**: R150's first implementation left 3 copies of each new key (leftovers from interrupted edit batches). Cleaned via Python script that detected duplicates by key string + removed all-but-first.
2. **Multi-line regex test failure**: initial R150 test used `[^}]*` which doesn't span newlines. Fixed with line-anchored split approach.

All 5 v6 hard gates PASS. Profile cadence shift: 12 polish + 3 housekeeping + 1 refactor → 13 polish + 3 housekeeping + 1 refactor (R150 keeps polish dominant).

## What didn't

- **Duplicate i18n.ts entries**: 3 copies of each new key appeared because the edit batches were interrupted and re-run. The dedup script worked but should have been caught at the pre-commit step. Lesson: when adding a new key to i18n.ts, run `grep -c '^  "<key>":' src/ui/i18n.ts` after the edit and verify count = 1.
- **Multi-line regex test failure**: same gotcha as R148 (`[\s\S]*?\}` stopping at `{n}` template literals) — this time it's `[^}]*` failing on the multi-line i18n entry. The line-anchored split approach is now the standard pattern for i18n.ts entries with template literals OR multiline values.

## Carry-over list (≤3 items)

None — R150 closes the R146 audit gap. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R146 audit gap**: 2 app.ts hardcoded English strings missed by R140-R146 sweep. Closed.
- **3 byte-equivalence tests** (T12.K3b, T7.4b, T7.4g): upgraded from byte-equivalence to behavior-contract per R137→R142 SOP.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **The R137→R142 SOP is now mature**. 9 documented occurrences: T11.2d (R139), T16.8d (R139), T16.10a (R139), T10.1c (R141), T14.23.7 (R145), T14.25.1 (R146), now T12.K3b (R150), T7.4b (R150), T7.4g (R150). Could be future-mechanized into a pre-commit helper that scans for byte-equivalence assertions on i18n keys.
- **Line-anchored split is the standard pattern** for i18n.ts entries with template literals or multi-line values. Both `[^}]*` and `[\s\S]*?\}` regex variants hit the multi-line edge case. Future i18n tests should prefer `src.split("\n").find(...)` over bracket-balanced regex.
- **The R146 audit missed app.ts string assignments** because it scanned `review.html` only (R144) + `app.ts` textContent assignments in innerHTML literals (R140). Two patterns missed: `(el|root)\.innerHTML = "..."` (only checked by R150's grep) and `textContent = \`...\`` template literals (only checked by R150's grep). R150's audit is broader but still won't catch every pattern. Future audits should include `app.ts` grep with a multi-pattern check.
- **Per-SHIP proposals.jsonl append discipline held for 14 rounds** (R134 retro caught the gap; R135–R150 all restored). Retroactively appending R149 in R150 also caught a previous lapse.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` ClipboardItem API migration** (R137-R149 retro #1, 13 rounds shelved): real behavior change. R147 retro explicitly noted "Worth a dedicated refactor round with ClipboardItem API migration + jsdom test environment fixes" — jsdom doesn't support `navigator.clipboard.write` (only `writeText`). Worth a dedicated refactor round.
- **3 server-side i18n-coupling system markers** (`Manually reopened:`, `Edited by user`) (R142-R149 retro #3, 8 rounds shelved): invasive. Changes the agent→state.json→agent contract. Agent parses these as literal prefixes. Would need a separate feature round with agent contract re-design.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — `en ≠ zh-CN` for both new keys.

## Round Profile

- Polish: 1 (localize 2 app.ts strings + 3 test upgrades)
- Total: 1
- Subagents: 0
- Time: ~15 min wall-clock including the 2 cross-round repairs (duplicate i18n.ts entries + multi-line regex test).