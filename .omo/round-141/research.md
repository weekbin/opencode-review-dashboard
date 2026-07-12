# R141 Research — localize `addSavedReply()` validation errors

Lightweight-round compression (≤50 LOC + ≤3 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The only non-trivial dependency is `setStatus`. Verified at L5074: `setStatus(t("status.commentBoxEmpty"), true)` — the caller pre-translates via `t()` and passes the resolved localized string. So `setStatus` renders input verbatim; it does NOT double-translate. This means `addSavedReply`'s 4 errors must be translation keys, and the caller at L5084 must wrap `result.error` with `t()` before passing.

Pattern verified inline in `brief.md` ## Existing patterns.

No new i18n keys beyond the 4 documented in brief. R103 invariant holds for all 4 (no emoji-only role labels — `R141 savedReplies.error.*` keys follow the `<namespace>.<namespace>.<namespace>.<role>` convention).