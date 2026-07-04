# R107 — en fallback path

## what shipped
3 new tests appended to i18n.test.ts (AC1.6) that iterate over the full
~200 STRINGS rows and assert en + zh-CN values match, and that no row
collapses to the literal key.

## what went well
- building on existing AC1.2 pattern — extending i18n.test.ts rather
  than creating a new file
- iterate-over-STRINGS pattern naturally surfaces errors (the failures
  array lists exactly which key got wrong output)

## what was harder than expected
- tsc with noUncheckedIndexedAccess: `STRINGS[key]` is `Record<Lang, string>
  | undefined`. access `.en` directly errors. needed explicit `if (!row)
  continue;` guard. same pattern from R103/R105 applied here.

## lessons
- small-property-level tests (AC1.2: 2 keys) found nothing but a large
  full-table scan would have caught an en typo. correlation: a sample of 2
  is not a test, it's an example.

## loop-internal open
none.
