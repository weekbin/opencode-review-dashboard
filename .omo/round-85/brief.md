# R85 — i18n: 3 hardcoded empty-state messages in app.ts

## AC1
3 hardcoded "No X yet" / "No X — Y" empty-state messages in app.ts replaced with t() calls. "No findings yet." appears 2x and uses the same key.

## AC2
3 new STRINGS keys added to i18n.ts (en + zh-CN).

## AC3
2 existing tests (saved-replies.test.ts, previously-hint.test.ts) updated to use t() markers. 1 new R85 test covers all 3 sites.
