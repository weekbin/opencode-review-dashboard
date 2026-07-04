# R84 — i18n: 9 hardcoded English strings in app.ts

## What shipped
9 hardcoded English strings in app.ts replaced with t() calls. 6 new STRINGS entries (en + zh-CN). 1 regression test (r84-app-ts-i18n.test.ts). 1 sibling test marker updated (R73).

## What went well
- Atomic Python script applied all 9 replacements in one pass (9/9 OK)
- All 6 new i18n keys verified unique (no double-apply bug this round)

## What was harder than expected
- R73 test broke because it used `showToast("Copied as Markdown")` as a literal marker for the surrounding copyAsMarkdown block. After R84 replaced it with `showToast(t("status.copiedMarkdown"))`, R73's `indexOf("Copied as Markdown")` returned -1. Updated R73's marker to `t("status.copiedMarkdown")` — same test contract, just matched against the new code.
- oxfmt silently reformatted the new test file (R84) on first write. The reformat did not break the test contract, but exposed a gap: bunx oxfmt can reformat files the test author didn't expect, which is a structural fragility for tests that match on exact source patterns.

## Loop-internal open
NONE.
