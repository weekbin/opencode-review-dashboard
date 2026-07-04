# R112 Brief

## Scope (3-feature bundle)

1. **#75 bulk-resolve** — Mirror R26's `conversation-bulk-delete` button as `conversation-bulk-resolve`. Click → open existing `showResolveReasonModal` (slightly extended title "Resolve N findings") with reason applied uniformly to all selected findings. ~50 LOC.
2. **#76 out-of-diff anchors** — Sidebar gains "All files" sub-section listing working-tree files outside `state.fileDiffInstances`. Click line on such file → `addFinding` falls through without diff lookup. `kind: "out_of_diff"` discriminator + sidebar/badge UI affordance. ~180 LOC.
3. **#80 conversation snippet** — Each finding card in conversation panel renders `entry.anchor.selected` as a monospace `<pre>` block above the comment body. Skip if `selected` is empty (file-level findings). ~30 LOC.

Combined ≤ 260 LOC, ≤ 10 files (cap is ≤10 for feature). Tests: 1 regression test per feature.

## Why

User-driven backlog from session work. R112 label applied to all 3. No carry-over from R111 (arc finalization). 3 features fit hard cap exactly.

## Risk

- #76 schema migration: old findings have no `anchor.kind` field → must default to "diff" on read
- #80 long snippets: clamp to 6 lines max-height with vertical scroll
- #75 modal: must not lose focus when loop starts; await-all on resolveFinding so atomic

## Acceptance

- S1 (bulk-resolve): select 3 findings → click "Mark selected as resolved" → modal opens → enter reason → submit → all 3 transition to status=resolved with reason recorded; bun test passes with bulk-resolve scenario
- S2 (out-of-diff): click line 5 of working-tree file not in diff → finding saved with `anchor.kind: "out_of_diff"` → conversation card shows "out of diff" badge; bun test passes
- S3 (snippet): finding card conversation-body has `<pre>` sibling rendering anchor.selected lines; bun test passes with snippet presence test

Verify: pre-commit 8/8 PASS, commit + push, decision.md "SHIP".
