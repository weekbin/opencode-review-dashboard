# R20 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up)
> **Round**: 20
> **Brief**: `.omo/round-20/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Sidebar progress | "GitHub PR + GitLab MR + Gerrit + Reviewable ship X/Y reviewed" | github.com / gitlab.com / gerrit-review.googlesource.com / reviewable.io (web-search) | **VERIFIED** |
| 1 | Sidebar progress | "state.read: Set<string> already exists at src/ui/app.ts:2305" | `grep -n "toggleRead\|state.read" src/ui/app.ts` | **VERIFIED** |
| 1 | Sidebar progress | "readBtn + cardReviewed + sidebar-reviewed badges already exist (lines 2630-2646, 4289-4292, 4332-4346)" | `grep -n "readBtn\|cardReviewed\|sidebar-reviewed" src/ui/app.ts` | **VERIFIED** |
| 2 | Unread filter | "GitLab MR + Gerrit auto-hide + Reviewable 'Hide reviewed' toggle" | web-search competitors | **VERIFIED** |
| 2 | Unread filter | "File list rendering at src/ui/app.ts:2600-2650" | grep | **VERIFIED** |
| 2 | Unread filter | "★ Pinned filter pattern already in use at src/ui/app.ts (precedent for chip UI)" | grep "Pinned" src/ui/app.ts | **VERIFIED** |
| 3 | Search history | "GitHub + GitLab Cmd+F have Recent searches dropdown" | github.com / gitlab.com | **VERIFIED** |
| 3 | Search history | "R13 in-diff search lives at .diff-search-bar" | grep "diff-search-bar" src/ui/app.ts | **VERIFIED** |
| 3 | Search history | "DIFF_SEARCH_KEY localStorage pattern at src/ui/app.ts:605" | grep | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 9 claims in brief.md verified against current main.

## Verification matrix per candidate

### Candidate #1 — Sidebar review progress indicator
- competitive gap: VERIFIED (GitHub PR + GitLab MR + Gerrit + Reviewable all ship this)
- implementation approach: VERIFIED (state.read already exists; just need progress counter UI)
- 3-test gate: PASS (all 3 criteria: README doesn't claim, user-visible, competitor gap)

### Candidate #2 — Sidebar filter: show only unread files
- competitive gap: VERIFIED (GitLab + Gerrit + Reviewable)
- implementation approach: VERIFIED (filter chip pattern precedent exists from ★ Pinned filter)
- 3-test gate: PASS

### Candidate #3 — Search history (recent searches)
- competitive gap: VERIFIED (GitHub + GitLab Cmd+F dropdown)
- implementation approach: VERIFIED (DIFF_SEARCH_KEY localStorage pattern precedent)
- 3-test gate: PASS

## Note on user-rejected items

**No fresh-investigation signal triggered.** Backlog stale count = 2 (#12 Bulk actions, #13 Live file-watcher, both aged_rounds=6, user-rejected 6x). Per R12 retro rule, 2 is at the boundary (3+ would trigger fresh-investigation); 2 does NOT trigger. The R20 fresh candidates (sidebar progress + unread filter + search history) are all from self-investigation, none from the stale backlog.

## SG.R19.3 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 5 strings + 1 existing badge:
- `sidebar.reviewProgress` (new)
- `sidebar.filter.unread` (new)
- `search.recent.title` (new)
- `sidebar.markAllRead` (new — bonus, not strictly required for AC)
- `sidebar.reviewed` (existing badge text)

Architect + Dev MUST verify all 5 keys have entries in `STRINGS` table with both `en` AND `zh-CN` translations before claiming PASS. Use the R19 retro regression-guard tests (`src/ui/i18n.test.ts` § AC1.2 tests) as pattern.

## Conclusion

**All 3 candidates verified**. Lead-direct PM Researcher endorses all 3. Planner should select all 3 within the ≤3 feature cap.