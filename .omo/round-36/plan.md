# Phase 1 Architect Plan — Round 36

**Date**: 2026-07-01 (lead-direct, first round using v5.3.12 patterns)

## Goal

Ship 3 R36 items: 1-line test fail fix (AC1 lead-direct) + 2 parallel subagents (AC2 + AC3 each 1 AC, ≤15min wall). First round to fully exercise v5.3.12 loop-level optimization patches.

## Acceptance criteria

### AC1 — i18n data-i18n key mismatch fix (lead-direct)

**Spec**: `src/ui/i18n.ts:139` has `skipLink: { en: "Skip to main content", "zh-CN": "跳到主要内容" },` (no quotes around `skipLink`). The test at `src/ui/i18n.test.ts:220-228` (AC1.2) iterates through all `data-i18n="..."` attrs in `src/ui/review.html` and checks each has a corresponding `"${key}":` (with quotes) in the STRINGS table. The test fails because `skipLink:` (no quotes) doesn't match the regex.

**Then**: Add quotes around `skipLink` in `src/ui/i18n.ts` (1-char fix). Test passes.

**Test plan**:
- `bun test src/ui/i18n.test.ts` → 38/38 pass (was 37/38 before)
- `bun test` → 607/607 pass (was 606/607)

### AC2 — Previously discussed tab redesign (1 subagent, 1 AC, ≤15min wall)

**Spec**: Issue #69 — `src/ui/review.html` previously-discussed tab layout is "完全是不能接受的" (user feedback). Should align with commits/conversation tab visual style.

**Then**: Previously discussed tab visual matches commits/conversation style. User can identify round context within 1 second.

**Test plan**:
- `bun run build` (verify no CSS regression)
- `bun test` (verify no JS regression; new test optional)
- Manual: previously-discussed tab visual matches commits/conversation

### AC3 — Worktree branch copy button (1 subagent, 1 AC, ≤15min wall)

**Spec**: Issue #72 — Add "copy current branch name" button next to worktree display in header. New feature (not bugfix).

**Then**: Button in header. Clicking copies `state.data.auto_worktree_branch` or `current_branch` to clipboard. Uses `navigator.clipboard.writeText` (existing pattern from `src/ui/app.ts:372`).

**Test plan**:
- `bun test` (new test for clipboard interaction; or manual)
- Manual: button in header, click copies branch name to clipboard

## File changes

| File | Changes | AC |
|---|---|---|
| `src/ui/i18n.ts:139` | Add quotes: `skipLink:` → `"skipLink":` (1 char) | AC1 |
| `src/ui/review.html` (previously discussed tab CSS) | New layout: align with commits/conversation (~150 LOC) | AC2 |
| `src/ui/app.ts` (around line 1700) | New copy button + handler in header (~50 LOC) | AC3 |

**Total: 3 files, ~201 insertions, 0 deletions**

## Steps

### Step 1: AC1 (lead-direct, <5 min)

```bash
# 1-char fix in src/ui/i18n.ts
# Before:  skipLink: { en: "...", "zh-CN": "..." },
# After:   "skipLink": { en: "...", "zh-CN": "..." },

# Verify: bun test → 607/607 pass
# Commit: AC1 fix
```

### Step 2: AC2 (1 subagent, 1 AC, ≤15min wall)

```bash
# Dispatch subagent with 1 AC scope
# Subagent: 1 subagent, ≤15min, NO merge/push
# Output: atomic commit on worktree branch
```

### Step 3: AC3 (1 subagent, 1 AC, ≤15min wall, parallel with AC2)

```bash
# Dispatch in parallel (Promise.all pattern)
# Subagent: 1 subagent, ≤15min, NO merge/push
# Output: atomic commit on worktree branch
```

### Step 4: Phase 2.5 audit + Phase 2.6 merge

```bash
# Lead: verify 3 commits exist, bun test, verify-plugin-load, husky gate
# Lead: git merge + push (lead's responsibility per v5.3.3)
```

## Test plan (per round end)

- `bun run check` → 0 errors
- `bun run build` → 304 files, ~11MB
- `bun test` → 607/607 (was 606 + 1 AC1 fix)
- `node scripts/verify-plugin-load.mjs` 4/4 → PASS
- Cross-runtime probe Node↔Bun → PASS
- Husky gate (R35 hook working) → real commit succeeds without --no-verify

## Risk register

| Risk | Mitigation |
|---|---|
| AC2 subagent timed out at 15min (NEW v5.3.12 cap vs old 30min) | Per v5.3.12 Patch 1: lead-direct rescue in 5min (R34 retro evidence) |
| AC3 subagent timed out at 15min | Same as AC2 |
| Test fail from R21-R31 retro beyond AC1 | AC1 fix unblocks; if more, queue for R37 |
| Husky gate fails (1 pre-existing test fail from R21-R31) | AC1 fixes the 1 known fail; R36 will use real husky gate |

## Hand-off items (Phase 2 subagents per v5.3.12)

1. **READ ONLY ONCE** (per SG.R9): read plan.md + brief.md once
2. **Worktree pattern** (per SG.R24.1): verify pwd before each Write/Edit
3. **NO merge / NO push** (lead's responsibility)
4. **1 AC per subagent** (per v5.3.12 Patch 1 — never 2+ ACs)
5. **15min wall cap** (per v5.3.12 Patch 1; soft cap with lead rescue)
6. **Build + test after each commit**
7. **2 subagents in parallel** (not sequential): use `Promise.all` pattern

## Phase 1 verdict

✓ Plan is decision-complete. 3 items, v5.3.12 patterns applied. Phase 2 ready.
