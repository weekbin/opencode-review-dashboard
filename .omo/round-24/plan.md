# R24 Plan — Per-hunk diff expand/collapse (feature) + Toast screenshots (polish docs)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-24-hunk-expand-and-toast-shots`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-24`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#50 Toast screenshots (polish docs)** — capture 4 toast screenshots + update README references
- **#49 Per-hunk diff expand/collapse (feature)** — extend R23 #47 virtualization with user-controlled collapse

## 2. Non-goals

- NO new dependencies (vanilla IntersectionObserver reused)
- NO schema changes
- NO mock-server changes
- NO existing DiffVirtualizer rewrite (only ADD per-hunk state)
- NO per-finding collapse (only per-hunk)

## 3. AC trace (acceptance criteria, testable)

### Issue #50 — Toast screenshots (8 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 10.1 | 4 toast screenshots saved to docs/screenshots/ (r24-s1-s4) | inspection | `docs/screenshots/` |
| 10.2 | README "Toast notifications" section references screenshots | inspection | `README.md` |
| 10.3 | README "Auto-save indicator" section references screenshot | inspection | `README.md` |
| 10.4 | zh-CN sections parallel (SG.R22.1 verified) | inspection + grep | `README.zh-CN.md` |
| 10.5 | No broken image links | manual | `README.md` |
| 10.6 | i18n parity: 0 new keys (just images) | inspection | `src/ui/i18n.ts` |
| 10.7 | Bilingual lockstep count match (SG.R22.1) | grep | shell |
| 10.8 | Toast types documented (4 types: added/copied permalink/copied MD/submitted) | inspection | README |

### Issue #49 — Per-hunk diff expand/collapse (10 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 9.1 | Each diff hunk header has collapse button (▼) | unit + DOM | `src/ui/diff-virtualization.ts` |
| 9.2 | Click collapse → hunk renders placeholder (range + finding count) | unit | `src/ui/diff-virtualization.test.ts` |
| 9.3 | Click expand → hunk renders full content | unit | same |
| 9.4 | Per-hunk state preserved across re-renders | unit | same |
| 9.5 | "Expand all" / "Collapse all" buttons in file header | unit + DOM | `src/ui/app.ts` |
| 9.6 | R23 virtualization NOT broken (regression test) | regression | `src/ui/diff-virtualization.test.ts` |
| 9.7 | localStorage: 0 keys added | inspection | shell |
| 9.8 | i18n: 2 new keys (diff.hunk.collapse + diff.hunk.expand) both locales | unit | `src/ui/i18n.test.ts` |
| 9.9 | R23 DiffVirtualizer interface unchanged (additive) | inspection | `src/ui/diff-virtualization.ts` |
| 9.10 | Expand all state visible in toolbar | unit + DOM | `src/ui/app.ts` |

**Total ACs**: 18 (8 + 10)

## 4. Files

### Issue #50 (atomic commit 1)
- `docs/screenshots/r24-s{1,2,3,4}-toast-*.png` (4 new files)
- `README.md` (reference screenshots in 2 sections)
- `README.zh-CN.md` (parallel, SG.R22.1 verified)
- 6 file changes

### Issue #49 (atomic commit 2)
- `src/ui/diff-virtualization.ts` (add per-hunk collapse state + button rendering)
- `src/ui/app.ts` (wire per-file "Expand all"/"Collapse all")
- `src/ui/i18n.ts` (2 STRINGS keys)
- `src/ui/diff-virtualization.test.ts` (per-hunk collapse tests + regression for R23)
- 4 file touches, ~250 LOC

## 5. Strategy & approach

### #50 — Toast screenshots pattern

**Pattern A (preferred): Capture via mock-server + manual Playwright walkthrough**
- Start mock-server on port 8890 (per skill file)
- Navigate to dashboard
- Trigger each toast type: add finding, copy permalink, copy as MD, submit review
- Capture screenshot at each toast state
- Save to `docs/screenshots/r24-s{1,2,3,4}-toast-*.png`

