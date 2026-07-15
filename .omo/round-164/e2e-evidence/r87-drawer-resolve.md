# R162 #87 e2e evidence — Drawer Resolve

**Date**: 2026-07-15
**Setup**: Same as R85 walkthrough (mock-server with 2 findings, F-STALE-001 + F-RESOLVED-001).
**Tool**: playwright-cli 0.1.14 + Chromium

## Walkthrough

### Step 1 — Open drawer

```
playwright-cli click "#drawer-toggle"
```

Result: Drawer panel opens, shows the "Add Finding" form + 2 existing findings at the bottom.

### Step 2 — DOM snapshot of drawer finding

```html
<div class="finding line-level" 
     data-focus-file="src/feature.ts" 
     data-focus-side="additions" 
     data-focus-start="1" 
     data-focus-end="3">
  <div class="finding-head">
    <div class="finding-badges">
      <span class="badge high">high</span>
      <span class="badge bug">bug</span>
      <span class="badge">line</span>
    </div>
    <div class="actions">
      <button class="btn-resolve" data-resolve="F-STALE-001">解决</button>
    </div>
  </div>
  <div class="finding-body">src/feature.ts:1-3 — Stale finding for Force Reopen e2e test</div>
</div>
```

**Observation**: The drawer finding has a `data-resolve="<id>"` button but NO modal handler attached directly. The handler is delegated via `findingsRoot.addEventListener("click", ...)`.

### Step 3 — Click Resolve in drawer

```
playwright-cli click ".drawer-body .finding:first-child button:has-text('解决')"
```

### Step 4 — Verify what happens

```js
Array.from(document.querySelectorAll('.modal-overlay')).map(o => ({
  hidden: o.hidden,
  h3: o.querySelector('h3')?.textContent?.trim()
}))
```

Result: No new modal opens. Only the settings modal is in DOM (hidden).

### Step 5 — Check console for errors

`.playwright-cli/console-2026-07-15T10-29-28-831Z.log`:
```
[  125613ms] [ERROR] Failed to load resource: the server responded with a status of 501 (Not Implemented) @ http://127.0.0.1:8890/api/review/test/resolve?token=test:0
```

**Diagnosis**: The click fires the delegated handler at src/ui/app.ts:6652-6658, which calls `resolveFinding(id)` directly. The mock-server.py doesn't implement POST /resolve (it only implements /reopen), so the fetch returns 501.

## Code path comparison

### Drawer (the user's #87 case)

```typescript
// src/ui/app.ts:6648-6658
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
  // ...
});
```

### Conversation panel (working correctly)

```typescript
// src/ui/app.ts:4669-4686
resolveBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const result = await showResolveReasonModal(entry.id);  // <-- modal first
  if (result === null) return;
  await resolveFinding(entry.id, { reason: result.reason });
});
```

## Verdict
**R162 #87 is partially diagnosed but NOT fixed.** The drawer's Resolve button works, but:
- It SKIPS the resolve-with-reason modal (UX inconsistency with conversation panel)
- It does NOT await the fetch (no error feedback if API fails)
- The 501 from mock env makes the failure visible; real env would succeed silently

### Why was the user seeing it as broken?
- Mock env: 501 error → user sees "no reaction" (no modal, no success toast, no failure toast)
- Real env: resolve succeeds but no visible feedback → user thinks it did nothing

### Fix options (deferred to user decision)

- **Option A** (consistency): Route drawer resolve through `showResolveReasonModal` like conversation panel. User adds reason, then resolves.
- **Option B** (preserved quick path): Keep drawer quick-resolve but add success/failure toast for visible feedback.
- **Option C** (intentional): Leave as-is — drawer quick-resolve is a "fast path" UX. But the user complained about "no reaction", so this doesn't address the complaint.

## Recommendation
**Option A** is the most consistent with the rest of the dashboard. Conversation panel uses modal-first; drawer should too. The cost: 1 modal click for users who want quick resolve. The benefit: consistent UX, visible reaction, ability to add reason.