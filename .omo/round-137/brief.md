# R137 Brief — Copy round notes button

## Scope

1. `src/ui/app.ts:5381-L5393` — add a small "Copy" button next to the "Notes you sent to the agent" label in each Previously-discussed round section. Reuses the existing copy pattern (`navigator.clipboard.writeText` + `fallbackCopy` + button text feedback timer + toast + setStatus) established at L408-L516.
2. `src/ui/i18n.ts` — add 2 new keys × 2 locales = 4 strings:
   - `previously.notes.copyButton`: "Copy notes" / "复制笔记"
   - `status.copiedNotes`: "Copied round notes" / "已复制本轮笔记"
   - `status.copyNotesBlocked`: reuses existing `status.copyBlocked` (same i18n key covers all clipboard failures)
3. New test file `src/ui/r137-copy-round-notes.test.ts` covering the button presence + i18n keys + copy call wiring.
4. Append R136 entry to `.omo/proposals.jsonl`.

## Files involved

- `src/ui/app.ts:5381-L5393` — notes block to receive the button
- `src/ui/app.ts:408-L516` — established copy pattern (template for new copy function)
- `src/ui/i18n.ts` — 2 new keys added

## Existing patterns

- Copy MD pattern at L408-L516: navigator.clipboard.writeText + fallbackCopy + COPY_FEEDBACK_MS timer + button text feedback ("✓ Copied") + showToast + setStatus. Will replicate shape.
- Button construction follows the existing `action.copyMarkdown.title` button in the conversation panel (R10 feature).

## Simplest change

Add a `<button>` after the `notesLabel` in the notes block. Click handler calls a small inline async function `copyRoundNotes(round, notes, button)` that mirrors the Copy MD pattern. ~30 LOC.

## Risk

- Button placement next to the label could collide with existing CSS — verified `notesLabel` is `display: flex`-friendly (will need a flex container for label + button). Add a tiny CSS rule to `.previously-notes-label` if needed.
- Clipboard API failures (browser blocks) handled by existing `fallbackCopy` + `showToast` error path. No new error surface.
- The button is hidden if notes are empty (the empty-state branch L5394 doesn't get the button).

## Acceptance

- `bun test src/ui/r137-copy-round-notes.test.ts` passes
- `bun test` full suite stays green (was 1064, expect 1070 with 6 R137 new)
- `bun run check` PASS
- Pre-commit 8/8 PASS

## Profile

Feature. New UI control with click handler. ≤1 src file modified + 1 new test + 1 housekeeping append.