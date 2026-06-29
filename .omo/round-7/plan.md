# Round 7 Plan — R4 MINOR Bundle (#1 AbortController + #2 UI hint)

> **Date**: 2026-06-29
> **Architect**: Round 7 Architect
> **Profile**: feature (Rule 2: `U_user_visible=yes` + `total=3`; PM Manager-verified)
> **Bundle**: #1 AbortController for `loadPriorNotes` + #2 UI hint "prior rounds only"
> **Expected LOC**: ~20-25 in `src/ui/app.ts` only (vs R6's 35 — smaller scope)

## 1. Goal

Ship two R4-retro polish items bundled in one round: (a) cancel in-flight prior-notes fetches when the reviewer switches away from the "Previously discussed" tab, fixing a silent tab-switch race condition; (b) show a small subheader at the top of the "Previously discussed" panel explaining that it shows prior rounds only (the current round's findings live in the Conversation tab). Both changes are localized to `src/ui/app.ts` and improve dashboard UX without changing state schema or behavior on the happy path.

## 2. Acceptance Criteria

### Sub-candidate #1 ACs (AbortController for `loadPriorNotes`)

- **AC7-1.1** [unit]: `loadPriorNotes(signal)` — when `signal.aborted === true` at entry, returns immediately, no `state.priorNotes` mutation, no throw.
- **AC7-1.2** [unit]: when `signal` aborts mid-fetch, the handler skips `state.priorNotes = ...` at line 1906; `AbortError` falls through the catch at line 1907.
- **AC7-1.3** [unit]: happy path — when `signal` not aborted, behavior unchanged; existing 64 unit tests still pass.
- **AC7-1.4** [e2e, new scenario `previously-discussed-race`]: rapidly click "Previously discussed" → "Conversation" → "Previously discussed"; assert no stale render in `#previously-list`.

### Sub-candidate #2 ACs (UI hint "prior rounds only" in the Previously discussed panel)

- **AC7-2.1**: When `currentRound > 1` (line 1915), `renderPreviouslyDiscussedPanel` prepends a `<p class="previously-panel-hint">` in the non-empty branch (between line 1936 and the `for` loop at line 1937) explaining prior-rounds-only scope and pointing to the Conversation tab.
- **AC7-2.2**: When `currentRound <= 1`, no hint — the empty-state branch (line 1929-1934) is self-explanatory.
- **AC7-2.3**: Hint text concise (≤2 lines, ≤200 chars).
- **AC7-2.4** [e2e, new scenario `previously-discussed-hint`]: round 2+ has `.previously-panel-hint` in `#previously-list`; round 1 has it absent.

### Cross-cutting

- **AC7-X1**: 64 existing unit tests pass + 3 new (`signal-aborted-at-entry`, `signal-aborted-mid-fetch`, `happy-path-no-abort`).
- **AC7-X2**: `bun run check` clean + `bun run build` clean + 16 existing e2e scenarios pass + 2 new (total 18).
- **AC7-X3**: R7 commit SHAs `git cat-file -e` PASS (R4 retro Gap 1).
- **AC7-X4**: Pre-flight — 5 R6 SHAs `git cat-file -e` PASS (already verified in brief.md:15; re-confirm at worktree creation).
- **AC7-X5**: No `state.json` schema change; no new payload field; no new dependency.

## 3. File changes

### `src/ui/app.ts` — only file touched (~20-25 LOC)

#### #1 AbortController for `loadPriorNotes` (lines 1894-1910, call site 1333-1336)

- Add module-level `let priorNotesController: AbortController | null = null;` near the top (after `state` declaration, ~line 378).
- Change signature: `async function loadPriorNotes(signal?: AbortSignal): Promise<void>` (line 1894).
- At function entry (before `priorNotesLoaded` short-circuit at line 1895): `if (signal?.aborted) return;` — covers AC7-1.1.
- After `fetch` (line 1898): pass `{ signal }`; before parsing/mutation at line 1906 add `if (signal?.aborted) return;` — covers AC7-1.2.
- Catch at line 1907 already swallows errors; `AbortError` falls through silently.
- Update call site at line 1334: `priorNotesController?.abort(); priorNotesController = new AbortController();` then pass `priorNotesController.signal` into `loadPriorNotes`.
- At top of `renderActivePane` (line 1322): if `state.activeTab !== "previously"`, `priorNotesController?.abort()` — covers tab-away case (line 478 `setActiveTab` changes away without re-entering the `previously` branch).

#### #2 UI hint in `renderPreviouslyDiscussedPanel` (lines 1912-1937)

Insert between line 1936 (end of empty-state branch return) and the `for` loop at line 1937 — PM Manager-confirmed placement, non-empty branch only:

```typescript
if (currentRound > 1) {
  const hint = document.createElement("p");
  hint.className = "previously-panel-hint";
  hint.textContent = `Showing prior rounds only (round ${currentRound - 1} and earlier). The current round's findings are in the Conversation tab.`;
  root.appendChild(hint);
}
```

`currentRound` already computed at line 1915 — no new state read. Guarded by `currentRound > 1` per AC7-2.2.

### Other files

- `src/ui/review.html`: no change needed (existing `<p>` styling covers `.previously-panel-hint`).
- `src/ui/app.test.ts` (new or extended): +30 LOC for 3 unit tests using synthetic `AbortController` + mock `fetch`.
- `scripts/test-review-ui/scenarios.mjs`: +60-80 LOC for 2 scenarios (`previously-discussed-race`, `previously-discussed-hint`).
- **No other files touched**.

## 4. Steps

1. **Pre-flight + worktree**: Verify R6 SHAs `git cat-file -e` PASS (brief.md:15 already documented; re-confirm at worktree creation per AC7-X4). Create worktree at `$HOME/.worktrees/team-dev-loop-round-7-r4-minor/` on branch `team-dev-loop-round-7-r4-minor` from `main` HEAD.
2. **Reproduce #1 baseline**: Read `src/ui/app.ts:1894-1910` + `:1322-1339` + `:478-490` (setActiveTab) to confirm no AbortController exists and trace the tab-switch flow. Verify `state.priorNotesLoaded` short-circuit at line 1895 does not interact with abort path.
3. **Implement #1** (AbortController): ~10-15 LOC. Update signature, add controller module-level var, update call site at line 1334, add tab-away abort at top of `renderActivePane`. Run `bun run test:unit` to confirm 3 new unit tests pass + 64 existing still pass.
4. **Implement #2** (UI hint): ~10 LOC. Insert the hint DOM creation between line 1936 and the `for` loop at line 1937 in `renderPreviouslyDiscussedPanel`. Run e2e harness to verify `previously-discussed-hint` scenario passes.
5. **Verify all ACs**: `bun run check` (lint + typecheck + format) + `bun run test:unit` (64 + 3 = 67 tests) + `bun run build` + `bun run test:ui` (16 + 2 = 18 scenarios).
6. **Commit strategy**: 2 atomic commits (one per sub-candidate) for traceability:
   - `fix(issue-1): AbortController for loadPriorNotes cancels in-flight fetches on tab switch`
   - `feat(issue-2): Previously discussed panel subheader explains prior-rounds-only scope`
7. **Push worktree branch** to `origin/team-dev-loop-round-7-r4-minor`.
8. **Hand-off** to lead for phases 3a (Tester Review) + 3b (Tester Diff) + 3c (Tester Playwright) + 3.5 (PM Doc Writer) + 4 (Decision) + 4.5/4.6/4.7.

## 5. Test plan

- **Unit tests** (3 new in `src/ui/app.test.ts` or `src/prior-notes.test.ts`): cover `signal.aborted === true` at entry, abort mid-fetch (mock `fetch` to resolve after `signal.abort()`), and happy-path baseline. Direct synthetic `AbortController` per R3 retro's multi-round AC test design rule.
- **E2E tests** (2 new in `scripts/test-review-ui/scenarios.mjs`):
  - `previously-discussed-race`: rapidly cycle tabs; assert DOM does not show stale `state.priorNotes` after the switch.
  - `previously-discussed-hint`: round 2+ state, assert `.previously-panel-hint` exists in `#previously-list`; round 1 state, assert absent.
- **Build/lint/typecheck/format**: `bun run check` — all clean.
- **Regression**: all 16 existing e2e scenarios must still pass; all 64 existing unit tests must still pass.

## 6. Risk register

### R7-1: AbortController lifecycle — who creates/who aborts
- **L/M**: MEDIUM/MEDIUM — controller must be aborted on tab-away AND on re-entry.
- **Mitigation**: Module-level `priorNotesController` aborted at top of `renderActivePane` (line 1322) when `state.activeTab !== "previously"` AND at call-site line 1334 before creating a new controller. AC7-1.1/1.2/1.3 cover the three lifecycle states.

### R7-2: Hint placement conflicts with empty-state message
- **L/M**: LOW/LOW — PM Manager confirmed non-empty branch only.
- **Mitigation**: Hint guarded by `if (currentRound > 1)` AND placed after the empty-state early-return at line 1934. AC7-2.2 covers round-1 case.

### R7-3: `state.priorNotesLoaded` short-circuit at line 1895 interacts with abort
- **L/M**: LOW/LOW — short-circuit is independent of the abort path.
- **Mitigation**: AC7-1.3 happy-path baseline confirms cache is not corrupted. Re-fetch path is out of R7 scope.

### R7-4: R7 commit SHAs need `git cat-file -e` PASS (R4 retro Gap 1)
- **L/M**: ZERO/HIGH — would invalidate audit trail per R3 lesson.
- **Mitigation**: Lead verifies both commit SHAs `git cat-file -e` PASS post-push in Phase 4.

## 7. Hand-off

### Dev receives
- This plan (`.omo/round-7/plan.md`) + `brief.md` + `pm-manager-review.md`
- Worktree at `$HOME/.worktrees/team-dev-loop-round-7-r4-minor/`

### Dev returns
- All ACs (7-1.1 through 7-X5) with PASS evidence (test name + e2e scenario name + file:line)
- 2 atomic commits on `team-dev-loop-round-7-r4-minor` branch, pushed to `origin`
- Inline self-check: AC trace (PASS/PARTIAL/FAIL per AC)

### Lead does after Dev
- 3a (Tester Review): lead takeover default per R4 Gap 2 (small scope ~25 LOC, lead-synthesized)
- 3b (Tester Diff): lead takeover default — `git diff main...origin/team-dev-loop-round-7-r4-minor`
- 3c (Tester Playwright): lead takeover default — full walkthrough (UI changed)
- 3.5 (PM Doc Writer): lead takeover default — small scope, no README change (pure code + tests)
- 4 (Decision): SHIP verdict + 4.5/4.6/4.7 mandatory retro/post-exec/self-check
- Merge R7 branch → `main` + push to `origin/main`
- Update `.omo/proposals.jsonl` with R7 line