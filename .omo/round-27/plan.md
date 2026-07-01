# R27 Plan — tsc PATH investigation (feature) + Apply SG.R25.1 (skill-patch)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-27-tsc-investigation-and-sg25-1-skill-patch`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-27`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)
> **v5.3.8 SG.R24.1**: Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (R25+R26 SUCCESS pattern)

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#55 tsc PATH investigation (feature)** — fix `tsc: command not found` issue (5 rounds stale)
- **#56 Apply SG.R25.1 (skill-patch)** — add pre-commit SG.R22.1 verify gate to prevent future bilingual lockstep gaps

## 2. Non-goals

- NO new dependencies (TypeScript already in node_modules)
- NO source code changes for #56 (skill file only)
- NO breaking changes to dev workflow
- NO new STRINGS keys (both candidates are internal)
- NO new localStorage keys

## 3. AC trace (acceptance criteria, testable)

### Issue #55 — tsc PATH investigation (5 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 14.1 | `which tsc` returns a valid path OR `bun build --target=bun` is documented as alternative | shell test | shell |
| 14.2 | TypeScript version matches the version in `node_modules/typescript` | shell test | shell |
| 14.3 | `tsc --noEmit` runs successfully on the codebase OR `bun build` validates types | shell test | shell |
| 14.4 | No source code changes (tooling only) | git diff | shell |
| 14.5 | Documented in commit message OR new comment in SKILL.md | inspection | commit |

### Issue #56 — Apply SG.R25.1 skill-patch (6 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 15.1 | SKILL.md has new section "SG.R25.1: pre-commit SG.R22.1 verify gate" | inspection | SKILL.md |
| 15.2 | Section documents the 4-step pre-commit grep -c gate | inspection | SKILL.md |
| 15.3 | phase-prompts.md Phase 3.5 prompt updated to instruct pre-commit verify | inspection | phase-prompts.md |
| 15.4 | Existing SGs (R19.x + R20.1 + R22.x + R24.1) preserved (no breaking changes) | inspection | SKILL.md |
| 15.5 | SG.R25.1 includes evidence from R25 (bilingual lockstep gap caught by Oracle) | inspection | SKILL.md |
| 15.6 | skill file header bumped to v5.3.9 (or appropriate version) | inspection | SKILL.md |

**Total ACs**: 11 (5 + 6)

## 4. Files

### Issue #55 (atomic commit 1)
- `package.json` (add `typescript` devDep — IF choosing devDep option)
- OR `~/.zshrc` (add tsc to PATH — IF choosing shell config option)
- OR `scripts/typecheck.sh` (alternative — IF choosing bun build option)
- 1 file, 5-15 LOC

### Issue #56 (atomic commit 2)
- `.opencode/skills/team-dev-loop/SKILL.md` (add new section for SG.R25.1)
- `.opencode/skills/team-dev-loop/references/phase-prompts.md` (update Phase 3.5 prompt)
- 2 files, 5-10 LOC

## 5. Strategy & approach

### #55 — tsc PATH investigation pattern

**Option A (preferred): Install TypeScript as devDep**
```bash
# Add to package.json devDependencies:
"typescript": "^5.4.0"  # match node_modules/typescript version

# Use as:
./node_modules/.bin/tsc --noEmit
# OR add to package.json scripts:
"typecheck": "tsc --noEmit"
```

**Option B: Add tsc to PATH via shell config**
```bash
# In ~/.zshrc:
export PATH="$HOME/.bun/install/global/node_modules/.bin:$PATH"
# OR
export PATH="$(npm root -g)/.bin:$PATH"
```

**Option C: Document `bun build --target=bun` as alternative**
```bash
# Already works (R25 + R26 subagents confirmed 0 errors)
# Document in scripts/typecheck.sh:
#!/bin/bash
bun build --target=bun src/ui/app.ts --no-bundle
```

**Decision**: Subagent will pick the most appropriate option based on codebase inspection. All 3 are acceptable.

### #56 — Apply SG.R25.1 skill-patch pattern

