# R142 Research — close R141 retro #2 (byte-equivalence test audit + SOP)

Lightweight-round compression (≤50 LOC + no behavior change): research lives inline in `brief.md` ## Findings / ## SOP sections.

Audit mechanism already executed during discovery:

```bash
grep -nE 'expect\(.*\)\.toMatch\(/"' src/*.test.ts
```

Returns 30+ matches. After filtering benign shapes (i18n key assertions, server protocol strings, regex patterns on key shapes), 4 candidate sites remain. Each was inspected for:

1. **Is the asserted text a current contract** (user-visible) **or an implementation detail** (internal)?
   - Current contract → i18n-coupling (legitimate, updates atomically)
   - Implementation detail → genuinely brittle (upgrade to behavior-contract)

Result: 4/4 sites are i18n-coupling. Zero truly-brittle byte-equivalence assertions found.

The 4 sites will all break together if/when we localize the corresponding UI strings (English → bilingual). That's intended behavior: per the v6 SOP and the R137→R141 precedent, the test update goes in the same SHIP commit as the i18n change.

No file modifications needed for R142 beyond the 6 v6 round artifacts.