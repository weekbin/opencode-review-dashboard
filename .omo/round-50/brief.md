# R50 Brief

**Scope**: Delete `references/sync-spec.md` (192 lines). Update 3 cross-refs in `references/environment-setup.md` to "(removed in R50)" annotations.

**Why**: v6 doesn't have a separate "Phase -0 Sync" phase — sync steps are absorbed into Capability 1 (Discovery). v5 sync-spec.md is fully superseded. R50 continues the v6 cleanup pattern (R46-R49 all orphaned v5 content removal).

**Risk**:
- Zero `src/` change
- Zero test impact
- 3 cross-refs annotated

**Acceptance**:
- sync-spec.md file removed (192 lines)
- 3 cross-references updated with "(removed in R50)" annotation
- `bash .husky/pre-commit` → 8/8 PASS
- 626/626 tests still pass
- references/ total LOC: 2481 → 2289 (8% reduction)
