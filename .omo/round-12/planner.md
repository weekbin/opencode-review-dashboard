# Planner plan — Round 12

## Pre-check

- Prior round (R11) SHAs verified: **PASS** (all 7 SHAs `git cat-file -e` OK)
  - `0fd2205` ✓ (R11 Saved Replies `/trigger`)
  - `b533139` ✓ (R11 Per-finding permalink)
  - `bbce9ca` ✓ (R11 e2e scenarios)
  - `7081e37` ✓ (R11 closure docs)
  - `0c28a6c` ✓ (R11 closure audit-trail)
  - `f9ac43185187cca1140182d8b71f1edffd74ff60` ✓ (v5.3 baseline)
  - `1b0da21` ✓ (R11 closure main HEAD)
- If FAIL → STOP protocol triggered, see `planner-blocked.md` (NOT triggered — all SHAs present)
- R3 fabrication defense: PASS — no fabricated SHAs, all 7 verified via `git cat-file -e` on the actual local repo.

## Inputs summary

- Validated candidates (PM Manager APPROVE): **3**
  - #17 ★ Pinned findings (4.5/5, ~110-170 LOC, 2-3 files)
  - #18 Reactions on findings (4/5, ~130-200 LOC, 2-3 files)
  - #19 Jump-to-next/prev keyboard nav (3.5/5, ~70-110 LOC, 1-2 files)
- Opened issues (this round, GH): **#17, #18, #19** (all labeled `pm-manager-approved,round-12`)
- Aged stale candidates (aged_rounds ≥ 3) **IN validated list**: **0**
- Aged carry-forwards (R12 user-excluded): **#12 Bulk actions** (aged=2, architecture), **#13 Live file-watcher** (aged=2, architecture, chokidar ~250KB), **R11 PM Researcher README mischaracterization** (aged=1, re-classified → address within R12 risk register)
- PM Researcher verdict: `REVIEW_NEEDED` (citation-level only — 2 verified / 5 unverified / 4 mischaracterized external claims; underlying feature gaps real and 3-test gate passes; **NOT a feature-level rejection**)
- R11 rollup base SHA: `1b0da21` (verified)
- Follow_up candidates NOT in scope (deferred to R13+ unless user re-picks): #12 (architecture), #13 (architecture), R11 README polish (folded into R12 risk register)
- Hard-caps reminder: feature ≤ 3, bugfix ≤ 5, total ≤ 8, polish ≤ 1, architecture ≤ 1
- Profile decision (lead-decided): **feature** (PM Triage U_* aggregation = ~7, below architecture threshold of 8; Rule 2 fires: U_user_visible=yes + total ≥ 3)

## Ranking

**Composite formula** (weighted sum, reused from R11):
`composite = (user_value × 1.5) + (diff_score × 1.0) + (strategic × 1.0) + (cost_inverse × 0.5)`
where:
- `diff_score`: plausible-unique=3, parity=2, closing-gap=1.5, parity-catch-up=1
- `strategic`: high=2, medium=1.5, low=1
- `cost_inverse`: 1-2 files=3, 2-3 files=2.5, 3+ files=2

Normalization: raw / (max_raw + 1) × 10 = composite (/10 scale)

