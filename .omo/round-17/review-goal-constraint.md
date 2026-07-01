# R17 3a Test Review — Goal + Constraint Verification (Lens 1 of 5)

## Verdict: PASS

3 features shipped (1 bugfix + 2 features). All 18 ACs implemented. All 5 lead-direct gates green (383 tests, 0 lint, typecheck clean, format clean, build exit 0).

## Per-feature AC verification

### #32 Move round notes into Submit Review modal (AC1-AC6) — PASS

| AC | Status | Evidence |
|---|---|---|
| AC1: sidebar notes `<group>` REMOVED | ✓ | `src/ui/review.html` no longer has `<section class="notes-surface">` or `<textarea id="notes">` |
| AC2: Submit modal CONTAINS notes textarea | ✓ | `<textarea id="round-notes" data-testid="round-notes-textarea">` in modal at `src/ui/app.ts:5023` |
| AC3: state.notes persists | ✓ | `state.notes` field preserved (app.ts:65); no schema change |
| AC4: auto-save on input | ✓ | `notesArea.addEventListener("input", ...)` writes to state.notes + scheduleSave() |
| AC5: "Saved Xs ago" indicator | ✓ | `state.draftLastSavedAt` preserved (R14 pattern at app.ts:5067) |
| AC6: modal layout h3→p→finding-count→textarea→modal-actions | ✓ | T32.6a verified order |

### #34 Search IME composition (AC1-AC6) — PASS

| AC | Status | Evidence |
|---|---|---|
| AC1-5: 4 distinct DOM elements have IME handlers | ✓ | `installImeSafeInputListener` applied to `#search-input`, `#diff-search-input`, `.cmd-p-input` |
| AC6: Playwright scenario for IME | ✓ | New `search-ime-composition` scenario in `scripts/test-review-ui/scenarios.mjs:427` |

### #36 Cmd+/ help overlay (AC1-AC6) — PASS

| AC | Status | Evidence |
|---|---|---|
| AC1: Cmd+/ (or Ctrl+/) keydown listener | ✓ | `src/ui/app.ts:905-912` (capture-phase listener extension) |
| AC2: 10 shortcuts in clean grid | ✓ | `showHelpModal` renders 10 `<div class="help-row">` in `.help-grid` (2 columns) |
| AC3: Escape + backdrop click closes | ✓ | Escape handler + `e.target === overlay` check |
| AC4: state.showHelp field | ✓ | `showHelp: false` at `src/ui/app.ts:1283` |
| AC5: reuses showSubmitConfirmModal pattern | ✓ | Same `.modal-overlay` + `.modal-dialog` + `role="dialog"` + `aria-modal="true"` |
| AC6: plain-language help text | ✓ | `<kbd>` tags + plain descriptions (SG.11 style) |

## Constraint verification

| Constraint | Status |
|---|---|
| ≤ 3 features | ✓ 3 features exact |
| 0 cap headroom | ✓ |
| Bugfix ≤ 5 cap (mixed) | ✓ 1 bugfix in 3-feature bundle |
| All additive (no schema break) | ✓ state.notes field reused, state.showHelp added |
| No new npm deps | ✓ package.json unchanged |
| localStorage only | ✓ no migration |
| README + zh-CN lockstep in same commit (SG.19) | ✓ both files updated in 751309b |
| Scenario count +1 (SG.20) | ✓ 33 → 34 (search-ime-composition) |
| Defense-in-depth 30+ unit tests | ✓ 40 R17 tests (target was ≥30) |
| Screenshots in Phase 2 Dev (SG.16) | ✓ 3 PNGs in same commit |

## Goal alignment

| User goal (from R16 retro feedback) | Met? |
|---|---|
| #32 Round notes moved into Submit modal (user #1 priority) | ✓ |
| #34 Search IME bug fixed (user #3 + bug) | ✓ |
| #36 Cmd+/ help overlay (R12 brief #5 closure, planned R17) | ✓ |
| All client-side, no schema | ✓ |
| Hits feature ≤ 3 cap exactly | ✓ |
| Closes 3 GH issues (#32/#34/#36) | ✓ auto-closed by GitHub |

## Verdict: PASS — R17 ships clean