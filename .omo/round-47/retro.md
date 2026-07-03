# R47 Retro

## What worked
- v6 spec followed cleanly. 6 artifacts written, all 8 pre-commit checks PASS first try.
- Capability 1 Discovery found real housekeeping candidate (stale SG.R## in references/) without needing to fall back to "no backlog" rule.
- sed + cleanup pass converted 10 occurrences across 2 files in <1 min.
- Pre-commit hook #2 (SKILL.md drift) correctly did NOT fire false positive (phase-prompts.md and pre-commit-audit-spec.md are still older than SKILL.md).

## What didn't
- First-pass sed produced redundant phrasing `(NEW R19 retro [R19 retro] (description))` — required 4 follow-up edit calls to clean up. Pattern: when original line already had "R## retro" prefix, sed replacement doubled it. Lesson for future rounds: read original line context before applying sed.
- Capability 2 (Research) and Capability 3 (Frame) were compressed into brief.md since scope was clear from discovery. This is acceptable per v6 Lightweight Round rules (≤50 LOC, ≤2 src/ files) but the lightweight trigger should have been explicitly recorded in decision.md.

## Carry-over list
- (none — single-commit round, all scope shipped)

## Closed in this round (loop-internal)
- [x] 5 stale `SG.R##` patterns replaced with `[R## retro]` callouts in references/
- [x] Redundant phrasing `(NEW R## retro [R## retro])` cleaned up to `[R## retro] description`
- [x] R47 round artifacts written to `.omo/round-47/`
- [x] proposals.jsonl appended (next step)

## Open loop-internal at retro time
(none)