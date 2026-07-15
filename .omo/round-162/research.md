# R162 Research

## #85 — Force Reopen no-op
- **Location**: `src/ui/app.ts:4693-4703` (handler), `:2395-2435` (modal function)
- **Existing test**: `src/reopen-stale.test.ts:142-148` only verifies button text via regex
- **Hypothesis**: handler looks correct. Likely culprit is parent listener on `.conversation-entry` / `.finding-card` capturing the click. Need to check the card's click handler for `event.target` vs `event.currentTarget`.

## #86 — AI-resolved findings not in Resolved filter
- **Filter**: `src/ui/app.ts:553-555`
  - open: `(e) => e.status === "open" || e.status === "closed_auto"`
  - resolved: `(e) => e.status === "resolved"`
- **entries construction**: `src/ui/app.ts:540-549` — `state.fresh[i].status` is **hardcoded** to `"open"` (line 547)
- **AI resolve path**: `src/index.ts:2038-2118` sets `status = "resolved"` on `base.findings` (existing)
- **Hypothesis**: AI is updating state via the resolve endpoint, which mutates `state.existing`, but the UI render path may not be re-fetching or the resolved findings are falling through due to filter edge case.
- **Simplest fix**: after resolve, force `renderConversationPane()` + `renderFindings()` (existing call) — verify this is happening. Add a regression test that calls /resolve, then asserts the entry has `status === "resolved"` in the rendered DOM.

## #87 — Drawer resolve no-op
- **Location**: Need to find drawer rendering code (likely `app.ts` search for `drawer` / `sidePanel`)
- **Hypothesis**: same root cause as #85 — action buttons in drawer card are intercepted

## #88 — AI comments should respect user language
- **Frontend**: `src/ui/app.ts:6393-6412` (`draftPayload`)
- **Backend**: `src/index.ts:2602-2630` (`/submit` handler)
- **Agent prompt**: `src/index.ts:1694-1700` (the existing injection)
- **State**: `src/ui/app.ts` `state.language` is the source
- **Simplest fix**: add `locale: state.language` to `draftPayload`, read `input.locale` in `/submit` handler, embed in the agent prompt that gets sent.

## #89 — Range banner shows even when empty
- **Render**: `src/ui/app.ts:4123-4143` (`renderRangeBanner`)
- **CSS**: `src/ui/review.html:241-258` (`.range-banner { display: flex; ... }`)
- **HTML**: `src/ui/review.html:3544` (`<div id="range-banner" class="range-banner" hidden></div>`)
- **ROOT CAUSE**: CSS `display: flex` overrides HTML `hidden` attribute. When JS sets `banner.hidden = true`, the element still shows because CSS specificity beats the user-agent's `[hidden] { display: none }`.
- **Fix**: add `.range-banner[hidden] { display: none; }` rule OR change CSS to use class-based visibility instead of attribute.

## #90 — Tree/Flat toggle button height
- **CSS**: `src/ui/review.html:1366-1389` (`.sidebar-mode`)
  - button: `padding: 5px 12px; font-size: 14px` → height ≈ 14 + 10 = 24px (too tall)
- **Fix**: reduce padding to `2px 10px` (height ≈ 18px) — matches typical row line-height better.

## #91 — Settings UI rework
- **Button already has SVG gear icon** (R43 AC3 at `review.html:3440-3458`) — "use gear icon" sub-issue is **already addressed**. BUT user says it's still wrong — must check if the icon is actually rendering or if there's another issue.
- **Topbar scattered config**:
  - `layout-toggle` (unified/split) at `review.html:3393-3410`
  - `ignore-whitespace` at `review.html:3415`
  - `theme-toggle` (3 buttons) at `review.html:3424-3432`
  - `language-toggle` at `review.html:3433`
- **Settings modal footer**: `review.html:3823-3828` — currently `<button id="settings-ok">Close</button>`
- **Save handler**: need to find. Probably in app.ts around `:1843` (settingsBtn handler).

## #92 — Round counting cross-branch bug
- **Code**: `src/index.ts:2631` `const round = base.round + 1` — naive monotonic increment
- **Diff base field**: `src/index.ts:189` already has `diff_base?: DiffBase` and `:190` has `previous_diff_base?: DiffBase`
- **Simplest fix**: when computing next round, if `data.diff_base.from` differs from `base.diff_base.from` (or commits differ significantly), reset round to 1 for the new diff base. Otherwise increment.
- **Simpler**: add a `diff_base_fingerprint: string` (hash of `from` + first commit sha), reset round when fingerprint changes.

## Files to modify
1. `src/ui/review.html` — CSS fixes (#89, #90), settings modal footer button (#91), topbar consolidation (#91)
2. `src/ui/app.ts` — locale in draftPayload (#88), settings save handler (#91), topbar wiring cleanup (#91)
3. `src/index.ts` — locale in /submit (#88), round counting fix (#92)
4. `src/ui/i18n.ts` — new strings for Save button, success toast, etc.
5. Test files: extend or add for each AC