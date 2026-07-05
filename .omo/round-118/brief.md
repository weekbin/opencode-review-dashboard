# R118 Brief — Review Velocity analytics (#81)

## Goal

Ship the "Stats" sub-tab (issue #81) — solo reviewer sees their review pace + category distribution + round intervals + first-pass-resolve time. Inline SVG sparklines, zero external dependencies, data from existing `state.findings[]`.

## Implementation Plan

### 1. i18n (src/ui/i18n.ts)

~18 new STRINGS keys × 2 locales clustered under `view.stats.*`:

- `view.stats.tab`: "Stats" / "统计"
- `view.stats.heading`: "Review velocity" / "审查速度"
- `view.stats.empty`: "No findings yet — submit a round to start tracking review velocity." / "..."
- `view.stats.byRound.heading`: "Findings by round" / "按轮次统计"
- `view.stats.byRound.total`: "Total" / "总数"
- `view.stats.byRound.resolved`: "Resolved" / "已解决"
- `view.stats.byRound.resolutionRate`: "Resolution rate" / "解决率"
- `view.stats.byCategory.heading`: "By category" / "按类别"
- `view.stats.byCategory.resolved`: "Resolved" / "已解决"
- `view.stats.byCategory.unresolved`: "Open" / "未解决"
- `view.stats.byCategory.wontfix`: "Wontfix" / "暂不修复"
- `view.stats.intervals.heading`: "Round intervals" / "轮次间隔"
- `view.stats.intervals.avgGap`: "Avg gap" / "平均间隔"
- `view.stats.firstPass.heading`: "First-pass resolve time" / "首次解决耗时"
- `view.stats.firstPass.avgMs`: "Average" / "平均"
- `view.stats.firstPass.histogram`: "Distribution" / "分布"

### 2. Client (src/ui/app.ts)

**State + persistence**:
- Extend `state.activeTab` literal union with `"stats"`
- `STATS_TAB_KEY = "diff-review:stats-tab-default"` for default-on/off (per issue: "默认 collapsed 避免入口干扰")

**Stats data aggregation** (~80 LOC):
```typescript
function aggregateByRound(findings: Finding[]): Map<number, {total:number,resolved:number}>
function aggregateByCategory(findings: Finding[]): Map<string, {resolved:number,unresolved:number,wontfix:number}>
function aggregateRoundIntervals(findings: Finding[]): number[] // gaps between consecutive rounds in ms
function aggregateFirstPass(findings: Finding[]): number[] // resolved_at - created_at for resolved findings
```

**Sparkline render** (~30 LOC):
```typescript
function renderSparkline(values: number[], opts: {width?:number, height?:number, ariaLabel?:string}): SVGSVGElement
```

**`renderStatsPane()`** (~120 LOC):
- Empty state if `state.findings.length === 0`
- 4 sections in a vertical scroll list:
  1. By-round table + sparkline (resolution rate per round)
  2. By-category stacked-bar (5 categories × 3 status)
  3. Round intervals sparkline (each value = gap between rounds in ms)
  4. First-pass resolve time histogram + average
- All numbers formatted with `formatRelativeTime` or similar (existing utility)

**Tab integration** (~10 LOC):
- Extend tab button rendering loop in review.html or via JS injection
- Wire click handler

### 3. review.html (1-line change)

Add 5th tab button:
```html
<button class="tab-button" data-tab="stats" data-i18n="view.stats.tab">Stats</button>
```

### 4. Tests (src/r118-review-velocity.test.ts)

12 structural regex tests covering:
- AC1: 5th tab button exists in review.html
- AC2: `state.activeTab` extends to include `"stats"`
- AC3: `renderStatsPane` function exists
- AC4-AC6: 4 aggregation functions exist with expected outputs
- AC7: localStorage persistence for stats tab
- AC8: i18n keys present (en + zh-CN)
- AC9: sparkline renderer uses inline SVG (`document.createElementNS("http://www.w3.org/2000/svg", ...)`)
- AC10: empty state when `findings.length === 0`

## Round Profile

- Feature: 1 (#81 Review Velocity analytics panel)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct)
- Estimated LOC: ~350 (within issue body 250-400 estimate)

## Risk Mitigations

- **Tab overflow**: existing layout uses flex with wrap — 5 tabs should fit (or move to row 2)
- **SVG complexity**: minimal — straight polylines + text labels
- **Performance**: aggregations are O(F) per render. Reasonable for ~100s of findings.
- **Empty state**: explicit check before aggregations — render helpful prompt instead of empty chart

## v6 Compliance

- Hard caps: 1 feature ≤3 ✓, 0 bugfix ≤5 ✓, 0 polish ≤1 ✓, 1 total ≤8 ✓
- Pre-commit 8/8 PASS required
- 0 subagents (lead-direct per v6 spec)
- 0 open-loop-internal at retro time