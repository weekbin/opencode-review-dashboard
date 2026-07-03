# R48 Research

## Source files
- `.opencode/skills/team-dev-loop/references/v5-prompts.md` (440 lines, **TO DELETE**)
- `.opencode/skills/team-dev-loop/references/environment-setup.md` (cross-ref at L447)
- `.opencode/skills/team-dev-loop/references/loop-decision.md` (cross-ref at L563)

## Existing patterns (preserved)
- v6 Capability 1-3 (Discovery / Research / Frame) are **lead-direct**, no subagent prompts required
- v5-prompts.md is v5 PM Triage + PM Researcher + PM Manager + Planner prompt templates — superseded by v6's lead-direct flow
- Cross-refs from environment-setup.md and loop-decision.md only exist in other orphaned v5 docs; both will get [R48] notes pointing at the deletion

## Simplest change
- `rm references/v5-prompts.md`
- 2 single-line edits to remove broken cross-refs

## Risk
- Zero code impact: references/ files are not imported by anything in src/
- Zero test impact: no src/ touched
- Pre-commit hook #2 (SKILL.md drift): unaffected; SKILL.md not modified
- Future references to v5-prompts.md in any other file (verified: none) would break — grep confirms zero remaining refs after this round

## Compatibility check
- v6 SKILL.md does NOT link to v5-prompts.md (verified L1-230)
- environment-setup.md and loop-decision.md will get "(removed in R48)" annotations instead of broken links
- proposals.jsonl: append 1 line for R48