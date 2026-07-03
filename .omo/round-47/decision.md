# R47 Decision

## Decision
SHIP

## Lightweight round (if applicable)
YES — 5 sed replacements + 4 cleanup edits, 2 files in `.opencode/skills/team-dev-loop/references/`, zero `src/` change. Fits v6 lightweight criteria (≤50 LOC, ≤2 src/ files).

## Doc updates (SG.R29.8 carry-over)
SKIPPED — internal references/ content; not user-facing.

## Loop summary (1 paragraph)
R47 closes a v6 cleanup miss: 5 stale `SG.R##` patterns (10 occurrences across 2 files in `.opencode/skills/team-dev-loop/references/`) replaced with `[R## retro]` inline callouts matching v6's migration pattern. Pre-commit 8/8 PASS, 626/626 tests. Round followed v6 spec end-to-end (6 artifacts, 7 capabilities, 0 patch numbering, lead-direct 100%, 0 subagent dispatches). Loop-internal items all closed in current worktree (NO DEFERRAL held). R48 will run next per auto-pilot default.