# Planner Input — Round 13

> Pre-synthesized by lead after Phase 0.5. Read this as your (Planner's) primary input.

## PM Manager Validated List (Phase 0.5)

| # | Title | Type | User-value | Issue# | File count | LOC est | Notes |
|---|---|---|---|---|---|---|---|
| 1 | ★ Resolve-with-reason modal (mirror R9 Force-Reopen, but for resolve) | feature | 4.5/5 | [#20](https://github.com/weekbin/opencode-review-dashboard/issues/20) | 2 | ~105-160 | Closes Phabricator + GitLab + Jira "Resolve with reason" gap; mirrors R9 Force-Reopen pattern asymmetrically. PM Triage top candidate. |
| 2 | Mark finding as wontfix / out-of-scope (distinct from plain Resolve) | feature | 4/5 | [#21](https://github.com/weekbin/opencode-review-dashboard/issues/21) | 2 | ~95-150 | Schema-touching: extends `Finding.status` enum (3→4 values) OR adds `resolution_kind` field. Closes Phabricator + Jira + Linear gap. |
| 3 | ★ In-diff search (Ctrl+F or `/` to search across all loaded diff hunks) | feature | 4.5/5 | [#22](https://github.com/weekbin/opencode-review-dashboard/issues/22) | 1-2 | ~105-160 | Closes diff.nvim + Gerrit cross-file + GitHub PR file-finder gap. Big power-user pain at 50-file reviews. |
| 4 | Sort findings by severity / file / created_at (review prioritization dropdown) | feature | 3.5/5 | [#23](https://github.com/weekbin/opencode-review-dashboard/issues/23) | 2 | ~60-100 | Closes GitHub + Phabricator + Linear sort gap. Lighter than filter scope. |
| 5 | Draft auto-save indicator (persistent "Saved X ago" in header, replaces intrusive toast) | feature | 3/5 | [#24](https://github.com/weekbin/opencode-review-dashboard/issues/24) | 1 | ~45-75 | Closes Google Docs + Notion + VS Code Modified-dot pattern. Lightest possible (UX polish). |
| 6 | Filter Previously-discussed tab by round number (round-level filter) | feature | 3/5 | [#25](https://github.com/weekbin/opencode-review-dashboard/issues/25) | 1-2 | ~55-85 | Closes GitHub PR "Hide older reviews" + GitLab MR activity filter gap. Real workflow need once session has 3+ rounds. |

**Total LOC estimate (full bundle, all 6)**: ~465-730 LOC across 11 files. **Exceeds feature ≤ 3 cap if all 6** (Plan MUST pick ≤3 per hard cap).

## PM Researcher verdict (Phase 0.25 — advisory)

`OK`: 17 verified claims / 0 unverified / 0 mischaracterized / 3 partial-verified.

Reason: All 6 R13 candidates pass Test 3 (竞争对手已具备) on v5 product-value gate. Phorge canonical URL `https://we.phorge.it/book/phorge/article/differential/` is Anubis-blocked (same as R11/R12 per brief's own footnote); mitigation: alternate mirrors (`secure.phabricator.com` + GitHub `phacility/phabricator` source) confirm features exist. 0 fabricated claims, 0 mischaracterized. Verbatim verifier feedback in `.omo/round-13/competitor-landscape.md`.

Notes for Planner risk register:
- Atlassian Jira URL `support.atlassian.com/jira-software-cloud/docs/...` 404'd — repo documents retired. Jira Resolution field still VERIFIED via `confluence.atlassian.com/cloudkb/best-practices-on-using-the-resolution-field-968660796.html`.
- Linear issues docs URL `linear.app/docs/issues` 404'd — Linear Canceled + Won't Fix status still VERIFIED via `linear.app/docs/workflows` + `linear.app/docs/display-options`.
- Gerrit "Ctrl+F" attribution in brief is imprecise (real Gerrit cross-file search is in top nav input box, browser Ctrl+F is browser built-in Find); underlying capability (cross-file operator search) VERIFIED.
- Brief's URL `vimhelp.org/quickfix.txt.html` documents `:vimgrep` + `:cn/`:cp`/`:cnext`/`:cN` — correctly captures diff cross-buffer navigation. MISCHARACTERIZED risk minimal.

## Follow_up Candidates (filtered, aged_rounds ≤ 3)

**None material for R13 scope.** The only carry-overs (#12 Bulk actions, #13 Live file-watcher) are user-rejected carry-forwards at aged_rounds=4 (violates user's stated bundle rule per R12 brief's own anti-patterns list). Both correctly excluded from this Planner's pool.

R12 retro follow-up items (M.1 extract `withFinding`, M.2 extract `EMOJI_WHITELIST`) are code-refactor items, NOT candidates for fresh PM Triage next round — would be classified as `bugfix` profile if re-surfaced.

R12 brief's 4 deferred candidates (Cmd+P file jumper, Cmd+/ help overlay, submit confirm modal, comments audit trail) are NOT in R13 brief per `fresh_candidates_only=true` — surfaced separately in R14 if user wants.

## Prior Round Summary (R12 — for context)

- **brief.md**: 7 candidates surfaced; ★1 Pinned + #17 + ★2 Reactions + #18 + ★3 Keyboard n/p + #19 shipped.
- **pm-manager-review.md**: APPROVE all 3.
- **planner.md**: feature_count=3, total=3, profile=feature. (R12 scoped exactly at feature ≤ 3 cap.)
- **decision.md**: SHIP verdict, 8 commits landed, audit-drift caught + fixed in `22864bf`.
- **rollup base SHA**: `1b0da21` (R11 closure main HEAD pre-R12).
- **R12 product SHAs**: `7accd8a` (pinned), `d241173` (reactions), `57b27ef` (keyboard-nav), `2b28ace` (test), `fd446c2` (docs), `ab5248f` (closure), `6e0e047` (merge), `22864bf` (drift fix).
- **R12 audit SHA**: `ab5248f` (closure audit trail) — verified by lead.
- **R13 prep SHAs**: `657a064` (skill patch — 14 gap fixes), `5cc6cc2` (description bump + .opencode/command/.cortexkit gitignore).
- **v5.3 baseline SHA**: `5cc6cc2` — verified by lead.
- **Test deltas from R11 → R12**: unit 135→185 (+50 new), e2e 25→30 (+6 R12 added, drift-fix re-baselined actual count).

## Hard Caps Reminder (v5.2)

- feature ≤ 3
- bugfix ≤ 5
- total ≤ 8
- polish quota ≤ 1
- architecture ≤ 1
- mixed-mode warning: if scope mixes architecture + bugfix → log warning, suggest split

**R13 critical**: all 6 candidates are `feature` profile. Planner MUST select ≤3. With ~465-730 LOC for all 6, even 3-feature bundle is heavy (~230-360 LOC, matching R12's 3-feature density ~360 LOC).

## Profile decision (lead-decided, available for Planner cross-check)

- **PM Triage U_* signals aggregated**:
  - U_size: aggregate medium (3-6 per candidate × 3 candidates = 9-18) → 2
  - U_files: aggregate medium (4-6 per candidate × 3 candidates = 12-18) → 3
  - U_new_capability: yes × 3 → 2 (per picked candidate; weight = per-feature)
  - U_behavior_shift: no × all 3 → 0
  - U_user_visible: yes × all 3 → 2
  - U_data_shape_breaking: 1 candidate (#2 mark-wontfix) touches enum widening → mixed. With 1/3 yes → 1
  - U_data_safety: no × all → 0
  - U_installs_new_dep: no × all → 0
  - **Per-candidate total**: each 7-9 range (feature threshold = 3 minimum)
- **Auto-classification**: Rule 2 fires (U_user_visible=yes AND total≥3 per picked candidate). Rule 1 doesn't fire (no U_behavior_shift, no U_data_shape_breaking across full bundle, no U_installs_new_dep).
- Per-profile Dev timeout: 30 min (feature profile, R9 retro Gap L applied)
- **Per-candidate density observation**: candidates #2 (schema-touching) + #3 (cross-file UI) are higher-density; #5 (lightest possible) compensates.

## Lead expectation

Planner should:

1. Pre-check pass the prior-round SHAs (R4 fabrication defense — REUSE PM Triage's verification).
2. Run backlog freshness check — confirm 3 user-picked candidates are FRESH (not in R12 deferred bundle #4-#7).
3. Rank the candidates by composite formula. Per R12 applied formula `composite = (user_value × 1.5) + (diff_score × 1.0) + (strategic × 1.0) + (cost_inverse × 0.5)`:
   - All 6 candidates are closing-gap (diff = 1.5 each)
   - user-value × 1.5: 4.5/5/4/4.5/3/3 = 6.75/6/6.75/5.25/4.5/4.5
   - strategic (all closing-critical-accountability/navigation, high=2): 2/2/2/1.5/1/1.5
   - cost_inverse (1-2=3, 2-3=2.5, 1=3.5): 2.5/2.5/3/3/3.5/3
   - Raw composite: 1:6.75+1.5+2+1.25=11.5 / 2:6+1.5+2+1.25=10.75 / 3:6.75+1.5+2+1.5=11.75 / 4:5.25+1.5+1.5+1.5=9.75 / 5:4.5+1.5+1+1.75=8.75 / 6:4.5+1.5+1.5+1.5=9.0
   - Normalized (×10/12.5=0.8 of max+1): 1:9.2 / 2:8.6 / 3:9.4 / 4:7.8 / 5:7.0 / 6:7.2
4. Confirm scope = exactly 3 candidates (≤3 cap, no deviation). Suggested top-3 by composite: **#3 ★ In-diff search (9.4) > #1 ★ Resolve-with-reason (9.2) > #2 Mark wontfix (8.6)** (Lead's preference — but Planner may deviate with reason).
5. Write `.omo/round-13/planner.md` with canonical v5 schema (Title, Pre-check, Inputs summary, Ranking table, Scope selected YAML with 3 candidates, Decision rationale, Escalation, Fresh signal).
6. Return: `{ verdict: "PROCEED", scope: {...}, rationale: "...", fresh_signal_triggered: false, planner_md_path: ".omo/round-13/planner.md" }`.
