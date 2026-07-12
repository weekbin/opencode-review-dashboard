# R146 Research — localize 3 remaining hardcoded English strings in `src/ui/review.html`

Lightweight-round compression (≤50 LOC + ≤3 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The audit grep that surfaced C1:

```bash
grep -nE '>[A-Z][a-z]+( [a-z]+){1,}|placeholder="[A-Z]|aria-label="[A-Z]|title="[A-Z]' src/ui/review.html
```

Returns 4 matches. The L3719 placeholder match is `placeholder="What should change and why?"` from R145's textarea — that already has `data-i18n-placeholder="comment.placeholder"`. The raw `placeholder` attribute is kept as a fallback for non-i18n consumers.

The remaining 3 real hardcoded English strings:

| Line | String | Element | Key state |
|---|---|---|---|
| L3385 | `All changes saved` | `<span id="save-indicator">` | `save.idle` key exists, attr missing |
| L3665 | `All rounds` | `<option value="all">` | needs new key `previously.filter.allRounds` |
| L3782 | `Diff virtualization` | `<label for="settings-virtualization">` | `settings.virtualization.label` key exists, attr missing |

The R133 `data-i18n` + `initUIDataI18nAttributes()` MutationObserver infrastructure handles live translation for the 3 new `data-i18n` attributes. No new infrastructure needed.

R103 invariant preserved: `en !== zh-CN` for the new key. Both already-keyed strings (`save.idle`, `settings.virtualization.label`) already pass the invariant per existing i18n.ts entries.

AC1.2 registerUITranslator invariant: 3 paired `registerUITranslator()` calls added atomically with the 3 new attrs (per the R19 retro invariant + R145 lesson).