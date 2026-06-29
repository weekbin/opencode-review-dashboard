# Round 8 Plan — Bucket A (In-tab Search + Sidebar Keyboard Nav)

> **Date**: 2026-06-29 · **Profile**: feature (Rule 2, PM Manager verified) · **Bundle**: Bucket A = #1 search + #2 keyboard nav · **LOC**: ~140–200 (vs R7's 25) · **Pre-check PASS**: HEAD `14575f9`, all 9 R7 + 5 R5 SHAs verified

## 1. Goal

R8 ships two reviewer-ergonomics UI features: (a) a `<input type="search">` inside each of the 4 panes' toolbars that filters the panel content as the user types (case-insensitive substring), and (b) full keyboard navigation across the 4 sidebar tabs — Tab/Shift+Tab cycle, ArrowLeft/Right/Up/Down/Home/End cycle and jump, Enter/Space activate, `role="tablist"` + `aria-selected` semantics for screen readers.

## 2. Acceptance Criteria

### Sub-candidate #1 ACs (In-tab search)

- **AC8-1.1**: Search input renders inside each pane's `.pane-toolbar` (alongside the existing `#conversation-filter` buttons on the Conversation tab; alone on Files / Commits / Previously discussed tabs) with placeholder "Search panel…" + `type="search"`.
- **AC8-1.2**: Typing filters the active panel content in real time — Files: match `path` + `name`; Commits: match `message` + short SHA; Conversation: match `comment` + `category` + `severity`; Previously discussed: match thread comment text + per-round `notes`.
- **AC8-1.3**: Match is case-insensitive substring (`String.includes` on lowercased halves) — NOT regex, NOT fuzzy. Empty query restores full list.
- **AC8-1.4**: Empty search restores full panel content (no leftover filter).
- **AC8-1.5**: Search persists across tab switches (`currentSearchQuery` survives `setActiveTab`; each new panel reads the query on render).
- **AC8-1.6**: Pressing Escape inside the search input clears the query and refocuses the active pane's first focusable element (keyboard flow preservation).
- **AC8-1.7**: [unit] `filterByQuery<T>(items, query, pickKey)` — pure function; case-insensitive substring on the per-item string from `pickKey`.
- **AC8-1.8**: [e2e] Existing 17 scenarios still pass + 1 new `in-tab-search` (type into Conversation pane search → list filters → Esc → list restores).

### Sub-candidate #2 ACs (Sidebar keyboard navigation)

- **AC8-2.1**: `Tab` while focus is in `.navbar-tabs` advances focus through declared order (Files → Commits → Conversation → Previously → Files), wrapping.
- **AC8-2.2**: `Shift+Tab` cycles reverse order, wrapping.
- **AC8-2.3**: `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown` cycle tabs (matches the `sidebarResizer` pattern at `app.ts:620–642`).
- **AC8-2.4**: `Home` jumps to `files`; `End` jumps to `previously`.
- **AC8-2.5**: `Enter` / `Space` activates the focused tab via existing `setActiveTab` (`app.ts:478`).
- **AC8-2.6**: CSS `:focus-visible` style on `.navbar-tabs > button` (visible focus ring).
- **AC8-2.7**: ARIA — `<nav class="navbar-tabs">` gets `role="tablist"` + `aria-label="Sidebar sections"`; each `<button>` gets `role="tab"` and `aria-selected` synced with existing `aria-pressed` (per PM Triage self-critique at brief.md:139).
- **AC8-2.8**: Roving tabindex: only the active tab is `tabindex="0"`; others are `tabindex="-1"` (WAI-ARIA APG).
- **AC8-2.9**: Keyboard handler does NOT interfere with `sidebarResizer` (`app.ts:620`), `makeDraggable` (`app.ts:905`), or `commentRoot` (`app.ts:2669`) — separate element scope, `preventDefault` only on handled keys.
- **AC8-2.10**: [unit] `cycleTab(activeIndex, direction, total)` wraps with `(activeIndex + direction + total) % total`; `tabIndexFor(activeIndex, total)` returns the 4-element array of `'0'` / `'-1'`.
- **AC8-2.11**: [e2e] New `sidebar-keyboard-nav` scenario — focus navbar, Tab 4×, verify `aria-selected` cycles files → commits → conversation → previously → files.

### Cross-cutting

