# R110 — research

mock-server.py path map (per source):
- `/` → dist/ui/review.html
- `/review/<id>` → dist/ui/review.html (also parsed by app.js for reviewID)
- `/assets/<file>` → dist/ui/<file>
- `/api/review/<id>` → mock Launch JSON
- `/api/review/<id>/state` → stateful mock (R44)
- `/health` → "ok"

R110 tests 3 surfaces:
1. dist/ui/review.html on disk has data-i18n-* wiring
2. mock-server serves the wired HTML at /review/test
3. mock-server /api/review/test returns Launch-shaped JSON

the third surface catches the case where review.html is missing (404
or fallback HTML). this protects against "I forgot to rebuild dist"
end-to-end, complementing R104's static dist check.

bug found during implementation:
- file initially written as `.test.mjs` with TypeScript types (`let x: T`)
  — bun rejects it as JSX/syntax error. renamed to `.test.ts`.

file extension gotcha: .mjs extension is JavaScript module — TypeScript
syntax not allowed. .ts extension is TypeScript — JS-with-types allowed.
