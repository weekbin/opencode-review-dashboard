# R104 — production build verification

## what shipped
`src/r104-build-dist-staleness.test.ts` with 3 tests:
- dist/ui/app.js exists
- dist bundles 6 sample STRINGS rows from recent rounds
- dist/ui/review.html contains a recent data-i18n-title attribute

manual `bun run build` confirmed pipeline works. dist updated from
jun 23 to jul 4 (was stale before R104).

## what went well
- namespaced-key pattern (R103) reused for the sample subset
- dev-mode guard via `existsSync` so pre-commit doesn't gate-block
  when dist/ hasn't been built

## what was harder than expected
- choosing the right sample. too-small = false-pass; too-large = brittle.
  6 keys spanning R82/R88/R97/R103 is enough confidence for a smoke test.

## lessons
- two-version drift (src vs dist) is invisible until production. the
  test catches "I forgot to rebuild" deterministically.

## loop-internal open
none.
