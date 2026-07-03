# R47 Discovery

## Source: R46 retro + v6 spec
- R46 retro: "v6 is now the consolidation. Going forward, ADD capability, not patches."
- v6 SKILL.md: 6 artifacts per round, no patch numbering.

## Backlog scan
1. **GH issues** (`gh issue list --label pm-manager-approved --state open`): 0 open
2. **All open issues**: 0 open
3. **R46 carry-over**: empty
4. **proposals.jsonl** (last 5 lines): all housekeeping rounds (R42–R46)

## No backlog — DECIDE housekeeping

**Selected scope**: v6 missed cleanup of stale `SG.R##` patterns in `.opencode/skills/team-dev-loop/references/`. v6 SKILL.md was rewritten (2716→230 lines) but references/ directory still uses v5 patch-numbering.

## Specific candidates (from grep)
- `references/phase-prompts.md`: 3 references (SG.R19.3, SG.R19.4, SG.R25.1)
- `references/pre-commit-audit-spec.md`: 7 references (SG.R19.1, SG.R20.1)
- 5 unique patterns, 10 total occurrences
- 2 files affected, ~3070 lines of legacy v5 content

## Decision
Pick: replace all `SG.R##` patterns with `[R## retro]` inline callouts, matching v6's migration pattern (per SKILL.md line 200: "Inline `[R5X lesson]` callouts preserve critical lessons"). Light-touch: keep references/ content as historical context, just rebrand the patch labels.

## Why this scope
- Lightweight (≤10 LOC change)
- No `src/` change (zero risk to product)
- v6 lock-in validation: tests that v6 SKILL.md's "no SG.R patches" anti-pattern actually propagates to references/
- Pre-commit hook #2 (SKILL.md drift detection) would have caught this if we had run it before R46 commit — already addressed via pre-commit enforcement going forward

## Rejected alternatives
- **Delete references/ entirely** (3070-line removal): too aggressive for first post-v6 round, preserves historical value
- **Bulk-rewrite references/ to v6-style**: too much work for a single round; can be split into multiple rounds if needed