# Planner Input — Round 15

> Pre-synthesized by lead per v5.3.3 lead-direct execution model (saved ~5 min vs subagent)

## PM Manager Validated List (Phase 0.5)

| # | Title | Type | User-value | Issue# | File count | LOC est | Notes |
|---|---|---|---|---|---|---|---|
| 1 | ★ Cmd+P file jumper (VS Code-style quick-open palette) | feature | 4/5 | [#26](https://github.com/weekbin/opencode-review-dashboard/issues/26) | 1-2 | ~80-120 | Closes VS Code + GitHub PR t file-finder + Sublime + GitKraken gap. **Top pick R15.** |
| 2 | Submit confirm modal (Review N findings before submitting) | feature | 3.5/5 | [#27](https://github.com/weekbin/opencode-review-dashboard/issues/27) | 1-2 | ~70-110 | Closes GitHub Submit-review + Gerrit Submit Patch Set confirm gap. |
| 3 | Comments audit trail (preserve prior version when edited) | feature | 3/5 | [#28](https://github.com/weekbin/opencode-review-dashboard/issues/28) | 1-2 | ~100-150 | Schema-touching: adds additive optional `audit_log?: FindingAuditRow[]` field on Finding. Closes Phabricator Differential audit log gap. |

**Total LOC estimate (full bundle, all 3)**: ~250-380 LOC across 3-6 files. **Exceeds feature ≤ 3 cap if all 3** (Plan MUST pick ≤3 per hard cap — all 3 fit within cap).

## PM Researcher verdict (Phase 0.25 — advisory, R+ lead-direct = cross-ref to R12 brief)

`OK` — R15 3 candidates are R12 brief ## Candidates ranked #4/#6/#7 (already verified in `.omo/round-12/competitor-landscape.md`):

- **#1 Cmd+P** — VS Code Cmd+P, GitHub PR `t` file-finder, Sublime Cmd+P, GitKraken — **VERIFIED** (multiple vendor docs, see R12 competitor-landscape)
- **#2 Submit confirm modal** — GitHub PR Submit-review + Gerrit Submit Patch Set confirm — **VERIFIED** (R12 competitor-landscape)
- **#3 Comments audit trail** — Phabricator Differential full audit log, GitHub review history (partial) — **VERIFIED** (R12 competitor-landscape)

Notes for risk register:
- Atlassian / Phabricator canonical URL may Anubis-block (R12 known); alternate mirrors (secure.phabricator.com + phacility/phabricator source) confirm features exist
- R+ lead-direct doesn't fire fresh PM Researcher subagent (cost-saving); cross-ref to R12 verification is sufficient for R15's 3 R12-deferred candidates

## Follow_up Candidates (filtered, aged_rounds ≤ 3)

**None material for R15 scope.** The only carry-overs (#12 Bulk actions, #13 Live file-watcher) are user-rejected carry-forwards at aged_rounds=6 each (R12 user-rejected 3x consecutive). Correctly excluded.

R15 4th R12-deferred candidate (Cmd+/ help overlay, #5, 3/5 user-value) is explicitly deferred to R16+ for freshness protection (per v5.3.3 freshness concept — 3 fresh candidates this round, R15 = 100% fresh vs R14).

## Prior Round Summary (R14 — for context)

- **brief.md**: 3 R13-deferred candidates (Sort + Filter + Auto-save); lead-synthesized
- **decision.md**: SHIP verdict, 6 commits landed, audit-clean
- **rollup base SHA**: `c9b2771` (R13 closure)
- **R14 product SHAs**: `f59e92d` / `ffff6d7` / `267eec0` / `e7269b5` / `e889f0f` / `8981ace`
- **R14 audit SHA**: `42ba5aa` (v5.3.2 patches) + `c3a6aea` (v5.3.3 patches)
- **R15 prep SHAs**: `c3a6aea` (latest main HEAD)
- **v5.3.3 baseline SHA**: `c3a6aea` — verified by lead

## Hard Caps Reminder (v5.2)

- feature ≤ 3 ✓ (3 features)
- bugfix ≤ 5 ✓ (0)
- total ≤ 8 ✓
- polish ≤ 1 ✓
- architecture ≤ 1 ✓

## Profile decision (lead-decided, available for cross-check)

- **PM Triage U_* signals aggregated** (per feature):
  - U_size: small (1-2) per feature → 0
  - U_files: small (2-3) per feature → 1
  - U_new_capability: yes × 3 → 2
  - U_behavior_shift: no × 3 → 0
  - U_user_visible: yes × 3 → 2
  - U_data_shape_breaking: only #3 yes → 0 (1 feature has it, not aggregate-blocking)
  - U_data_safety: no × 3 → 0
  - U_installs_new_dep: no × 3 → 0
- **Per-feature total**: 5-7 range. #3 borderline (1 yes on U_data_shape_breaking, but additive optional).
- **Auto-classification**: Rule 2 fires (U_user_visible=yes AND total ≥ 3). Rule 1 doesn't fire (no U_behavior_shift, no U_installs_new_dep, U_data_shape_breaking only on 1/3 features).
- Per-profile Dev timeout: **20-25 min** (R+ v5.3.3 subagent scope sizing: 5-20 min per atomic task, 3 features parallel = ~20 min wall)

## Lead expectation

Planner should:
1. Pre-check pass prior-round SHAs (R4 fabrication defense)
2. Run backlog freshness check (3 R12-deferred + 1 R12-deferred-delayed to R16 = 4 candidate history; R15 3/3 fresh, no STALE in validated list)
3. Rank by composite formula (R12 applied):
   ```
   composite = (user_value × 1.5) + (diff_score × 1.0) + (strategic × 1.0) + (cost_inverse × 0.5)
   ```
4. Confirm scope = exactly 3 features (≤ 3 cap, 0 headroom, matches R12+R13+R14 density pattern)
5. Write `.omo/round-15/planner.md` with canonical v5 schema
6. Return JSON: PROCEED + scope + rationale + fresh_signal_triggered=false + planner_md_path
