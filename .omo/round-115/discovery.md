# R115 Discovery

## Open GH issues (round-115 tagged)

- **#79** Finding 编辑补强：inline-edit + anchor/status 字段可改 (round-115 tagged)

## Carry-over (from R114 retro)

- (none — R114 closed clean)

## Decision

**R115 profile = 1 feature (#79)**, single round.

Per #79, the feature has 3 sub-parts:
1. **Inline-comment-edit** (Notion-style click-to-edit in finding card) — ~80 LOC
2. **Extend edit modal**: add anchor field (file + line) + status field — ~100 LOC
3. **PATCH server-side**: accept anchor + status changes with stale-detection refresh — ~50 LOC

Total ~230 LOC, fits ≤5 bugfix / ≤8 total cap. Lead-direct 100%.

Defer:
- #74 (cross-round reconcile overlay) → R116
- #81 / #83 (review velocity + dual-button) → R117+

## Acceptance

- S1 (edit modal extension): Edit Finding modal includes file path input, line number input, and status dropdown (open / resolved / wontfix). Save PATCHes all fields with audit trail (edited_at updated).
- S2 (inline-comment-edit): Click comment body in finding card → becomes textarea → blur or Enter saves (Tab navigates away) → status toast "Comment updated".
- S3 (PATCH schema): Server `/api/review/:id/findings/:fid` PATCH accepts `{category?, severity?, comment?, file?, start_line?, end_line?, status?}` and writes `edited_at`. Anchor edits trigger stale-detection refresh.
- S4: All test cases pass; pre-commit 8/8; no regression.