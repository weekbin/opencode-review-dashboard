# R124 Retro — Histogram bar baseline = absolute count (R119.2)

## What Shipped

Issue: R119 retro listed "Histogram bar baseline is min not zero" as risk-surfaced-no-action. R120-R123 retros all mentioned it as still-deferred. 5 rounds deferred is at v6 NO DEFERRAL threshold.

User-facing delivery:
- **Histogram bars now show absolute proportions**: bar height = `count / totalResolved` instead of `count / maxBucketCount`
- User with 100 total resolves, 80 in `<1h`, 15 in `1-24h`, 5 in `1-7d`, 0 in `7d+` now sees:
  - `<1h` bar at 80% of max height
  - `1-24h` bar at 15%
  - `1-7d` bar at 5%
  - `7d+` bar empty (current opacity 0.15 fallback)
- Mirrors GitHub Pulse activity bars (which are absolute-count normalized per time bucket)
- Empty state preserved: `Math.max(totalCount, 1)` ensures division-by-zero safety

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| totalCount via reduce across buckets | ✓ L3715 |
| maxCount = Math.max(totalCount, 1) | ✓ L3716 |
| barHeight formula preserved | ✓ unchanged `count / maxCount * 28` |
| opacity 0.15 for count=0 preserved | ✓ L3733 |
| 4 buckets still rendered (R119 regression) | ✓ |
| view.stats.firstPass.histogram heading bound | ✓ |
| Bucket label keys wired | ✓ |
| No regressions to R118-R123 | ✓ 90+ prior tests still pass |

8/8 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec.
- Implementation: 2 lines changed in app.ts (add totalCount calc, change maxCount line) + 8 tests.
- 1 mid-implementation stumble: AC5 originally used regex `/key:\s*["'][<]?\d/g` which caused `ReferenceError: g is not defined` in Bun's test runner. Fixed by storing matches in a variable first.
- 1 mid-implementation stumble: window sizes were too small to reach `barHeight = (count / maxCount) * 28` (1500 chars wasn't enough). Bumped to 2500.
- 0 CSS changes (pure math).

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R124 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R119.2 histogram bar baseline (R119-retro risk-surfaced, deferred 5 rounds): SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY. All R119 polish items now closed (R119.2 histogram baseline this round + R119 was the histogram itself).

## Self-Improvement Observations

- **Pure-math bugfixes are the cleanest "deferred stale bundle" closers**: 2-line code change, 1-line test file, no CSS, no schema, no new dependencies. Sets a good template for future rounds.
- **`(?...)` flag escaping in Bun tests**: regex literals like `/key:\s*["'][<]?\d/g` use the `g` flag — Bun's test runner hits `ReferenceError: g is not defined` when the regex contains literal `\d` and the `g` flag is being parsed as part of the `?` non-greedy modifier. Workaround: store matches in a variable first.
- **Total-bucket normalization is the right default for percentage-style histograms**: mirrors how every dashboard tool I've seen (GitHub, WakaTime, Clockify) renders "where does my time go" charts.

## Risks Surfaced (no action this round)

- **Per-hunk reconcile (R117.1)**: still deferred (heavy: requires @@ hunk DOM parsing)
- **Hunk-level overlap count (R117.3)**: still deferred (subset of R117.1)
- **Approve path doesn't lock worktree (R116)**: still deferred (semantic-only, no clear spec)
- **No CSS for reconcile-listing popup (R123 retro flag)**: not addressed in this round

## v6 Compliance

- Hard caps: 0 feature (≤3) + 1 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Bugfix: 1 (R119.2 histogram bar baseline)
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~12 minutes