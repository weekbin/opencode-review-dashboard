# R52 Decision

## Decision
SHIP

## Lightweight round (if applicable)
NO — 3 src/ files touched; above ≤2 threshold for lightweight. Regular round.

## Doc updates (SG.R29.8 carry-over)
SKIPPED — internal loading-state UX; no user-facing README change needed.

## Loop summary (1 paragraph)
R52 ships GH#73 #6 loading-indicator half: added spinner + status text + rAF deferral to "Ignore ws" toggle. Root cause was sync `renderDiffPanel` blocking paint; wrapping in `requestAnimationFrame` gives the browser a chance to show loading state before re-rendering. 3 new regression tests (635/635 total, was 632). Pre-commit 8/8 PASS. Loop-internal items all closed in current worktree. GH#73 #6 perf half remains — requires benchmark harness before optimization. R53 will run next per auto-pilot default.