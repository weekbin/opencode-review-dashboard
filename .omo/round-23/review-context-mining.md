# R23 Review — Context Mining

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Lens**: L5 — Context mining (decisions, alternatives, deferred items)
> **Round**: 23 · **Merge SHA**: `b4905b6`

## Decision rationale trace

### Decision 1: Polish first (#48), then feature (#47)
- **Why**: #48 is smaller atomic polish, builds directly on R22 Clear button surface (stable). #47 is bigger feature with new rendering layer (higher risk).
- **Source**: planner.md § Order rationale
- **Alternative considered**: Feature first, polish second. Rejected because: (a) stable test baseline before bigger change; (b) cleaner test signal in pre-commit audit.

### Decision 2: Reuse existing IntersectionObserver pattern from scrollSpy
- **Why**: scrollSpy already uses IntersectionObserver at app.ts:3101. Reusing the pattern (different target) avoids inventing new infrastructure.
- **Source**: plan.md §5 Pattern C
- **Alternative considered**: ResizeObserver or scroll event listener. Rejected: IntersectionObserver is more efficient (browser-native optimization).

### Decision 3: Two IntersectionObservers (scrollSpy + DiffVirtualizer)
- **Why**: scrollSpy targets `[data-file-card]` (sidebar progress), DiffVirtualizer targets `[data-hunk]` (diff content). Different targets = no conflict.
- **Source**: plan.md §7 Risks & mitigations
- **Alternative considered**: Single observer with both targets. Rejected: harder to reason about, harder to teardown independently.

### Decision 4: Placeholder preserves offsetHeight
- **Why**: Scroll position must be preserved when off-screen hunks collapse to placeholder. If placeholder height differs, scroll jumps.
- **Source**: plan.md §5 Pattern B
- **Alternative considered**: Track scroll position and re-apply on collapse. Rejected: more complex, jittery UX.

### Decision 5: Mutually exclusive Clear / Delete buttons
- **Why**: When ≥1 selected, show "Delete selected" (hides Clear). When 0 selected, show Clear (R22 behavior). Two buttons never visible simultaneously = clear UX.
- **Source**: plan.md §5 Pattern C
- **Alternative considered**: Both buttons always visible (Clear + Delete selected). Rejected: visual clutter, user confusion.

### Decision 6: SG.R22.2 worktree env check at Phase -0
- **Why**: R22 subagent #46 hit "Cannot find module @opencode-ai/plugin" because worktree doesn't auto-inherit node_modules. Apply SG.R22.2 at Phase -0 to prevent recurrence.
- **Source**: R22 retro § Skill gaps + SG.R22.2 patch
- **Applied**: ✓ removed 4 stale worktrees + symlinked node_modules from main to R23 worktree.

### Decision 7: SG.R22.1 bilingual lockstep verify at Phase 3.5
- **Why**: R21 + R22 had silent Edit tool failures on zh-CN visual sections. Apply SG.R22.1 at Phase 3.5 to prevent recurrence.
- **Source**: R22 retro § Skill gaps + SG.R22.1 patch
- **To apply**: this round's Phase 3.5 (next step).

### Decision 8: git stash + drop for stale uncommitted changes in main
- **Why**: Dev subagent #48 wrote files to main dir (accidentally), then committed from worktree. Main had uncommitted R23 changes blocking merge.
- **Source**: Phase 2.6 runtime fix
- **Mitigation**: `git stash push -u` + merge + `git stash drop` (content already in worktree commits, no data loss).

### Decision 9: Amend #47 commit message (lead-direct override)
- **Why**: Subagent's `-m` flag usage created duplicated "Body:" line. Subagent flagged it as bug, said "DO NOT amend". Lead-direct override — message bug fix is not a content change.
- **Source**: Phase 2 subagent report + lead-direct override
- **Result**: SHA changed from `7096c18` → `9004134`, message now clean.

## Deferred items (R24+ backlog)

1. **Toast screenshots** (R19/R20 retro)
2. **Skill file edits for SG.R22.1 + SG.R22.2** (already applied at Phase -0 / Phase 3.5; full skill/ edits deferred)
3. **Diff virtualization toggle in settings** (R22 added settings modal; users may want to disable virtualization for small files)
4. **Per-hunk diff expand/collapse** (related to virtualization, but separate UI affordance)
5. **Bulk delete in sidebar review progress** (parallel feature for sidebar)

## Stale backlog status

- **Before R23**: 0 stale (R22 closed all pm-manager-approved)
- **After R23**: 0 stale (R23 candidates all fresh from R22/R20 retros)

## Open issues after R23

- 0 (both #47 and #48 auto-closed by commit message references)

## Verdict

**PASS** — all decisions documented with rationale. Deferred items scoped out. Stale backlog remains clean.