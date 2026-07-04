# R109 — sibling test anti-pattern refactor

## what shipped
9 sites across 3 test files refactored from literal `/t\(\"KEY\"\)/` to
structural `/(?:t\(\s*)?[\"']KEY[\"'](?:\s*\))?/`. same test value
("key is referenced in source"), wider acceptance of wiring form.

## what went well
- the refactor is non-functional — same assertion semantic, wider form
  acceptance. all tests pass without any source change.
- one bug found and fixed during the refactor: first regex dropped the
  optional `t\(` wrapper, which broke tests against `textContent = t(\"X\")`
  source patterns. added the optional group.

## lessons
- structural refactors need careful regex backward-compat for the EXISTING
  source patterns. swapping `/t(\"KEY\")/` for `/[\"']KEY[\"']/` is NOT
  structurally equivalent — the original required `t(` prefix and `)`
  suffix in the source. the correct structural pattern keeps those optional.

## loop-internal open
none.
