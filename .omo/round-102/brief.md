# r102 — loop gap #1 fix

## ac1
`.husky/pre-commit` runs `bunx oxfmt --write src/` as gate step [7/8], with
`git add -u src/` re-staging any mutations, then `bun test`. test anchor drift
caused by silent reformat is now caught deterministically.

## ac2
header comment in `.husky/pre-commit` documents the gap #1 rationale and the new
ordering.

## ac3
regression test `src/r102-precommit-gap1-fix.test.ts` pins the structural order:
- `bunx oxfmt --write` appears as a gate command (line-anchored)
- `git add -u src/` follows it
- `bun test` follows both (drift detection)
- header comment mentions gap #1 and "anchor drift"

## ac4
full v6 pre-commit suite passes 8/8 against current working tree.
