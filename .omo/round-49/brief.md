# R49 Brief

**Scope**: Delete `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md` (149 lines). Update 1 cross-reference in `references/environment-setup.md` L448 to "(removed in R49; v6 Capability 5 uses `.husky/pre-commit`)" annotation.

**Why**: v6's Capability 5 (Verify) spec lives in v6 SKILL.md (~12 lines) and `.husky/pre-commit` (95-line gate). The v5 "Phase 2.5 Lead Pre-Commit Audit" workflow described in pre-commit-audit-spec.md is fully superseded — v6 doesn't have a separate audit step; the pre-commit hook IS the verification. R48 deleted v5-prompts.md (440 lines, PM/Planner prompts); R49 continues by deleting pre-commit-audit-spec.md (149 lines, Phase 2.5 spec).

**Risk**:
- Zero `src/` change
- Zero test impact
- Cross-refs in `.omo/round-23/` and `.omo/round-24/` (historical retro artifacts) are frozen — not modified
- Cross-refs in `.opencode/magic-context/historian/*.xml` (session archives) are frozen — not modified
- 1 cross-ref in environment-setup.md annotated with removal note

**Acceptance**:
- pre-commit-audit-spec.md file removed (149 lines)
- 1 cross-reference updated with "(removed in R49)" annotation
- `bash .husky/pre-commit` → 8/8 PASS
- 626/626 tests still pass
- 0 remaining `pre-commit-audit-spec` references in `.opencode/skills/` (excluding the annotation noting its removal)
- references/ total LOC: 2630 → 2481 (6% reduction)