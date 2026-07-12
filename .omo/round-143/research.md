# R143 Research — localize 2 hardcoded English strings in saved-replies dropdown

Lightweight-round compression (≤50 LOC + ≤3 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The 2 hardcoded English strings exist as direct values in `src/ui/app.ts`:

- L5048: `savedRepliesBtn.title = "Saved Replies (R10) — type /<name>+space to expand";`
- L5066: `saveCurrent.textContent = "💾 Save current as template…";`

Both are in close proximity (16 lines apart) in the same dropdown rendering block, making this a clean bundle — no risk of test surface sprawl across the codebase.

The T10.2b behavior-contract upgrade follows the established R140/R141 pattern (assert `t("savedReplies.saveCurrent")` exists, not the English literal). R103 invariant holds for both new keys (no emoji-only role labels).

No other dependencies.