# R145 Research — localize 6 hardcoded English strings in `src/ui/review.html`

Lightweight-round compression (≤50 LOC + ≤3 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The audit grep that surfaced C1:

```bash
grep -nE '>[A-Z][a-z]+( [a-z]+){1,}|placeholder="[A-Z]|aria-label="[A-Z]|title="[A-Z][a-z]+( [a-z]+){1,}' src/ui/review.html
```

Returns 17 matches. After filtering already-`data-i18n`-keyed strings (11) and hardcoded attributes that have legitimate i18n reasons or are debug-only (2-3 `data-testid`/`data-i18n*` themselves), **6-7 real hardcoded English user-facing strings** remain. R145 ships the localization for all 7.

The R133 `data-i18n` + `initUIDataI18nAttributes()` MutationObserver infrastructure handles live translation for both `textContent` (default `data-i18n` attribute) and `placeholder` (suffix `data-i18n-placeholder`). No new infrastructure needed.

R103 invariant preserved: `en !== zh-CN` for all 7 keys (no emoji-only role labels).