# R103 — i18n coverage + translation completeness

## what shipped
regression test `src/r103-i18n-coverage.test.ts` with 3 tests covering:
- gap #3: every namespaced t("X.Y") call has a matching i18n.ts key
- gap #5: every STRINGS row has non-empty en + zh-CN
- gap #5: en !== zh-CN (catches forgot-to-translate)

discovered 7 real zombie t() calls during R103. all added to i18n.ts.

## what went well
- namespaced-key regex filter (`[a-zA-Z][a-zA-Z0-9_]+\.[a-zA-Z0-9._]+`) eliminates
  false positives from JSX attributes and bare-word strings.
- 400-char `extractRow` window handles multi-line STRINGS rows.

## what was harder than expected
- tsc with `noUncheckedIndexedAccess` complains about `m[1]` and `enMatch[1]`
  being `string | undefined`. added explicit guards (`if (!enMatch[1])`).
- the test reveals prior rounds (r82-r101) shipped zombie references.
  upstream rounds shipped `t("foo")` calls in app.ts without adding the
  matching i18n.ts row. now structurally caught at gate time.

## lessons
- pure-static-tokens-as-marker tests (r73/r79/r81/r91) = sibling-test anti-pattern,
  because every i18n round breaks them. but the inverse — pure key-set diff — is
  robust because the regex anchors on syntax not content.
- i18n bugs are invisible in en sessions (the fallback IS the key string, which
  to a developer reads like a normal identifier). only zh-CN users catch them.

## loop-internal open
none.
