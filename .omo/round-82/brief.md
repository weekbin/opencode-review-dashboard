# R82 — i18n: 8 remaining hardcoded English title="..." attributes

## AC1
8 hardcoded `title="English"` attributes in review.html replaced with `data-i18n-title="i18nKey"`.

- Group 1 (top toolbar, 4): save indicator, layout toggle x2, submit-review
- Group 2 (left sidebar + conversation + previously, 4): sidebar mode x2, sort findings, previously filter

## AC2
8 new STRINGS keys added to i18n.ts (en + zh-CN).

## AC3
Regression test `src/ui/r82-review-html-titles.test.ts` covers all 8 sites + 8 i18n keys.
