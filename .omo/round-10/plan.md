# Plan — Round 10: Saved Replies + Export review + Edit finding

> **Date**: 2026-06-29 · **Architect**: Round 10 Architect (fresh ultrabrain subagent)
> **Pre-check PASS**: HEAD `b616c8a7ba9eca2ed6590467f76b5874435389ac` (current main, verified via `sync-report.md` + R10 brief pre-check)
> **R9 SHAs verified**: `db92b37` ✓ `d5bbafc` ✓ `785e2b2` ✓ (per PM Manager `pm-manager-review.md` Pre-check block)
> **Profile**: architecture (Rule 1: #2 `U_behavior_shift=yes` — server widens previously-rejected category/severity/comment mutation; #2 also `U_data_shape_breaking=yes` because `Finding` gains `manually_edited?` + `edited_at?` fields)
> **GH issues**: #10 (Saved Replies) · #11 (Edit finding) · #14 (Export review)
> **v5 spec deviation**: None — full 7-section plan + 3 atomic commits

## Goal (1-2 sentences)

Ship 3 reviewer-velocity features: **(1) Saved Replies / Comment Templates** with localStorage-only CRUD + one-click insert into the comment box (closes GitHub Saved Replies gap); **(2) Export review as markdown or patch download** from a new header button (closes GitHub `.patch`/`.diff` URL gap); **(3) Edit a finding's category/severity/comment in-place** after submit (architecture profile — extends R9's `manually_reopened` server-widening pattern to a new PATCH endpoint, plausible-unique because GitHub does not allow editing submitted PR review comments).

## Round profile

- **Profile**: **architecture** (Rule 1 fires — any single architecture candidate pulls the round up to architecture)
- **Auto-classification results**:
  - `#1 Saved Replies`: `U_user_visible=yes`, `U_installs_new_dep=no`, `U_behavior_shift=no` → feature
  - `#4 Export review`: `U_user_visible=yes`, `U_installs_new_dep=no`, `U_behavior_shift=no` → feature
  - `#2 Edit finding`: `U_user_visible=yes`, `U_behavior_shift=yes`, `U_data_shape_breaking=yes` (additive), `U_installs_new_dep=no` → **architecture**
- **Architecture profile triggers**: full 7-section plan + 3 atomic commits + lead-synthesized review (R6 patches + R9 retro Gap L)
- **Hard-cap audit**:
  - feature_count: 2 ≤ 3 ✓
  - architecture_count: 1 ≤ 1 ✓ (cannot add Bulk actions per R10 scope)
  - total est_loc: ~750 (under 1000 informal ceiling from R5)
- **Timeout**: **45 min** for Dev (R9 retro Gap L documented architecture rounds naturally take 30–45 min; v5 first round + 3 candidates = upper bound)
- **`/shared/hyperplan` NOT NEEDED**: scope already focused to 3 candidates by PM/PM Manager/Planner chain

## Acceptance Criteria (numbered, testable)

### #1 Saved Replies / Comment Templates (feature, ~150 LOC)

- **AC1.1** (UI button): User can click a "📋 Saved replies" button in the review drawer's comment section to open a dropdown of saved templates.
- **AC1.2** (Save action): A "Save current as template" button in the same comment section prompts for a name (`window.prompt` or inline modal), then persists `{name, body, createdAt}` to `localStorage` under key `opencode-review-dashboard:saved-replies` (JSON-encoded array).
- **AC1.3** (Insert action): Clicking a template in the dropdown inserts its `body` into the comment textarea at the current cursor position (or appends if no cursor focus), then closes the dropdown.
- **AC1.4** (Delete action): Each template row in the dropdown has a "×" delete button; clicking it removes from `localStorage` after a 1-click confirmation (no modal — keep lightweight).
- **AC1.5** (Persistence): Saved templates survive page reload (localStorage round-trip verified by reading after `setItem` → simulate `storage` event).
- **AC1.6** (Empty state): When `localStorage` is empty (or missing), dropdown shows "No saved replies yet — save your first one" hint.
- **AC1.7** (Soft cap): UI shows a count badge next to the dropdown trigger (e.g. "📋 3"). At >100 templates, show a warning indicator (orange dot); at >200, refuse save with an alert.
- **AC1.8** (Unit test): `src/saved-replies.test.ts` — 5 unit tests: save → reload round-trip; insert at cursor position; delete persists; empty state; soft cap enforced at 200.
- **AC1.9** (E2E test): New scenario `saved-replies` in `scripts/test-review-ui/scenarios.mjs` — open review → save 2 templates → reload → insert one into a new finding's comment → assert comment text matches template body + `localStorage` has 2 entries.
- **AC1.10** (Cross-round persistence): Saved replies persist across `/diff-review-dashboard` invocations (localStorage is per-origin, browser-lifetime) — verified by scenario that creates a finding, then simulates round 2 by closing & reopening the URL with same session_id.

