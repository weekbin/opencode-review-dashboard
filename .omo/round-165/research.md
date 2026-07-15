# R165 Research

## Fix path

### Code change (src/ui/app.ts)
Before (R164):
```typescript
findingsRoot.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const resolveBtn = target.closest("button[data-resolve]");
  if (resolveBtn instanceof HTMLElement) {
    const id = resolveBtn.dataset.resolve;
    if (!id) return;
    resolveFinding(id);  // <-- direct call, no modal, no await
    return;
  }
  // ...
});
```

After (R165):
```typescript
findingsRoot.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const resolveBtn = target.closest("button[data-resolve]");
  if (resolveBtn instanceof HTMLElement) {
    const id = resolveBtn.dataset.resolve;
    if (!id) return;
    // R165 #87: route through showResolveReasonModal (same as conversation
    // panel at app.ts:4669-4686) so the user gets a visible reaction.
    const result = await showResolveReasonModal(id);
    if (result === null) return;
    await resolveFinding(id, { reason: result.reason });
    return;
  }
  // ...
});
```

### Mock-server change (scripts/test-review-ui/mock-server.py)
Add a new branch in `do_POST`:
```python
if re.match(r"^/api/review/[^/]+/resolve$", path):
    sys.stderr.write(f"[srv] resolve POST body: {body.decode('utf-8', errors='replace')}\n")
    self.send_text(json.dumps({"ok": True, "received": json.loads(body or b"{}")}), 200, "application/json")
    return
```

Mirrors the existing /reopen handler. Echoes the payload back so e2e can assert the request shape.

### Test update (src/ui/r87-drawer-resolve.test.ts)
Replace the R164 test (which locked in the bug) with R165 tests that lock in the fix:
- handler is `async`
- handler awaits `showResolveReasonModal(id)`
- handler awaits `resolveFinding(id, { reason: result.reason })`
- handler no longer has the direct `resolveFinding(id);` call

## Why this is the right fix

User said: "drawer 抽屉里会显示 findings 的列表，但是直接点击 resolve 按钮是没有反应的"

Three options were considered in R164:
- **A** (route through modal): consistent with conversation panel, visible reaction ✅
- B (keep quick-resolve + add toast): inconsistent UX, weaker feedback
- C (leave as-is): doesn't fix the bug

Option A wins on:
- UX consistency: conversation panel already uses modal-first
- Visible reaction: modal pops up = strongest possible feedback
- Bug root-cause fix: addresses the "no await" + "no feedback" issues together

Cost: 1 extra click for users who want quick resolve.
Benefit: visible reaction + reason capture + consistency.

## Files to modify

1. `src/ui/app.ts` — findingsRoot click handler (1 AC: change 1 function)
2. `scripts/test-review-ui/mock-server.py` — do_POST branch (1 AC: add 5 lines)
3. `src/ui/r87-drawer-resolve.test.ts` — update assertions (1 AC: rewrite test file)

## Files NOT modified

- `src/ui/review.html` — no markup change
- `src/ui/i18n.ts` — no new strings
- `src/index.ts` — backend already accepts /resolve (no change)

## Risk
LOW. The change is isolated to one click handler. All other paths (conversation panel, mark-as-wontfix) already use showResolveReasonModal.