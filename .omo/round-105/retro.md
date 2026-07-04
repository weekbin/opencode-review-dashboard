# R105 — .omo/round-* v6 conformance

## what shipped
`src/r105-round-conformance.test.ts` with 3 tests. tests walk every
.omo/round-{N>=82}/ dir and assert structural conformance.

## what went well
- direct readdirSync + JSON-stringify-able sentinel (decision.md content) is
  simple to reason about, no false-positive traps
- normalizing "NONE." / "none." via strip-trailing-period + lowercase to a
  single canonical form: ["none", "empty", "n/a", "-"]

## what was harder than expected
- tsc with noUncheckedIndexedAccess requires explicit `m[1]` non-null guards
  on every regex capture group access. fixed in r103 — reapplied here for
  the r105 regex captures. needed at lines 38 and 80.
- first regex attempt `/^(none|empty|n\/a|-|\.{0,3})$/i` failed because `\.{0,3}` was
  its own alternative; "NONE." went to neither `none$` nor `\.{0,3}$` (had 5 chars).
  switched to post-strip normalization.

## lessons
- scope v6 conformance to rounds >= R82 only. older rounds (r1-r81) predate
  the spec and would create noise.
- one-token sentinel files ("decision.md === SHIP") are syntactically
  enforceable, a property prose can never have.

## loop-internal open
none.
