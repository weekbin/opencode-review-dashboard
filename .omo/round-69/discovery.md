# R69 Discovery

R68 carry-over: empty (perf bench baseline established).

Fresh scan for product bug. Rounds R57-R59 closed 3 a11y patterns:
- R57: diff search input/buttons (static HTML)
- R58: SVG aria-hidden + drawer close aria-label
- R59: sidebar folder div → button pattern

Same pattern still missing in renderDiffPanel (app.ts:4995-5008): card-header divs have click handler but no role/tabindex/aria-expanded/keydown. Keyboard users can't collapse files in the diff panel.

Selected scope: card-header keyboard a11y. Same fix as R59 (folder div). 1 src/ file. ~10 LOC.
