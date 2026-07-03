# R74 Brief

**Scope**: Extend R73's stale-timer fix to `flashFindingPermaHighlight` and `flashDiffSearchMatch`. Per-element timer ID + clearTimeout before new setTimeout.

**Acceptance**: 2 tests pass; bash .husky/pre-commit → 8/8 PASS; 698/698 tests.
