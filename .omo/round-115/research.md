# R115 Research

## #79 Finding edit enhancement

**Files**: `src/index.ts` (PATCH endpoint schema), `src/ui/app.ts` (modal + inline-edit), `src/ui/i18n.ts`

**Existing patterns**:
- `editBtn` handler at `src/ui/app.ts:4329-4349` — opens `showEditFindingModal`, builds `patch: {category?, severity?, comment?}`, calls `editFinding(id, patch)` via `PATCH /api/review/${id}/findings/${id}` (line 5415)
- `showEditFindingModal` at `src/ui/app.ts:5531` — renders h3 + body + category select + severity select + comment textarea + Cancel/Save buttons
- `editFinding` (client-side) at `src/ui/app.ts:5415` — fetches PATCH endpoint, updates state
- Server PATCH handler at `src/index.ts:2101` — accepts `{category?, severity?, comment?}` only
- `Finding` type has `status: "open" | "closed_auto" | "resolved"`, `file`, `start_line`, `end_line`, `anchor: Anchor`, `kind: "line" | "file" | "out_of_diff"`, `edited_at?: number`
- `FindingAuditRow` type (line 75) — `before/after Pick<Finding, "category" | "severity" | "comment">` + `at/by` — does NOT currently track anchor/status edits
- 0 hits for `inlineEdit` / `contentEditable` / `Tab moves focus`

**Simplest change**:

### 1. Modal extension (server PATCH)
- Add fields to PATCH handler input type: `{category?, severity?, comment?, file?, start_line?, end_line?, status?, anchor_kind?}`
- Validate: status must be in literal union; file/start_line/end_line must be string/number
- When status changes from open → resolved: stamp `resolved_at`, set `resolve_manually_resolved: true`
- When status changes to wontfix: must also accept resolution_kind (use existing showWontfixReasonModal path)
- When anchor changes (file/start_line/end_line): trigger stale-detection refresh on next round

### 2. Modal extension (client showEditFindingModal)
- Add fields: file path input, start_line number input, end_line number input, status select
- Pre-fill from current finding state
- Pass expanded patch object to `editFinding()`

### 3. Inline-comment-edit
- On comment body click → swap `<div>` for `<textarea>` populated with current text
- On blur or Ctrl+Enter → PATCH `{comment}` → update state + re-render
- On Escape → revert to original text
- Visual: hover hint ("Click to edit"), keyboard shortcut indicator

### 4. Audit trail extension
- `FindingAuditRow` already exists for category/severity/comment. Extend to track anchor/status too if user edits those fields. Add optional `before_anchor` / `after_anchor` and `before_status` / `after_status` fields.

## Cross-cutting decision

- Single round, 1 feature, lead-direct 100%, no subagent.
- Schema additions are strict subset: new optional fields in PATCH input type, new optional fields in FindingAuditRow.
- Inline-edit must NOT auto-save on every keystroke (degrades UX) — save on blur or Ctrl+Enter only.