**Pattern B: README updates**
- Replace text-only descriptions with screenshot + caption
- Bilingual lockstep per SG.R22.1 (grep -c verify before commit)

### #49 — Per-hunk collapse pattern

**Pattern A: Extend DiffVirtualizer with per-hunk state**
```typescript
class DiffVirtualizer {
  private collapsedHunks = new Map<string, Set<string>>(); // filePath -> Set<hunkId>
  
  toggleHunk(filePath: string, hunkId: string): void {
    const set = this.collapsedHunks.get(filePath) ?? new Set();
    if (set.has(hunkId)) set.delete(hunkId);
    else set.add(hunkId);
    this.collapsedHunks.set(filePath, set);
    this.scheduleRender();
  }
  
  isCollapsed(filePath: string, hunkId: string): boolean {
    return this.collapsedHunks.get(filePath)?.has(hunkId) ?? false;
  }
}
```

**Pattern B: Collapse button in hunk header**
- Each hunk gets a `▼` button at top-right
- Click → toggleHunk()
- Collapsed hunk → placeholder showing "Lines X-Y, N lines, M findings"

**Pattern C: "Expand all" / "Collapse all" in file header**
- 2 buttons added to existing file diff header
- "Expand all" → collapsedHunks.get(filePath).clear()
- "Collapse all" → for each hunk in file, add to set

### STRINGS table additions (issue #49)
- `diff.hunk.collapse` (en: "Collapse hunk", zh-CN: "折叠 hunk")
- `diff.hunk.expand` (en: "Expand hunk", zh-CN: "展开 hunk")

## 6. STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3 + SG.R22.1)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `diff.hunk.collapse` | "Collapse hunk" | "折叠 hunk" | Collapse button aria-label |
| `diff.hunk.expand` | "Expand hunk" | "展开 hunk" | Expand button aria-label |

**Total**: 2 keys, both `en` + `zh-CN` required, validated by `src/ui/i18n.test.ts` regression guard.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #49 — break R23 DiffVirtualizer | AC 9.6 regression test on R23 virtualization behavior |
| #49 — per-hunk state across re-renders | Module-level Map; reset only on file unmount |
| #49 — too many collapsed hunks performance | IntersectionObserver still skips off-screen rendering |
| #50 — toast auto-dismiss before screenshot | Mock setTimeout or use `prefers-reduced-motion` flag |
| #50 — bilingual lockstep silent failure | SG.R22.1 grep -c verify before commit (1=1, 1=1) |
| both — out of worktree dir | SG.R19.4 sanity check BEFORE first git op |
| both — missing node_modules in worktree | SG.R22.2 symlink from main BEFORE first test run |
| both — subagent writes to main dir (R23 issue) | Explicit prompt: "WRITE TO WORKTREE DIRECTORY ONLY" |
| both — malformed commit message (R23 issue) | Use `git commit -F- <<EOF` heredoc |

## 8. PASS criteria (Phase 3)

- 18 ACs total: 8 PASS for #50 + 10 PASS for #49 = 18/18
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS
- i18n regression-guard test passes with 2 new keys
- Full suite: 538 + ~10 = ~548 pass / 0 fail (was 538/0 post-R23, +10 from #49)
- SG.R22.1 bilingual lockstep verified (grep -c counts match before commit)
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates
- GH issues #49 + #50 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R25+)

- Diff virtualization toggle in settings
- Bulk delete in sidebar review progress
- tsc PATH investigation
- Per-finding "delete from history"

## 10. References

- brief.md: `.omo/round-24/brief.md`
- R23 virtualization: `src/ui/diff-virtualization.ts`
- R23 plan: `.omo/round-23/plan.md`
- v5.3.7 SKILL.md: `.opencode/skills/team-dev-loop/SKILL.md` (SG.R19.x + SG.R20.1 + SG.R22.x all embedded)
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol