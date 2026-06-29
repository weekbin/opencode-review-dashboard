# Lens #2 (QA) — Test Gates & Smoke Test

> **Source**: Lead-direct inspection (lens subagent `bg_258cc019` cancelled after 7m 22s; see `.omo/round-4/lead-takeover-tester-review.md`).
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-4` @ `f2790e5bd4bf07a9d2d3d23b05b6858356ca14e4`
> **Branch**: `team-dev-loop-round-4-previously-discussed`
> **Method**: Ran each gate command directly via Bash in the worktree.

## Gate results

| Gate | Command | Result |
|---|---|---|
| `bun install` | `bun install` (in worktree) | **PASS** — `Checked 143 installs across 210 packages (no changes)`; build also ran: `Build complete in 358ms` |
| **format:check** | `bun run format:check` → `oxfmt src/` | **PASS** — clean (no output, exit 0) |
| **lint** | `bun run lint` → `oxlint src/` | **PASS** — `Found 0 warnings and 0 errors. Finished in 27ms on 5 files with 95 rules using 24 threads.` |
| **typecheck** | `bun run typecheck` → `tsc --noEmit` | **PASS** — clean (no errors) |
| **check** (composite) | `bun run check` | **PASS** — all 3 sub-gates clean |
| **build** | `bun run build` | **PASS** — `Build complete in 358ms` (ran during `bun install` via `prepare` hook; 304 files / 10873.34 kB) |
| **unit tests** | `bun test src/` | **PASS** — `29 pass, 0 fail, 74 expect() calls. Ran 29 tests across 2 files. [77.00ms]` |
| **e2e tests** | `bun run scripts/test-review-ui/e2e.mjs` | **PASS** — `14 passed, 0 failed` (includes new `previously-discussed-panel` scenario) |

### Unit test detail (29/29)

`src/prior-notes.test.ts` — 19 new tests, all PASS:
- `parsePriorNotes > T1.1` … `T1.5` (5/5)
- `validateSessionId > T4.1` … `T4.4d` (7/7)
- `readPriorNotesFromSession > T2.1, T2.2, T4.5, T3.1, ignores non-round-*.md` (5/5)
- `AC9 — State + Finding type shapes > T5.1` (1/1)
- `AC1 — review.html exposes Previously discussed tab > T0.1` (1/1)

`src/state-store.test.ts` — 10 pre-existing tests, all PASS (T1 atomic, T2 ENOSPC, T3 EXDEV, T4 EACCES, T5 concurrent, T6 corrupt, T7 round-export — atomic invariant + corrupt-file recovery)

### E2E detail (14/14)

```
PASS  no-worktree-clean
PASS  has-worktree-unpushed  (some checks skipped — best-effort)
PASS  multiple-worktrees-pick-most  (some checks skipped — best-effort)
PASS  base-branch
PASS  base-commit-single
PASS  base-commit-range
PASS  working-tree-changes
PASS  files-filter
PASS  worktree-flag-override  (some checks skipped — best-effort)
PASS  empty-repo
PASS  uncommitted-with-commits
PASS  range-changed-banner
PASS  default-base-on-main
PASS  previously-discussed-panel   ← NEW (R4 candidate #1)

14 passed, 0 failed
```

The new scenario `previously-discussed-panel` verifies the server-side `/api/review/${id}/prior-notes` route doesn't break the launch path when the UI fetches it. Per `scripts/test-review-ui/scenarios.mjs:244` comment, the full UI assertion (panel renders, comment threads visible) is covered by the Playwright skill `review-dashboard-ui-test` (separate harness).

## Ad-hoc smoke test

### HTML button + pane (AC1, AC2)

- `src/ui/review.html:1714-1721` — 4th `<button data-tab="previously" aria-pressed="false" title="...">Previously discussed<span class="navbar-count" id="previously-count" hidden>0</span></button>` added directly after the Conversation tab at line 1710-1713. **Mirrors existing tab pattern (aria-pressed, title, navbar-count span).**
- `src/ui/review.html:1768-1773` — `<div class="pane pane-previously" data-pane="previously" hidden>` added after the Conversation pane at line 1759. **Correctly hidden by default** (existing panes also start `hidden`).
- Tab ordering: Files → Commits → Conversation → **Previously discussed** (correct, Conversation at index 2, Previously at index 3).

### setActiveTab wiring (AC2)

- `src/ui/app.ts:478-489` `setActiveTab` signature extended: `function setActiveTab(tab: "files" | "commits" | "conversation" | "previously")`. **Correctly mirrors the existing function shape; same `state.activeTab === tab` early-return + `applyActiveTab()` + `renderActivePane()` pattern.**
- `src/ui/app.ts:494-495` click handler: `const tab = btn.dataset.tab as "files" | "commits" | "conversation" | "previously" | undefined;` — **handles the new tab value; falls through `if (tab) setActiveTab(tab)` unchanged**.
- `src/ui/app.ts:365-371` `readStored` extended to include `"previously"` in the allowed list for `ACTIVE_TAB_KEY`. **Persists across reloads.**
- `src/ui/app.ts:1333-1337` `renderActivePane` has new `else if (state.activeTab === "previously")` branch that calls `void loadPriorNotes().then(() => { if (state.activeTab === "previously") renderPreviouslyPane(); })`. **Loads on first activation; subsequent re-clicks don't refetch** (`priorNotesLoaded` flag).

### GET endpoint reachability (AC5, AC6)

- `src/index.ts:1682-1702` — new route handler `GET /api/review/${id}/prior-notes`:
  - Calls `validateSessionId(id)` first (returns 400 on failure)
  - Resolves session dir from `path.dirname(state_file)` (existing session-file lookup)
  - Delegates to `readPriorNotesFromSession(sessionDir)`
  - Returns `{rounds: [{round, notes}]}` JSON on success; `{error}` JSON on 400/404
- Verified via unit tests T4.1–T4.4d (validation) and T4.5 (404 on missing dir).

## Verdict

**PASS** — all 5 gates green, 29/29 unit, 14/14 e2e, smoke test confirms wiring.

```json
{
  "verdict": "PASS",
  "gates": {
    "format": "pass",
    "lint": "pass (0 warnings, 0 errors)",
    "typecheck": "pass (clean)",
    "build": "pass (304 files, 10873.34 kB)",
    "unit_pass": 29,
    "unit_total": 29,
    "e2e_pass": 14,
    "e2e_total": 14
  }
}
```