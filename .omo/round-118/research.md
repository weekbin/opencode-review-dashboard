# R118 Research — Review Velocity analytics (#81)

## Existing Tab Infrastructure

`src/ui/app.ts`:
- `state.activeTab` (line ~1559): `"files" | "commits" | "conversation" | "previously"` literal union
- `ACTIVE_TAB_KEY` (line ~1557): `"diff-review:active-tab"`
- `readStored<typeof state.activeTab>(...)` for localStorage persistence (function at line 215)
- Tab buttons in `src/ui/review.html` (4 buttons exist today)
- Tab pane switch happens in `renderFindings` / `renderConversationPane` etc.

R118 needs to add `"stats"` as a 5th literal. Existing pattern: extend the literal union, add 5th button, add 5th `renderX()` function.

## State Schema

`src/index.ts:97-130` Finding type:
```typescript
type Finding = {
  id: string;
  round: number;
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
  status: "open" | "closed_auto" | "resolved";
  anchor: Anchor;
  kind: "line" | "file" | "out_of_diff";
  created_at: number;
  updated_at: number;
  closed_at?: number;
  close_reason?: "file_removed" | "anchor_missing" | "content_match";
  manually_reopened?: boolean;
  manually_edited?: boolean;
  edited_at?: number;
  comments?: FindingComment[];
  pinned?: FindingPin;
  manually_pinned?: boolean;
  reactions?: Reaction[];
  resolve_reason?: string;
  resolve_manually_resolved?: boolean;
  resolved_at?: number;
  resolution_kind?: FindingResolutionKind;
  resolution_reason?: string;
  audit_log?: AuditLogRow[];
};
```

All 4 metric categories need:
1. **Per-round**: `round`, `status`, `resolution_kind`, timestamps — have it
2. **Per-category**: `category`, `status` — have it
3. **Round interval**: derived from `created_at` + `round` — have it
4. **First-pass-resolve**: `created_at` + `resolved_at` — have it

No schema changes needed (strict subset — existing fields only).

## SVG Sparkline Pattern

No existing chart code in `src/ui/`. R118 will need a `renderSparkline(values: number[], opts?)` helper from scratch.

Reference pattern from popular inline SVG sparklines:
- Width: ~120px
- Height: ~24px
- Stroke: `currentColor` + `stroke-width: 1.5`
- Filled area optional (gradient or solid fill below curve)
- Polyline points: `x = (i / (n-1)) * width`, `y = height - (v / max) * height`

## Aggregation Functions

```typescript
function aggregateByRound(findings: Finding[]): { round: number; total: number; resolved: number }[] {
  // Group by round → count total + resolved
  const map = new Map<number, { round: number; total: number; resolved: number }>();
  for (const f of findings) {
    const entry = map.get(f.round) ?? { round: f.round, total: 0, resolved: 0 };
    entry.total++;
    if (f.status === "resolved") entry.resolved++;
    map.set(f.round, entry);
  }
  return [...map.values()].sort((a, b) => a.round - b.round);
}

function aggregateByCategory(findings: Finding[]): { category: string; resolved: number; unresolved: number; wontfix: number }[] {
  // Group by category → resolve status breakdown
  // - resolved: status === "resolved"
  // - wontfix: resolution_kind === "wontfix" (subset of resolved)
  // - unresolved: status !== "resolved"
}

function aggregateRoundIntervals(findings: Finding[]): number[] {
  // For each pair (round N, round N+1), compute gap = min(created_at) of round N+1 - max(created_at) of round N
}

function aggregateFirstPassResolveTime(findings: Finding[]): { avgMs: number; values: number[] } {
  // For resolved findings: resolved_at - created_at
  // Histogram + average
}
```

## Localization Pattern

`src/ui/i18n.ts` lookup pattern: `t("key.path", { params })`. Existing keys: `status.*`, `action.*`, `view.*`. Following `view.*` cluster for stats-related keys.

20+ new STRINGS keys × 2 locales estimated.

## Empty State

When `state.findings.length === 0`:
- "No findings yet — submit a round to start tracking review velocity"
- Don't render empty SVG (no data → meaningless chart)
- Show helpful prompt instead

## v6 Compliance

- 6 artifacts: discovery.md / research.md / brief.md / verify.md / retro.md / decision.md ✓
- 8/8 pre-commit checks ✓
- 0 subagents (lead-direct) ✓
- 0 open-loop-internal at retro (must close in current worktree) ✓
- Cap: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8) ✓