# R30 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 11, R30)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #61 | SG.R25.1 evolution (husky) | 0×2 = **0** | 3 (automation) | 5×2 = **10** (LOW risk) | 4 | **17/35** | skill-patch |
| #62 | Pre-existing orphans cleanup | 0×2 = **0** | 3 (housekeeping) | 5×2 = **10** (LOW risk) | 5 | **18/35** | tooling |

## Caps check

| Cap | Limit | R30 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 0 + 2 tooling | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 0 | ✓ (within cap) |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R21-R29 closed all pm-manager-approved). R30 candidates are all internal carryovers.

## Selected scope

**R30 SHIP SCOPE**:
1. **#61 SG.R25.1 evolution (skill-patch)** — 5-10 LOC, 2-3 files. AC: husky + lint-staged installed, .husky/pre-commit runs typecheck + grep -c SG.R22.1 + git status clean check.
2. **#62 Pre-existing orphans cleanup (tooling)** — 5-10 LOC, 1 file (.gitignore) + investigation. AC: pre-existing orphans either committed (selective pattern) or properly ignored.

## Order rationale

**#62 FIRST, #61 SECOND**:
- #62 is housekeeping (cleans the deck, sets up R30 for clean state)
- #61 is automation (husky pre-commit hook)
- Rationale: housekeeping first to clear the deck, then automation to prevent future issues
- (Alternative: automation first, then housekeeping. Both work; housekeeping-first chosen for cleaner working tree.)

## Risk note

- #61 must NOT break existing pre-commit flow (R29 #59 added GitHub Actions typecheck, no local hook yet)
- #61 must NOT add too many new devDeps (just husky + lint-staged)
- #62 must NOT lose important artifacts (R21-R29 have all closure docs, but working files are NOT closure docs)
- #62 must NOT change .gitignore for OTHER skills (only .omo/round-N/ if needed)
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — subagent double-write: SG.R24.1 — verify `pwd == worktree` AFTER every Write/Edit (6th consecutive SUCCESS).
- both — bilingual lockstep: SG.R25.1 — pre-commit grep -c verify BEFORE commit (3rd-time apply).
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#62** (atomic commit 1):
- `.gitignore` (add `.omo/round-N/*.md` as ignored, OR commit selectively)
- OR `.omo/round-{21..29}/*.md` (selective commit, matching R25+ pattern)
- 1+ file touches, 5-10 LOC

**#61** (atomic commit 2):
- `package.json` (add husky + lint-staged devDeps, add `prepare: husky` script)
- `.husky/pre-commit` (NEW, shell script with typecheck + grep -c + git status checks)
- 2-3 file touches, 5-10 LOC

## Subagent budget

Per v5.3.9, 5-20 min per subagent. R30 has 2 subagent calls.

## PASS criteria for Phase 3

- 6-10 ACs total
- All ACs PASS or explicitly noted as partial
- No new STRINGS keys
- i18n regression-guard test NOT touched
- mock-server still serves at http://localhost:8890
- **SG.R25.1 THIRD-TIME APPLY** — pre-commit grep -c verify BEFORE commit (R30)
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- GH issues #61 + #62 auto-closed by Phase 4.9

## OK to proceed

✓ All caps honored. ✓ Risk LOW for both. ✓ ACs testable. ✓ No new STRINGS keys. Branch + worktree pre-declared. SG.R24.1 + SG.R25.1 will apply at Phase 2 subagent prompts.