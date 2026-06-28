# Round 3 Diff Report

## Verdict: PASS

## Summary

3 files changed, +81 / -4 lines.

## File-by-file

### `src/index.ts` (+30/-3)

**Type additions** (lines 42, 77, 156-158):
- `Finding.resolved_at?: number` — set when status transitions to "resolved"
- `State.notes_history?: string[]` — accumulates non-empty `notes` from prior rounds
- `Done.prior_notes: string[]` and `Done.session_id: string` — required fields on the Done type

**`format()` function** (lines 417-453):
- Filters `resolved` findings alongside the existing `open` filter
- Builds `resolved_payload` with id/severity/category/file/start_line/end_line/side/comment/comments/resolved_at
- Adds `session_id`, `prior_notes`, and `resolved` fields to the returned JSON
- Existing fields (`open_count`, `by_severity`, `by_category`, `notes`, `findings`, `artifacts`) unchanged

**Resolve handler** (line 1652):
- Sets `target.resolved_at = Date.now()` when transitioning to "resolved"
- Sets `target.resolved_at = undefined` when reopening to "open"

**Submit handler** (line 1813-1817):
- Pushes the current round's `notes` to `notes_history` before saving state
- Filters empty notes to avoid accumulating "" entries

**Cancelled path** (line 1913-1914):
- Passes `prior_notes: base.notes_history ?? []` and `session_id: context.sessionID`

**Agent description** (lines 1347-1356):
- Documents the new payload fields (`session_id`, `prior_notes`, `resolved[]`)
- Updates the "Read Conversation History" instruction to reference the new fields

### `scripts/test-review-ui/scenarios.mjs` (+20/-0)

Adds `setupResolvedContextPayload()` and registers it in the SCENARIOS map under the name `"resolved-context-payload"`.

### `scripts/test-review-ui/e2e.mjs` (+29/-1)

- Adds `existsSync` to the import list
- Adds the `resolved-payload-shape` expect kind handler in `check()`
- Stashes state.json content on `setupInfo._stateContent` in `runScenario()` before cleanup destroys it

## Backward compatibility

- All changes are **additive**. No field renamed, no field removed.
- Existing consumers of the return payload will see the same fields they saw before; new fields are simply ignored by old consumers.
- The e2e harness's existing 13 scenarios continue to pass with no changes to their assertion logic.

## Verification

- `bun run check`: PASS (format, lint, typecheck clean)
- `bun run test:unit`: 10/10 pass
- `bun run build`: PASS
- `bun run scripts/test-review-ui/e2e.mjs --only resolved-context-payload`: PASS
- `bun run scripts/test-review-ui/e2e.mjs` (full sweep): 14/14 pass

## Risks

LOW. The change is bounded by:
- `prior_notes` size grows linearly with round count (no longer than notes themselves — bounded by user input)
- `resolved[]` size grows linearly with resolution count (bounded by total findings)
- `session_id` is the OpenCode session UUID already exposed via other paths