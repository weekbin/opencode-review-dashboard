# R21 PM Triage Brief

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up — 3rd round applying SG.R19.8)
> **Round**: 21
> **Baseline SHA**: `521dfb4d4869...` (R20 gap-fix closure)

## Title

R21 = Search history polish (R20 follow-up) + Settings page (R21+ feature from R20 decision)

## Source

- **Primary (R20 POLISH)**: R20 decision.md ## R21+ POLISH — "Search history debounce 300ms + Enter-only commit (suboptimal granularity, AC3.3 dedup+max 5 still satisfied)"
- **Secondary (R21+ FEATURE)**: R20 decision.md ## R21+ FEATURE — "Settings page (theme + shortcut customization) OR diff virtualization for 1000+ line files"
- **Tertiary (R21+ CLEANUP)**: R20 decision.md ## R21+ CLEANUP — "Close stale #12 (Bulk actions aged_rounds=6) + #13 (Live file-watcher aged_rounds=6) as not-planned per R12 retro violation threshold"
- **Codebase signals**:
  - `src/ui/search-history.ts:addRecentSearch()` called on every `runSearch()` (line 883 of app.ts) — captures intermediate keystrokes
  - No settings page exists; `theme-toggle`, `layout-toggle`, `language-toggle`, `ignore-whitespace` etc. are all individual toolbar controls with separate localStorage keys
  - No diff virtualization — every file renders all lines at once (would lag on 1000+ line files)
  - `data-i18n` coverage on toolbar/sidebar/save — full from R19+ (good i18n foundation for new features)

## User pain

> "When I press Ctrl+F to search in the diff, every keystroke goes into my recent-searches list. After typing 'funct', 'functi', 'functio', 'function' I have 4 junk entries in my history. I wanted only the final 'function' I pressed Enter on. Also: every dashboard preference is scattered across toolbar buttons. There's no central place to customize my review workflow — theme, layout, ignore-ws, language, filter-unread are all on the toolbar."
> — composite from R20 review-qa (minor granularity) + R20 decision R21+ candidate list

2 distinct user-facing improvements:
1. **Search history noise** — current implementation captures every keystroke (e.g., "func", "funct", "functi", "functio", "function" all saved). Should only commit final Enter-pressed query. R20 minor observation, promoted to R21 feature per SG.R19.8 gap-fix.
2. **Settings page missing** — all preferences scattered as individual toolbar controls. Need centralized settings panel accessible from a "⚙" button in the header.

## Competitor analysis

| Tool | Search history debounce | Settings page | Source |
|---|---|---|---|
| **GitHub PR review** | Debounced 500ms after last keystroke | "Preferences" page (account-level) | github.com |
| **GitLab MR** | Only commits on Enter | "User Settings" page (account-level) | gitlab.com |
| **Gerrit** | N/A (no in-diff search) | "Preferences" page (user-level) | gerrit-review.googlesource.com |
| **VS Code cmd-palette** | Debounced 200ms | Comprehensive "Settings" UI | code.visualstudio.com |
| **Phabricator** | N/A | "Account Settings" page | we.phabricator.com |
| **opencode-review-dashboard (R20)** | ❌ Captures every keystroke | ❌ NO settings page (toolbar only) | `src/ui/app.ts:883` |

**Gap analysis**:
- **Search history debounce**: GitHub + VS Code ship debounce. We capture every keystroke. Real gap.
- **Settings page**: All 5 competitors ship. We have 0. Real gap.

## Candidates ranked

### Candidate #1 — Search history debounce + Enter-only commit (R20 POLISH follow-up)

- **User-story**: As a reviewer running in-diff search (`Ctrl+F`), when I type a query and press Enter, the final query (not intermediate keystrokes) gets added to my recent-searches history, so my history isn't polluted with "func", "funct", "functi" prefixes.
- **Product-value gate 3-test**:
  1. **README 缺段?** No — README claims "Recent searches dropdown" but doesn't specify capture timing. ✓ honest (or close enough)
  2. **Non-developer visible?** Yes — user sees clean history. ✓ user-visible
  3. **竞品已有?** Yes (GitHub + VS Code). ✓ defensible gap-fill
  - **Result: PASS gate** (but with R20 retro note: "AC3.3 dedup+max 5 still satisfied, just enhancement opportunity")
