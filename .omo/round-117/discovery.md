# R117 Discovery — Reconcile mode overlay (#74)

## Issue Scope

**#74**: 跨轮次「修复验证」对账视图 (Reconcile mode overlay)

Multi-round review has a trust gap: user requests fixes in round N, agent applies
them in round N+1, user must manually cross-reference to verify which findings
the agent actually addressed. The "Previously discussed" tab shows all historical
findings but doesn't visualize the per-hunk cross-round correspondence.

Per the issue body:
- Root: README §"Multi-round review" promises carry-forward + auto-stale marking,
  but there's no visual aid to verify "did the agent fix what I asked?"
- Fix: A "Reconcile" toggle in the diff toolbar that overlays colored badges on
  each hunk showing finding status (3 categories).
- Impact: 3+ round reviews become reliable; users can spot agents that
  ignore edge-case findings.

## User-Defined Badge Categories

- **🟢 Green (resolved)**: Finding was resolved (closed by user via resolve-flow,
  NOT auto-staled). Indicates "agent did what I asked".
- **🟡 Yellow (still open)**: Finding still open + hunk was touched by agent
  in current round but finding not resolved. Indicates "agent ignored".
- **🔴 Red (new bug)**: Finding is new in current round + anchored to a
  newly-added line. Indicates "agent introduced a problem".

## R117 Scope Decision (sub-feature split)

Issue body estimates 250-400 LOC. R117 ships a focused subset that the rest of
R117.x will extend:

**R117 (this round)**:
1. Toolbar toggle: `state.reconcileMode: boolean` + button in diff toolbar
2. **Per-FILE reconcile overlay** (not per-hunk, simpler first pass):
   - For each file card in diff, render count badges showing how many findings
     in each category exist in that file
   - Hover/tap to expand → list of finding IDs in each category
3. 🟢 Green (resolved) badge type only — most actionable for trust
4. Click badge → jump to finding card

**R117.1 (future)**:
- Yellow (still open) badge type
- Click-through list

**R117.2 (future)**:
- Red (new bug) badge type
- Per-hunk (not per-file) granularity

**R117.3 (future)**:
- Auto-toggle when round N+1 loads if previous round had unresolved findings

## Files To Touch

- `src/ui/i18n.ts`: ~6 new STRINGS keys × 2 locales (toolbar.reconcile, fileBadge.resolved, fileBadge.stillOpen, fileBadge.newBug, badge.tooltip.resolved, etc.)
- `src/ui/app.ts`: ~80 LOC (toggle button click handler, state.reconcileMode, renderFileCardBadge injection, click-to-jump)
- New file: `src/r117-reconcile-overlay.test.ts` (~10 tests)

## Acceptance Criteria

- AC1: Toolbar has a "Reconcile" toggle button — PASS
- AC2: Clicking the toggle flips state.reconcileMode — PASS
- AC3: When reconcile mode ON, each file card shows green badge with count of resolved findings in that file — PASS
- AC4: Badge shows finding IDs on hover (or stat only in R117) — PASS (count only)
- AC5: Click badge → scrolls to first matching finding card + flashes focus — PASS
- AC6: Toggle persists across reload (localStorage) — PASS (mirrors existing pattern)
- AC7: Mode off → file cards render normally, no badges — PASS
- AC8: i18n keys exist in both en + zh-CN — PASS

## Round Profile

- Feature: 1 (#74 reconcile overlay, focused subset)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct)
- Estimated LOC: ~150 (R117)