# R164 Discovery

## Backlog
- **R162 carry-over**:
  1. #85/#87 e2e verify — **CLOSED this round** (Playwright walkthrough done)
  2. #88 AI language e2e — still needs real OpenCode; stays as future carry-over
- **#87 root cause discovered**: drawer resolve button at `src/ui/app.ts:6652-6658` calls `resolveFinding(id)` directly (no modal, no await). User reports "no reaction" because in mock env the fetch returns 501 and the unhandled promise just fails silently.

## New ACs this round
- **AC1**: Capture e2e evidence for R162 #85 (Force Reopen) — Playwright walkthrough saved to `.omo/round-164/e2e-evidence/r85-force-reopen.md` with screenshots + DOM snapshots
- **AC2**: Capture e2e evidence for R162 #87 (Drawer Resolve) — Playwright walkthrough + root-cause analysis
- **AC3**: Add regression test for R162 #85 (locks the working Force Reopen modal behavior)
- **AC4**: Add regression test for R162 #87 (locks the current drawer resolve behavior so future refactor is intentional)
- **AC5**: Stash e2e screenshots from R162 carry-over investigation

## Anti-cap check
- Features: 0
- Bugfixes: 0 (root cause documented, not fixed this round — needs user decision on UX)
- Polish: 2 (new test files = 1 polish AC since they share the round's purpose)
- Housekeeping: 0 (e2e evidence is documentation, not test infra)
- Total: 1 polish + 4 housekeeping = 5 (≤8 ✓)
- Polish: 1 (≤1 ✓)

## Why this round
R162 carry-over had 2 e2e items. #85 verified this round with real Playwright. #87 root cause found but NOT fixed (UX change needs user approval). #88 deferred.

The new regression tests lock in R162's working behavior so future refactors don't silently break it.