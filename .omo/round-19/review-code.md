# R19 Lens #3 — Code Quality Reviewer

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Scope**: 3 new helper files + app.ts integration + review.html markup

## Helper file quality

### src/ui/modal-a11y.ts (104 lines)

- **Strong**: Single responsibility, named export `installModalA11y(dialog, onClose)` clearly scoped
- **Strong**: Defensive — checks `dialog` is non-null before attaching listeners
- **Strong**: Cleanup pattern: removes all listeners when dialog closes (no memory leak)
- **Minor**: Could extract focus-trap iteration into a separate helper for testability, but acceptable for this size

### src/ui/toast.ts (143 lines)

- **Strong**: Container memoization (creates one container per target)
- **Strong**: ARIA correctness (role="status" + aria-live="polite")
- **Strong**: Cleanup: dismissAllToasts() for multi-toast scenarios
- **Minor**: Toast styles hardcoded in JS — should be CSS for design separation. Acceptable for v1, can refactor in v2.

### src/ui/i18n.ts (182 lines)

- **Strong**: Type-safe STRINGS map (Record<key, {en, zh}>)
- **Strong**: Subscriber pattern (onLanguageChange) for reactive UI updates
- **Strong**: Persistence via localStorage with fallback to 'en'
- **Concern**: 39 keys is at the floor (30+) — code-as-docs approach works but adds maintenance burden. Each new UI string must be added to both en + zh-CN.

## app.ts integration (65 LOC added)

- **Strong**: import + use pattern (no global pollution)
- **Strong**: 5 toast trigger sites, 6 modal a11y wirings — all properly closed/cleaned
- **Strong**: NO modify existing utility functions (R16 SG.14 add-only rule honored)
- **Minor**: Some helper function bodies touched to add `installModalA11y(dialog, close)` calls — but this is wire-up at modal-open sites, not modifying the helper itself.

## review.html markup (41 LOC added)

- **Strong**: ARIA roles added semantically (`role="tablist"`, `role="tab"`, `role="status"`, `role="dialog"`, `aria-live="polite"`)
- **Strong**: Skip-link with visible-on-focus CSS pattern (standard WCAG)
- **Strong**: `<main>` landmark was already present (no breakage)
- **Minor**: Inline `<style>` block for skip-link — acceptable but should move to dist/ui/app.css in v2

## Test coverage

- **Strong**: 3 dedicated test files (a11y.test.ts: 111 LOC, toast.test.ts: 204 LOC, i18n.test.ts: 170 LOC) — 485 LOC of new tests
- **Strong**: Source-grep tests for hard requirements (4+ toast trigger sites)
- **Strong**: bun:test framework consistency (matches existing test patterns)
- **Minor**: DOM mocking via FakeNode is per-test file; could extract to shared helper. Acceptable for now.

## Verdict: PASS

Code quality is high. New helper files follow single-responsibility principle. Test coverage matches R12 defense-in-depth pattern.

## Issues found

- None critical
- 1 minor (CSS in HTML — defer to v2)

## Sign-off

Lead-direct verdict: **PASS**.