# R124 Discovery — Histogram bar baseline = absolute count (R119.2)

## Backlog Scan

**Still-deferred items (6+ rounds each):**
- R117.1 per-hunk reconcile — heavy, requires @@ hunk DOM parsing
- R117.3 hunk-level overlap count — subset of R117.1
- **R119.2 histogram bar baseline = absolute (PICKED)** — small bugfix, last R119 item
- R116 worktree lock — semantic-only, no clear implementation

## Decision

Pick **R119.2 histogram bar baseline fix** as R124's single bugfix:

**Bug**: `maxCount = Math.max(...bucketCounts, 1)` normalizes bars relative to the maximum bucket count. So if a user has 0 in `7d+` bucket but lots in `<1h`, the bars fill the full vertical space and the user has no sense of relative proportion.

**Fix**: Switch to absolute normalization — bars sized proportional to TOTAL resolved findings count across all buckets. So a user with 100 total resolves, 80 in `<1h`, 15 in `1-24h`, 5 in `1-7d`, 0 in `7d+` will see:
- `<1h` bar: 80/100 = 80% of max height
- `1-24h` bar: 15/100 = 15% of max height
- `1-7d` bar: 5/100 = 5% of max height
- `7d+` bar: 0/100 = empty (current opacity 0.15 fallback)

Mirrors GitHub commit activity bars (which are absolute-count normalized per time bucket).

## Why R119.2 vs alternatives

- R117.1 / R117.3: too heavy for single round (DOM hunk parsing)
- R116 worktree lock: no spec for what "lock" means (semantic issue)
- R119.2: pure math change, no DOM structure change, no new dependencies

## Round Profile

- Feature: 0
- Bugfix: 1 (R119.2 histogram baseline normalization)
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (1)
- ≤1 polish ✓ (none)
- ≤8 total ✓ (1)