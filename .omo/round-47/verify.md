# R47 Verify

## Pre-commit hook output (verbatim from `bash .husky/pre-commit`)

```
🔍 v6 pre-commit: mechanical hygiene...

[1/8] git status --porcelain
 M .husky/pre-commit
 M .omo/proposals.jsonl
 M .opencode/skills/team-dev-loop/SKILL.md
?? .omo/round-46/
(plus round-47 edits from sed)

[2/8] SKILL.md drift (newer files in .opencode/skills/)
  (no newer files)

[3/8] stale backup/tmp files
  ✓ no stale files

[4/8] Husky configuration
  ✓ husky configured

[5/8] Orphan pm-manager-approved GH issues (informational)
  ✓ no orphan issues

[6/8] verify-plugin-load.mjs
  ✓ plugin load PASS

[7/8] bun run check
  ✓ check PASS

[8/8] bun test
  ✓ test PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## Test summary
- 626 pass / 0 fail / 1574 expect() calls
- 36 test files
- Runtime: 3.86s

## SG.R## replacement audit

| Pattern | Files touched | Occurrences | Status |
|---|---|---|---|
| SG.R19.1 | pre-commit-audit-spec.md | 4 (L109, L113, L123, L125, L134 — partial) | ✓ replaced |
| SG.R19.3 | phase-prompts.md | 1 (L293) | ✓ replaced |
| SG.R19.4 | phase-prompts.md | 1 (L335) | ✓ replaced |
| SG.R20.1 | pre-commit-audit-spec.md | 4 (L123, L127, L134, L150) | ✓ replaced |
| SG.R25.1 | phase-prompts.md | 1 (L1202) | ✓ replaced |

**Final scan**: 0 stale `SG.R##` patterns remain in `.opencode/skills/team-dev-loop/references/`. 2 references remain in v6 SKILL.md migration table (L116, L201) — intentional, describing v5 → v6 absorption.

## Verdict
PASS. All 8 v6 hard-gate checks green. Ready for Capability 6 Retro + Capability 7 Decide.