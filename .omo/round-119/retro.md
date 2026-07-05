# R119 Retro — First-pass resolve time binned histogram (R118.2)

## What Shipped

Issue: R118 retro risk-surfaced R118.2 — "No histogram bins: firstPass.avgMs is shown, but a binned histogram (e.g. <1h, 1-24h, 1-7d, 7d+) would be more actionable."

User-facing delivery:
- **Binned histogram** under First-pass resolve time section in Stats tab
- 4 buckets: `< 1 hour` / `1–24 hours` / `1–7 days` / `7+ days`
- Inline SVG bars (no chart lib) — reuses `createElementNS` pattern from `renderSparkline`
- Each bucket has: bar (height proportional to count/max), label, count
- Empty buckets dimmed (`opacity: 0.15` vs `0.85`)
- Existing R118 `view.stats.firstPass.histogram` i18n key ("Distribution"/"分布") finally bound as section heading
- ARIA: `role="group"` + `aria-label` on the histogram row

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| `aggregateFirstPassBuckets(values)` function | ✓ app.ts:3527 |
| 4-bucket Record return | ✓ `<1h`/`1-24h`/`1-7d`/`7d+` |
| Bucket math correctness | ✓ HOUR/DAY/7*DAY boundaries |
| Histogram renderer (inline SVG) | ✓ createElementNS + rect per bucket |
| i18n 4 keys × 2 locales (8 strings) | ✓ |
| Histogram only when values > 0 | ✓ `if (firstPass.values.length > 0)` guard |
| Existing `view.stats.firstPass.histogram` bound | ✓ |
| 20 tests (12 ACs split) | ✓ 20/20 GREEN |
| 0 regressions in R118 | ✓ 14/14 R118 pass |

12/12 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for single-feature rounds.
- Implementation: ~110 LOC in app.ts (new aggregation fn + 70 LOC histogram render) + 4 i18n keys + 20 tests (~150 LOC).
- 1 mid-implementation stumble: window-size bug — first RED run had AC12-1 fail because `src.slice(fnStart, fnStart + 4000)` cut off right before the histogram reference (offset 4039). Fixed by bumping AC11 + AC12 window to 8000.
- 1 file corruption bug: redundant `});` introduced by intervening edit left a duplicate `describe(...)` line that broke parsing. Rewrote test file cleanly.

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R119 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R118.2 histogram (R118-retro risk-surfaced): SHIPPED this round.
- Unbound `view.stats.firstPass.histogram` key: bound this round.

## Open Loop-Internal at Retro Time

EMPTY. All loop-internal items closed in this worktree.

## Self-Improvement Observations

- **Window-size match must cover actual implementation**: AC11 + AC12 originally used 4000-char window based on R118's renderStatsPane length (~2800 chars). R119 extended renderStatsPane by ~3500 chars (histogram render block), pushing the reference past 4000. Lesson: when extending a tested function, also bump window sizes in tests that reference downstream code. **Could become R119.1: heuristic window size = fnStart + (function length × 2) buffer.**
- **Test file corruption recovery**: When edits go bad, full file rewrite is faster than incremental fix when the syntax error spans 3+ duplicated `describe` lines. Lesson: if regex can't safely fix dup, rewrite.
- **R118 handoff worked**: The `view.stats.firstPass.histogram` key was deliberately left in i18n.ts by R118 with no binding — R119 closes that loop. This is a pattern worth continuing: when a round ships a partial feature, name the next-step keys so future rounds can pick them up cleanly.

## Risks Surfaced (no action this round)

- **No per-hunk reconcile (R117 carry-over)**: still deferred per R117 retro
- **No per-round sparkline resolution rate (R118.1)**: still deferred per R118 retro
- **No sparkline tooltips (R118.3)**: still deferred per R118 retro
- **Histogram bar baseline is min not zero**: bars are normalized to max bucket count, not absolute. A user with 0 resolutions in 7d+ bucket but lots in <1h will see no comparison to absolute. Acceptable per R118 design (small-diff-first), but could confuse users with extreme skew.

## v6 Compliance

- Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected (after verify/retro/decision land).
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 1 (R118.2 first-pass histogram + R118-unbound i18n key bind)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~20 minutes