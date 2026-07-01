# R21 Plan — Search history debounce (polish) + Settings page (feature)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-21-settings-and-search-polish`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-21`
> **Pre-dev sanity check**: `git rev-parse --show-toplevel` MUST = `/Users/yangweibin/.worktrees/team-dev-loop-round-21`

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#43 Search history debounce (polish)** — addRecentSearch called inside runSearch at app.ts:883 fires on every keystroke. Should only commit on Enter OR after typing stops for 300ms.
- **#44 Settings page (feature)** — add ⚙ button + new settings modal with 4 sections (Appearance / Layout / Search / Language) + 6 localStorage keys unified.

## 2. Non-goals

- NO new dependencies (vanilla setTimeout, no React/Vue)
- NO schema changes (localStorage keys stay)
- NO server changes (mock-server still on port 8890)
- NO reset-restore of search-history (deferred — out of scope)
- NO bulk delete of recent-searches (deferred — separate issue)
- NO settings profile export/import (deferred)

## 3. AC trace (acceptance criteria, testable)

### Issue #43 — Search history debounce

| AC | Description | Test type | File |
|---|---|---|---|
| 3.1 | type "func" → wait 300ms → recent-searches contains "func" | unit | `src/ui/search-history.test.ts` |
| 3.2 | type "func" → type "t" immediately → recent-searches does NOT contain "func" | unit | `src/ui/search-history.test.ts` |
| 3.3 | type "func" → press Enter → recent-searches contains "func" immediately | unit | `src/ui/search-history.test.ts` |
| 3.4 | type "" → recent-searches stays empty (existing behavior preserved) | unit | `src/ui/search-history.test.ts` |
| 3.5 | localStorage key `diff-review:recent-searches` unchanged | unit | `src/ui/search-history.test.ts` |
| 3.6 | max 5 cap preserved | unit | `src/ui/search-history.test.ts` |

### Issue #44 — Settings page

