# Round 8 PM Manager Review

> **Date**: 2026-06-29
> **Reviewer**: Round 8 PM Manager
> **Verdict**: APPROVE (with Bucket B recommendation)
> **Pre-check result**: PASS (reused from PM Triage brief.md ## Source — Patch G optimization honored)

## Pre-check (code-commit verification)

PM Triage's `brief.md` lines 11–22 already contain the canonical pre-check writeup: **"R7 audit-trail code-commit verification: ALL 9 R7 SHAs verified OK via `git cat-file -e` — f96c1e4 ✓ 69b4e1f ✓ e2e6efc ✓ 4ce6457 ✓ 23a3775 ✓ 1770478 ✓ de30bb8 ✓ 5babc0b ✓ 14575f9 ✓."** HEAD confirmed at `14575f9` (`git log --oneline -1` matches). Patch G optimization honored — did not re-run the verification.

## Sub-candidate evaluation

### #1 — In-tab search (4 sidebar panels)

- **Real user pain**: Multi-round reviewers (3+ rounds, 20–40 findings) have no way to filter the 4 sidebar lists; the only filter logic that exists is the 3-button open/resolved/all conversation filter (`src/ui/app.ts:499–527`). All 4 sidebar list containers (`#file-list` at `src/ui/review.html:1788–1796`, `#conversation-list` at `review.html:1826`, `#previously-list` at `review.html:1832`) are static `<div>` containers with zero text-filter UI.
- **Pseudo-requirement markers**: None. PM Triage already flagged the "auto-save draft" suggestion as already-shipped and rejected it (`app.ts:2458–2481` + `index.ts:1728–1745`); that discipline was applied here too.
- **Already-shipped verification**: `grep -n "input.*search\|<input\|search-input\|tab.*search" src/ui/review.html src/ui/app.ts` → **zero matches**. Confirmed: no search input, no filter input, no debounce-on-text utility exists anywhere in the UI.
- **Verdict**: **APPROVE**

### #2 — Sidebar tabs keyboard navigation (Arrow keys + WAI-ARIA tablist)

- **Real user pain**: Keyboard-only / screen-reader users cannot switch sidebar tabs without leaving the keyboard — `navbarTabs` has only a `click` listener (`src/ui/app.ts:492–497`), zero `keydown`. The 4 buttons at `review.html:1747–1768` have `aria-pressed` but no `role="tablist"` / `role="tab"` / `aria-selected` semantics, so assistive tech announces them as plain toggle buttons, not as a tab list.
- **Pseudo-requirement markers**: None. The pattern is already proven elsewhere in the same file — `sidebarResizer` at `src/ui/app.ts:620–642` implements `ArrowLeft/ArrowRight/Home/End` for width adjustment. Borrow that pattern, don't invent.
- **Already-shipped verification**: `grep -n "keydown" src/ui/app.ts` → only 3 hits total:
  - Line 620: `sidebarResizer` keydown (resize handle, NOT the tablist)
  - Line 905: `root` keydown inside `makeDraggable` (a generic draggable, not the tabs)
  - Line 2669: `commentRoot` keydown (review drawer Cmd+Enter to add finding, not the tabs)

  Confirmed: **no keydown handler on `navbarTabs`**. The 3 existing keydown handlers serve unrelated surfaces.
- **Verdict**: **APPROVE**

### #3 — Multi-select findings for batch actions

- **Real user pain**: Validated — `renderConversationPanel` (`app.ts:1612–1852`) shows 1 button per item (Remove/Resolve/Reopen); `resolveFinding(id)` and `reopenFinding(id)` (`app.ts:2213–2254`) are single-id POST handlers. No checkbox UI, no batch endpoint. For a reviewer with 15+ open findings, the click cost is real.
- **Pseudo-requirement markers**: **INFLATED** as part of Bucket A. ~180–220 LOC across 3 files (client checkbox + toolbar + handler + server endpoint + 5 unit tests) — bigger than #1+#2 combined (~140–200 LOC, 2 files). PM Triage correctly tagged it "Bucket B alternative".
- **Already-shipped verification**: `grep -n "checkbox\|multi-select\|multiSelect\|aria-checked\|select.*multiple" src/ui/review.html src/ui/app.ts` → **zero matches**. Confirmed: not shipped.
- **Verdict**: **DEFER to Bucket B** (or its own round). Real user need, but too large to bundle cleanly with #1+#2.

### #4 — Reopen stale (closed_auto) findings (PM's own discovery)

- **Real user pain**: Independently verified — the gap is **two-part**:
  1. **UI hides the button**: `src/ui/app.ts:1739` reads `else if (isResolved && !isStale)`. The `&& !isStale` clause intentionally excludes stale findings, so a `closed_auto` finding has NO action button (only the always-present "Jump" button). Read the surrounding block (`app.ts:1714–1748`): 3 branches cover fresh→Remove, open→Resolve, resolved+!stale→Reopen. The 4th case (stale) has no branch.
  2. **Server rejects the request**: `src/index.ts:1796` reads `if (target.status !== "resolved")` and returns 400 `cannot reopen (status: closed_auto)`. Even if a user fixed the client, the server guard at line 1796 would reject. The actual reopen logic at `index.ts:1845–1847` (`target.status = "open"; target.closed_at = undefined;`) already supports the transition — only the guard needs widening.
- **Pseudo-requirement markers**: None. **Real bug-shaped gap with file:line evidence on both sides of the wire**. PM Triage surfaced this from self-investigation (not the R7 Loop Summary suggested list) — kudos, that's exactly what the backlog-freshness gate is for.
- **Already-shipped verification**: N/A — this is a removal-of-a-guard, not a new feature.
- **Verdict**: **APPROVE as Bucket B**, NOT a bugfix round (see "Promotion to bugfix?" below).

## Bucket coherence (Bucket A = #1 + #2)

**Natural, not forced.** Evidence:
- **Shared file surface**: both touch only `src/ui/app.ts` + `src/ui/review.html`. Zero server-side changes, zero schema changes, zero agent-prompt changes.
- **Shared review lens**: a11y/UX reviewer covers both. The ARIA tablist pattern from #2 (`role="tablist"`, `aria-selected`) gives the new search inputs from #1 a clean `role="search"` wrapper for free.
- **Shared test surface**: both add a `keydown`/`input` handler in `app.ts` with the same debounce pattern (PM Triage cites `scheduleSave` at `app.ts:2476–2481` — already proven).
- **Bundle risk**: PM Triage's "1 of 2 ships, other dropped at closure" pattern is acceptable per R6/R7 history (3-of-3 shipped in R6, 2-of-2 in R7). No NEW risk vs shipping either alone.
- **Combined LOC**: ~140–200 — fits the team's "medium feature" sweet spot.

**#3 and #4 do NOT fit cleanly in Bucket A** because:
- #3 adds `src/index.ts` (server endpoint) — breaks the "pure UI" property of Bucket A.
- #4 adds `src/index.ts` (guard relaxation) + agent-prompt surface (manually_reopened flag) — also breaks "pure UI", plus touches the data shape (`U_data_shape_breaking` flips to yes for #4).

## Profile validation (Rule 2 — feature)

PM Triage's profile block at `brief.md:148–160`:

| Field | Value | Counts as |
|---|---|---|
| U_size | small | +1 |
| U_files | narrow | +1 |
| U_new_capability | yes | +1 |
| U_behavior_shift | no | 0 |
| U_user_visible | yes | +1 |
| U_data_shape_breaking | no | 0 |
| U_data_safety | yes | +1 |
| U_installs_new_dep | no | 0 |

**Total positive = 5** (small + narrow + new_capability + user_visible + data_safety).
**Rule 2**: `U_user_visible=yes` ✓ AND `total ≥ 3` (5 ≥ 3) ✓ → **feature profile confirmed**. PM Triage's call is correct. No override needed.

Rule 1 (architecture) does not trigger because `U_behavior_shift=no` and `U_data_shape_breaking=no` for Bucket A.

## Should #4 be promoted to a bugfix round?

**No — keep #4 as Bucket B (feature), not bugfix.** Reasoning:

1. **The current behavior is intentional, not a regression.** The `!isStale` clause at `app.ts:1739` and the `target.status !== "resolved"` guard at `index.ts:1796` are deliberate design choices (avoid stale-loops, force re-creation as the recovery path). A bugfix round implies "this used to work and broke"; #4 is a capability gap, not a regression.

2. **The fix is feature-shaped, not patch-shaped.** It needs:
   - New `manually_reopened: true` field on the target finding
   - Server guard widened from `=== "resolved"` to `["resolved", "closed_auto"].includes(...)`
   - Agent prompt updated to read the new flag (so the agent doesn't re-auto-close a manually-reopened finding)
   - All three layers — UI, server, agent prompt

   That's a 3-file feature with a small schema addition, not a 1-file bugfix.

3. **Different review lens.** Bucket A = UI/a11y reviewer. #4 = server-contract reviewer + agent-prompt reviewer. Lumping them together dilutes both reviews.

4. **PM Triage's framing was correct.** "Bucket B: Reopen stale findings (Candidate #4 alone)" — explicitly scoped as a feature, not a bugfix. Don't second-guess the PM's framing when the evidence supports it.

5. **However**, if the user wants to ship SOMETHING this round and Bucket B is too large, **#4 is the highest-value single-candidate option** (user value 4/5, ~80–120 LOC, clear file:line evidence on both halves of the gap). Bucket A and Bucket B are alternatives, not complements.

## Overall verdict

**APPROVE** — Bucket A (#1 in-tab search + #2 sidebar tabs keyboard nav) is approved as Round 8 scope. Both candidates are independently verified as not-shipped, both have file:line evidence of the gap, both fit cleanly in the same 2-file UI surface, and the feature profile validates under Rule 2. Bucket B (#4 reopen stale) is approved as a recommended Round 9 candidate.

## Action items

1. **Architect** — design the search input pattern (where to mount the `<input type="search">` — inside each pane, or as a sticky bar above the tablist?). Recommend reuse of `scheduleSave` debounce pattern at `app.ts:2476–2481`.
2. **Architect** — confirm ARIA tablist pattern (roving tabindex vs. `aria-activedescendant`; PM Triage's self-critique already prefers roving tabindex — agree).
3. **Decision** — schedule Bucket B (#4 reopen stale) as Round 9 standalone feature round, NOT a bugfix. If Round 8 ships Bucket A successfully, file `.omo/round-9/brief.md` with #4 as the headline candidate.
4. **Decision** — keep #3 (multi-select) as backlog-freshness material for a future round, lower priority than #4 (smaller user base — only Conversation panel benefits; bigger LOC; new endpoint).