# R47 Research

## Source files
- `.opencode/skills/team-dev-loop/references/phase-prompts.md` (1262 lines)
- `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md` (149 lines)

## Existing patterns (preserved)

The references/ directory uses an existing inline `[R## retro]` pattern from earlier rounds (e.g., L116 "R5 retro Gap 1", L275 "v5.2 (R10 retro)", L498 "R12 patch Gap #2"). The legacy `SG.R##` patches were layered ON TOP of these existing callouts.

**Mapping**:
| Old pattern | New callout |
|---|---|
| `SG.R19.1` (post-merge rebuild) | `[R19 retro] post-merge rebuild` |
| `SG.R19.3` (i18n STRINGS_USAGE_PLAN) | `[R19 retro] i18n STRINGS_USAGE_PLAN` |
| `SG.R19.4` (WORKDIR verification) | `[R19 retro] WORKDIR verification` |
| `SG.R20.1` (Phase 2.6 rebuild checklist) | `[R20 retro] Phase 2.6 rebuild checklist` |
| `SG.R25.1` (pre-commit README verify) | `[R25 retro] pre-commit README verify` |

## Simplest change
- 5 sed replacements, all occurrences handled by `sed -i '' 's/OLD/NEW/g'`
- Cleanup pass: remove redundant `(NEW R## retro [R## retro] (description))` patterns → `[R## retro] description`

## Risk
- v6 SKILL.md still mentions "SG.R##" in 2 places (L116 migration table, L201 migration table). These are intentional — describing v5 → v6 migration. Not stale.
- references/ files are now disconnected from v6 SKILL.md (no imports, no cross-links). They serve as historical context only.
- No code/test affected; only doc strings.

## Compatibility check
- Pre-commit hook #2 (SKILL.md drift detection): unaffected (phase-prompts.md, pre-commit-audit-spec.md are not newer than SKILL.md after my changes — already older)
- Tests: 626 unchanged (no src/ touched)
- proposals.jsonl: append 1 line for R47