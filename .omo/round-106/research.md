# R106 — research

test-count check vs. per-file count:
- test-count drift catches the aggregate signal (silent deletion grows
  negative). cheap, 1 file.
- per-file count catches "file X shrunk" even if total flat. more precise
  but heavier (snapshot per file).

chose test-count for v6: simpler signal, less brittle, easier to maintain.
if we ever need per-file granularity, that's a future round.

bootstrap path is critical: missing snapshot != "drift detected". first
run with no snapshot → create baseline → pass. legitimate refactor that
reduces tests → delete snapshot → next run re-bootstraps.

bug discovered during implementation: first walk used
`readdirSync("src", {withFileTypes: true})` which is one-level deep,
missing flat files like `src/r16-features.test.ts`. switched to recursive
`listTestFiles` and the count went 379 → 775.