- **AC8-X1**: All 79 existing unit tests pass + 5 new (3 #1: filterByQuery + Escape clears + pickKey contract; 2 #2: cycleTab + tabIndexFor) → **84 pass / 0 fail**.
- **AC8-X2**: `bun run check` clean (format + lint + typecheck).
- **AC8-X3**: All 9 R7 SHAs `git cat-file -e` PASS at R8 close (R4 retro Gap 1).
- **AC8-X4**: All 5 R5 SHAs verified at R8 start.
- **AC8-X5**: No schema/dep change (Bucket A is pure UI per pm-manager-review.md:52).

## 3. File changes

### `src/ui/app.ts` (~140–190 LOC)

**#1 In-tab search (NEW, ~80–120 LOC)**
- Module-level state: `let currentSearchQuery = ""` (sibling of existing `state.conversationFilter`).
- Pure helper `filterByQuery<T>(items, query, pickKey)` — case-insensitive substring. Re-exported for tests.
- Helper `renderSearchInput(paneId)` — creates `<input type="search">` with debounced (150 ms, matching `scheduleSave` at `app.ts:2476–2481`) `input` handler + Escape `keydown` handler.
- Extend `renderActivePane` (`app.ts:1323`) to sync each pane's search-input value with `currentSearchQuery` on tab switch.
- Inside each `renderXxxPane` (`:1325, :1331, :1333, :1334`); for Conversation + Previously the inner calls land at `renderConversationPanel` (`:1612`) and `renderPreviouslyDiscussedPanel` (`:1918`) — filter data via `filterByQuery` before DOM build.
- New `src/search-filter.test.ts` — 3 unit tests on `filterByQuery`.

**#2 Sidebar keyboard navigation (NEW, ~50–70 LOC)**
- Pure helpers `cycleTab(activeIndex, direction, total)` and `tabIndexFor(activeIndex, total)`.
- Add `keydown` listener on `navbarTabs` for Tab / Shift+Tab / Arrow keys / Home / End (Enter + Space fall through to button default; `preventDefault()` only on handled keys).
- Extend `setActiveTab` (`app.ts:478`) to `.focus()` the matching button + apply roving `tabindex`.
- Extend `applyActiveTab` (`:468–476`) to also set `aria-selected` + `tabindex` per tab.
- New `src/sidebar-keyboard.test.ts` — 2 unit tests (DOM-free synthetic checks).

### `src/ui/review.html` (~5–10 LOC)
- `<nav class="navbar-tabs" id="navbar-tabs">` (line 1747): add `role="tablist"` + `aria-label="Sidebar sections"`.
- 4 `<button data-tab="…">` (lines 1748–1767): add `role="tab"` (other ARIA attributes set dynamically by `applyActiveTab`).
- Append a `<input type="search" class="search-input" data-search-pane="…">` to each of the 4 `.pane-toolbar` blocks (`review.html:1813`, `1829`, plus new toolbar wrappers for Files / Commits which currently lack one).
- CSS: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` on `.navbar-tabs > button`.

### NOT changed
- `src/index.ts` — server untouched (pure UI bundle).
- `src/agent-prompt.ts` — no prompt change.
- `package.json` / `tsconfig.json` — no new deps.

## 4. Steps

1. **Pre-flight**: HEAD `14575f9` ✓; create worktree at `$HOME/.worktrees/team-dev-loop-round-8-bucket-a/` on `team-dev-loop-round-8-bucket-a` from main HEAD.
2. **Baseline**: `cd $WORKTREE && bun test src/` → 79 pass (verified); `grep -n keydown src/ui/app.ts` → exactly 620, 905, 2669 (verified); `grep -n "search-input" src/ui/*` → zero (verified).
3. **Implement #1** in 2 micro-steps:
   - 3a — `filterByQuery` + `renderSearchInput` + `currentSearchQuery` state + `input`/`keydown` wiring + `src/search-filter.test.ts` (3 tests).
   - 3b — Filter each panel renderer via `filterByQuery`; sync input value on tab switch in `renderActivePane`.
4. **Implement #2** in 1 micro-step: `cycleTab` + `tabIndexFor`; `keydown` listener on `navbarTabs`; extend `setActiveTab` + `applyActiveTab` for focus + `aria-selected` + roving tabindex; review.html roles + CSS; `src/sidebar-keyboard.test.ts` (2 tests).
5. **E2E**: add `in-tab-search` + `sidebar-keyboard-nav` to `scripts/test-review-ui/scenarios.mjs`.
6. **Verify**: `bun run check` + `bun run test:unit` (84 pass) + `bun run build`.
7. **Commit** (2 atomic, R5 retro pattern brief.md:144):
   - `feat(search): In-tab search filters active panel content (case-insensitive substring, 4 panes)`
   - `feat(a11y): Sidebar tabs keyboard navigation (Tab/Shift+Tab/Arrow/Home/End + roving tabindex + ARIA tablist)`
8. **Push** + hand-off to lead (UI changed → 3c runs full Playwright walkthrough).

## 5. Test plan

- **Unit tests** (5 new in `src/search-filter.test.ts` + `src/sidebar-keyboard.test.ts`):
  - `filterByQuery("Foo bar", "foo")` → match; empty query → identity; case mismatch → match.
  - `renderSearchInput` returns element with `type="search"`; Escape key in dispatched event clears `currentSearchQuery`.
  - `cycleTab(2, 1, 4)` → 3; `cycleTab(3, 1, 4)` → 0 (wrap); `cycleTab(0, -1, 4)` → 3.
  - `tabIndexFor(1, 4)` → `["-1","0","-1","-1"]`.
- **E2E scenarios** (2 new in `scripts/test-review-ui/scenarios.mjs`):
  - `in-tab-search` — load sample review, type into Conversation pane search, assert finding count drops, press Escape, assert count restores.
  - `sidebar-keyboard-nav` — focus `#navbar-tabs`, Tab 4×, assert `aria-selected` cycles files → commits → conversation → previously → files; press `Home`, assert jumps to `files`.
- **Build/lint/typecheck/format**: `bun run check` clean.
- **SHA audit (closure)**: `for sha in f96c1e4 69b4e1f e2e6efc 4ce6457 23a3775 1770478 de30bb8 5babc0b <R8-a> <R8-b>; do git cat-file -e $sha; done` — all PASS.

## 6. Risk register

- **R8-1 (LOW)**: `sidebarResizer` keydown conflict (`app.ts:620`) — resizer is on `#sidebar-resizer`, search input is inside `.pane-toolbar`; different elements, different listeners. Mitigation: impl-time check that no shared event stops propagation.
- **R8-2 (LOW-MED)**: Debounced re-render thrash on fast typing. 150 ms debounce matches `scheduleSave` (`app.ts:2476–2481`); typical sidebar lists are 20–40 items and render sub-millisecond. Mitigation: drop to 100 ms / `requestAnimationFrame` only if 3c walkthrough shows jank.
- **R8-3 (LOW)**: Comment drawer `Cmd+Enter` (`app.ts:2669`) vs. tablist keydown — separate elements (`commentRoot` vs. `navbarTabs`). Mitigation: `preventDefault()` only for handled keys in #2's listener.
- **R8-4 (MED)**: Tab cycling traps keyboard users inside the tablist — `preventDefault()` on Tab is non-standard for tablists. PM Triage ACs (brief.md:40) explicitly mandate Tab cycling, so we honor that. Mitigation: roving `tabindex` (AC8-2.8) ensures focus exits cleanly when focus reaches `tabindex="-1"` candidates.
- **R8-5 (LOW-MED)**: 4 different `pickKey` extractors across heterogeneous panel data shapes — each panel has its own field shape. Mitigation: name them clearly (`pickKeyPath`, `pickKeyMessage`, `pickKeyFinding`, `pickKeyThread`) and add inline comments.

## 7. Hand-off

### Dev receives
- This plan + `brief.md` + `pm-manager-review.md`; worktree at `$HOME/.worktrees/team-dev-loop-round-8-bucket-a/` on `team-dev-loop-round-8-bucket-a`.

### Dev returns
- All 21 ACs (8-1.1 → 8-X5) with PASS evidence; 2 atomic commits pushed to `origin/team-dev-loop-round-8-bucket-a`; inline self-check tracing each AC → file:line + commit SHA.

### Lead does after Dev
- **3a (Tester Review)** — 5 lens parallel (feature profile, medium scope).
- **3b (Tester Diff)** — lead takeover: `git diff main...origin/team-dev-loop-round-8-bucket-a` review.
- **3c (Tester Playwright)** — lead takeover per Patch A: full UI walkthrough (search filters + keyboard nav visibly).
- **3.5 (PM Doc Writer)** — lead takeover. NO README change (UI-only; existing "Review UI" section covers the 4 tabs per R7 retro).
- **4 (Decision)** — SHIP if all ACs PASS.
- **4.5/4.6/4.7** — retro + post-exec + self-check.
- **4.8 (Loop Summary)** — chat response with SHIP + AC trace.
- **4.9 (Issue Auto-Close)** — scan + close related GH issues.
- Merge R8 branch → main + push `origin/main`; append R8 to `.omo/proposals.jsonl`.

### Carry-over (R9 candidate)
**#4 Reopen stale findings** → schedule as R9 standalone feature round (NOT bugfix — see pm-manager-review.md:82–101 + 103–104 for rationale).
