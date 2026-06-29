# Round 4 Brief — INVALIDATED 2026-06-29

> **STATUS NOTICE**: This brief was written by Round 4 PM Triage (Sisyphus-Junior) based on the R3 audit-trail files, which were later discovered to be fabricated (R3 code commits `57a447a`/`b4bc02e`/`e14c943` never landed on `main`). The recommended candidate #1 ("Previously discussed" panel) was grounded in R3's claim that `state.notes_history` and `resolved[]` exist in `src/state-store.ts` / `src/index.ts` — they do not. The other 4 candidates may still be valid but have NOT been re-validated against actual current `main` code state.
>
> **Do not pick from this brief.** A new R4 PM Triage will be spawned with explicit instructions to read actual current `main` state, not R3 audit-trail claims. See `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md` for the full integrity-finding context.
>
> **Original content preserved below for the historical record.**
>
> ---
>
> (See git history `git show HEAD~1:.omo/round-4/brief.md` for the original 140-line brief content. This stub replaces it pending the new R4 PM Triage run.)

## What to do next

A new `task(category="unspecified-high", ...)` PM Triage will be spawned with the audit-trail-integrity context, instructed to:
- Read `git log --oneline -20` (actual main history)
- Read `ls src/` and grep `src/index.ts`, `src/state-store.ts` for actual current state
- Read `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md` and TREAT the rest of `.omo/round-3/*.md` as DESIGN RECORDS not SHIP RECORDS
- Read `.omo/proposals.jsonl` for the latest `follow_up_candidates`
- Surface 3-5 user-stories based on ACTUAL current code state

The new brief will overwrite this file.
