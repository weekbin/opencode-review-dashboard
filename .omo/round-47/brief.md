# R47 Brief

**Scope**: Replace 5 stale `SG.R##` patterns with `[R## retro]` inline callouts in `.opencode/skills/team-dev-loop/references/phase-prompts.md` (3 patterns) and `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md` (7 occurrences across 2 patterns). Light-touch: keep references/ content as historical context, rebrand patch labels only.

**Why**: v6 SKILL.md was rewritten (R46) to remove all SG.R## patch numbering (70+ → 0). But the v6 rewrite missed propagating this to references/, leaving stale `SG.R19.1`, `SG.R19.3`, `SG.R19.4`, `SG.R20.1`, `SG.R25.1` patterns. v6 SKILL.md line 200 specifies: "Inline `[R5X lesson]` callouts preserve critical lessons" — references/ should follow same pattern.

**Risk**:
- references/ files are disconnected from v6 SKILL.md (no cross-links, no imports). Pure historical context.
- Pre-commit hook #2 (SKILL.md drift detection) unaffected: phase-prompts.md and pre-commit-audit-spec.md are not newer than SKILL.md after edits.
- Zero code/test impact.

**Acceptance**:
- 5 distinct `SG.R##` patterns replaced with `[R## retro]` callouts across 2 files
- Redundant phrasing `(NEW R## retro [R## retro] (description))` cleaned up to `[R## retro] description`
- `bash .husky/pre-commit` → 8/8 PASS
- 626/626 tests still pass
- 0 remaining `SG.R##` patterns in `references/` (excluding v6 SKILL.md migration table)