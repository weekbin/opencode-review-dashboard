# Planner plan — Round 10

> **Date**: 2026-06-29
> **Author**: Round 10 Planner v5 (fresh deep subagent)
> **Profile**: mixed (1 architecture + 2 feature)
> **Verdict**: PROCEED

## Pre-check

- **Prior round (R9) SHAs verified**: PASS
  - Real git SHAs found in `.omo/round-9/decision.md`:
    - `db92b37` ✓ (manually_reopened flag + server guard widening + agent prompt)
    - `d5bbafc` ✓ (Force Reopen button on stale findings + reason modal)
    - `785e2b2` ✓ (unit tests + e2e scenario + mock-server fix + Playwright walkthrough)
  - Regex artifacts ignored (NOT real SHAs):
    - `61f52cb6` → background task ID (`bg_61f52cb6`), not a commit SHA
    - `feedbac` → substring of the English word "feedback" in AC9-1.10 row
  - R10 baseline `b616c8a` ✓ (current main HEAD per `.omo/round-10/sync-report.md`)
- **STOP protocol**: not triggered.

## Inputs summary

- **Validated candidates**: 5 (PM Manager APPROVE, all 5 PASS pseudo-requirement screen + product-value gate)
- **Opened GH issues (this round)**: [10, 11, 12, 13, 14]
  - #10 Saved Replies / Comment Templates (Candidate #1)
  - #11 Edit a finding's category / severity / comment in-place (Candidate #2)
  - #12 Bulk actions (multi-select + bulk resolve / bulk reopen) (Candidate #5)
  - #13 Live file-watcher auto-reload of the diff while reviewing (Candidate #3)
  - #14 Export review as markdown / patch download (Candidate #4)
- **Aged stale candidates (aged_rounds ≥ 3)** in `.omo/proposals.jsonl` follow_up backlog (NOT in R10 validated list — informational only):
  - R1 #3 "Reopen anchor end_line" (aged 9, first appeared R1 follow_up)
  - R1 #4 "E2E coverage gap" (aged 9, first appeared R1 follow_up)
  - R1 #5 "take-screenshots.mjs dead code" (aged 9, first appeared R1 follow_up)
  - R5 follow_up "R6: investigate 3c subagent stall root cause" (aged 5, first appeared R5 follow_up)
  - 4 STALE total — but **0 STALE in R10 validated list**, so fresh signal is NOT triggered.

## Ranking

Composite scoring formula (4 inputs, max ~20):
**composite = (user_value × 2) + strategic_value + competitive_diff + (5 − cost)**
where cost = 1·files + 1·dep_impact.

| Rank | ID | Title | Type | User-value | Comp diff | Files | Dep | Strategic | Composite | Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | #11 | Edit a finding in-place | **architecture** | 4/5 | plausible-unique | 3 | 0 | high (extends R9 server-widening pattern) | **16** | Server widening mirrors R9 reopen; plausible-unique (GitHub immutable); high reviewer-agency fit. |
| 2 | #10 | Saved Replies | feature | 4/5 | closing-gap (GitHub Saved Replies) | 2 | 0 | high (every reviewer ≥5 boilerplate re-uses/round) | **15** | PM-recommended R10 candidate; localStorage-only; no schema/agent-prompt/dep impact. |
| 3 | #12 | Bulk actions | architecture | 4/5 | closing-gap (Phabricator batch-edit) | 3 | 0 | medium (saves clicks, less sticky) | **13** | Closes parity gap but lower uniqueness than #11; conflicts with #11 on arch-budget. |
| 4 | #14 | Export review as markdown / patch | feature | 3/5 | closing-gap (GitHub `.patch`/`.diff` URL) | 2 | 0 | medium (occasional share use) | **12** | Read-only, no schema change; lowest cost among features (100 LOC, 2 files). |
| 5 | #13 | Live file-watcher | feature-or-arch | 3/5 | plausible-unique (no browser-tab reviewer offers this) | 3 | +1 (chokidar ~250KB) | medium (opencode-specific dev-loop aid) | **12** | New dep + 250KB footprint = defer-friendly; loses tie-breaker to #14 on cost. |

### Tie-breaker applied

- **#14 vs #13** (both composite 12): deterministic tie-breaker favors #14 because:
  1. Both aged_rounds = 0 (tie)
  2. Both user_value = 3 (tie)
  3. **#14 est_loc = ~100 vs #13 est_loc = ~200** → #14 wins
  4. #14 has 0 new deps vs #13 introduces `chokidar` → #14 wins
  5. #14 pairs naturally with #10 (both feature-profile, both no agent-prompt risk)

