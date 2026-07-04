# R110 — zh-CN smoke proxy

## what shipped
src/r110-zh-cn-smoke.test.ts with 3 tests. lightweight proxy for the
gap #2 zh-CN walkthrough.

## what went well
- test ran first time after fixing the `/ui/review.html` → `/review/test`
  path (mock-server maps `/<id>` not `/ui/` to review.html)
- test ran first time after fixing the `.mjs` → `.ts` file extension
  (TypeScript types not parseable as JS module)
- 3 tests pass in 592ms — fast, deterministic

## what was harder than expected
- file-extension gotcha caught by bun parser, not pre-commit
- mock-server path mapping (`/review/<id>` not `/ui/review.html`) caught
  by reading the source

## lessons
- unit-test proxies for heavyweight visual checks are a useful pattern.
  the test doesn't validate visual rendering, but it validates the
  precondition that any visual rendering would need.
- file extensions matter. `.mjs` for JS, `.ts` for TS-with-types.

## loop-internal open
none.
