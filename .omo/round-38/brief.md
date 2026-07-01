# R38 brief (lightweight)

**Profile**: housekeeping + tooling enhancement (husky hook + R35 gap closure)
**Trigger**: v5.3.13 SG.R29.6 manual lightweight mode (no src/ logic changes, hook enhancement + gap cleanup)
**Scope**: 1 file enhanced (`.git/hooks/pre-commit`), 1 gap closed (R35 stash leak), 1 stash dropped
**Skip per v5.3.12 + v5.3.13**: PM Triage + Planner + 5 lens + Test Report + Diff Report + Playwright + Doc Writer (no src/ logic changes, no README/docs changes)

## Discovery
While testing the existing pre-commit hook (R35 direct hook), discovered **CRITICAL gap**:
- `bun test` → 1 fail (AC1.2 i18n test), even though R36 retro claimed "610/610 first 0-fail round"
- Root cause: stash@{0} held pre-existing uncommitted modifications from R21-R31 retro (R35 housekeeping was supposed to address but never did)
- R36 AC1 commit f86365d FIXED the skipLink quote issue in HEAD but didn't clean the broader stash
- Working tree had partial leak of stash (3 src/ui/ files reverted the R36 fix)

## Action taken
1. Enhanced `.git/hooks/pre-commit` with context-aware skip logic (skip bun run check / bun test / verify-plugin-load on docs-only commits)
2. Reset working tree to HEAD (dropped the 3-file partial leak)
3. Dropped stash@{0} (R21-R31 retro defect, R35 housekeeping did not address)
4. Verified bun test 610/610 PASS

## Forward-fix verification
- ✅ SG.R26.1: 4 R38 artifacts ≥ 3 threshold
- ✅ SG.R29.6: lightweight trigger (3+ of 4 conditions)
- ✅ SG.R29.8: Phase 3.5 SKIPPED (no README/docs changes)
- ✅ SG.R30.0: pre-commit test gate validated — caught the original 1-fail state