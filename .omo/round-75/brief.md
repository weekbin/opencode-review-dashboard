# R75 Brief

**Scope**: Extract 2 magic timeout values (1200×3, 1600×1) into named constants. Follows existing DIFF_SEARCH_FLASH_MS idiom at app.ts:672.

**Acceptance**: 4 tests pass; bash .husky/pre-commit → 8/8 PASS; 702/702 tests.
