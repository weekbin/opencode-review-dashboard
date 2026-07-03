# R68 Discovery

R67 carry-over: empty. R53 carry-over (GH#73 #6 perf half) reopened.

Discovery scan found:
- `setIgnoreWhitespace` (app.ts:1735) calls `renderDiffPanel()` inside rAF callback
- `renderDiffPanel` (app.ts:4953) does `diffsRoot.innerHTML = ""` then appendChild for ~15 DOM nodes per file
- For 100+ files = 1500+ DOM operations per toggle
- No current bench exists for this path

Oracle consultation (Architect review of bench location): extracted pure-function approach wins over jsdom (50MB dep for one function, disproportionate).

Selected scope: bench a representative workload — `buildCardHeaderPayload()` mirroring the inner loop's object-allocation pattern. Real DOM ops are untestable in pure bun:test (would need jsdom) and out of scope.
