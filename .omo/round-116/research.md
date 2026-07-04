# R116 Research — Submit dual-button (#83)

## Existing Submit Code Map

### Server (src/index.ts)

- **Submit type** (line 245): `{ notes?: string; new_findings?: FreshFinding[]; ... }`
- **POST /api/review/${id}/submit** (line 2554): reads `{notes, new_findings}`, no `intent` field
  - Always bumps `round` to `base.round + 1`
  - Carries open findings forward
  - Writes `roundSystemNotes[]` if silent round detected
  - Returns `{ ok: true, round, json_path, md_path }`

### Client (src/ui/app.ts)

- **submitButton** (line 1489): `document.querySelector("#submit")` — single button
- **submit()** (line 6072): posts to /submit, no intent field
- **submitButton click handler** (line 6160): opens modal with footprint preview, body textarea, cancel/confirm buttons
- **draftPayload()**: returns `{ notes, new_findings }` — no intent field

### Translations (src/ui/i18n.ts)

- `toolbar.submit`: "Submit Review" / "提交审查" (single button)
- `modal.submit.title`, `modal.submit.confirm`: "Submit review?" / "提交审查？"
- `submit.modal.body`: "You're about to submit your review."
- `submit.modal.findingCount`: "{count} open finding(s) will be submitted."
- `submit.modal.roundNotes.label` + `.placeholder`

## Schema Design (additive, back-compat)

### New types (strict subset extensions)

```typescript
type SubmitIntent = "request_changes" | "approve";

type Submit = {
  notes?: string;
  new_findings?: FreshFinding[];
  intent?: SubmitIntent;  // ← new, optional, defaults to "request_changes"
};

type Approval = {
  round: number;
  notes: string;
  at: number;
};

// Existing FindingResolutionKind already includes "duplicate"
// We add "approved" for the approve path
type FindingResolutionKind =
  | "wontfix" | "out_of_scope" | "false_positive" | "duplicate"
  | "approved";  // ← new

// State adds approvals[] (mirrors roundSystemNotes pattern)
type State = {
  // ... existing fields
  approvals?: Approval[];  // ← new, optional, append-only
};
```

### Server behavior branching

| Intent | round++ | Findings | approvals[] | Agent |
|--------|---------|----------|-------------|-------|
| `request_changes` (legacy default) | yes | carry open forward | no append | trigger apply |
| `approve` | yes | all open → resolved + resolution_kind=approved + resolved_at | append entry | NO trigger |

### UI design

Replace single `#submit` button with two buttons in toolbar:
- `#submit-request-changes` (secondary style) — always enabled when open findings exist OR can be submitted with 0 findings (per legacy)
- `#submit-approve` (success green) — enabled only when:
  - 0 open findings across fresh+existing
  - notes non-empty
  - Otherwise: disabled with tooltip "Resolve all open findings + write round notes first"

Both open their own confirm modal:
- Request changes modal: existing modal text + "N findings will be carried forward"
- Approve modal: "Round N approved. Worktree is ready to merge. All open findings marked approved."

### Client submit() flow

```typescript
async function submit(intent: SubmitIntent = "request_changes") {
  const payload = { ...draftPayload(), intent };
  // ... existing POST logic
}
```

## Files To Touch

- `src/index.ts`: ~40 LOC (extend Submit type, POST handler branches, Approval type, write approvals[])
- `src/ui/i18n.ts`: ~10 new STRINGS keys × 2 locales
- `src/ui/app.ts`: ~150 LOC (toolbar button row, dual confirm modals, enable conditions, intent payload)
- `src/r116-submit-dual-intent.test.ts`: NEW ~120 LOC
- `src/edit-finding.test.ts` or sibling: may need 1 update for approve-path audit

## Acceptance Criteria

- AC1: Toolbar shows two buttons (Request changes + Approve changes)
- AC2: Request changes = legacy behavior (round++, carry findings)
- AC3: Approve disabled when 0 open findings OR empty notes (with tooltip)
- AC4: Approve enabled only when 0 open findings + notes non-empty
- AC5: Each button opens its own confirm modal (different copy per intent)
- AC6: Server endpoint accepts `intent` field, defaults to "request_changes"
- AC7: state.approvals[] append-only; approve adds entry
- AC8: Approve marks all open findings as resolved + resolution_kind="approved"
- AC9: Approved findings reject reopen without force flag
- AC10: Back-compat: old state.json without intent still works

## Round Profile

- Feature: 1
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct)
- Estimated LOC: ~280-400 (per issue estimate)