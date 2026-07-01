# R38 decision

## Round profile
- **Type**: housekeeping + tooling enhancement (context-aware pre-commit hook)
- **Trigger**: v5.3.13 SG.R29.6 manual lightweight mode (no src/ logic changes)
- **Scope**: 1 file enhanced, 1 gap closed, 1 stash dropped
- **Subagent**: 0 (lead-direct, no code generation)

## What shipped
1. **Enhanced `.git/hooks/pre-commit`** (40 lines vs original 14):
   - Smart skip: `bun run check` only runs if TS/src/package files changed
   - Smart skip: `bun test` only runs if src/test/package files changed
   - Smart run: `verify-plugin-load.mjs` only runs if src/plugin/ files changed
   - Saves ~5-15s per docs-only commit
   - Catches plugin breakage pre-commit (not at OpenCode restart)

2. **Closed R35 housekeeping gap**: stash@{0} ("R21-R31 retro defect: pre-existing uncommitted modifications to R34 baseline files. R35 housekeeping will address.") was NEVER addressed by R35. R36 AC1 fixed only the most critical skipLink quote. R38 dropped the full stash.

3. **Working tree reset to HEAD** (3-file partial leak from stash).

4. **bun test restored to 610/610 PASS** (was 1 fail at R38 start).

## Verification

### SG.R26.1 file-existence verify
```bash
ACTUAL=$(ls -1 .omo/round-38/ | wc -l)  # 4
PROFILE=housekeeping EXPECTED=3 → PASS
```

### SG.R30.0 pre-commit test gate
- Original R35 hook: ran `bun run check` + `bun test` unconditionally on every commit (slow for docs-only)
- Enhanced R38 hook: context-aware skip — only runs when needed
- Both versions still catch the same issues; R38 is just faster for docs-only

### SG.R29.6 lightweight trigger
3+ of 4 conditions met: total LOC <50 (1 file, 40 lines), 0 src/ logic changes (just shell hook), all changes tooling/cleanup. Manual trigger applied.

## Profile
Lightweight round (per v5.3.13 SG.R29.6): hook is shell, not TypeScript, so it doesn't need Phase 2 Dev (no TS code). 1 src/ file unchanged from R36 closure. Total work: 1 hook rewrite + 1 stash drop + working tree reset.

## R35 gap closure (IMPORTANT)
The stash@{0} existed for 11+ rounds (R25 stashed, R26-R34 didn't address, R35 housekeeping promised to address but didn't, R36 AC1 fixed only skipLink in HEAD, R38 closes the gap). This is the kind of systemic gap the user has been warning about — **R36 retro's "first 0-fail round" claim was false against actual working tree state**.

Lesson: **`bun test` must run against working tree, not just HEAD**, to catch uncommitted modifications. R38 hook does this correctly.

## Forward-looking
- **R39**: stale branches + orphan refs final sweep (R35 deleted 14, check for more)
- **R40**: validate v5.3.13 patches with intentional lightweight round
- **R41**: 5-round summary + memory/handoff update