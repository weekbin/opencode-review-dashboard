# Phase 1 Architect Plan — Round 33

**Date**: 2026-07-01 (lead-direct)

## Goal

Fix 4 user-reported UX/data-persistence bugs in the opencode-review-dashboard plugin:
1. **AC1 (Issue #66)**: HTTP server `port: 0` random → fix to `port: 8890` with EADDRINUSE fallback
2. **AC2 (Issue #68)**: `state.fresh.push({...})` missing `status: "open"` → fixes submit dialog "0 open findings" stat
3. **AC3 (Issue #70)**: `.post-submit` overlay missing `background` → fixes visual 错位
4. **AC4 (Issue #71)**: Toolbar "Ignore ws" button → i18n + title + aria + active state

## Acceptance criteria

### AC1 — Port stability (#66)

**Given**: User installs plugin, runs `/diff-review-dashboard`, makes changes to settings (theme/layout/etc.), restarts OpenCode.

**When**: Plugin server starts via `Bun.serve({ port: 0, fetch })`.

**Then**:
- Server MUST listen on port `8890` (fixed, OS-assigned if 8890 in use via EADDRINUSE fallback)
- Server URL MUST be `http://127.0.0.1:8890/review/<id>?token=<token>`
- Browser localStorage MUST persist across OpenCode restarts (per-origin stability from fixed port)
- `script/verify-plugin-load.mjs` MUST still pass 4/4 gates

**Test plan**:
- `node scripts/verify-plugin-load.mjs` → 4/4 gates PASS
- Manual: restart OpenCode 3 times with /diff-review-dashboard open → settings persist

### AC2 — Fresh findings status (#68)

**Given**: User in review session adds 3 findings (file-level + line-level) via drawer.

**When**: User clicks "Submit Review" → submit confirm dialog appears.

**Then**:
- Dialog SHOULD show `3` (not `0`) as "open findings will be submitted"
- After fix, `state.fresh` entries MUST have `status: "open"` field
- Filter `(f) => f.status === "open" || f.status === "closed_auto"` MUST match all 3 fresh findings

**Test plan**:
- `bun test src/ui/fresh-findings.test.ts` (new test, optional) OR manual: add 3 findings → submit dialog count = 3
- Static check: `grep -c "status:" src/ui/app.ts` ≥ 2 (currently 0)

### AC3 — Post-submit overlay backdrop (#70)

**Given**: User submits a review round.

**When**: `showPostSubmit()` creates `<div class="post-submit">` overlay.

**Then**:
- Overlay MUST have opaque background covering full viewport (was: missing background, content showed through)
- z-index MUST be high enough (≥2000) to cover header (z-index 10000 in current CSS)
- Underground body content MUST be visibility:hidden (was: opacity:0.3 showed through)
- Card center stays opaque + visible

**Test plan**:
- `grep -E "background:|z-index:|visibility:" src/ui/review.html` in `.post-submit` block → 3 matches
- Manual: submit review → only the card visible, not content below

### AC4 — Ignore-ws discoverability (#71)

**Given**: User opens review dashboard, sees "Ignore ws" button in toolbar.

**When**: User hovers or focuses the button (or switches language to zh-CN).

**Then**:
- Hover SHOULD show native browser tooltip in **current language** (was: hardcoded English title)
- aria-label for screen reader SHOULD exist
- Active visual state SHOULD be obvious (border, background, or color change)
- Button label SHOULD be "Hide whitespace" or i18n equivalent (was: "Ignore ws" dev jargon)

**Test plan**:
- `bun test src/ui/i18n.test.ts` → 3 new keys exist (en + zh-CN)
- Manual: hover → tooltip in zh-CN when language=zh-CN
- Manual: click → active visual state

## File changes

| File | Changes | Reason |
|---|---|---|
| `src/index.ts` | Lines 1765-1766 area: `serve({ port: 8890, fetch: ... })` + EADDRINUSE catch + fall-back to `serve({ port: 0, ... })` with console.warn | AC1 |
| `src/ui/app.ts` | Line 5497 + 5523: `state.fresh.push({...})` add `status: "open"` field to 2 push sites | AC2 |
| `src/ui/review.html` | Line 2083 area: `.post-submit` add `background: rgba(0,0,0,0.5)` + `z-index: 3000`; line 2073-2077 area: `body.submitted > *:not(.post-submit)` add `visibility: hidden` | AC3 |
| `src/ui/i18n.ts` | Add 3 keys: `toolbar.ignoreWs.label`, `toolbar.ignoreWs.description`, `toolbar.ignoreWs.ariaLabel` (en + zh-CN each) | AC4 (i18n) |
| `src/ui/app.ts` (line 1651-1668) | `ignoreWhitespaceToggle`: use i18n keys, add `data-active` attribute, browser-safe `aria-label` | AC4 (active state) |
| `src/ui/review.html` (CSS) | `.ignore-whitespace-btn[data-active="true"]` rule with active background/border | AC4 (visual) |

**Total file changes**: 4 files (`src/index.ts`, `src/ui/app.ts` ×2, `src/ui/review.html` ×2, `src/ui/i18n.ts`)

## Steps (per atomic commit)

### Step 1: AC1 port fix (worktree)
```bash
cd /home/weekbin/.worktrees/team-dev-loop-round-33
# Edit src/index.ts: change port: 0 → port: 8890, add EADDRINUSE catch
git add src/index.ts
git commit -m "fix(plugin): R33 AC1 — fix server port to 8890 with EADDRINUSE fallback (close #66)"
```

### Step 2: AC2 status: "open" fix (worktree)
```bash
# Edit src/ui/app.ts: add `status: "open"` to 2 state.fresh.push sites (line 5497 + 5523)
git add src/ui/app.ts
git commit -m "fix(plugin): R33 AC2 — fresh findings missing status: open, submit dialog shows 0 (close #68)"
```

### Step 3: AC3 post-submit overlay backdrop (worktree)
```bash
# Edit src/ui/review.html: add background + z-index to .post-submit + visibility:hidden to body.submitted rule
git add src/ui/review.html
git commit -m "fix(plugin): R33 AC3 — post-submit overlay backdrop + z-index fix (close #70)"
```

### Step 4: AC4 ignore-ws discoverability (worktree)
```bash
# Edit src/ui/i18n.ts: add 3 keys (label/description/ariaLabel, en + zh-CN)
# Edit src/ui/app.ts: ignoreWhitespaceToggle use i18n keys + data-active attribute + aria-label
# Edit src/ui/review.html: .ignore-whitespace-btn[data-active="true"] CSS
git add src/ui/i18n.ts src/ui/app.ts src/ui/review.html
git commit -m "fix(plugin): R33 AC4 — Ignore ws button discoverability (i18n + title + aria + active) (close #71)"
```

**Total: 4 atomic commits in worktree branch, then Phase 2.6 merge to main as 1 closure commit.**

## Test plan

Per AC plan above. Additional suite:
- `bun run check && bun run build && bun test` all pass after each atomic commit
- `node scripts/verify-plugin-load.mjs` passes 4/4 gates after AC1 commit (port affects URL, may affect load)
- Manual: light Playwright walkthrough (Phase 3c lead-direct)

## Risk register

| Risk | Mitigation |
|---|---|
| Port 8890 already in use on user's machine | EADDRINUSE fallback to `port: 0` with console.warn (no hard fail) |
| Existing user localStorage data on different ports | Document breaking change in CHANGELOG; user re-saves settings (acceptable since data is local) |
| 4 atomic commits in same branch could conflict with retroactive rebase | Each commit touches distinct files; rebase-safe |
| SG.R28.1 frontend skill invocation gate | Phase 2.5 audit invokes `visual-engineering` skill, applies 5-item design checklist before merge |

## Hand-off items (for Phase 2 Dev subagent)

1. **READ ONLY ONCE** (per SG.R9): read this plan.md + brief.md once. Do NOT re-read R21-R31 retros.
2. **Worktree pattern** (per SG.R24.1): work in `/home/weekbin/.worktrees/team-dev-loop-round-33/`. Verify `pwd == worktree-path` BEFORE EACH Write/Edit. Use absolute paths.
3. **NO merge / NO push / NO gh issue close** (lead's responsibility).
4. **4 atomic commits**: one fix per commit. NO bundling.
5. **NO modify existing utility functions** (per SG.R14). Add new helpers if needed.
6. **Build + test after each commit**: `bun run build && bun test`.
7. **Final verify-plugin-load**: `node scripts/verify-plugin-load.mjs` should pass 4/4.

## Phase 1 verdict

✓ Plan is decision-complete. 4 atomic commits, each with verifiable PASS evidence, all under ≤5 bugfix cap. Phase 2 Dev subagent can proceed.
