R109 — gap #6 fix: sibling test anti-pattern.

audit of test files for literal `t\(\"X\.Y\"\)` regex markers found 9
confirmed sites across 3 files:

- src/r16-features.test.ts (7 sites: T16.7c, T16.7d, T16.11a, T16.13a,
  T16.13b, T16.17a, T16.17b)
- src/saved-replies.test.ts (1 site: T10.2b)
- src/r17-features.test.ts (1 site: T17 help-modal)

each literal `/t\(\"key\"\)` pattern breaks if the call-site form changes
(e.g., R84 added 7 keys; R87 changed action.mark to `t("action.mark")`;
R91 same pattern repeated; R95 changed aria-label to data-i18n-aria-label).

the structural invariant we actually want is: "the key NAME appears in
source code as an i18n argument". that survives any of:
- `t\(\"KEY\"\)` call form
- `data-i18n=\"KEY\"` attribute
- `data-i18n-title=\"KEY\"` attribute
- `data-i18n-aria-label=\"KEY\"` attribute
- any future wiring pattern that takes a key string
