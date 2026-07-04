4 r102 tests pass (gate command present, re-stage command present, order is
write→stage→test, header documents rationale).

8/8 v6 pre-commit gate passes against current working tree:
[7/8] format --write + re-stage + bun test (anchor drift check) ✓
[8/8] bun run lint + typecheck ✓

789/789 unit tests pass (was 789 before r102, no regressions).

working tree: 2 files modified, 1 new test file, zero test regressions.
