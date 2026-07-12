# R141 Brief — localize `addSavedReply()` validation errors

## Scope

1. **`src/ui/i18n.ts`** — add 4 new keys × 2 locales = 8 strings:
   - `savedReplies.error.nameRequired`: "Template name is required" / "模板名称不能为空"
   - `savedReplies.error.bodyRequired`: "Template body is required" / "模板内容不能为空"
   - `savedReplies.error.softCap`: "Too many templates ({n}). Delete some first." / "模板过多（{n} 个）。请先删除一些。"
   - `savedReplies.error.quotaExceeded`: "Browser storage quota exceeded" / "浏览器存储空间已满"

2. **`src/ui/app.ts:291-L307`** — `addSavedReply()` returns the new i18n keys instead of hardcoded English. The `{n}` placeholder in `softCap` receives `SAVED_REPLIES_SOFT_CAP`.

3. **`src/ui/app.ts:5084`** — caller `setStatus(result.error ?? t("status.templateSaveFailed"), true)` works unchanged: `result.error` is now a translation key, but `setStatus` calls `t()` on the input. Need to verify `setStatus` does NOT pre-translate. Verified: `setStatus` signature is `setStatus(status: string)` and renders `t(status)` internally if the string starts with `status.`. Wait — `setStatus("name is required")` is rendered as verbatim English currently. Need to inspect `setStatus`.

4. New test `src/ui/r141-saved-replies-validation.test.ts` — 4 contract tests covering i18n keys + the validation paths.

5. Append R140 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/app.ts:291-L307` — 4 validation error returns
- `src/ui/app.ts:5084` — caller `setStatus(result.error ?? t(...))` — needs verification (does setStatus pre-translate?)
- `src/ui/i18n.ts` — 4 new keys
- `src/ui/r141-saved-replies-validation.test.ts` — new test

## Existing patterns

- `setStatus` accepts a string and renders it. If the string is a translation key (e.g., `t("status.X")`), it renders localized. If the string is arbitrary text, it renders verbatim. The current code passes `result.error ?? t("status.templateSaveFailed")` — so `result.error` is rendered verbatim unless we change it to a translation key.
- **The right fix**: change the validation return value to return an i18n key string (`"savedReplies.error.nameRequired"`), and update the caller to translate it: `setStatus(t(result.error) ?? t("status.templateSaveFailed"), true)`. This way, the error messages are translation keys instead of English copy, and `t()` resolves them per locale.

## Simplest change

Per call-site list above. ~12 LOC net (8 string additions + 4 caller changes). R103 invariant preserved (no emoji-only labels).

## Risk

- **Need to verify `setStatus` doesn't auto-translate**. Inspection required (maybe `setStatus(s: string)` treats any input as already-localized text and just renders it, in which case passing a key works; or `setStatus(s: string)` calls `t()` on any input, in which case we'd double-translate). The grep above confirms `setStatus` is called with both `t("status.X")` patterns and literal English. Resolution: check L5074's `setStatus(t("status.commentBoxEmpty"), true)` works — so `setStatus` requires already-translated text. So caller L5084 must wrap: `setStatus(t(result.error) ?? t("status.templateSaveFailed"), true)`.

## Acceptance

- `bun test src/ui/r141-saved-replies-validation.test.ts` passes (4–5 tests)
- Full suite stays green (was 1075, expect ~1080)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep '"name is required"\|"body is required"\|soft cap reached\|localStorage quota exceeded' src/ui/app.ts` returns 0 matches

## Profile

Polish. ≤3 files modified + 1 new test + 1 housekeeping append. UI text improvement, no behavior change. ~12 LOC net.