# R75 Discovery

R74 carry-over: empty (R73-R74 sweep closed).

Fresh scan: 4 magic timeout values were repeated 3× in copy-button handlers (R73) and 1× in flashFindingPermaHighlight (R74):
- 1200ms in copyFindingPermalinkToClipboard, copyFindingAsMarkdown, copyBranchNameToClipboard (3 sites)
- 1600ms in flashFindingPermaHighlight (1 site)

The existing pattern uses DIFF_SEARCH_FLASH_MS = 1500 (app.ts:672) as a named constant — but only 1 of the 4 sites uses this idiom. The other 4 use raw literals.

Selected scope: extract COPY_FEEDBACK_MS = 1200 + PERMALINK_FLASH_MS = 1600 named constants. TDD-strict (4 tests).
