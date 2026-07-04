# R116 Brief — Submit dual-button (#83)

## Goal

Ship the Submit dual-button feature (issue #83) — split the single "Submit Review" button into two:
1. **Request changes** (legacy behavior, always available)
2. **Approve changes** (new, enabled only when 0 open findings + notes non-empty)

The split provides explicit signal for:
- Agent prompt routing (don't trigger agent apply on approve)
- Multi-round analytics (track approval rate via state.approvals[])
- CI/automation hook points (worktree ready to merge)
- Token economy (no wasted agent run after approve)

## Implementation Plan

### Server (src/index.ts)

1. **Type extensions** (additive):
   - `type SubmitIntent = "request_changes" | "approve"`
   - `type Approval = { round: number; notes: string; at: number }`
   - Extend `FindingResolutionKind` with `"approved"`
   - Add `approvals?: Approval[]` to `State` type

2. **POST /submit handler branches**:
   - Read `input.intent`, validate against SubmitIntent whitelist, default `"request_changes"`
   - `request_changes` path: existing behavior (no change)
   - `approve` path: 
     - Bump round
     - Mark all `open`/`closed_auto` findings as `status: "resolved"`, `resolution_kind: "approved"`, `resolved_at: now`
     - Append `{ round, notes, at }` to `state.approvals`
     - DO NOT trigger agent apply (return early before PostApply Trace)
     - Still export round-NNN.json/.md for record

### Client (src/ui/app.ts)

1. **Toolbar**: replace `#submit` button row with two buttons:
   - `#submit-request-changes` (secondary, default-enabled)
   - `#submit-approve` (success green, conditionally enabled)

2. **Enable conditions for approve**:
   - `state.fresh.concat(state.existing).filter(f => f.status === "open" || f.status === "closed_auto").length === 0`
   - Round notes textarea non-empty
   - Otherwise: disabled with tooltip explaining why

3. **Dual confirm modals**:
   - Request changes modal: existing modal text (R113 footprint preserved)
   - Approve modal: new copy — "Approve round N? Worktree is final. All N findings marked approved. No further changes."

4. **submit() function signature**: `submit(intent: SubmitIntent = "request_changes")`

5. **draftPayload()**: add `intent` field

### i18n (src/ui/i18n.ts)

Add ~10 new STRINGS keys × 2 locales:
- `toolbar.requestChanges`: "Request changes" / "请求修改"
- `toolbar.approveChanges`: "Approve changes" / "通过审查"
- `toolbar.approveChanges.disabledTooltip`: "Resolve all open findings + write round notes first" / "..."
- `submit.requestChangesModal.title`: "Request changes for round N?" / "..."
- `submit.approveModal.title`: "Approve changes for round N?" / "..."
- `submit.approveModal.body`: "Worktree is final. All open findings will be marked approved. Agent will not apply further changes." / "..."
- `submit.approveModal.confirm`: "Approve" / "通过"
- `status.submitApproved`: "Round N approved" / "本轮已通过"
- `review.approved.title`: "Round approved · worktree ready to merge" / "..."

## Test Plan

New file `src/r116-submit-dual-intent.test.ts` (~12 tests):

**AC1**: Toolbar markup includes both buttons
**AC2**: Request changes = legacy POST (no intent field) — server still accepts
**AC3**: Approve disabled state when open findings exist
**AC4**: Approve enabled state when 0 open + notes non-empty
**AC5**: Each modal has intent-specific copy (zh-CN + en both checked)
**AC6**: Server accepts `intent: "request_changes"` and behaves as legacy
**AC7**: Server accepts `intent: "approve"` and writes approvals[] entry
**AC8**: Approve path marks all open findings resolved + approved
**AC9**: Approved findings reject reopen without force flag
**AC10**: Back-compat: state.json without intent field still parses
**AC11**: i18n keys present in both locales
**AC12**: SubmitIntent whitelist rejects invalid values (400 on server)

## Round Profile

- Feature: 1 (#83)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Estimated LOC: ~280-400

## Risk Mitigations

- **Back-compat**: Old state.json without `intent` field still parses (no required field added). Existing /submit calls without intent still work (default to request_changes).
- **Race conditions**: approvals[] is append-only; mirror roundSystemNotes pattern (already proven race-safe in R114).
- **Schema strict subset**: All new fields optional; new FindingResolutionKind variant additive.

## v6 Compliance

- Hard caps: 1 feature ≤3 ✓, 0 bugfix ≤5 ✓, 0 polish ≤1 ✓, 1 total ≤8 ✓
- Pre-commit 8/8 PASS required
- 0 subagents (lead-direct per v6 spec)
- 0 open-loop-internal at retro time (must close in current worktree)