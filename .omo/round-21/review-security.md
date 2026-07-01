# R21 Review — Security

> **Generated**: 2026-06-30
> **Lens**: L3 — Security review
> **Round**: 21 · **Merge SHA**: `7a4c045`

## Threat model

R21 adds 1 polish (debounce) + 1 feature (settings modal). Both are UI-only, no server interaction, no new attack surface beyond localStorage.

## Checks performed

### XSS (Cross-Site Scripting)
- **#43 debounce**: input comes from `<input>` element, only reads `.value` (already sanitized by browser). No `innerHTML` or `eval`. ✓
- **#44 settings modal**: all rendered strings are static STRINGS entries (i18n) or controlled `<select>` options. No `innerHTML`. ✓

### localStorage poisoning
- **#43**: localStorage key `diff-review:recent-searches` unchanged. Reads use JSON.parse which is wrapped in try/catch (existing pattern in `getRecentSearches`). ✓
- **#44**: 6 localStorage keys read/write. All go through existing setter functions (`setTheme`, `setLayout`, `setLanguage`, etc.) which validate values. Reset clears keys explicitly. ✓

### Focus-trap bypass (a11y security)
- **#44**: modal uses `installModalA11y` from R19, which includes focus trap. Bypass would require DOM manipulation, which is out of scope for XSS-free apps. ✓

### Information disclosure
- **#43**: recent-searches already stored in localStorage (no change). Search queries are user-only, never sent to server. ✓
- **#44**: settings stored in localStorage (theme/layout/language) — already exposed by R19 settings. No new disclosure. ✓

### Denial of service
- **#43**: debounce timer is O(1) per keystroke, cleared on cancel. No DoS vector. ✓
- **#44**: settings modal renders static markup, no infinite loops or expensive computations. ✓

### Authentication / Authorization
- Not applicable — R21 is local-only, no server interaction.

## Input validation
- **#44 Reset button**: explicit "Reset to defaults" — no destructive action on accidental click. ✓
- **#44 Settings change**: each setting change is bounded by `<select>` options (no free text). ✓

## Sensitive data handling
- No new sensitive data. All settings are user preferences, not credentials.

## Verdict

**PASS** — no new attack surface, no regressions. R21 is a UI-only change that respects existing R19-R20 a11y + security patterns.