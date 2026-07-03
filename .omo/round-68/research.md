# R68 Research

`renderDiffPanel` (app.ts:4953) does:
1. `diffsRoot.innerHTML = ""` (clears 100k+ nodes — dominant cost in real browser)
2. For each file: ~15 `document.createElement` calls + ~15 `appendChild` calls

Real browser bottleneck is (1) — GC pressure from detaching 100k nodes. Unmeasurable in bun:test.

Testable slice: object-allocation in the per-file card-header construction (app.ts:4995-5055). Pure JS — no DOM.

Extracted pattern (`buildCardHeaderPayload(file)`):
- Returns plain object with 11 string properties
- String literals (SVG markup) + computed property values
- Allocates 12 element-spec objects per file

Bench two workloads:
- 100 files × 100 iter (realistic diff size)
- 500 files × 100 iter (large diff, linear scaling check)

Threshold:
- 100 files: <200ms (~2ms/call × 100 iter = 200ms; 10x safety)
- 500 files: <1000ms (~10ms/call × 100 iter = 1s; 10x safety)

Actual baseline (just captured):
- 100 files: 5.4ms / 100 iter (0.054ms/call)
- 500 files: 8.5ms / 100 iter (0.085ms/call)
- Linear scaling: 5x files = 1.6x time (sub-linear, suggests V8 string intern)
