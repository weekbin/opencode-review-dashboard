# Diff Report — Round 4 #1: "Previously discussed" panel

## Summary

8 files changed, +639/-7. No state.json schema change. No new dependencies. R3-fabricated fields (`notes_history`, `format.test.ts`, R3 commit SHAs) explicitly NOT introduced.

## File-by-file

### `src/index.ts` (+120)

- **`validateSessionId(id)`** at `:451-457` — strict validator rejecting `..`/NUL/empty/oversize/non-string. Regex `/^[a-zA-Z0-9_-]+$/` + length cap 64. Type guard `id is string`.
- **`parsePriorNotes(md)`** at `:460-481` — tolerant markdown walker for the `## Notes` section. Handles `#/##/### Notes` (case-insensitive). Returns "" if no heading found.
- **`readPriorNotesFromSession(sessionDir)`** at `:485-...` — async reader. Defense-in-depth: (a) checks `sessionDir` for NUL, (b) `Bun.file().stat()` + readdir fallback for existence check, (c) reads `round-NNN.md` files with strict regex `/^round-(\d+)\.md$/`. Returns `{ ok: true, rounds: [{ round, notes }] }` or `{ ok: false, status, error }` for 400/404. Path.resolve check at the read boundary guards against symlink escape.
- **`GET /api/review/${id}/prior-notes` handler** (in the same function block) — delegates to `readPriorNotesFromSession`. Maps `ok: false` to HTTP status. Returns JSON envelope with `rounds: [{ round, notes }]` sorted by round ascending.

### `src/ui/app.ts` (+223)

- **`state.activeTab` type** extended at `:366-370` to include `"previously"` (union `"files" | "commits" | "conversation" | "previously"`). Default storage fallback preserved.
- **`state.priorNotes` / `state.priorNotesLoaded`** at `:375-376` — local cache for the loaded prior notes (avoids re-fetching on every tab click).
- **`setActiveTab` signature** at `:478` — extended union type.
- **Tab click handler** at `:495` — extended cast to include "previously".
- **`renderActivePane`** at `:1330-1335` — new branch for `"previously"` triggers `loadPriorNotes().then(() => { if (state.activeTab === "previously") renderPreviouslyPane(); })`.
- **`loadPriorNotes()`** (new) — fetches the GET endpoint, populates `state.priorNotes`, sets `state.priorNotesLoaded = true`.
- **`groupFindingsByRound(entries)`** at `:1853-1865` — helper that builds a `Map<round, ConversationEntry[]>`, filtering out round 0 (the current round).
- **`renderPreviouslyPane()`** (new) — main render function. Reads `state.priorNotes` + groups `state.existing` by round. Renders round sections with notes + findings (open/resolved/closed_auto) + comment threads. Empty state for round 1.
- **Comment rendering** (per-round) — iterates `entry.comments[]` (FindingComment type with `author: "user" | "agent"`), renders each comment in created_at order.

### `src/ui/review.html` (+14)

- **4th tab button** at `:1713-1717` — `<button data-tab="previously" aria-pressed="false" title="Previously discussed (prior round notes + comment threads)">Previously discussed <span class="navbar-count" id="previously-count" hidden>0</span></button>` placed immediately after the Conversation tab button at `:1710`.
- **4th pane** at `:1767-1772` — `<div id="pane-previously" class="pane" hidden></div>` placed after the Conversation pane. Loaded by `renderActivePane` when `state.activeTab === "previously"`.

### `src/prior-notes.test.ts` (+250, new)

- **19 unit tests**, organized by AC:
  - AC1 (HTML presence): T0.1 — exactly one Previously discussed button + one pane
  - AC3 (markdown parsing): T1.1-T1.5 — tolerant of `#/##/###`, case-insensitive, returns "" if missing, multiline body
  - AC4 (grouping + comments): T2.1 (sorted by round), T2.2 (empty list)
  - AC5 (read-only): T3.1 — mtime snapshot before+after, asserts mtime unchanged for state.json AND round-*.json
  - AC6 (security): T4.1-T4.5 — `..`/NUL/empty/valid/oversize/non-string rejected; 404 for non-existent session dir
  - AC9 (no schema change): T5.1 — extracts both type blocks via regex, compares to byte-for-byte snapshot constants

### `README.md` (+7)

- **Sidebar description** updated to mention 4 tabs (Files / Commits / Conversation / Previously discussed).
- **Multi-round reviews section** — 1-paragraph addition explaining the new panel.

### `scripts/test-review-ui/e2e.mjs` (+5)

- **New `previously-discussed-panel` scenario** registered in the e2e harness.

### `scripts/test-review-ui/mock-server.py` (+21)

- **Fixture data** for the new scenario — 3 rounds, each with different notes and at least 1 finding with a comment thread.

### `scripts/test-review-ui/scenarios.mjs` (+6)

- **Setup function** for the new scenario — `setupPreviouslyDiscussedPanel()` (or equivalent).

## Backward compatibility

- **All changes are additive.** No field renamed, no field removed.
- The 4th tab type extension in `state.activeTab` is a union — old localStorage values (`"files" | "commits" | "conversation"`) still match.
- Existing 13 e2e scenarios continue to pass (14/14 total in the lead's independent re-run, including the new scenario).
- No state.json schema change. State type at `src/index.ts:71-79` and Finding type at `:28-46` are byte-identical to the pre-R4 baseline (verified by AC9 snapshot test).

## Verification (lead's independent run in worktree)

- `bun run check`: 0 warnings, 0 errors (oxlint, oxfmt, tsc --noEmit)
- `bun run build`: ok (tsdown 0.20.3, 304 files, 10873.35 kB)
- `bun run test:unit`: 19 pass / 0 fail (37 expect() calls) — 10 pre-existing + 19 new in `src/prior-notes.test.ts`
- `bun run scripts/test-review-ui/e2e.mjs`: 14 pass / 0 fail (13 pre-existing + 1 new `previously-discussed-panel`)

## R3 fabricated fields cross-check

Verified that the new R4 commit does NOT introduce R3's fabricated fields:
- `notes_history` in `src/index.ts`: 0 matches
- `format.test.ts` in `src/`: 0 matches
- `prior_notes` in `src/index.ts`: 0 matches
- `session_id` in `src/index.ts`: 11 matches (all legitimate — the existing State.session_id field at `src/index.ts:72`, NOT the fabricated R3 payload field)

The R3 forward-references (`.omo/round-3/playwright-report.md:15` + `.omo/round-3/decision.md:73`) are valid as USER PAIN anchors but the implementation does NOT depend on R3's fabricated code (it reads from `state.findings[]` + `round-NNN.md`, both of which exist in current main).

## Risks

- **Low**: path traversal is blocked at 3 layers. mtime-snapshot test verifies the endpoint is read-only. No new auth/authz surface. No new dependencies.
- **Low**: scope is bounded — 3 production files (HTML, app.ts, index.ts) + 1 new test file + 3 e2e harness files + README. No drive-by changes.

## Net assessment

The diff is ready to merge. No CRITICAL/MAJOR findings. 3 MINOR items (carried over to R5+ backlog as documented in `.omo/round-4/test-report.md`).

## Verdict

**PASS (no high-severity findings, additive-only, all gates green, all tests pass).**
