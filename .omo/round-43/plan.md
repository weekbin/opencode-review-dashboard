# Phase 1 Architect Plan — Round 43

> Bugfix profile → 1-paragraph plan (per SKILL profile gating)
> Inherited scope from `brief.md`: 5 items from GH #73, 2 deferred to R44.

## Plan (1-paragraph summary)

R43 ships 5 UI/state bug fixes from user-reported issue #73, committed directly to main (bugfix profile, lead-direct per R+ retro). ACs: (1) `range-banner` hides when state.range_changed_from_last_round is false AND adopts `position: sticky` so it stays visible during scroll; (2) clicking "mark as duplicated" on a CONversation entry removes that entry from the drawer state (regression test asserts drawerEntryCount decreases by 1); (3) the settings panel button-shaped container gets an explicit SVG icon, no text-overflow in either EN or zh-CN, with aria-label and focus styles per SG.R28.1; (4) `.previously-discussed` page action buttons get `position: relative; z-index: < header z-index` so they stay in their proper stacking context after scroll; (5) default i18n locale on first load (no localStorage preference) becomes `zh-CN` instead of `en`, with a regression test that asserts `localStorage.i18n.lang === "zh-CN"` after first visit. Each AC ships with a unit test (in src/ or src/ui/ next to existing relevant test files) + the build/dist artifacts. Phase 2 = lead-direct implementation; Phase 3c = Playwright walkthrough to verify visual fixes. R44 carry-over: hide-whitespace perf + COMMits panel visual cue (deferred per hard cap).

## File changes (estimated)

| File | AC | Change type |
|---|---|---|
| `src/ui/review.html` | AC1 (range-banner CSS), AC3 (settings-panel), AC4 (previously-discussed z-index) | CSS + minor HTML edits |
| `src/ui/app.ts` | AC2 (mark-as-duplicated state), AC1 (render fn safety), AC5 (initial locale) | TS edits + state mutations |
| `src/ui/i18n.ts` | AC5 (default locale) | locale config |
| `src/ui/i18n.test.ts` | AC5 regression test | New `it()` block |
| `src/ui/settings.test.ts` | AC3 regression test | New `it()` block (icon presence, no overflow) |
| `src/ui/previously-hint.test.ts` (or new test) | AC4 regression test | DOM check for z-index |
| `src/ui/conversation-bulk.test.ts` (or new test) | AC2 regression test | drawer state update test |
| `dist/ui/app.js` (auto via `bun run build`) | All | Build artifact |

## Tests required

For each AC, ≥1 unit test that asserts the fix is in place. Total ≥5 new tests across src/ui/*.test.ts. Existing test baseline ≥610 unit tests must stay green.

## Hand-off items

**Must-do**:
- Use existing utility functions; do not modify the immutables (per R16 SG.R14 — Add-only for existing helpers)
- i18n completeness check: no hardcoded English strings in user-facing DOM (SG.R28.1 5-item checklist)
- Visual changes verified via Playwright Phase 3c walkthrough
- `bun run check` + `bun test` + `bun run build` all PASS before commit

**Must-not-do**:
- Do not modify existing test files in a way that breaks their test count
- Do not refactor app.ts structure
- Do not add new dependencies

## Risk register

- **AC2 (mark-as-duplicated)** — risk of breaking other state mutations sharing the same handler. Mitigation: read existing handler, add `if (kind === "duplicate") removeFromDrawer();` parallel to existing logic.
- **AC5 (default locale)** — risk of conflict with user's stored preference. Mitigation: only set `zh-CN` as default when `localStorage.i18n.lang` is unset (first visit).
- **AC4 (z-index)** — risk of breaking existing overlay hierarchy (e.g., `.post-submit-overlay`). Mitigation: use `position: relative; z-index: 1` on action buttons (low value, well below `#post-submit-overlay` z-index)

## Deferred items (R44 carry-over)

- GH #73 #6 hide-whitespace perf + first-screen diff loading — needs renderDiffPanel perf investigation
- GH #73 #7 COMMits panel folded/unfolded visual cue — polish-level CSS

These 2 will be PM Manager candidates in R44 brief.md (no need to file new GH issues; they're already in #73).

## Plan profile override

- Auto-classification rule 2 (feature) would fire (U_user_visible=yes AND total=3)
- Override to **bugfix** because all 5 items are existing-feature corrections, not new capabilities. Documented in decision.md.
