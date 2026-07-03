# R75 Research

Follows the DIFF_SEARCH_FLASH_MS = 1500 (app.ts:672) idiom — named constant near the top, used by site.

## Simplest change
- Add `const COPY_FEEDBACK_MS = 1200;` and `const PERMALINK_FLASH_MS = 1600;` near DIFF_SEARCH_FLASH_MS at L672
- Replace `}, 1200) as unknown as number;` × 3 with `}, COPY_FEEDBACK_MS) as unknown as number;`
- Replace `}, 1600) as unknown as number;` × 1 with `}, PERMALINK_FLASH_MS) as unknown as number;`

## Risk
- 1 src/ file, ~10 LOC net (4 substitutes + 2 declarations)
- Zero behavior change (literal values preserved)
- Future tuning easier (1 number change vs 4)

## Test coverage
4 tests verify:
1. COPY_FEEDBACK_MS constant exists with value 1200
2. 3 copy-button sites use the constant (not literal 1200)
3. PERMALINK_FLASH_MS constant exists with value 1600
4. flashFindingPermaHighlight uses the constant

Pattern matches R61/r61-v6-lockin-validation.test.ts which asserts presence/value of v6 spec constants.
