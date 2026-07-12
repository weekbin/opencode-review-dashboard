# R137 Research — Copy round notes button

Lightweight-round compression (≤50 LOC + ≤1 src file + new behavior): capabilities 2+3 compress into a single artifact. Research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The only external dependency is the existing copy pattern at `src/ui/app.ts:408-L516` (`copyAsMarkdown` function). It establishes the canonical shape: `navigator.clipboard.writeText` + `fallbackCopy` + `COPY_FEEDBACK_MS` button text feedback timer + `showToast` + `setStatus`. R137 replicates this shape for round notes — no new utility, no new error path.

The button must:
- Only render in the notes-present branch (L5381-L5393), not the empty-state branch (L5394-L5397). The empty-state already conveys "no notes" via text — a copy button would be confusing.
- Coexist with the existing label DOM. The `notesLabel` is a `<div>`; the copy button will be a `<button>` sibling. Need flex layout on the label container.

No new i18n keys for the error path — `status.copyBlocked` already covers clipboard failures across all copy surfaces (Copy MD, Copy branch, etc.). R137 adds 2 new keys: button label + success toast.