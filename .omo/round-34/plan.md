# Phase 1 Architect Plan — Round 34

**Date**: 2026-07-01 (lead-direct)

## Goal

Ship 5 R34 items in dependency order:
1. **AC1**: SKILL.md skill-availability fallback patch (5 min, lead-direct)
2. **AC5**: 12 stale worktrees cleanup (1 h, post-merge plumbing)
3. **AC4**: TypeScript fix in src/runtime-compat.ts:283 (30 min, subagent)
4. **AC3**: Conversation panel 4 UX fixes (1-2 h, subagent)
5. **AC2**: Settings panel 3 bugs + i18n (1-2 h, subagent — largest)

## Acceptance criteria

### AC1 — SKILL.md amend (skill patch)

**Spec**: SG.R28.1 lacks fallback when named skill (`visual-engineering`) is unavailable. Add fallback chain.

**Then**:
- SG.R28.1 rule mentions fallback: substitute with `frontend` skill OR inline 5-item design checklist in test-report.md (R33 fallback pattern)
- Optional: pre-commit hook reinstall via `npx husky install --force` (one-liner bonus)

**Test plan**:
- Manual: grep `frontend` in SKILL.md — should appear in SG.R28.1 rule body
- Manual: try invoking nonexistent skill in real env → falls back to inline

### AC5 — Stale worktree cleanup (plumbing)

**Spec**: `git worktree remove --force` × 13 (12 stale + R33 done).

**Then**: `git worktree list` shows only `~/.worktrees/main` (1 entry).

**Test plan**:
- `git worktree list | wc -l` = 1 (only main)
- No branch commit history lost (orphans on dead branches, but branches themselves survive)

### AC4 — TypeScript fix (bugfix)

**Spec**: `src/runtime-compat.ts:283:10` "Property 'unref' does not exist on type 'never'" — fix by narrowing `proc` type.

**Then**: `bun run check` (tsc --noEmit) returns 0 errors. Husky pre-commit gate works without --no-verify.

**Test plan**:
- `bun run check` → 0 errors
- `git commit` (test) → husky pre-commit script exits 0

### AC3 — Conversation panel UX (#67)

**Spec**: 4 sub-issues:
- layout 太松散 (compact layout)
- comment button className 不统一 (use `.btn .btn-primary` style)
- 顶部 R26 #54 bulk-delete checkbox 没 select-all + 没 label
- finding 关键信息显示不够 (file-level / line-level distinction badge + severity icon + round label + line range highlight)

**Then**: Conversation tab layout matches "commits" or "previously" tab style. User can identify finding type in 1 second.

**Test plan**:
- `bun run build && bun test` → 607+/607+ PASS
- Manual: conversation tab visually compared to commits tab → consistent style

### AC2 — Settings panel (#65)

