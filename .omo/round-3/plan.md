# Round 3 Plan — Payload context for multi-round reviews

## Profile

**feature** (auto-classified under v3 rules; total=5, `U_user_visible=yes` triggers Rule 2). All 8 phases run.

## Goal

Eliminate the agent's manual `state.json` discovery step in the auto-apply workflow by exposing prior-round resolution context + structured `resolved[]` in the tool's return payload.

## Acceptance criteria (mapped from brief)

| AC | Implementation |
|---|---|
| AC1: Return payload includes `resolved[]` | Add `resolved: Finding[]` to return JSON at `src/index.ts:431-445` — filter `state.findings` by `status === "resolved"`, exclude current-round findings |
| AC2: Return payload includes `prior_notes` | Concatenate `notes` from all prior rounds (round < current), joined with `\n---\n` |
| AC3: Return payload includes `session_id` | Add `session_id` field (the OpenCode session UUID, already available via `context.sessionID`) |
| AC4: Backward-compatible | Existing fields unchanged. New fields additive. |
| AC5: Update agent description | Use new fields in "Read Conversation History" instruction (line 1339) |
| AC6: New e2e scenario | `round-2-resolved-context` — verify `resolved[]` shows prior-round resolved findings |

## File changes

| File | Change |
|---|---|
| `src/index.ts:38` | Add `resolved_at?: number` to `Finding` type |
| `src/index.ts` (resolve paths) | Set `resolved_at: Date.now()` when `status` flips to `"resolved"` |
| `src/index.ts:431-445` | Add `resolved`, `prior_notes`, `session_id` to return JSON |
| `src/index.ts:1339` | Update agent description: "Read Conversation History" now references new fields instead of "read state.json manually" |
| `scripts/test-review-ui/e2e.mjs` | Add `round-2-resolved-context` scenario |
| `scripts/test-review-ui/scenarios.mjs` | Setup function for the new scenario |
| `README.md` | 1-paragraph note in "Multi-round reviews" section |

## Implementation steps

1. Create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-3`
2. Add `resolved_at?: number` to `Finding` type
3. Find all places that set `status: "resolved"` and add `resolved_at: Date.now()` (or `state.now()` if it's the state-store)
4. Build the new return payload structure
5. Update agent description (line 1339) to use new fields
6. Add e2e scenario `round-2-resolved-context`
7. Run `bun run check` (format + lint + typecheck)
8. Run unit tests (≥ 10/10; no new unit test needed if resolved_at is just a timestamp)
9. Run e2e tests (≥ 14/14)
10. README "Multi-round reviews" 1-paragraph note

## Test plan

- **E2E `round-2-resolved-context`**:
  - Setup: round 1 produces 3 findings. Manually mark 1 as resolved (via state-store mutation in test or via UI mock).
  - Action: run plugin a 2nd time
  - Assert: payload includes `resolved[]` with 1 entry (the resolved finding), `prior_notes` field, `session_id` matches

- **Regression**: existing 13 e2e scenarios still pass (new fields additive, no breaking changes)

- **Manual smoke**: open dist/ui/app.js, verify UI doesn't break (UI doesn't consume these new fields — they're for agents only)

## Risk

LOW — additive changes only. No field renamed or removed. Existing consumers of the payload ignore unknown fields.

## Worker hand-off checklist

- [ ] Create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-3`
- [ ] Branch: `team-dev-loop-round-3-payload-context`
- [ ] Add `resolved_at?: number` to `Finding` type (line 38)
- [ ] Find all `status: "resolved"` assignments and add `resolved_at: Date.now()`
- [ ] Build new return payload with `resolved`, `prior_notes`, `session_id` fields
- [ ] Update agent description (line 1339) to reference new fields
- [ ] Add e2e scenario `round-2-resolved-context`
- [ ] `bun run check` (clean)
- [ ] `bun run test:unit` (≥ 10/10 pass)
- [ ] `bun run scripts/test-review-ui/e2e.mjs` (≥ 14/14 pass)
- [ ] README 1-paragraph note in "Multi-round reviews"
- [ ] Commit + push (1 commit, direct to main)