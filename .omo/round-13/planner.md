# Planner plan — Round 13

## Pre-check

- Prior round (R12) SHAs verified: **PASS** — 9/9 SHAs `git cat-file -e` OK
  - `7accd8a` ✓ (R12 ★ Pinned findings)
  - `d241173` ✓ (R12 Emoji reactions)
  - `57b27ef` ✓ (R12 keyboard `n`/`p` nav)
  - `2b28ace` ✓ (R12 test bundle)
  - `fd446c2` ✓ (R12 docs)
  - `ab5248f` ✓ (R12 closure audit-trail)
  - `6e0e047` ✓ (R12 merge to main)
  - `22864bf` ✓ (R12 audit-drift fix)
  - `1b0da21` ✓ (R11 closure main HEAD, R12 rollup base)
- R13 prep SHAs verified: **PASS**
  - `657a064` ✓ (R12 retro patch — 14 gap fixes)
  - `5cc6cc2` ✓ (v5.3 baseline + .opencode/command/.cortexkit gitignore)
- If FAIL → STOP protocol triggered, see `planner-blocked.md` (NOT triggered — all SHAs present)
- R3 fabrication defense: **PASS** — no fabricated SHAs, all 11 verified via `git cat-file -e` on the actual local repo.

## Inputs summary

- Validated candidates (PM Manager APPROVE): **6** (all fresh, NOT in R12 deferred bundle)
  - #20 ★ Resolve-with-reason modal (4.5/5, ~105-160 LOC, 2 files)
  - #21 Mark as wontfix / out-of-scope (4/5, ~95-150 LOC, 2 files)
  - #22 ★ In-diff search (4.5/5, ~105-160 LOC, 1-2 files)
  - #23 Sort findings (3.5/5, ~60-100 LOC, 2 files)
  - #24 Draft auto-save indicator (3/5, ~45-75 LOC, 1 file)
  - #25 Filter Previously-discussed by round (3/5, ~55-85 LOC, 1-2 files)
- Opened issues (this round, GH): **#20, #21, #22, #23, #24, #25** (all labeled `pm-manager-approved,round-13`)
- Aged stale candidates (aged_rounds ≥ 3) **IN validated list**: **0**
- Aged carry-forwards (user-excluded per R13 hint "自主决策" + R10/R11/R12 rejection history):
  - #12 Bulk actions (aged=4, architecture-multi-select, complex)
  - #13 Live file-watcher (aged=4, architecture, chokidar ~250KB new dep)
- PM Researcher verdict: **OK** (17 verified / 0 unverified / 0 mischaracterized; 3 partial-verified with alternate mirrors compensating, e.g. `secure.phabricator.com` + `phacility/phabricator` source for Anubis-blocked Phorge canonical URL)
- Profile decision (lead-decided, cross-checked): **feature profile** — all 6 candidates U_user_visible=yes, U_new_capability=yes, U_installs_new_dep=no. Rule 2 fires (U_user_visible + total≥3). Rule 1 does NOT fire (no U_behavior_shift / U_data_shape_breaking bundle-wide, no U_installs_new_dep).
- Per-profile Dev timeout: 30 min/candidate (feature profile, R9 retro Gap L applied)
- Hard-caps reminder: feature ≤ 3, bugfix ≤ 5, total ≤ 8, polish ≤ 1, architecture ≤ 1
- **R13 critical**: all 6 candidates are `feature` profile → Planner MUST select ≤3. Total ~465-730 LOC if all 6 shipped; 3-feature bundle ~260-470 LOC, matching R12's 3-feature density.

## Ranking

**Composite formula** (R12 applied, reused):
`composite = (user_value × 1.5) + (diff_score × 1.0) + (strategic × 1.0) + (cost_inverse × 0.5)`