| AC | Description | Test type | File |
|---|---|---|---|
| 4.1 | click ⚙ button → settings modal opens | e2e (Playwright Gap #14) | `src/ui/review.html` markup |
| 4.2 | modal has `role="dialog"` + `aria-modal="true"` | a11y check | `src/ui/review.html` markup |
| 4.3 | focus trap: Tab cycles within modal | unit + a11y | `src/ui/app.test.ts` |
| 4.4 | Escape closes modal + restores focus to ⚙ button | unit + a11y | `src/ui/app.test.ts` |
| 4.5 | 4 sections render (Appearance / Layout / Search / Language) | unit | `src/ui/app.test.ts` |
| 4.6 | theme change persists in localStorage (key=`diff-review:theme`) | unit | `src/ui/app.test.ts` |
| 4.7 | layout change persists (key=`diff-review:layout`) | unit | `src/ui/app.test.ts` |
| 4.8 | language change persists (key=`diff-review:language`) + UI re-renders | unit | `src/ui/app.test.ts` |
| 4.9 | Reset to defaults button restores ALL 6 keys to defaults | unit | `src/ui/app.test.ts` |

**Total ACs**: 15 (6 + 9)

## 4. Files

### Issue #43 (atomic commit 1)
- `src/ui/search-history.ts` — add `commitRecentSearch(q)` (debounced) + `commitRecentSearchImmediate(q)` (Enter-path)
- `src/ui/app.ts:881-883` — change `addRecentSearch(q)` to commitRecentSearchImmediate on Enter path; otherwise let debounce fire
- `src/ui/search-history.test.ts` — add 3.1-3.6 tests
- 2-3 file touches, ~50 LOC

### Issue #44 (atomic commit 2)
- `src/ui/review.html` — add ⚙ button + settings modal markup
- `src/ui/app.ts` — add openSettingsModal/closeSettingsModal/resetSettings + 6 key handlers + Enter-key on each
- `src/ui/i18n.ts` — add 15 STRINGS keys (en + zh-CN)
- `src/ui/app.test.ts` OR new `src/ui/settings.test.ts` — add 4.1-4.9 tests
- 3-4 file touches, ~250 LOC

## 5. Strategy & approach

### #43 — debounce pattern
- Vanilla setTimeout 300ms. Cancel pending on each new keystroke. Commit on timeout OR on Enter.
- Enter handler: `(e) => { if (e.key === "Enter") { e.preventDefault(); commitRecentSearchImmediate(q); }}`
- Empty query: still no-op (existing trim guard at search-history.ts:61)

### #44 — modal pattern (reuse R19 helper)
- Reuse `installModalA11y(dialog, close)` from R19 (a11y fix at app.ts around line 800)
- ⚙ button: `<button class="header-settings-btn" data-i18n="toolbar.settings" aria-label="...">⚙</button>`
- Settings modal: full-screen overlay with `role="dialog" aria-modal="true"`
- Each setting: `<select>` OR `<input type="range">` with `data-i18n-attr="value:settings.X.Y"`
- Reset button: clears 6 localStorage keys + reloads UI state

### #44 — toolbar coexistence
- Toolbar controls (theme toggle, layout toggle, language switcher, filter-unread, ignore-ws) STAY as quick shortcuts.
- Settings modal is the canonical full-edit view (all values in one place + reset).
- No duplication of logic — both paths call the same `setTheme()`, `setLayout()`, `setLanguage()` etc. handlers.

## 6. STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `toolbar.settings` | "Settings" | "设置" | header ⚙ button |
| `settings.title` | "Settings" | "设置" | modal header |
| `settings.section.appearance` | "Appearance" | "外观" | Appearance section label |
| `settings.section.layout` | "Layout" | "布局" | Layout section label |
| `settings.section.search` | "Search" | "搜索" | Search section label |
| `settings.section.language` | "Language" | "语言" | Language section label |
| `settings.theme.label` | "Theme" | "主题" | theme select label |
| `settings.theme.light` | "Light" | "浅色" | theme option |
| `settings.theme.auto` | "Auto" | "自动" | theme option |
| `settings.theme.dark` | "Dark" | "深色" | theme option |
| `settings.layout.label` | "Layout" | "布局" | layout select label |
| `settings.layout.unified` | "Unified" | "合并" | layout option |
| `settings.layout.split` | "Split" | "分屏" | layout option |
| `settings.search.history` | "Recent searches" | "最近搜索" | search section label |
| `settings.search.max` | "Max items" | "最多条数" | search-max label |

**Total**: 15 keys, both `en` + `zh-CN` required, validated by `src/ui/i18n.test.ts` regression guard (R20 retro AC1.2 pattern).

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #43 — debounce race on Enter | commit on Enter FIRST, cancel pending timer |
| #43 — debounce leaks on unmount | Cancel pending on `beforeunload` |
| #44 — focus trap broken on Reset button | installModalA11y tested in R19; reuse |
| #44 — modal close loses unsaved change | All settings autosave on change; Reset is explicit button only |
| #44 — toolbar vs settings value drift | Both paths call same handler; verify in tests |
| #44 — i18n key collision (existing keys reused) | grep `STRINGS` table before add |
| both — out of worktree dir | SG.R19.4 sanity check BEFORE first git op |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 15 ACs total: 6 PASS for #43 + 9 PASS for #44 = 15/15
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS or explicit SHIP-WITH-NOTES
- i18n regression-guard test passes with all 15 new keys
- mock-server still serves http://localhost:8890 (Phase 2.5 sanity check)
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates (i18n parity, no untracked files, mock-server health)
- GH issues #43 + #44 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R+ backlog)

- Reset-restore search-history (separate issue)
- Bulk delete recent-searches
- Settings profile export/import
- Per-section "Restore defaults" (only global Reset button in R21)

## 10. References

- brief.md: `.omo/round-21/brief.md`
- competitor-landscape.md: `.omo/round-21/competitor-landscape.md`
- pm-manager-review.md: `.omo/round-21/pm-manager-review.md`
- planner.md: `.omo/round-21/planner.md`
- R19 modal-a11y pattern: `src/ui/app.ts` (installModalA11y helper)
- R20 i18n regression-guard pattern: `src/ui/i18n.test.ts` (AC1.2 tests)
- R19 retro (SG.R19.x patches): `.opencode/skills/team-dev-loop/SKILL.md`
- R20 retro (SG.R20.1 3-step): `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md`