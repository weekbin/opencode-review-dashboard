# R48 Decision

## Decision
SHIP

## Lightweight round (if applicable)
YES — single file deletion + 2 line edits, zero `src/` change. Fits v6 lightweight criteria (≤50 LOC, ≤2 src/ files).

## Doc updates (SG.R29.8 carry-over)
SKIPPED — references/ content; not user-facing.

## Loop summary (1 paragraph)
R48 continues v6 cleanup: deleted `references/v5-prompts.md` (440 lines of v5 PM/Planner prompt templates superseded by v6's lead-direct Capabilities 1-3). Updated 2 cross-references in orphaned v5 docs with "(removed in R48)" annotations. Pre-commit 8/8 PASS, 626/626 tests. Round followed v6 spec end-to-end (6 artifacts, 7 capabilities, 0 patch numbering, lead-direct 100%, 0 subagent dispatches). Loop-internal items all closed in current worktree (NO DEFERRAL held). R49 will run next per auto-pilot default.