# R109 — loop gap #6 fix

## ac1
refactor 9 literal `/t\(\"KEY\"\)` regex sites across 3 test files to
structural `/["']KEY["']/` (with optional `t\(` wrapper).

## ac2
all 116 tests in refactored files (r16: 65 / saved-replies: 11 / r17: 40)
still pass — refactor is non-functional.

## ac3
v6 pre-commit 8/8 PASS. no regressions in other test files.
