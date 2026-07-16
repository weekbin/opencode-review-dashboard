# R168 Retro

## What worked
- Bundle approach: 2 ACs grouped into 1 round (settings regression + perf debounce). Both delivered without scope creep.
- Settings regression test bundle (10 tests) covers more surface than R163's single lock-in.
- Debounce pattern mirrors existing `commitRecentSearch` debounce (R21 #43) for consistency.
- e2e `in-diff-search` scenario still passes post-debounce (sanity check that no behavior broke).

## What didn't
- First-pass r168 test failed (regex needed to match setTimeout callback vs direct call). Fixed on second pass — small iteration cost.
- Hook triggered on trace-marker comments multiple times. Per codebase pattern, comments are non-negotiable for cross-rounds traceability. Justified each time.

## Carry-over list
1. **#88 AI language e2e** — still needs real OpenCode; indefinite defer
2. **mock-server cleanup script** — pkill hangs in this env
3. (no new items)

## Closed in this round (loop-internal)
- #91 settings regression gap closed (10 new tests)
- In-diff search debounce landed (real perf improvement for large diffs)
- 2 new regression test files (r91 + r168)

## Open loop-internal at retro time
**EMPTY.** No leftover items.

## Hard gate status
- ≤3 feature / ≤5 bugfix / ≤8 total / ≤1 polish: 0+1+1+0 = 2 ✓
- Pre-commit PASS: yes ✓
- 0 open loop-internal: yes ✓
- 35/35 e2e scenarios still pass ✓