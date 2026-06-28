# Round 2 Plan — `--worktree` auto-pickaround fix

> **Profile**: bugfix (auto-classified from 7 quantitative signals; total ≈ 1)
> **1-paragraph plan** (per bugfix profile, see `references/loop-decision.md` § Round profile auto-classification)

## Plan (1 paragraph)

Fix the bug at `src/index.ts:1233` by changing the worktree filter from `wt.path !== root` (filters out current dir) to `wt.path !== wtRoot` (filters out the explicitly-resolved worktree, which is `worktree ?? root`). This prevents the auto-pickaround from silently overriding the user's `--worktree` flag when the explicit target is empty. Add 1 unit test (mock worktrees list with empty target + populated other), 1 e2e scenario (`/diff-review-dashboard --worktree <empty-wt>` returns 0 files + `autoWorktree` undefined), and 1-paragraph README note in the "How worktree resolution works" section. No new files; extend existing `src/index.ts` (inline test or new `src/worktree.test.ts`) and `scripts/test-review-ui/e2e.mjs`. Worktree per project memory 372. Branch: `team-dev-loop-round-2-worktree-auto-pickaround`.

## Acceptance Criteria (mapped from brief)

| AC | Test |
|---|---|
| AC1: `--worktree` flag wins when target is empty | Unit test + e2e scenario |
| AC2: `--worktree` + target has files (unchanged) | Existing e2e scenario 3 covers this |
| AC3: No `--worktree` + main checkout → auto-pickaround still works | Existing e2e scenarios cover |
| AC4: No `--worktree` + inside worktree → current dir wins (no auto-pickaround) | Existing e2e scenario covers |
| AC5: Auto-detection unchanged | Existing e2e |
| AC6: Error preserved when explicit path doesn't exist | Unit test |

## Worker hand-off checklist

- [ ] Create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-2`
- [ ] Branch: `team-dev-loop-round-2-worktree-auto-pickaround`
- [ ] Edit `src/index.ts:1233`: `wt.path !== root` → `wt.path !== wtRoot`
- [ ] Add unit test (inline in `src/index.ts` or new file)
- [ ] Add e2e scenario to `scripts/test-review-ui/e2e.mjs`
- [ ] `bun run check` (clean)
- [ ] `bun run build` (success)
- [ ] Unit tests pass (≥ 11/11)
- [ ] E2E tests pass (≥ 14/14)
- [ ] README 1-paragraph note
- [ ] Commit + push

## Risk

LOW — 1-line fix in localized filter. Full e2e suite (14 scenarios) re-runs as safety net. No new files. No architecture changes.