# R107 — research

existing AC1.2 covers 5 cases (en-1key, zh-CN-1key, missing-key,
unsupported-lang, placeholder). R107 adds AC1.6 with 3 cases over the
full STRINGS table:
1. every row resolves to its en field
2. every row resolves to its zh-CN field
3. zero rows collapse to the literal key (silent-failure mode)

scope is the existing i18n.test.ts file. STRINGS already imported (L26).
no new files needed.

tsc pitfall: `STRINGS[key]` is `Record<Lang, string> | undefined` under
noUncheckedIndexedAccess. access `.en` requires explicit guard. fixed with
`if (!row) continue;` early-return.