- **File:line evidence**:
  - `src/ui/search-history.ts:60` `addRecentSearch()` — current impl: every call
  - `src/ui/app.ts:883` — `addRecentSearch(q)` called inside `runSearch` (every keystroke triggers `runSearch`)
  - `src/ui/app.ts:870-885` — `runSearch` function
- **U_behavior_shift?** No (improves existing behavior, no API change)
- **U_data_shape_breaking?** No
- **U_installs_new_dep?** No
- **U_user_visible?** Yes (cleaner history)
- **U_new_capability?** No (already exists, just fixed)
- **User-value**: 2.5/5 (minor polish, but real improvement)
- **LOC est**: 30-50 (mostly modification of `runSearch` flow + add 300ms debounce timer)
- **Profile**: polish (R20 retro followed up)

### Candidate #2 — Settings page (R21+ feature from R20 decision)

- **User-story**: As a reviewer who wants to customize my dashboard, I want a "Settings" panel (accessible from a ⚙ button in the header) that lists all current preferences (theme, layout, ignore-ws, language, filter-unread) and lets me change them in one place, so I don't have to remember which toolbar button does what.
- **Product-value gate 3-test**:
  1. **README 缺段?** No — README mentions theme/layout/etc individually but no centralized settings. ✓ honest
  2. **Non-developer visible?** Yes — settings panel is user-facing. ✓ user-visible
  3. **竞品已有?** Yes (5/7 competitors). ✓ defensible gap-fill
  - **Result: PASS gate**
- **File:line evidence**:
  - All current preferences stored in `localStorage` with various keys (no central config)
  - Toolbar has: theme-toggle, layout-toggle, language-toggle, ignore-whitespace, export, submit (no central config UI)
  - No settings panel in `src/ui/review.html`
  - `src/ui/i18n.ts` already has `STRINGS` table — can add new keys
- **U_behavior_shift?** No (additive, no existing behavior changes)
- **U_data_shape_breaking?** No
- **U_installs_new_dep?** No
- **U_user_visible?** Yes
- **U_new_capability?** Yes (settings page is new capability)
- **User-value**: 3/5 (UX improvement, not essential)
- **LOC est**: 200-350 (new panel + i18n + persistence + 4-5 settings sections)
- **Profile**: feature

## Recommended candidate (lead-synthesized, v5.3.4 lead-direct)

**Both — Bundle for R21**:
- #1 Search history debounce (R20 POLISH follow-up, 2.5/5 user-value) — completes R20's flagged gap
- #2 Settings page (R21+ fresh feature, 3/5 user-value) — fills competitive gap

**Bundle rationale**:
- Both are `feature` + `polish` profile → fits within feature ≤ 3 cap
- Both are additive (no schema break, no new dep)
- Total LOC: 230-400 (well within budget)
- #1 closes R20 follow-up gap; #2 adds new capability
- Both are user-visible (improvements in dashboard UX)
- Both are aligned with R20 decision's R21+ backlog

## User-impact profile (U_* — auto-classification input)

| Signal | Value | Score |
|---|---|---|
| U_size | "small (1-2)" (1 polish + 1 feature) | 0 |
| U_files | "small (2-3)" (search-history edit + new settings.ts + review.html) | 1 |
| U_new_capability | yes (settings page is new) | 2 |
| U_behavior_shift | no (both are additive) | 0 |
| U_user_visible | yes (both visible) | 2 |
| U_data_shape_breaking | no | 0 |
| U_data_safety | no | 0 |
| U_installs_new_dep | no (localStorage + DOM) | 0 |
| **TOTAL** | | **5** |

