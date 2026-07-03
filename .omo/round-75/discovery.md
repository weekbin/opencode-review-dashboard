# R75 Discovery

R74 carry-over: empty.

Fresh scan: 4 magic timeout values (1200ms × 3, 1600ms × 1) that were introduced by R73 (copy buttons) and R74 (flash function) should be named constants for clarity. Already named: `DIFF_SEARCH_FLASH_MS = 1500` (app.ts:672).

Pattern follow the existing convention: `const FOO_MS = N` near other related constants.

Selected scope: 2 new constants + replace 4 literal uses. 1 round.