**Spec**: 3 bugs + i18n:
- 错位 (layout alignment)
- 一进入页面就弹出来 (auto-pop on load)
- 无法关闭 (can't close button / OK / Esc)
- +i18n: post-submit "Review submitted — round N" banner has hardcoded English (src/ui/i18n.ts:101 has en translation but code uses hardcoded English at src/ui/app.ts:5599/5584)

**Then**: Settings modal opens only on ⚙ click, closes via all 3 paths (X / OK / Esc), no content 错位.

**Test plan**:
- `bun run build && bun test` → PASS
- Manual: all 3 close paths work; banner uses i18n translation

## File changes

| File | Changes | AC |
|---|---|---|
| `.opencode/skills/team-dev-loop/SKILL.md` | SG.R28.1 rule amend (~10 lines) | AC1 |
| `git operations` (no file) | 13× `git worktree remove --force` | AC5 |
| `src/runtime-compat.ts` (line 283 area) | 1-line type narrowing (e.g., `(proc as any).unref?.()` or proper type assertion) | AC4 |
| `src/ui/app.ts` | Conversation panel: gap, button classNames, select-all, finding badges (~50 LOC) | AC3 |
| `src/ui/review.html` | CSS for compact layout, badge styles, line range highlight | AC3 |
| `src/ui/app.ts` | Settings modal: layout CSS, auto-pop condition, close logic (~80 LOC) | AC2 |
| `src/ui/review.html` | Settings panel layout fixes (~50 LOC) | AC2 |
| `src/ui/i18n.ts` | Maybe 1-2 more keys for banner fix | AC2 |
| `src/ui/app.ts` | Replace hardcoded English banner with `t()` calls | AC2 |

## Steps (per atomic commit)

### Step 1: AC1 SKILL.md (lead-direct, 5 min)
```bash
cd /home/weekbin/.opencode/plugins/opencode-review-dashboard
# Edit .opencode/skills/team-dev-loop/SKILL.md
git add .opencode/skills/team-dev-loop/SKILL.md
git commit -m "fix(loop): R34 AC1 — amend SG.R28.1 with skill-availability fallback (R33 retro)"
```

### Step 2: Worktree (create R34)
```bash
git worktree add -b team-dev-loop-round-34 \
  "$HOME/.worktrees/team-dev-loop-round-34" \
  origin/main
ln -s "$REPO/node_modules" "$WORKTREE/node_modules"
```

### Step 3: AC4 TS fix (worktree)
```bash
cd "$WORKTREE"
# Edit src/runtime-compat.ts to narrow proc type
bun run check  # 0 errors required
git add src/runtime-compat.ts
git commit -m "fix(plugin): R34 AC4 — narrow spawn() type in runtime-compat.ts (TS283 fix)"
```

### Step 4: AC3 conversation (worktree)
```bash
cd "$WORKTREE"
# Edit src/ui/app.ts + src/ui/review.html for 4 conversation UX fixes
bun run build && bun test
git add src/ui/app.ts src/ui/review.html
git commit -m "fix(plugin): R34 AC3 — conversation panel 4 UX improvements (close #67)"
```

### Step 5: AC2 settings (worktree)
```bash
cd "$WORKTREE"
# Edit src/ui/app.ts + src/ui/review.html + src/ui/i18n.ts for settings 3 bugs + i18n
bun run build && bun test
git add src/ui/app.ts src/ui/review.html src/ui/i18n.ts
git commit -m "fix(plugin): R34 AC2 — settings panel 3 bugs + i18n post-submit banner (close #65)"
```

### Step 6: Phase 2.6 merge + AC5 cleanup (lead)
```bash
# Merge worktree branch to main (no-ff)
git merge --no-ff team-dev-loop-round-34 -m "Round 34: 4 quick wins for #65 #67 + TS fix + SKILL.md patch (close #65) (close #67)"
cd main; bun run build; git push origin main

# AC5 plumbing: remove 12 stale worktrees (POST-PUSH)
for wt in $(git worktree list | grep -v "$(pwd)" | awk '{print $1}'); do
  git worktree remove --force "$wt" 2>&1
done
git worktree list
```

## Test plan

- `bun run check && bun run build && bun test` after each commit → all PASS
- `node scripts/verify-plugin-load.mjs` after merge → 4/4 PASS
- Husky gate (without --no-verify) works after AC4 TS fix
- `git worktree list` = 1 (only main) after AC5 cleanup

## Risk register

| Risk | Mitigation |
|---|---|
| AC2 settings modal close logic breaks other modals | Mirror R8 retro SG.5 — minimal changes, manual test all 3 close paths |
| AC3 conversation changes conflict with previously-discussed/redesign | Only modify what #67 specifies; don't refactor surrounding |
| AC4 TS fix changes runtime behavior | Use type narrowing only (no runtime change); verify-plugin-load validates |
| AC5 worktree removal races with sub-tasks | Defer cleanup to POST-MERGE step (Step 6) |
| Husky pre-commit fails again | Use --no-verify with documented rationale (R33 pattern) if needed |

## Hand-off items (Phase 2 Dev subagent)

1. **READ ONLY ONCE** (per SG.R9): read plan.md + brief.md once
2. **Worktree pattern** (per SG.R24.1): verify pwd before each Write, use absolute paths
3. **NO merge / NO push** (lead's responsibility)
4. **NO husky install** — lead will handle post-merge
5. **NO worktree cleanup** — AC5 is lead-only post-merge
6. **3 atomic commits in worktree**: AC4 (TS), AC3 (conversation), AC2 (settings)
7. **NO modify existing utility functions** (per SG.R14)
8. **Build + test after each commit**

## Phase 1 verdict

✓ Plan is decision-complete. 5 items in dependency order, ≤5 bugfix + 1 skill patch + 1 plumbing. Phase 2 Dev subagent + lead-direct AC1 + AC5 plumbing can proceed.
