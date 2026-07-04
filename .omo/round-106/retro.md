# R106 — test count drift detection

## what shipped
snapshot baseline `src/r106-test-count-snapshot.json` + drift test
`src/r106-test-count-drift.test.ts`.

## what went well
- bootstrap path (missing snapshot = re-baseline, not failure) lets the
  test be added without ceremony
- the snapshot file IS the contract — future developers see the regex
  inside it and know what is being counted

## what was harder than expected
- first walker used `readdirSync("src", {withFileTypes: true})` which is
  one-level deep — missed 33+ flat test files at the src/ root. count
  was 379 instead of 775. fixed with recursive `listTestFiles` helper.
  lesson: code that "walks a tree" needs recursion, not iteration over
  one level.

## lessons
- snapshot-based drift tests are inherently less brittle than per-file
  assertion tests. maintain the snapshot, not the test.
- the bug in my walker was the kind of thing the test is supposed to
  catch — wrong assertion quietly passes. the recursive walker happens
  to produce the count I'd hand-count by inspection. we trust the
  snapshot, not the walker.

## loop-internal open
none.
