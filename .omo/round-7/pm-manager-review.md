# Round 7 PM Manager Review

> **Date**: 2026-06-29
> **Reviewer**: Round 7 PM Manager
> **Verdict**: APPROVE
> **Pre-check result**: PASS (reused from PM Triage brief.md ## Source — Patch G optimization honored)

## Pre-check (code-commit verification)

Reused PM Triage's result from brief.md line 15: "R6 audit-trail code-commit verification: ALL 5 R6 SHAs verified OK via `git cat-file -e` — 2511216 ✓ 9d3df0a ✓ 78880d1 ✓ 658f122 ✓ 6983a0a ✓." Independently spot-checked all 5 SHAs (`git cat-file -e` per SHA, all returned exit 0) — PM Triage's pre-check is accurate; R6 audit-trail is grounded. No re-run of the verification logic; only re-confirmed PM Triage's `git cat-file -e` exit codes per the Patch G optimization.

## Sub-candidate evaluation

### #1 — AbortController for loadPriorNotes

- **Real user pain**: Confirmed at `src/ui/app.ts:1894-1909` — `loadPriorNotes` fires `fetch(endpoint("/prior-notes"))` at line 1898 with no signal, mutates `state.priorNotes` unconditionally at line 1906, and the catch at line 1907 silently swallows every error including cancellation. Call site at line 1334-1336 is `void loadPriorNotes().then(...)` with no abort hookup, so a quick tab switch can let the response overwrite `state.priorNotes` for the wrong tab. Real (subtle) race; not hypothetical.
- **Pseudo-requirement markers**: None. No DUPLICATE (current `loadPriorNotes` takes no `AbortSignal`; `fetch` has no `signal` option; no `signal.aborted` check exists anywhere in the function). No SPECULATION (R4 retro followup at `.omo/round-4/retro.md:45`; confirmed still-in-backlog at R6 retro line 37; two real prior rounds of intent). No CONTRADICTION (R6 retro line 37 explicitly defers to "R7 or later"). Not INFLATED (~10-15 LOC, 1 file, 1-2 unit + 1 Playwright scenario). Not OBSCURE (the 4-tab sidebar including "Previously discussed" is a real shipped UI feature documented in README "Review UI" section). Not AUDIT_TRAIL_FABRICATED (R6 SHAs all `git cat-file -e` OK).
- **Verdict**: APPROVE

### #2 — UI hint "current round in Conversation"

- **Real user pain**: Confirmed at `src/ui/app.ts:1912-1914` — `renderPreviouslyDiscussedPanel` has a developer comment "Exclude the current round — the panel is 'previously' (prior rounds only); the current round is already covered by the Conversation tab." This comment is at line 1913 (code only, never rendered). The non-empty branch starting at line 1937 has no `<header>` explaining scope; the empty-state branch at 1929-1934 has its own message ("No prior discussion yet...") and is self-explanatory. A reviewer on round 2+ landing on this tab sees round sections with no hint that the current round is intentionally absent. Real clarity gap; not hypothetical.
- **Pseudo-requirement markers**: None. No DUPLICATE (no `<header>` or hint element exists in the non-empty branch — lines 1937+ directly constructs `<section class="previously-round">` without any panel-scoped subheader). No SPECULATION (R4 retro line 46 followup; R6 retro line 37 still-in-backlog; real provenance). No CONTRADICTION. Not INFLATED (~10 LOC, 1 file, 1 Playwright scenario, pure DOM). Not OBSCURE (same real reviewer persona as #1). Not AUDIT_TRAIL_FABRICATED.
- **Verdict**: APPROVE

## Bundle coherence

Natural. Both sub-candidates live in `src/ui/app.ts` and both serve the "Previously discussed" panel flow — #1 hardens the data-fetch path that backs the panel (`loadPriorNotes` → `state.priorNotes` → consumed at line 1926 in the panel), and #2 adds user-facing documentation at the panel's render site (`renderPreviouslyDiscussedPanel`, line 1912). The two changes share a code surface (1 file) and a conceptual surface (UX polish for the same panel) without overlapping at the line-of-code level — #1 is fetch + state mutation guard, #2 is DOM construction in a different function. Cross-candidate synergy is real but mild: a reviewer who benefits from the hint (#2) is the same reviewer who might tab-switch quickly (#1), and both are bundled into a single `src/ui/app.ts` diff that's easier to review + test than two separate rounds. Not forced.

## Profile validation

PM Triage says `feature`. Per Rule 2 (feature) = `U_user_visible=yes AND total >= 3`:

| Field | Value | Score |
|---|---|---|
| U_size | small | 0 |
| U_files | small (1 file) | 1 |
| U_new_capability | no | 0 |
| U_behavior_shift | no | 0 |
| U_user_visible | yes (#1 silent race fix visible only on failure; #2 visible hint) | 2 |
| U_data_shape_breaking | no | 0 |
| U_data_safety | no | 0 |
| U_installs_new_dep | no | 0 |
| **Total** | | **3** |

Rule 2 matches: `U_user_visible=yes` ✓ AND total `3 >= 3` ✓ → feature profile correct.

Rule 1 (total >= 8): 3 < 8 → not bugfix.
Rule 3 (default): not bugfix.

Profile verdict: **feature** ✓ (matches PM Triage).

## Overall verdict

**APPROVE**

Both sub-candidates are real user needs with prior-retro provenance, accurate file:line citations, no pseudo-requirement markers, and natural bundle coherence. R6 audit-trail is grounded. Profile correctly identified as feature.

## Action items

None (no CLARIFY/REJECT). Notes for downstream roles (Architect / Dev / Tester):

- **Dev for #1**: `state.priorNotesLoaded = true` is set at line 1896 *before* the await, so a subsequent call after a successful load short-circuits via line 1895. The AbortController must be aborted-and-discarded on tab switch (not just aborted), so a re-entry to "previously" creates a *new* controller and a fresh fetch. Module-level `let priorNotesController: AbortController | null = null`; call `priorNotesController?.abort()` at top of `renderActivePane` when `state.activeTab !== "previously"`. Do not `state.priorNotesLoaded = false` on abort — keep the cache valid for in-flight cancellation, but reset only on explicit refresh.
- **Dev for #1**: The catch at line 1907 currently swallows every error. Add a `signal.aborted` check immediately before the state mutation at line 1906 as the primary guard, and let `AbortError` (DOMException name "AbortError") fall through silently in the catch — both are needed because the signal-aborted check covers the success-path case where data was parsed but the user already left.
- **Dev for #2**: Place the hint at the top of the panel in the *non-empty* branch only (between line 1936 and the loop at 1937). Do not place it in the empty-state branch (line 1929-1934) — the empty-state message "No prior discussion yet..." is self-explanatory. Consider showing the hint only when `currentRound > 1` (round 1 is implicitly obvious from the empty state); this is a small UX nicety, not a correctness issue.
- **Tester**: Per `.opencode/skills/review-dashboard-ui-test/` — add 1 scenario file `previously-discussed-race.ts` (or similar) for #1's tab-switch race, and 1 scenario file `previously-discussed-hint.ts` for #2's hint visibility. Verify all 16 existing e2e scenarios still pass (R4 added `previously-discussed-panel`; R6 has 16 total per R6 retro).