where:
- `diff_score`: closing-gap = 1.5 (all 6 candidates per PM Researcher: Phabricator + GitLab + Jira + Linear + Google Docs + Notion + VS Code + Figma + diff.nvim + Gerrit + GitHub PR + Review Board)
- `strategic`: 2 = high (recurring reviewer / accountability / power-user), 1.5 = medium (reviewer-pace / dashboard utility), 1 = low (single-purpose polish)
- `cost_inverse`: 1 file = 3.5, 1-2 files = 3, 2 files = 2.5

Normalization: raw / (max_raw + 1) × 10 = composite (/10 scale). divisor = 12.75, factor = 10/12.75 ≈ 0.784.

| Rank | ID | Title | Type | User-value | Diff | Strategic | Cost (files) | Raw | Composite /10 | Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | candidate_3_in_diff_search | ★ In-diff search (#22) | feature | 4.5/5 | 1.5 | high — power-user nav (2) | 1-2 → 3 | **11.75** | **9.2** | Highest raw composite: ties #20 on user-value, cheaper cost, equal strategic. Closes diff.nvim + Gerrit + GitHub PR file-finder gap with biggest pain at 50-file reviews. Pure client-side, reuses R12 `n`/`p` nav at `src/ui/app.ts:347-470`. |
| 2 | candidate_1_resolve_with_reason | ★ Resolve-with-reason (#20) | feature | 4.5/5 | 1.5 | very-high — accountability workflow (2) | 2 → 2.5 | **11.5** | **9.0** | Ties #22 on user-value, slightly higher cost (agent prompt ~10 LOC append), beats #22 on accountability workflow weight (closing-the-accountability-gap-with-FR asymmetry: R9 Force-Reopen added input, R13 Resolve mirrors). Closes Phabricator + GitLab + Jira "Resolve with reason" gap. |
| 3 | candidate_2_mark_as_wontfix | Mark wontfix (#21) | feature | 4/5 | 1.5 | high — workflow completeness (2) | 2 → 2.5 | **10.75** | **8.4** | Third-highest user-value; schema-touching (3→4 enum widening) without install-new-dep. Closes Phabricator + Jira + Linear "Won't Fix" gap distinct from plain Resolve. PM Researcher offset by 0.5 from lead-precompute normalized 8.6 due to divisor discrepancy (lead used 12.5 vs canonical 12.75); rank unchanged. |
| 4 | candidate_4_sort_findings | Sort findings (#23) | feature | 3.5/5 | 1.5 | medium — review prioritization (1.5) | 2 → 2.5 | **9.5** | **7.5** | Lower user-value (filter chips partially substitute per R12 retro evidence), lighter scope. localStorage-persisted sort dropdown. **Excluded** for R14 — leaves reviewer-pace optimizers for next round. |
| 5 | candidate_6_filter_previously_by_round | Filter Previously by round (#25) | feature | 3/5 | 1.5 | medium — round-level workflow (1.5) | 1-2 → 3 | **9.0** | **7.1** | Lowest user-value in top half. localStorage-persisted round dropdown. Real need only at 3+ rounds. **Excluded** for R14. |
| 6 | candidate_5_draft_autosave_indicator | Draft auto-save indicator (#24) | feature | 3/5 | 1.5 | low — single-purpose polish (1) | 1 → 3.5 | **8.75** | **6.9** | Lightest possible scope (~45-75 LOC) but lowest strategic in this pool. Closing Google Docs + Notion + VS Code Modified-dot pattern. **Excluded** for R14 (UX polish safely deferrable; ROUND 14 brief may re-prioritize). |

### Composite math (explicit)

| # | user_value × 1.5 | diff × 1.0 | strategic × 1.0 | cost_inv × 0.5 | raw | composite /10 |
|---|---|---|---|---|---|---|
| #22 In-diff search | 4.5 × 1.5 = 6.75 | 1.5 × 1.0 = 1.5 | 2 × 1.0 = 2.0 | 3 × 0.5 = 1.5 | **11.75** | **9.22** |
| #20 Resolve-with-reason | 4.5 × 1.5 = 6.75 | 1.5 × 1.0 = 1.5 | 2 × 1.0 = 2.0 | 2.5 × 0.5 = 1.25 | **11.5** | **9.02** |
| #21 Mark as wontfix | 4.0 × 1.5 = 6.0 | 1.5 × 1.0 = 1.5 | 2 × 1.0 = 2.0 | 2.5 × 0.5 = 1.25 | **10.75** | **8.43** |
| #23 Sort findings | 3.5 × 1.5 = 5.25 | 1.5 × 1.0 = 1.5 | 1.5 × 1.0 = 1.5 | 2.5 × 0.5 = 1.25 | **9.5** | **7.45** |
| #25 Filter by round | 3.0 × 1.5 = 4.5 | 1.5 × 1.0 = 1.5 | 1.5 × 1.0 = 1.5 | 3 × 0.5 = 1.5 | **9.0** | **7.06** |
| #24 Auto-save indicator | 3.0 × 1.5 = 4.5 | 1.5 × 1.0 = 1.5 | 1 × 1.0 = 1.0 | 3.5 × 0.5 = 1.75 | **8.75** | **6.86** |

Normalization: divisor = (max_raw + 1) = 12.75, factor = 10/12.75 ≈ 0.7843.

### Lead expectation cross-check

Lead pre-computed top-3: **#22 In-diff search (9.4) > #20 Resolve-with-reason (9.2) > #21 Mark wontfix (8.6)** with normalized divisor 12.5 instead of canonical 12.75. Ranking order unchanged; my normalized scores are slightly tighter (0.8-1.0 spread vs lead's 0.6 spread). **Adopt lead's top-3 ordering** since the methodology discrepancy is normalization-only and raw composite is identical.

### Tie-breaker (M-034)

Not triggered — composite scores (9.22, 9.02, 8.43) are cleanly separated (Δ ≥ 0.4). All 6 candidates have aged_rounds=0, so age tie-breaker doesn't apply. All 6 are closing-gap (diff=1.5), so diff tie-breaker doesn't apply.

## Scope selected

```yaml
scope:
  feature_count: 3
  bugfix_count: 0
  total: 3
  profile: feature
  per_profile_dev_timeout_min: 30
  candidates:
    - id: candidate_3_in_diff_search
      issue: "#22"
      type: feature
      title: "★ In-diff search (Ctrl+F or `/` key to search across all loaded diff hunks)"
      file_count: 1-2
      est_loc: "105-160"
      pm_manager_verdict: APPROVE
      product_value_gate: PASS (3/3)
      file_line_targets:
        - "src/ui/app.ts:3112 (renderDiffPanel — diff body render hook)"
        - "src/ui/app.ts:347-470 (R12 n/p nav pattern — reusable focus-guard for Cmd+F suppression)"
      notes: |
        Pure client-side. preventDefault() the browser's native Cmd+F / Ctrl+F (capture-phase listener so it doesn't reach the browser default), then run a body-level text search across all rendered diff hunks with a match counter ("3 / 17 matches" status) plus a small inline summary panel next to the diff area. Wire `/` to open the same panel when focus is outside any comment textarea (mirrors R12 n/p textarea guard). When a single match is visible, auto-scroll to it and reuse the R11 `flashFindingPermaHighlight` 1.5s highlight; jump-to-next-match on Enter / next-match, Shift+Enter for prev. Persist last-search-query in sessionStorage (NOT localStorage — diff content is round-scoped).

    - id: candidate_1_resolve_with_reason
      issue: "#20"
      type: feature
      title: "★ Resolve-with-reason modal (mirror R9 Force-Reopen pattern, but for resolve)"
      file_count: 2
      est_loc: "105-160"
      pm_manager_verdict: APPROVE
      product_value_gate: PASS (3/3)
      file_line_targets:
        - "src/ui/app.ts:1120 (showReopenReasonModal — R9 pattern to mirror)"
        - "src/ui/app.ts:3252 (async function resolveFinding — replace with modal-prompt first)"
        - "src/index.ts:1798 (POST /api/review/.../resolve endpoint)"
        - "src/index.ts:50 (Finding type — additive optional resolve_reason + manually_resolved)"
        - "src/index.ts:1497-1511 (R9 manually_reopened agent-prompt pattern to mirror)"
      notes: |
        Asymmetric reuse of R9 Force-Reopen: same modal shape (textarea + Cancel/Confirm buttons + Cmd+Enter submit), different verb + reason category dropdown (resolved|wontfix|false_positive|duplicate — share string union with #21). On submit: POST reason to /resolve endpoint, set `manually_resolved: true` + `resolve_reason: text` + `resolve_kind` on the Finding. Server keeps additive-only contract — old clients still resolve without reason (passes audit guard). Agent prompt ~10 LOC append at the existing `manually_reopened` block: when a finding is `manually_resolved`, agent's auto-apply loop skips it permanently (mirrors R9 reopen semantics).

    - id: candidate_2_mark_as_wontfix
      issue: "#21"
      type: feature
      title: "Mark finding as wontfix / out-of-scope (distinct from plain Resolve)"
      file_count: 2
      est_loc: "95-150"
      pm_manager_verdict: APPROVE
      product_value_gate: PASS (3/3)
      file_line_targets:
        - "src/index.ts:50 (Finding type — schema-touching: add resolution_kind enum)"
        - "src/ui/app.ts:3252 (resolveFinding — extend with kind dropdown before submit)"
        - "src/index.ts:1798 (POST /api/review/.../resolve — enum validation 400 on unknown kind)"
      notes: |
        Schema-touching: adds `resolution_kind?: "wontfix" | "out_of_scope" | "false_positive" | "duplicate"` to Finding. Server validates against the closed enum (400 on unknown — mirrors R12 Emoji Whitelist server-side guard at `src/index.ts` ~1140). UI: Resolve button gets a small "▾" disclosure next to it; clicking the disclosure opens a 4-option kind picker; plain click on the button still does plain resolve. Distinct from #20 because #20 attaches a free-text reason + accountability comment thread, while #21 stamps a typed enum that the agent prompt + filter UI can introspect.
  excluded_for_R14:
    - id: candidate_4_sort_findings
      issue: "#23"
      reason: "Lower user-value; filter chips partially substitute (R12 retro evidence)"
    - id: candidate_5_draft_autosave_indicator
      issue: "#24"
      reason: "Lowest strategic — UX polish safely deferrable"
    - id: candidate_6_filter_previously_by_round
      issue: "#25"
      reason: "Real need only at 3+ rounds; rolls up well with R14 candidate if needed"
  total_est_loc: "305-470 across 5-6 files"
  cap_compliance: "feature ≤ 3 ✓ (exact), bugfix ≤ 5 ✓ (0), total ≤ 8 ✓ (3), polish ≤ 1 ✓ (0), architecture ≤ 1 ✓ (0)"
```

## Decision rationale

**Picks #22 + #20 + #21** — top-3 by composite score (11.75, 11.5, 10.75), cleanly separated, all gate-pass, all additive (no install-new-dep, no breaking schema contract — even #21's enum widening is backwards-compatible because the field is optional and server validates the closed enum). The three picks form a coherent **accountability + navigation bundle**: #20 + #21 ship the resolve-side workflow (text reason + enum kind), #22 ships the navigation/lookup side. All 3 are closing-gap against well-documented competitor features (Phabricator + GitLab + Jira + Linear + diff.nvim + Gerrit + GitHub PR), PM Researcher confirms 17/17 verified claims. All 3 reuse existing patterns (R9 `manually_reopened` for #20, R11 `flashFindingPermaHighlight` for #22, R12 Emoji Whitelist enum validation for #21), so dev time should fit the 30-min/candidate per-profile timeout.

**Excluded #23 Sort findings, #25 Filter by round, #24 Auto-save indicator** — all bottom-3 by composite. #23 and #25 are dashboard utility (lower user-value); #24 is single-purpose UX polish (lowest strategic). All three are well-scoped for R14 PM Triage to re-pick without carry-over concerns (none are aged_stale in the brief; they're just deferred by composite ranking, not by user rejection).

**No cap deviation**: 3 features exactly hits feature ≤ 3 cap with 0 headroom (matches R12 density pattern of "scope exactly at feature cap, ship clean"). Per-profile decision: feature profile → 30 min Dev timeout per R9 retro Gap L applied. R12 retro Gap 3 (doc-side-file drift) lesson embedded in Phase 2 Dev prompt — Dev must `wc -l` source-of-truth before claiming any count.

**R3 fabrication defense**: PM Manager already verified 14/14 SHAs via `git cat-file -e`; I re-verified 11 relevant SHAs (R12 closure + R13 prep) — all PASS, zero fabricated. R3 lesson applied: I'm NOT consuming R11/R12 audit-trail claims without re-verifying against source-of-truth.

**PM Researcher advisory**: 0 mischaracterized claims; 3 partial-verified (Phorge canonical Anubis-blocked; Atlassian Jira doc URL 404'd; Linear issues URL 404'd; Gerrit Ctrl+F attribution imprecise) — all mitigated by alternate mirrors (`secure.phabricator.com` + `phacility/phabricator` source; `confluence.atlassian.com/cloudkb/...` Resolution field; `linear.app/docs/workflows` + `linear.app/docs/display-options`; explicit `"Gerrit's top-nav input box provides cross-file operator search, distinct from browser Cmd+F"` accurate framing). Planner risk register honors these without rework.

## Escalation

[ ] None — proceed to Phase 1 Architect

## Fresh signal (R3 lesson)

[ ] Not needed — **0** candidates in validated list are STALE (aged_rounds ≥ 3). All 6 R13 candidates are FRESH from this round's PM Triage vs. R12 carry-overs. R12 brief's 4 deferred candidates (Cmd+P file jumper, Cmd+/ help overlay, submit confirm modal, comments audit trail) are NOT in R13 brief per `fresh_candidates_only=true`; they remain on the open-issue table for R14 if user re-picks. User-rejected carry-forwards #12 + #13 (aged=4) correctly excluded per R12 retro "stale-bundle-rule" + user's R13 "自主决策" hint.

## Notes for next subagent (Phase 1 Architect)

- **#20 Resolve-with-reason**: must mirror R9 Force-Reopen pattern at `app.ts:1120` exactly (same modal shape, same agent-prompt append block at `index.ts:1497-1511`). `resolve_kind` enum string union shared with #21 — define ONCE in a shared TS module or `src/constants.ts` to avoid divergent string typos.
- **#21 Mark wontfix**: schema-touching — additive optional `resolution_kind` enum; closed enum validation mirrors R12 Emoji Whitelist. Share enum definition with #20.
- **#22 In-diff search**: pure client-side; capture-phase `Cmd+F`/`Ctrl+F` listener must `preventDefault()` BEFORE the browser default fires (capture phase on `window` or `document`). Reuse R12 n/p nav textarea guard for `/` key. Match counter format: "3 / 17" with prev/next buttons. Search scope: VISIBLE diff hunks only (folded regions excluded from search results — clicking expand reveals them then re-scopes). SessionStorage persists last-query across same-round reloads only (NOT localStorage — diff content is round-scoped).
- **Cross-candidate dependency**: #20 + #21 share `resolve_kind` enum → if either is dropped, the other still works (each defines its own acceptable subset). Phase 1 Architect should consider extracting `resolve_kind` to `src/constants.ts` upfront to avoid duplication.
- **R12 retro Gap 3 / SG.1 application**: Architect's plan.md MUST `wc -l scripts/test-review-ui/scenarios.mjs` to confirm scenario count before claiming any "tests added" number (R12 retro captured R5 Gap 3 regression where plan.md said `31/31` but actual was 30). Dev must do the same before committing.

(End of file - total 173 lines)
