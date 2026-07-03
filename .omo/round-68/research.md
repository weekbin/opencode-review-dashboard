# R68 Research

## Bench scope
The full `renderDiffPanel()` cannot be benched in pure bun:test because it requires:
- `document.createElement` (DOM API)
- `Element.appendChild` (DOM API)
- `diffsRoot.innerHTML = ""` (DOM mutation)

Adding jsdom just for this bench is disproportionate (~50MB devDep for one function).

Per Oracle recommendation: bench a representative slice of the inner loop that mirrors its allocation pattern.

## What I benched
`buildCardHeaderPayload(file)` — a pure function that creates the same object-shape as the card-header DOM child elements that renderDiffPanel builds. This measures:
- String allocations per file (~12 strings)
- Object property assignments
- Inner-loop overhead

## What this bench does NOT measure
- Browser DOM createElement / appendChild cost (real bottleneck for large diffs)
- The `diffsRoot.innerHTML = ""` teardown cost (separate concern)
- Browser paint/layout

## Baseline captured
- 100 files × 100 iter = 5.41ms (0.054ms/call) — well within threshold
- 500 files × 100 iter = 8.53ms (0.085ms/call) — sub-linear scaling suggests under-saturated CPU
- Linear scaling factor: 5x files → ~1.6x time

## Real perf cliff (deferred to future round)
The actual `diffsRoot.innerHTML = ""` at app.ts:4953 + per-file DOM ops are the dominant cost in browsers. Bench above measures only the JS-allocatable side. Future R## can either:
(a) Add jsdom + bench real DOM (50MB dep)
(b) Implement range-rendering (only build visible cards + IntersectionObserver virtual scrolling for off-screen)
(c) Inline renderDiffPanel call sites + lazy-load cards on scroll

Decision left for future round when actual user-perceived perf becomes a complaint.