## Scope selected

```yaml
scope:
  feature_count: 2
  bugfix_count: 0
  total: 3
  profile: mixed  # 1 architecture + 2 feature
  candidates:
    - id: "#10"
      issue: 10
      type: feature
      title: "Saved Replies / Comment Templates"
      file_count: 2
      est_loc: "~150"
      files: ["src/ui/app.ts", "src/ui/review.html"]
      risk: LOW (localStorage-only, no schema change, no agent-prompt)
    - id: "#14"
      issue: 14
      type: feature
      title: "Export review as markdown / patch download"
      file_count: 2
      est_loc: "~100"
      files: ["src/index.ts", "src/ui/app.ts"]
      risk: LOW (read-only, no schema change, no agent-prompt)
    - id: "#11"
      issue: 11
      type: architecture
      title: "Edit a finding's category / severity / comment in-place"
      file_count: 3
      est_loc: "~200"
      files: ["src/index.ts", "src/ui/app.ts", "src/ui/review.html"]
      risk: MEDIUM (new PATCH endpoint mutates Finding fields; agent-prompt may need minor notice re: editability but no contract change)
```

**Hard-cap audit**:
- feature_count: 2 ≤ 3 ✓
- bugfix_count: 0 ≤ 5 ✓
- total: 3 ≤ 8 ✓
- architecture_count: 1 ≤ 1 ✓ (cannot add #12)
- polish_quota: 0 ≤ 1 ✓ (none are polish — all PASS all 3 product-value gate tests)
- total est_loc: ~450 (under 600 LOC informal ceiling from R5)

## Decision rationale

**Selection logic.** Three candidates ship. The hard cap `architecture ≤ 1` forces a single-arch choice between #2/#11 (Edit in-place) and #5/#12 (Bulk actions); #11 wins by composite (16 vs 13), by strategic alignment with R9's `manually_reopened` server-widening pattern (lead already familiar with the diff, lower Domain-Expertise cost despite ~200 LOC est), and by competitive differentiation (plausible-unique vs closing-gap). After reserving the arch slot for #11, two features remain available from {#1, #3, #4}. #1 (Saved Replies, composite 15) is the headline — localStorage-only, no schema change, no agent-prompt risk, recurring reviewer use (5+ boilerplate re-uses per review). #4 (Export review, composite 12) wins the head-to-head over #3 (Live file-watcher) via tie-breaker on cost (#4 ~100 LOC vs #3 ~200) and on dependency footprint (#3 introduces `chokidar` ~250KB for a single use case that is nice-to-have, not blocking).

**Exclusion rationale (3 deferred)**:
- **#12 Bulk actions (composite 13)** — deferred: arch-budget conflict with #11 (hard cap), and the value-to-effort ratio is lower than #11. Re-consider R11 if #11 ships well and reviewers actually hit the "I need to resolve 6 findings at once" friction.
- **#3 Live file-watcher (composite 12)** — deferred: introduces new dep (`chokidar`) for a feature that the README already documents as "diff range with cross-round drift banner" handling the cross-round case. The next-round chokidar dependency should be a deliberate decision, not a side-effect of R10.
- **#2 (R9 backlog seed) and #3 (R9 backlog seed)** are technically re-appearing — #11 already covers the R9 backlog seed "Edit in-place"; the R9 backlog seed "Export state.json for debugging" is **not** in the R10 brief (R10's #4 is user-facing markdown/.patch export, not state.json dump — distinct feature). Re-evaluate in R11.

**Why mixed profile is acceptable.** Architecture profile max-1 cap was the binding constraint; mixing 1 architecture + 2 features does not violate any cap. R9 retro Gap L documented "architecture rounds naturally take 30–45 min" — the two features in scope (~250 LOC combined) are small and additive; lead should run architecture-first (#11 server endpoint) and pile features in parallel. The round is bounded enough that lead should consider raising Phase 2 timeout to 45 min for this round.

**No deviation from hard caps.**

## Escalation

- [x] None — proceed to Phase 1 Architect.

## Fresh signal (R3 lesson)

- [x] **Not needed** — R10 has 5 fresh PM-Triage-surfaced candidates (all aged_rounds = 0 or 1 — #11 is aged 1 because it was R9 PM Triage's carry-over seed, then rediscovered in R10 brief). The 4 STALE candidates in `.omo/proposals.jsonl` backlog are not blocking — backlog-freshness gate is honored for the validated list. Lead does NOT need to spawn `explore()` before Phase 1.

---

(End of planner — total LOC est ~450 / 7 files / 1 architecture + 2 feature. Verdict: PROCEED.)
