# Planner Input — Round 12

> Pre-synthesized by lead after Phase 0.5. Read this as your (Planner's) primary input.

## PM Manager Validated List (Phase 0.5 — APPROVE)

| # | Title | Type | User-value | Issue# | File count | LOC est | Notes |
|---|---|---|---|---|---|---|---|
| 1 | ★ Pinned findings（mark to revisit after agent auto-applies） | feature | 4.5/5 | [#17](https://github.com/weekbin/opencode-review-dashboard/issues/17) | 2-3 | ~110-170 | Closes Phabricator Star + GitLab Save-for-later gap (citation issues per PM Researcher, see below) |
| 2 | Reactions on findings（👍 👎 😄 ❤️ 🎉 👀 emoji feedback） | feature | 4/5 | [#18](https://github.com/weekbin/opencode-review-dashboard/issues/18) | 2-3 | ~130-200 | Closes GitHub reactions + Slack reactions gap |
| 3 | Keyboard nav `n`/`p`（jump to next/prev finding with flash highlight） | feature | 3.5/5 | [#19](https://github.com/weekbin/opencode-review-dashboard/issues/19) | 1-2 | ~70-110 | Closes GitHub `Cmd+]`/`Cmd+[` + vim diff `]c`/`[c` gap (note: vim diff nav is `]c`/`[c`, not `n`/`N` — Architect must use correct key semantics) |

**Total LOC estimate (feature bundle)**: ~310-480 LOC across 3 features

## PM Researcher verdict (Phase 0.25 — advisory only)

`REVIEW_NEEDED`: 2 verified / 5 unverified / 4 mischaracterized
Reason: All 3 candidates have at least one mischaracterized or unverified external-product claim (broken GitHub doc URLs 404, Phabricator starred revisions not in canonical guide, GitLab "Save for later" conflated with Snooze to-do items, vimdiff `n`/`N` conflated with search).

**Important context**: Underlying feature gaps are real (3-test gate passes for all 3 candidates). PM Manager APPROVED on its own gate (zero DUPLICATE/SPECULATION/CONTRADICTION markers, no schema break, all additive). Researcher findings are **citation-level** cleanup, NOT feature rejection.

**Planner direction**: proceed with all 3 candidates. Document the citation-quality advisory in your risk register; Architect can use correct key semantics (vim `]c`/`[c`, not `n`/`N`) and correct citation sources when writing plan/AC.

## Follow_up Candidates (filtered, aged_rounds ≤ 3)

None (the 3 user-picked candidates are all NEW; the existing carry-over items are user-excluded for R12):

- GH #12 Bulk actions (architecture, R10 carry-over, aged_rounds=2) — **USER EXPLICITLY REJECTED for R12**: "我需要 PM 给我讲用户故事，多提一点需求出来，现在这些我都不是很想做"
- GH #13 Live file-watcher (architecture, R10 carry-over, aged_rounds=2, chokidar dep ~250KB) — **USER EXPLICITLY REJECTED for R12** (same)
- "R11 PM Researcher mischaracterization corrections in README" — **USER REJECTED for R12** (re-classified as: address within R12 risk register, not a standalone candidate)

Do NOT include any of these in R12 scope. Carry them to follow_up for R13+ if user re-picks.

## Prior Round Summary (R11)

- **brief.md** (R11): Saved Replies `/trigger` keyboard shortcut + Per-finding permalink anchor (`#finding-<id>` + Copy-link button)
- **pm-manager-review.md** verdict: APPROVE (validated #15, #16)
- **planner.md** scope: feature_count=2, total=2, profile=feature (LIGHTWEIGHT)
- **decision.md** verdict: PASS, final_outcome=PASS
- **rollup base SHA**: `1b0da21` (R11 closure main HEAD — verified by PM Triage + PM Manager pre-checks)
  - R11 product SHAs: `0fd2205`, `b533139`, `bbce9ca`, `7081e37` (all verified via `git cat-file -e`)
  - R11 audit SHA: `0c28a6c` (verified)
  - v5.3 baseline SHA: `f9ac43185187cca1140182d8b71f1edffd74ff60` (verified)

**Pre-check (your turn, Planner)**: re-run `git cat-file -e` on the above SHAs before consuming prior-round evidence. If any missing → write `planner-blocked.md` and return verdict STOP (R3 fabrication defense).

## Hard Caps Reminder (v5.2)

- feature ≤ 3
- bugfix ≤ 5
- total ≤ 8
- polish quota ≤ 1 per round
- architecture ≤ 1 per round
- R12 = 3 features → hits feature ≤ 3 cap exactly (0 headroom)

## Profile decision (lead-decided, available for Planner cross-check)

- **PM Triage U_* signals aggregated** (over the 3 candidates):
  - U_size: medium (3-6) → 1
  - U_files: medium (4-6) → 2
  - U_new_capability: yes × 3 → 2
  - U_behavior_shift: no → 0
  - U_user_visible: yes × 3 → 2
  - U_data_shape_breaking: no × 3 → 0
  - U_data_safety: no × 3 → 0
  - U_installs_new_dep: no × 3 → 0
  - **Total: ~7** (under architecture threshold of 8)
- **Auto-classification**: Rule 1 (architecture) doesn't fire (no U_behavior_shift / U_data_shape_breaking / U_installs_new_dep, total < 8). Rule 2 (feature) fires (U_user_visible=yes + total ≥ 3). → **profile = feature**
- **Per-profile Dev timeout** (R9 retro Gap L applied): 30 min (feature profile)

## Lead expectation

Planner should:
1. Pre-check pass the prior-round SHAs (R3 fabrication defense, REUSE PM Triage + PM Manager's verification)
2. Run backlog freshness check — confirm 3 user-picked candidates are FRESH (not aged), and the 3 carry-overs that ARE aged are user-excluded
3. Rank the 3 candidates: by user-value × estimated feature-cost, with tie-breaker on aged_rounds ASC → user_value DESC → est_loc ASC (all 3 fresh, so: Pinned (4.5, 110-170) > Reactions (4, 130-200) > Keyboard (3.5, 70-110))
4. Confirm scope = all 3 (feature_count=3, total=3, profile=feature), no deviation from caps needed
5. Write `.omo/round-12/planner.md` with the canonical v5 schema (Title, Pre-check, Inputs summary, Ranking table, Scope selected YAML, Decision rationale, Escalation, Fresh signal)
6. Return: `{ verdict: "PROCEED", scope: {...}, rationale: "...", fresh_signal_triggered: false, planner_md_path: ".omo/round-12/planner.md" }`
