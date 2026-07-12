# R138 Retro — worktree hygiene

## What worked

Pure housekeeping round. 1 file modified (`.gitignore`) + 1 housekeeping update (`proposals.jsonl` append for R137) + 6 round artifacts. 4 PNG files relocated from repo root to `.omo/round-132/evidence/`. Worktree had been carrying 6 untracked scratch artifacts since R132 — 5 rounds of visible `?? ` noise finally cleared.

The key call was preserving R132's original intent ("untracked because the project does not ship per-round captures") instead of either (a) leaving them at repo root or (b) committing them to git history. Moving them under the round directory organizes by origin while keeping them out of git. Same pattern as `.gitignore`'s existing `.omo/evidence/` (top-level evidence scratch) and `.opencode/cache/` (per-machine scratch).

Verified via `git check-ignore -v` that the 3 new patterns catch exactly the intended targets and don't catch any tracked file. Pre-commit 8/8 PASS first try.

## What didn't

- The first brief draft was interrupted by a tool call timeout. Recovered by checking directory state and continuing with the remaining 3 artifacts.
- 6 round artifacts are still required by R105 even for pure-housekeeping. Wrote them compressed per the v6 SKILL lightweight-round guidance.

## Carry-over list (≤3 items)

None — R138 closes the worktree drift that had been visible since R132.

## Closed in this round (loop-internal)

- **5-round worktree drift** — closed. 4 PNG files relocated + 3 gitignore patterns added.
- **Per-SHIP append discipline for R137** — closed (appended in this round).

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **Gitignored scratch should be co-located with origin, not repo root.** The R132 PNGs sat at repo root for 5 rounds because nobody took the 30-second move-then-ignore action. Codifying the pattern: any per-round evidence should land under the producing round's dir immediately, not at repo root.
- **`git check-ignore -v` is the right verification gate** for new `.gitignore` patterns. Without this check, a typo in the pattern silently misses the target. Adding this as a documented verification step for housekeeping rounds.
- **Pure-housekeeping rounds count as 0/0/0 against hard caps.** Useful for breaking the polish streak without inventing user-value.
- **Tool-call interruption recovery**: when a parallel tool batch is interrupted mid-write, check `ls` on the target directory to verify which artifacts landed before re-running. Don't blindly re-write — that risks accidentally double-writing or losing context.

## Risks Surfaced (not actioned this round)

- `fallbackCopy` is still duplicated in 4 functions (R137 retro flag). Real refactor opportunity for a future housekeeping round.
- The R137 "Copy" button label and title both call `t("previously.notes.copyButton")` — could leverage R133's `data-i18n-title` auto-discovery. Sub-10 LOC polish; waits for a future i18n batch.

## v6 Compliance

- Hard caps: **0 feature + 0 bugfix + 0 polish = 0 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).

## Round Profile

- Housekeeping: 1 (worktree hygiene — move PNGs + gitignore scratch)
- Total: 1 (counted as housekeeping)
- Subagents: 0
- Time: ~10 min wall-clock.