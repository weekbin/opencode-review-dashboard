# R48 Brief

**Scope**: Delete `.opencode/skills/team-dev-loop/references/v5-prompts.md` (440 lines). Update 2 cross-references in `references/environment-setup.md` L447 and `references/loop-decision.md` L563 to "(removed in R48)" annotations.

**Why**: v6 collapses PM Triage / PM Researcher / PM Manager / Planner subagents into lead-direct Capabilities 1-3. The v5 prompt templates in v5-prompts.md are dead weight — v6 has no use for them. R47 closed the SG.R## labeling mismatch; R48 closes the v5 prompt template orphan.

**Risk**:
- Zero `src/` change
- Zero test impact
- Cross-refs in 2 other orphaned v5 docs cleaned up to point at the deletion
- Verified: no other file references `v5-prompts.md` after this round

**Acceptance**:
- v5-prompts.md file removed (440 lines)
- 2 cross-references updated with "(removed in R48)" annotation
- `bash .husky/pre-commit` → 8/8 PASS
- 626/626 tests still pass
- 0 remaining `v5-prompts` references in `.opencode/` (excluding the annotations noting its removal)