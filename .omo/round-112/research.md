# R112 Research

## #75 bulk-resolve

**Files**: `src/ui/app.ts` (~4630-4660 bulk toolbar), `src/ui/i18n.ts` new key
**Existing patterns**:
- Bulk-delete at line 4641 (`conversation-bulk-delete` class, `data-i18n` attr, count suffix)
- `resolveFinding(id, {reason})` at line 5190 — single-call POST to `/api/review/{id}/resolve`
- `showResolveReasonModal(id)` at line 2399 — returns `{reason}` or null
- Modal already supports arbitrary text + 4 quick-reason chips
**Simplest change**: Mirror bulk-delete button beside it; on click, open resolve modal with N=count, then loop `resolveFinding` for each id.
**Risk**: Each resolve call is async — must await Promise.all to avoid race. Modal `find()` extension: pass array of ids.

## #76 out-of-diff anchors

**Files**: `src/ui/app.ts` (`addFinding`, `getOrderedFiles`), `src/index.ts` (anchor type, submit payload), `src/ui/i18n.ts`
**Existing patterns**:
- `addFinding(filePath, line, ...)` at line 5770 — takes line, looks up `fileDiffInstances`
- `state.fileDiffInstances` — files in diff (array)
- Sidebar renders via `getOrderedFiles()` line 3289
- Anchor type at `src/index.ts:26-30` has `before/selected/after` but no `kind` discriminator
- `kind: "line" | "file"` exists on Finding (line 73) — can extend to "out_of_diff_line"
**Simplest change**: 
1. Sidebar adds "All files" sub-section (working-tree files not in diff)
2. Add `addFinding(file, line, ...)` path that doesn't require fileDiffInstances lookup when file is non-diff
3. Anchor picks `kind: "out_of_diff"` from click context
**Risk**: Schema migration. Need anchor to keep backward compat with existing findings.

## #80 conversation snippet

**Files**: `src/ui/app.ts` (line ~4380-4400 `conversation-body` render), `src/ui/review.html` (CSS)
**Existing patterns**:
- `body.textContent = entry.comment` at line 4389
- `entry.anchor.selected` already populated (verified earlier grep)
- `escapeHtml` utility exists
- `formatPathLine` (file + line breadcrumb) convention used in jumpBtn
**Simplest change**: Before conversation-body, insert `<div class="conversation-snippet"><pre>${escapeHtml(entry.anchor.selected)}</pre></div>`. Skip render if `entry.anchor.selected` empty (file-level finding has empty selected).
**Risk**: Long snippets overflow viewport — need max-height + line-clamp, or scroll.

## Cross-cutting decision

All 3 are 1-round-medium-but-together = single round ship-able. Pre-commit R102 anchor-drift gate catches any string changes. Schema migration for #76 is additive (anchor.kind optional, default to "diff").
