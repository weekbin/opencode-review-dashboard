# R113 Retro

## What worked

TDD end-to-end preserved across 3 features + 1 polish (10 new tests, all GREEN). Lead-direct 100%. All 4 changes localized to ≤6 files. Schema extensions (`close_reason` with `content_match`, `submitFootprint` setting, `confirmDeleteDraft` helper) are all additive and backward-compatible. Hard cap honored (3 features + 1 polish = 4 ≤ 8).

## What didn't

AC6 modal HTML-order test exposed a subtle indexOf-boundary interaction: when AC6's `blockEnd = src.indexOf("</div>\`", blockStart)` runs against my earlier code, the inner footprint template literal ended with `</div>\`` BEFORE the outer `dialog.innerHTML` template literal — so blockEnd truncated the block before finding-count could be found. Fixed by converting the footprint HTML to string concatenation (no nested template literal) and inlining the IIFE. Lesson: **template literals inside a baseline-check window must not terminate with `</div>\`` if a sibling template literal follows**.

## Carry-over list

- (none — all loop-internal items closed in this round)

## Closed in this round (loop-internal)

- R105 conformance pre-commit failure: caused by missing round-113/ artifacts, fixed by writing verify/retro/decision before commit
- src/prior-notes.test.ts schema-snapshot miss for content_match: updated inline with documented rationale (R113 #77 additive extension)
- AC6 baseline-check truncation: refactored submitFootprint HTML to string concatenation, restored correct element order
- src/ui/i18n.ts duplicate-key churn during R113 mid-round edits: cleaned via grep + dedup to 1 of each footprint/deleteDraft key

## loop-internal open

none.