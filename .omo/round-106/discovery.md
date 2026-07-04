R106 — loop gap #9 fix: per-file test count drift detection.

audit of 22 i18n rounds (R82-R101) plus 4 gap-fix rounds (R102-R105) found
no test-count invariant. silent truncation of `it()` / `test()` calls by
oxfmt --write (or accidental edits) would be invisible — tests still
exist as files, but the case count quietly drifts.

baseline established at 775 tests across ~87 .test.ts files. snapshot
recorded at `src/r106-test-count-snapshot.json` with regex
`/\b(?:it|test)\(\s*['"]/g` for reproducibility.
