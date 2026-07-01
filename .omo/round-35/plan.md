# Phase 1 Architect Plan — Round 35

**Date**: 2026-07-01 (lead-direct)

## Goal

Clean up R21-R31 retro defect + wire husky + fix pre-existing TS error + delete stale branches. 5 housekeeping items, all lead-direct (no subagent needed per plan — housekeeping is mechanical, lead-direct is faster and more accurate).

## Acceptance criteria

### AC5 — src/index.ts:2470 TS error fix

**Spec**: `Expected 0 arguments, but got 1` at line 2470. Need to find the call site and fix the argument mismatch.

**Then**: `bun run check` returns 0 errors for R35-touched files. Husky gate unblocked.

**Test plan**:
- `bun run check` → 0 errors for src/index.ts
- `git commit` (with husky pre-commit) → passes

### AC1 — Wire husky hook via `bun install`

**Spec**: R30 #61 added `.husky/pre-commit` + `package.json` `prepare: "bun run build && husky"` script. But the `prepare` script runs on `bun install`, which never re-ran after R30. Need to run `bun install` to actually wire `.git/hooks/pre-commit`.

**Then**: `ls .git/hooks/pre-commit` exists. Pre-commit script runs on `git commit`.

**Test plan**:
- `bun install --frozen-lockfile` succeeds
- `ls .git/hooks/pre-commit` shows file exists
- `cat .git/hooks/pre-commit | head -5` shows husky pre-commit wrapper

### AC4 — Verify husky gate works

**Spec**: After AC1 + AC5, `git commit` should run husky pre-commit script which runs `bun run check` + `bun test`. Should pass cleanly.

**Then**: A test commit (or a real commit) passes husky gate WITHOUT `--no-verify`.

**Test plan**:
- `git commit --allow-empty -m "test husky gate"` → pre-commit script runs → 0 errors
- Husky gate exit code 0

### AC3 — Pop R21-R31 stash, commit as "R21-R31 retro defect cleanup"

**Spec**: Stash has 9 files (161+/53-). Need to pop, inspect each change, commit as single retro cleanup commit.

**Then**: `git log --oneline` shows new commit `chore(r21-r31-cleanup): R21-R31 retro defect cleanup (9 files)`. The 10 untracked .omo/round-N/ files are committed in a separate commit (or as part of this commit if naturally related).

**Test plan**:
- `git stash pop` succeeds
- Files match expected (per Phase -0 stash content)
- `bun run check && bun test` pass (no new errors from R21-R31 changes)
- Commit created with detailed message

### AC2 — Delete 8 stale branches

**Spec**: 8 stale branches from R12-R17 + R33 + R34 in `refs/heads/team-dev-loop-round-*`. All commits already merged into main. Safe to delete.

**Then**: `git branch --list "team-dev-loop-round-*"` returns empty.

