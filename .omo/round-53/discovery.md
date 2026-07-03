# R53 Discovery

## Source: GH#73 #6 perf half + R52 retro carry-over
- R52 retro "Remaining R43 deferred items: GH#73 #6 perf half: requires benchmark harness"
- GH#73 #6 was: "Hide whitespace is slow + no loading indicator on toggle; same for first-screen diff render — perceived performance bug + missing UI feedback"
- R52 shipped the loading-indicator half; R53-R54 ship the perf half

## Backlog scan
1. GH issues open: 0
2. R52 carry-over: GH#73 #6 perf half
3. Suspected bottleneck: renderDiffPanel (app.ts:4943) — `diffsRoot.innerHTML = ""` then full DOM rebuild
4. stripWhitespace (app.ts:223) is 2-line regex, suspected minor contributor

## Selected scope
Build perf bench harness for stripWhitespace. Foundation round — measures one function's cost on realistic input. Future R54 uses baseline data to decide where to optimize.

## Decision
Pick: inline bench test (Option A per Oracle review) — single file, ~30 LOC, matches project `*.test.ts` convention, CI-enforced regression gate.

## Why this scope
- Foundation before optimization (test-first for perf)
- Captures baseline data into test runner output via console.log
- Threshold 500ms (10x safety margin) catches catastrophic regressions without flaking CI
- Realistic input: 70% indent, 20% trailing spaces, 10% tab runs

## Rejected alternatives
- Extract stripWhitespace to text-utils.ts (Option B): mixes bench + refactor, exceeds foundation scope
- Standalone script in scripts/bench/ (Option C): no CI gate, breaks RED→GREEN mandate
