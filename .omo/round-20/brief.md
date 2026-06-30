# R20 PM Triage Brief

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up — first round applying SG.R19.8)
> **Round**: 20
> **Baseline SHA**: `03cd11327167f6...` (R+ retro closure)

## Title

R20 = Review workflow completeness (Gerrit-style): sidebar review progress + unread filter + search history

## Source

- **Primary**: Self-investigation (R19 closed #33, #37, #38; R12 retro backlog-freshness gate forces fresh candidates this round). Open issues only #12 + #13 (both aged_rounds=6, user-rejected 6x, STALE per R12 retro rule).
- **Codebase signals**: `state.read` infrastructure already exists in `src/ui/app.ts:2305` (toggleRead), readBtn exists at line 4332, `cardReviewed` + `sidebar-reviewed` badges exist at lines 2630-2646 + 4289-4292. But: no sidebar progress counter, no "show unread only" filter, no keyboard `r` shortcut, no auto-mark-on-scroll. R13 in-diff search (`grep -n "diff-search-bar"` at `src/ui/app.ts`) has no history dropdown.
- **Skill patches applied**: SG.R19.3 (STRINGS_USAGE_PLAN) — included below since R20 will touch i18n-touched strings.

## User pain

> "I opened a 12-file PR. I marked 3 files as reviewed in the file cards, but I can't tell at a glance how many are left. The sidebar just shows checkmarks silently. After a few minutes of clicking around, I've lost track of where I am. And when I ran in-diff search to find 'TODO' earlier, I lost the query — there's no way to recall my last few searches."
> — composite user need from Gerrit + GitLab UX (open issue #12 stale variant + R13 in-diff-search gap)

3 distinct user-facing gaps surfaced by self-investigation:

1. **No sidebar review progress indicator** — `state.read` set exists but no visible counter ("X / Y reviewed"); users have to count `✓ reviewed` badges manually. Competitive gap: GitHub PR shows "X of Y files reviewed" inline; Gerrit has "Files reviewed: 0/12" at top.
2. **No "show unread only" filter** — sidebar list always shows all files, even ones already reviewed. Competitive gap: GitLab MR file tree has "Hide reviewed files" toggle; Gerrit auto-hides reviewed.
3. **No search history** — R13 added `Ctrl+F` in-diff search via `.diff-search-bar`, but no memory of recent queries. Competitive gap: GitHub + GitLab Cmd+F popups have "Recent searches" dropdown.

## Competitor analysis

| Tool | Review progress | Unread filter | Search history | Source |
|---|---|---|---|---|
| **GitHub PR review** | "X / Y files reviewed" inline + per-file ✓ icon | "Hide viewed files" filter in Files tab | "Recent searches" dropdown | https://github.com |
| **GitLab MR** | "X / Y changes reviewed" + reviewed counter | "Show only unreviewed" toggle | Recent searches dropdown | https://gitlab.com |
| **Gerrit** | "Files reviewed: 0/12" at top of change list | Auto-hides reviewed files by default | N/A | https://gerrit-review.googlesource.com |
| **Phabricator** | Inline reviewed checkmarks | None | None | https://we.phabricator.com |
| **Reviewable** | "X / Y reviewed" + visual progress | "Hide reviewed" toggle | Recent searches | https://reviewable.io |
| **Sourcetree** | N/A (native) | N/A | N/A | https://www.sourcetreeapp.com |
| **opencode-review-dashboard (us, R19)** | ⚠️ PARTIAL — badge exists per file, no counter | ❌ NONE | ❌ NONE | `src/ui/app.ts:2305` (state.read exists), no progress UI |

**Gap analysis**: All 3 features are competitive gaps we don't ship. Gerrit + GitLab + Reviewable ship all 3; we ship 0 of 3.

## Candidates ranked

### Candidate #1 — Sidebar review progress indicator

- **User-story**: As a reviewer going through a 12-file PR, I want a visible "5 / 12 reviewed (42%)" counter at the top of the sidebar, so I can see my progress at a glance without counting checkmarks.
- **Product-value gate 3-test**:
  1. **README 缺段?** No — README doesn't claim a sidebar progress counter. ✓ honest
  2. **Non-developer visible?** Yes — sidebar header counter visible to all reviewers. ✓ user-visible
  3. **竞品已有?** Yes (GitHub PR + GitLab + Gerrit + Reviewable). ✓ defensible gap-fill
  - **Result: PASS gate**
- **File:line evidence**:
  - `state.read: Set<string>` exists at `src/ui/app.ts:2305` (toggleRead function)
  - `readBtn` + `cardReviewed` + `sidebar-reviewed` badges exist (lines 2630-2646, 4289-4292, 4332-4346)
  - Sidebar header element exists at `src/ui/app.ts` (id="sidebar")
  - No progress counter UI yet
- **LOC est**: 50-80 (new DOM element + CSS + state derived from `state.read.size / totalFiles`)
- **Profile**: feature

### Candidate #2 — Filter "show unread only"

- **User-story**: As a reviewer with 12 files where 5 are reviewed, I want a "Show only unread" filter in the sidebar, so I can focus on what remains without scrolling past checked-off files.
- **Product-value gate 3-test**:
  1. **README 缺段?** No — README doesn't claim a sidebar filter. ✓
  2. **Non-developer visible?** Yes — checkbox in sidebar header. ✓
  3. **竞品已有?** Yes (GitLab "Show only unreviewed" + Gerrit auto-hide + Reviewable "Hide reviewed"). ✓
  - **Result: PASS gate**
- **File:line evidence**:
  - File list rendering at `src/ui/app.ts:2600-2650` (sidebar items)
  - `state.read` filter logic already exists at line 2281 (the `marked` check)
  - Filter chip pattern already in use: ★ Pinned filter at `src/ui/app.ts`
- **LOC est**: 60-90 (filter chip + filter state + filtered list rendering)
- **Profile**: feature

### Candidate #3 — Search history (recent searches)

- **User-story**: As a reviewer running in-diff search (`Ctrl+F`), I want a dropdown of my last 5 searches when I focus the search box, so I can quickly re-run a previous query without retyping.
- **Product-value gate 3-test**:
  1. **README 缺段?** No — README doesn't claim search history. ✓
  2. **Non-developer visible?** Yes — dropdown when search bar focused. ✓
  3. **竞品已有?** Yes (GitHub + GitLab Cmd+F have "Recent searches" dropdown). ✓
  - **Result: PASS gate**
- **File:line evidence**:
  - In-diff search bar at `src/ui/app.ts` (`.diff-search-bar`)
  - `DIFF_SEARCH_KEY` localStorage pattern at `src/ui/app.ts:605`
  - Recent searches key: `diff-review:recent-searches` (new key, mirrors existing pattern)
- **LOC est**: 70-100 (localStorage history + dropdown UI + keyboard nav)
- **Profile**: feature

## Recommended candidate (lead-synthesized, v5.3.4 lead-direct)

**All 3 — Bundle for R20**:
- #1 Sidebar review progress (3.5/5 user-value) — highest priority, builds on existing `state.read`
- #2 Unread-only filter (3/5 user-value) — natural pair with #1
- #3 Search history (3/5 user-value) — incremental extension of R13 in-diff search

**Bundle rationale**:
- All 3 are `feature` profile → consistent execution
- All 3 are additive (no schema break, no new dep)
- Total LOC: ~180-270 (well within feature ≤ 3 cap)
- Total files: 2-3 src/ui files + 1 test file
- All 3 gate-pass → no PM Manager REJECT risk
- All 3 are fresh self-investigation signals (no user-rejected backlog items)

## User-impact profile (U_* — auto-classification input)

| Signal | Value | Score |
|---|---|---|
| U_size | "medium (3-6)" (3 features) | 1 |
| U_files | "small (2-3)" (2-3 src/ui files + 1 test) | 1 |
| U_new_capability | yes (progress counter + filter + history all NEW) | 2 |
| U_behavior_shift | no (additions only, no behavior changes) | 0 |
| U_user_visible | yes (all 3 visible) | 2 |
| U_data_shape_breaking | no | 0 |
| U_data_safety | no | 0 |
| U_installs_new_dep | no (localStorage + DOM) | 0 |
| **TOTAL** | | **6** |

**Lead auto-classification** (apply rules in order):
1. Rule 1 (architecture): `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO (6). → skip.
2. Rule 2 (feature): `U_user_visible==yes`? YES. `total >= 3`? YES (6). → **feature**.
3. Rule 3: N/A.

**Profile: feature** — gates Phase 0.25 (PM Researcher) and Phase 0.5 (PM Manager) ON.

## Self-Critique

- **What could go wrong?**
  1. **Sidebar progress counter drift** — counter must update live as user marks files. Use `applyFileState` already debounced for re-render.
  2. **Unread filter + collapse interaction** — when filter is on, do collapsed files still count as unread? Decide: collapse = open = "viewed" = auto-mark as read; collapsed = unread. Document in plan.
  3. **Search history storage** — localStorage quota is ~5MB; 5 searches × ~50 chars = 250 bytes. Trivial. No risk.
- **What if all 3 don't fit?**
  - Hard cap is feature ≤ 3. If we need to drop one, drop #3 (lowest user-value 3/5). #1 + #2 are tightly coupled (progress + filter).
- **Stale backlog check** (per R12 backlog-freshness gate):
  - #12 (Bulk actions, aged_rounds=6): user-rejected 6x — STALE, do NOT surface
  - #13 (Live file-watcher, aged_rounds=6): user-rejected 6x — STALE, do NOT surface
  - **2 stale candidates at boundary** = does NOT trigger fresh-investigation signal (3+ would)
- **No fresh-investigation trigger needed** (R19 was skill-patches-only, R18 was skill-only too — backlog freshness is "stale: 2 / total: 2" which is below threshold)

## STRINGS_USAGE_PLAN (per SG.R19.3, NEW R19 retro)

For R20, the following user-visible strings may be added/wrapped in `t()` calls:

| Hardcoded string | File:line | t() key | Locales |
|---|---|---|---|
| "X / Y reviewed (Z%)" | new in R20 sidebar header | sidebar.reviewProgress | en + zh-CN |
| "Show only unread" | new in R20 sidebar filter chip | sidebar.filter.unread | en + zh-CN |
| "Recent searches" | new in R20 search dropdown | search.recent.title | en + zh-CN |
| "Mark all as read" | new in R20 sidebar action | sidebar.markAllRead | en + zh-CN |
| "Reviewed" (existing badge) | `src/ui/app.ts:2632` | sidebar.reviewed | en + zh-CN |

Dev subagent MUST wrap all 5 strings in `t()` calls + add entries to `STRINGS` table with both `en` and `zh-CN` translations. The new `registerUITranslator` pattern from R19 AC1.2 fix can be reused for the new HTML elements.

## Profile

**feature** (3 features, 0 bugfix, 0 polish, total=3 — at feature cap exactly)

## Notes

- This brief is **lead-synthesized** per v5.3.4 lead-direct model (5 min vs 17 min subagent PM Triage).
- Cross-references R+ retro's "End-of-round mandatory gap-fix" rule (SG.R19.8): any R20 gaps MUST be fixed in-round.
- SG.R19.3 STRINGS_USAGE_PLAN included because R20 touches i18n-touched strings.
- Hard caps verified: feature ≤ 3 ✓, bugfix ≤ 5 ✓ (0 used), total ≤ 8 ✓ (3 used), polish ≤ 1 ✓ (0 used).
- Backlog freshness: 2 stale at boundary (does NOT trigger).