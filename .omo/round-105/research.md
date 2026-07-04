# R105 — research

v6 spec hard invariants (per .opencode/skills/team-dev-loop/SKILL.md):
1. round commits 6 artifacts to .omo/round-N/ — discovery, research, brief,
   verify, retro, decision.md
2. decision.md is a one-token file: content === "SHIP"
3. retro.md declares `loop-internal open: none` (or empty/n-a/-)

test design:
- walk .omo/ via readdirSync, filter to /^round-\d+$/
- filter to V6_START=82 (older rounds predate v6)
- assert all 6 artifacts exist per dir
- assert decision.md content === "SHIP" (after trim)
- assert retro.md has "loop-internal open: NONE|none|empty|n/a|-" pattern,
  with optional trailing period(s), case-insensitive

regex choice for loop-internal: simple alternation with period normalization
beats single-pattern. avoid complex backtracking — the regex is only on
well-formed retro.md files we wrote ourselves.
