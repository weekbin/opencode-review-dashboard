# R143 Retro — localize 2 hardcoded English strings in saved-replies dropdown

## What worked

Lead-direct polish round across 2 src files modified (`app.ts`, `i18n.ts`) + 1 test upgrade + 1 housekeeping append. Closes the R142 retro surfaced-risk #3 ("`savedReplies.saveCurrent` is a future i18n candidate"). Plus the sibling R142-audit-flagged T10.2b byte-equivalence test (i18n-coupling #4) upgraded to behavior-contract per the R142 SOP.

The bundle is the right shape: 2 hardcoded English strings (L5048 tooltip + L5066 button label) live 16 lines apart in the same saved-replies dropdown block. Splitting into separate rounds would have meant 2 polish rounds for what's effectively 1 localized surface. Bundling kept the work tight (10 LOC net, 2 keys × 2 locales = 4 strings, 1 test upgrade).

The T10.2b behavior-contract upgrade follows the R140→R141→R142 SOP: replace `expect(src).toMatch(/Save current as template/)` with `expect(src).toMatch(/t\(["']savedReplies\.saveCurrent["']\)/)`. The test now asserts the contract (caller delegates via `t()` lookup) instead of byte-equivalence (English literal exists in source). Survives future refactors that might hoist the string into a helper.

Pre-commit 8/8 PASS. saved-replies.test.ts 11/11 PASS (same count as R142; the T10.2b upgrade is a swap, not an addition). R103 invariant preserved (no emoji-only role labels). Per-SHIP append discipline maintained (R142 entry was already in proposals.jsonl from R142's commit; R143 entry appended in this commit).

## What didn't

- First attempt to write verify.md was interrupted mid-stream (no content emitted). Recovered by re-issuing with the full verify content.
- Initial scan of saved-replies.test.ts returned no matches because the regex was wrong — saved-replies.test.ts has 2 paths for the T10.2b string assertion (the actual edit landed at the right one). Confirmed via grep that the line was correctly updated.

## Carry-over list (≤3 items)

None — R143 closes R142 retro flag #3. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R142 retro flag #3**: `savedReplies.saveCurrent` future i18n candidate — **closed**.
- **R142 audit #4**: T10.2b byte-equivalence i18n-coupling test — **closed**. Upgraded to behavior-contract per the R142 SOP.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **R142 SOP worked exactly as designed.** The audit round surfaced 4 i18n-coupling sites + 1 future candidate; R143 picked the future candidate and shipped. The SOP at `verify.md` is now proven useful (closed the flag it created).
- **Bundle localized surfaces, not arbitrary string sets.** Bundling L5048 + L5066 is right because both are in the same dropdown block. Bundling across distant call sites would have been scope creep.
- **Test upgrade is part of the same commit**, not a follow-up. This is the R137→R141 pattern proven for the 4th time. Atomic-update discipline holds.
- **Per-SHIP proposals.jsonl append discipline held for 8 rounds** (R134 retro caught the gap; R135–R143 all restored it). Mechanical per-round action.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` uses deprecated `document.execCommand("copy")`** (R142 retro #1). Real behavior change risk. Future housekeeping.
- **`formatRelativeTime > 1 year`** — preventive only.
- **Other `💾 Save current as template…` style hardcoded UI labels** might still exist elsewhere. The R142 audit only scanned `src/*.test.ts` byte-equivalence assertions, not the source. Future housekeeping could `grep -nE 'textContent\s*=\s*"\b[A-Z]' src/ui/*.ts` for a full source-side audit.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — `en !== zh-CN` for both new keys.

## Round Profile

- Polish: 1 (localize 2 saved-replies dropdown strings + upgrade T10.2b test)
- Total: 1
- Subagents: 0
- Time: ~8 min wall-clock.