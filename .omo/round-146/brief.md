# R146 Brief — localize 3 remaining hardcoded English strings in `src/ui/review.html`

## Scope

1. **`src/ui/i18n.ts`** — add 1 new key × 2 locales = 2 strings:
   - `previously.filter.allRounds`: en="All rounds" / zh-CN="所有轮次"
   (`save.idle` and `settings.virtualization.label` already exist AND are already wired in review.html + app.ts — false positives in the audit grep.)

2. **`src/ui/review.html`** — add 1 `data-i18n` attribute:
   - L3665: `<option value="all">` → `data-i18n="previously.filter.allRounds"`

3. **`src/ui/app.ts`** — add 1 paired `registerUITranslator()` call (R19 retro AC1.2 invariant):
   - `registerUITranslator("previously.filter.allRounds", () => t("previously.filter.allRounds"));`

4. **`src/ui/r146-review-html-i18n.test.ts`** — 2 contract tests covering: (a) `previously.filter.allRounds` i18n key declared, (b) review.html has the `data-i18n` attr on L3665.

5. Append R145 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/i18n.ts` — 1 new key
- `src/ui/review.html` — 1 `data-i18n` attribute addition
- `src/ui/app.ts` — 1 `registerUITranslator()` call (AC1.2 invariant)
- `src/ui/r146-review-html-i18n.test.ts` — new test file
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The R145 `data-i18n` auto-discovery handles `textContent` for any HTML element.
- `initUIDataI18nAttributes()` MutationObserver (R133) handles live translation for both `data-i18n` and `data-i18n-placeholder`/title/aria-label attributes.
- `registerUITranslator(key, () => t(key))` is the AC1.2 invariant registration pattern (R19 retro).
- `save.idle` and `settings.virtualization.label` are already used in app.ts (per `grep`), so the i18n keys are well-tested.

## Simplest change

Per call-site list. ~6 LOC net (2 strings + 3 `data-i18n` attribute additions + 3 translator registrations).

## Risk

- **No server changes.** All strings are pure UI text.
- **R103 invariant preserved**: en ≠ zh-CN for the new key; both already-keyed strings already pass the invariant.
- **No brittle-test upgrade needed** — no existing test asserted the old English strings at these 3 sites.
- **AC1.2 invariant honored**: 3 paired translator registrations added atomically with the 3 new attrs.

## Acceptance

- `bun test src/ui/r146-review-html-i18n.test.ts` passes (2 tests)
- Full project suite stays green (was 1086, expect ~1088)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -E 'data-i18n="previously\.filter\.allRounds"' src/ui/review.html` returns 1 match
- `grep -E 'value="all">All rounds</option' src/ui/review.html` returns 0 matches outside the data-i18n attribute

## Profile

Polish. ≤3 files modified + 1 new test + 1 housekeeping append. UI text improvement, no behavior change.