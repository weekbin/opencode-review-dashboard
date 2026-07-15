# R164 Brief

## Scope
1 e2e evidence bundle (3 .md files in `.omo/round-164/e2e-evidence/`) + 2 new regression tests. No production source changes.

## Why
R162 carry-over had 2 e2e items. #85 fully verified. #87 root cause found. Need to lock in current behavior with regression tests so future refactors don't silently regress.

## Per-AC acceptance

1. **AC1 e2e #85 evidence** — `.omo/round-164/e2e-evidence/r85-force-reopen.md` documents the Playwright walkthrough: click Force Reopen → modal opens → submit → POST /reopen with `manually_reopened: true` → server returns 200. Includes DOM snapshots and the server log line.
2. **AC2 e2e #87 evidence** — `.omo/round-164/e2e-evidence/r87-drawer-resolve.md` documents the Playwright walkthrough showing the drawer's Resolve button calls `resolveFinding()` directly (no modal). Includes the 501 console error from the mock and a code-path comparison with the conversation panel.
3. **AC3 e2e #162 other fixes** — `.omo/round-164/e2e-evidence/r162-other-fixes.md` documents visual verification of: range-banner hidden when no range change, topbar layout/theme/language toggles hidden (consolidated into settings), settings modal Save shows "保存" + success toast on click.
4. **AC4 #85 regression** — `bun test src/ui/r85-force-reopen.test.ts` 2/2 PASS. Test asserts the handler at app.ts:4706 calls `await showReopenReasonModal(entry.id)` for stale findings.
5. **AC5 #87 regression** — `bun test src/ui/r87-drawer-resolve.test.ts` 2/2 PASS. Test asserts the current drawer resolve at app.ts:6652-6658 calls `resolveFinding(id)` directly (no modal, no await). Future refactor that adds a modal will require updating this test.

## Risk
LOW. No production source changes. E2e evidence is documentation only.

## Verification
- `bash .husky/pre-commit` 9/9 PASS
- `bun test` 1136+ pass (2 new tests)
- `bun run check` clean
- `bun run build` not required (no dist changes)

## Profile
polish+housekeeping (1 polish + 4 housekeeping = 5 total) — no behavior changes, just e2e documentation + regression tests.