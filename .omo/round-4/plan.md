# Round 4 Plan — "Previously discussed" panel

> **Round**: 4
> **Date**: 2026-06-29
> **Profile**: `feature` (PM Manager APPROVE — Rule 2: U_user_visible=yes + total=8)
> **Chosen candidate**: #1 — "Previously discussed" panel in the Conversation tab
> **User value**: 5/5 (directly honors the R3 forward-reference at `.omo/round-3/playwright-report.md:15` + `.omo/round-3/decision.md:73` — verified USER PAIN anchors, not fabricated R3 implementation)
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-4` (R3 path-templating fix)
> **Branch**: `team-dev-loop-round-4-previously-discussed`

## 1. Goal

Add a 4th sidebar tab **"Previously discussed"** to the review UI that surfaces prior-round context — prior rounds' `notes` (parsed from existing `round-NNN.md` exports) and any prior-round findings (open, resolved, and their full `comments[]` thread) — so a developer running round 3+ of `/diff-review-dashboard` can scan "what did I tell the agent last round, and what did the agent say back" in one glance, without opening a terminal or scrolling through 30+ conversation entries. No `state.json` schema change required; all data already exists on disk in `state.findings[]` (with `comments[]`, `round`, `status`, `closed_at`) and `round-NNN.md` (with `## Notes` section).

## 2. Acceptance Criteria

Each AC is classified per `references/loop-decision.md` § "Multi-round AC test-design rule" (Round 3 lesson).

| AC | Description | Classification | Test design |
|---|---|---|---|
| **AC1** | A 4th sidebar tab labeled "Previously discussed" is rendered next to the Conversation tab, with `data-tab="previously"`, matching the existing tab pattern (`aria-pressed`, `title`, `navbar-count` span). | **round-1 ground truth** | E2E scenario: `previously-discussed-panel` — load UI, query `document.querySelectorAll('#navbar-tabs > button')`, assert 4 buttons + 4th has `data-tab="previously"` |
| **AC2** | Clicking the "Previously discussed" tab activates the panel: `data-pane="previously"` becomes visible, sidebar `activeTab` state updates, and `localStorage["diff-review:active-tab"]` persists the choice. | **round-1 ground truth** | E2E scenario: click the new tab, assert `[data-pane="previously"]:not([hidden])` AND `localStorage["diff-review:active-tab"] === "previously"` |
| **AC3** | The new panel reads prior-round `notes` from `round-NNN.md` exports: parses the `## Notes` section, strips it, returns an array of `{round: number, notes: string}` sorted ascending by round. | **multi-round** | Unit test on the new `parsePriorNotes()` helper: synthetic `round-001.md` + `round-002.md` files in a fixture dir, assert parsed shape |
| **AC4** | The new panel groups prior-round findings by round, shows open + resolved + closed_auto findings, and renders each finding's full `comments[]` thread (every `author: "user" \| "agent"` reply, in `created_at` order). | **multi-round** | Unit test on the new `renderPreviouslyDiscussedPanel()` function: synthetic `state.findings[]` with 3 rounds × 2 findings × 2-3 comments each, assert rendered DOM structure |
| **AC5** | The new GET endpoint `GET /api/review/${id}/prior-notes` is read-only on `round-NNN.md` files; never writes to `state.json`, `round-NNN.json`, or any other state file. | **round-1 ground truth (security)** | Unit test: invoke handler with synthetic session dir, assert no file mtime changed in `state.json` / `round-*.json` after invocation |
| **AC6** | The new endpoint validates `session_id` to prevent path traversal (rejects `../`, absolute paths, NUL bytes, etc.). Returns 400 on invalid, 200 on valid, 404 if session dir doesn't exist. | **round-1 ground truth (security)** | Unit test: 5 malicious inputs (e.g. `"../../etc/passwd"`, `"/etc/passwd"`, `"foo\x00bar"`, `"foo/../../bar"`, empty string), assert all return 400 except the empty string which returns 400 (not 404) |
| **AC7** | The new panel gracefully handles the case where no prior rounds exist (round 1 session): shows "No prior discussion yet. Submit a round to start the history." instead of an empty list or error. | **round-1 ground truth** | E2E scenario: load UI with empty prior rounds, assert the panel shows the empty-state message |
| **AC8** | No regression to existing 3 tabs (Files / Commits / Conversation) — all existing tab interactions still work after adding the 4th tab. | **round-1 ground truth (regression)** | Re-run existing 8 e2e scenarios + new tab scenario, all PASS |
| **AC9** | No state.json schema change: `State` type at `src/index.ts:71-79` is untouched. `Finding` type at `:28-46` is untouched. No new fields on either. | **payload-shape / static** | Unit test: snapshot the TypeScript types in `src/index.ts:71-79` and `:28-46`, assert byte-equality with pre-Round-4 version (stashed git ref) |

