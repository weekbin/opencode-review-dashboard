# R151 Research — clean 14 unused-variable warnings across 11 files

Lightweight-round compression (≤15 LOC + ≤11 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The audit that surfaced R151's scope:

```bash
bun run check 2>&1 | grep -B0 'no-unused-vars' | grep -oE 'src/[a-zA-Z0-9_/.]+\.ts:[0-9]+' | sort -u
```

Returns 15 unique warnings. Each was verified to have only 1 reference in `src/` (the declaration itself) via `grep -c "<name>" <file>`.

The cross-round repair (revert `contextHash` deletion) was discovered via:

```bash
git stash --include-untracked --quiet  # hide R151 changes
bun test src/r113-content-hash.test.ts src/r131-round-lock-on-approve.test.ts  # verify baseline
git stash pop --quiet  # restore R151 changes
bun test src/r113-content-hash.test.ts src/r131-round-lock-on-approve.test.ts  # compare
```

The 2nd run after restore showed 3 tests fail (R113 AC3 + R131 AC2 + R131 AC6) — all keyword-grep / windowed-slice tests that depend on `contentHash` function body content + line numbers. Reverted `contextHash` deletion; kept the function as a test fixture.

Per-SHIP append discipline preserved.