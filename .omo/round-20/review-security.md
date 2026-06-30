# R20 Lens #4 — Security / Privacy / Integrity

> **Reviewer**: lead (R4 retro Gap 2 default)
> **Date**: 2026-06-30
> **Scope**: 3 new localStorage keys + 1 dynamic dropdown

## localStorage key exposure

### `diff-review:filter-unread` (R20 #41)
- **Storage location**: Browser localStorage (client-side, not transmitted)
- **Value**: `"on"` or `"off"` (boolean as string)
- **Sensitivity**: NONE (UI preference, not PII)
- **Verdict**: PASS — no security concern

### `diff-review:recent-searches` (R20 #42)
- **Storage location**: Browser localStorage (client-side, not transmitted)
- **Value**: JSON array of strings (max 5)
- **Sensitivity**: NONE (search history is a UI preference; not PII; can be cleared by user)
- **Verdict**: PASS — no security concern

### `diff-review:language` (R19 preserved)
- **Verdict**: PASS (unchanged from R19)

## ARIA + DOM injection (R20 #41 filter chip + #42 dropdown)

- **Filter chip**: `<input type="checkbox">` — no innerHTML injection risk
- **Search history dropdown**: dynamically built via `textContent` (not innerHTML), no user-provided HTML rendered
- **Recent search items**: `query` stored as string, rendered via `textContent`
- **Verdict**: PASS — no XSS risk introduced

## localStorage quota

- 3 keys total: `language` (~10 bytes) + `filter-unread` (~5 bytes) + `recent-searches` (~300 bytes for 5 searches × 50 chars each) + `diff-search-query` from R13 (~200 bytes)
- Total: ~515 bytes
- Quota: 5MB
- **Verdict**: PASS — well under quota

## GitHub auto-close integrity

- Commit messages use `close #40 #41 #42` syntax correctly
- After push, gh issue list shows all 3 issues CLOSED
- Lead-direct verification: #40 CLOSED, #41 CLOSED, #42 CLOSED

## Side-channel: Mock data, telemetry

- No new telemetry added in R20
- No mock data files modified
- No external API calls
- **Verdict**: PASS — no privacy concerns

## Verdict: PASS

No security/privacy issues found. All R20 changes are client-side UI additions with no data exfiltration or injection risks.

## Issues found

- None

## Sign-off

Lead-direct verdict: **PASS**.