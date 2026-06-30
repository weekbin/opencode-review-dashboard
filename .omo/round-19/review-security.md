# R19 Lens #4 — Security / Privacy / Integrity

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Scope**: localStorage keys + ARIA wiring + modal Escape handlers

## localStorage key exposure

### `diff-review:language` (i18n.ts)

- **Storage location**: Browser localStorage (client-side, not transmitted)
- **Value**: language code string (`"en"` or `"zh-CN"`)
- **Sensitivity**: NONE (language preference is not PII)
- **Verdict**: PASS — no security concern

### Existing keys (preserved)

- `diff-review:diff-search-query` (R13)
- `diff-review:saved-replies` (R10)
- `diff-review:sidebar-width` (R7)
- All local-only, no transmission

## ARIA + HTML injection

- **Review**: All new aria-* attributes use static strings (no template injection)
- **i18n STRINGS table**: Static literals, no user input flows through translate()
- **Verdict**: PASS — no XSS risk introduced

## Modal Escape handlers

- **installModalA11y()**: Escape key calls close() callback, not arbitrary user-controlled function
- **Tab cycle**: Bounded to focusable children inside dialog (focus trap, no escape to outside content)
- **Verdict**: PASS — no privilege escalation or focus hijacking risk

## GitHub auto-close integrity

- Commit message `close #33 #37 #38` syntax correct
- After push, gh issue list shows all 3 issues moved to CLOSED state
- Lead-direct verification confirmed: #33 CLOSED, #37 CLOSED, #38 CLOSED

## Side-channel: Mock data, telemetry

- No new telemetry added in R19
- No mock data files modified
- No external API calls
- **Verdict**: PASS — no privacy concerns

## Verdict: PASS

No security/privacy issues found. All R19 changes are client-side UI additions with no data exfiltration or injection risks.

## Issues found

- None

## Sign-off

Lead-direct verdict: **PASS**.