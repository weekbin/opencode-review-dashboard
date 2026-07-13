# R160 Retro — [USER ISSUE #2] README 图片统一 + 文档更新

## What worked

User-driven feature round (real product work, not self-feedback-loop housekeeping). Two issues addressed:

1. **R159 (folded into R160 commit)**: USER ISSUE #1 — ban all remote CI
   - `rm -rf .github/` (no .github/workflows/, no vercel.json, no netlify.toml, no render.yaml)
   - README + README.zh-CN.md got "Project rules" / "项目规则" section explaining the rule
   - v6 SKILL.md got "## Project rules (HARD)" section with rule #0
   - `.husky/pre-commit` got check #9 that blocks any future CI config
   - **Pre-commit went from 8/8 to 9/9 PASS** with the new check

2. **R160 (USER ISSUE #2)**: README 图片统一 + 文档更新
   - **13 image operations**: 9 resizes + 3 R17 re-captures + 1 R137 new capture + 1 R132 new capture
   - All images now **1280×720 (横屏 16:9)** — uniform standard
   - README.md + README.zh-CN.md got 3 new/updated sections each (Lock banner, Copy round notes, Switch languages)
   - R60 bilingual parity test PASS

3. **Profiled shift**: 8 housekeeping + 1 refactor (R152-R158) → 2 user-driven rounds (R159 + R160). This is what the user asked for in the previous round.

Pre-commit ran clean (9/9 PASS after the new check). bun test stayed at 1119/1119 PASS. R60 bilingual parity test passed.

## What didn't

- **First R160 mock-server attempt failed** because I tried to set `isLocked: true` but the actual schema is `locked: { at, round, by }`. The mock-server's `serve_mock()` returns `load_mock()` which doesn't include `locked` by default — I had to add it via MOCK_DATA_FILE.
- **R17 IME composition screenshot** took 4 retries. The conversation search input is dynamically created with id `#search-input`, but there's also a sidebar search input with the same id — both are hidden via `display: none` when their respective panes aren't active. The fix: use `Array.from(searches).find(s => s.offsetParent !== null)` to find the visible one.
- **R137 copy button was missing** because `dist/ui/app.js` was stale — I had to `bun run build` to refresh the dist. The build took 415ms but was necessary.
- **Image resize using `--resampleHeight`** gave wrong results because sips interprets the parameter differently than expected. The right command is `sips -z HEIGHT WIDTH` (literal height/width pair, not "resample to height X" which keeps original width).

## Carry-over list (≤3 items)

None — all long-shelved R137-R152 flags closed by R152-R158. R159 closed the "no remote CI" issue. R160 closed the README+images issue.

## Closed in this round (loop-internal)

- **USER ISSUE #1** (R159): ban all remote CI
- **USER ISSUE #2** (R160): README 图片统一 + 文档更新
- **R137+R150+R148+R134+R132 user-perceivable features**: documented in README for the first time

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **User-driven rounds produce significantly better signal than self-feedback-loop rounds.** R159 + R160 closed 2 real user issues with concrete deliverables (rule + docs). Compare to R154-R158 (8 housekeeping rounds closing each other's carry-overs) which had no user input. The user's previous message "我发现你最近几轮的优化，bugfix 和 feature 比较少，大部分是自循环的优化" was the right diagnosis.
- **Mock-server for screenshots requires real data shape knowledge.** The `locked` field schema is `{ at: number; round: number; by: "user" }`, not a boolean. I had to look at app.ts:3587 to find this out — the R132 retro's mock-server writeup did not capture this.
- **`dist/` staleness is a recurring trap.** When src changes, dist must be rebuilt for the changes to take effect in playwright. Future screenshot rounds should `bun run build` early.
- **sips parameter confusion is real.** `sips -z H W` (literal height/width) vs `--resampleHeight H` (preserves aspect ratio). For mixed-content (some landscape, some portrait, some stretched), use `--resampleHeight` to preserve aspect; for forced resize, use `-z`.

## Risks Surfaced (not actioned this round)

None — all user-driven issues closed.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **2 housekeeping** = **2 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 9/9 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).

## Round Profile

- Housekeeping: 2 (R159: ban remote CI + R160: image standardization + README update)
- Total: 2
- Subagents: 0
- Time: ~25 min wall-clock combined
- **Driver**: USER DIRECTIVES (ISSUE #1 + ISSUE #2) — not carry-over / not stale i18n surface.