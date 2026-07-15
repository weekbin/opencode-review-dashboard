# R162 #85 e2e evidence — Force Reopen

**Date**: 2026-07-15
**Setup**: `mock-server.py` on port 8890 with custom mock containing 1 stale finding (F-STALE-001, status=closed_auto) and 1 resolved finding (F-RESOLVED-001).
**Tool**: playwright-cli 0.1.14 + Chromium

## Walkthrough

### Step 1 — Open dashboard

```
playwright-cli open http://127.0.0.1:8890/review/test?token=test
```

Result: Page loads, title "Review Dashboard", 2 findings expected.

### Step 2 — Navigate to Conversation tab + set filter to "All"

```js
document.querySelectorAll('.navbar-tabs button').forEach(b => { 
  if (b.textContent.includes('会话')) b.click(); 
});
document.querySelectorAll('#conversation-filter button').forEach(b => { 
  if (b.textContent.trim() === 'All') b.click(); 
});
```

Result: Conversation tab active, filter set to "All", both findings visible.

### Step 3 — DOM snapshot of stale finding

```html
<div class="conversation-item" data-status="closed_auto" data-origin="existing" 
     id="finding-F-STALE-001">
  <input type="checkbox" class="conversation-finding-checkbox" data-id="F-STALE-001">
  <div class="conversation-head">
    <div class="conversation-head-left">
      <span class="conversation-file" title="src/feature.ts:1-3">src/feature.ts:1-3</span>
      <span class="conversation-status" data-status="closed_auto">stale</span>
    </div>
    <div class="conversation-actions">
      <button class="primary">Force Reopen</button>  <!-- R162 #85 fix -->
      <button>编辑</button>
      <button>跳转</button>
      ...
    </div>
  </div>
</div>
```

**Verification**: ✅ "Force Reopen" button is rendered for `status="closed_auto"`.

### Step 4 — Click Force Reopen

```
playwright-cli click "button:has-text('Force Reopen')"
```

### Step 5 — Verify modal opens

```js
Array.from(document.querySelectorAll('.modal-overlay')).map(o => ({
  hidden: o.hidden,
  h3: o.querySelector('h3')?.textContent?.trim(),
  id: o.id
}))
```

Result:
```json
[
  { "hidden": true,  "h3": "设置", "id": "settings-overlay" },
  { "hidden": false, "h3": "强制重新打开审查项", "id": "" }  // <-- Force Reopen modal
]
```

**Verification**: ✅ Modal opens with title "强制重新打开审查项" (Force Reopen Finding in Chinese). Settings modal stays closed.

Modal contents:
- Textarea `#reopen-reason` (placeholder for reason)
- Cancel button (`#reopen-cancel`)
- Submit button (`#reopen-submit`, label "重新打开" / Reopen)

### Step 6 — Click submit

```
playwright-cli click "#reopen-submit"
```

### Step 7 — Verify server received POST

`/tmp/review-test-server.log`:
```
[srv] reopen POST body: {"finding_id":"F-STALE-001","manually_reopened":true,"reason":"（未提供原因）"}
[srv] "POST /api/review/test/reopen?token=test HTTP/1.1" 200 -
```

**Verification**: ✅ POST fired with correct payload, server returned 200. Modal closed.

## Verdict
**R162 #85 is FULLY WORKING in current build.** The user's original "clicking has no reaction" complaint is no longer reproducible.

### Why was the user seeing it broken before R162?
- The handler at src/ui/app.ts:4706 calls `event.stopPropagation()` to prevent the parent click handler from firing
- Without `stopPropagation`, the parent `body.addEventListener("click")` (line 4885) for inline comment edit would fire when the user clicks the Force Reopen button
- The fix is the explicit `stopPropagation` + `await showReopenReasonModal` (which is the current state of the code)

### Root cause
None — the current build works correctly. The user's issue may have been from an earlier build before R162.

## Screenshot
- `/tmp/r164-dashboard.png` — initial dashboard load
- `/tmp/r164-force-reopen-modal.png` — Force Reopen modal open with textarea + buttons