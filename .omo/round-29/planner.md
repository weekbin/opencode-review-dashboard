# R29 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 10, R29)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #59 | Typecheck periodic verification | 0×2 = **0** | 3 (internal tooling) | 5×2 = **10** (LOW risk) | 4 | **17/35** | tooling |
| #60 | Housekeeping: clean up pre-existing orphans | 0×2 = **0** | 3 (internal housekeeping) | 5×2 = **10** (LOW risk) | 5 | **18/35** | tooling |

## Caps check

| Cap | Limit | R29 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 0 + 2 tooling | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 0 | ✓ (within cap) |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R21-R28 closed all pm-manager-approved). R29 candidates are all internal carryovers.

## Selected scope

**R29 SHIP SCOPE**:
1. **#59 Typecheck periodic verification (tooling)** — 5-15 LOC, 1-2 files. AC: typecheck script + pre-commit hook OR GitHub Actions workflow.
2. **#60 Housekeeping: clean up pre-existing orphans (tooling)** — 5-10 LOC, 8+ files. AC: all R21-R28 .omo/round-N/ artifacts committed OR properly ignored.

## Order rationale

**#60 FIRST, #59 SECOND**:
- #60 is housekeeping (cleans working tree, sets up R29 for clean state)
- #59 is typecheck verification (extends existing typecheck script)
- Rationale: housekeeping first to clear the deck, then typecheck to prevent future issues
- (Alternative: typecheck first, then housekeeping. Both work; housekeeping-first chosen for cleaner working tree.)

## Risk note

- #59 must NOT break existing typecheck script (R27 #55)
- #59 must NOT change source code (tooling only)
- #60 must NOT lose important artifacts (R21-R28 have all closed decisions, retros, etc.)
- #60 must NOT break .gitignore rules for OTHER skills
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — subagent double-write: SG.R24.1 — verify `pwd == worktree` AFTER every Write/Edit (R25+R26+R27+R28 SUCCESS).
- both — bilingual lockstep: SG.R25.1 — pre-commit grep -c verify BEFORE commit (R29 is 2nd round to use this gate).
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#60** (atomic commit 1):
- `.omo/round-{21,22,23,24,25,26,27,28}/*.md` (8 rounds of artifacts, multiple files per round)
- `git ls-files .omo/` (verify tracked)
- ~30+ files committed

**#59** (atomic commit 2):
- `package.json` (add `typecheck` script if not present, OR add pre-commit hook config)
- `scripts/typecheck.sh` (extend with pre-commit hook wrapper)
- 2-3 file touches, 5-15 LOC

## Subagent budget

Per v5.3.9, 5-20 min per subagent. R29 has 2 subagent calls.

## PASS criteria for Phase 3

- 6-10 ACs total
- All ACs PASS or explicitly noted as partial
- No new STRINGS keys
- i18n regression-guard test NOT touched
- mock-server still serves at http://localhost:8890
- **SG.R25.1 SECOND-TIME APPLY** — pre-commit grep -c verify BEFORE commit (R29)
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- GH issues #59 + #60 auto-closed by Phase 4.9

## OK to proceed

✓ All caps honored. ✓ Risk LOW for both. ✓ ACs testable. ✓ No new STRINGS keys. Branch + worktree pre-declared. SG.R24.1 + SG.R25.1 will apply at Phase 2 subagent prompts.