R103 — loop gap #3 + #5 fix: i18n coverage + translation completeness.

audit of r79-r101 (23 rounds, 70+ new STRINGS keys) found two structural blindspots
in the existing i18n.test.ts:

gap #3 — ZOMBIE USE: tests don't verify that every `t("X")` callsite has a
matching key in i18n.ts. silent failure mode: t("missing.key") falls back to
literal "missing.key" in the UI. zh-CN users see raw key names. en users are
unaffected (since `t(key)` falls back to the key itself only when no row
exists, and that fallback is the key string — visible to zh-CN users).

gap #5 — TRANSLATION COMPLETENESS: i18n.test.ts asserts en/zh-CN are truthy
but does NOT catch the case where en === zh-CN (forgot to translate).

R103 test file found 7 real zombie t() calls without matching i18n.ts keys
(status.commentAdded, status.commentTooLong, status.copiedAsMarkdown,
status.copyMarkdownBlocked, status.failedAddComment, status.noChangesToSave,
status.noReviewData). All silently fell back to leaking the key string into
the UI — invisible bug, ~ 0.05s latency to users.
