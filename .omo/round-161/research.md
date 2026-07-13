# R161 Research — [USER ISSUE #3] 截图修复

User-driven round. Research scope:

1. R160 ship regression: 3 README-referenced images missing
2. R160 image quality audit: 3 description-mismatch + multiple "content vs viewport" issues
3. Latent R8/R13 in-diff search counter bug (out of scope)

**R8/R13 bug details** (out of R161 scope):
- `findMatchesInDiff()` at `app.ts:743-747` queries `[data-line-number]` selector
- `@pierre/diffs` library (v?.?.?) emits `[data-line]` attribute on the line wrapper div
- Net result: counter always shows 0 matches regardless of query
- Would need a separate R162 (or later) round to fix the selector

**Mock-server findings** (used in R161 to render proper screenshots):
- `reactions` field is `Array<{emoji, users}>`, NOT `Record<emoji, users[]>` (my initial mock had wrong format)
- `findMatchesInDiff` lives in `dist/ui/app.js:20278` after build
- Card data structure: `<section class="card" data-file="...">` with `diffs-container` web component child (shadow DOM)
- Lines in shadow DOM: `div[data-line="N"][data-line-type="change-addition"]`

**Re-capture strategy** (per "size too small" user feedback):
- Use richer mock data (3 files, 1 finding with reactions, prior notes) so each screenshot shows substantive content
- Stay at 1280×720 viewport (16:9 standard, what other README images use)
- Trigger specific UI states (pin finding, click Copy as MD, open diff search) for each capture

Lightweight compression: research scope limited to mock-server payload shape + UI trigger points.