# R119 Discovery — First-pass resolve time binned histogram (R118.2)

## Backlog Scan

**R118 retro risks-surfaced (no action this round):**
- **R118.2 (PICKED)**: First-pass resolve time binned histogram (e.g. <1h, 1-24h, 1-7d, 7d+)
- R118.1: per-round sparkline resolution rate (defer)
- R118.3: sparkline tooltips (defer)

**R117 retro risks-surfaced (deferred):**
- Per-hunk granularity
- Click-to-expand listing

**R116 retro risks-surfaced (deferred):**
- updateSubmitButtons reactive (bugfix)
- Reopen guard for approved findings (bugfix)

**Carry-over from R118 retro**: NONE (R118 SHIPped clean).

## Decision

Pick **R118.2** as R119's single polish-class feature:
- R118 just shipped the Stats tab with first-pass resolve time as raw `avgMs`. A binned histogram converts that number into actionable visual segments (How many of my finds did I close in <1h, 1-24h, etc.?) — mirrors GitHub Pulse activity graph.
- No dependencies, builds on existing aggregation (`aggregateFirstPass` from R118).
- Pure additive: no schema break, no new strings beyond ~6 new keys.

## Round Profile

- Feature: 1 (R118.2 binned histogram)
- Bugfix: 0
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (none)
- ≤1 polish ✓ (none — the histogram itself is feature-class because it adds visible UI not just tweaks docs/UX)
- ≤8 total ✓ (1)
