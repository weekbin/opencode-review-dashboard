# R163 Brief

## Scope
6 housekeeping ACs (1 polish + 5 housekeeping): 5 new regression tests covering R162's 8 ACs + 1 lint cleanup. No behavior changes. No production source changes.

## Why
R162 shipped 8 ACs but only added regression tests by accident (via R149 orphan audit + AC1.2 registerUITranslator). Without tests for the core fixes, future refactors can silently regress them. This round locks in the 5 most testable ACs (#89, #90, #88, #92, #91) and cleans up the lint warning introduced in R162's R80 path fix.

## Per-AC acceptance

1. **#89 regression** — `bun test src/ui/r89-range-banner-hidden.test.ts` passes. Test extracts the `.range-banner { ... }` block from review.html and asserts `[hidden]` rule with `display: none` is present.
2. **#90 regression** — `bun test src/ui/r90-sidebar-mode-padding.test.ts` passes. Test extracts `.sidebar-mode button { ... }` and asserts `padding` is `3px 10px` and `font-size: 13px`.
3. **#88 regression** — `bun test src/ui/r88-submit-locale.test.ts` passes. Test extracts `draftPayload` body and asserts `locale: peekLanguage()` is present.
4. **#92 regression** — `bun test src/ui/r92-round-fingerprint.test.ts` passes. Test extracts the round-computing block in `/submit` handler and asserts the fingerprint comparison + ternary pattern.
5. **#91 regression** — `bun test src/ui/r91-settings-save.test.ts` passes. Test asserts `settings-ok` has `data-i18n="settings.save"` and click handler calls `showToast`.
6. **#6 lint** — `bun run lint` no longer warns about unused `join` in r80-arc-validation.test.ts.

## Risk
LOW. All test files are additive. The only existing file edit is a 1-line import removal (zero behavior change).

## Verification
- `bash .husky/pre-commit` 9/9 PASS
- `bun test` 1124 pass (5 new tests, 0 regression)
- `bun run check` clean
- `bun run build` clean

## Profile
polish+housekeeping (5 housekeeping + 1 polish) — no src/ behavior changes, only test/ + 1 import.