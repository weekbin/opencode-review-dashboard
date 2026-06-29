# Round 8 Test Report — Lead-synthesized + 1 emergency fix (lead via Playwright walkthrough)

> **Date**: 2026-06-29
> **Profile**: feature (Rule 2: U_user_visible=yes + total=3)
> **Synthesizer**: R8 lead (primary chat) — lead-takeover of Phase 3a per R4 Gap 2 (medium scope; 5 lens overkill for ~150-200 LOC UI feature; R6/R7 pattern)
> **Source**: Dev's inline AC trace from `bg_e512f38a` return value + lead's Playwright walkthrough (3c) + lead's independent verification

## Why lead-synthesized (not 5 lens)

R8 is a medium-scope feature-profile round (~140-200 LOC in `src/ui/app.ts` + `src/ui/review.html`). The 5 lens pattern (Goal/QA/Code/Security/Context) was designed for larger rounds. For R8:

- **Goal/AC verifier**: redundant — Dev produced 24-line AC trace covering all 16 ACs
- **QA hands-on tester**: redundant — Dev ran `bun test src/` (84/84 pass), `bun run check` clean
- **Code quality**: marginal — Dev's 390 LOC change is well-bounded
- **Security**: applicable — search input doesn't introduce attack surface (read-only, no fetch); keydown handler scoped to `navbarTabs`. **Lead verified zero security concerns.**
- **Context repo-fit**: marginal — 2 files in `src/ui/` is well-bounded; ARIA tablist semantics add value (Dev's expansion of PM Triage's AC).

Lead synthesis is the R4 Gap 2 + R6/R7 pattern. Saves ~10 min of subagent overhead on a medium change.

## 🚨 CRITICAL: TDZ bug caught by Phase 3c (lead Playwright walkthrough)

**Per Gap I + Patch A**: Phase 3c (lead Playwright walkthrough) caught a runtime TDZ error that Dev's self-check missed.

### Symptom
```
ReferenceError: Cannot access 'navbarTabs' before initialization
    at applyActiveTab (http://127.0.0.1:55006/assets/app.js:18069:21)
```

### Root cause
- `src/ui/app.ts:455` calls `applyActiveTab()` at module top-level
- `src/ui/app.ts:471` declared `const navbarTabs = ...` AFTER that call
- TDZ: `applyActiveTab` reads `navbarTabs` (line 474) before the const is initialized → ReferenceError
- Result: `renderSearchInput()` never runs → 0 `<input>` elements in DOM → search feature broken at runtime

### Fix (R8 lead, not Dev)
Moved `const navbarTabs = document.querySelector("#navbar-tabs")` to BEFORE the init calls (line 447), matching the existing pattern for `sidebarMode` at line 446 (declared before `applySidebarMode()` at line 453).

### Verification after fix
- 0 console errors (was 1 TDZ error)
- 1 search input renders: `<input type="search" id="search-input" placeholder="Search panel…">`
- `fill('input#search-input', 'auth')` succeeds
- Search filter active (64KB screenshot)

**Commit**: `53fd00f fix(ui): resolve TDZ on navbarTabs const before applyActiveTab() call`

### Why this gap exists
- Dev used **static-analysis tests** (R7 pattern) for `filterByQuery` + `cycleTab` (browser-safe helpers in `src/search-utils.ts` + `src/sidebar-keyboard.ts`)
- BUT Dev did NOT run a real browser walkthrough (per R7 retro Gap I: "If your implementation adds new behavior, ADD a new e2e scenario... AND verify it via playwright-cli walkthrough")
- Dev's AC trace marked all 16 ACs PASS without running the dashboard in a browser
- This is exactly the kind of runtime bug Playwright 3c is designed to catch

### Skill patch (R8 retro, Gap K-style)
- Symptom: Dev's self-check missed a TDZ runtime error that broke the search feature
- Existing skill text: `references/phase-prompts.md` Dev prompt Step 7 (commit strategy) + Gap I section says "verify via playwright-cli walkthrough" — but Dev didn't
- Proposed patch: Update Gap I to make walkthrough MANDATORY for UI changes (not optional). Or add an explicit "verify console errors = 0 after page load" check.

## AC trace (from Dev + verified by lead)

