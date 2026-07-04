# R116 Discovery — Submit dual-button (#83)

## Issue Scope

**#83**: Submit 路径分 Request changes / Approve 双按钮
- Outcome: Submit 路径分出"继续改 / 通过结束"两个清晰 intent
- User 原话驱动: "submit review 最好改成 request changes 和 approved changes 两个按钮，这样也利于指导后续到底是改内容还是结束，很多事情都明确了这样"
- 关键词 "很多事情都明确了" = 不止 UI 改，下游所有 implicit signal 变 explicit
- pm-manager-approved + user-feedback + round-116 labels

## Competitive Context

- **GitHub PR**: 4 buttons (`Comment` / `Request changes` / `Approve` / `Submit review`)
- **GitLab MR**: 5 buttons (`Comment` / `Approve` / `Request changes` / `Merge` / `Submit`)
- **Phabricator**: `Accept Revision` / `Request Changes` / `Resign`
- **Gerrit**: `Submit` vs `Abandon` — core fork

## Current ORD State

- `src/ui/i18n.ts:64` `toolbar.submit`: en "Submit Review", zh-CN "提交审查" — single button
- `src/index.ts:2320` `POST /api/review/${id}/submit` 接 `{notes, new_findings}` — single endpoint, intent not modeled
- `src/ui/app.ts:5796-5805` `submit()` 直接 disable → submit → no type split
- Agent 收到 round bump 后无差别 apply (`src/index.ts:1538-1583` 的 Post-Apply Trace), 无 "stop" signal — wastes tokens

## R116 Scope Decision

**Scope (this round)**: Toolbar UI split + intent field + server branching + state.approvals[] storage.
- Toolbar 1 button → 2 buttons (Request changes / Approve changes)
- Endpoint accepts `intent: "request_changes" | "approve"` (default = request_changes for back-compat)
- Server branches behavior by intent:
  - request_changes: legacy behavior (round++, carry findings, agent apply)
  - approve: round++, mark all open findings as resolved+approved, no agent apply
- `state.approvals[]` append-only (mirrors roundSystemNotes pattern)
- Approved findings cannot be reopened (unless manual force-reopen)

**Deferred to future rounds**:
- Agent prompt routing optimization (#83 explicitly suggests split: R116 = UI+schema, R117 = agent routing)
- Review Velocity analytics (#81) — will use approvals[] once R116 ships
- Silent round summary "approval_signoff" variant

## Files To Touch

- `src/ui/i18n.ts`: 8-10 new STRINGS keys (`toolbar.requestChanges/approveChanges`, `submit.requestChangesModal.*`, `submit.approveModal.*`)
- `src/ui/app.ts`: split submit button row, dual confirm modals, enable conditions, intent payload
- `src/index.ts`: extend POST /submit to accept `intent`, write approvals[] on approve, mark open findings
- `src/state-store.ts` or similar: add Approval type
- New test file: `src/r116-submit-dual-intent.test.ts` (~10 tests covering both intents + back-compat)

## Acceptance Criteria

- AC1: Toolbar shows two buttons side-by-side (Request changes / Approve changes) — both labeled via i18n
- AC2: Request changes button = legacy behavior (round++, agent apply)
- AC3: Approve changes button disabled when open findings exist OR notes empty (tooltip explains why)
- AC4: Approve changes button enabled when 0 open findings AND notes non-empty
- AC5: Each button opens its own confirm modal with intent-specific text (zh-CN + en)
- AC6: Server endpoint accepts `intent` field, defaults to "request_changes" when absent
- AC7: state.approvals[] append-only array; approve adds entry with round/notes/at
- AC8: Approve marks all open findings as resolved+approved with resolution_kind="approved"
- AC9: Approved findings reject reopen without manual force-reopen flag
- AC10: Old state.json without intent field still works (back-compat)

## Round Profile

- Feature: 1 (#83 dual-button)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct)
- Estimated LOC: ~280-400 (matches issue estimate)