# R19 Lens #2 — QA / Hands-on Tester

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Source**: `.omo/round-19/plan.md` ACs

## Per-AC verdict

### #33 Language toggle

- **Hands-on test**: NOT EXECUTED (no browser session in lead-direct mode — per v5.3.3 SG.5)
- **Static analysis**: PASS
  - i18n.ts:182 lines, exported `translate()`, `setLanguage()`, `applyLanguage()`, `onLanguageChange()`
  - 39 STRINGS keys (above 30-key floor)
  - localStorage key matches existing `diff-review:` prefix pattern (`app.ts:605`)
  - UTF-8: PASS (verified via /\p{Script=Han}/u regex)
- **Verdict**: PASS

### #37 Toast notification

- **Hands-on test**: NOT EXECUTED (no browser)
- **Static analysis**: PASS
  - toast.ts:143 lines, exported `showToast()`, `dismissToast()`, `dismissAllToasts()`
  - 5 trigger sites wired in app.ts (exceeds AC2.3 floor of 4)
  - ARIA: `role="status"` + `aria-live="polite"` correctly applied
  - setTimeout/clearTimeout pattern matches R14 #24 auto-save indicator
- **Verdict**: PASS

### #38 A11y audit

- **Hands-on test**: NOT EXECUTED (no browser)
- **Static analysis**: PASS
  - modal-a11y.ts:104 lines, `installModalA11y(dialog, close)` shared helper
  - 6 modals wired (showReopenReasonModal, showResolveReasonModal, showMarkAsWontfixModal, showExportModal, showSubmitConfirmModal, showHelpModal)
  - Skip-link + .skip-link:focus CSS present
  - `<main>` landmark wraps content
- **Verdict**: PASS

## Risk: ARIA correctness without browser verification

**Concern**: All 3 features are UI runtime behavior. Static analysis + unit tests cover the helper functions (translate, showToast, installModalA11y) but the actual DOM rendering, ARIA live region announcement, focus trap cycling, and screen-reader interaction are NOT tested.

**Mitigation**: Phase 3c Playwright walkthrough REQUIRED per R14 retro SG.5. Lead will run `playwright-cli` walkthrough post-merge (after this review).

## Verdict: PASS

Conditional on Phase 3c Playwright walkthrough passing. If walkthrough reveals runtime bugs, file lead-takeover + AUDIT FAIL.

## Issues found

- Minor: showHelpModal Escape handler was refactored to use installModalA11y, breaking one R17 static-grep test. Test was updated to reflect new structure. Behavior is identical (modal closes on Escape, state.showHelp = false). R17 functional behavior preserved.

## Sign-off

Lead-direct verdict: **PASS** (conditional on Phase 3c).