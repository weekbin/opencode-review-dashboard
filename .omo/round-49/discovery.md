# R49 Discovery

## Source: v6 spec + R48 retro
- v6 SKILL.md: "v6 is self-contained, no external refs needed"
- R48 retro: "Loop-internal items all closed in current worktree (NO DEFERRAL held)"

## Backlog scan
1. **GH issues**: 0 open
2. **R48 carry-over**: empty
3. **Phase 2.5 / Phase 4.5-4.9 / Phase 0.## patterns** still alive in references/

## No backlog — DECIDE housekeeping

**Selected scope**: Delete `references/pre-commit-audit-spec.md` (149 lines). v6's Capability 5 (Verify) uses `.husky/pre-commit` directly — no need for a separate spec doc describing the v5 "Phase 2.5 audit" workflow.

## Specific candidates (from grep)
- `references/pre-commit-audit-spec.md`: 149 lines (Phase 2.5 Lead Pre-Commit Audit spec — v5)
- Cross-ref from environment-setup.md L448 (will annotate as removed)
- Cross-refs from `.omo/round-23/` and `.omo/round-24/` are HISTORICAL retro artifacts (frozen context, not modified)
- Cross-refs in `.opencode/magic-context/historian/*.xml` are session archives (frozen, not modified)

## Decision
Pick: delete `pre-commit-audit-spec.md` + update 1 cross-ref. Continues R47/R48's v6 cleanup pattern.

## Why this scope
- Lightweight (single file deletion)
- No `src/` change
- v6 lock-in: removed v5 Phase 2.5 spec doc; v6 Capability 5 spec lives in SKILL.md (12 lines) and `.husky/pre-commit` (95 lines) directly
- 2630 → 2481 lines in references/ (6% reduction this round)

## Rejected alternatives
- **Bulk-delete all references/ (2481 lines)**: same as R48 reasoning; keep history for now
- **Rewrite pre-commit-audit-spec.md with v6 capability naming**: too much text work for 149 lines of v5-specific content (build protocol for `dist/` in main worktree, etc.)