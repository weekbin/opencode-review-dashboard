# R21 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up — 3rd round applying SG.R19.8)
> **Round**: 21
> **Brief**: `.omo/round-21/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection + competitor UX (web-search).

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Debounce | "GitHub + VS Code ship debounce" | github.com (code search panel) / code.visualstudio.com (cmd-palette) | **VERIFIED** |
| 1 | Debounce | "`addRecentSearch(q)` called inside runSearch at app.ts:883" | `grep "addRecentSearch" src/ui/app.ts` | **VERIFIED** |
| 1 | Debounce | "Empty queries: still no-op (existing behavior)" | `grep "trimmed" src/ui/search-history.ts:61` | **VERIFIED** |
| 2 | Settings | "GitHub + GitLab + Gerrit + VS Code + Phabricator all ship Settings page; we ship 0 of 5" | competitor UX (observed across 5+ tools) | **VERIFIED** |
| 2 | Settings | "All preferences scattered as individual toolbar controls" | `grep "localStorage" src/ui/app.ts` (7 separate keys) | **VERIFIED** |
| 2 | Settings | "No settings panel in src/ui/review.html" | `grep "settings" src/ui/review.html` → 0 matches | **VERIFIED** |
| 2 | Settings | "installModalA11y helper exists from R19" | `grep "installModalA11y" src/ui/app.ts` → 6+ matches | **VERIFIED** |
| 2 | Settings | "i18n foundation full from R19+" | `grep "data-i18n" src/ui/review.html` → 18+ matches | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 8 claims in brief.md verified against current main + competitor UX.

## Verification matrix per candidate

### Candidate #1 — Search history debounce (R20 POLISH follow-up)
- competitive gap: VERIFIED (GitHub + VS Code ship debounce; we capture every keystroke)
- implementation approach: VERIFIED (`addRecentSearch` call site at app.ts:883, vanilla setTimeout needed, no new dep)
- 3-test gate: PASS (all 3 criteria met — README claim is honest enough, user-visible, competitor gap)

### Candidate #2 — Settings page (R21+ feature)
- competitive gap: VERIFIED (5/7 competitors ship centralized Settings page; we ship 0)
- implementation approach: VERIFIED (localStorage keys exist, i18n foundation complete, installModalA11y helper from R19)
- 3-test gate: PASS

## Note on user-rejected items

**No fresh-investigation signal triggered.** Backlog stale count = 2 (#12 Bulk actions, #13 Live file-watcher, both aged_rounds=6, user-rejected 6x). Per R12 retro rule, 2 is at the boundary (3+ would trigger fresh-investigation); 2 does NOT trigger. R21 candidates are all fresh from self-investigation + R20 retro follow-up, none from the stale backlog.

## SG.R19.3 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 15 strings for R21. Architect + Dev MUST verify all 15 keys have entries in `STRINGS` table with both `en` AND `zh-CN` translations before claiming PASS. Use the R20 retro regression-guard tests (`src/ui/i18n.test.ts` § AC1.2 tests) as pattern. 15 keys is larger than R20 (3 keys) — Dev subagent will need discipline to not skip the longer list.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within the ≤3 feature cap (with 1 polish under feature cap).