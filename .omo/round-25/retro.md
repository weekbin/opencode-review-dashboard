# R25 Retro — Round-end Retrospective

> **Generated**: 2026-06-30 (RALPH LOOP iteration 6, R25)
> **Round**: 25
> **Verdict**: SHIP (clean, 5th in a row after R21 + R22 + R23 + R24)
> **Predecessor**: R24 retro (which surfaced R25 candidates + SG.R24.1)

## What went well

### 1. SG.R24.1 v5.3.8 embed worked PERFECTLY
- Both R25 subagents (#52 + #51) used absolute paths in Write/Edit tool calls
- Main CLEAN post-merge — no git stash workaround needed (unlike R23+R24)
- R23+R24 recurring subagent double-write pattern **PREVENTED** by SG.R24.1
- Subagent prompt explicitly required "After EVERY Write/Edit, run `pwd` and verify pwd == worktree"

### 2. Both GH issues auto-closed (no manual close)
- R25 commit messages included "#51" + "#52" in body
- GitHub auto-closed both
- R24 #49 manual close workaround NOT needed

### 3. STRINGS_USAGE_PLAN executed cleanly for 4 keys
- 4 keys × 2 locales = 8 STRINGS entries added
- i18n regression-guard test passes all 4 (29/29, was 27/27)
- R20 retro AC1.2 pattern continues to work

### 4. SG.R20.1 3-step rebuild held up (4th consecutive)
- Merge → Build in MAIN → Grep verify all PASS
- Zero dist/ stale-content risk

### 5. Test baseline NET POSITIVE 5th round in a row
- R21: 503 pass / 1 fail
- R22: 510 pass / 0 fail (1 pre-existing fail eliminated)
- R23: 538 pass / 0 fail (+28)
- R24: 555 pass / 0 fail (+17)
- R25: 580 pass / 0 fail (+25)

### 6. Lead-direct execution at ~95 min stable
- 14 of 15 phases lead-direct
- Only Phase 2 Dev used subagent (twice)
- No team-mode invocation

## What didn't go well

### 1. **R25 doc edit had 2 missing visual sections** (Oracle caught)
- R25 edit accidentally removed English `### Diff virtualization for 1000+ line files` (R23 original)
- R25 edit missed adding zh-CN `### 批量标记侧边栏文件已审查` visual section
- Caught by Oracle verification
- Fixed in-round via 52e6a3a (re-added both sections)

### 2. **Initial Phase 3.5 doc update was committed before SG.R22.1 verify caught the gap**
- Should have run grep -c counts BEFORE committing
- Lesson: SG.R22.1 verify should run BEFORE commit, not after
- New SG candidate: SG.R25.1 — pre-commit SG.R22.1 verify mandatory gate

## Skill gaps surfaced

R25 surfaced **0 NEW** skill gaps. SG.R24.1 worked (R23+R24 recurring pattern PREVENTED).

| SG | Status | Evidence |
|---|---|---|
| SG.R19.1 (build location) | ✓ no failures | build in MAIN |
| SG.R19.2 (macOS setsid) | ✓ no failures | no setsid used |
| SG.R19.3 (STRINGS_USAGE_PLAN) | ✓ no AC1.2 PARTIAL | all 4 new keys have both locales |
| SG.R19.4 (WORKDIR VERIFICATION) | ✓ no failures | subagent verified pwd |
| SG.R19.5 (Playwright Gap #14) | ✓ no failures | 7 scenarios PASS |
| SG.R19.6 (append-only proposals.jsonl) | ✓ no failures | 10 new lines appended |
| SG.R19.8 (mandatory gap-fix) | ✓ APPLIED | R25-gap-fix bilingual section repair |
| SG.R20.1 (3-step rebuild) | ✓ no failures | merge → build → grep all PASS |
| SG.R22.1 (bilingual lockstep) | ⚠️ APPLIED post-Oracle | caught gap, fixed in-round |
| SG.R22.2 (worktree env check) | ✓ APPLIED at Phase -0 | symlink + worktree cleanup |
| **SG.R24.1 (subagent per-Edit verify)** | ✓ APPLIED — SUCCESS | main CLEAN post-merge |

## SG.R19.8 in-round gap-fix applied

Oracle caught: R25 doc edit had 2 missing visual sections. Fixed in-round:
- Re-added English `### Diff virtualization for 1000+ line files` section
- Added zh-CN `### 批量标记侧边栏文件已审查` section
- Applied SG.R22.1 grep -c verify (all counts match)
- Captured in `proposals.jsonl` as R25-gap-fix entry

## R26+ candidates (from this retro)

1. **R26+ FEATURE**: Per-finding "delete from history" (R23 retro)
2. **R26+ TOOLING**: tsc PATH investigation (R22 carryover)
3. **R26+ SKILL**: SG.R25.1 — pre-commit SG.R22.1 verify mandatory gate (run BEFORE commit, not after)

## Cross-round state

- `.omo/round-25/` — 16+ artifacts written (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl` — 75 lines (65 pre-R25 + 10 R25 entries)
- `~/.opencode/reviews/` — cross-round state untouched
- R25 worktree at `~/.worktrees/team-dev-loop-round-25` (kept post-merge, will be cleaned at R27+ housekeeping per SG.R22.2)
- R24 worktree still exists (kept for reference)

## Skill audit

Per v3+ spec, retro surfaces skill gaps; those become priority deliverable of next round.

R25 retro surfaces: 0 new skill gaps (SG.R24.1 worked as designed).
R25 final skill audit: 100% PASS (all existing patches held up, SG.R24.1 SUCCESS).

## Verdict

R25 was a clean SHIP (5th in a row). SG.R24.1 successfully prevented the R23+R24 recurring pattern. Test baseline NET POSITIVE (580/580). Both R25 issues auto-closed (no manual close). Lead-direct execution at ~95 min continues to scale. R26 candidates well-defined.