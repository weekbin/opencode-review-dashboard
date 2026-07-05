# R120 Retro — Sparkline tooltips (R118.3)

## What Shipped

Issue: R118 retro listed R118.3 "No tooltips on data points" as risk-surfaced-no-action. R119 retro mentioned it as still-deferred. R120 closes it.

User-facing delivery:
- **Sparkline tooltips**: every polyline data point in both stats sparklines (round intervals + first-pass) gets a `<title>` child element. Browser-native hover tooltip shows "Gap 1→2: 3600000" / "Resolution 5: 1800000" etc.
- **Histogram bar tooltips**: each of the 4 histogram `<rect>` elements (R119's buckets) gets a `<title>` child. Hover shows "< 1 hour: 4" / "1–24 hours: 2" etc.
- **Pure additive**: no schema break, no new i18n keys (tooltip text is computed at render time)
- **Accessibility win**: visual tooltips work for sighted users; existing `aria-label` on sparkline SVG + screen reader `<title>` SVG element semantic gives assistive tech text too

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| renderSparkline extended with dataPoints opts | ✓ app.ts:3543 |
| sparkline `<title>` per polyline data point | ✓ via `polyline.appendChild(title)` |
| histogram `<rect>` `<title>` per bucket | ✓ app.ts:3688 (4 titles total) |
| Round-intervals sparkline uses dataPoints | ✓ `gaps.map(...)` |
| First-pass sparkline uses dataPoints | ✓ `firstPass.values.map(...)` |
| SVG `<title>` (not HTML title attribute) | ✓ createElementNS with svg namespace |
| Empty sparkline safe (<2 values) | ✓ no change to existing < 2 branch |
| 10 tests pass | ✓ |
| 0 regressions to R118/R119 | ✓ |

12/12 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for single-feature rounds.
- Implementation: ~25 LOC in app.ts (renderSparkline opts extension + 2 call-site updates + 1 histogram block change) + 10 tests (~140 LOC).
- 1 mid-implementation stumble: regex `/title.*textContent/` didn't match because `.` doesn't span newlines in JS regex. Fixed by using `/title[\s\S]*textContent\s*=/`. Lesson: when matching patterns across multi-line source, use `[\s\S]*` not `.*`.
- 1 unnecessary comment caught by hook (line 4 of test file) — removed per hook priority 4.
- 2 windows retuned in tests (AC7 anchor moved from aggregateFirstPassBuckets → const bucketDefs for shorter path; AC3/AC4 regex upgraded to `[\s\S]*`).

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R120 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R118.3 sparkline tooltips (R118-retro risk-surfaced, deferred twice): SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY.

## Self-Improvement Observations

- **`.*` regex trap in JS**: dot doesn't match newlines by default. When source spans multiple lines, use `[\s\S]*`. Simple lesson, easy to forget. **Could become R120.1: helper `crossLine(source)` returning `[\s\S]*` for repeated regex use.**
- **Window anchor should be near the function's actual target, not always its start**: AC7 anchored on `aggregateFirstPassBuckets` (function declaration, ~4000 chars before the actual histogram loop). Better anchor: `const bucketDefs` (literal variable in the loop). Pattern: pick the most specific identifier near the code under test.

## Risks Surfaced (no action this round)

- **Per-hunk reconcile (R117)**: still deferred per R117 retro
- **Per-round sparkline resolution rate (R118.1)**: still deferred per R118 retro
- **Sparkline tooltips (R118.3)**: SHIPPED this round ✓
- **Histogram bar baseline is min not zero**: noted in R119 retro, still deferred

## v6 Compliance

- Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 1 (R118.3 sparkline + histogram tooltips)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~15 minutes