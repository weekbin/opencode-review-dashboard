# Round 8 Brief — Fresh User-Stories (backlog-freshness gate)

> **Date**: 2026-06-29
> **Author**: Round 8 PM Triage
> **Status**: PM brief, awaiting PM Manager review
> **Source**: R7 closure (R5+R6+R7 polish all shipped; #7/#8/#9 closed per Gap K) + PM self-investigation per backlog-freshness gate
> **Pre-check result**: PASS — all 9 R7 SHAs verified, see `## Source` block for canonical pre-check writeup

## Title

R8 ships **reviewer ergonomics for the multi-round review dashboard** — universal text search across all 4 sidebar tabs (Files / Commits / Conversation / Previously discussed) plus full keyboard navigation of those tabs, so a reviewer with 3+ rounds and 30+ findings can find any finding, switch any tab, and stay on the keyboard the entire review session.

## Source

- **R7 closure status**: `.omo/round-7/decision.md` confirms SHIP. R7 retro (`retro.md:40`) identifies NO remaining bugfixes — "R4 MINORs now all done", "backlog-freshness gate must surface fresh user-stories (R5/R6 polish done)". Backlog is genuinely empty.
- **R5 polish**: SHIPPED in R6 (CJK regex widen + threshold constants + 2-README sync) — commits `2511216`, `9d3df0a`, `78880d1`
- **R4 polish**: SHIPPED in R7 (AbortController for loadPriorNotes + UI hint for Previously discussed) — commits `f96c1e4`, `69b4e1f`, `e2e6efc`, `4ce6457`
- **Closed GitHub issues**: #7/#8/#9 closed retroactively per Gap K (R7 commit `5babc0b` skill patch). Backlog re-validated as empty.
- **R7 audit-trail code-commit verification**: ALL 9 R7 SHAs verified OK via `git cat-file -e` — f96c1e4 ✓ 69b4e1f ✓ e2e6efc ✓ 4ce6457 ✓ 23a3775 ✓ 1770478 ✓ de30bb8 ✓ 5babc0b ✓ 14575f9 ✓. R7 audit-trail is grounded.
- **R7 brief self-investigation observations** (read on current main `14575f9`):
  - `src/ui/review.html:1747-1768` — `navbar-tabs` has 4 buttons (`data-tab="files|commits|conversation|previously"`) with `aria-pressed` but no `<button role="tab" aria-selected>` semantics. The 4 sidebar tabs are NOT a true tablist — they switch panes via `setActiveTab` (`src/ui/app.ts:478-490`).
  - `src/ui/app.ts:492-497` — `navbarTabs.addEventListener("click", ...)` is the ONLY listener on the tablist. Zero `keydown` handler. Keyboard-only users can Tab-focus each button (browser default) but must press Space/Enter to activate — no Arrow-key navigation between tabs.
  - `src/ui/app.ts:620-642` — for comparison, the `sidebarResizer` HAS a `keydown` handler with `ArrowLeft/ArrowRight/Home/End` (a11y pattern proven elsewhere in this same file).
  - `src/ui/review.html:1826` and `review.html:1832` — `conversation-list` and `previously-list` are static `<div>` containers with NO `<input type="search">` or any text-filter affordance. The Conversation tab has only the 3-button `conversation-filter` (open/resolved/all) at `app.ts:499-527` — no text match.
  - `src/ui/app.ts:1714-1748` — `renderConversationPanel` shows buttons Remove (fresh) / Resolve (open) / Reopen (resolved). The `else if (isResolved && !isStale)` condition INTENTIONALLY excludes stale findings, so a `closed_auto` (stale) finding has NO action button at all (only "Jump"). This is a real gap.
  - `src/index.ts:1796-1804` — server `/api/review/:id/reopen` handler explicitly rejects any status other than `"resolved"` (returns 400 `cannot reopen (status: closed_auto)`). So the gap is TWO-part: client UI hides the action AND server would reject it. Fixing either side alone is incomplete.
  - `src/ui/app.ts:2458-2481` + `src/index.ts:1728-1745` — auto-save draft to disk **ALREADY EXISTS** (PUT `/api/review/:id/draft`, 250ms debounce, atomic writes). The README claim at line 132 is correctly backed. **NOT a candidate** — surfaces PM's self-investigation rigor: R7 brief's `auto-save draft` suggestion was checked and rejected as already-shipped.

## User pain (1-3 sentences, user terms)

When you run `/diff-review-dashboard` against a real PR with 3+ rounds, you end up with 20-40 findings scattered across the 4 sidebar tabs — but **there is no way to search for a specific finding by file, comment text, or category**, and the tabs themselves are mouse-only (no Arrow-key navigation). A reviewer who wants to "find the conversation about `state.json`" or "the bug-severity findings" has to scroll/eyeball every entry, and a keyboard-only reviewer cannot switch between Files/Commits/Conversation/Previously at all (each tab must be Tab-focused individually then Space-activated — no Arrow keys work, no listbox semantics).

## Candidates ranked (3-5 fresh user-stories)

### Candidate #1 — In-tab text search across all 4 sidebar panels [RECOMMENDED for Bucket A]

> **As a** reviewer on round 3+ with 20+ findings,
> **I want** a search input at the top of each sidebar tab (Files / Commits / Conversation / Previously discussed) that filters the list by file path, comment text, category, or severity,
> **So that** I can find a specific finding in <2 seconds without scrolling/eyeballing.

- **User value**: 4.5/5 — universal pain that scales with round count; without it, every multi-round review degrades into scroll-hunting
- **File:line evidence**:
  - `src/ui/review.html:1826` (`#conversation-list`) and `review.html:1832` (`#previously-list`) are static `<div>` containers with zero text-filter UI
  - `src/ui/review.html:1788-1796` (`#sidebar > #file-list`) — same pattern, no search
  - `src/ui/app.ts:1612-1852` (`renderConversationPanel`) — sorts and filters by status only (line 1646-1651), no text match anywhere
  - `src/ui/app.ts:499-527` — only filter logic that exists is the 3-button `open/resolved/all` conversation filter
  - `src/ui/app.ts:1918-2065` (`renderPreviouslyDiscussedPanel`) — groups by round but provides no per-round text search
- **What's missing for the user**: a single `<input type="search">` above each tab's list, with debounced (150ms) text matching on (a) file path, (b) comment text, (c) category/severity, (d) thread comment text. Empty input = full list. Match highlighting in body text is nice-to-have but not required.
- **LOC**: ~100-140 (4 input handlers + 4 filter passes in render*Pane functions, plus CSS for the search bar)
- **Files**: 2 (`src/ui/app.ts`, `src/ui/review.html` for the search input CSS)
- **Test**: unit tests on the 4 filter functions (case-insensitive substring match on each surface area); 1 e2e scenario "type in search → list filters → clear → list restores"
- **Risk**: the `searchFiles` from R7's R6/CJK work is unrelated; this is new. Debouncing matches the existing `scheduleSave` 250ms pattern at `app.ts:2476-2481`.

### Candidate #2 — Sidebar tabs keyboard navigation (Tab/Shift+Tab/Arrow keys + ARIA tablist) [RECOMMENDED for Bucket A]

> **As a** keyboard-only reviewer (or anyone using a screen reader / Vim mode),
> **I want** Arrow keys to switch between the 4 sidebar tabs, `Home`/`End` to jump to the first/last, and proper `role="tablist"` + `aria-selected` semantics,
> **So that** I can navigate the entire review without touching the mouse and assistive tech announces the tab structure correctly.

- **User value**: 3.5/5 (HIGH a11y value, MEDIUM user-count value) — affects every keyboard-only user + screen-reader user, but mouse users see no benefit
- **File:line evidence**:
  - `src/ui/review.html:1747-1768` — `nav class="navbar-tabs"` uses 4 `<button data-tab="..." aria-pressed="...">` but no `role="tablist"` / `role="tab"` / `aria-selected` semantics
  - `src/ui/app.ts:492-497` — `navbarTabs.addEventListener("click", ...)` is the ONLY listener. No `keydown` handler at all.
  - `src/ui/app.ts:620-642` — the same file's `sidebarResizer` already implements the a11y pattern (ArrowLeft/Right/Home/End → adjust width), so the keyboard-nav pattern is proven in this codebase.
- **What's missing for the user**: a `keydown` handler on `navbarTabs` that intercepts ArrowLeft/ArrowRight (cycle through the 4 tabs in declared order), Home/End (jump to first/last), and adds the WAI-ARIA Authoring Practices tablist pattern (roving tabindex, `aria-selected` synced with `aria-pressed`).
- **LOC**: ~40-60 (1 keydown handler + 4 buttons get `role="tab"` + 1 nav wrapper gets `role="tablist"` + small CSS focus-visible tweak)
- **Files**: 2 (`src/ui/app.ts`, `src/ui/review.html`)
- **Test**: unit test on the keydown handler (Left arrow from "files" → "previously", Right arrow from "previously" → "files", Home → "files", End → "previously"); 1 e2e scenario "Tab to tablist → Arrow keys cycle tabs → screen-reader-friendly state"
- **Risk**: minimal. Pattern is borrowed from the existing resizer handler. No new state — just keyboard wiring of existing `setActiveTab`.

### Candidate #3 — Multi-select findings for batch actions (Conversation panel) [Bucket B alternative]

> **As a** reviewer with 15+ open findings on a single round,
> **I want** checkboxes next to each finding in the Conversation panel and a "Resolve selected" / "Reopen selected" toolbar,
> **So that** I can mark many findings as resolved in one action instead of clicking 15 individual buttons.

- **User value**: 4/5 — high pain for the exact reviewer persona that uses this dashboard (multi-round, multi-finding), but smaller surface area than #1 (only the Conversation panel benefits; the other 3 panels don't have a "resolve" verb)
- **File:line evidence**:
  - `src/ui/app.ts:1612-1852` (`renderConversationPanel`) — currently each item has at most 1 button (Remove/Resolve/Reopen) but NO checkbox for selection
  - `src/ui/review.html:1812-1827` (`#conversation-list` and `pane-toolbar` with `#conversation-filter`) — toolbar exists for the 3-button filter; perfect place to add a "Resolve N selected" button next to the filter
  - `src/ui/app.ts:2213-2254` — `resolveFinding(id)` and `reopenFinding(id)` are single-id POST handlers; trivially batchable into `resolveFinding([id1,id2,...])` or a new `POST /bulk-resolve` endpoint
- **What's missing for the user**: a checked-state set in `state`, a checkbox per `.conversation-item`, a toolbar at the top of the Conversation pane with "Resolve selected" / "Reopen selected" / "Select all visible" buttons, and a `POST /api/review/:id/bulk-resolve` endpoint that loops server-side.
- **LOC**: ~180-220 (50 client checkbox + 30 toolbar + 40 batch handler + 30-50 server endpoint + 30-50 tests)
- **Files**: 3 (`src/ui/app.ts`, `src/ui/review.html`, `src/index.ts`)
- **Test**: 5 unit tests (selected count, mixed-status filter, idempotent bulk resolve, atomicity on partial failure, edge case "no selection"); 1 e2e scenario "select 3 findings → click Resolve selected → all 3 transition to resolved in one round-trip"
- **Risk**: schema-affecting (new endpoint, new client state shape). Bigger than #1+#2 combined. Better as a single-feature round.

### Candidate #4 — PM's own discovery: Reopen stale (closed_auto) findings [Bucket B alternative]

> **As a** reviewer whose finding was auto-closed as "stale" when the anchored code shifted between rounds,
> **I want** a manual "Reopen" button on stale findings in the Conversation AND Previously discussed panels, plus a server endpoint that allows `closed_auto → open` transition (with the same anchor validation as resolved reopen),
> **So that** I can re-discuss a finding I still care about, instead of having to manually re-create it as a brand-new finding.

- **User value**: 4/5 — restores reviewer agency over the auto-close mechanic. Especially useful in cross-round drift scenarios (when you bump `--base` mid-review and stale findings appear).
- **File:line evidence**:
  - `src/ui/app.ts:1714` — `const isStale = entry.status === "closed_auto";`
  - `src/ui/app.ts:1739` — `else if (isResolved && !isStale)` — the `&& !isStale` clause INTENTIONALLY hides the Reopen button for stale findings
  - `src/ui/app.ts:1717-1748` — full button-rendering logic shows 3 branches: `isFresh → Remove`, `isOpen → Resolve`, `isResolved && !isStale → Reopen`. The `isStale` case has NO branch.
  - `src/index.ts:1796-1804` — server `/api/review/:id/reopen` returns 400 `cannot reopen (status: closed_auto)` for any non-resolved status. So the gap is two-part: client hides AND server rejects.
  - `src/index.ts:1845-1847` — the actual reopen logic (set `status: "open"`, clear `closed_at`) is already in place; only the status guard at line 1796 needs to allow `closed_auto`.
- **What's missing for the user**: extend the `else if (isResolved && !isStale)` branch to `else if (isResolved || isStale)` in `app.ts:1739`; relax the guard at `src/index.ts:1796` to allow both `"resolved"` and `"closed_auto"`; add a `manually_reopened: true` flag on the target so the agent prompt at `src/index.ts:1456` can distinguish reviewer-reopened from naturally-reopened-by-code-match.
- **LOC**: ~80-120 (10 client button + 5 server guard + 5 new `manually_reopened` field + 30-50 tests across both surfaces)
- **Files**: 3 (`src/ui/app.ts`, `src/index.ts`, `src/agent-prompt.ts` if it exists or wherever the prompt is)
- **Test**: 4 unit tests (reopen resolved still works; reopen stale now works; reopen open returns 400 as before; manually_reopened flag is set); 1 e2e scenario "find a stale finding → click Reopen → status transitions to open and stays open through next round"
- **Risk**: touches the agent prompt's mental model of "stale = unfixable, don't re-apply". Mitigation: pass `manually_reopened` through to the prompt and tell the agent "treat manually-reopened as if the user re-raised the issue; treat auto-resolved normally". Small agent-prompt patch.

## Scope buckets

### Bucket A: Find/search across all 4 sidebar tabs + Sidebar tabs keyboard navigation [recommended]

- **Contains**: Candidate #1 (search) + Candidate #2 (keyboard nav)
- **Combined user value**: 4.0/5 weighted average (search is universal, keyboard is a11y)
- **Files touched**: 2 (`src/ui/app.ts`, `src/ui/review.html`)
- **Combined LOC**: ~140-200
- **Why bundle**: both are pure-UI on the sidebar; both share the same test surface (keydown/filter logic in app.ts); a11y of search box + arrow-key tab nav are the same review category (sidebar ergonomics). Both can be reviewed by the same lens pair. If keyboard nav lands first, search input gets the same `tabindex`/`role` treatment for free.
- **Bundle risk**: 1 of 2 sub-candidates ships, the other is dropped at closure → acceptable per R6 pattern (3-of-3 shipped in R6, R7 was 2-of-2). Profile still `feature` per Rule 2 (U_user_visible=yes + total ≥ 3).

### Bucket B: Reopen stale findings (Candidate #4 alone) [alternative, smaller scope]

- **Contains**: Candidate #4 (PM's own discovery)
- **Combined user value**: 4/5
- **Files touched**: 2-3 (`src/ui/app.ts`, `src/index.ts`, possibly agent-prompt source)
- **Combined LOC**: ~80-120
- **Why smaller**: single coherent feature with a clear user story ("re-open my stale findings"). Lower surface area than A but touches the agent-prompt boundary, so slightly higher risk per-LOC.

## Recommended candidate

**Bucket A** (Candidates #1 + #2 bundled). Higher combined user value, both pure-UI, both sidebar-focused, both a11y-friendly, both reviewable by the same lens. Bucket B is the fallback if the user prefers a single sub-candidate round with a clear agent-prompt boundary.

## Self-Critique

- **Clarity**: 4/5 — every candidate has a concrete file:line citation, a one-sentence user story, and a LOC estimate. The "auto-save draft" pitfall (already shipped) is explicitly called out as rejected.
- **Hidden ambiguities**:
  - Candidate #1 search: should the search box persist across tab switches (UX nicer) or reset per-tab (simpler)? Default to reset-per-tab for v1, defer persistence.
  - Candidate #2 keyboard nav: should the tablist use `roving tabindex` (WAI-ARIA standard) or `aria-activedescendant`? Default to roving tabindex (simpler, works without listbox).
  - Candidate #4 agent-prompt: does `manually_reopened: true` need to flow into the JSON payload the agent reads? Probably yes (per R3's `prior_notes + resolved[]` precedent at `src/index.ts:1919-1920`). Add to "action items" if Bucket B is picked.
- **Risks**:
  - Candidate #1: search box needs debouncing; reuse the `setTimeout` pattern from `scheduleSave` (`app.ts:2476-2481`). Risk: LOW.
  - Candidate #2: aria-pressed + aria-selected is technically redundant per ARIA 1.2; pick one. Default: keep `aria-pressed` for the visual toggle, add `aria-selected` for AT compatibility. Risk: LOW.
  - Candidate #4: agent prompt must adapt to `manually_reopened`. Risk: MEDIUM (touches the contract with the agent, but the change is additive — just add a flag the prompt can optionally read).
- **Tests**:
  - Bucket A: 6 unit tests (4 filter cases + 2 keyboard cases) + 2 e2e scenarios (search-filters, keyboard-nav)
  - Bucket B: 4 unit tests + 1 e2e scenario
  - All tests should land with their feature per R5's "regression coverage in same round" pattern.

## User-impact profile

```yaml
user_impact_profile:
  pm_source: "agent-suggested (R7 closure, backlog-freshness gate)"
  U_size: small          # Bucket A: 2 small sub-candidates, 140-200 LOC total
  U_files: narrow        # Bucket A: 2 files (app.ts + review.html). Bucket B: 2-3 files.
  U_new_capability: yes  # text search is new; keyboard nav is new wiring
  U_behavior_shift: no   # doesn't change what the app does, only how you find/switch to it
  U_user_visible: yes    # search box + arrow keys are immediately visible to the user
  U_data_shape_breaking: no  # Bucket A. Bucket B: yes (manually_reopened flag)
  U_data_safety: yes     # Bucket A. Bucket B: yes (atomic reopen via existing saveState path)
  U_installs_new_dep: no
  recommended_profile_override: feature
```

## Profile recommendation

PM's intuition: **feature** (Rule 2: `U_user_visible=yes` + `total ≥ 3` — each fresh user-story adds a new capability, none of them are bugfixes, and none trigger `U_behavior_shift=yes` so Rule 1 / architecture profile is not reached). Lead validates: Rule 2 applies cleanly for Bucket A; for Bucket B the `manually_reopened` flag is additive (no breaking schema change), so still `feature` not `architecture`.

For Bucket A: total profile score = 3 (U_size=small + U_files=narrow + U_new_capability=yes + U_user_visible=yes = 4 fields = 4) ≥ 3, so Rule 2 triggers → `feature` profile, no override needed.
