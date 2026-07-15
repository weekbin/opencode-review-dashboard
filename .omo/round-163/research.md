# R163 Research

## #1 R89 range-banner [hidden] CSS test
- Source: `src/ui/review.html:241-258` (`.range-banner` block). New rule at line 258+.
- Test pattern: existing `r43-feedback.test.ts:42-54` (matches `.range-banner { ... }` body). Mirror the same regex match for the new `[hidden] { display: none }` rule.

## #2 R90 sidebar-mode button padding test
- Source: `src/ui/review.html:1366-1389`. Updated padding 5px→3px, font 14px→13px.
- Test: extract `.sidebar-mode button { ... }` block, assert `padding` contains `3px` (or 2-4px range) and `font-size: 13px`.

## #3 R88 locale in draftPayload test
- Source: `src/ui/app.ts:6393-6420`. New `locale: peekLanguage()` field.
- Test: extract `function draftPayload`, assert body contains `locale: peekLanguage()` or equivalent.

## #4 R92 round counting fingerprint test
- Source: `src/index.ts:2649-2663` (the new fingerprint comparison block). Round = 1 when fingerprints differ, base.round+1 when same.
- Test: extract the relevant block, assert (a) `sameDiffBase` boolean check, (b) `round = sameDiffBase ? base.round + 1 : 1` ternary pattern, (c) `${base.diff_base.type}:${base.diff_base.from}` fingerprint pattern.

## #5 R91 settings Save + toast test
- Source: `src/ui/review.html:3823-3832` (footer buttons) + `src/ui/app.ts:1896-1907` (Save click handler).
- Test: extract settings footer HTML, assert `id="settings-ok"` has `data-i18n="settings.save"` and `id="settings-cancel"` exists. Extract click handler, assert `showToast` is called.

## #6 Remove unused `join` import
- Source: `src/ui/r80-arc-validation.test.ts:5` (`import { join } from "node:path"`)
- After R162 path fix, `join` is no longer used in the file. oxlint warning: `no-unused-vars`.
- Fix: remove the import line.

## Files to modify
1. `src/ui/r89-range-banner-hidden.test.ts` (new)
2. `src/ui/r90-sidebar-mode-padding.test.ts` (new)
3. `src/ui/r88-submit-locale.test.ts` (new)
4. `src/ui/r92-round-fingerprint.test.ts` (new)
5. `src/ui/r91-settings-save.test.ts` (new)
6. `src/ui/r80-arc-validation.test.ts` (drop 1 import)

## Risk
- New test files might conflict with existing test patterns. Mitigation: mirror existing test style (regex match on source), keep it concise.
- Removing `join` import: 0 risk if no usage (verified via grep).