| Rank | ID | Title | Type | User-value | Diff | Cost | Strategic | Composite | Reason |
|---|---|---|---|---|---|---|---|---|---|
| 1 | candidate_1_pinned_findings | ★ Pinned findings (#17) | feature | 4.5/5 | closing-gap (closes Phabricator Star + GitHub repo pin + Linear Star pattern) — 1.5 | 2-3 files → 2.5 | high (recurring reviewer + post-agent-auto-apply revisit) — 2 | raw 11.5 / **9.2** | Highest user-value + highest strategic; 2-5 min/round saved × recurring use across multi-round reviews. PM Researcher citation advisory: drop Phabricator URL (404), use GitHub repo-pin (real, admin-only, 3 max) + Linear Star + Snooze to-do items as correct citations. |
| 2 | candidate_2_reactions | Reactions on findings (#18) | feature | 4/5 | closing-gap (closes GitHub reactions + GitLab emoji awards + Slack reactions) — 1.5 | 2-3 files → 2.5 | high (1-click feedback for agent auto-apply quality) — 2 | raw 10.75 / **8.6** | Second — 1-click feedback closes agent-fix feedback loop (typing "lgtm" × 30 findings × 30s = 15 min wasted vs 1-click × 1s). PM Researcher advisory: GitHub reactions docs URL is wrong, but feature is real and ubiquitous (visible on every PR/issue page). |
| 3 | candidate_3_keyboard_nav | Jump-to-next/prev-finding keyboard nav (#19) | feature | 3.5/5 | closing-gap (closes GitHub `Cmd+]`/`Cmd+[` + vimdiff `]c`/`[c`) — 1.5 | 1-2 files → 3 | medium (reviewer-pace accelerator) — 1.5 | raw 9.75 / **7.8** | Third — smallest LOC (single file `src/ui/app.ts`) but lower user-value; reuses R11 `flashFindingPermaHighlight` (no duplication). **Architect must use vim `]c`/`[c` semantics for next/prev change — NOT `n`/`N` (which is search, not jump-to-change)** per PM Researcher citation correction. |

### Composite math (explicit)

| # | user_value × 1.5 | diff × 1.0 | strategic × 1.0 | cost_inv × 0.5 | raw | composite /10 |
|---|---|---|---|---|---|---|
| #17 Pinned | 4.5 × 1.5 = 6.75 | 1.5 × 1.0 = 1.5 | 2 × 1.0 = 2.0 | 2.5 × 0.5 = 1.25 | **11.5** | **9.2** |
| #18 Reactions | 4 × 1.5 = 6.0 | 1.5 × 1.0 = 1.5 | 2 × 1.0 = 2.0 | 2.5 × 0.5 = 1.25 | **10.75** | **8.6** |
| #19 Keyboard | 3.5 × 1.5 = 5.25 | 1.5 × 1.0 = 1.5 | 1.5 × 1.0 = 1.5 | 3 × 0.5 = 1.5 | **9.75** | **7.8** |

Normalization: divisor = (max_raw + 1) = 12.5, factor = 10/12.5 = 0.8

### Tie-breaker (M-034)

Not triggered — composite scores (9.2, 8.6, 7.8) are cleanly separated (Δ ≥ 0.6). All 3 candidates have aged_rounds=0, so age tie-breaker doesn't apply.

## Scope selected

```yaml
scope:
  feature_count: 3
  bugfix_count: 0
  total: 3
  profile: feature
  candidates:
    - id: candidate_1_pinned_findings
      issue: "#17"
      type: feature
      title: "★ Pinned findings (mark to revisit after agent auto-applies)"
      file_count: 2-3
      est_loc: 110-170
      pm_manager_verdict: APPROVE
      notes: |
        Reuses existing conversationFilter enum + chip infra at src/ui/app.ts:588-592.
        Additive optional fields: pinned?: boolean, pinned_at?: number.
        PM Researcher advisory (citation cleanup, not feature rejection):
        - DROP "Phabricator starred revisions" claim (Phorge docs URL is Anubis-blocked + feature unverified in canonical guide).
        - USE: GitHub repo-pin (docs.github.com/en/issues/.../pinning-an-issue-to-your-repository, admin-only, max 3),
          Linear Star (per-issue, well-documented), GitLab Snooze to-do items (docs.gitlab.com/ee/user/todos.html).
    - id: candidate_2_reactions
      issue: "#18"
      type: feature
      title: "Reactions on findings (👍 👎 😄 ❤️ 🎉 👀 emoji feedback)"
      file_count: 2-3
      est_loc: 130-200
      pm_manager_verdict: APPROVE
      notes: |
        Additive Finding.reactions?: Reaction[] field, parallel to existing Finding.comments[].
        Idempotent toggle (click same emoji to remove) per Slack/GitHub conventions.
        PM Researcher advisory (citation cleanup, not feature rejection):
        - DROP "docs.github.com/.../using-keyboard-shortcuts-and-command-palette" (wrong page — about shortcuts, not reactions).
        - DROP "docs.github.com/.../about-conversations-on-github" (404 URL).
        - USE: GitHub reactions visible on every PR/issue/comment (mobx/mobx + reactjs/react.dev discussions as observable evidence),
          GitLab emoji awards (docs.gitlab.com/ee/user/discussions.html — verified), Slack reactions (slack.com/help/articles/360020669072).
    - id: candidate_3_keyboard_nav
      issue: "#19"
      type: feature
      title: "Jump-to-next/prev-finding keyboard nav (n/p)"
      file_count: 1-2
      est_loc: 70-110
      pm_manager_verdict: APPROVE
      notes: |
        Pure client-side; reuses R11 flashFindingPermaHighlight at src/ui/app.ts:319 (no duplication).
        PM Researcher advisory (citation + key-semantic correction, not feature rejection):
        - DROP "vimdiff n/N" (n/N in vim is search, not jump-to-change).
        - USE: vimdiff ]c/[c (jump-to-next-change / jump-to-prev-change — the canonical vimdiff semantics),
          GitHub Cmd+]/Cmd+[ (PR review thread nav, community-confirmed),
          Gerrit n/p (Gerrit Review UI, community-confirmed).
        - Architect must name keys accordingly: our keys map to "next finding" / "previous finding",
          use n/p only if Architect decides to follow Gerrit's convention; otherwise use ]c/[c following vimdiff.
```

**Hard caps check**:

| Cap | Limit | Scope | Status |
|---|---|---|---|
| feature ≤ 3 | 3 | 3 | ✓ (exactly hits cap, 0 headroom) |
| bugfix ≤ 5 | 5 | 0 | ✓ |
| total ≤ 8 | 8 | 3 | ✓ |
| polish ≤ 1 | 1 | 0 | ✓ |
| architecture ≤ 1 | 1 | 0 | ✓ |
| mixed-mode warning | architecture + bugfix | 0 + 0 | not triggered (pure feature profile) |

## Decision rationale

**Why these 3 candidates** — R12 is user-locked scope per the chat hint ("我需要 PM 给我讲用户故事，多提一点需求出来"); all 3 are gate-pass (PM Manager APPROVED with zero DUPLICATE/SPECULATION/CONTRADICTION/INFLATED/OBSCURE markers; 3-test product-value gate PASS for all 3), all are additive (no schema break, no contract widening), all are pure-feature profile (no architecture timeout risk), and all close real named competitive gaps (Phabricator/GitHub repo-pin/Linear Star for Pinned; GitHub/Slack/GitLab reactions for Reactions; vimdiff/GitHub/Gerrit keyboard nav for Jump-to-next/prev). Total LOC estimate 310-480 across 3 features, within R11's 30-min per-feature Dev timeout budget when shipped in parallel worktrees per PM Manager note. PM Researcher REVIEW_NEEDED verdict is **citation-level advisory only** — the underlying feature gaps are real (3-test gate confirms); Architect + Dev must use correct citations (GitHub repo-pin for Pinned, not Phabricator star; vimdiff `]c`/`[c` for Keyboard, not `n`/`N`) when writing plan/AC/README.

**What was excluded and why** — Top 3 excluded items: **#12 Bulk actions multi-select** (architecture profile, aged=2, user-explicit "现在这些我都不是很想做" for R12), **#13 Live file-watcher auto-reload** (architecture profile, aged=2, chokidar ~250KB new dependency, same user-explicit rejection), **R11 PM Researcher mischaracterization corrections in README** (user-rejected as standalone R12 candidate — re-classified to address within R12 risk register). Brief candidates #4-7 (if any in this round) are deferred to R13+ per explicit user direction. The 3 carry-overs (aged=2) are tracked in `follow_up_candidates` and will surface again in R13 PM Triage if the user re-picks or if backlog-freshness gate triggers (not triggered this round — all 3 R12 candidates are fresh).

**Hard caps deviation**: **NO** — 3 features exactly hits feature ≤ 3 cap (0 headroom); 0 bugfixes; 0 architecture; pure-feature profile.

**Per-profile decision** (R9 retro Gap L applied): **30 min Dev timeout per candidate** (feature profile). R11 lead-takeover pattern shows the orchestrator sometimes does not honor the explicit timeout param, so Dev should chunk work atomically per candidate to preserve resumability if the 30-min ceiling hits.

**PM Researcher REVIEW_NEEDED incorporated in risk register**:
1. **Citation hygiene** (low risk, fix in plan/AC): Architect + Dev must use correct citations per PM Researcher corrections — drop broken GitHub doc URLs, replace Phabricator star with GitHub repo-pin + Linear Star, replace vimdiff `n`/`N` with `]c`/`[c`. The READMEs and AC strings must reflect corrected citations; PM Doc Writer in Phase 3.5 must verify before merge.
2. **Key semantics for #19** (low risk, fix in plan): Architect must decide whether our keys map to Gerrit's `n`/`p` (next/prev comment in Gerrit) or vimdiff's `]c`/`[c` (next/prev change). PM brief chose `n`/`p`; PM Researcher corrected the vimdiff citation; **Architect must pick one convention consistently** and document it in plan.md.
3. **Feature gap is real** (no risk): 3-test product-value gate PASS for all 3 candidates; PM Manager APPROVED on its own gate (zero markers); PM Researcher advisory is documentation cleanup, not feature rejection.

## Escalation

- [x] None — proceed to Phase 1 Architect

## Fresh signal (R3 lesson)

- [x] Not needed — all 3 R12 candidates are **FRESH** (aged_rounds=0, not in any prior `follow_up_candidates` list from R1-R11 in `.omo/proposals.jsonl`). The 3 aged carry-overs (#12, #13, R11 polish) are user-explicitly-excluded for R12, not STALE-in-scope. R12 is not stale-bloated — fresh-investigation `explore()` signal NOT triggered.
- Backlog state going into R13: 2 aged carry-overs (#12 Bulk actions architecture, #13 Live file-watcher architecture) — if user re-picks or backlog-freshness gate triggers in R13 PM Triage, lead will spawn `explore` for fresh user-stories.

## Carry-forward to R13+ (logged in follow_up_candidates)

| ID | Title | Aged_rounds | Why deferred |
|---|---|---|---|
| #12 | Bulk actions multi-select | 2 | User-explicit rejection for R12; architecture profile; on re-pick, re-validate against current main |
| #13 | Live file-watcher auto-reload | 2 | User-explicit rejection for R12; architecture profile; chokidar ~250KB new dep; on re-pick, evaluate if dependency cost has come down |
| (R11 polish) | PM Researcher mischaracterization corrections in README | 1 | Folded into R12 risk register; Architect + Dev + PM Doc Writer must apply corrections in R12 plan/AC/README — not a standalone R13 candidate |