### #4 Export review as markdown/patch (feature, ~100 LOC)

- **AC4.1** (UI button): New "Export" button in the page header next to "Submit Review" — single button, opens a modal with 2 format options.
- **AC4.2** (Modal options): Export modal shows two large clickable cards: "Markdown summary (.md)" and "Patch file (.patch)" — clicking either immediately triggers the download + closes the modal.
- **AC4.3** (Markdown content): Generated `.md` includes: `# Review — Round N (<ISO timestamp>)` heading, `## Summary` with finding counts (open/resolved/stale, by severity, by category), `## Findings` table (id, file:line, category, severity, comment excerpt ≤120 chars, status), and `## Notes` section if `data.notes` is non-empty.
- **AC4.4** (Patch content): Generated `.patch` is the unified diff of the current review's `data.files[]` (using `ReviewFile.before` / `after` fields) with finding comments appended as trailing `// REVIEW (<id>): <comment>` lines per file. MIME type served as `text/x-diff` (browsers accept this for `.patch` download).
- **AC4.5** (Filename pattern): Downloads use filenames `review-<round>-<sessionIdShort>-<ts>.md` / `review-<round>-<sessionIdShort>-<ts>.patch` (e.g. `review-3-abc12345-1719700000.md`).
- **AC4.6** (Download mechanism): Client-side `Blob` + `URL.createObjectURL` + `<a download>` synthetic click + `revokeObjectURL` cleanup. No server endpoint needed (state already in browser payload `data`).
- **AC4.7** (Unit test): `src/export-review.test.ts` — 4 unit tests on `generateMarkdownSummary(state)` and `generatePatchFile(files, findings)` helpers: markdown includes round + counts + table; patch includes unified-diff hunks; filename pattern matches; handles empty findings (graceful empty state in markdown).
- **AC4.8** (E2E test): New scenario `export-review` — open review → click Export → click Markdown → assert download triggered with correct filename (via Playwright `expect.poll` on `download.suggestedFilename()`); click Export → click Patch → assert patch content includes `--- a/` and `+++ b/` headers.
- **AC4.9** (No server endpoint): No new HTTP route — pure client-side generation. Reduces attack surface (no `Content-Disposition` risk). Confirmed by absence of new entries in `src/index.ts` for this feature.

### #2 Edit a finding in-place (architecture, ~200 LOC)

