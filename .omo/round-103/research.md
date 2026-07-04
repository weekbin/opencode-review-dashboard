# R103 — research

two-test approach:

test 1: extract namespaced `t("X.Y")` calls from src/ui/*.ts (regex requires
`[a-zA-Z][a-zA-Z0-9_]+\.[a-zA-Z0-9._]+` so we filter out JSX attribute values,
method calls like `classList.toggle("X")`, and bare-word strings like `t("foo")`).
extract `"X.Y":` keys from src/ui/i18n.ts. assert all t-call keys are defined.

test 2: for every STRINGS row in i18n.ts, regex-match the next 400 chars
(handles multi-line rows). assert non-empty `en` and `zh-CN`. assert
en !== zh-CN.

named-key extract approach: read i18n.ts once, find all `"key":` patterns,
build Set<string>. namespaced regex prevents false-positives from
strings inside JSX/template literals that look like `t("X")`.

false positives observed in earlier inventory:
- .finding (regex broke: template literal inside template literal)
- "input", "div", "foo", "hello" — not t() calls, just bare-word strings inside
  template literals that happen to match `t\("...")` regex.
- "classList.toggle(\"X\")" — method call, filtered by `\bt\(`.
fixed by requiring `X.Y` (dot in key name).
