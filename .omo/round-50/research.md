# R50 Research

## Source files
- `.opencode/skills/team-dev-loop/references/sync-spec.md` (192 lines, **TO DELETE**)
- `.opencode/skills/team-dev-loop/references/environment-setup.md` (3 cross-refs at L322, L351, L446)

## Existing patterns (preserved)
- v6 Capability 1 (Discovery) does sync inline as part of `.omo/round-N/discovery.md` (lead runs `git status`, `gh issue list`, etc.)
- v5 "Phase -0 Sync" workflow is no longer a separate phase; sync steps are absorbed into Discovery

## Simplest change
- `rm references/sync-spec.md`
- 3 cross-refs annotated with "(removed in R50)"

## Risk
- Zero code/test impact (no src/ touched)
- Pre-commit hook #2 (SKILL.md drift): unaffected
- All other v6 cleanup rounds (R46-R49) followed this same pattern

## Compatibility check
- v6 SKILL.md does NOT link to sync-spec.md
- environment-setup.md cross-refs will get annotations
