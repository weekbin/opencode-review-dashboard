R104 — loop gap #7 fix: production build verification.

r82-r101 (20 rounds) modified src/ui/i18n.ts and src/ui/app.ts extensively,
but no automated check existed to verify `bun run build` had been re-run
to bake those changes into dist/. dist/ timestamps before this round were
from jun 23 — stale.

R104 ran `bun run build` manually first to verify the pipeline works (304
files, 11 MB, ~370ms). dist/ui/app.js contains all 7 R103 STRINGS keys with
their zh-CN translations intact — `commentAdded → 评论已添加` etc.

confirmed: tsc/tsdown bundle path is `src/ui/app.ts + src/ui/i18n.ts →
dist/ui/app.js`. review.html is copied verbatim (no transformation), lives
at dist/ui/review.html.
