# r102 — loop gap #1 fix

## what shipped
`.husky/pre-commit` reordered: step 7 is now `oxfmt --write` + `git add -u src/` +
`bun test` instead of `bun run check` + `bun test`. header comment updated to
document the rationale. regression test pins the structural order.

## what went well
- structural fix is one file edit (pre-commit) + one regression test
- reordering is idempotent: oxfmt --write on already-formatted files is a no-op
- 8/8 pre-commit passes cleanly

## what was harder than expected
- initial regression test used `indexOf("bun test")` which matched the header
  comment's prose first, then the actual gate code. switched to line-anchored
  regex (`/^bunx oxfmt --write/m`) which only matches gate lines.

## lessons
- `indexOf` for ordering assertions is fragile when the searched string also
  appears in comments. use `^.../m` line anchors for ordering checks.

## loop-internal open
none.