**Test plan**:
- `git branch -D team-dev-loop-round-12-pinned-reactions-nav` (and 7 more)
- `git branch --list "team-dev-loop-round-*"` returns empty
- `git log --oneline` still shows the R12-R17 commits (preserved in main's history)

## File changes

| File | Changes | AC |
|---|---|---|
| `src/index.ts` | Fix 1 line at line ~2470 (argument mismatch) | AC5 |
| `package.json` | (no change — prepare script already exists) | AC1 |
| `.husky/pre-commit` | (no change — script already exists) | AC1 |
| `.git/hooks/pre-commit` | (created by `bun install` via husky's prepare script) | AC1 |
| 10 src/* files | Pop from R21-R31 stash, commit as retro cleanup | AC3 |
| `refs/heads/team-dev-loop-round-*` (8 branches) | Delete via `git branch -D` | AC2 |

## Steps (per atomic commit)

### Step 1: AC5 — fix src/index.ts:2470 TS error
```bash
# 1. Read line 2470 to find the call site
# 2. Fix argument mismatch (likely remove extra arg or add to function signature)
# 3. Verify: bun run check → 0 errors
git add src/index.ts
git commit -m "fix(plugin): R35 AC5 — fix TS error at src/index.ts:2470 (husky gate unblock)"
```

### Step 2: AC1 — wire husky hook
```bash
bun install --frozen-lockfile
ls .git/hooks/pre-commit
git add package.json bun.lock
git commit -m "fix(plugin): R35 AC1 — wire husky pre-commit hook via bun install (R30 #61 retroactive)"
```

### Step 3: AC4 — verify husky gate (test commit)
```bash
# Make a test commit to verify husky gate works
git commit --allow-empty -m "chore(r35-test): verify husky gate works (R35 AC4)"
# If husky gate runs and passes, husky is properly wired
```

### Step 4: AC3 — pop R21-R31 stash, commit retro cleanup
```bash
git stash pop
git status  # check what files changed
git add .omo/proposals.jsonl src/index.ts src/ui/*.ts
git commit -m "chore(r21-r31-cleanup): R21-R31 retro defect cleanup (9 files)

Pre-existing uncommitted modifications from R21-R31 rounds,
preserved via git stash@{0} across R33 + R34, now properly
committed as a single retro cleanup commit per R33 retro
Action items list.

9 files changed, 161 insertions(+), 53 deletions(-)

- .omo/proposals.jsonl: 1 line (R33 round marker)
- src/index.ts: 8 lines (pre-R32 modifications)
- src/ui/conversation-bulk.test.ts: 12 lines
- src/ui/diff-virtualization.test.ts: 141 lines (largest change)
- src/ui/diff-virtualization.ts: 15 lines
- src/ui/i18n.test.ts: 6 lines
- src/ui/i18n.ts: 2 lines
- src/ui/settings.test.ts: 20 lines
- src/ui/sidebar-bulk.test.ts: 9 lines"
```

### Step 5: AC2 — delete 8 stale branches
```bash
for branch in team-dev-loop-round-12-pinned-reactions-nav team-dev-loop-round-13-in-diff-resolve-wontfix team-dev-loop-round-14-sort-filter-autosave team-dev-loop-round-15-cmdp-submit-audit team-dev-loop-round-16-hide-whitespace-copy-md-expand-all team-dev-loop-round-17-notes-ime-help team-dev-loop-round-33 team-dev-loop-round-34; do
  git branch -D "$branch"
done
git branch --list "team-dev-loop-round-*"
# (should return empty)
```

## Test plan

- `bun run check && bun run build && bun test` after each commit → all PASS
- `node scripts/verify-plugin-load.mjs` after AC3 → 4/4 PASS
- Husky gate (`git commit` without `--no-verify`) after AC1+AC5 → works

## Risk register

| Risk | Mitigation |
|---|---|
| R21-R31 stash changes may break tests | `bun test` after pop, before commit; if fails, individual commit per file |
| `bun install` may upgrade dependencies | Use `--frozen-lockfile` flag |
| Husky pre-commit may fail on AC3 commit | If pre-commit runs `bun run check` and that fails, the commit is blocked — but AC5 should fix the underlying TS error |
| Branch deletion may fail if branch has unmerged changes | All branches have been merged to main, so `git branch -D` should work; if not, use `git branch -d` (safe delete) first |

## Hand-off items (Phase 2 lead-direct)

1. **READ ONLY ONCE** (per SG.R9): read this plan.md + brief.md once
2. **NO subagent needed** (lead-direct all phases — housekeeping is mechanical)
3. **NO merge / NO push** (will do as part of Phase 2.6)
4. **NO worktree needed** (lead-direct in main worktree — housekeeping is single-shot)
5. **Husky gate expected to work** (AC1+AC5 fix it)

## Phase 1 verdict

✓ Plan is decision-complete. 5 items, all housekeeping, lead-direct. Phase 2 can proceed.
