# R115 Brief

## Scope (1 feature)

**#79 Finding edit enhancement** — Extend the existing `editFinding` flow to support inline-comment-edit AND full-field editing (anchor + status).

3 sub-parts, ~230 LOC total:
1. **Inline-comment-edit**: Notion-style click-to-edit in finding card. Click comment body → swap for textarea → save on blur or Ctrl+Enter → toast. ~80 LOC.
2. **Modal extension**: Add file/start_line/end_line inputs + status select to `showEditFindingModal`. Pre-fill from current finding. ~100 LOC.
3. **PATCH server schema**: Accept `file?, start_line?, end_line?, status?` in addition to existing fields. Stamp `edited_at` + audit trail rows for new field edits. ~50 LOC.

## Why

Per user feedback (issue #79): current edit modal only supports 3 fields (category/severity/comment). Wrong anchor / wrong status requires reopen+delete+recreate — 5-step pain. Industry baseline (GitHub/GitLab) locks anchor/status on creation; ORD going one better = plausible-unique.

## Risk

- **Anchor edit side-effect**: changing anchor without stale-detection refresh could leave finding pointing at wrong content. Mitigation: when anchor changes, mark `kind: "line"` and add `manually_edited: true` so next-round reconcile() picks up the new position.
- **Status change to resolved from edit**: bypasses the `showResolveReasonModal` reason flow. Mitigation: when user picks status=resolved from edit modal, redirect to existing resolve flow (or accept empty reason as fallback for batch edits).
- **Inline-edit autosave UX**: don't save on every keystroke. Save on blur/Ctrl+Enter only.

## Acceptance

- **S1** (modal extension): Edit Finding modal includes file path input, line number inputs, status dropdown. Save PATCHes all fields with audit trail.
- **S2** (inline-edit): Click comment body → becomes textarea → blur or Ctrl+Enter saves → toast.
- **S3** (PATCH schema): Server accepts expanded fields; `edited_at` stamped; `FindingAuditRow` extended for anchor/status edits.
- **S4**: All tests pass; pre-commit 8/8; no regression.

Verify: `bun test 2>&1 | tail -5` + `bash .husky/pre-commit 2>&1 | tail -10` + commit + push + decision.md "SHIP".