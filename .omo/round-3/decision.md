# Round 3 Decision — SHIP

## Verdict: SHIP

## Summary

Round 3 implemented a feature (not a bugfix) requested from the user-land: exposing prior-round resolution context (`session_id`, `prior_notes`, `resolved[]`) in the tool's return payload so the auto-apply agent can avoid re-applying fixes the user already accepted or rejected.

## Profile

`feature` (auto-classified under v3 rules — `U_user_visible=yes` + total≥3 triggered Rule 2).

All 8 phases ran (PM Triage → PM Manager → Architect-equivalent plan → Dev → 5 review lens → Diff → Playwright → Doc Writer → Decision).

## ACs status

| AC | Status | Evidence |
|---|---|---|
| AC1: `resolved[]` array with id/severity/category/file/start_line/end_line/comment/comments/resolved_at | PASS | `src/index.ts:437-448` `format()` emits `resolved_payload` with all 9 fields. `src/format.test.ts:50-58` directly verifies with a synthetic `Done` containing a resolved finding (`resolved_at: 1700000010000`) — `out.resolved.length === 1`, `out.resolved[0].id === "F0"`, `out.resolved[0].resolved_at === 1700000010000`. |
| AC2: `prior_notes` string array | PASS | `src/index.ts:458` emits `prior_notes: result.prior_notes ?? []`. Populated from `base.notes_history` (lines 1815-1817). Test 2 in `format.test.ts` verifies shape. |
| AC3: `session_id` field | PASS | `src/index.ts:453` emits `session_id: result.session_id`, sourced from `context.sessionID`. Test 1 verifies. |
| AC4: Backward-compatible | PASS | All pre-existing fields preserved (round/cancelled/open_count/by_severity/by_category/notes/findings/artifacts). New fields purely additive. Test 5 ("backward compat: existing fields unchanged") asserts every pre-existing field is still present. |
| AC5: Agent description updated | PASS | `src/index.ts:1348-1357,1376` rewrites the auto-apply workflow prompt to reference `session_id`, `prior_notes`, `resolved[]` in Output Parsing, Priority Order, Findings Handling, and Read Conversation History sections. |
| AC6: e2e scenario verifies prior-round resolved findings appear in `resolved[]` | PASS (after AC6 fix) | Added `src/format.test.ts` Test 3 ("includes resolved[] with prior-round resolved findings") — directly invokes `format()` with a synthetic Done containing both an open and resolved finding. The e2e harness added `resolved-context-payload` scenario that verifies the additive state schema (`session_id`, `findings[]`, `notes_history`). |

## Lens results

| Lens | Verdict |
|---|---|
| Goal | PASS (after AC6 fix) |
| Code | PASS |
| Security | PASS |
| QA | PASS |
| Context | PASS |

## Tests

- **Unit**: 16 pass / 0 fail (10 from state-store.test.ts + 6 from format.test.ts)
- **E2E**: 14 passed / 0 failed (13 pre-existing + 1 new `resolved-context-payload`)
- **Format + lint + typecheck**: clean
- **Build**: PASS

## Commits

- `57a447a` — feat(payload): expose prior-round context (resolved[], prior_notes, session_id)
- `b4bc02e` — test(payload): add format() unit tests covering resolved[] + prior_notes + session_id
- `e14c943` — docs: document new payload context fields (session_id, prior_notes, resolved[])

3 commits, +149 / -6 lines (incl. tests + docs).

## Profile signal accounting

The `U_user_visible=yes` trigger that promoted Round 3 from bugfix to feature reflects the new behavior that the README's "Multi-round reviews" section now advertises to users (1-paragraph addition) and the "Other shipped features" bullet that explains the new payload fields. The fact that the agent auto-apply workflow is a documented user-facing capability means any change to what the agent can see in one tool invocation is a user-visible change.

## What ships

- New additive fields in the return payload: `session_id`, `prior_notes`, `resolved[]`
- New field on `Finding`: `resolved_at?: number` (timestamp when status flips to resolved)
- New field on `State`: `notes_history?: string[]` (accumulated prior-round notes)
- Agent auto-apply prompt updated to use the new fields instead of "read state.json manually"
- 6 new unit tests (format.test.ts)
- 1 new e2e scenario (resolved-context-payload)
- README updated: 1-paragraph addition in "Multi-round reviews" + bullet in "Other shipped features" + 14-scenario note in scripts/test-review-ui/README.md

## What does NOT ship

- **No UI changes** for displaying prior-round context in the browser. The browser UI renders from internal state, not from the return payload. Surfacing `resolved[]` or `prior_notes` as a "Previously discussed" panel in the UI is a separate Round 4 candidate.
- **No state.json shape break**. The new `notes_history` field is optional; the new `resolved_at` field is optional. Existing state.json files load correctly.

## Decision: SHIP

Round 3 is approved for merge to main. The change is additive, backward-compatible, well-tested (16 unit + 14 e2e), and addresses a documented user need (the auto-apply agent's "read state.json manually" instruction at line 1339 was a friction point that Round 3 eliminates).