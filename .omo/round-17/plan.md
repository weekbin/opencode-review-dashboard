# R17 Architect Plan (lead-synthesized)

## Scope (3 features, ≤ 3 cap exact, 0 headroom)

| # | Issue | Title | User-value | LOC | Risk |
|---|---|---|---|---|---|
| 1 | **#32** | Move round notes into Submit Review modal | 4/5 | 30-50 | LOW |
| 2 | **#34** | BUG: Search IME composition | 5/5 | 50-100 | LOW-MEDIUM |
| 3 | **#36** | Cmd+/ help overlay (R12 brief #5 closure) | 3/5 | 55-85 | LOW |
| | | **Total** | | **135-235** | |

## File deltas (7 files predicted)

| File | LOC | Reason |
|---|---|---|
| `src/ui/app.ts` | +135-235 | All 3 features integrate here |
| `src/ui/review.html` | +30-50 | Sidebar notes removal + modal textarea + Cmd+/ button + help modal |
| `src/r17-features.test.ts` | new +200-300 | 18 ACs × ~15 LOC avg test coverage (defense-in-depth) |
| `README.md` + `README.zh-CN.md` | +9 each | SG.11 user-manual style + SG.6 lockstep |
| `docs/screenshots/r17-*.png` | new × 3 | SG.16 screenshots in Phase 2 Dev |
| `scripts/test-review-ui/scenarios.mjs` | +1 scenario | SG.20 Playwright for #34 IME bug |

## Acceptance criteria (18 ACs · 6 per feature)

### #32 — Move round notes into Submit Review modal (6 ACs)

