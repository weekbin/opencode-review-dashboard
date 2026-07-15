# R165 Brief

## Scope
1 bugfix + 1 test infrastructure + 1 test update. Production source change in 1 file, mock-server change in 1 file, test file updated.

## Why
R164 e2e walkthrough root-caused #87: drawer's Resolve button at app.ts:6648-6658 called `resolveFinding(id)` directly with no modal + no await. In mock env, fetch returned 501 (no /resolve handler). In real env, resolve succeeded silently with no feedback. User reported "no reaction".

R165 fix: route drawer Resolve through `showResolveReasonModal` (same pattern as conversation panel at app.ts:4669-4686). User sees modal pop up, can add reason, then resolves.

## Per-AC acceptance

1. **AC1 fix** — `src/ui/app.ts:6648` handler is now `async`, awaits `showResolveReasonModal(id)`, then awaits `resolveFinding(id, { reason })`. E2e walkthrough proves modal opens + submit fires POST /resolve + 200.
2. **AC2 mock-server** — `scripts/test-review-ui/mock-server.py:117-122` adds POST /api/review/<id>/resolve handler that echoes the payload. Verified via curl: `{"ok": true, "received": {"finding_id": "...", "reason": "..."}}`.
3. **AC3 test update** — `src/ui/r87-drawer-resolve.test.ts` updated to assert the NEW behavior (handler is async, awaits showResolveReasonModal, no direct resolveFinding call).
4. **AC4 e2e evidence** — `/tmp/r165-drawer-resolve-modal.png` shows the modal open with title "解决审查项" after clicking the drawer's Resolve button.

## Risk
MEDIUM. The drawer fix changes UX: clicking Resolve now opens a modal (one extra click). Power users may notice. Mitigation: matches conversation panel behavior (consistency > speed).

## Verification
- `bash .husky/pre-commit` 9/9 PASS
- `bun test` 1137/1137 PASS (1 new test from updated r87 file)
- `bun run build` clean
- E2E: playwright-cli walkthrough + curl + server log all show correct flow

## Profile
bugfix+housekeeping (1 bugfix + 3 housekeeping = 4 total)