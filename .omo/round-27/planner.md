# R27 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 8, R27)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #55 | tsc PATH investigation | 0×2 = **0** | 3 (internal tooling) | 5×2 = **10** (LOW risk) | 4 | **17/35** | feature (tooling) |
| #56 | Apply SG.R25.1 | 0×2 = **0** | 3 (internal skill file) | 5×2 = **10** (LOW risk) | 4 | **17/35** | skill-patch |

## Caps check

| Cap | Limit | R27 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (tsc) + 1 skill-patch (SG.R25.1) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 0 | ✓ (within cap) |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R21-R26 closed all pm-manager-approved). R27 candidates are all carryovers (5 rounds stale for tsc, 2 rounds for SG.R25.1).

## Selected scope

**R27 SHIP SCOPE**:
1. **#55 tsc PATH investigation (feature)** — 5-15 LOC, 1-2 files. AC: `tsc --noEmit` runs successfully OR `bun build --target=bun` documented as alternative.
2. **#56 Apply SG.R25.1 (skill-patch)** — 5-10 LOC, 1-2 files. AC: pre-commit SG.R22.1 verify gate documented in SKILL.md + phase-prompts.md.

## Order rationale

**#55 FIRST, #56 SECOND**:
- #55 (tsc) is internal tooling fix — clears dev environment
- #56 (SG.R25.1) is skill-patch — applies to future rounds
- Rationale: tooling first to enable typecheck, then skill-patch to prevent future gaps
- (Alternative: skill-patch first then tooling. Both work; tooling-first chosen for cleaner dev experience.)

## Risk note

- #55 (tsc) is internal — no user-facing impact
- #56 (SG.R25.1) prevents future bilingual lockstep gaps (R25 had 2 missing visual sections)
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — subagent double-write: SG.R24.1 — verify `pwd == worktree` AFTER every Write/Edit (R25+R26 SUCCESS).
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#55** (atomic commit 1):
- `package.json` (add `typescript` devDep OR document alternative)
- `~/.zshrc` (add tsc to PATH) OR `scripts/typecheck.sh` (alternative)
- 1-2 file touches, 5-15 LOC

**#56** (atomic commit 2):
- `.opencode/skills/team-dev-loop/SKILL.md` (add new section for SG.R25.1)
- `.opencode/skills/team-dev-loop/references/phase-prompts.md` (update Phase 3.5 prompt)
- 2 file touches, 5-10 LOC

## Subagent budget

Per v5.3.8, 5-20 min per subagent. R27 has 2 subagent calls. Both within budget.

## PASS criteria for Phase 3

- 6-10 ACs total
- All ACs PASS or explicitly noted as partial
- No new STRINGS keys (internal candidates)
- i18n regression-guard test NOT touched (no new keys)
- mock-server still serves at http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- GH issues #55 + #56 auto-closed by Phase 4.9

## OK to proceed

✓ All caps honored. ✓ Risk LOW for both. ✓ ACs testable. ✓ No i18n needed. Branch + worktree pre-declared. SG.R24.1 to apply at Phase 2.