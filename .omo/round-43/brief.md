# Phase 0 PM Triage — Round 43

**Date**: 2026-07-03
**Lead**: sisyphus (lead-direct, v5.3.13 R+ retro style — no PM Triage subagent)
**Profile**: bugfix (multi-issue UI/UX feedback from GH #73)

## Source

**GitHub issue [#73](https://github.com/weekbin/opencode-review-dashboard/issues/73)** — user feedback report titled "几个问题" ("Several issues") listing 7 distinct UI/UX/state bugs across the review dashboard. Posted 2026-07-03T10:48:38Z by user.

> Per SG.R29.9 backlog-empty decision rule: backlog is NOT empty (1 open issue), so default housekeeping does NOT apply.

## Pre-check: prior round SHAs

- Baseline main HEAD: `ee4891c` (R42 closure)
- `git cat-file -e ee4891c` → exit 0 ✓
- R42 was a v5.4 validation round (SKILL.md-only edit, all PASS per `r42/decision.md`)

## User pain

The user is the dashboard's end user. Across a normal review session, 7 distinct problems degrade their workflow:

1. **range-banner always shows + not fixed-position** — cosmetic noise + scrolls out of view, defeating its purpose
2. **CONversation "mark as duplicated" → drawer not updated** — state bug; user has stale info in drawer
3. **Settings panel: button-shaped container with no icon, label text overflows in both EN and zh-CN** — visual confusion
4. **previously discussed page: action buttons float over the top nav bar after scrolling** — z-index bug, breaks visual hierarchy
5. **COMMits panel: folded vs unfolded states have no clear visual distinction** — users can't tell at a glance whether panel is collapsed
6. **Hide whitespace is slow + no loading indicator on toggle; same for first-screen diff render** — perceived performance bug + missing UI feedback
7. **Default language should be Chinese (zh-CN), not English** — i18n config

> **User-story framing**:
> **As a** reviewer doing a code review session,
> **I want** each of these 7 UI elements to behave correctly (visible/hidden as appropriate, positioned properly, performant, accessible in both languages),
> **So that** my workflow isn't disrupted by stale state, visual noise, missing feedback, or wrong default language.

## Competitor analysis

**SKIPPED** for bugfix profile (per Phase 0.25 gating). Note instead: opencode-review-dashboard is a code-review orchestration tool for OpenCode; comparable tools are GitHub PR review + GitLab MR review + JetBrains Space + Sourcetree. None of these competitor tools are direct competitors on the same review-on-local-clone surface — the closest analogue (GitHub PR review) has known issues with similar bugs (e.g., z-index overlap after scroll, no loading indicator on whitespace toggle) but they ship a different surface model. We're patching observed user-facing bugs in OUR tool, not chasing a competitor feature.

## Product-value gate (v5 R6 retro defense)

3-test to prevent polish from masquerading as product:

1. **README 缺段** (README missing section): Issue #73 represents real reported user friction. README updates for any R43 ship are gated by SG.6 zh-CN lockstep.
2. **非开发者可见** (non-developer-visible): Yes — all 7 items are user-facing UI behavior, observable without reading source.
3. **竞品已有** (competitor already has): Moot for bugfix (we're fixing bugs, not adding features). Some bugs (z-index overlap, perf feedback) are common in similar tools but irrelevant — we're addressing them in OURS, not adding them to ours.

**Verdict**: PASS — these are real product fixes, not cosmetic polish.

## Candidates ranked

Issue #73 contains 7 sub-issues. Per bugfix hard cap (≤5 per round), 2 must defer.

| Rank | Source | User-story fragment | Type | Priority | Disposition |
|---|---|---|---|---|---|
| 1 | #73 range-banner | Banner shows even when empty + not fixed-position → scrolls out of view | bugfix (state + CSS) | HIGH (cosmetic noise every load) | **In R43** |
| 2 | #73 mark-as-duplicated | Drawer doesn't update after mark-as-duplicated | bugfix (state) | HIGH (logical bug, wrong info shown) | **In R43** |
| 3 | #73 settings-icon | Settings panel: button-positioned container has no icon, text overflows in EN/zh-CN | bugfix (CSS + a11y icon) | HIGH (visual confusion, i18n completeness) | **In R43** |
| 4 | #73 previously-discussed z-index | Action buttons overlap top nav after scroll | bugfix (CSS z-index) | HIGH (visual hierarchy broken) | **In R43** |
| 5 | #73 default-language-zh-CN | Default language should be zh-CN | bugfix (i18n config) | MEDIUM (1-line config change) | **In R43** |
| 6 | #73 hide-whitespace-perf | Toggle is slow + needs loading indicator + first-screen diff needs loading | bugfix (perf + UI feedback) | MEDIUM (perf + UX) | **DEFERRED to R44** (deeper investigation needed; affects renderDiffPanel — likely separate perf round) |
| 7 | #73 COMMits-panel-visual-cue | Folded/unfolded states have no visual distinction | bugfix (CSS) | LOW (polish-level) | **DEFERRED to R44** (polish round) |

**Scope selection rationale**:
- R43 picks top-5 covering all 3 issue areas: state (#2), default-config (#5), visual hierarchy (#3, #4), cosmetic noise (#1)
- R44 will pick up the remaining 2 (#6 perf, #7 polish) as either a focused perf round or a polish round per SG.R29.9 default

**Override note** (per SKILL override rule): Bugfix hard cap is ≤5. Issue #73 has 7 sub-items. We split across R43 (5) + R44 (2). Documented in `decision.md ## Round profile`.

## Self-Critique

- **Risk 1: state-bug confirmation needed.** "mark as duplicated → drawer still shows entry" — must verify this is a real state-update bug, not just a user perception. Verify by inspecting `drawerConversationEntries` state mutation paths and `markAsDuplicate` handler in src/ui/app.ts. AC must include a regression test that asserts drawer entry is removed when finding is marked-duplicated.
- **Risk 2: i18n default-language change is data-shape risk.** Changing default locale affects existing user localStorage, force-reload behavior, language toggle persistence. Verify no regression via existing i18n.test.ts + add a test that asserts `localStorage.i18n.lang === "zh-CN"` after first load with no preference set.
- **Risk 3: z-index fix in review.html could affect overlay stacking.** Currently `#post-submit-overlay` (R33 #70 fix) is z-index high. Adding button overlays could conflict. Verify via Phase 3c Playwright walkthrough.
- **Risk 4: setting-icon addition needs accessibility coverage.** R33 retro SG.R28.1 frontend skill mandate — new icon must have aria-label, role, focus styles. Verify via 5-item design checklist (z-index, backdrop, status enums, layout consistency, i18n completeness).
- **Risk 5: bench-matrix AC1.5 (SKILL.md v5.4 patch line 1585) was the only "validation round" item last round; R43 returns to product work. No rest-week needed.**

## User-impact profile

```yaml
user_impact_profile:
  pm_source: GH issue #73 (user-reported, not proactive)
  U_size: small-medium (5 items, ~6-8 source files touched)
  U_files: small (src/ui/app.ts + src/ui/review.html + src/ui/i18n.ts at most)
  U_new_capability: no           # all are bugfixes — existing UI made correct
  U_behavior_shift: no           # no fundamental behavior change; observable UI made correct
  U_user_visible: yes            # user explicitly reported these
  U_data_shape_breaking: no      # no schema changes; localStorage keys preserved
  U_data_safety: no
  U_installs_new_dep: no

# Lead conversion (per loop-decision.md):
# U_size=small-medium → 1, U_files=small → 1, U_user_visible=yes → 2
# Total = 1 + 1 + 2 = 3
# Rule 1 (architecture): no matches. Rule 2 (feature): U_user_visible=yes AND total≥3 → could be feature.
# Override: bugfix because all items are existing-feature-corrections, not new capabilities.
# decision.md ## Round profile will document the bugfix override.
```

## Profile classification

**bugfix** (override documented in decision.md per SKILL override rule).

Reason: All 7 items are existing-feature corrections. The "feature" rule would classify by user-visible scope, but semantic check (existing-bug vs new-capability) wins per Round 1 retro lesson.

Per profile gating:
- Phase 0.25 PM Researcher → SKIPPED
- Phase 0.5 PM Manager → SKIPPED
- Phase 0.75 Planner → SKIPPED
- Phase 1 Architect → 1-paragraph plan
- Phase 3a Tester Review → 3 lens (Goal + QA + Security), skip Code + Context lens
- Phase 2.6 → bugfix = commit directly to main (no worktree)
- Phase 3c Playwright → UI changes trigger walkthrough

## Hard caps check

- feature ≤ 3: N/A (bugfix profile)
- bugfix ≤ 5: 5 in R43, 2 deferred to R44 ← AT CAP
- total ≤ 8: 5 ← UNDER CAP
- polish quota ≤ 1: 0
- architecture ≤ 1: 0

## Stop protocol

- 0 candidates → write planner-blocked.md + STOP: NOT TRIGGERED (5 candidates)
- All candidates capped → defer list: APPLIED (5 in R43, 2 in R44)

## Hand-off to Phase 1 Architect

**Inherited scope (verbatim, 5 items in R43)**:
1. range-banner empty-state + position fix
2. CONversation mark-as-duplicated → drawer update
3. Settings icon + overflow
4. previously discussed z-index
5. Default language = zh-CN

**Deferred to R44 (with hand-off list reference)**:
- #6 hide-whitespace perf + loading
- #7 COMMits panel folded/unfolded visual cue

Architect plan.md should reference this hand-off in a `## Deferred items (R44 carry-over)` section to prevent scope drift.
