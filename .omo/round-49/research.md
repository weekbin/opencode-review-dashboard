# R49 Research

## Source files
- `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md` (149 lines, **TO DELETE**)
- `.opencode/skills/team-dev-loop/references/environment-setup.md` (cross-ref at L448)

## Existing patterns (preserved)
- v6 Capability 5 (Verify) spec is in v6 SKILL.md (lines ~108-118) and `.husky/pre-commit` (8-check gate)
- v5 "Phase 2.5 Lead Pre-Commit Audit" workflow is no longer used; the v6 verify step is mechanical (`bash .husky/pre-commit`)
- R20 retro's "Phase 2.6 rebuild checklist" was embedded in pre-commit-audit-spec.md; v6 doesn't have a Phase 2.6 (single-commit-per-round replaces the merge+rebuild+push sequence)

## Simplest change
- `rm references/pre-commit-audit-spec.md`
- 1 single-line edit to annotate the deletion in environment-setup.md

## Risk
- Zero code impact: references/ files are not imported by anything in src/
- Zero test impact: no src/ touched
- Historical `.omo/round-N/` references and `.opencode/magic-context/historian/*.xml` archives reference the deleted file by name but those are frozen session logs (not active code paths)
- Pre-commit hook #2 (SKILL.md drift): unaffected; SKILL.md not modified

## Compatibility check
- v6 SKILL.md does NOT link to pre-commit-audit-spec.md (verified L1-230)
- environment-setup.md L448 will get "(removed in R49)" annotation
- proposals.jsonl: append 1 line for R49