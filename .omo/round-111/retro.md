# R111 — arc finalization

## what shipped
src/r106-test-count-snapshot.json re-baseline (775 → 783) with note
documenting the walker-vs-bun discrepancy. no production code change.

## arc recap (R82-R111 = 30 rounds)
- R82-R101 (20 rounds): i18n cleanup. 105+ hardcoded English strings →
  i18n.ts STRINGS keys + t() calls. ~250 STRINGS rows total (3 locales
  en + zh-CN + scope for ja-JP expansion if pursued).
- R102-R111 (9 rounds): gap-fix arc addressing 10 self-identified
  concerns:
  - pre-commit robustness (#1)
  - i18n coverage + translation completeness (#3+#5)
  - en fallback path (#4)
  - sibling test anti-pattern (#6)
  - production build staleness (#7)
  - mock-server regression coverage (#8)
  - test count drift (#9)
  - .omo/round-* v6 conformance (#10)
  - zh-CN i18n smoke proxy (#2 lightweight)

## lessons (arc-wide)
- never run a closed loop without a snapshot/test that catches silent
  regressions. gap #1 (oxfmt silent reformat) and gap #3 (zombie
  t() calls) both shipped silently for many rounds before being caught.
- structural invariants (regex patterns, count drift) are more durable
  than content-equality checks.
- anti-patterns propagate: literal `t("KEY")` test markers across 9+
  test files required explicit refactor. lesson: lock the structural
  invariant first, write the literal form afterward.

## loop-internal open
none.
