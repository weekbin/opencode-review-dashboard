# R83 — i18n: 5 conversation filter chip tooltips

## AC1
5 hardcoded `title="English"` attributes on `<button data-filter="X">` chips → `data-i18n-title="conversation.filter.X.title"`.

## AC2
5 new STRINGS keys added to i18n.ts (en + zh-CN).

## AC3
Regression test `src/ui/r83-conversation-filter-titles.test.ts` covers all 5.
