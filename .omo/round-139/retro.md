# R139 Retro — hoist `fallbackCopy` to file scope

## What worked

Lead-direct refactor across 1 src file modified (`app.ts`) + 3 test files updated + 1 new test file + 1 housekeeping append. Net -36 LOC for the refactor itself; the 3 test files each gained ~5 LOC for behavior-contract assertions. The refactor closes R137 retro surfaced-risk #2 (4 duplicated 12-line `fallbackCopy` bodies → 1 shared file-scope function).

Pre-commit 8/8 PASS after fixing 3 brittle byte-equivalence tests (T11.2d in permalink.test.ts, T16.8d + T16.10a in r16-features.test.ts). The byte-equivalence pattern was asserting "execCommand exists inside the caller function block" — which broke when execCommand moved to the hoisted helper. Replaced with the same marker-anchored, behavior-contract pattern R137 used for R131: split the assertion into caller-side (uses `fallbackCopy(`) + helper-side (contains `document.execCommand`).

All R139 contract tests red→green. Project suite 1070/1070. Per-SHIP append discipline preserved: R138 entry landed in `.omo/proposals.jsonl`.

## What didn't

- First refactor attempt accidentally created TWO file-scope declarations of `fallbackCopy` (the first `edit` tool call was parallel-interrupted before its `tail` returned, and a retry re-added the function). Caught by `grep -c '^function fallbackCopy' src/ui/app.ts` returning 2 instead of 1. Fixed by removing the duplicate. Lesson: when a tool call is interrupted mid-batch, run verification queries (count, location) before declaring done.
- 3 byte-equivalence tests broke — exactly the brittle pattern R137 retro flagged. The R131 fix in R137 was just one test; R139 broke three more. This is now the second round in a row where R137-style refactors exposed R11-era test brittleness. Future refactor rounds should audit `grep -l 'execCommand\|document\.createElement.*textarea' src/*.test.ts` before starting.

## Carry-over list (≤3 items)

None — R139 closes the R137 retro surfaced-risk #2.

## Closed in this round (loop-internal)

- **R137 retro surfaced-risk #2**: `fallbackCopy` duplicated in 4 functions — **closed**. Net -36 LOC; future rounds only fix bugs in one place.
- **3 brittle byte-equivalence tests** (T11.2d, T16.8d, T16.10a) — **closed**. Replaced with behavior-contract assertions per the R137 retro pattern.
- **v6 procedure gap** (R134 retro lesson #4): `.omo/proposals.jsonl` missing R138 entry — **closed**. R138 entry appended.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **Refactors expose brittle tests** by their nature. R139 broke 3 byte-equivalence tests; R131 fix (R137) broke 1. Pattern: any time we hoist/extract/rename, expect N existing tests to break, where N scales with how many callers used the byte-level pattern. Mitigate by grepping for the byte pattern pre-refactor: `grep -rn "document.execCommand.*copy" src/*.test.ts`.
- **Interruption recovery needs verification queries**. When a tool batch is interrupted, don't trust the partial output — re-query state before continuing. Caught my own double-declaration bug this way.
- **Behavior-contract assertions are durable across refactors.** T11.2d / T16.8d / T16.10a will continue to pass for future refactors as long as the clipboard → fallback → UI-feedback contract holds, regardless of where execCommand lives in the source.
- **Per-SHIP proposals.jsonl discipline has held for 4 rounds in a row** (R134 retro caught the gap; R135, R137, R138, R139 all restored it). This is now a mechanical per-round action.

## Risks Surfaced (not actioned this round)

- `fallbackCopy` itself uses `document.execCommand("copy")` which is deprecated. Modern browsers may eventually remove it. Future housekeeping round could swap to `navigator.clipboard.write` + a non-execCommand fallback, but that's a real behavior change (different error semantics) — not a pure refactor.
- The R137 button label/title still both call `t("previously.notes.copyButton")` — could leverage R133's `data-i18n-title` auto-discovery. Sub-10 LOC polish; waits for a future i18n batch.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) = **0 total** (≤8). Housekeeping/refactor, not feature/bugfix/polish.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Housekeeping/refactor: 1 (hoist `fallbackCopy` to file scope + close 3 brittle tests)
- Total: 1
- Subagents: 0
- Time: ~20 min wall-clock including the interruption recovery + 3 test fixes.