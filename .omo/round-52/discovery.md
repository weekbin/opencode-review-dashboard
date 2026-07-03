# R52 Discovery

## Source: R51 retro + R43 deferred items
- R51 retro: pivoted from housekeeping to product work; shipped GH#73 #7
- R43 closure deferred 2 items: GH#73 #6 (hide-ws perf + loading) and #7 (COMMits chevron). #7 closed in R51.
- GH#73 #6 has 2 components: (a) loading indicator, (b) perf optimization. R52 picks (a) only — UI-only, no perf bench needed.

## Backlog scan
1. **GH issues open**: 0
2. **R51 carry-over**: empty
3. **GH#73 #6 loading-indicator half**: not yet addressed

## Selected scope
**GH#73 #6 (loading indicator part)**: when user toggles "Ignore ws", show visible feedback (spinner + status text) during re-render.

## Root cause analysis
- `setIgnoreWhitespace(next)` (app.ts L1735) calls `renderDiffPanel()` synchronously
- For large diffs (5000+ lines), `renderDiffPanel` is heavy — sync execution means browser may not paint loading state before work completes
- No loading indicator: user wonders "did the click register?"
- `data-loading` CSS + spinner + status text + `requestAnimationFrame` deferral fixes this

## Why not the perf half
- Perf optimization requires measurement (need benchmark harness)
- Building bench harness is its own ~1 round of work
- Loading indicator alone is meaningful UX win

## Decision
Pick: add `data-loading` CSS state + spinner animation + status text + rAF deferral for `setIgnoreWhitespace`

## Why this scope
- Self-contained: 3 files (review.html + app.ts + i18n.ts)
- ~30 lines change
- Real UX win for users with large diffs
- Reuses existing patterns: data-attribute-driven state, setStatus() helper

## Rejected alternatives
- **Build perf bench harness first (R52) + optimize (R53)**: longer path; loading indicator is more visible value
- **Both #6 halves in one round**: perf needs measurement; mixing risks half-baked implementation
- **Continue housekeeping (delete phase-prompts.md)**: continuing the streak; product momentum valuable