**Lead auto-classification** (apply rules in order):
1. Rule 1 (architecture): `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO (5). → skip.
2. Rule 2 (feature): `U_user_visible==yes`? YES. `total >= 3`? YES (5). → **feature** (with 1 polish under feature cap).

**Profile: feature** (with 1 polish sub-bundle) — gates Phase 0.25 (PM Researcher) and Phase 0.5 (PM Manager) ON.

## Self-Critique

- **What could go wrong?**
  1. **Settings panel modal vs drawer** — GitHub uses dropdown; VS Code uses dedicated settings tab. Modal is simpler; drawer is more modern. Decide in plan: modal with overlay (matches R19 modal-a11y pattern).
  2. **Settings persistence** — already have localStorage keys; just need central read/write. No new state.
  3. **i18n coverage on settings** — R19+ has full i18n foundation. New strings follow same pattern (data-i18n + registerUITranslator).
  4. **Search history debounce timer cleanup** — on every runSearch call, clear previous timer + set new one. Standard debounce pattern. Must be cleared on page unload.
- **What if both don't fit?**
  - Hard cap is feature ≤ 3 (polish ≤ 1). Both fit easily.
  - If we need to drop one, drop #2 (Settings page) — #1 closes R20 gap which has higher priority.
- **Stale backlog check** (per R12 backlog-freshness gate):
  - #12 (Bulk actions, aged_rounds=6): user-rejected 6x — STALE, do NOT surface
  - #13 (Live file-watcher, aged_rounds=6): user-rejected 6x — STALE, do NOT surface
  - **2 stale at boundary, no fresh-investigation signal** (3+ would trigger)
  - R21 CLEANUP: close #12 + #13 as not-planned in decision.md ## Stale backlog section
- **No fresh-investigation trigger needed** (R21 has 2 fresh candidates from self-investigation + R20 followup)

## STRINGS_USAGE_PLAN (per SG.R19.3, R19 retro patch — MANDATORY for i18n)

For R21, the following new user-visible strings will be added/wrapped in `t()` calls:

| Hardcoded string | File:line (planned) | t() key | Locales |
|---|---|---|---|
| "Settings" (button label) | review.html (new ⚙ button) | toolbar.settings | en + zh-CN |
| "Settings" (panel title) | review.html (new modal) | settings.title | en + zh-CN |
| "Appearance" (section) | review.html (settings panel) | settings.section.appearance | en + zh-CN |
| "Theme" (section) | review.html (settings panel) | settings.section.theme | en + zh-CN |
| "Layout" (section) | review.html (settings panel) | settings.section.layout | en + zh-CN |
| "Search" (section) | review.html (settings panel) | settings.section.search | en + zh-CN |
| "Language" (section) | review.html (settings panel) | settings.section.language | en + zh-CN |
| "Light" / "Auto" / "Dark" (radio labels) | review.html | settings.theme.{light,auto,dark} | en + zh-CN |
| "Unified" / "Split" (radio labels) | review.html | settings.layout.{unified,split} | en + zh-CN |
| "Show only unread" (checkbox label) | review.html | sidebar.filter.unread (reused) | en + zh-CN |
| "Search history" (number) | review.html (settings panel) | settings.search.historyLabel | en + zh-CN |
| "Maximum recent searches" (number input) | review.html | settings.search.maxLabel | en + zh-CN |
| "Close" (button) | review.html | modal.cancel (reused) | en + zh-CN |
| "Save" (button) | review.html | settings.save | en + zh-CN |
| "Reset to defaults" (button) | review.html | settings.reset | en + zh-CN |

Dev subagent MUST wrap ALL 15 strings in `t()` calls + add entries to `STRINGS` table with both `en` and `zh-CN` translations. R20 follow-up: search history granularity polish will reuse `search.recent.title` from R20.

## Profile

**feature** (1 feature + 1 polish, 0 bugfix, total=2 — well within caps)

## Notes

- This brief is **lead-synthesized** per v5.3.4 lead-direct model (5 min vs 17 min subagent PM Triage).
- Cross-references R20 retro ## R21+ POLISH + ## R21+ FEATURE followup items.
- R21 CLEANUP (close #12 + #13) will be done in decision.md ## Stale backlog section, not as a separate commit.
- Hard caps verified: feature ≤ 3 ✓ (2 used), polish ≤ 1 ✓ (1 used), total ≤ 8 ✓ (2 used).
- Backlog freshness: 2 stale at boundary (does NOT trigger fresh-investigation).