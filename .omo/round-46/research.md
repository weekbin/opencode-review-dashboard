# R46 Research

## Source: v5 SKILL.md + .husky/pre-commit

### Files involved
- `.opencode/skills/team-dev-loop/SKILL.md` (2716 lines → 230 lines)
- `.husky/pre-commit` (16 lines → 95 lines)

### Existing patterns (preserved)
- R44 pre-commit: `bun run check && bun test` (kept as checks 7+8)
- v5 SG.R44.1 8-command sweep: distributed across pre-commit checks 1-6
- v5 17-phase structure: collapsed to 7 capabilities
- v5 12+ artifacts: collapsed to 6 artifacts (discovery + research + brief + verify + retro + decision)

### Simplest change
- v6 SKILL.md frontmatter: update `description` to reflect v6 spec (7 caps, pre-commit gate, self-driving)
- v6 SKILL.md body: replace 70+ SG.R patches with 7 capabilities + inline `[R5X lesson]` callouts
- `.husky/pre-commit`: add 6 mechanical hygiene checks before existing lint/test

### Risk
- Pre-commit check #5 (orphan GH issues) is informational — doesn't block. Existing v5 sweep allowed this. Confirmed acceptable.
- Pre-commit check #6 (plugin-load) requires `gh` CLI available. Already required for v5 SG.R44.1 command 5. No new dependency.
- Pre-commit check #2 (SKILL.md drift) is informational — doesn't block. Acceptable for v6 (lead can ignore informational warnings).

### Compatibility check
- R45 retro artifacts unchanged (`.omo/round-45/`)
- proposals.jsonl format unchanged (R46 will append 1 line)
- Round artifacts path unchanged (`.omo/round-N/`)