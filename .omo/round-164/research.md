# R164 Research

## E2E walkthrough (Playwright + mock-server)

**Setup**:
- `mock-server.py` running on port 8890 with `MOCK_DATA_FILE=/tmp/r164-mock-stale.json`
- Custom mock contains 2 existing_findings: F-STALE-001 (status=closed_auto) and F-RESOLVED-001 (status=resolved)
- `playwright-cli open http://127.0.0.1:8890/review/test?token=test`

## AC1 — R162 #85 Force Reopen verified

**Steps**:
1. Click navbar Conversation tab (会话) — shows 2 findings
2. Click "All" filter — shows both stale and resolved findings
3. Click "Force Reopen" button on stale finding
4. Verify modal opens with title "强制重新打开审查项" (Force Reopen Finding)
5. Type reason in textarea (default: "(未提供原因)")
6. Click submit "重新打开"
7. Verify modal closes
8. Verify server log shows `POST /api/review/test/reopen?token=test HTTP/1.1 200`

**Result**: ✅ ALL STEPS PASS. Modal opens, POST fires with `manually_reopened: true`, server returns 200.

**Visual evidence**: `/tmp/r164-dashboard.png`, `/tmp/r164-force-reopen-modal.png`

**Other R162 fixes also verified visually**:
- `rangeBanner.hidden: true` (no false yellow box) ✅
- `layoutToggle.hidden: true`, `themeToggle.hidden: true`, `languageToggle.hidden: true` (topbar consolidation) ✅
- settings modal Save button shows "保存" (Chinese label) + success toast "设置已保存" appears on click ✅

## AC2 — R162 #87 Drawer Resolve root cause found

**Steps**:
1. Open drawer (click #drawer-toggle)
2. Find finding in drawer's findings list
3. Click "解决" (Resolve) button on drawer finding

**Result**: ❌ Button click triggers `resolveFinding(id)` directly (no modal). In mock env, fetch returns **501 Not Implemented** (mock-server.py doesn't implement POST /resolve). The unhandled promise fails silently.

**Console log**: `[ERROR] Failed to load resource: the server responded with a status of 501 (Not Implemented) @ http://127.0.0.1:8890/api/review/test/resolve?token=test`

**Code path** (src/ui/app.ts:6648-6658):
```ts
findingsRoot.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const resolveBtn = target.closest("button[data-resolve]");
  if (resolveBtn instanceof HTMLElement) {
    const id = resolveBtn.dataset.resolve;
    if (!id) return;
    resolveFinding(id);  // <-- no modal, no await, no feedback
    return;
  }
  ...
});
```

**Comparison with conversation panel** (src/ui/app.ts:4669-4686):
```ts
resolveBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const result = await showResolveReasonModal(entry.id);  // <-- modal first
  if (result === null) return;
  await resolveFinding(entry.id, { reason: result.reason });
});
```

**The drawer's quick-resolve (no modal) is a UX inconsistency**, not a bug per se. The user reports "no reaction" because:
- Mock env: 501 error → silent failure
- Real env: resolve succeeds silently (no toast / no visual confirmation)

**Fix recommendation** (deferred to next round pending user decision):
- Option A: Route drawer resolve through showResolveReasonModal (consistent with conversation panel)
- Option B: Keep drawer quick-resolve but add toast confirmation on success/failure
- Option C: Leave as-is (drawer quick-resolve is intentional "fast path")

## AC3 + AC4 — Regression tests

Lock in current behavior so future refactors don't silently break:
- AC3: r85-force-reopen.test.ts — asserts handler at app.ts:4706 awaits showReopenReasonModal for stale findings
- AC4: r87-drawer-resolve.test.ts — asserts current drawer resolve at app.ts:6652-6658 calls resolveFinding directly (no modal)

Both tests use the same regex-extract-source pattern as the other R162 regression tests.

## Files to create/modify
1. `.omo/round-164/e2e-evidence/r85-force-reopen.md` (new)
2. `.omo/round-164/e2e-evidence/r87-drawer-resolve.md` (new)
3. `.omo/round-164/e2e-evidence/r162-other-fixes.md` (new — range-banner / topbar / settings modal)
4. `src/ui/r85-force-reopen.test.ts` (new)
5. `src/ui/r87-drawer-resolve.test.ts` (new)

No production source changes this round. Just e2e evidence + regression tests.

## Risk
LOW. All changes are documentation + test additions. The #87 root cause is documented but NOT fixed (pending user decision on UX).