# R165 Verify

- `bun run check`: PASS
- `bun test`: 1137/1137 PASS (1 conformance fail on R105 fixed by writing artifacts)
- `bash .husky/pre-commit`: 9/9 PASS
- E2E walkthrough: PASS (see AC-by-AC below)

## E2E walkthrough (R165 #87 fix)

Setup:
1. `bun run build` to refresh dist/
2. Start mock-server: `MOCK_DATA_FILE=/tmp/r164-mock-stale.json python3 scripts/test-review-ui/mock-server.py 8890`
3. `playwright-cli open http://127.0.0.1:8890/review/test?token=test`

Steps:
1. `playwright-cli click "#drawer-toggle"` → drawer opens
2. `playwright-cli click ".drawer-body .finding:first-child button:has-text('解决')"` → resolve modal opens
3. Verify modal state: `{ modalCount: 1, modalH3: ["解决审查项"] }`
4. `playwright-cli click "#resolve-submit"` → modal closes, POST fires
5. Server log: `[srv] resolve POST body: {"finding_id":"F-STALE-001"}` + `200 -`

Screenshot: `/tmp/r165-drawer-resolve-modal.png` (90 KB) shows the resolve modal open with reason chips + textarea.

## AC-by-AC

1. **AC1 fix** ✅ — `src/ui/app.ts:6648` handler is now `async`. E2e walkthrough confirms modal opens with title "解决审查项" + submit fires POST /resolve.
2. **AC2 mock-server** ✅ — `scripts/test-review-ui/mock-server.py:117-122` adds POST /resolve handler. Verified via `curl` + e2e (server log shows payload).
3. **AC3 test update** ✅ — `src/ui/r87-drawer-resolve.test.ts` rewritten with 3 tests asserting the new behavior. All 3 PASS.
4. **AC4 e2e evidence** ✅ — Screenshot captured at `/tmp/r165-drawer-resolve-modal.png`.

## Test count delta

- R164 baseline: 1137
- R165: same 1137 (rewrote r87 test, same test count)

## Files touched

- `src/ui/app.ts` (1 function: `findingsRoot` click handler, +6 lines)
- `scripts/test-review-ui/mock-server.py` (+5 lines: new POST branch)
- `src/ui/r87-drawer-resolve.test.ts` (rewrote: 3 tests, 30 lines)
- `.omo/round-165/{discovery,research,brief,verify,retro,decision}.md`