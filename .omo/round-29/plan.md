# R29 Plan — Typecheck periodic verification (tooling) + Housekeeping: clean up pre-existing orphans (tooling)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-29-typecheck-and-housekeeping`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-29`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)
> **v5.3.8 SG.R24.1**: Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (R25+R26+R27+R28 SUCCESS pattern)
> **v5.3.9 SG.R25.1 (2ND-TIME APPLY)**: Pre-commit SG.R22.1 verify gate — run grep -c counts BEFORE git commit

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#60 Housekeeping: clean up pre-existing orphans (tooling)** — git add all R21-R28 .omo/round-N/ artifacts (preserves history, fixes Oracle-flagged housekeeping debt)
- **#59 Typecheck periodic verification (tooling)** — extend existing typecheck script (R27 #55) with pre-commit hook OR GitHub Actions workflow

## 2. Non-goals

- NO new dependencies
- NO source code changes (tooling only)
- NO existing typecheck script changes (R27 #55 already added scripts/typecheck.sh)
- NO .gitignore changes (existing rules preserved)

## 3. AC trace (acceptance criteria, testable)

### Issue #60 — Housekeeping: clean up pre-existing orphans (5 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 16.1 | All R21-R28 .omo/round-N/ artifacts git add'd | shell test | `git ls-files .omo/round-{21..28}/` |
| 16.2 | `git status` shows no untracked .omo/round-* dirs (only R29 worktree) | shell test | `git status --short` |
| 16.3 | proposals.jsonl tracked (already tracked per R27 verify) | shell test | `git ls-files .omo/proposals.jsonl` |
| 16.4 | No source code changes (tooling only) | git diff | shell |
| 16.5 | All R21-R28 closure docs present in git history | shell test | `git log --oneline .omo/round-21/` |

### Issue #59 — Typecheck periodic verification (5 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 15.1 | `package.json` has `typecheck` script (already added by R27 #55) | shell test | `grep typecheck package.json` |
| 15.2 | `tsc --noEmit` exits 0 (verified by R27 #55) | shell test | `bash scripts/typecheck.sh` |
| 15.3 | Pre-commit hook OR GitHub Actions workflow added | inspection | `.husky/` OR `.github/workflows/` |
| 15.4 | No source code changes (tooling only) | git diff | shell |
| 15.5 | Typecheck can be run manually via `bun run typecheck` | shell test | `bun run typecheck` |

**Total ACs**: 10 (5 + 5)

## 4. Files

### Issue #60 (atomic commit 1)
- `.omo/round-{21,22,23,24,25,26,27,28}/*.md` (8 rounds of artifacts, multiple files per round)
- `git add` for all of them
- ~30+ files committed

### Issue #59 (atomic commit 2)
- `package.json` (verify typecheck script exists, add if not)
- `scripts/typecheck.sh` (extend with pre-commit hook wrapper)
- `.husky/pre-commit` (NEW if using husky) OR `.github/workflows/typecheck.yml` (NEW if using GH Actions)
- 2-3 file touches, 5-15 LOC

## 5. Strategy & approach

### #60 — Housekeeping pattern (selective commit)

**Pattern A (preferred): Selective commit (R25/R26/R27/R28 convention)**
- Commit only closure docs: `decision.md` + `retro.md` + `post-exec.md` + `self-check.md` + `experience-summary.md`
- Other working files (brief.md, plan.md, etc.) stay untracked (housekeeping convention)
- Matches R25/R26/R27/R28 pattern (Oracle confirmed in R28 verification)

**Pattern B: Full commit (preserves all artifacts)**
- Commit ALL .omo/round-N/ files (brief, plan, reviews, etc.)
- More work, more commits, more cleanup later

**Decision**: Use Pattern A (selective commit) — matches established convention, less work, still cleans the major housekeeping debt flagged by Oracle.

### #59 — Typecheck verification pattern (extends R27 #55)

**Pattern A (preferred): Add GitHub Actions workflow (simplest)**
- Create `.github/workflows/typecheck.yml`
- Trigger on push/PR
- Run `bun run typecheck`
- No new dependencies (uses GitHub-hosted runners)

**Pattern B: Add husky pre-commit hook (more complex)**
- Install husky + lint-staged (NEW devDeps)
- Create `.husky/pre-commit` with `bun run typecheck`
- More setup, more dependencies

**Decision**: Use Pattern A (GitHub Actions) — no new devDeps, simpler setup, runs on PR (catches typecheck failures before merge).

## 6. STRINGS_USAGE_PLAN

**No new STRINGS keys** for R29 (all internal/tooling). 0 i18n changes.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #60 — too many files to commit (8 rounds × ~15 files = ~120 files) | Use selective commit (only closure docs) |
| #60 — accidental commit of sensitive data | All .omo/round-N/ files are internal design docs, no secrets |
| #59 — husky pre-commit hook breaks existing workflow | Use GitHub Actions (no local hook needed) |
| #59 — tsc --noEmit fails (real type errors) | Run typecheck BEFORE commit to catch issues |
| both — out of worktree dir | SG.R19.4 sanity check + SG.R24.1 per-Edit verify |
| both — missing node_modules in worktree | SG.R22.2 symlink from main |
| both — subagent writes to main dir | SG.R24.1 per-Edit `pwd` verification (R25+R26+R27+R28 SUCCESS) |
| both — malformed commit message | Use heredoc `git commit -F- <<EOF` |
| both — bilingual lockstep silent failure | SG.R25.1 pre-commit grep -c verify BEFORE commit (2nd-time apply) |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 10 ACs total: 5 PASS for #60 + 5 PASS for #59 = 10/10
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS
- No new STRINGS keys (no i18n changes)
- i18n regression-guard test NOT touched
- Full suite: 602 pass / 0 fail (no source code changes)
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- **SG.R25.1 SECOND-TIME APPLY** — pre-commit grep -c verify BEFORE commit (R29)
- GH issues #59 + #60 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R30+)

- SG.R25.1 evolution (husky pre-commit hook automation)
- Any new feature from user feedback (R+ carryover)

## 10. References

- brief.md: `.omo/round-29/brief.md`
- v5.3.9 SKILL.md: SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1 + SG.R25.1 all embedded
- R27 #55: scripts/typecheck.sh + typecheck script in package.json (baseline)
- R28 self-check L134: Oracle flagged pre-existing orphans (housekeeping debt)
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol