# R53 Research

## Source files
- `src/ui/app.ts` line 223: stripWhitespace definition (2-line regex)
- `src/ui/app.ts` line 4943: renderDiffPanel (suspected bigger bottleneck — deferred to R54)

## Existing patterns (preserved)
- `*.test.ts` files live next to source in src/ui/ (per `bun run test:unit` glob)
- 635 existing tests run in ~4s — adding 2 perf tests stays under 5s
- Oracle advised: `<500ms` for 100 iter / 5000 lines, `<1500ms` for 10k iter (10x safety margin)

## Simplest change
- Create `src/ui/strip-whitespace.bench.test.ts` with 2 tests
- Inline stripWhitespace function (matches app.ts:223 implementation)
- Generate realistic 5000/10000-line input with mixed whitespace patterns
- Warmup pass + 100 iter + performance.now() measurement
- console.log baseline + expect(elapsed).toBeLessThan(threshold)

## Baseline data captured (R53)
- 5000-line input (128KB): 55-58ms for 100 iter → ~0.55ms per call
- 10000-line input (258KB): 111-113ms for 100 iter → ~1.12ms per call
- Linear scaling confirmed (2x input ≈ 2x time)
- Conclusion: stripWhitespace is NOT the bottleneck

## Risk
- Zero behavior change — bench only
- Threshold may flake on slow CI — 10x margin absorbs noise
- Future R54 will bench renderDiffPanel separately for the actual bottleneck

## Compatibility check
- Existing tests: 635 baseline → 637 after R53 (+2)
- pre-commit: 8/8 PASS verified
- format: oxfmt applied
- proposals.jsonl: append 1 line for R53
