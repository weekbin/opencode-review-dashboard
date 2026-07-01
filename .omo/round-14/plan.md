# R14 Plan — Sort + Filter Previously + Auto-save indicator (3 micro-features)

## Goal
Ship 3 additive lightweight features that completed the R13 deferred bundle: sort findings dropdown (#23), filter Previously-discussed by round (#25), and persistent draft auto-save indicator (#24). All 3 close competitor gaps (GitHub / Linear / Google Docs / Notion / VS Code patterns). Profile = **feature**, Dev timeout **30 min** (R9 retro Gap L). Worktree `$HOME/.worktrees/team-dev-loop-round-14`, branch `team-dev-loop-round-14-sort-filter-autosave`.

## Acceptance Criteria

| AC | Tag | Description | Evidence target |
|---|---|---|---|
| AC1 [R1] | Sort dropdown UI | Conversation panel toolbar gains "★ Sort" dropdown with 4 options: Newest first / Oldest first / Severity high→low / File path A-Z; default = "Newest first" (existing chronological) | `src/ui/app.ts:2230-2270 renderConversationPanel` + `src/ui/review.html` chip toolbar |
| AC2 [R1] | Sort is sticky per-session | Selection persists in `localStorage` `state.sortFindingsBy` (NOT `sessionStorage` — survives reload); default fallback to "newest" if missing/invalid | `src/ui/app.ts:133-149 readStored/writeStored` pattern |
| AC3 [R1] | Sort doesn't trigger re-fetch | Sort is pure client-side reducer over `state.existing_findings + state.fresh`; no network call | `src/ui/app.ts:2235-2270` sort reducer (mirrors `filterByQuery` at `:2273-2276`) |
| AC4 [R1] | Previously-discussed filter chip | Sidebar tab "Previously discussed" gains a `<select>` chip with options: "All rounds" / "Round N" (one option per existing round); default = "All" | `src/ui/app.ts:2943 renderPreviouslyDiscussedPanel` |
| AC5 [R1] | Filter state persists | Selected round persists in `state.previouslyFilterByRound` (in-memory, NOT localStorage — round filter is session-scoped) | new field on `state.existing` reducer |
| AC6 [R1] | Filter is additive to search | Filtered-down subset goes through existing R8 in-tab search (search composes; doesn't reset filter) | `src/ui/app.ts:2943` search input bar stays as-is |
| AC7 [R1] | Auto-save header indicator | Header shows "Saved X seconds ago" persistent indicator near draft state; intrusively replacing the `setStatus("Draft saved at HH:MM:SS")` toast | `src/ui/app.ts:3725-3740 scheduleSave` + `setStatus` call site |
| AC8 [R1] | Indicator ticks every 5s | "X seconds ago" updates every 5s via `setInterval`; cleared after 60s of no saves (back to "All changes saved") | new `startAutoSaveIndicator()` + `setInterval` |
| AC9 [R1] | State preserved across reload | Indicator reads from existing `state.draft.lastSavedAt: number` (NEW field on `Draft` type — backwards-compatible: default to 0 = "no recent save") | `src/index.ts:79-83 Draft` type widening |

**Multi-round AC confirmation**: All 9 are `[R1]` (round-1 ground truth, single-round verifiable). No multi-round ACs.

## File changes

| File | Change |
|---|---|
| `src/index.ts` | Add `Draft.lastSavedAt?: number` at `:79-83`; set in `scheduleSave` after atomic write completes (analogous to existing `saved_at` field) |
| `src/ui/app.ts` | Sort dropdown (AC1-AC3, ~40 LOC); Previously-discussed `<select>` filter (AC4-AC6, ~30 LOC); Auto-save indicator (AC7-AC9, ~50 LOC). Total ~120-180 LOC across 1 file |
| `src/ui/review.html` | Auto-save indicator CSS (`.save-indicator` + `.save-indicator.pulse-on-save`); Sort + filter dropdown CSS (~15 LOC) |
| `README.md` | 3 new bullets in "Other shipped features" + 1 tip in keyboard-shortcuts block |
| `src/draft-autosave.test.ts` (new) | 8 unit tests (AC7-AC9 + 5 defense-in-depth) |

## Implementation steps

1. Read `.omo/round-14/plan.md` (this file) first.
2. Worktree: `$HOME/.worktrees/team-dev-loop-round-14`, branch `team-dev-loop-round-14-sort-filter-autosave`, baseline `c9b2771`.
3. **Sort dropdown** (#1): add `<select class="sort-findings">` next to existing 5 filter chips; add `state.sortFindingsBy: "newest"|"oldest"|"severity"|"file"`; render `<FindingCard>` in conversation via sort-reducer at `:2230-2270`; persist to localStorage `state.sortFindingsBy` (mirrors `readStored/writeStored`).
4. **Previously-discussed filter** (#2): add `<select class="filter-previously-by-round">` chip at top of `renderPreviouslyDiscussedPanel`; populate options from unique round numbers in `state.findings`; default = "all".
5. **Auto-save indicator** (#3): add `Draft.lastSavedAt?: number` to `src/index.ts:79-83`; set in `scheduleSave` after `await saveState()`; replace `setStatus("Draft saved at HH:MM:SS")` with persistent indicator in header; `startAutoSaveIndicator()` ticks every 5s.
6. Run `bun run check && bun run build && bun test` after each feature commit (per-feature atomic, 3 commits total).
7. **MANDATORY pre-commit verify** per R12 retro Gap 3 / SG.1: `wc -l src/ui/app.ts src/index.ts src/ui/review.html scripts/test-review-ui/scenarios.mjs` (baseline post-R13: ????? / ????? / ????? / 33 entries) + log to `.omo/round-14/dev-report.md`.
8. Verify 6 R13 ACs regressions (unit test for lastSavedAt captures in autorun e2e) + 8 new ACs.
9. Atomic commits: `feat(r14): sort findings dropdown (close #23)` + `feat(r14): previously-discussed filter (close #25)` + `feat(r14): draft auto-save indicator (close #24)` + `test(round-14): 1 unit-test file (8 new tests)`.
10. Update `README.md`: 3 new bullets + 1 keyboard-shortcut tip; verify no other count claims drift.
11. Final verify: `bun run check && bun run build && bun run test:unit && bun run scripts/test-review-ui/e2e.mjs` (33 existing + 0 new e2e — R14 has no new e2e since candidates are UI-only polish) all PASS.
12. **Forbidden**: do NOT cite any count without `wc -l <source-of-truth>` first (R12 retro Gap 3 / SG.1 lesson).

## Test plan

**Unit (8 new tests in `src/draft-autosave.test.ts`)**:
- AC7: indicator re-renders "Saved Xs ago" every 5s (mocked `setInterval`)
- AC7: indicator hidden when no `lastSavedAt`
- AC8: indicator transitions to "All changes saved" after 60s of no saves
- AC9: `localStorage` round-trip preserves `state.sortFindingsBy`
- AC9: invalid `state.sortFindingsBy` falls back to "newest"
- AC9: `state.previouslyFilterByRound` does NOT persist (session-scoped only)
- Sort reducer: severity high→low orders `high` before `medium` before `low`
- Sort reducer: file path A-Z orders alphabetically case-insensitively

**E2e (0 new — UI polish candidates)**: All 33 existing scenarios must pass (regression check).

## Risk register

1. **Sort dropdown may fight with R8 in-tab search filter** — mitigation: sort applied BEFORE filterByQuery (compose semantics); explicitly test compose in AC3 + AC6.
2. **`lastSavedAt` field is a new addition to `Draft` type** — mitigation: type as `?: number` (optional), exhaustive default to 0; existing `state.json` files (R12 or earlier) load with default = 0 = "no recent save" → indicator hidden, no regression.
3. **Previously-discussed round filter could be confusing** — when rounds change mid-session, the filter row gets stale options. Mitigation: filter row dynamically rebuilds from `state.findings` on every render (cheap; ~5 items max).
4. **E2e scenarios count was 33 in R13 audit-correct grep** — R14 is no-e2e-additive (UI polish). Doc side-file drift (R12 retro Gap 3 / SG.1): do NOT claim a scenario count change unless verified via grep.
5. **Auto-save indicator may flicker** when `lastSavedAt` updates frequently — mitigation: `requestAnimationFrame` coalesce to next frame; `lastSavedAt` set ONLY after `await saveState()` resolves (not in the `setStatus` callback).

## Worker hand-off checklist

1. Read `.omo/round-14/plan.md` (this file) FIRST.
2. Worktree: `$HOME/.worktrees/team-dev-loop-round-14`; branch `team-dev-loop-round-14-sort-filter-autosave`; baseline `c9b2771` (R13 closure).
3. **#1 Sort dropdown**: add `<select class="sort-findings">` next to existing 5 filter chips in `src/ui/review.html` chip toolbar; persist via existing `readStored/writeStored` localStorage helpers.
4. **#2 Previously-discussed filter**: add `<select class="filter-previously-by-round">` chip above the search input in `renderPreviouslyDiscussedPanel`; options rebuild from unique round numbers.
5. **#3 Auto-save indicator**: add `Draft.lastSavedAt?: number` field at `src/index.ts:79-83`; set in `scheduleSave` AFTER `await saveState()` resolves; replace toast with persistent indicator.
6. Run `bun run check` (format + lint + typecheck) MUST be clean after EACH of the 3 feature commits.
7. Run `bun run test:unit` (8 new tests + 229 existing = 237 total) after all 3 features land.
8. **MANDATORY pre-commit verify** (R12 retro Gap 3 / SG.1): `wc -l src/ui/app.ts src/index.ts src/ui/review.html scripts/test-review-ui/scenarios.mjs` (baseline post-R13: **4568 / 2491 / 2431 / 33 entries** [verified at plan-write time per R12 patch Gap #4 reverse-validate]) + log to `.omo/round-14/dev-report.md` BEFORE merging.
9. **Forbidden**: do NOT claim any count without `wc -l <source-of-truth>` first (R12 retro Gap 3 / SG.1 lesson applied).
10. 3 atomic commits: `feat(r14): sort findings dropdown (close #23)`, `feat(r14): previously-discussed filter (close #25)`, `feat(r14): draft auto-save indicator (close #24)`. Do NOT squash.
11. Update `README.md` "Other shipped features" — 3 new bullets + keyboard shortcut tip.
12. **Verify R13 regressions**: existing 229 unit tests + 33 e2e scenarios all PASS before merge.
13. Final verify all 4 gates: `bun run check && bun run build && bun test && bun run scripts/test-review-ui/e2e.mjs`.
14. Audit trail: write `.omo/round-14/dev-report.md` + `.omo/round-14/test-report.md` + `.omo/round-14/post-exec-analysis.md`.
15. Commit msg closes #23, #24, #25 via `close #N` syntax (auto-close via GitHub).

## Multi-round AC confirmation

All 9 R14 ACs are `[R1]` (round-1 ground truth, single-round verifiable). No multi-round ACs require direct unit tests on round-transition helpers. Sort + filter are client-side reducers; auto-save indicator reads `state.draft.lastSavedAt` which is a per-round field (round-N save = round-N indicator).
