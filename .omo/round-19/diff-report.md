# R19 Diff Report

> **Reviewer**: lead (R4 retro Gap 2 default — lead-direct)
> **Date**: 2026-06-30
> **Range**: `a0e0361..9867ce2` (R18 → R19)
> **Commits**: 4 (3 atomic feat + 1 Phase 2.5 audit fix)

## File-level summary

| File | Status | Lines | Notes |
|---|---|---|---|
| `src/ui/i18n.ts` | NEW | +182 | Roll-our-own i18n: translate(), setLanguage(), applyLanguage(), onLanguageChange(). 39 STRINGS keys (en + zh-CN). |
| `src/ui/toast.ts` | NEW | +143 | Toast helper: showToast(), dismissToast(), dismissAllToasts(). ARIA role=status + aria-live=polite. |
| `src/ui/modal-a11y.ts` | NEW | +104 | Shared helper: installModalA11y(dialog, close) — Escape + Tab trap + initial focus + restore-focus on close. |
| `src/ui/a11y.test.ts` | NEW | +111 | Snapshot/source-grep tests for ARIA attrs presence. |
| `src/ui/toast.test.ts` | NEW | +204 | Unit tests for toast show/dismiss/aria/lifetime. |
| `src/ui/i18n.test.ts` | NEW | +170 | Unit tests for translate() per language, localStorage persistence. |
| `src/ui/app.ts` | MODIFIED | +57 / -8 | Wire-up: installModalA11y in 6 modals, showToast at 5 trigger sites, language toggle button init. |
| `src/ui/review.html` | MODIFIED | +38 / -3 | Add skip-link + role=status on save-indicator + skip-link CSS + #language-toggle container. |
| `src/r17-features.test.ts` | MODIFIED | +4 / -1 | Update static-grep to match new installModalA11y structure for showHelpModal Escape. |
| `scripts/test-review-ui/README.md` | MODIFIED | +1 / -1 | Phase 2.5 audit fix: e2e scenario count 33 → 34. |

**Total**: 10 files, +1010 / -17

## Critical findings

### File:src/ui/app.ts (MODIFIED)

| Change | Line range | Impact | Risk |
|---|---|---|---|
| `import { showToast }` from `./toast` | new top-level | Adds toast trigger | LOW |
| `import { installModalA11y }` from `./modal-a11y` | new top-level | Adds modal a11y | LOW |
| `installModalA11y(dialog, close)` in 6 modals | showReopenReasonModal, showResolveReasonModal, showMarkAsWontfixModal, showExportModal, showSubmitConfirmModal, showHelpModal | All modals get Escape + focus trap | LOW |
| `showToast(message)` at 5 trigger sites | copyFindingPermalinkToClipboard, copyFindingAsMarkdownToClipboard, addFileFinding, saveSavedReply success, submit success | All major actions get visual feedback | LOW |
| Language toggle button init | module-load, before UI render | Toolbar gets language switcher | LOW |
| `applyLanguage()` at module load | new | Restores persisted language before UI renders | LOW |

### File:src/ui/review.html (MODIFIED)

| Change | Impact | Risk |
|---|---|---|
| Skip-to-content link added as first focusable element in `<body>` | WCAG 2.4.1 compliant | LOW |
| `<span id="save-indicator" role="status" aria-live="polite">` (was missing role=status) | Screen readers announce save state | LOW |
| `<div id="language-toggle"></div>` added in toolbar | Mount point for language toggle button | LOW |
| Inline `<style>` for `.skip-link:focus` | Visual hint when skip link receives focus | LOW |

## Commit-level summary

| SHA | Type | Description |
|---|---|---|
| `846a67f` | feat | A11y audit (close #38) — role=tablist, role=status, focus trap, skip link |
| `d45bf4e` | feat | Toast notification system (close #37) — R14 #24 replacement |
| `84a6f3a` | feat | Language toggle English/Chinese + i18n helper (close #33) |
| `4dfb08e` | fix | e2e scenario count 33 → 34 (Phase 2.5 audit drift fix) |
| `9867ce2` | merge | Round 19 merge commit (no-ff, preserves history) |

## Test impact

- **Tests added**: 34 (10 a11y + 9 toast + 15 i18n)
- **Tests removed**: 0
- **Tests modified**: 1 (r17-features.test.ts: static-grep updated for new installModalA11y structure)
- **Tests pre-existing passing**: 383 → 417 (net +34)

## Build impact

- Build clean: PASS (304 files, 10962.84 kB, 369ms)
- Lint: 0 warnings, 0 errors (95 rules, 37 files)
- Typecheck: clean
- Format: clean

## Backward compatibility

- All existing flows preserved (no breaking changes)
- Existing utility functions NOT modified (R16 SG.14 add-only rule honored)
- 1 test static-grep updated (functional behavior identical)

## Critical findings summary

- **NO CRITICAL findings**
- **1 minor**: showHelpModal Escape handler refactored to use shared helper (intentional, behavior identical)
- **0 nitpicks** at file-level

## Lead-direct verdict: **PASS**

Diff is consistent with plan.md scope. No architectural changes, no schema breaks, no new dependencies. Ready for ship.