- **AC2.1** (UI button): Each finding row in `renderConversationPanel` (`src/ui/app.ts:1756`) gains an "Edit" button next to existing Resolve/Remove/Reopen/Jump. Visible on all statuses (open / resolved / stale — same UX as R9 Reopen).
- **AC2.2** (Modal pre-populate): Clicking Edit opens a modal (reusing the `.conversation-drawer` overlay CSS from R9's `showReopenReasonModal`) with category/severity/comment fields pre-filled from the current finding.
- **AC2.3** (Submit edits): Modal "Save" button sends `PATCH /api/review/:id/findings/:findingId` (new endpoint) with body `{ category?, severity?, comment? }`. Only changed fields sent (partial update); server validates each present field.
- **AC2.4** (Server endpoint): New handler at `src/index.ts` matching `request.method === "PATCH" && pathname === /^\/api\/review\/([^/]+)\/findings\/([^/]+)$/` — extract `id` + `findingId` via regex (matches R8 prior-notes pattern).
- **AC2.5** (Server validation): Endpoint validates: `category` ∈ `{recommend, bug, style, perf, question}` if present; `severity` ∈ `{medium, high, low}` if present; `comment` is string with `≤2000 chars`; rejects empty body (400 "no fields to update"); finds target or 404.
- **AC2.6** (Flag + timestamp): On success, sets `target.manually_edited = true`, `target.edited_at = Date.now()`, appends system comment `{ author: "user", text: "Edited by user" + (changes summary if computable), created_at: Date.now() }` to `target.comments[]`, updates `target.updated_at`, persists via `saveState` (atomic).
- **AC2.7** (Auto-close preserves flag): The auto-close path (unchanged in this round) MUST leave `manually_edited` and `edited_at` as-is — verify via direct unit test on the auto-close mutation function with a synthetic state containing a manually-edited finding.
- **AC2.8** (Mirror to existing_findings): Spread `{...target}` into `data.existing_findings[]` after the save (matches R9 reopen pattern at `src/index.ts:1890`).
- **AC2.9** (UI badge): After edit, render a small "edited <relative-time>" badge (e.g. "edited 3m ago") near the existing `stale` / `user-reopened` badge in the finding row.
- **AC2.10** (UI cancel safety): Edit modal "Cancel" button + `Esc` keypress + click-outside-drawer all close without saving (no confirm dialog needed because no fields have been mutated server-side yet).
- **AC2.11** (Unit test): `src/edit-finding.test.ts` — 8 unit tests: server accepts valid category change; server accepts valid severity change; server accepts valid comment change; rejects invalid category (400); rejects invalid severity (400); rejects comment > 2000 chars (400); rejects empty body (400); flag set + system comment appended + auto-close preserves flag (the multi-round AC2.7).
- **AC2.12** (E2E test): New scenario `edit-finding` — open review → submit with 1 finding → find the finding row → click Edit → change severity high → low → save → assert badge "edited 0s ago" appears + `data.existing_findings[i].severity === "low"` + `data.existing_findings[i].manually_edited === true`.
- **AC2.13** (Agent prompt notice): Add a 1-line bullet to `src/index.ts:1462` block (next to the `manually_reopened` honor directive) noting: "If `state.json`'s `findings[]` contains a finding with `manually_edited: true`, the user has corrected the category/severity/comment — your auto-apply reasoning should re-read those fields as the user's current intent." (analogous to R9 AC9-1.7).

## File changes

| File | Change | LOC est | Notes |
|---|---|---|---|
| `src/index.ts` | New `PATCH /api/review/:id/findings/:findingId` handler (~80 LOC) + Finding type fields (`manually_edited?: boolean`, `edited_at?: number`) (~5 LOC) + 1-line agent prompt notice (~3 LOC) | ~90 | Architecture: server widens mutation (extends R9 reopen pattern) |
| `src/state-store.ts` | No code change — state is opaque JSON, additive fields are handled by `saveState` automatically. (Mention only in case Dev wonders.) | 0 | Documented; no diff |
| `src/ui/app.ts` | Saved Replies CRUD + dropdown (AC1.1–1.7) (~120 LOC); Export modal + helpers (AC4.1–4.6) (~90 LOC); Edit modal + `editFinding()` PUT call + badge (AC2.1–2.3, 2.9–2.10) (~80 LOC); ConversationEntry type widens for `manually_edited` + `edited_at` (~3 LOC) | ~290 | All 3 features touch app.ts — split into 3 commits to keep them atomic |
| `src/ui/review.html` | 1 small section for Export button (header) + 1 small section for Edit button (in `renderConversationPanel` row template) + dropdown markup anchor for Saved Replies | ~30 | HTML-only changes (CSS class hooks) |
| `src/saved-replies.test.ts` (NEW) | 5 unit tests for Saved Replies CRUD (AC1.8) | ~70 | NEW file |
| `src/export-review.test.ts` (NEW) | 4 unit tests for `generateMarkdownSummary` + `generatePatchFile` (AC4.7) | ~60 | NEW file |
| `src/edit-finding.test.ts` (NEW) | 8 unit tests for PATCH endpoint + auto-close preservation (AC2.11) | ~100 | NEW file |
| `scripts/test-review-ui/scenarios.mjs` | Add `saved-replies`, `export-review`, `edit-finding` scenarios (~50 LOC each for header/registration) | ~60 | 3 new e2e scenarios |
| `README.md` | Saved Replies section (3 paragraphs) + Export section (2 paragraphs) + Edit section (2 paragraphs) + e2e scenario count bump (20 → 23) | ~70 | English only this round (per scope) |

**Total: ~770 LOC across 8 changed files** (some files overlap in touch points but counted separately per-file).

## Implementation steps

### Phase A: Saved Replies (#1) — 15-20 min

1. **A.1** Add `SavedReplies = { name: string; body: string; createdAt: number }[]` type to `src/ui/app.ts` near other UI-only types.
2. **A.2** Add helper functions: `loadSavedReplies(): SavedReplies` (read + JSON.parse + try/catch return `[]`), `saveSavedReplies(list)`, `addSavedReply(name, body)` (push + soft-cap at 200).
3. **A.3** Add `renderSavedRepliesDropdown()` — renders list of saved replies with insert + delete buttons; mounts into review drawer comment section.
4. **A.4** Add "📋 Saved replies" button + "Save current as template" button to review drawer HTML (`src/ui/review.html` + corresponding `app.ts` mount code).
5. **A.5** Wire `insertSavedReply(templateId)` → sets `commentTextarea.value` at cursor position (helper `insertAtCursor(textarea, text)` handles both focused-cursor and no-focus cases).
6. **A.6** Write `src/saved-replies.test.ts` with 5 unit tests (AC1.8).
7. **A.7** Add e2e scenario `saved-replies` to `scripts/test-review-ui/scenarios.mjs` (AC1.9).
8. **A.8** Commit Phase A: `feat(saved-replies): localStorage CRUD + insert into comment (R10 #1, GH#10)`.

### Phase B: Export review (#4) — 10-15 min

1. **B.1** Add `generateMarkdownSummary(state: { round, findings, notes, session_id }): string` helper in `src/ui/app.ts` (~40 LOC, pure function — easy to unit test).
2. **B.2** Add `generatePatchFile(files: ReviewFile[], findings: Finding[]): string` helper (~30 LOC, produces unified-diff with `// REVIEW` annotations).
3. **B.3** Add `triggerDownload(blob: Blob, filename: string)` helper (~10 LOC, uses `URL.createObjectURL` + synthetic `<a download>` click).
4. **B.4** Add "Export" button to header in `src/ui/review.html` + mount in `app.ts`.
5. **B.5** Add `showExportModal()` — modal with 2 format cards; click → call helper → close modal.
6. **B.6** Write `src/export-review.test.ts` with 4 unit tests (AC4.7).
7. **B.7** Add e2e scenario `export-review` to `scripts/test-review-ui/scenarios.mjs` (AC4.8).
8. **B.8** Commit Phase B: `feat(export-review): markdown + patch download from header (R10 #4, GH#14)`.

### Phase C: Edit finding (#2 — architecture) — 20-25 min

1. **C.1** Add `manually_edited?: boolean` + `edited_at?: number` to `Finding` type in `src/index.ts:28-47` (between `manually_reopened?` line 45 and `comments?` line 46 — additive, defaults `undefined`).
2. **C.2** Add `manually_edited?: boolean` + `edited_at?: number` to `ConversationEntry` mirror type in `src/ui/app.ts` (next to `manually_reopened` from R9).
3. **C.3** Implement `PATCH /api/review/:id/findings/:findingId` handler in `src/index.ts` (new `if (request.method === "PATCH" && ...)` block after the comment handler ~line 1949, before the submit handler). Validate category/severity enum + comment length, set flags, append system comment, atomic save via `saveState`, mirror to `data.existing_findings[]`.
4. **C.4** Add 1-line agent-prompt notice at `src/index.ts:1462` block (next to `manually_reopened` honor directive) — analogous to R9 AC9-1.7.
5. **C.5** Add `editFinding(id, fields: { category?, severity?, comment? }): Promise<void>` async function in `src/ui/app.ts` — sends PATCH, updates local state on success, refreshes conversation panel.
6. **C.6** Add `showEditFindingModal(finding): Promise<{category, severity, comment} | null>` — reuses `.conversation-drawer` overlay CSS from R9; pre-populates fields; Save / Cancel / Esc / click-outside close.
7. **C.7** Add "Edit" button in `renderConversationPanel` row template (`src/ui/app.ts:1756`+; update `src/ui/review.html` if needed for CSS class hook).
8. **C.8** Add "edited <relative-time>" badge rendering — when `entry.manually_edited === true`, show small badge near status badge with `formatRelativeTime(entry.edited_at)`.
9. **C.9** Write `src/edit-finding.test.ts` with 8 unit tests (AC2.11) — including the multi-round AC2.7 test that calls the auto-close mutation function with a synthetic state containing a manually-edited finding.
10. **C.10** Add e2e scenario `edit-finding` to `scripts/test-review-ui/scenarios.mjs` (AC2.12).
11. **C.11** Commit Phase C: `feat(edit-finding): in-place category/severity/comment edit + manually_edited flag (R10 #2, GH#11, architecture)`.

### Phase D: Docs + verify — 5-10 min

1. **D.1** Update `README.md` — add Saved Replies section, Export section, Edit section, bump e2e scenario count 20 → 23.
2. **D.2** Run `bun run check` (format:check + lint + typecheck) — clean.
3. **D.3** Run `bun run test:unit` — all unit tests pass (target: 102 + 5 + 4 + 8 = 119 tests pass / 0 fail; Dev should hit 117+ even if one test is gated).
4. **D.4** Run `bun run scripts/test-review-ui/e2e.mjs` — all 23 scenarios pass (was 20; +3 new).
5. **D.5** Run `bun run build` — clean (writes `dist/plugin/index.mjs` + `dist/ui/`).
6. **D.6** Commit docs: `docs(round-10): Saved Replies + Export + Edit sections + scenario count 20 → 23`.

## Test plan

- **Unit tests** (17 new across 3 NEW files):
  - `src/saved-replies.test.ts` — 5 tests: round-trip; cursor-position insert; delete persists; empty state; soft cap at 200.
  - `src/export-review.test.ts` — 4 tests: markdown shape; patch shape; filename pattern; empty-findings graceful.
  - `src/edit-finding.test.ts` — 8 tests: category/severity/comment valid; invalid category (400); invalid severity (400); comment > 2000 chars (400); empty body (400); flag set + system comment appended; auto-close preserves flag (multi-round AC2.7).
- **E2E tests** (3 new scenarios in `scripts/test-review-ui/scenarios.mjs`):
  - `saved-replies` — save 2 templates → reload → insert one into finding comment → verify localStorage + DOM.
  - `export-review` — click Export → Markdown → verify download filename + content; click Export → Patch → verify `.patch` content includes `--- a/` and `+++ b/`.
  - `edit-finding` — submit with 1 finding → Edit → change severity high→low → Save → verify badge + `data.existing_findings[i]` updated.
- **Build/lint/typecheck/format**: `bun run check` + `bun run build` — clean.
- **Playwright walkthrough** (Gap J MANDATORY, lead-executed per R9 Gap L pattern): all 3 features demo + 0 console errors. Screenshots: `saved-replies-dropdown.png`, `export-modal-markdown.png`, `export-modal-patch.png`, `edit-finding-modal.png`, `edit-finding-badge.png`.
- **Manual verification** (out of e2e harness scope): real OpenCode session runs `/diff-review-dashboard` + uses Saved Replies + clicks Export + clicks Edit on a finding.

## Per-AC classification (MUST be done before writing tests)

For each AC, classify **round-1 testable** (verifiable in single e2e scenario) vs **multi-round testable** (requires unit test on state-builder function because e2e harness can't simulate round transitions easily):

| AC | Round-1? | Multi-round? | Test type |
|---|---|---|---|
| AC1.1–1.7 | YES | NO | E2E `saved-replies` scenario + manual inspection |
| AC1.8 | YES | NO | 5 unit tests in `saved-replies.test.ts` |
| AC1.9 | YES | NO | E2E scenario |
| AC1.10 | YES | NO | E2E scenario (close & reopen URL = same session_id in mock server) |
| AC4.1–4.6 | YES | NO | E2E `export-review` scenario + DOM inspection |
| AC4.7 | YES | NO | 4 unit tests in `export-review.test.ts` (pure helpers) |
| AC4.8 | YES | NO | E2E scenario with Playwright `download.suggestedFilename()` |
| AC4.9 | YES | NO | Code-review confirmation (no new endpoint) |
| AC2.1–2.6 | YES | NO | E2E `edit-finding` scenario + server unit tests |
| **AC2.7** (auto-close preserves flag) | NO | **YES** | **Direct unit test on auto-close mutation function with synthetic state** |
| AC2.8 | YES | NO | Unit test on PATCH handler |
| AC2.9–2.10 | YES | NO | E2E scenario + DOM inspection |
| AC2.11 | YES | NO (mostly) | 8 unit tests in `edit-finding.test.ts` — includes AC2.7 as a multi-round sub-test |
| AC2.12 | YES | NO | E2E scenario |
| AC2.13 | YES | NO | Substring assertion on agent prompt template |

**Multi-round test-design (R3 lesson)**: AC2.7 is the only AC that requires a direct unit test on the state-mutation function because the e2e harness does not easily simulate the multi-round auto-close scenario. Dev MUST write a synthetic test:

```typescript
// In src/edit-finding.test.ts
test("AC2.7: auto-close does NOT clear manually_edited flag (multi-round)", () => {
  const state = syntheticStateWith({
    findings: [{
      id: "F-001",
      status: "open",
      manually_edited: true,
      edited_at: 1719700000,
      // ... other fields
    }],
  });
  const afterAutoClose = applyAutoClose(state, /* diff-drift triggers */);
  expect(afterAutoClose.findings[0].manually_edited).toBe(true);
  expect(afterAutoClose.findings[0].edited_at).toBe(1719700000);
});
```

## Risk register

| # | Risk | Mitigation |
|---|---|---|
| 1 | PATCH endpoint widens mutation → could be exploited by bad client payload | Server validates each present field independently (category∈enum, severity∈enum, comment string ≤2000 chars); rejects empty body (400 "no fields to update"); atomic write via `saveState`; system comment preserves audit trail |
| 2 | localStorage quota exceeded with many saved replies | UI shows count badge; soft cap at 200 templates (refuse save with alert); matches GitHub's "max 100 saved replies" guidance with our 200 cap for browser localStorage generous limits |
| 3 | Export patch file differs from real `git diff` if worktree state changes | Export snapshots the current `data.files[]` at click time (already in browser payload); no server round-trip needed |
| 4 | Edit modal accidentally saves comment when user cancels | "Cancel" button + `Esc` keypress + click-outside-drawer all close without sending PATCH; Save button is the only path to mutation |
| 5 | Architecture timeout (45 min cap) per R9 retro Gap L | Split into 3 atomic commits (one per candidate), each independently shippable; Phase C (Edit) starts with state-store/types so an early-stop still leaves valid partial work |
| 6 | R3-style fabrication: missing SHAs in plan vs reality | Phase 2.5 Pre-Commit Audit (`git cat-file -e` on all referenced SHAs + reverse-grep competitor claims) catches this BEFORE push; plan already references verified SHAs only (b616c8a baseline + db92b37/d5bbafc/785e2b2 R9 closure) |
| 7 | v5 first round: bugs in v5 spec discovered mid-implementation | Lead can roll back via `git revert` if needed (see SKILL.md `## Rollback protocol`); plan splits into 3 atomic commits so a partial revert is possible |
| 8 | Agent-prompt 1-line addition breaks numbering (R9 R9-2 risk recurred) | New line is appended to existing `manually_reopened` block; no renumbering of existing 1./2./3./4./5. steps; verify in 3c walkthrough |
| 9 | PATCH endpoint URL pattern conflict with existing routes | Use `request.method === "PATCH"` (no existing PATCH routes — verified via grep) + regex `^\/api\/review\/([^/]+)\/findings\/([^/]+)$/` (matches R8 prior-notes `^\/api\/review\/([^/]+)\/prior-notes$` pattern) |
| 10 | `manually_edited` + `edited_at` fields break R1-R9 `state.json` reads | Both fields are optional (`?`) with default `undefined`; R9 retro Risk R9-1 already verified additive optional fields are backward-compatible; same pattern |
| 11 | Export helper unit tests depend on browser globals (Blob, URL) | Helpers return strings only; `triggerDownload(blob, filename)` is a thin wrapper not unit-tested (covered by e2e); unit tests focus on pure string generation |
| 12 | `renderConversationPanel` action branch grows beyond 4 actions (Edit joins Resolve/Remove/Reopen/Jump) | Layout wraps on small screens; if CSS gap discovered in 3c walkthrough, defer to R11 follow-up (mirrors R9 R9-3 mitigation) |

## Worker hand-off checklist (25 items)

- [ ] Read this `plan.md` + `brief.md` + `pm-manager-review.md` + `competitor-landscape.md` + `planner.md`
- [ ] Verify baseline main HEAD SHA = `b616c8a7ba9eca2ed6590467f76b5874435389ac` via `git cat-file -e b616c8a7ba9eca2ed6590467f76b5874435389ac`
- [ ] Verify R9 closure SHAs exist: `db92b37`, `d5bbafc`, `785e2b2` (3/3 must PASS — PM Manager verified)
- [ ] Create worktree at `$HOME/.worktrees/team-dev-loop-round-10` (use `$HOME` template, NOT hardcoded path — R3 lesson)
- [ ] Branch `team-dev-loop-round-10-saved-replies-export-edit`
- [ ] Implement Phase A (Saved Replies) — localStorage CRUD + dropdown + insert
- [ ] Write `src/saved-replies.test.ts` with ≥5 unit tests
- [ ] Implement Phase B (Export review) — markdown helper + patch helper + modal + download trigger
- [ ] Write `src/export-review.test.ts` with ≥4 unit tests
- [ ] Implement Phase C (Edit finding — start with `src/index.ts` Finding type additions + state-store types if needed)
- [ ] Add PATCH `/api/review/:id/findings/:findingId` handler with validation
- [ ] Add 1-line agent-prompt notice near `manually_reopened` block
- [ ] Add `editFinding()` + `showEditFindingModal()` + Edit button + badge in UI
- [ ] Write `src/edit-finding.test.ts` with ≥8 unit tests (including AC2.7 multi-round synthetic test)
- [ ] Add 3 e2e scenarios (`saved-replies`, `export-review`, `edit-finding`) to `scripts/test-review-ui/scenarios.mjs`
- [ ] Register 3 new scenarios in `scripts/test-review-ui/e2e.mjs` runner
- [ ] Run `bun run check` — clean (format + lint + typecheck)
- [ ] Run `bun run test:unit` — all pass (target 117+ tests; was 102 in R9)
- [ ] Run `bun run scripts/test-review-ui/e2e.mjs` — all 23 scenarios pass (was 20)
- [ ] Run `bun run build` — clean (writes `dist/`)
- [ ] Commit Phase A atomically: `feat(saved-replies): localStorage CRUD + insert into comment (R10 #1, GH#10)`
- [ ] Commit Phase B atomically: `feat(export-review): markdown + patch download from header (R10 #4, GH#14)`
- [ ] Commit Phase C atomically: `feat(edit-finding): in-place category/severity/comment edit + manually_edited flag (R10 #2, GH#11, architecture)`
- [ ] Update README.md (Saved Replies + Export + Edit sections + e2e scenario count 20 → 23)
- [ ] Commit docs: `docs(round-10): Saved Replies + Export + Edit sections + scenario count 20 → 23`
- [ ] Run Phase 2.5 Pre-Commit Audit inline (`git cat-file -e` on all SHAs + reverse-grep competitor claims)
- [ ] Final: 5 commits (3 product + 2 test/docs) + worktree pushed to origin + PR description ready
- [ ] Hand back to lead for Phase 3a (Tester Review 5 lens) + 3b (Tester Diff — lead default per R9 patch) + 3c (Playwright walkthrough — lead default per R9 patch) + 3.5 (PM Doc Writer — lead default for small work) + 4 (Decision) + 4.5–4.9 (lead-owned)

## Architecture rationale (extends R9)

The Edit finding candidate (#2) follows the **same architectural pattern as R9 Force Reopen** because they share the same risk profile:

1. **Server widens a previously-rejected transition**: R9 allowed `closed_auto → open` (with `manually_reopened: true`); R10 allows field mutation on existing findings (with `manually_edited: true`).
2. **Agent prompt gains a new honor-flag directive**: R9 added `manually_reopened` honor paragraph; R10 adds a parallel `manually_edited` notice (1-line, not a full paragraph — smaller surface).
3. **System comment preserves audit trail**: R9 appends "Manually reopened: <reason>" to `comments[]`; R10 appends "Edited by user" with a changes summary.
4. **Auto-close preserves the flag**: R9 verified auto-close leaves `manually_reopened` untouched (R9 R9-1 mitigation); R10 must verify the same for `manually_edited` (AC2.7 — explicit multi-round test per R3 lesson).
5. **State additive, backward-compatible**: Both flags use `?` optional with default `undefined`; R1-R9 `state.json` reads cleanly.

The R9 retro identified Gap L (architecture rounds take 30–45 min); this plan inherits that and explicitly budgets 45 min for Dev. The 3-candidate split also means each commit is independently shippable — if Phase C runs long, Phase A+B are already in main and R10 can still ship "feature-only" without Edit.

(End of plan — total ~770 LOC / 8 changed files / 1 architecture + 2 feature / 17 new unit tests + 3 new e2e scenarios. Verdict: PROCEED with 3 atomic commits.)