**Pattern A: Add new SG.R25.1 section to SKILL.md** (similar format to existing SG.R19.5, SG.R19.8, SG.R20.1, SG.R22.1, SG.R22.2, SG.R24.1):

```markdown
## Pre-commit SG.R22.1 verify gate (NEW R25 retro SG.R25.1 — APPLIED, R25 gap-fix precedent)

**Why** (R25 retro F.1): R25 doc edit had 2 missing visual sections (English `### Diff virtualization for 1000+ line files` retroactively removed + zh-CN `### 批量标记侧边栏文件已审查` never added). Oracle caught the gap post-commit. R25-gap-fix applied in-round via commit 52e6a3a. **This SG ensures the gap is caught BEFORE commit, not after.**

**Rule** (mandatory, SG.R25.1): After EVERY doc commit (Phase 3.5 Doc Writer + Phase 4 Decision), BEFORE running `git commit`, run `grep -c` pre-commit verification:

```bash
# For each NEW section/feature added in the doc edit
NEW_SECTION="Bulk delete in Conversation tab"
echo "README.md: $(grep -c "$NEW_SECTION" README.md)"
echo "README.zh-CN.md: $(grep -c "$(zh-equivalent)" README.zh-CN.md)"
# Counts MUST match (1=1). If not, fix immediately BEFORE commit.
```

**Block git commit until bilingual lockstep verified**.

**F.1 evidence (R25)**: R25 ship `65a1c43` (or its pre-merge commit) had 2 missing visual sections. Caught by Oracle post-merge. Fixed in-round via `docs(r22-zh-fix): add missing zh-CN visual sections` style repair commit.

**R26 evidence**: SG.R25.1 applied at Phase 3.5 doc update. Pre-commit `grep -c` verification showed all 4 counts match (1=1). Zero silent failures. No R26-gap-fix needed.
```

**Pattern B: Update phase-prompts.md Phase 3.5 prompt**
- Add explicit instruction: "After Edit, run grep -c counts on README.md and README.zh-CN.md BEFORE git commit"
- Reference SG.R25.1 in the prompt

## 6. STRINGS_USAGE_PLAN

**No new STRINGS keys** for R27. Both candidates are internal/tooling/skill-patch.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #55 — tsc PATH fix breaks existing dev workflow | Test before commit; use `which tsc` to verify |
| #55 — TypeScript version mismatch between devDep and node_modules | Match existing version (5.4.x or whatever node_modules has) |
| #56 — SG.R25.1 break existing SGs in SKILL.md | AC 15.4 explicit regression test |
| #56 — phase-prompts.md update changes subagent behavior unintentionally | Use additive language ("ADD pre-commit verify BEFORE commit") |
| both — out of worktree dir | SG.R19.4 sanity check + SG.R24.1 per-Edit verify |
| both — missing node_modules in worktree | SG.R22.2 symlink from main |
| both — subagent writes to main dir | SG.R24.1 per-Edit `pwd` verification (R25+R26 SUCCESS) |
| both — malformed commit message | Use heredoc `git commit -F- <<EOF` |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 11 ACs total: 5 PASS for #55 + 6 PASS for #56 = 11/11
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS
- No new STRINGS keys (internal candidates)
- i18n regression-guard test NOT touched
- Full suite: 602 + ~2 = ~604 pass / 0 fail (no new tests, just verification)
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- SG.R24.1 per-Edit verification applied (v5.3.8 SUCCESS pattern CONTINUES)
- GH issues #55 + #56 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R28+)

- Toast screenshots (R19/R20 retro, 3+ rounds stale)
- Any new feature from user feedback (R+ carryover)
- Skill file edits for SGs beyond R25.1 (R+ evolution)

## 10. References

- brief.md: `.omo/round-27/brief.md`
- R25-gap-fix: `docs(r22-zh-fix): add missing zh-CN visual sections for R21+R22 (bilingual lockstep repair)` (precedent)
- R25 retro: `.omo/round-25/retro.md` (SG.R25.1 surfaced as candidate)
- v5.3.8 SKILL.md: SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1 all embedded (R27 will add SG.R25.1 → v5.3.9)
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol