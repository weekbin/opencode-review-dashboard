# R147 Retro — behavioral test coverage for hoisted fallbackCopy helper

## What worked

Lead-direct housekeeping round. 1 new test file + 1 housekeeping append. Closes the R139 retro loop-internal flag #1 ("`fallbackCopy` is untested"). After R139 SHIPped the hoist (commit `db30b3d`), the helper had only T11.2d byte-equivalence coverage in `permalink.test.ts` — structural assertion that the helper exists and is called. R147 adds behavioral coverage on top.

The 3 test cases follow the v6 source-level test pattern used by every `rNN-*.test.ts` since R87: read source via `Bun.file()`, regex-match the function body, assert specific behavioral markers exist. This pattern works without needing to export `fallbackCopy` (which would expand the surface) and without runtime DOM tests (which would be flaky in jsdom).

Pivoted from 7-round polish streak (R140-R146) to a different profile. Profile cadence shift: 9 polish + 2 refactor + 1 housekeeping → 9 polish + 2 refactor + 2 housekeeping. Restores some profile balance.

Pre-commit 8/8 PASS. Project suite 1095/1095. R105 conformance satisfied. Per-SHIP append discipline preserved.

## What didn't

- **Initial candidate (C2 — replace execCommand with ClipboardItem API) was rejected** during discovery as too invasive. Real behavior change. jsdom + headless Chromium under Playwright don't support ClipboardItem reliably. Would break existing tests. Worth a dedicated refactor round, not a quick housekeeping round.
- **The 3 behavioral tests are source-level, not runtime** — they assert "the source contains pattern X" rather than "calling fallbackCopy returns true". This is the v6 norm but doesn't fully replace a real DOM test. A future round could add a runtime behavioral test using a jsdom harness.

## Carry-over list (≤3 items)

None — R147 closes the R139 retro loop-internal. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R139 retro flag #1** (`fallbackCopy` untested): closed. R147 adds T1/T2/T3 behavioral coverage on top of the existing T11.2d byte-equivalence.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **8 rounds shelved is too many.** R137 retro flagged `fallbackCopy` deprecation for the first time. R147 closes the test gap but the deprecation itself (real behavior change) is still on the shelf across R137-R147 = 11 rounds. The v5.4 No-Deferral Patch threshold for "Risks Surfaced (not actioned this round)" needs revisiting. Either: (a) treat these as lower-priority flags that genuinely don't need to close in 5 rounds, or (b) scope them into mini housekeeping rounds like R147 did for the test gap.
- **Profile fatigue is real**. 9 polish in 12 rounds is a strong signal that polish has been the easy default. R147's pivot to housekeeping breaks the streak. Future retros should explicitly check whether the profile mix is healthy.
- **Defense-in-depth for tests**: T11.2d (byte-equivalence) + R147 (behavioral) provide complementary coverage. The structural test catches refactors that remove the helper; the behavioral test catches implementations that change behavior. Both are valuable.
- **Source-level tests are good for hoisted helpers**. `fallbackCopy` is file-scope (not exported), so a runtime test would require either exporting it (expanding API surface) or testing through one of the 4 callers (which adds noise). The source-level pattern reads the function body via `Bun.file()` and asserts behavioral markers — clean, focused, zero export churn.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` deprecation itself** (R137-R146 retro #1): the `document.execCommand("copy")` API is deprecated. R147 added test coverage but didn't replace the API. Worth a dedicated refactor round with ClipboardItem API migration + jsdom test environment fixes. (Now 11 rounds shelved.)
- **`formatRelativeTime > 1 year`** (R142-R146 retro, preventive only).
- **3 server-side i18n-coupling system markers** (R142-R146 retro #3): invasive.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **1 housekeeping** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Housekeeping: 1 (add behavioral test coverage for `fallbackCopy`)
- Total: 1
- Subagents: 0
- Time: ~5 min wall-clock.