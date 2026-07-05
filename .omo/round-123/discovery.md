# R123 Discovery — Click-to-expand reconcile badge listing (R117.2)

## Backlog Scan

**R117 retro risks-surfaced (deferred 6 rounds now):**
- Per-file vs per-hunk granularity (R117.1) — too big for single round (per-hunk DOM parsing)
- **R117.2 click-to-expand listing (PICKED)** — natural extension, current click jumps to first finding only
- Hunk-level overlap count (R117.3)

**R122 retro risks-surfaced (still deferred):**
- Histogram bar baseline is min not zero (R119.2)
- Per-hunk reconcile (R117.1)
- Approve path doesn't lock worktree (R116)

## Decision

Pick **R117.2 click-to-expand badge listing** as R123's single polish-class feature:
- Current: clicking a reconcile badge (green/amber/red) only jumps to the FIRST finding in that category for that file
- Wanted: clicking a badge shows a popup/tooltip listing ALL finding IDs in that category for that file; each ID clickable to jump to that specific finding
- User benefit: "5 still open" badge → see which 5 specifically, jump directly to whichever one matters
- Mirrors GitHub PR file-tree "X issues" → "list of issue titles" dropdown pattern

## Why R117.2 vs R117.1 (per-hunk)

- R117.1 (per-hunk) requires parsing @@ hunk boundaries from DOM — significant scope creep
- R117.2 is pure UI: extend existing badge click handler with a popup + finding list
- Both are listed in R117 retro; picking the smaller one maintains iteration cadence

## Round Profile

- Feature: 1 (R117.2 click-to-expand badge listing)
- Bugfix: 0
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~80 (1 popup renderer + 1 click handler + 1 list jump + tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓
- ≤8 total ✓ (1)