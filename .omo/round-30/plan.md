# R30 Plan — Pre-existing orphans cleanup (tooling) + SG.R25.1 evolution: husky pre-commit hook (skill-patch)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-30-sg25-1-evolution`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-30`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)
> **v5.3.8 SG.R24.1**: Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (R25+R26+R27+R28+R29 SUCCESS pattern)
> **v5.3.9 SG.R25.1 (3RD-TIME APPLY)**: Pre-commit SG.R22.1 verify gate — run grep -c counts BEFORE git commit

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#62 Pre-existing orphans cleanup (tooling)** — investigate `.omo/round-{21..29}/*.md` working files, commit selectively (matching R25+ pattern) OR update .gitignore
- **#61 SG.R25.1 evolution: husky pre-commit hook (skill-patch)** — automate SG.R25.1 pre-commit verify gate via husky + lint-staged

## 2. Non-goals

- NO new dependencies (except husky + lint-staged for #61, which are well-tested devDeps)
- NO source code changes
- NO existing tooling changes (R29 #59 typecheck workflow, R27 #55 typecheck wrapper)

## 3. AC trace (acceptance criteria, testable)

### Issue #62 — Pre-existing orphans cleanup (5 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 17.1 | `.gitignore` updated OR selective commit applied | inspection | `.gitignore` OR `.omo/round-*/` |
| 17.2 | `git status` shows no untracked R21-R29 working files (except R30 worktree) | shell test | `git status --short` |
| 17.3 | All R21-R29 closure docs present in git history (already verified by R29 #60 N/A) | shell test | `git log --oneline .omo/round-21/` |
| 17.4 | No source code changes (tooling only) | git diff | shell |
| 17.5 | Decision documented in retro.md (Option A/B/C chosen + rationale) | inspection | `.omo/round-30/retro.md` |

### Issue #61 — SG.R25.1 evolution: husky pre-commit hook (5 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 18.1 | husky + lint-staged added to devDependencies | inspection | `package.json` |
| 18.2 | `.husky/pre-commit` created with SG.R25.1 automation (typecheck + grep -c + git status) | inspection | `.husky/pre-commit` |
| 18.3 | `prepare: husky` script added to package.json | inspection | `package.json` |
| 18.4 | Pre-commit hook runs `bun run typecheck` + `grep -c` SG.R22.1 + `git status` clean check | shell test | `.husky/pre-commit` |
| 18.5 | No source code changes (tooling only) | git diff | shell |

**Total ACs**: 10 (5 + 5)

## 4. Files

### Issue #62 (atomic commit 1)
- `.gitignore` (add `.omo/round-N/*.md` as ignored, OR commit selectively)
- OR `.omo/round-{21..29}/*.md` (selective commit)
- 1+ file touches, 5-10 LOC

### Issue #61 (atomic commit 2)
- `package.json` (add husky + lint-staged devDeps, add `prepare: husky` script)
- `.husky/pre-commit` (NEW, shell script)
- 2-3 file touches, 5-10 LOC

## 5. Strategy & approach

### #62 — Housekeeping pattern (investigation + selective commit)

**Pattern A (preferred): Selective commit (R25/R26/R27/R28 convention)**
- Commit only closure docs: `decision.md` + `retro.md` + `post-exec.md` + `self-check.md` + `experience-summary.md`
- Other working files (brief.md, plan.md, reviews) stay untracked (established pattern)
- Matches R29 #60 N/A conclusion (R21-R28 closure docs ALREADY committed)

**Pattern B: Update .gitignore**
- Add `.omo/round-N/*.md` as permanently ignored
- Simpler than selective commit but loses forensic continuity

**Decision**: Use Pattern A (selective commit) — matches established convention, preserves history, Oracle already validated this in R29.

### #61 — Husky pre-commit hook automation

**Pattern A (preferred): Standard husky pre-commit hook**
- Install husky + lint-staged
- Create `.husky/pre-commit` shell script with:
  ```bash
  #!/bin/bash
  # Pre-commit SG.R22.1 verify gate (SG.R25.1 automation)
  # Extends R28 first-time apply + R29 second-time apply

  set -e

  # 1. Typecheck (R27 #55 + R29 #59)
  bash scripts/typecheck.sh

  # 2. SG.R22.1 bilingual lockstep (pre-commit grep -c)
  for new_section in $NEW_SECTIONS; do
    en_count=$(grep -c "$new_section" README.md 2>/dev/null || echo 0)
    zh_count=$(grep -c "$(echo "$new_section" | sed 's/Some English/对应中文/')" README.zh-CN.md 2>/dev/null || echo 0)
    if [ "$en_count" != "$zh_count" ]; then
      echo "BILINGUAL MISMATCH: $new_section (en=$en_count zh=$zh_count)"
      exit 1
    fi
  done

  # 3. Git status clean check (no uncommitted artifacts)
  if ! git diff --cached --quiet; then
    echo "Git status not clean"
    exit 1
  fi
  ```
- Update package.json:
  - Add devDeps: `"husky": "^9.0.0"`, `"lint-staged": "^15.0.0"`
  - Add script: `"prepare": "husky"`

## 6. STRINGS_USAGE_PLAN

**No new STRINGS keys** for R30 (all internal/tooling). 0 i18n changes.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #61 — husky pre-commit hook breaks existing workflow | Test before commit; use `git commit --no-verify` if needed |
| #61 — too many new devDeps (husky + lint-staged) | Only 2 devDeps, well-tested standard |
| #61 — husky fails on WSL/macOS/Linux | Use `husky install` to set up cross-platform hooks |
| #62 — too many files to commit (9 rounds × ~15 files = ~135 files) | Use selective commit (only closure docs, matching R25+ pattern) |
| #62 — accidental commit of sensitive data | All .omo/round-N/ files are internal design docs, no secrets |
| both — out of worktree dir | SG.R19.4 sanity check + SG.R24.1 per-Edit verify |
| both — missing node_modules in worktree | SG.R22.2 symlink from main |
| both — subagent writes to main dir | SG.R24.1 per-Edit `pwd` verification (6th consecutive SUCCESS) |
| both — malformed commit message | Use heredoc `git commit -F- <<EOF` |
| both — bilingual lockstep silent failure | SG.R25.1 pre-commit grep -c verify BEFORE commit (3rd-time apply) |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 10 ACs total: 5 PASS for #62 + 5 PASS for #61 = 10/10
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS
- No new STRINGS keys (no i18n changes)
- i18n regression-guard test NOT touched
- Full suite: 602 pass / 0 fail (no source code changes)
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- **SG.R25.1 THIRD-TIME APPLY** — pre-commit grep -c verify BEFORE commit (R30)
- GH issues #61 + #62 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R31+)

- Tsc PATH investigation (R22 carryover, 8 rounds stale)
- Any new feature from user feedback (R+ carryover)

## 10. References

- brief.md: `.omo/round-30/brief.md`
- v5.3.9 SKILL.md: SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1 + SG.R25.1 all embedded
- R28 retro: SG.R25.1 evolution candidate
- R29 retro: pre-existing orphans cleanup candidate
- R27 #55: scripts/typecheck.sh + typecheck script in package.json
- R29 #59: .github/workflows/typecheck.yml (CI-time typecheck)
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol