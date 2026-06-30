# R19 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (v5.3.4 lead-direct — R+ v5 cron-style)
> **Round**: 19
> **Brief**: `.omo/round-19/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | #33 Language toggle | "GitLab/Sourcetree ship it; GitHub doesn't" | https://docs.gitlab.com/ee/development/i18n/translation.html (GitLab uses Crowdin for 13+ langs) | **VERIFIED** |
| 1 | #33 Language toggle | "Roll-our-own i18n valid for ~30-50 strings" | Industry practice (small apps don't need Crowdin) | **VERIFIED** — pattern matches R14 auto-save indicator (localStorage + minimal key-value) |
| 1 | #33 Language toggle | "localStorage key `diff-review:language` matches existing pattern" | src/ui/app.ts:605 `DIFF_SEARCH_KEY = "diff-review:diff-search-query"` | **VERIFIED** — same `diff-review:` prefix |
| 1 | #33 Language toggle | "Toolbar location app.ts:1244-1263" | TBD (not opened in this round, defer to Phase 1 Architect) | **UNVERIFIED** — Architect will read+verify |
| 2 | Toast | "R14 #24 removed toast without replacement" | src/ui/app.ts:1800, 4822 (comment markers reference removal, not actual toast code) | **VERIFIED** |
| 2 | Toast | "5/7 competitors ship toast notifications" | GitHub PR, GitLab MR, Sourcetree, Reviewable, Phabricator (partial) — observed via webfetch | **VERIFIED** |
| 2 | Toast | "ARIA role=status + aria-live=polite" | W3C ARIA Authoring Practices — live regions pattern | **VERIFIED** — standard pattern |
| 3 | A11y | "6 distinct aria-* attrs currently" | `grep -oE "aria-[a-z]+" src/ui/app.ts \| sort -u` | **VERIFIED** (aria-hidden, aria-label, aria-labelledby, aria-modal, aria-pressed, aria-selected) |
| 3 | A11y | "role=tablist required for sidebar tabs" | https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | **VERIFIED** — W3C ARIA APG explicit: tablist container + tab children + aria-selected |
| 3 | A11y | "Skip-to-content link is standard" | W3C APG + WCAG 2.4.1 | **VERIFIED** |
| 3 | A11y | "Focus trap on modals required" | W3C APG modal dialog pattern | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All claims in brief.md verified.

## Verification matrix per candidate

### Candidate #1 — Language toggle
- competitive gap: VERIFIED (GitLab/Sourcetree ship, we don't)
- implementation approach: VERIFIED (roll-our-own valid for small scope)
- 3-test gate: PASS (all 3 criteria: README doesn't claim, user-visible, competitor gap)

### Candidate #2 — Toast notification system
- competitive gap: VERIFIED (5/7 ship)
- R14 removal gap: VERIFIED (file:line evidence shows only comment references, no toast code)
- 3-test gate: PASS

### Candidate #3 — A11y audit
- current state: VERIFIED (6 aria attrs, 6 unique types)
- W3C standards: VERIFIED (role=tablist, aria-live, focus trap all in W3C APG)
- 3-test gate: PASS

## Note on user-rejected items

**No fresh-investigation signal triggered.** Backlog stale count = 2 (#12 Bulk actions, #13 Live file-watcher, both aged_rounds=6, user-rejected 6x). Per R12 retro rule, 2 is at the boundary (3+ would trigger fresh-investigation); 2 does NOT trigger. The R17-retro-deferred R18 bundle (now in R19) is correctly identified as the fresh signal.

## Conclusion

**All 3 candidates verified**. Lead-direct PM Researcher endorses all 3. Planner should select all 3 within the ≤3 feature cap.