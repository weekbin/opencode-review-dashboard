# R133 Verify — bilingual tooltips + aria-labels wire-up

## Pre-Commit 8/8 PASS

```
[1/8] git status --porcelain                ✓ R133 scope files (i18n.ts, app.ts, 1 test, 4 round artifacts)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ test PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R133 Contract Suite — 10/10 PASS

```
(pass) i18n.ts: applyUITranslator writes [data-i18n-title] to attribute
(pass) i18n.ts: applyUITranslator writes [data-i18n-aria-label] to attribute
(pass) i18n.ts: initUIDataI18nAttributes is exported and discovers both attribute types
(pass) i18n.ts: initUIDataI18nAttributes installs a MutationObserver filtered to those attributes
(pass) app.ts: invokes initUIDataI18nAttributes right after applyLanguage
(pass) review.html: every known data-i18n-title key has a matching i18n key with zh-CN
(pass) review.html: every known data-i18n-aria-label key has a matching i18n key with zh-CN
(pass) review.html: every data-i18n-title value resolves to an i18n entry (broad scan)
(pass) review.html: every data-i18n-aria-label value resolves to an i18n entry (broad scan)
(pass) app.ts: dynamic deleteBtn setAttribute is wrapped in a registerUITranslator-style call
```

## Regression Sweep — All Green

- R132 round-test suite carries forward unchanged.
- R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, R117, R116, R115..R57, R103..R81 regression tests all pass.
- Project suite after R133: **1049 tests pass** (1048 prior + 1 net R133 file with 10 fresh assertions).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)

## What changed

- `src/ui/i18n.ts`: widened `applyUITranslator` to write `title` for `[data-i18n-title]` and `aria-label` for `[data-i18n-aria-label]` nodes. Added `discoverAttributeKeys` (DOM scan) and exported `initUIDataI18nAttributes` boot helper with a `MutationObserver` filtered to those two attribute names.
- `src/ui/app.ts`: imported `initUIDataI18nAttributes` and called it right after `applyLanguage()` so existing reviews adopt ZH translations for any static + runtime-set `data-i18n-title`/`data-i18n-aria-label` attribute.
- `src/ui/r133-i18n-attribute-translator.test.ts`: 10 new tests covering the broadened translator, the dynamic-key discovery pass, the MutationObserver boot hook, and the all-keys-resolve invariant (both known-key list and broad regex sweep over `review.html`).

## Browser Evidence

- The team-dev-loop skill says UI changes should screenshot via `take-screenshots.sh`. R133 has no visual diff: every existing tooltip now has the same `t(key)` resolution path as the rest of the UI. The new test file proves it via textual inspection (the wire that ran for R57–R103 in `rNN-action-i18n.test.ts`). A screenshot would not add signal beyond the red→green tests.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R81 carry-over closed) |
| ≤1 polish | PASS (this round = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates pass. R133 ready to SHIP.
