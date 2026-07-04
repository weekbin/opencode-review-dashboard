# R109 — research

regex transformation:
- old: `/t\(\"X\.Y\"\)/` (matches the literal `t(\"X.Y\")` form only)
- new: `/(?:t\(\s*)?[\"']X\.Y[\"'](?:\s*\))?/` (matches both `t(\"X.Y\")`
  and literal `\"X.Y\"` in any context)

the optional groups `(?:t\(\s*)?` and `(?:\s*\))?` permit either:
- `t(\"KEY\")` calls (with parens)
- bare `\"KEY\"` strings (without wrapping)

applies to inline attributes too:
- `title=\"KEY\"` (HTML attribute, no `t()` wrapper) — only the `[\"']KEY[\"']` part matters.

the helper file approach (R109 attempt 1, deleted) was overengineering for
9 sites. inline regex keeps the change footprint minimal.

bug fixed during the refactor: first attempt's regex required the quoted
key IMMEDIATELY after `=` or `? `, but the source has `textContent = t(\"X.Y\")`
with `t(` between. added the optional `(?:t\(\s*)?` group.
