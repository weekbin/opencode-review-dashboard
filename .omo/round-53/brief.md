# R53 Brief

**Scope**: Create `src/ui/strip-whitespace.bench.test.ts` — perf bench for `stripWhitespace()` function on 5000-line and 10000-line realistic inputs. 2 regression tests, ~30 LOC.

**Why**: GH#73 #6 perf half requires measurement before optimization. Foundation round establishes baseline for future rounds to detect regressions and target the actual bottleneck (likely renderDiffPanel, not stripWhitespace).

**Risk**:
- Zero `src/` behavior change (bench file only)
- Test runtime impact: <300ms total (bench overhead acceptable within 4s suite)
- Threshold 500ms has 10x safety margin to avoid CI flakiness

**Acceptance**:
- 2 bench tests pass
- console.log captures baseline elapsed ms
- `bash .husky/pre-commit` → 8/8 PASS
- 637/637 tests (635 baseline + 2 R53 new)
- Baseline numbers recorded in `.omo/round-53/research.md` for R54 reference
