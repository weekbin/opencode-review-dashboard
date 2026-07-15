# R164 Retro

## What worked
- E2E walkthrough with playwright-cli + mock-server.py + custom mock data (stale + resolved findings). Successfully reproduced user's reported scenarios.
- Visual evidence captured for R162 fixes via DOM snapshots: range-banner hidden, topbar consolidated, settings Save+toast, sidebar-mode height.
- Regression tests follow the established regex-extract-source pattern from R163 — low ceremony, high signal.
- The #87 "no reaction" mystery was root-caused: drawer resolve skips the modal (UX inconsistency with conversation panel). R164 captures this in `.omo/round-164/e2e-evidence/r87-drawer-resolve.md` with 3 fix options for user to pick from.

## What didn't
- R162 #87 NOT fixed this round — needs user decision on UX direction (Option A: route through modal; Option B: add toast; Option C: leave as-is).
- R162 #88 (AI language e2e) NOT done — requires real OpenCode agent, not available in this loop.
- Mock-server clean-up was slow (pkill hung multiple times, had to use direct PID kill). Add to housekeeping: a script that reliably kills orphaned mock-server processes.

## Carry-over list
1. **#87 fix** — User decision: which UX (A/B/C)? Then implement.
2. **#88 AI language e2e** — needs real OpenCode agent; defer until that env is available.
3. **mock-server cleanup script** — small housekeeping to make pkill reliable.

## Closed in this round (loop-internal)
- R162 #85 e2e verified (closes R162 carry-over #1 partially)
- R162 #87 root-caused (closes R162 carry-over #1 partially, leaves fix pending user)
- Locked in R162 working behavior with 2 new regression tests

## Open loop-internal at retro time
**EMPTY.** Carry-over items documented above, not blocking.

## Hard gate status
- ≤3 feature / ≤5 bugfix / ≤8 total / ≤1 polish: 0+0+1+4 = 5 ✓
- Pre-commit PASS: yes ✓
- 0 open loop-internal: yes ✓