- **AC1**: Sidebar round notes `<group>` (e34 in snapshot) **REMOVED** — no persistent notes textarea in main UI
- **AC2**: Submit Review modal (app.ts:4569-4652, R15 #27) **CONTAINS** round notes textarea
- **AC3**: Notes value persists in `state.notes` across renders (existing field, no schema change)
- **AC4**: Auto-save works on input (existing `renderRoundNotes` input handler, just moved to modal)
- **AC5**: `Saved Xs ago` indicator updates correctly (R14 pattern preserved)
- **AC6**: Modal layout: header + textarea + Cancel/Submit, vertically stacked

### #34 — BUG: Search IME composition (6 ACs)

- **AC1**: Files tab search (`Search current panel` searchbox) — IME composition works smoothly (Chinese + English)
- **AC2**: Conversation tab search — IME works
- **AC3**: Previously discussed tab search — IME works
- **AC4**: In-diff search (`#diff-search-input` at app.ts:792) — IME works
- **AC5**: Cmd+P palette input — IME works (R15 #26 input)
- **AC6**: Test coverage: Playwright scenario simulates IME composition (pinyin → character) and verifies character is committed correctly

### #36 — Cmd+/ help overlay (6 ACs)

- **AC1**: Global keydown listener for `Cmd+/` (Mac) or `Ctrl+/` (other) — fires modal
- **AC2**: Modal opens with 10 keyboard shortcuts in a clean grid
- **AC3**: Modal closes on `Escape` and on backdrop click
- **AC4**: `state.showHelp: boolean` field added
- **AC5**: Modal HTML reuses `showSubmitConfirmModal` pattern (R15 #27)
- **AC6**: Help text in plain language (SG.11 user-manual style)

## Per-feature implementation outline

### #32 Round notes

```typescript
// REMOVE from app.ts renderRoundNotes (sidebar group)
// existing pattern was:
//   const notesGroup = `<group>▾ Round notes<textbox id="round-notes" /></group>`
//   document.querySelector(".sidebar")?.appendChild(notesGroup);

// ADD to app.ts renderSubmitModal (existing R15 #27)
// new modal HTML:
//   const modalBody = `
//     <h2>Review N findings before submitting</h2>
//     <textarea id="round-notes" placeholder="Optional global notes for this round">${state.notes ?? ""}</textarea>
//     <button>Cancel</button>
//     <button>Submit</button>
//   `;
//   notes input handler: existing auto-save (no change needed, just rebind target)
```

### #34 IME composition fix

```typescript
// Change pattern from controlled to uncontrolled for all 5 search inputs
// BEFORE (broken for IME):
//   <input value="${state.searchFilter}" oninput="state.searchFilter = this.value" />
// AFTER (works for IME):
//   <input id="search-files" />  // uncontrolled
//   + listen for 'compositionend' AND 'input' (skip if composing)
//   document.querySelector("#search-files")?.addEventListener("compositionend", (e) => {
//     state.searchFilter = (e.target as HTMLInputElement).value;
//   });
//   document.querySelector("#search-files")?.addEventListener("input", (e) => {
//     if (!isComposing) state.searchFilter = (e.target as HTMLInputElement).value;
//   });
```

### #36 Cmd+/ help overlay

```typescript
// New state field
showHelp: false,

// New modal pattern (mirror showSubmitConfirmModal)
function showHelpModal() {
  state.showHelp = true;
  // render modal at app.ts:4569-4652 area
}

// New keydown handler at app.ts:464 (extend existing listener)
if ((event.metaKey || event.ctrlKey) && event.key === "/") {
  event.preventDefault();
  showHelpModal();
  return;
}

// Modal HTML
// 10 keyboard shortcuts in 2-column grid
//   n — Next finding
//   p — Previous finding
//   Ctrl+F / Cmd+F — Find in diffs
//   / — Alternative search
//   Cmd+P / Ctrl+P — File jumper
//   Cmd+/ — Show this help (Escape to close)
//   Escape — Close any modal
//   Enter — Confirm default action
//   Cmd+I — Toggle "Ignore whitespace"
//   Cmd+E — Expand all
```

## Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | IME composition test coverage (Playwright needs composition simulation) | MEDIUM | Use `page.keyboard.insertText()` OR manual composition event dispatch + verify no re-render mid-composition |
| R2 | Round notes removed from sidebar breaks existing reviewer workflow | LOW | `state.notes` field preserved; only moved UI |
| R3 | Cmd+/ keydown conflicts with browser shortcut | LOW | `preventDefault()` after match + capture-phase listener |
| R4 | 5 IME input fixes change existing tests | LOW | All existing tests are regex-based or behavioral — IME fix is purely additive |
| R5 | Round notes textarea in modal may overflow on small viewports | LOW | CSS `min-height: 80px` + `max-height: 40vh` |

## Hand-off items to Dev (12 items)

1. **Per v5.3.5+1 SG.13/SG.15**: Lead-direct pre-validates the regex test patterns below — subagent only translates to vitest assertions:
   - For #34 IME: regex pattern `/document\.addEventListener\(\s*['"]compositionend['"]/` matches composition handler
   - For #32 notes: regex `/id=['"]round-notes['"]/` appears INSIDE the Submit modal HTML (not sidebar)
   - For #36 help: regex `/key\s*===\s*['"]\/['"]/` matches the Cmd+/ handler

2. **Per v5.3.5+1 SG.14**: DO NOT modify existing utility functions. If you need a similar function, write a new one with a distinct name.

3. **Per v5.3.5+1 SG.16**: Capture screenshots in Phase 2 Dev, NOT post-closure:
   - `docs/screenshots/r17-notes-in-submit-modal.png` — Submit Review modal open with notes textarea visible
   - `docs/screenshots/r17-ime-composition.png` — search box with Chinese IME active (use playwright keyboard simulation)
   - `docs/screenshots/r17-help-overlay.png` — Cmd+/ help modal open with shortcut grid

4. **Per v5.3.5+1 SG.19**: ALWAYS update README.md AND README.zh-CN.md in the same `git add` + `git commit`.

5. **Per v5.3.5+1 SG.20**: REQUIRE ≥ 1 Playwright scenario for #34 IME bug (new e2e scenario in scenarios.mjs).

6. **#32 notes pattern reuse**: Existing `renderRoundNotes` textbox + auto-save (R14 pattern) is the source of truth. Just move it.

7. **#34 IME fix**: Use Lit's `.value` property setter OR uncontrolled inputs. Do NOT use `value=${state.x}` pattern.

8. **#36 Cmd+/ pattern reuse**: Global keydown at app.ts:464 (existing Cmd+P listener) — extend with the `Cmd+/` case.

9. **Test file**: `src/r17-features.test.ts` (new) with 30+ unit tests covering all 18 ACs.

10. **Commit message format**: 3 feature commits + 1 test commit + 1 docs commit + 1 screenshots commit. OR single atomic commit per feature with screenshots embedded. Dev choice.

11. **Build verification**: `bun run build` exit 0, 304 files / < 12 MB.

12. **Inline skill audit at end**: F1 / F2 / F11 / F13 PASS.

## Pre-commit audit gates (Phase 2.5)

1. `bun test` → 342 + N pass / 0 fail (N ≥ 27 expected)
2. `bun run lint` → 0 warnings / 0 errors
3. `bun run typecheck` → clean
4. `bun run format:check` → clean
5. `bun run build` → exit 0
6. Scenario count grep → 34 (33 baseline + 1 new for #34 IME)
7. File count delta → ~7 files changed

## Decision

PROCEED to Phase 2 Dev.