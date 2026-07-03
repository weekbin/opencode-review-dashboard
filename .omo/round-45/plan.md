# Phase 1 Architect Plan — Round 45

> Housekeeping profile → 1-paragraph plan
> Inherited scope from `brief.md`: 4 critical + 3 important R44 audit gaps

## Plan (1-paragraph summary)

R45 closes 4 critical + 3 important R44 audit gaps, all loop-internal per v5.4 NO DEFERRAL. Lead-direct execution per R+ retro. Six concrete edits: (Fix-1) augment `SG.R44.1` in `SKILL.md` to add an 8th discovery-sweep command — `scripts that auto-modify` detection (pattern-match on `oxfmt --write`, `eslint --fix`, `prettier --write` etc.) — closing the oxfmt `--write` gap class that bit R44; (Fix-2) extend Phase 4.7 `Self-check checklist the lead must verify` in `SKILL.md` with a new mandatory row `SG.R44.1 sweep completed (8 commands) — executed all`, making "claim with execution" an explicit block gate (vs R44's overclaim); (Fix-3) document the new `/api/review/<id>/state` endpoint in `.opencode/skills/review-dashboard-ui-test/SKILL.md` under its `## Mock server endpoints` section so future Playwright walkthroughs know it exists; (Fix-4) add a regression test for `/state` in a new test file (or `e2e.mjs` smoke); (Fix-5) cleanup `.playwright-cli/` per memory 437/438 + (Fix-6) grep `references/` for stale SG.R pattern references and update if any; (Fix-7) tighten Phase 3.5 template in `SKILL.md` to make 1-line skip note explicit (closes the "doc-update-report.md 39 lines for skip" recurrence). Phase 2.5 = 3 fast gates + SG.R27.1 + husky. Phase 3a = 3 lens. Phase 3c = minimal (only if mock-server test exercises network). Phase 4.5 retro combines with 4.6 per v5.3.12 Patch 3.

## File changes

| File | Fix | Change type |
|---|---|---|
| `.opencode/skills/team-dev-loop/SKILL.md` | Fix-1 (SG.R44.1 patch augment) | Add 8th command to shell block; update Command count |
| `.opencode/skills/team-dev-loop/SKILL.md` | Fix-2 (Self-check template) | Add "Discovery Sweep completed" row |
| `.opencode/skills/team-dev-loop/SKILL.md` | Fix-7 (Phase 3.5 template) | Replace 1-para with 1-line skip directive |
| `.opencode/skills/review-dashboard-ui-test/SKILL.md` | Fix-3 | Add `/state` endpoint doc under "Mock server endpoints" |
| `.opencode/skills/team-dev-loop/references/*` | Fix-6 | grep for stale SG.R refs; update if any |
| `scripts/test-review-ui/mock-server.py` (or `e2e.mjs`) | Fix-4 | Add `/state` endpoint regression test |
| `.playwright-cli/*` | Fix-5 | `git clean -fd .playwright-cli/` |

## Tests required

- Fix-4: 1+ regression test for `/state` endpoint. Pattern: `await page.goto("/api/review/test/state"); expect page response 200 OK with fixture findings`.

## Hand-off items

**Must-do**:
- Lead MUST actually execute SG.R44.1's expanded 8-command sweep during R45 retro (the lesson R44 retro failed to internalize). SG.R44.1 sweep completeness is the BRONZE meta-gate.
- Husky pre-commit must PASS at closure commit time. If SG.R44.1's auto-modify detect command added in Fix-1 conflicts with any actual file writes, the gate will block.
- doc-update-report.md for R45 should be **1-line** (per R43 retro + R44 retro lessons, this rule needed explicit SKILL enforcement). SKILL.md Phase 3.5 template must say so.

**Must-not-do**:
- Do not defer any R45 items to R46 (v5.4 NO DEFERRAL)
- Do not claim "sweep ran" without command-by-command evidence
- Do not edit SKILL.md's structural sections (only append within existing subsections)

## Risk register

- **Risk**: SG.R44.1 8th command accidentally detects something that's fine (false positive). Mitigation: design the 8th command to **report only** (exit non-zero only on real red flags); leads to investigative findings, not commit blocks.
- **Risk**: mock-server regression test breaks existing e2e harness. Mitigation: ADD test, don't modify existing tests.
- **Risk**: `.playwright-cli/` cleanup deletes files in active use. Mitigation: verify with `ps aux | grep playwright_chromiumdev_profile-` that nothing is running.

## Deferred items (R45 carry-over)

- R43 #6 + #7 → NOT in R45 (housekeeping only).
- R44 #5 (references/ drift check) and #7 (Phase 3.5 template) are important-but-not-critical; will do if time permits.
