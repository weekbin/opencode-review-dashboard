# R162 Brief

## Scope
8 ACs from user-issued issues #85-#92. Surface: action buttons (render path), filter logic, range banner CSS, sidebar-mode CSS, settings UI overhaul, AI prompt language, round counting state schema. Touches 4 source files + 1 i18n file + tests.

## Why
User feedback this session — 8 distinct UX/functional defects filed as GH issues. All confirmed reproducible.

## Per-AC acceptance

1. **#85 Force Reopen** — clicking the button opens the modal, modal submit POSTs `/reopen` with `manually_reopened: true`, status flips from `closed_auto` → `open`. Add Playwright walkthrough.
2. **#86 AI-resolved filter** — after AI resolves via `/resolve`, the finding appears under "Resolved" filter and not under "Open" filter. Add unit test asserting the rendered DOM after a resolve call.
3. **#87 Drawer resolve** — clicking Resolve in the drawer's finding list opens the modal and resolves correctly.
4. **#88 AI language** — submit payload includes `locale`. `/submit` embeds locale into agent prompt. Tests: 中文 session → resolve response contains `resolution_reason` in 中文.
5. **#89 Range banner** — banner `display: none` when `range_changed_from_last_round === false`. CSS fix `.range-banner[hidden] { display: none }`.
6. **#90 Tree/Flat height** — buttons visually match adjacent file-row line height (≤18px height).
7. **#91 Settings UI rework** — gear icon stays (already R43); consolidate layout/ignore-ws/theme/language toggles out of topbar into settings modal; rename "Close" → "Save", add success toast.
8. **#92 Round counting** — when `data.diff_base.from` differs from `base.diff_base.from`, next round = 1 for new diff_base. Same diff_base → `base.round + 1`. Add regression test.

## Risk
- **#91 (topbar consolidation)** is the riskiest — touches topbar layout. Could break layout/ignore-ws/theme/language quick-access shortcuts if not done carefully. Mitigation: keep search/zoom/outline/navigate/edit (those aren't settings).
- **#92 (round counting)** — schema change. Need backwards-compat with existing state.json files that don't have `diff_base_fingerprint`. Mitigation: default to `base.round + 1` when fingerprint missing.

## Verification plan
1. `bash .husky/pre-commit` (9 checks) — must pass
2. `bun test` — must pass (no test count regression; add ≥3 new tests for new ACs)
3. `bun run build` — must succeed
4. Spot-verify each fix in the relevant file:line

## Profile
Mixed: bugfix-heavy with 3 enhancements. Total LOC estimate: ~200-300 across src/, plus ~150 lines tests.