# R104 — research

build structure:
- `package.json` scripts.build = `tsdown && cp src/ui/review.html dist/ui/review.html`
- dist/ui/app.js = bundle of src/ui/{app.ts, i18n.ts, ...} via tsc/tsdown
- dist/ui/review.html = verbatim copy from src/ui/review.html

three risk surfaces:
1. **stale dist/**: developer changes src but forgets `bun run build`
2. **broken build**: source change breaks tsc — build fails silently to dev
3. **partial bundle**: tsc/tsdown miss a file — bundle missing changes

smoke-test approach: sample 5-6 STRINGS rows from recent rounds (R82, R88,
R97, R103), assert both the key name and a zh-CN substring appear in
dist/ui/app.js. if any missing, the source/dist has drifted.

guard for dev mode: skip cleanly if dist/ doesn't exist. the test is a
release-time assertion; pre-commit's lint+typecheck+unit-tests already
covers dev mode.