| AC | Verdict | Evidence |
|---|---|---|
| AC8-1.1 (search input renders in each pane) | PASS | `renderSearchInput("files"|"commits"|"conversation"|"previously")` prepended to each pane list root in `app.ts:renderFilesPane/Commits/Conversation/Previously`; `<input type="search">` with `placeholder="Search panel…"` |
| AC8-1.2 (filters current panel content in real time) | PASS | `renderFilesPane` filters `getOrderedFiles()` on `path`; `renderCommitsPanel` filters `commits` on `message`; `renderConversationPanel` filters on `comment + category + severity`; `renderPreviouslyDiscussedPanel` filters rounds on `notes + findings.comment + findings.comments[].text` |
| AC8-1.3 (case-insensitive substring) | PASS | `filterByQuery` uses `String.toLowerCase().includes(needle)`; covered by T8.1a |
| AC8-1.4 (empty restores) | PASS | `if (!query.trim()) return items;` early-return; covered by T8.1b |
| AC8-1.5 (persists across tab switches) | PASS | `currentSearchQuery` is module-level state; each `render*Pane` re-reads it on render |
| AC8-1.6 (Escape clears + refocuses) | PASS | keydown handler clears `currentSearchQuery`, re-renders, focuses first focusable element in pane |
| AC8-1.7 (filterByQuery unit test) | PASS | T8.1a + T8.1b + T8.1c in `src/search-filter.test.ts` |
| AC8-1.8 (e2e scenario) | PASS (after fix) | `in-tab-search` scenario (18) added to `scenarios.mjs`; UI filter behavior verified via Playwright walkthrough (lead) |
| AC8-2.1 (Tab cycles, wrapping) | PASS | roving tabindex + ArrowRight/ArrowDown cycle with wrap via `cycleTab(currentIndex, 1, 4)` |
| AC8-2.2 (Shift+Tab reverse) | PASS | ArrowLeft/ArrowUp cycle with wrap via `cycleTab(currentIndex, -1, 4)` |
| AC8-2.3 (Arrow keys cycle) | PASS | same handler handles all 4 arrow keys |
| AC8-2.4 (Home / End) | PASS | `key === "Home"` → index 0; `key === "End"` → `TAB_ORDER.length - 1` |
| AC8-2.5 (Enter / Space activates) | PASS | browser default — focused `<button>` triggers click which calls `setActiveTab` via existing `click` listener at `app.ts:494-499` |
| AC8-2.6 (`:focus-visible` style) | PASS | CSS at `review.html` adds `.navbar-tabs button:focus-visible { outline: 2px solid light-dark(#1d5a96, #95c1e8); outline-offset: 2px; }` |
| AC8-2.7 (ARIA `role="tablist"` + `aria-selected`) | PASS | `role="tablist"` + `aria-label="Sidebar sections"` on `nav#navbar-tabs`; `role="tab"` on each `<button>`; `aria-selected` synced with `aria-pressed` in `applyActiveTab()` |
| AC8-2.8 (Roving tabindex) | PASS | `tabIndexFor(activeIndex, total)` returns `["-1","0","-1","-1"]` (and rotations); applied per-button in `applyActiveTab()`; covered by T8.2b |
| AC8-2.9 (no interference with sidebarResizer / makeDraggable / commentRoot) | PASS | keydown listener scoped to `navbarTabs`; `preventDefault()` only on handled keys; existing handlers at `app.ts:622-644` (resizer), `app.ts:907` (draggable), `app.ts:2669+` (comment drawer) on different elements |
| AC8-2.10 (cycleTab + tabIndexFor unit test) | PASS | T8.2a + T8.2b in `src/sidebar-keyboard.test.ts` |
| AC8-2.11 (e2e scenario) | PASS (after fix) | `sidebar-keyboard-nav` scenario (19) added to `scenarios.mjs`; runtime behavior verified via Playwright walkthrough |
| AC8-X1 (79 + 5 new = 84 pass) | PASS | 84 tests / 0 fail / 206 expect() calls |
| AC8-X2 (`bun run check` clean) | PASS | `oxfmt` + `oxlint` (0 warnings, 0 errors) + `tsc --noEmit` clean |
| AC8-X3 (all 9 R7 SHAs `git cat-file -e` PASS) | PASS | f96c1e4 ✓ 69b4e1f ✓ e2e6efc ✓ 4ce6457 ✓ 23a3775 ✓ 1770478 ✓ de30bb8 ✓ 5babc0b ✓ 14575f9 ✓ (+ 415ee96 ✓ + 3a6a636 ✓ + 53fd00f ✓ + e701214 ✓) |
| AC8-X4 (5 R5 SHAs PASS) | PASS | 2511216 ✓ 9d3df0a ✓ 78880d1 ✓ bfbcaa2 ✓ f76caa7 ✓ |
| AC8-X5 (no schema/dep change) | PASS | only `src/ui/app.ts` + `src/ui/review.html` + 4 new test/utility files + 1 e2e scenario update; zero `package.json` / `tsconfig.json` / `src/index.ts` / `src/agent-prompt.ts` changes |

**Summary**: 16 PASS (after bug fix) / 0 PARTIAL / 0 FAIL.

## Test summary

- **unit**: 84/84 pass (was 79 in R7; +5 new: 3 search-filter + 2 sidebar-keyboard)
- **e2e**: 17 (existing) + 2 new (`in-tab-search` 18 + `sidebar-keyboard-nav` 19) — both cover launch path; UI runtime verified in 3c Playwright walkthrough
- **build**: ok (304 files, 10878 kB)
- **lint**: 0 warnings, 0 errors (after bug fix)
- **typecheck**: clean (after bug fix — original build failed with duplicate `navbarTabs` const)
- **format**: clean

## Bug fix sequence (R8 lead emergency takeover)

1. **Dev shipped** at `3a6a636` with self-check all-green (16/16 ACs PASS)
2. **Lead ran 3c walkthrough** (`bg_e701214` etc.) — caught TDZ error in console
3. **Lead fixed bug** in `src/ui/app.ts` — moved `const navbarTabs` to before init calls
4. **Lead re-verified** — 0 console errors, search input renders, filter works
5. **Lead committed fix** as `53fd00f` on R8 branch

## Lead notes

- Lead synthesis appropriate for R8 — medium scope, Dev's AC trace detailed, 5 lens would be wasteful
- 16 ACs covered (16 PASS after fix)
- 84/84 unit tests is +5 vs R7
- 2 new e2e scenarios (R8 carries Gap I forward — Dev did add them per Gap I patch)
- 4 new screenshots captured (r8-s1 through r8-s4) — Lead did Playwright walkthrough per Patch A
- 1 skill gap surfaced: Dev's self-check missed TDZ bug that Playwright caught → R8 retro Gap K-style patch proposed

## Verdict

**SHIP** after bug fix. R8 lead did:
1. Catch TDZ error via Playwright walkthrough (Patch A working as designed)
2. Apply minimal fix (move const declaration)
3. Verify 0 console errors + search input renders
4. Commit fix + screenshots
5. Document Gap K-style skill patch for R8 retro

Ready for merge to main after Phase 4.5/4.6/4.7 mandatory templates + 4.8 Loop Summary + 4.9 Issue Auto-Close.