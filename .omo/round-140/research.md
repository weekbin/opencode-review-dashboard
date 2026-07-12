# R140 Research — tighten i18n fallbacks + adopt `data-i18n-title` for copyNotesBtn

Lightweight-round compression (≤50 LOC + ≤3 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The only external dependency is the R133 `data-i18n-title` infrastructure at `src/ui/i18n.ts:963` (the `applyUITranslator` function that walks `[data-i18n-title="${ecap}"]`) and `initUIDataI18nAttributes()` at L998 (the boot hook + MutationObserver). Both already wired into `src/ui/app.ts:14` imports and called at app boot — verified via grep.

No new i18n keys are needed for the `data-i18n-title` swap (reuses `previously.notes.copyButton` which exists since R137). The 4 new keys follow the existing R134/R135/R137 placement pattern (in the appropriate neighborhood of `STRINGS`):
- `resolve.reason.empty` placed near existing resolve-related keys
- `status.pinFailed`/`unpinFailed`/`reactionFailed` placed near existing `status.*` keys

R103 translation-completeness invariant will catch any identical en/zh-CN values; no duplication risk because none of the 4 strings is purely an emoji role label like R135's `comment.author.agent`.