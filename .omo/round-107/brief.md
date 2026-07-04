# R107 — loop gap #4 fix

## ac1
add 3 tests to `src/ui/i18n.test.ts` as describe("AC1.6 — comprehensive...")
that iterate over `Object.keys(STRINGS)` and assert:
1. translate(key, "en") === STRINGS[key].en for every key
2. translate(key, "zh-CN") === STRINGS[key]["zh-CN"] for every key
3. translate(key, "en" | "zh-CN") !== key for every key (no silent collapse)

## ac2
all 3 new tests pass against the full STRINGS table (~200 rows). v6
pre-commit 8/8 PASS.
