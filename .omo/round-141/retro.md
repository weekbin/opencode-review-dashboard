# R141 Retro — localize `addSavedReply()` validation errors

## What worked

Lead-direct polish round across 2 src files modified (`app.ts`, `i18n.ts`) + 1 new test + 1 brittle-test upgrade + 1 housekeeping append. Closes the post-R140 followup — R140 closed the `data?.error ?? t("status.X")` fetch-error pattern, R141 closes the adjacent `result.error ?? t(...)` validation-error pattern in `addSavedReply()`. Total hardcoded English strings closed across R140 + R141: 8 (4 fetch-error fallbacks + 4 validation errors).

Implementation mirrored R140's pattern almost exactly. The only nuance: `setStatus(s: string)` at L2361 takes a string verbatim and does NOT pre-translate (verified by inspecting the function body — `statusRoot.textContent = text;` direct assignment). So `addSavedReply()` returns translation-key strings (`"savedReplies.error.nameRequired"`), and the caller at L5084 wraps with `t()`: `setStatus(result.error ? t(result.error) : t("status.templateSaveFailed"), true)`. This way the function signature stays type-clean (returns a translation key, not already-translated text) and the caller owns the locale resolution.

Pre-commit 8/8 PASS after one brittle-test upgrade. R141 contract tests 4/4 pass. T10.1c upgraded to behavior-contract per the R137/R139 marker-anchor pattern (`expect(block![0]).not.toMatch(/localStorage quota exceeded/)` → `expect(block![0]).toMatch(/error: "savedReplies\.error\.nameRequired"/)`). Project suite 1080/1080. R103 translation-completeness invariant passes for all 4 new keys (`en !== zh-CN`). Per-SHIP append discipline preserved.

## What didn't

- I added 3 unnecessary code comments in the upgraded T10.1c ("R141: function returns translation keys...", "Contract: each error path returns...", "No hardcoded English validation messages remain.") — all redundant with the assertions that follow them. Hook flagged them per the remove-ai-slops rule. Removed all 3; assertions stand on their own.
- First test run of T10.1c upgrade failed with 1 of 4 R141 tests failing — wrong assertion shape. I had asserted `toMatch(/t\("savedReplies\.error\.nameRequired"\)/)` (looking for `t()` call inside the function), but the function returns the key as a string and the caller wraps with `t()`. Corrected to `toMatch(/error: "savedReplies\.error\.nameRequired"/)` matching the actual return-value pattern.

## Carry-over list (≤3 items)

None — R141 closes the post-R140 followup. No new loop-internal flags.

## Closed in this round (loop-internal)

- **Post-R140 followup**: 4 hardcoded English validation errors in `addSavedReply()` — **closed**.
- **T10.1c brittle byte-equivalence test** (asserts `localStorage quota exceeded` exists inside `addSavedReply` body): upgraded to behavior-contract per the R137/R139 marker-anchor pattern.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **Brittle-test upgrades are a per-round tax.** R131 (R137), T11.2d (R137), T16.8d + T16.10a (R139), now T10.1c (R141). Every i18n refactor that swaps hardcoded English for translation keys risks tripping a test that hardcodes the English string. The fix is consistent (same behavior-contract pattern: assert caller delegates, helper/key contains the translation). At some point it would be worth a future housekeeping round to audit `grep -rl '"name is required"\|"body is required"\|"Failed to ' src/*.test.ts` for similar patterns and preemptively upgrade them.
- **Don't add comments explaining what the test code already says.** The hook is correct that `expect(...).not.toMatch(/name is required/)` is self-explanatory. R141 was the third time I wrote unnecessary comments; lesson internalized.
- **`setStatus` requires pre-translated text.** Verified by reading the function body (`statusRoot.textContent = text;`). Caller owns `t()` wrap. Pattern verified inline in `brief.md` ## Existing patterns.
- **Per-SHIP proposals.jsonl append discipline held for 7 rounds** (R134 retro caught the gap; R135-R141 all restored). This is now a mechanical per-round action.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` uses deprecated `document.execCommand("copy")`** (R139 retro). Modern browsers may eventually remove it. Future housekeeping round would require real behavior change.
- **Audit for more byte-equivalence tests lurking in the test suite** (R139 retro #4, R141 implicit). Cheap future housekeeping round.
- **`formatRelativeTime > 1 year` as calendar date** — preventive only, no current surface.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — `en !== zh-CN` for all new keys.

## Round Profile

- Polish: 1 (localize 4 addSavedReply validation errors)
- Total: 1
- Subagents: 0
- Time: ~12 min wall-clock including the T10.1c brittle-test upgrade.