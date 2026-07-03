# R70 Research

Pattern matches R57-R67: dynamic innerHTML → t() call with escapeHtml.

i18n.ts naming: `palette.cmdP.placeholder`, `modal.{reopen,resolve,wontfix}Reason.placeholder` (category-prefixed, matches earlier R67 convention).

## Simplest change
- i18n.ts: +4 keys (en + zh-CN for each)
- app.ts:1125 Cmd+P palette placeholder
- app.ts:2325 reopen reason textarea
- app.ts:2390 resolve reason textarea
- app.ts:2481 wontfix reason textarea

## Risk
- 1 i18n + 1 src/ file, ~10 LOC
- Zero behavior change beyond localization
- Textareas don't use `params` so simple `t("key")` calls (no interpolation)
