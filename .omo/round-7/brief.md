# Round 7 Brief — R4 MINOR Bundle (R4 MINOR #1 + #2)

> **Date**: 2026-06-29
> **Author**: Round 7 PM Triage
> **Status**: PM brief, awaiting PM Manager review
> **Source**: R4 retro Followup items (R4 MINOR #1, R4 MINOR #2 per R6 retro relabeling) — both still in backlog at R6 closure
> **Pre-check result**: PASS (R6 SHA verification written in ## Source for PM Manager reuse — Patch G optimization)

## Title
Polish the dashboard's loadPriorNotes tab-switch race condition + add a UX hint to the Conversation panel about the prior-rounds-only scope.

## Source
- **R4 retro Followup items**: `.omo/round-4/retro.md:44-46` — R4 MINOR #1 (AbortController for `loadPriorNotes`), R4 MINOR #2 (UI hint "current round in Conversation"; originally R4 retro #3, relabeled to #2 in R6 retro to match user-facing naming).
- **R6 retro Followup items**: `.omo/round-6/retro.md:37` — "R4 MINOR #1, #2: Still in backlog (AbortController for loadPriorNotes, UI hint 'current round in Conversation'). Defer to R7 or later." Confirmed at R6 closure.
- **R6 audit-trail code-commit verification**: ALL 5 R6 SHAs verified OK via `git cat-file -e` — 2511216 ✓ 9d3df0a ✓ 78880d1 ✓ 658f122 ✓ 6983a0a ✓. R6 audit-trail is grounded.
- **Verified file:line citations**:
  - `src/ui/app.ts:1894` — `async function loadPriorNotes(): Promise<void> {` — current implementation has no `AbortController`; the `fetch(endpoint("/prior-notes"))` call at line 1898 is fire-and-forget, the catch at line 1907 silently swallows all errors, and `state.priorNotes` is mutated unconditionally at line 1906.
  - `src/ui/app.ts:1334` — call site in `renderActivePane()`: `void loadPriorNotes().then(() => { if (state.activeTab === "previously") renderPreviouslyPane(); });` — fire-and-forget pattern; the post-fetch `state.activeTab` check at line 1335 already guards the *render* but not the *state mutation*, so an in-flight fetch that resolves after a tab switch will still overwrite `state.priorNotes`.
  - `src/ui/app.ts:1609` — `function renderConversationPanel(root: HTMLElement) {` — top of the Conversation panel render function; the current round's findings come from `state.fresh` (line 1618) which is added unconditionally to `entries`, but the "Previously discussed" 4th tab is the one that *excludes* the current round (per the comment at lines 1913-1914 in `renderPreviouslyDiscussedPanel`).
  - `src/ui/app.ts:1912-1914` — `function renderPreviouslyDiscussedPanel(root: HTMLElement) { // Exclude the current round — the panel is "previously" (prior rounds only); the current round is already covered by the Conversation tab.` — this comment is a CODE comment, not a USER-facing hint. The user has no way to learn this rule from the UI.

## User pain (1-3 sentences, user terms)
After R4 shipped the "Previously discussed" panel, two minor UX issues remain: (1) If a reviewer clicks the "Previously discussed" tab to fetch prior notes then quickly switches to another tab, the in-flight fetch may resolve and update state for the wrong tab — a subtle race condition that can cause stale or inconsistent renders; (2) The Conversation tab shows the current round's findings but the "Previously discussed" tab shows ONLY prior rounds (not the current round) and there is no user-facing text explaining this split, so users may wonder where the current round's prior findings went when they click the 4th tab. Both are user-visible polish items that make the dashboard feel more responsive and clearer.

## Candidates ranked (2 sub-candidates, bundled)

### Sub-candidate #1 — AbortController for `loadPriorNotes` (R4 MINOR #1)
> **As a** reviewer who quickly switches between sidebar tabs (Files Changed / Commits / Conversation / Previously discussed),
> **I want** in-flight prior-notes fetches to be cancelled when I leave the "Previously discussed" tab,
> **So that** the response doesn't update `state.priorNotes` for the wrong tab and cause stale or out-of-order renders.

- **User value**: 3/5 (medium; affects reviewers who switch tabs quickly; subtle but real; zero visible artifact on success)
- **File:line evidence (verified)**:
  - `src/ui/app.ts:1894` `async function loadPriorNotes(): Promise<void>` — current signature takes no `AbortSignal`.
  - `src/ui/app.ts:1898` `const response = await fetch(endpoint("/prior-notes"));` — no `signal` option passed.
  - `src/ui/app.ts:1906` `state.priorNotes = Array.isArray(data.rounds) ? data.rounds : [];` — unconditional state mutation; would still write even if the user already left the tab.
  - `src/ui/app.ts:1334-1336` — call site is `void loadPriorNotes().then(...)` (fire-and-forget, no abort hookup).
- **What's missing for the user**:
  - `loadPriorNotes` does not take an `AbortSignal` parameter.
  - No `signal` is passed to `fetch(...)`.
  - No `signal.aborted` check before mutating `state.priorNotes`.
  - No `.catch(AbortError)` to silently ignore cancellation.
  - The `renderActivePane` function at line 1322 does not abort the previous fetch when the user switches away from `"previously"`.
- **LOC**: ~10-15 (add `AbortController` instance on `state` or as a module-level var; pass `signal` into `loadPriorNotes`; pass `signal` to `fetch`; check `signal.aborted` before mutating `state.priorNotes`; abort the prior controller in `renderActivePane` when `state.activeTab !== "previously"`; catch and ignore `AbortError`).
- **Files**: 1 (`src/ui/app.ts`)
- **Test**: Add 1-2 unit tests for AbortController behavior (mock fetch to return a never-resolving promise, call `loadPriorNotes`, abort via the signal, assert no state mutation; one more for "abort before fetch even starts" to cover the post-abort path). Add 1 Playwright scenario that clicks "Previously discussed" then quickly switches to "Conversation" and asserts the prior-notes state does not get clobbered.

### Sub-candidate #2 — UI hint "current round in Conversation" (R4 MINOR #2)
> **As a** reviewer using the "Previously discussed" tab,
> **I want** a small subheader at the top of the panel explaining that it shows prior rounds only,
> **So that** I don't get confused about where the current round's findings are (they're in the Conversation tab).

- **User value**: 2/5 (low; documentation hint, no behavior change; clarifies existing behavior)
- **File:line evidence (verified)**:
  - `src/ui/app.ts:1912` `function renderPreviouslyDiscussedPanel(root: HTMLElement) {` — entry point.
  - `src/ui/app.ts:1913-1914` — code comment: `// Exclude the current round — the panel is "previously" (prior rounds only); the current round is already covered by the Conversation tab.` This is a developer comment, not visible to the user.
  - `src/ui/app.ts:1929-1934` — empty-state branch renders `"No prior discussion yet. Submit a round to start the history."` (which already has a user-facing message); the non-empty branch (line 1937+) renders round sections directly with no header explaining the scope.
- **What's missing for the user**: No user-facing text explains the prior-rounds-only scope. A reviewer landing on this tab on round 2+ may not know whether the current round is included or excluded, and the existing code comment that documents the rule is invisible to them.
- **LOC**: ~10 (add a small `<header>` or `<p class="previously-panel-hint">` element near the top of the panel with text like "Showing prior rounds only. The current round's findings are in the Conversation tab."). Pure DOM construction in `renderPreviouslyDiscussedPanel`; no new payload or state.
- **Files**: 1 (`src/ui/app.ts`)
- **Test**: Add 1 Playwright scenario for the new scenario file (e.g. `previously-discussed-hint`) — click the "Previously discussed" tab on round 2+, assert the hint text is present in the panel header. No unit test needed (pure DOM).

## Scope buckets

### Bucket A: bundled #1 + #2 [recommended, user-picked]
- Contains: sub-candidate #1, sub-candidate #2
- Combined user value: 4/5 (race-condition fix + clarification hint; both touch the same file, so the dev cycle is cheap)
- Files touched: 1 (`src/ui/app.ts`; both sub-candidates touch this file)
- Combined LOC: ~20-25 (10-15 for #1, 10 for #2; plus 1-2 small DOM additions in #2 and 1 controller hookup in #1)
- Why this bucket: Both sub-candidates touch `src/ui/app.ts` and address UX polish for the conversation/prior-notes flow. Tight scope, low risk, high signal. R6 retro's "minor polish is fine" guidance applies; both items have been in the backlog for 3 rounds (R4 → R5 → R6 → R7) and bundling them avoids 2 more rounds of overhead.

### Bucket B: single sub-candidate #1 alone (AbortController only)
- Contains: just the AbortController fix
- Combined user value: 3/5 (subtle race fix only)
- Files touched: 1
- Combined LOC: ~10-15
- Why this bucket: Smallest possible scope; would resolve the more technical of the 2 polish items first and leave #2 for R8+.

### Bucket C: single sub-candidate #2 alone (UI hint only)
- Contains: just the UI hint
- Combined user value: 2/5
- Files touched: 1
- Combined LOC: ~10
- Why this bucket: Smallest possible scope; would resolve the user-facing clarity issue but leave the race condition.

## Recommended candidate
**Bucket A** (bundled #1 + #2).

R6 retro's "minor polish is fine" guidance applies here, and both items have been in the backlog for 3 rounds (R4 retro → R5 → R6 retro → R7). Bundling them in a single 1-file change with a small test surface is the lowest-overhead way to clear them. R7 backlog is currently only 2 candidates — both of them — and the R6 retro flag of "backlog-freshness gate: need fresh investigation for R7" is partially satisfied by R6 retro's note that R5 MINOR #1/2/3 already shipped (depleting that source); R4 MINOR #1 + #2 are the only carry-over items, and bundling them is the right call.

## Self-Critique
- **Clarity**: 4/5. Sub-candidates are clear and well-scoped.
- **Hidden ambiguities**:
  - **#1's AbortController fix requires understanding the existing tab-switch mechanism** — specifically where the "active tab" state lives (line 1322-1339, `renderActivePane`) and how to hook abort into it. The fix needs to abort the previous fetch when `state.activeTab` changes away from `"previously"`. Dev should trace this carefully; the cleanest pattern is a module-level `priorNotesController: AbortController | null` that's aborted at the top of `renderActivePane` when the new active tab is not `"previously"`.
  - **#1's `state.priorNotesLoaded` flag at line 1895 short-circuits subsequent calls** — even after the first load. If the user wants to *re-fetch* (e.g. after a tab switch + re-visit), the abort path needs to clear this flag (or the abort path is fine because the short-circuit returns early and the abort is on the in-flight call, not the cached one). Dev should verify the interaction.
  - **#1's catch block at line 1907 silently swallows `AbortError`** — which is correct (we want to ignore cancellation), but the dev should use `signal.aborted` check before mutation as the primary guard, and only let the `AbortError` fall through to the catch as a safety net.
  - **#2's hint placement** — at the top of the panel (above the first round section) is the natural place, but the dev may want to consider whether to show the hint only on round 2+ (when there's actual content) or always (to teach the rule from the start). The empty-state branch at line 1929-1934 already shows a different message; the hint should not appear there because the empty state is self-explanatory.
- **Risks**:
  - #1 changes a state-mutation path — small regression risk; mitigated by 1-2 unit tests + 1 Playwright scenario.
  - #2 is a pure DOM addition — near-zero risk; mitigated by 1 Playwright scenario.
  - Both changes are localized to `src/ui/app.ts`; no state.json schema change, no new payload field, no new dependency.
- **Tests**:
  - #1 needs unit test for `signal.aborted` handling (mock fetch to return a never-resolving promise, abort, assert `state.priorNotes` unchanged).
  - #1 needs 1 Playwright scenario for the tab-switch race (click "Previously discussed" → click "Conversation" quickly → assert no state-clobber).
  - #2 needs 1 Playwright scenario verifying the hint renders in the panel header on round 2+ (and is hidden in the empty-state branch).
- **Out of scope (intentionally)**:
  - No regression on the existing 14 e2e scenarios (R4 added `previously-discussed-panel`; R6 has 16 total; both should still pass).
  - No state.json schema change.
  - No new dependency.

## User-impact profile

```yaml
user_impact_profile:
  pm_source: "user (R4 retro Followup items, deferred through R5+R6; R6 retro relabeled MINOR #2 and #3 as #1 and #2 in the carry-over summary)"
  U_size: "small (1 user-visible file: src/ui/app.ts)"
  U_files: "small (1 file; src/ui/review.html not needed — DOM construction is done in TS)"
  U_new_capability: no
  U_behavior_shift: no  # same behavior, just better: #1 fixes a silent race; #2 adds a docs hint
  U_user_visible: yes  # #1 is a silent fix (visible only on failure); #2 is a visible hint
  U_data_shape_breaking: no
  U_data_safety: no
  U_installs_new_dep: no
  recommended_profile_override: feature
```

## Profile recommendation
PM's intuition: **feature**. Lead validates: Rule 2 (feature) = U_user_visible=yes AND total >= 3 ✓. All phases run (incl. 5 lens for feature profile + full Playwright walkthrough for UI changes). Total impact score: U_size=0 + U_files=1 + U_user_visible=2 = 3 (Rule 1 needs >= 8 → skip; Rule 3 default → not bugfix; Rule 2 → feature).
