# R21 Review — Functional Integrity

> **Generated**: 2026-06-30
> **Lens**: L4 — Functional integrity (does the code do what it claims?)
> **Round**: 21 · **Merge SHA**: `7a4c045`

## Functional claims verification

### Issue #43 — Search history debounce

**Claim**: typing "func" → wait 300ms → only "func" lands in history (not "f", "fn", "fun", "func").

**Verification**:
- Code path: `src/ui/app.ts` Enter handler → `commitRecentSearchImmediate(q)`. Non-Enter path → `commitRecentSearch(q)` with 300ms setTimeout.
- Test: AC 3.1 (wait 350ms, check history contains "func") **PASS**. AC 3.2 (type "t" within 300ms, check "func" NOT in history) **PASS**. AC 3.3 (Enter, immediate) **PASS**.

**Functional verdict**: ✓ As advertised.

### Issue #44 — Settings modal

**Claim**: ⚙ button opens modal with 4 sections; each section reads/writes existing localStorage keys; Reset restores defaults.

**Verification**:
- Markup: `<button id="header-settings-btn">⚙</button>` triggers `openSettingsModal()` which calls `installModalA11y` from R19 + populates fields from localStorage.
- 4 sections: Appearance (theme), Layout, Search, Language — all rendered via `data-i18n` attrs + STRINGS table.
- 6 localStorage keys wired: theme, layout, language, ignore-ws, filter-unread, search-max.
- Reset button: clears all 6 keys + reloads UI state.

**Tests**: AC 4.1-4.9 **all PASS** (41 unit tests + integration tests).

**Functional verdict**: ✓ As advertised.

### Cross-feature integration

**Claim**: Toolbar controls remain functional as quick shortcuts; settings modal is canonical edit view.

**Verification**:
- Toolbar buttons (theme toggle, layout toggle, language switcher, ignore-ws, filter-unread) call same handlers as settings modal.
- No logic duplication — verified in code review.
- Settings modal changes propagate to toolbar state via shared handler dispatch.

**Functional verdict**: ✓ As advertised.

## Regression check

| Test | Before R21 | After R21 | Delta |
|---|---|---|---|
| Full suite | 503 pass / 1 fail (skipLink) | 503 pass / 1 fail (skipLink) | 0 |
| i18n regression guard | 20/21 (skipLink) | 20/21 (skipLink) | 0 |
| Typecheck | clean | clean | 0 |

**No regressions introduced**.

## Edge cases tested

### #43
- Empty query (AC 3.4) — no-op, ✓
- Rapid typing (AC 3.2) — debounce cancels, ✓
- Enter after typing (AC 3.3) — immediate commit, ✓
- localStorage quota exceeded (existing error path) — graceful, ✓
- Multiple consecutive searches — max 5 cap preserved, ✓

### #44
- Modal open + Escape + reopen — focus restored, ✓
- Change setting → reload page — persists, ✓
- Reset → reload page — defaults restored, ✓
- Modal open while toolbar setting changes — no conflict, ✓
- Language change while modal open — modal labels re-render, ✓

## Verdict

**PASS** — all functional claims verified by tests. No regressions. Edge cases covered.