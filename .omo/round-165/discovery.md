# R165 Discovery

## Backlog
- **R164 carry-over**:
  1. **#87 fix** — user-facing bug: drawer Resolve button has no visible reaction. R164 root-caused: `findingsRoot.addEventListener` calls `resolveFinding(id)` directly (no modal, no await). User decision (via R164 e2e): pick Option A (route through `showResolveReasonModal` for UX consistency with conversation panel).
  2. **#88 AI language e2e** — still deferred (needs real OpenCode).
  3. **mock-server cleanup** — pkill hangs in this env. Defer to a separate infrastructure round.

## New ACs this round
- **AC1**: Fix #87 — drawer Resolve button routes through `showResolveReasonModal` (consistent with conversation panel at app.ts:4669-4686). User adds reason, then resolves.
- **AC2**: Add /resolve POST handler to mock-server.py (currently 501 for all resolve requests, blocking e2e verification of the fix)
- **AC3**: Update `r87-drawer-resolve.test.ts` to assert the NEW behavior (handler now awaits showResolveReasonModal)
- **AC4**: Add a follow-up e2e test that proves the fix works end-to-end (Playwright walkthrough against the patched code)

## Anti-cap check
- Features: 0
- Bugfixes: 1 (the #87 fix is a behavior change for the drawer)
- Polish: 0
- Housekeeping: 3 (mock-server + test update + e2e test)
- Total: 4 (≤8 ✓)

## Why this round
#87 is the only remaining user-facing bug from the original 8-issue batch that isn't either fixed or e2e-verified. The user reported "drawer resolve button no reaction" — R164 root-caused it, R165 fixes it.