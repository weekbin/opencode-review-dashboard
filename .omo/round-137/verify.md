# R137 Verify — Copy round notes button

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R137 scope files
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1068/1068 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R137 Contract Suite — 5/5 PASS

```
(pass) i18n.ts declares the new keys with en + zh-CN
(pass) status.copiedNotes zh-CN value is 已复制本轮笔记 (not empty)
(pass) app.ts defines copyRoundNotesToClipboard with the established copy pattern
(pass) app.ts wires copyRoundNotesToClipboard to a button in the notes block
(pass) the empty-state notes branch does not get a copy button
```

## Regression Sweep — All Green

- R136, R135, R134, R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- **R131 UI lock rendering > AC7: showPostSubmit checks body.locked** — FIXED. Was using brittle `appTs.slice(264157, 266000)` byte offset that R137's copyRoundNotesToClipboard function addition (~60 lines) pushed past the `body.locked` location. Replaced with marker-based `appTs.indexOf("function showPostSubmit")` + 2000-char window. All 12 R131 tests now pass.
- Project suite after R137: **1068 tests pass** (was 1064 pre-R137; +5 R137 new — net -1 from the R131 test consolidation).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-137/`)
- R103 i18n coverage: PASS (new keys en ≠ zh-CN)

## What changed

- `src/ui/app.ts:5381-L5393` — `if (roundEntry.notes)` block now:
  - Adds a wrapper `<div class="previously-notes-header">` containing the existing label + a new `<button class="previously-notes-copy">`.
  - The button calls `copyRoundNotesToClipboard(roundEntry.notes, copyNotesBtn)` on click.
  - The empty-state branch (L5394-L5397) intentionally has no button — copying an empty string would be confusing.
- `src/ui/app.ts:1818-L1872` — new `copyRoundNotesToClipboard(notes, button)` function. Reuses the established copy pattern: `navigator.clipboard.writeText` + `fallbackCopy` (textarea + `execCommand("copy")`) + button text feedback (✓ + disabled + timer reset via `_copyNotesFeedbackTimer`) + `showToast` on success/block + `COPY_FEEDBACK_MS` (1200ms).
- `src/ui/i18n.ts` — 2 new keys × 2 locales = 4 strings:
  - `previously.notes.copyButton`: en="Copy notes" / zh-CN="复制笔记"
  - `status.copiedNotes`: en="Copied round notes" / zh-CN="已复制本轮笔记"
- `src/ui/r137-copy-round-notes.test.ts` — 5 contract tests covering i18n keys, zh-CN distinguishing, copy function shape, button wiring, and empty-state no-button invariant.
- `src/r131-round-lock-on-approve.test.ts:107-L111` — replaced brittle byte-slice (`appTs.slice(264157, 266000)`) with marker-anchored search (`appTs.indexOf("function showPostSubmit")` + 2000-char window). Stops the test from drifting on subsequent src edits.
- `.omo/proposals.jsonl` — appended the missing R136 entry.

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R137 adds a single small inline button to an existing panel. The button is `<16px` square, follows the existing `.btn` / `.btn-icon` family conventions, and sits inline with the "Notes you sent to the agent" label. No new visual surface to capture. The text + button are inside a pre-existing `previously-notes` block whose layout was already measured by R8/R123 polish work.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R131 test brittleness closed) |
| ≤3 features per round | PASS (R137 = 1 feature) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R137 ready to SHIP.