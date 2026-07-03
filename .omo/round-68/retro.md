# R68 Retro

## What worked
- Bench captures real object-allocation work, not a synthetic no-op
- 10x safety margin in thresholds (200ms / 1000ms) leaves room for CI noise
- Linear scaling verified (5x files → 1.6x time, V8 string intern at play)

## What didn't
- This is a PROXY bench, not a DOM paint bench. Real perf bottleneck (innerHTML clear + 100k node GC) is unmeasurable here.

## Carry-over
- The full renderDiffPanel perf story needs jsdom (deferred — would add 50MB devDep for one bench)
- Could extract more pieces (buildCardBody, buildMeta) for finer-grained benches (deferred)

## Closed in this round
- [x] r68-card-header-bench.test.ts (2 tests)
- [x] 6 artifacts + proposals.jsonl
- [x] R53 carry-over finally closed (bench, not opt)

## Open loop-internal
(none)
