# R75 Retro

## What worked
- Simple constants extraction, clean TDD (RED → GREEN in 1 cycle)
- Pattern reuse from existing DIFF_SEARCH_FLASH_MS convention
- 4 tests verify declaration + usage

## What didn't
- TypeScript `as unknown as number` cast remains — pre-existing pattern, not worth refactoring

## Carry-over
- Other magic ms values (120, 250, 1000, 2100, 1500) are site-specific and not worth extracting yet
