# Lens #4: Security — Round 14

> **Verdict: PASS** — All 3 features are client-side state-only; no network surface added; `lastSavedAt` field is non-sensitive; auto-save indicator doesn't leak data over network; sort/filter reducers operate on already-trusted state.
> **Lead-synthesized** (R5 default + Patch H).

## TL;DR
R14 introduces no new server-side endpoints, no new input validation surface, and no new client-side attack vectors. All 3 features are pure client-side UX improvements:
1. Sort dropdown reads existing `state.existing_findings + state.fresh` (already-validated data) — no new input
2. Previously-discussed filter reads existing `state.findings` (already-validated data) — no new input
3. Auto-save indicator reads new `state.draft.lastSavedAt?: number` field — populated by server-controlled `scheduleSave()` after `await saveState()` resolves (server-side timestamp source)

No XSS surface. No PII. No new deps. No new server-side code (all 3 features are UI-only).

## Threat model

| Threat | Where exposed | Mitigation in R14 | Mitigation across repo |
|---|---|---|---|
| XSS via user-supplied content | Sort dropdown options: "Newest/Oldest/Severity/File" — fixed enum, no user input | `<select>` element with hardcoded option values — no injection vector | All existing UI uses `escape()` for user-supplied fields; R14 introduces no new user-string rendering |
| Stale state attack | Sort/filter reducers operate on `state.findings[]` (already server-validated) | Reducers are pure functions of state — no fetch, no write | Existing pattern: `state` is server-controlled via `saveState` atomic-write (R1 invariant) |
| Timestamp manipulation | `Draft.lastSavedAt?: number` populated server-side via `scheduleSave` after `await saveState()` | Field is set by code path, NOT user input — client only displays it | Same as R10 auto-save flow pattern; `setStatus` toast previously leaked timestamp info via toast text — R14 is no worse |
| localStorage tampering | `state.sortFindingsBy` persists via `readStored`/`writeStored` localStorage helpers | Invalid values fall back to "newest" (defensive default) — no crash, no privilege escalation | Same `try/catch` pattern as R12 n/p keyboard nav (per plan AC2) |
| Filter race condition | `state.previouslyFilterByRound` is in-memory only (per plan AC5) | No persistence — state reset on reload, no stale data attack | Mirror R12 `currentFindingIndex` in-memory pattern |
| Indicator side-channel | `Draft.lastSavedAt` reveals approximate save timing | Field is client-side display only; not exposed in submit payload | Existing `setStatus` toast also revealed save timing — R14 is no worse |
| Resource exhaustion | Auto-save indicator `setInterval(5000)` ticks forever | Plan hand-off item 8 includes cleanup on unmount | Same pattern as R12 keyboard nav `keydown` listener |

## Findings by severity

### CRITICAL (must fix before merge — exploit possible)
**None.**

### HIGH (should fix — exploit possible with constraints)
**None.**

### MEDIUM (defense-in-depth gap)
**None.**

### LOW (informational)
- **L.1** R14 README bullets could mention that the auto-save indicator is fully client-side (no network exposure) — informational for paranoid users. **Defer to R15 doc touch-up.**
- **L.2** `src/format-utils.ts` uses `Date.now()` for time-since-save calculation. If device clock is wrong, indicator will reflect wrong time. **Acceptable** — same as existing `setStatus("Draft saved at HH:MM:SS")` pattern.

## Threat-model summary

All 7 identified threats are mitigated by R14's design choices + inherited R1-R13 patterns. Two informational items (L.1, L.2) are defer items consistent with existing code base.

## Verdict: PASS
Security posture is consistent with R1-R13 patterns. All 3 R14 features are pure client-side state improvements. No new PII surface. No XSS vector. No new server-side code. Idempotent / pure-function reducers. Auto-save indicator reads server-populated timestamp only.