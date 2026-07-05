# R122 Brief — updateSubmitButtons reactive bugfix (R116.1)

## Goal

Make the Approve Changes button enable/disable state reactive to finding state changes (resolve, reopen, add, mark-wontfix, edit). Currently it only updates on initial render or on submit-click — leaving users confused when they resolve all open findings but the Approve button stays disabled until reload.

## Why

R116 retro promised "Will close in current worktree before SHIP" for this exact issue but did not. R116.1 hotfix landed only the dual-button from #83 Oracle flag. R116.1 updateSubmitButtons reactive remained unfixed for 5 rounds (R117/R118/R119/R120/R121 all skipped this as additive feature-only polish bundle).

Per R12 retro stale-bundle rule + v6 NO DEFERRAL: this MUST close in current worktree.

## Scope

### 1. `src/ui/app.ts` — call `updateSubmitButtons()` after every state-changing handler

Wire `updateSubmitButtons()` into handlers at the same places where other UI updates already happen (e.g., `renderFindings()` calls already exist in similar positions):

- After `resolveFinding` completes (L5792 already calls `renderFindings()` + `renderConversationPane()` — add `updateSubmitButtons()`)
- After `reopenFinding` completes (L5824 — same pattern)
- After `addFinding` click handler (L6547 — find closest anchor)
- After note changes (`state.notes` mutations)
- After markWontfix (which calls resolveFinding under the hood, so already covered)

Easiest implementation: extend `updateConversationTabBadge()` semantic — rename it `updateCountsAndSubmit()` or just add the `updateSubmitButtons()` call in the same 5 places `updateConversationTabBadge()` is called (L2718, L5992, L6019, L6046).

Even simpler: **wrap existing helpers in a single `notifyFindingStateChanged()` function** that calls all three (renderFindings + renderConversationPane + updateSubmitButtons). But that's scope-creep. Stay minimal.

### 2. No new i18n keys

Bugfix only — no UI strings change.

### 3. NEW `src/r122-reactive-submit-buttons.test.ts`

10 structural regex tests:
- AC1: `updateSubmitButtons()` is called from ≥5 places in app.ts (≥1 initial + ≥1 in resolveFinding + ≥1 in reopenFinding + ≥1 in addFinding flow + ≥1 in note-change flow)
- AC2: updateSubmitButtons is called after `await resolveFinding(...)` line
- AC3: updateSubmitButtons is called after `await reopenFinding(...)` line
- AC4: updateSubmitButtons is called after `addFinding()` line (or after the click handler resolves)
- AC5: updateSubmitButtons is called after state.notes mutations
- AC6: function `updateSubmitButtons` still exists at top of file (regression: did not remove existing wiring)
- AC7: function reads `submitApproveButton.disabled = !enabled` (preserve existing logic)
- AC8: function reads `const enabled = openCount === 0 && notesNonEmpty` (preserve gate)
- AC9: pre-existing calls at L6496 / L6504 untouched (regression for #83 dual-button)
- AC10: regression — R116 + R117 + R118 + R119 + R120 + R121 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| Adding call in wrong place → page boot error | AC1 ensures ≥5 well-distributed call sites |
| Disrupting existing dual-button wiring (R116.1 hotfix) | AC9 explicit regression |
| Removing existing updateSubmitButtons function (L1518) | AC6 explicit regression |
| Side effect on existing resolve/reopen modal flows | One call after `await` resolves + AC10 suite covers |
| Hidden bug: state.notes synchronous vs async — call too early? | AC5 covers note mutations |

## Round Profile

- Feature: 0
- Bugfix: 1 (R116.1 updateSubmitButtons reactive)
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~10 (5 updateSubmitButtons() calls in 5 handler positions + 10 tests)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R122 tests GREEN
- 0 regressions in R116/117/118/119/120/121 tests (44 + 10 + 20 + 10 + 10 = 90+ existing tests)
- Bug visibly fixed: resolve all open findings → Approve button auto-enables

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (1)
- ≤1 polish ✓ (none)
- ≤8 total ✓ (1)