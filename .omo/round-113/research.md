# R113 Research

## #77 content-hash auto-resolve

**Files**: `src/index.ts` (Finding type extension, submit handler), `src/ui/app.ts` (state storage), `src/ui/i18n.ts`
**Existing patterns**:
- `Finding` has `status: "open" | "closed_auto" | "resolved"` (line 92)
- `close_reason: "file_removed" | "anchor_missing"` (line 98)
- `anchor.selected` already populated
- `state.fresh` and `state.existing` carry findings across rounds
- `src/index.ts:402-416` already has close-on-mismatch logic (anchor drift)
- 0 hits for `context_hash` / `sha256` / `computeHash`
**Simplest change**:
1. Add `anchor.context_hash?: string` to Finding type (optional, lazy)
2. On submit, compute hash from `anchor.before + anchor.selected + anchor.after` (simple length-based hash, not crypto)
3. On round N+1, when checking `close_reason: "anchor_missing"` (line 415), also check if context_hash still matches current file content — if yes, mark `closed_auto` with `close_reason: "context_match"` (new value)
**Risk**: hash collisions. Use length+content-hash (FNV-1a or similar non-crypto).

## #78 Submit modal footprint preview

**Files**: `src/ui/app.ts` (modal builder line ~5936)
**Existing patterns**:
- Modal at app.ts:5936 with `innerHTML` template
- `state.fresh` (draft) + `state.existing` (persisted)
- `t()` i18n helper
- `escapeHtml()` utility
**Simplest change**: Insert footprint section in modal template before round-notes:
```html
<div class="submit-footprint">
  <h4>Expected apply footprint</h4>
  <ul>
    <li>{N} open findings</li>
    <li>{M} unique files affected</li>
    <li>Primary categories: {X}, {Y}</li>
  </ul>
</div>
```
Compute via local iteration over findings.
**Risk**: estimates may mislead if user reads them as exact predictions — must use words like "estimated" / "approximately".

## #84 Layer 1 polish (fresh-draft delete)

**Files**: `src/ui/app.ts` (line 4192-4204 removeBtn), `src/ui/i18n.ts`
**Existing patterns**:
- `removeBtn` already exists, only `state.fresh.filter(item => item.id !== entry.id)`
- No confirm — accidental click deletes
- `installModalA11y` helper available for confirm modal
- `modal.cancel` / `modal.submit.title` already i18n'd
**Simplest change**:
1. Rename `action.remove` → `action.deleteDraft` (more descriptive)
2. Replace bare `state.fresh.filter` with confirm modal flow: installModalA11y + cancel/delete buttons
3. Use `installModalA11y` for focus trap + Escape key
**Risk**: scope creep — keep Layer 2 (server-side delete) for R114.

## Cross-cutting decision

All 3 fit v6 hard cap: ≤3 feature (77+78) + ≤1 polish (84-L1) = 3 total. Within ≤8 cap. Lead-direct 100%.