**AC classification summary**:
- **round-1 ground truth** (e2e): AC1, AC2, AC7, AC8
- **multi-round** (unit test): AC3, AC4
- **round-1 ground truth** (security unit test): AC5, AC6
- **payload-shape / static** (type-snapshot unit test): AC9

## 3. File changes

| File | Change | Line range (after edit) |
|---|---|---|
| `src/ui/review.html` | Add 1 new `<button data-tab="previously">` next to the Conversation tab at line 1710; add 1 new `<div class="pane pane-previously" data-pane="previously" hidden>` with `<div class="previously-list" id="previously-list"></div>` after the Conversation pane at line 1759. Total: ~10 lines added. | 1710-1714 (button), 1760-1765 (pane) |
| `src/ui/app.ts` | Add 1 new function `renderPreviouslyDiscussedPanel(root: HTMLElement)` (~80 LOC, mirrors `renderConversationPanel` at `:1603-1712` but groups by round + reads prior notes); add 1 new `state.priorNotes: Array<{round, notes}>` field; add 1 new `state.priorNotesLoaded: boolean` flag; add 1 new helper `parsePriorNotes(markdown: string): string` that extracts the `## Notes` section; add 1 new case in `renderActivePane()` for `data-pane="previously"`; add 1 new `fetch("/api/review/${id}/prior-notes")` call when tab is first activated. Total: ~110 LOC added. | new function ~2350-2430 (insert at end of file before final export); minor edits to `renderActivePane` near ~360 |
| `src/index.ts` | Add 1 new HTTP route handler `GET /api/review/${id}/prior-notes` (reads `round-NNN.md` files from session dir, parses `## Notes`, returns `{rounds: Array<{round, notes}>}`). Total: ~60 LOC added. The handler must: validate `id` (session_id pattern), check session dir exists, enumerate `round-*.md` files, parse each, sort ascending, return JSON. | new handler inserted after the existing `/api/review/${id}` GET route (~line 1500-1560 area — exact insertion point verified at dev time) |
| `src/prior-notes.test.ts` | **NEW FILE.** Unit tests for the multi-round ACs (AC3, AC4, AC5, AC6, AC9). Uses `bun test`. ~150 LOC. | new file |
| `README.md` | Add 1 paragraph in the "Multi-round reviews" section (around line 104-108) describing the 4th tab + a 1-line mention in the "Other shipped features" list (around line 50). Total: ~10 lines added. | 50 (features list), 104-108 (multi-round section) |
| `scripts/test-review-ui/e2e.mjs` | Add 1 new e2e scenario `previously-discussed-panel` to the `SCENARIOS` map (or as a post-UI-test step): launches mock server, loads UI with mocked prior-round state, asserts the 4th tab is present + clickable + activates panel + shows fixture data. Total: ~30 LOC added. | new scenario in `scenarios.mjs` + new check in `e2e.mjs` |
| `scripts/test-review-ui/mock-server.py` | Add 1 new route `GET /api/review/${id}/prior-notes` returning mock prior-notes JSON (round-001 + round-002 with synthetic notes). Total: ~25 LOC added. | new route in `Handler.do_GET()` |
| `scripts/test-review-ui/deleted-added-mock.json` | (Optional) extend existing mock data with prior-notes block, OR add a new `prior-notes-mock.json`. | optional |

