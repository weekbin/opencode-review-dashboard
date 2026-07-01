# R28 Planner — Scope Selection

> **Generated**: 2026-06-30 (RALPH LOOP iteration 9, R28)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #57 | Toast screenshots | 2×2 = **4** | 3 (modern apps) | 4×2 = **8** (vanilla, low risk) | 5 | **20/35** | polish |
| #58 | R28 first round SG.R25.1 | 0×2 = **0** | 3 (internal validation) | 5×2 = **10** (no behavior change) | 5 | **18/35** | skill-validation |

## Caps check

| Cap | Limit | R28 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 0 + 1 polish | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 1 | ✓ |
| polish | ≤ 1 | 1 (toast screenshots) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: **0** (R21-R27 closed all pm-manager-approved). R28 candidates are all carryovers.

## Selected scope

**R28 SHIP SCOPE**:
1. **#57 Toast screenshots (polish)** — 10-20 LOC, 2 files. AC: 4 toast screenshots saved to docs/screenshots/, README + README.zh-CN.md reference them.
2. **#58 R28 first round SG.R25.1 (skill-validation)** — 0-5 LOC, 0 files (just verification). AC: pre-commit grep -c counts match BEFORE git commit.

## Order rationale

**#57 FIRST, #58 SECOND**:
- #57 (toast screenshots) is the main commit
- #58 (SG.R25.1 validation) is process-only (no commit)
- #58 is applied DURING #57 (during the docs commit for #57)
- Rationale: #57 is the deliverable, #58 is the process guarantee

## Risk note

- #57 must NOT break existing toast logic (R14 #24)
- #57 must NOT break R24 captured toast screenshots
- #58 (SG.R25.1) must NOT add false positive verify failures
- both — out of worktree dir: SG.R19.4 sanity check BEFORE first git op.
- both — node_modules env: SG.R22.2 — symlink from main BEFORE first test run.
- both — subagent double-write: SG.R24.1 — verify `pwd == worktree` AFTER every Write/Edit (R25+R26+R27 SUCCESS).
- **NEW v5.3.9**: SG.R25.1 — pre-commit grep -c verify BEFORE git commit (first round to use).
- both — R3-style fabricated audit: git cat-file -e on every SHA in Phase 2.5.

## Files expected to touch

**#57** (atomic commit 1):
- `docs/screenshots/r28-s{1-4}-toast-*.png` (4 new files)
- `README.md` (replace text-only "Toast notifications" + "Auto-save indicator" sections with image + caption)
- `README.zh-CN.md` (parallel)
- 6 file touches, 10-20 LOC

**#58** (no commit, just verification):
- 0 files (just process)
- 0-5 LOC (just documentation in retro.md)

## Subagent budget

Per v5.3.9, 5-20 min per subagent. R28 has 1 subagent call (for #57). #58 is lead-direct.

## PASS criteria for Phase 3

- 4-6 ACs total (3 for #57 + 1-2 for #58 + 1 for SG.R25.1 verification)
- All ACs PASS or explicitly noted as partial in SHIP-WITH-NOTES
- Phase 3c Playwright Gap #14 covers: toast screenshots referenced in README
- i18n regression-guard test NOT touched (no new keys)
- mock-server still serves at http://localhost:8890
- **SG.R25.1 FIRST-TIME APPLY** — pre-commit grep -c verify BEFORE git commit (R28 specific)
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 1 SHA verified + 3 fast gates
- GH issues #57 + #58 auto-closed by Phase 4.9

## OK to proceed

✓ All caps honored. ✓ Risk LOW. ✓ ACs testable. ✓ No new STRINGS keys. Branch + worktree pre-declared. SG.R24.1 + SG.R25.1 will apply at Phase 2 subagent prompts.