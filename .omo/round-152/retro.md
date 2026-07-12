# R152 Retro — close R151 `contextHash` carry-over: upgrade R113 + R131 to behavior-contract + delete function

## What worked

Lead-direct polish round. 1 src file modified (`src/index.ts`: contextHash function deleted) + 2 test files modified (R131 pathname-based extraction + R113 behavior-contract upgrade) + 1 new test file (`r152-context-hash-cleanup.test.ts` regression net) + 1 housekeeping append. Closes the R151 carry-over explicitly flagged in R151 verify: "1 of 15 unused-var warning (contextHash) stays as a documented known limitation".

Profile cadence shift: 11 polish + 4 housekeeping → 12 polish + 4 housekeeping. Clean polish round — 0 open loop-internal flags.

Pre-commit ran clean after 2 cross-round repairs:
1. **R131 regex vs Bun-style routing**: old regex looked for `app.post("/submit", ...)` but src/index.ts uses Bun-style `if (request.method === "POST" && pathname === ...)` patterns. Fixed by replacing regex with direct `indexOf(pathname)` + brace-walking helper.
2. **R113 AC3 wrong assertion**: original AC3 asserted `sanitize() body contains context_hash` — but `context_hash` was never actually written by `sanitize()`. The real implementation uses `contentMatches()` with `fnv1a()` for hash comparison. Fixed by asserting `contentMatches()` body contains 6 `fnv1a()` calls (3 prev + 3 next anchor fields).

R137→R142 SOP applied 13 times total now (T11.2d, T16.8d, T16.10a, T10.1c, T14.23.7, T14.25.1, T12.K3b, T7.4b, T7.4g, T7.4b, T7.4g, plus R151's stash-and-test pattern + R152's R131 pathname upgrade + R113 contentMatches upgrade).

## What didn't

- **R131 regex broke when I tried to upgrade**: the first attempt used `new RegExp(\`if\\s*\\(...\\s*pathname\\s*===\\s*\`${escaped}\`\\)\\s*\\{)`)`. The escaping function `pathname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` over-escaped `$` and `{}`, producing `\$` and `\{\}` in the regex which didn't match the source's `$` and `{}` characters. Fixed by switching to direct `indexOf` approach.
- **R113 AC3 wrong assertion**: the original R113 test (from before R152) checked for `sanitize() body contains context_hash` — but `context_hash` was never written by `sanitize()`. The auto-resolve mechanism is in `contentMatches()` which uses `fnv1a()`. Lesson: when upgrading byte-equivalence tests to behavior-contract, first verify what the function actually does.

## Carry-over list (≤3 items)

None — R152 closes the R151 carry-over. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R151 `contextHash` carry-over**: closed. Function deleted, 2 tests upgraded, regression test added.
- **R151 retro limitation (1 of 15 unused-var warnings)**: closed. All 15 unused-var warnings now cleaned.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **R137→R142 SOP is mature**. 13 documented occurrences. Pattern: when a refactor removes an API, tests asserting that API get upgraded to behavior-contract. R152 applied this to R131 (hardcoded line-number constants → pathname-based extraction) and R113 (keyword-grep → function signature + behavior assertion).
- **`indexOf` is simpler than regex for substring matching in source-level tests**. When the substring is unique in the source (like a pathname literal), `indexOf` is more readable and avoids regex escaping bugs. R131's `locateHandlerBodyByPathname` uses `indexOf(pathname)` + brace-walking, no regex needed.
- **Stash-and-test pattern (R151 retro lesson) verified**: R152 ran stash → test → pop → fix → re-stash → test → pop → re-stage → commit. Each iteration verified a specific failure mode. Total time: 3 iterations vs. the 10+ iterations R151 took.
- **Per-SHIP append discipline held for 16 rounds** (R134 retro caught the gap; R135–R152 all restored).

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` ClipboardItem API migration** (R137-R151 retro #1, 14 rounds shelved): real behavior change. R147 retro explicitly noted jsdom test environment issues. Worth a dedicated refactor round.
- **3 server-side i18n-coupling system markers** (R142-R151 retro #3, 9 rounds shelved): invasive. Agent parses these as literal prefixes.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Polish: 1 (close R151 contextHash carry-over)
- Total: 1
- Subagents: 0
- Time: ~25 min wall-clock including 2 cross-round repairs (R131 regex + R113 AC3 wrong assertion).