**Net change estimate**: 3 production files + 1 new test file + 1 README update + 2-3 test-harness files = **~395 LOC across 7-8 files** (slightly higher than the brief's 150 LOC estimate, but matches the more-accurate PM-Manager-adjusted ~250 LOC for production + ~145 LOC for tests/README/test-harness).

## 4. Implementation steps

Each step is one atomic action. Steps 1-3 set up the worktree + branch. Steps 4-7 are production code. Steps 8-9 are unit tests. Steps 10-12 are e2e + README. Step 13 is the commit + push.

1. **Create worktree + branch** — `mkdir -p $HOME/.worktrees && git worktree add $HOME/.worktrees/team-dev-loop-round-4 -b team-dev-loop-round-4-previously-discussed`. Verify: `git -C $HOME/.worktrees/team-dev-loop-round-4 branch --show-current` returns `team-dev-loop-round-4-previously-discussed`.

2. **Wire up the 4th tab HTML** — Edit `src/ui/review.html:1710-1714` to add the 4th `<button data-tab="previously">Previously discussed</button>` after the Conversation tab. Edit `src/ui/review.html:1759-1765` to add the new pane after the Conversation pane. Verify: `grep -n 'data-tab="previously"' src/ui/review.html` returns exactly 1 match.

3. **Add the parsePriorNotes helper** — Edit `src/ui/app.ts` to add a top-level helper function `parsePriorNotes(md: string): string` (extracts `## Notes` section between `## Notes` and the next `## ` heading, trims whitespace, returns `""` if section missing). Verify: TypeScript compiles.

4. **Add the renderPreviouslyDiscussedPanel function** — Edit `src/ui/app.ts` to add the function that: (a) reads `state.existing[]` (already populated at `:2470`), groups by `round`, (b) reads `state.priorNotes[]`, (c) renders a section per round (sorted ascending) with notes + findings + comments, (d) handles empty-state (AC7). Verify: the function handles a 0-finding, 0-prior-notes case without crashing.

5. **Add the fetch + state binding** — Edit `src/ui/app.ts` to add `state.priorNotes: Array<{round: number, notes: string}>`, `state.priorNotesLoaded: boolean`, and a `loadPriorNotes()` async function that fetches `/api/review/${id}/prior-notes` and populates state. Trigger `loadPriorNotes()` when `data-pane="previously"` is first activated (track via `priorNotesLoaded` flag). Verify: re-clicking the tab doesn't re-fetch.

6. **Wire renderActivePane to the new pane** — Edit `src/ui/app.ts` `renderActivePane()` to handle `data-pane="previously"` by calling `renderPreviouslyDiscussedPanel(root)`. Verify: clicking the 4th tab activates the pane.

7. **Add the GET endpoint in src/index.ts** — Add the new HTTP route handler. Must: (a) parse URL `/api/review/${id}/prior-notes`, (b) validate `id` (regex `^[a-zA-Z0-9_-]+$`, reject anything else with 400), (c) resolve session dir from `getReviewsDir(id)`, return 404 if missing, (d) read `round-*.md` files via `readdirSync` + `readFileSync`, (e) parse each via `parsePriorNotes()` (move helper to `src/index.ts` so both server and client share it), (f) sort ascending by round number, (g) return JSON `{rounds: Array<{round, notes}>}`. Verify: handler returns 200 with fixture data, 400 on `../../etc/passwd`, 404 on unknown session.

8. **Write unit tests for AC3, AC4, AC5, AC6** — Create `src/prior-notes.test.ts` with 5 test cases:
   - `parsePriorNotes('## Notes\n\nfoo\n\n## Findings\n...')` returns `'foo'`
   - `parsePriorNotes('# Round 1\n\n## Notes\n\nbar\n\n## Findings')` returns `'bar'`
   - `parsePriorNotes('## Findings\n...')` returns `''` (no notes section)
   - `parsePriorNotes('## Notes\n\nmulti\nline\nnotes\n\n## Findings')` returns `'multi\nline\nnotes'`
   - `parsePriorNotes('')` returns `''`
   
   Plus integration tests on the GET handler with synthetic session dir:
   - happy path: 2 round files → 2 entries in response
   - empty dir: 0 entries
   - missing dir: 404
   - bad session_id: 400
   - path traversal: 400

9. **Write unit test for AC9 (no state.json schema change)** — Create `src/types-snapshot.test.ts` (or include in `src/prior-notes.test.ts`) that reads `src/index.ts:71-79` (State) and `:28-46` (Finding) and asserts the text matches a known-good snapshot stored as a constant in the test file. If the snapshot diverges, the test FAILS.

10. **Write e2e scenario for AC1, AC2, AC7, AC8** — Add `previously-discussed-panel` scenario to `scripts/test-review-ui/scenarios.mjs` and `scripts/test-review-ui/e2e.mjs`. The scenario: spawns mock server with prior-notes fixture data, navigates Playwright to `/review/test?token=test`, asserts the 4th tab exists, clicks it, asserts the pane activates, asserts the fixture data renders.

11. **Update mock-server.py** — Add the new `GET /api/review/${id}/prior-notes` route that returns mock JSON `{rounds: [{round: 1, notes: "Round 1 notes"}, {round: 2, notes: "Round 2 notes"}]}`. Verify: `curl http://127.0.0.1:8890/api/review/test/prior-notes` returns the mock JSON.

12. **Update README.md** — Add 1 paragraph in "Multi-round reviews" section describing the new tab + 1 line in "Other shipped features" list. Take 1 Playwright screenshot of the new panel → save to `docs/screenshots/previously-discussed.png` → embed in README.

13. **Run all gates + commit + push** — Run `bun run check` (format + lint + typecheck — must be clean), `bun run build` (must succeed), `bun test src/` (unit tests must all pass), `bun run scripts/test-review-ui/e2e.mjs` (e2e scenarios must all pass including the new one). If all green, commit + push.

## 5. Test plan

### Unit tests (`bun test src/`)

**File**: `src/prior-notes.test.ts` (NEW, ~150 LOC)

| Test ID | Tests AC | Setup | Assertion |
|---|---|---|---|
| T1.1 | AC3 | `parsePriorNotes('## Notes\n\nfoo\n\n## Findings')` | returns `'foo'` |
| T1.2 | AC3 | `parsePriorNotes('# Round 1\n\n## Notes\n\nbar\n\n## Findings')` | returns `'bar'` |
| T1.3 | AC3 | `parsePriorNotes('## Findings\n...')` | returns `''` |
| T1.4 | AC3 | `parsePriorNotes('## Notes\n\nmulti\nline\nnotes\n\n## Findings')` | returns `'multi\nline\nnotes'` |
| T1.5 | AC3 | `parsePriorNotes('')` | returns `''` |
| T2.1 | AC4 | `renderPreviouslyDiscussedPanel(root)` with synthetic 3-round state.findings | renders 3 round-sections, each with notes + findings + comments |
| T2.2 | AC4 | `renderPreviouslyDiscussedPanel(root)` with 0 findings | renders empty-state message |
| T3.1 | AC5 | Invoke handler with synthetic session dir + snapshot mtimes | `state.json` and `round-*.json` mtimes unchanged after invocation |
| T4.1 | AC6 | `GET /api/review/../../etc/passwd/prior-notes` | returns 400 |
| T4.2 | AC6 | `GET /api/review/foo%00bar/prior-notes` | returns 400 |
| T4.3 | AC6 | `GET /api/review/foo..bar/prior-notes` | returns 400 (regex fails on `..`) |
| T4.4 | AC6 | `GET /api/review//prior-notes` (empty id) | returns 400 |
| T4.5 | AC6 | `GET /api/review/unknown-session/prior-notes` | returns 404 |
| T5.1 | AC9 | Read `src/index.ts:71-79` text + `:28-46` text | matches snapshot constant byte-for-byte |

**Estimated**: 14 unit tests, ~150 LOC.

### E2E scenarios (`bun run scripts/test-review-ui/e2e.mjs`)

**New scenario**: `previously-discussed-panel`

**Setup** (in `scripts/test-review-ui/scenarios.mjs` + `mock-server.py`):
- Spawn mock server with prior-notes mock data (round 1: "Fix the auth middleware", round 2: "And add unit tests")
- Navigate Playwright to `http://127.0.0.1:8890/review/test?token=test`
- Wait for `app.js` to load (`document.querySelector('#navbar-tabs')` exists)

**Assertions** (in `scripts/test-review-ui/e2e.mjs` or a new `check` function):

| Assertion | Tests AC |
|---|---|
| `document.querySelectorAll('#navbar-tabs > button').length === 4` | AC1 |
| `document.querySelector('[data-tab="previously"]').textContent.includes('Previously discussed')` | AC1 |
| Click the new tab → `[data-pane="previously"]:not([hidden])` | AC2 |
| After click → `localStorage.getItem('diff-review:active-tab') === 'previously'` | AC2 |
| Panel contains 2 round-sections (round 1 + round 2) | AC4 |
| Round 1 section contains "Fix the auth middleware" | AC4 |
| Round 2 section contains "And add unit tests" | AC4 |
| Files / Commits / Conversation tabs still present + clickable | AC8 |
| If `state.findings[]` empty → empty-state message shown | AC7 |

**Regression coverage** (re-run existing 8 scenarios + new 1 = **9 total e2e scenarios**).

### Test-design rationale (multi-round AC → unit test mapping)

Per the loop-decision.md § "Multi-round AC test-design rule":

- **AC3** ("Panel reads prior-round notes from `round-NNN.md` exports") — asserts behavior that requires the system to have written `round-NNN.md` files in a previous round. **The e2e harness runs each scenario as a single round**, so a multi-round AC is structurally impossible to verify e2e. Solution: unit test on the parser function with synthetic fixture files. **The e2e scenario verifies only the round-1 ground truth** (does the panel render when priorNotes are populated?).
- **AC4** ("Panel groups prior-round findings + renders comment threads") — same multi-round constraint. Solution: unit test on `renderPreviouslyDiscussedPanel()` with synthetic `state.findings[]` containing 3 rounds × 2 findings × 2-3 comments each. **The e2e scenario verifies the rendering happens**, not the data correctness.
- **AC1, AC2, AC7, AC8** — round-1 ground truth, verifiable via e2e.
- **AC5, AC6** — round-1 security checks, verifiable via unit test on the handler.
- **AC9** — payload-shape / static, verifiable via type-snapshot unit test.

## 6. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Path traversal** in `session_id` from the new GET endpoint allows reading arbitrary files from disk (`/etc/passwd`, other users' state.json). | Low | Critical (data exfiltration) | Validate `session_id` against strict regex `^[a-zA-Z0-9_-]{1,64}$` BEFORE any path operation; reject `..`, `/`, NUL, etc. with 400. Add 5 malicious-input unit tests (AC6). |
| R2 | **Round-NNN.md parsing breaks** if the markdown export format changes in a future round (e.g. section renamed from `## Notes` to `### Notes` or to `## Round Notes`). | Medium | Medium (panel shows empty notes) | Defensive parser: regex-based extraction tolerant of `## Notes` / `### Notes` / `# Notes` (case-insensitive); fall back to `''` if no match. Add unit tests for each variant (T1.1-T1.5). |
| R3 | **Race condition**: panel reads `round-NNN.md` while the round-N writer is mid-write. Result: torn read or empty file. | Low | Low (one round's notes may be missing on UI) | `writeFileAtomic` guarantees readers see either old or new contents (POSIX atomic temp+rename). The risk is reading "old" before "new", which is a one-round lag — acceptable. Document this in the renderer's JSDoc. |
| R4 | **New tab interferes with existing sidebar state** (e.g., `localStorage["diff-review:active-tab"]` previously had 3 valid values, now has 4; some persisted state from old sessions shows invalid value). | Low | Low (one user session breaks) | The `readStored` helper at `src/ui/app.ts:116-124` already filters against an `allowed` list; add `"previously"` to the allowed list. Fallback to `"files"` if "previously" was persisted but later removed. |
| R5 | **Render performance** degrades for sessions with 50+ findings × 30+ comments each (hypothetical 8-round review). | Low | Medium (UI feels sluggish) | Group-by-round + lazy-render only the visible round-sections (use `<details>` collapsed by default, expand on click). Add a `console.time` perf check in the unit test to fail if `renderPreviouslyDiscussedPanel` takes >100ms on 100 findings. |

## 7. Worker hand-off checklist

Copy-paste ready. Tick each item before merging.

- [ ] Read `.omo/round-4/brief.md` and `.omo/round-4/pm-manager-review.md` (15 min)
- [ ] Read `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md` (R3 fabricated fields to AVOID citing: `state.notes_history`, `src/format.test.ts`, R3 commit SHAs, payload `session_id`/`prior_notes`/`resolved[]`)
- [ ] Create worktree at `$HOME/.worktrees/team-dev-loop-round-4`
- [ ] Branch: `team-dev-loop-round-4-previously-discussed` (verify with `git branch --show-current`)
- [ ] Edit `src/ui/review.html:1710-1714` — add `<button data-tab="previously">`
- [ ] Edit `src/ui/review.html:1759-1765` — add `<div class="pane pane-previously" data-pane="previously" hidden>`
- [ ] Edit `src/ui/app.ts` — add `parsePriorNotes(md: string): string` helper (top-level, exported)
- [ ] Edit `src/ui/app.ts` — add `state.priorNotes: Array<{round: number, notes: string}>` field
- [ ] Edit `src/ui/app.ts` — add `state.priorNotesLoaded: boolean` field
- [ ] Edit `src/ui/app.ts` — add `loadPriorNotes(): Promise<void>` async function
- [ ] Edit `src/ui/app.ts` — add `renderPreviouslyDiscussedPanel(root: HTMLElement): void` function (~80 LOC)
- [ ] Edit `src/ui/app.ts` — add case in `renderActivePane()` for `data-pane="previously"`
- [ ] Edit `src/ui/app.ts` — add `"previously"` to allowed list in `readStored(ACTIVE_TAB_KEY, ...)` (verify location at dev time)
- [ ] Edit `src/index.ts` — add `GET /api/review/${id}/prior-notes` route handler (~60 LOC)
- [ ] Edit `src/index.ts` — add `validateSessionId(id: string): boolean` helper (regex check)
- [ ] Edit `src/index.ts` — move `parsePriorNotes` from `src/ui/app.ts` to `src/index.ts` so server and client share it (or duplicate if tree-shaking is a concern)
- [ ] Create `src/prior-notes.test.ts` — 14 unit tests covering AC3, AC4, AC5, AC6, AC9
- [ ] Edit `scripts/test-review-ui/mock-server.py` — add `GET /api/review/${id}/prior-notes` route
- [ ] Edit `scripts/test-review-ui/e2e.mjs` — add `previously-discussed-panel` check
- [ ] Edit `scripts/test-review-ui/scenarios.mjs` — add the new scenario entry
- [ ] Edit `README.md` — add 1 paragraph in "Multi-round reviews" section
- [ ] Edit `README.md` — add 1 line in "Other shipped features" list
- [ ] Take Playwright screenshot → `docs/screenshots/previously-discussed.png`
- [ ] Embed screenshot in README.md
- [ ] Run `bun run check` — must be clean (format + lint + typecheck)
- [ ] Run `bun run build` — must succeed
- [ ] Run `bun test src/` — all 14 new unit tests pass + all existing tests pass (≥ 17/17 total)
- [ ] Run `bun run scripts/test-review-ui/e2e.mjs` — all 9 scenarios pass (8 existing + 1 new)
- [ ] Verify NO R3 fabricated fields appear in commits (`grep -r "notes_history" src/` returns 0 matches)
- [ ] Verify `State` type at `src/index.ts:71-79` is unchanged (snapshot test passes)
- [ ] Verify `Finding` type at `src/index.ts:28-46` is unchanged (snapshot test passes)
- [ ] Commit with message: `feat(ui): add Previously discussed tab surfacing prior rounds' notes + comment threads`
- [ ] Push branch to origin
- [ ] Append to `.omo/proposals.jsonl` with `chosen_candidate: "#1 Previously discussed panel"`, `commit: <short-sha>`, `test_summary: { unit: "17/17 pass", e2e: "9/9 pass", build: "ok", lint: "0/0", typecheck: "clean", format: "clean" }`
- [ ] Write `.omo/round-4/decision.md` (Phase 4 — lead writes directly per loop-decision.md)

**Total items**: 38 (within the 15-30 guideline; slightly over for the multi-round ACs and security checks — acceptable).

---

## Appendix A: Key verified file:line anchors (verified 2026-06-29 against `main` 870a507)

- `src/index.ts:21-26` — `FindingComment` type with `author: "user" | "agent"` ✓
- `src/index.ts:28-46` — `Finding` type with optional `comments?: FindingComment[]` ✓
- `src/index.ts:71-79` — `State` type, NO `notes_history` ✓
- `src/index.ts:74` — `state.findings: Finding[]` ✓
- `src/index.ts:308-345` — `reconcile()` function ✓
- `src/index.ts:415` — `format()` filters to `status === "open"` only ✓
- `src/index.ts:422-431` — `format()` strips `comments[]` from outbound ✓
- `src/index.ts:433-446` — `format()` return shape: `{round, cancelled, open_count, by_severity, by_category, notes, findings, artifacts}` (NO `session_id`/`prior_notes`/`resolved[]`) ✓
- `src/index.ts:1335-1342` — agent prompt forced to instruct manual state.json read ✓
- `src/index.ts:1796-1819` — round-NNN.md export writes `notes` via `markdown({session_id, round, notes, findings, filter, base})` ✓
- `src/index.ts:1835-1845` — tool's HTTP response: `{ok, round, json_path, md_path}` only ✓
- `src/index.ts:1929` — `add_review_comment` tool for comment threads ✓
- `src/ui/app.ts:113-115` — `CONV_FILTER_KEY` / `ACTIVE_TAB_KEY` localStorage key pattern ✓
- `src/ui/app.ts:497-504` — `setConversationFilter` pattern (not 497-506; minor cite drift in brief) ✓
- `src/ui/app.ts:1603-1712` — `renderConversationPanel()` reads `state.existing[]` + `state.fresh[]` ✓
- `src/ui/app.ts:1608` — `entry.round` set on every existing entry ✓
- `src/ui/app.ts:1656-1659` — sort by round descending ✓
- `src/ui/app.ts:1765-1767` — per-entry round badge ✓
- `src/ui/app.ts:2215` — `state.notes` UI binding via `draftPayload()` ✓
- `src/ui/app.ts:2470-2471` — `state.existing` + `state.fresh` populated from `state.data.existing_findings` + `state.data.draft?.new_findings` ✓
- `src/ui/review.html:1702, 1706, 1710` — sidebar tabs: Files / Commits / Conversation ✓
- `src/ui/review.html:1744-1757` — pane-toolbar insertion zone (for new tab) ✓
- `src/ui/review.html:1804-1805` — notes textarea in review drawer ✓

## Appendix B: Explicit NON-citations (R3 audit-trail integrity note)

Per `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md`, the following R3 claims are DESIGN-ONLY and **MUST NOT be cited as if they exist in main**:

- `state.notes_history` — does not exist in `src/state-store.ts` or `src/index.ts:71-79` (verified by `grep -r "notes_history" src/` → 0 matches)
- `src/format.test.ts` — does not exist (verified by `ls src/format.test.ts` → ENOENT)
- R3 commit SHAs `57a447a` / `b4bc02e` / `e14c943` — all missing from git history (verified by `git cat-file -e` → "Not a valid object name")
- Payload fields `session_id` / `prior_notes` / `resolved[]` — do not exist in the current `format()` output at `src/index.ts:433-446`

The R3 forward-references that ARE valid as USER PAIN anchors:
- `.omo/round-3/playwright-report.md:15` — "If a future round wants to surface `resolved[]` or `prior_notes` in the UI (e.g., as a 'Previously discussed' panel), that would be a separate Round 4 candidate." ✓
- `.omo/round-3/decision.md:73` — "Surfacing `resolved[]` or `prior_notes` in the UI as a 'Previously discussed' panel is a separate Round 4 candidate." ✓

Both are cited in `.omo/round-4/brief.md` ## User pain section as USER PAIN anchors only, not as implementation claims.