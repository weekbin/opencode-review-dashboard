# R168 Brief

## Scope
2 ACs:
1. **#91 settings modal regression test bundle** — 5 tests covering Save/Cancel/Reset/topbar-hide/gear-icon
2. **Performance: in-diff search debounce** — wrap `findMatchesInDiff` call in 150ms debounce + 1-2 regression tests

## Why
- #91 only has 1 lock-in test from R163. R162's overhaul (Save button, toast, topbar consolidation) needs more coverage.
- Per-keystroke DOM scan is a real perf issue for large diff files.

## Per-AC acceptance

1. **#91 AC1** — `src/ui/r91-settings-behavior.test.ts` test "settings cancel button does NOT show toast". Closes bug-fix-regression gap.
2. **#91 AC2** — same test file: "settings Save button click closes the modal" (functional contract).
3. **#91 AC3** — same: "Reset button restarts defaults". (Settings reset is small but the test locks in the wiring.)
4. **#91 AC4** — same: "topbar layout/theme/language toggles are all hidden". Confirms R162 consolidation.
5. **#91 AC5** — same: "settings-btn contains <svg> gear icon (no text <span>)". Confirms R43 fix didn't regress.
6. **Perf AC6** — `src/ui/r168-diff-search-debounce.test.ts` 2 tests:
   - `runSearch` callback uses a debounced wrapper around `findMatchesInDiff` (regex match on app.ts)
   - `findMatchesInDiff` is NOT called synchronously per keystroke (regex match)

## Risk
LOW. Tests are additive. Debounce is a small code change in a well-understood function.

## Verification
- `bash .husky/pre-commit` 9/9 PASS
- `bun test` includes both new test files (7 new tests)
- E2e suite still 35/35 (debounce shouldn't affect anything that depends on synchronous search)

## Profile
1 bugfix (debounce) + 1 polish (regression test bundle) = 2 ACs total. Under hard caps.