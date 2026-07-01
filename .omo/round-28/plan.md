# R28 Plan — Toast screenshots (polish) + R28 first round SG.R25.1 (skill-validation)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-28-toast-screenshots`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-28`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)
> **v5.3.8 SG.R24.1**: Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (R25+R26+R27 SUCCESS pattern)
> **v5.3.9 SG.R25.1 (NEW — R28 FIRST ROUND TO USE)**: Pre-commit SG.R22.1 verify gate — run grep -c counts BEFORE git commit

## 1. Goal

Close 2 GH issues in 1 atomic commit + 0 validation commit:
- **#57 Toast screenshots (polish)** — 4 toast screenshots + README + zh-CN references
- **#58 R28 first round SG.R25.1 (skill-validation)** — pre-commit grep -c verify gate applied (no commit)

## 2. Non-goals

- NO new dependencies (vanilla playwright-cli + existing R14 toast system)
- NO schema changes
- NO existing toast logic changes (R14 #24)
- NO R24 captured toast screenshots changes (already present in docs/screenshots/)

## 3. AC trace (acceptance criteria, testable)

### Issue #57 — Toast screenshots (3 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 17.1 | 4 toast screenshots saved to docs/screenshots/r28-s{1-4}-toast-*.png | inspection | `docs/screenshots/` |
| 17.2 | README "Toast notifications" section references screenshots (en + zh-CN) | inspection + SG.R25.1 grep -c | `README.md` + `README.zh-CN.md` |
| 17.3 | README "Auto-save indicator" section references screenshot (en + zh-CN) | inspection + SG.R25.1 grep -c | `README.md` + `README.zh-CN.md` |

### Issue #58 — R28 first round SG.R25.1 (2 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 18.1 | Pre-commit SG.R22.1 verify gate applied (grep -c counts match BEFORE git commit) | process check | shell |
| 18.2 | Documentation in retro.md confirms SG.R25.1 works as designed | inspection | `.omo/round-28/retro.md` |

**Total ACs**: 5 (3 + 2)

## 4. Files

### Issue #57 (atomic commit 1)
- `docs/screenshots/r28-s{1-4}-toast-*.png` (4 new files)
- `README.md` (replace text-only "Toast notifications" + "Auto-save indicator" sections)
- `README.zh-CN.md` (parallel)
- 6 file touches, 10-20 LOC

### Issue #58 (no commit, just process)
- 0 files (just verification)
- 0-5 LOC (just documentation in retro.md)

## 5. Strategy & approach

### #57 — Toast screenshots pattern (extends R24 #50)

**Pattern A (preferred): playwright-cli for real browser screenshots**
- Start mock-server on port 8890 (per skill file)
- Navigate to dashboard
- Trigger each toast type: add finding, copy permalink, copy as MD, submit review
- Capture screenshot at each toast state
- Save to `docs/screenshots/r28-s{1-4}-toast-*.png`
- Update README + README.zh-CN.md to reference screenshots with captions

**Pattern B: Update README sections (en + zh-CN)**
- Replace "Toast notifications for your actions" text with image + caption
- Replace "Auto-save indicator" text with image + caption
- Use R24 r24-s1 through r24-s5 screenshots (already exist, just reference them)

### #58 — SG.R25.1 first-time apply pattern

**Process (mandatory, per SG.R25.1 in v5.3.9)**:
1. After all Phase 3.5 doc edits, BEFORE `git commit`:
   ```bash
   # Run grep -c on each new section added
   NEW_SECTION_1="Toast notifications for your actions"
   echo "README.md: $(grep -c "$NEW_SECTION_1" README.md)"
   echo "README.zh-CN.md: $(grep -c "操作触发的轻量 Toast 通知" README.zh-CN.md)"
   # Counts MUST match (1=1). If not, fix immediately BEFORE commit.
   ```
2. Block git commit until bilingual lockstep verified.
3. Document the verification in retro.md (PASS/FAIL per section).

## 6. STRINGS_USAGE_PLAN

**No new STRINGS keys** for R28 (toast screenshots are just images, no new UI text). 0 i18n changes.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #57 — playwright-cli not available | Use placeholder PNG (acceptable per skill file) |
| #57 — toast auto-dismiss before screenshot | Use `--devtools` flag OR use `prefers-reduced-motion` to disable animations |
| #58 — SG.R25.1 false positive (counts don't match) | Document in retro.md, treat as in-round fix per SG.R19.8 |
| #58 — SG.R25.1 NOT applied (subagent forgets) | Lead-direct enforcement in Phase 2 subagent prompt |
| both — out of worktree dir | SG.R19.4 sanity check + SG.R24.1 per-Edit verify |
| both — missing node_modules in worktree | SG.R22.2 symlink from main |
| both — subagent writes to main dir | SG.R24.1 per-Edit `pwd` verification (R25+R26+R27 SUCCESS) |
| both — malformed commit message | Use heredoc `git commit -F- <<EOF` |
| **NEW — bilingual lockstep silent failure** | **SG.R25.1 pre-commit grep -c verify BEFORE commit (R28 FIRST-TIME APPLY)** |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 5 ACs total: 3 PASS for #57 + 2 PASS for #58 = 5/5
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS
- No new STRINGS keys (no i18n changes)
- i18n regression-guard test NOT touched
- Full suite: 602 pass / 0 fail (no source code changes)
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 1 SHA verified + 3 fast gates
- **SG.R25.1 FIRST-TIME APPLY** — pre-commit grep -c verify BEFORE commit (R28 specific)
- GH issues #57 + #58 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R29+)

- Typecheck periodic verification (R22 carryover, R27 #55 fix unblocks)
- Housekeeping: clean up pre-existing orphans `.omo/round-21/`, `.omo/round-22/`, `.omo/round-23/brief.md` (Oracle flagged in R27)
- Any new feature from user feedback (R+ carryover)

## 10. References

- brief.md: `.omo/round-28/brief.md`
- v5.3.9 SKILL.md: SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1 + SG.R25.1 all embedded
- R24 #50 toast screenshots: `docs/screenshots/r24-s1-toast-added-review.png` through `r24-s5-autosave-indicator.png` (already present)
- R14 #24 toast system: `src/ui/toast.ts` (existing)
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol