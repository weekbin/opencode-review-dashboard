# Phase 0 PM Triage — Round 33

**Date**: 2026-07-01
**Lead**: sisyphus (lead-direct, no subagent — per v5.3.3 model)

## Context

During this session, the user filed **8 GitHub issues (#65-#72)** as part of a /diff-review-dashboard review session. Each issue reports a separate bug or feature request. Round 33 consolidates these into a single polish round covering **4 quick wins** (within the ≤5 bugfix per round cap).

User's 8 feedback rounds captured in this session:
- **R1+R2**: Settings panel 3 bugs + i18n post-submit banner + CSS layout (#65, 6 sub-findings)
- **R3**: Port stability / localStorage (#66)
- **R4**: Conversation panel 4 UX issues (#67)
- **R5**: Submit dialog stat bug + previously-discussed tab layout (#68, #69)
- **R6**: Post-submit overlay CSS (#70)
- **R7**: Ignore-ws discoverability (#71)
- **R8**: Worktree branch copy enhancement (#72)

## Recommended scope for R33 (POLISH profile, 4 of 8)

Per the skill's `≤3 feature + ≤5 bugfix + ≤8 total + ≤1 polish per round` caps, **R33 picks the 4 fastest, lowest-risk items** that the user can verify without major UX overhaul:

| # | Issue | Type | Effort | Why first |
|---|---|---|---|---|
| **AC1** | #66 port: `serve({port: 0})` → `serve({port: 8890})` + EADDRINUSE fallback | bugfix | 5 min | 1-line config; fixes silent localStorage数据丢失 (highest user impact) |
| **AC2** | #68 stat: `state.fresh.push({...})` add `status: "open"` | bugfix | 3 min | 3-line schema fix; fixes "0 open findings"显示 bug (data correctness) |
| **AC3** | #70 overlay: `.post-submit` add `background: rgba(0,0,0,0.5)` + z-index 3000 + visibility hidden | bugfix | 5 min | 3-line CSS fix; user explicitly吐槽'd "重叠错位" |
| **AC4** | #71 ignore-ws: 3 i18n keys (label/description/ariaLabel) + `data-i18n-title` + `data-i18n-aria-label` + active state CSS | bugfix | 1.5 h | Bigger but self-contained; i18n + a11y 数据 |

**Total R33 LOC estimate**: ~100 insertions across 2 files (`src/index.ts`, `src/ui/app.ts` or `src/ui/review.html` for the port/statement/overlay/ignore-ws CSS). Within feature ≤3 / bugfix ≤5 caps.

## Deferred to R34 (next polish round)

| # | Issue | Why deferred | Effort |
|---|---|---|---|
| #65 | Settings panel 3 bugs + i18n post-submit banner | Largest of the 8; needs user-gating because modal close semantics matter | 1-2 h |
| #67 | Conversation panel 4 UX | 4 sub-issues touching different parts; safer in dedicated round | 1-2 h |
| #69 | Previously discussed tab layout | Full redesign; needs user input on preferred design direction | 1-2 h |
| #72 | Worktree branch copy enhancement | New feature (not bugfix); needs user input on location | 1-1.5 h |

## User-impact profile (U_*)

```yaml
U_size: small (1-2)            # 4 small fixes total
U_files: small (2-3)          # src/index.ts + src/ui/app.ts (+ optionally review.html)
U_new_capability: no          # no new features, all bugfixes
U_behavior_shift: no         # existing behavior made correct
U_user_visible: yes          # user sees correct counts, visible settings panel overlay
U_data_shape_breaking: no    # no schema change (#66 preserves random-port fallback semantic)
U_data_safety: yes           # port-stable localStorage + status-on-fresh-finding data correctness
U_installs_new_dep: no
# Total: 0+1+0+0+2+0+1+0 = 4 → feature profile (>3) — but visual-impact-only work in polish capacity
```

**Auto-classification**: total=4 + U_user_visible=yes → `feature` profile. Phases run: all 17 per skill (full plan, 5 lens, full Playwright).

**Profile override**: treat as **POLISH** round for scope-tracking purposes (≤1 polish per round). Work is mostly small CSS/3-line fixes. Decision recorded in `decision.md ## Round profile`.

## Out of scope

- Issues #65, #67, #69, #72 → R34 + later
- Stale worktree cleanup (R4-R17 orphan worktrees) → R34 housekeeping round
- R21-R31 retrospective artifact backfill → SKILL.md patch only (no .omo/round-N/ backfill per current SG.R26.1 policy)

## Source-of-truth references

- 8 GH issues: https://github.com/weekbin/opencode-review-dashboard/issues/65-72
- pre-loop repair commit: 80d9d85
- verify-plugin-load 4-gate: passing on Node + Bun
- SKILL.md v5.3.11: SG.R27.1 (4-gate verification) + SG.R28.1 (frontend skill invocation)
