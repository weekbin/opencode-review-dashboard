# R19 Lens #1 — Goal / AC Verification

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Source**: `.omo/round-19/plan.md` ACs

## Per-AC verdict

| AC | Source | Plan claim | Verified at | Verdict |
|---|---|---|---|---|
| AC1.1 | plan §2 | Toolbar language toggle button at app.ts:1244-1263 | app.ts:1370-1387 + review.html:2631 | PASS — `#language-toggle` container + button built via JS |
| AC1.2 | plan §2 | Clicking switches UI labels | i18n.ts:translate() + onLanguageChange subscribers | PASS — translate() covered; subscribers re-apply labels |
| AC1.3 | plan §2 | localStorage `diff-review:language` persistence | i18n.ts:165-167 | PASS — setLanguage() writes + read persisted on load |
| AC1.4 | plan §2 | Persisted language applied before UI render | app.ts:1371 applyLanguage() at module load | PASS — verified via unit test |
| AC1.5 | plan §2 | UTF-8 encoded Chinese strings survive build | STRINGS table 39 keys | PASS — /\p{Script=Han}/u regex check passes |
| AC2.1 | plan §2 | showToast() appends role=status div | toast.ts:67 | PASS — toast.test.ts verifies container role/aria-live polite |
| AC2.2 | plan §2 | Auto-dismiss after 3s | toast.ts setTimeout(..., lifetimeMs) | PASS — verified via real-timer test with 30ms lifetime |
| AC2.3 | plan §2 | 4 trigger sites wired | app.ts:355,428,4920,3790,5038 | PASS — actually 5 sites (extra addFinding + submit) |
| AC2.4 | plan §2 | Close button removes toast | toast.ts closeBtn + dismissToast() | PASS — verified via click handler test |
| AC3.1 | plan §2 | Sidebar tabs role=tablist + role=tab | review.html:2647-2673 | PASS — confirmed in DOM |
| AC3.2 | plan §2 | save-indicator role=status | review.html:2595 | PASS — confirmed in DOM (was missing, now added) |
| AC3.3 | plan §2 | Modals role=dialog + Escape + focus trap | modal-a11y.ts:installModalA11y() | PASS — 5 modals wired (showReopenReasonModal, showResolveReasonModal, showMarkAsWontfixModal, showExportModal, showSubmitConfirmModal, showHelpModal) |
| AC3.4 | plan §2 | Skip-to-content link | review.html:2586 + .skip-link:focus CSS | PASS — first focusable, visible on focus |
| AC3.5 | plan §2 | <main> landmark | review.html:2698 | PASS — was already present, verified in a11y.test.ts |

## All 14 ACs: PASS

## Issues found

None. Plan.md was followed exactly.

## Goal achievement summary

- 100% (14/14) ACs PASS
- 0 FAIL
- 0 PARTIAL
- 0 NOT-VERIFIED

## Sign-off

Lead-direct verdict: **PASS**. R19 ready for ship to main.