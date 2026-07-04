# R103 — loop gap #3 + #5 fix

## ac1
regression test `src/r103-i18n-coverage.test.ts` asserts every namespaced
`t("X.Y")` callsite in src/ui/*.ts has a matching i18n.ts key (gap #3).

## ac2
same test asserts every STRINGS key has BOTH non-empty `en` AND `zh-CN`
(gap #5 completeness).

## ac3
same test asserts every STRINGS key has `en !== zh-CN` (catches
forgot-to-translate).

## ac4
discovered 7 real zombie t() calls (status.commentAdded,
status.commentTooLong, status.copiedAsMarkdown, status.copyMarkdownBlocked,
status.failedAddComment, status.noChangesToSave, status.noReviewData).
added to i18n.ts with en + zh-CN.

## ac5
8/8 v6 pre-commit PASS (includes the new format-write anchor-drift check from R102).
