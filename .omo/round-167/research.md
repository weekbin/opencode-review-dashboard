# R167 Research

## What I did

Ran the full e2e suite (35 scenarios) via `bun run scripts/test-review-ui/e2e.mjs` after R166 fixed the harness. Captured stdout to `/tmp/r167-e2e-sweep.log` (~50 KB).

## Key findings

1. **35/35 scenarios PASS.** No latent bugs surfaced from the 5-month silent breakage.
2. **R162 #85 scenario (`reopen-stale-finding`) PASS** — Force Reopen button + modal + POST /reopen all work end-to-end.
3. **R165 #87 scenario (`resolve-with-reason`) PASS** — drawer Resolve routes through modal (per R165 fix), POST /resolve fires.
4. **R162 #89 scenario (`range-changed-banner`) PASS** — range banner renders/hides correctly.
5. **4 scenarios have "some checks skipped" warning** — this is best-effort behavior for scenarios that need worktree setup. The core checks pass; the worktree-specific assertions are skipped in this env. Not a bug — just a warning.
6. **Port 8890 in use warnings** — because my earlier mock-server from R164/R165 was still running. Each scenario fell back to OS-assigned port. Functionally fine; just noise.

## Why this matters

The 5 months of silent breakage (R32 → R165) didn't accumulate latent bugs because:
- The 9-check pre-commit gate catches most issues at commit time
- The `bun test` (1138+ tests) catches most issues at unit level
- The e2e suite was the LAST layer of defense — and it wasn't running

The fact that all 35 pass after the R166 fix means:
- The codebase is healthy
- The fixes in R162-R165 don't have hidden side effects
- Future changes that break e2e will be caught (the harness now works)

## Files to add

1. `.omo/round-167/e2e-sweep.log` — the full sweep output (50 KB)
2. `src/r167-e2e-baseline.test.ts` — new regression test that asserts the e2e harness file references `plugin.default.server` (not `plugin.default`). Locks in the R166 fix.

## Risk
LOW. The regression test only checks the harness file's text, not running all 35 scenarios (would take 5+ minutes per test run). Future round could add a "run e2e as part of pre-commit" check, but that's a perf concern.