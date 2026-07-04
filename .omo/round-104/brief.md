# R104 — loop gap #7 fix

## ac1
`bun run build` verified working — dist/ui/app.js contains all r103 keys
(commentAdded, copiedAsMarkdown, noReviewData, etc.).

## ac2
`src/r104-build-dist-staleness.test.ts` ships with 3 regression tests:
- test 1: dist/ui/app.js exists (or skip in dev mode)
- test 2: dist bundles 6 sample STRINGS rows from R82/R88/R97/R103
- test 3: dist/ui/review.html contains a recent data-i18n-title (R82)

## ac3
v6 pre-commit 8/8 PASS. regression test catches "source changed but dist
stale" failure mode.
