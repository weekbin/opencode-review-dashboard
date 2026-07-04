# r102 — research

gap #1 is structural — the gate's ordering lets `bun run format` mutate a file and
then return exit 0 without re-running tests against the mutated state. the fix is
to reorder so the format-write happens INSIDE the gate, before the test step.

three approaches considered:

a) move `bunx oxfmt --write` to run as the very first gate step, then `git add -u`
   to re-stage any mutations, then `bun test`. this is what we ship.
b) add a pre-commit-side `oxlint` rule that bans tests from matching literal
   english strings. structural, but doesn't address the reformat drift itself.
c) drop `bun run format` entirely and require devs to run oxfmt via IDE. kills the
   mutation source, but pushes burden to dev and misses automated-pr drift.

approach (a) wins on: zero tooling change, deterministic verification, fails-fast
on actual drift. the only new assumption is that `bunx oxfmt --write src/` is safe
to run repeatedly (idempotent — oxfmt's --write mode is a no-op on already-formatted
files).
