# PM Brief — Round 11 (v5.3 kickoff)

> **Date**: 2026-06-30
> **Author**: Round 11 PM Triage (fresh subagent, v5.3 cron-style loop kickoff)
> **Status**: PM brief, awaiting PM Manager review (Phase 0.5)
> **Source**: v3 lightweight strategy per prompt brief + R10 backlog carry-over (#13 Live file-watcher, #12 Bulk actions) + 2 fresh candidates from R10 follow-up (Saved Replies `/`-shortcut extension) and self-investigation (per-finding permalinks). 0 open GH issues block R11 (R10's #10/#11/#14 closed; #12 + #13 remain open as architecture options, deferred per R11 lightweight goal).
> **Pre-check result**: PASS — R11 baseline `f9ac431` (v5.3) verified, R10 audit-trail SHAs verified, gap-O label pre-creation confirmed (`pm-manager-approved` + `round-11` exist per `.omo/round-11/sync-report.md`)
> **Strategy**: **LIGHTWEIGHT ROUND**. R10 shipped 3 candidates under architecture profile and hit the 30-min Dev timeout (architecturally-correct work, but Dev session timed out). R11 aims to validate the v5.2 lightweight mode by shipping 1-2 small, scope-bounded, **feature-profile** candidates that should complete inside the default 30-min Dev budget. No architecture-profile candidates in this brief.

---

## Title

R11 ships **the two missing microvelocity features on top of R10's reviewer-velocity block** — (1) keyboard-shortcut expansion of Saved Replies (`/trigger` → saved reply body, per the R10 brief.md candidate #1 "what's missing" note that explicitly foreshadowed this in P88), and (2) per-finding permalink anchors so teammates can deep-link a single finding in Slack/Notion (closes GitHub PR's `#discussion_r...` permalink gap). Plus one scoped-extreme-budget: keep #12 (Bulk actions, architecture, ~200 LOC) and #13 (Live file-watcher, fresh, `chokidar` dep) as **deferred to R12** — they're not in the brief's recommended scope but remain open GitHub issues for future architecture rounds.

## Source

- **R11 baseline**: `f9ac43185187cca1140182d8b71f1edffd74ff60` (v5.3 commit, current `main` HEAD — verified)
- **R10 audit-trail SHAs verified** (regression check per v5 R4 lesson):
  - `55737e5` ✓ (feat(saved-replies): localStorage CRUD + insert into comment)
  - `c5fed23` ✓ (feat(export-review): markdown + patch download from header)
  - `3dfcfb4` ✓ (feat(edit-finding): in-place category/severity/comment edit)
  - `643c5b8` ✓ (test round-10 saved-replies + export-review + edit-finding e2e)
  - `4ef61de` ✓ (round-10 closure audit-trail)
  - `8bc25b2` ✓ (merge commit R10 branch)
- **R10 closure outcome**: SHIP per `.omo/round-10/retro.md` + `pm-manager-review.md` — 3 candidates shipped (architecture profile), 126/126 unit tests pass, 23 e2e scenarios, 5 atomic commits, retro surfaced 4 gaps (M/N/O/P). v5.3 closes Gap O (`gh label create` pre-creation — see `.omo/round-11/sync-report.md` L31-32).
- **R10 backlog carry-over**: `.omo/proposals.jsonl` line 11 `follow_up_candidates` lists `#3 Live file-watcher auto-reload` and `#5 Bulk actions` — both architecture-profile and explicitly DEFERRED from R10. R11 prompt brief marks them stale for R11 strategic reasons (architecture), but they're still verified live in `gh issue list` (R10 PM Manager never closed them).
- **GitHub issue list**: `gh issue list --state open --limit 30` returned 2 OPEN issues (R10 PM Manager's #10, #11, #14 closed themselves when shipped; only #12 + #13 remain):
  - `#12 Bulk actions (multi-select + bulk resolve / bulk reopen)` — architecture, deferred R11 per lightweight strategy
  - `#13 Live file-watcher auto-reload of the diff while reviewing` — architecture-or-feature (new `chokidar` dep), deferred R11 per lightweight strategy
- **R10 brief candidate #1 "what's missing" note** (line 94 of `.omo/round-10/brief.md`): "**No keyboard shortcut**: GitHub's saved replies dropdown opens via a button; we can do the same plus `/`-prefix triggering (typed `/missing-err` expands to the saved reply)." → THE EXACT feature R11 Candidate #1 surfaces. This is NOT new PM speculation — it's the documented R10 backlog that didn't ship with R10.
- **v5 / v5.2 lightweight-mode rationale**: v5.2 added per-profile timeouts (30min feature/bugfix, 45min architecture) and lightweight-mode support (≤2 candidates, feature profile, ~150 LOC each) so a fast round can validate the pipeline without the R10 architecture timeout risk. R11 = first real-world test of lightweight mode.

## User pain (1-3 sentences, user terms)

You just shipped R10's Saved Replies — works great for one-click insertion from the dropdown. But you still type `/needs-test` + space 12 times in a single review (because clicking the dropdown, scrolling, clicking the saved reply adds ~5 sec per use × 12 = 60 sec lost). And separately: your teammate asks "what's the duplicate-finding bug?" on Slack, you have to paste the entire dashboard URL (which they'll have to scroll through 42 findings to find). R11 fixes both: keyboard shortcuts for templates (`/trigger` + space → expand) + per-finding anchor URLs you can copy-paste into Slack so your teammate lands directly on finding #17 expanded.

## Competitor analysis (v5 — mandatory)

| Tool | Core capability | opencode-review-dashboard |
|---|---|---|
| GitHub PR review | Inline comments, **saved replies (click-to-insert dropdown only — no `/trigger` shortcut)**, **discussion permalinks via `#discussion_r...` URL fragment**, .patch/.diff URL | Has: Saved Replies click-to-insert (R10); **NO `/trigger` expansion**; **NO per-finding permalink** |
| GitLab MR | Quick actions (`/assign`, `/close`, `/label` — commands on issues, NOT on comment textbox), Approvals, multi-reviewer | Has: single-user review; **NO comment-textbox shortcut expansion** |
| Phabricator Differential | Audit trail, herald rules, bulk edit | Has: round history, no audit log |
| Gerrit | Code review voting, patch sets, **inline comment permalinks (via `#` URL fragment + comment ID)** | Has: severity, no permalink |
| Sourcetree | Visual diff, no review | Has: diff core |
| Cursor review | Cmd+K AI inline edits | Has: split view, **NO comment-template insertion** |
| aider rewind | Whole-file AI re-suggestion | No |
| diff.nvim | Side-by-side diff, live file-watcher | Has: split view |

### Unique OpenCode + plugin capabilities (我们独占)

- **Round-by-round review** with stale-finding auto-close (no competitor does this natively)
- **Local-only** review (no server, no PR required)
- **Auto-apply agent workflow** (agent reads findings → applies fixes → re-reviews)
- **Cross-round drift banner** (yellow banner when diff range changes between rounds) — unique
- **Previously discussed panel** (R4) — per-round notes + threads in dedicated tab
- **Force Reopen** with `manually_reopened` flag (R9) — agent honors user intent
- **Language-matched agent replies** (R5) — CJK detection
- **Atomic state writes** (R1)
- **Saved Replies click-to-insert** (R10) — localStorage CRUD

### Gaps (competitor 上有但我们没有) — PM turns into candidates below

- **`/trigger` expansion in comment box** (Slack `/commands` exist; Claude Code slash-commands exist; GitHub Saved Replies do NOT have `/trigger` expansion) → **Candidate #1 (recommended)**
  - UNVERIFIED unique claim (no canonical docs URL for "saved reply /trigger expansion" found in 3-web-search budget). Marked **plausible unique** based on:
    - GitHub Keyboard shortcuts doc ([https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts](https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts)) lists Cmd+B / Cmd+E for markdown formatting, NOT for saved-reply expansion — supports UNVERIFIED-claim.
    - Slack `/commands` ([https://api.slack.com/interactivity/slash-commands](https://api.slack.com/interactivity/slash-commands)) are app-defined commands, not user-saved-comment-templates — different feature family.
    - Claude Code slash-commands / skills ([https://new.qq.com/rain/a/20260125A02SPT00](https://new.qq.com/rain/a/20260125A02SPT00)) are app-level commands, NOT comment-textbox shortcuts — different feature family.
  - **R10 brief.md L94 explicitly foreshadowed this** ("we can do the same plus `/`-prefix triggering") — NOT PM hallucination, lifted from prior round's documented backlog.
- **Per-finding permalink anchors** (GitHub uses `#discussion_r<id>`; Gerrit uses `#c<id>` anchor) → **Candidate #3 (fresh self-investigation)**
  - VERIFIED-PARTIAL: GitHub PR URLs are documented to carry `#discussion_r...` anchors in their discussion database; community knowledge not officially documented as a permalink doc. The WICG Scroll-To-Text-Fragment proposal ([https://github.com/WICG/ScrollToTextFragment](https://github.com/WICG/ScrollToTextFragment)) is a Web Standard for `:~:text=...` URL fragments — supplements our hash-anchor approach.
  - Closing competitor gap = valid feature (GitHub/Phabricator/Gerrit have it; we don't).

---

## Candidates ranked (3 user-stories — lightweight scope)

### Candidate #1: `/trigger` expansion in comment box (Saved Replies keyboard shortcut) [RECOMMENDED]

> **As a** reviewer who has Saved Replies set up from R10 (one-click insert from dropdown) and uses 5-10 templates per review, you find the dropdown-click loop still adds ~5 seconds per use × 12 re-uses = 60 sec per review,
> **I want** a keyboard shortcut that lets me type `/template-name` + space (or Enter) in the comment box and have it expand to the saved reply body — like Slack's `/commands` but for personal comment templates,
> **So that** you never leave the keyboard for common boilerplate ("needs-test", "missing-err-handling", "duplicate-of-X"), saving 30-60 seconds per review and getting the same muscle-memory speedup Slack users get.

- **user-value**: 4/5 — closes the documented "what's missing" gap from R10 brief.md L94. The dropdown already exists; this is purely a keyboard path to it. 30-60 sec saved per review × 10-30 re-uses per review = 5-30 min per review.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on keyboard shortcuts for Saved Replies. R10 brief lists dropdown-only ("the dropdown opens via a button") without describing `/trigger` expansion.
  - **Test 2 (非开发者可见)**: PASS — keyboard interaction in the comment box; the dropdown already has the saved-reply list visible. Visible affordance.
  - **Test 3 (竞品已具备)**: UNVERIFIED (no canonical "saved reply trigger expansion" doc URL found). **Plausible unique** based on GitHub Keyboard shortcuts doc ([https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts](https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts)) showing only formatting shortcuts, NOT template expansion.
- **file:line evidence** (re-verified on `f9ac431` v5.3 baseline):
  - **Saved Replies dropdown UI wiring**: `src/ui/app.ts:2357-2463` (`savedRepliesBtn`, dropdown construction at L2357-2363, button text+counter at L2363, click handler at L2444)
  - **Saved Replies text insertion**: `src/ui/app.ts:2421` (`insertAtCursor(textarea, item.body)` — already wired to dropdown click)
  - **`insertAtCursor` helper**: `src/ui/app.ts:205` (the function that does the actual cursor insert)
  - **`SAVED_REPLIES_KEY` localStorage**: `src/ui/app.ts` (key = `"opencode-review-dashboard:saved-replies"`, soft-cap = 200, per `src/saved-replies.test.ts:36-37`)
  - **Comment textareas that need `/`-trigger listener**: `src/ui/app.ts:2000-2050` (region with finding + comment input)
  - **Saved Replies modal**: `src/ui/app.ts:2480+` (the add/edit/delete modal — re-uses existing CRUD)
- **"what's missing" note**:
  - **`/trigger` listener**: in every comment-input textarea, hook `onkeydown` / `oninput`. When the user types `/` followed by template-name characters and then `space` (or `Enter` or `Tab`), look up the template in `savedReplies` (already loaded from localStorage), and if found: `insertAtCursor(textarea, body)`, then `preventDefault()` on the space to avoid double-space.
  - **Autocomplete dropdown**: as the user types `/missing`, show a tiny popover (reuse the existing `savedRepliesBtn` dropdown widget) listing matching templates by name. Click or arrow-key + Enter inserts.
  - **Settings UX**: in the existing Saved Replies modal, an "Assign /trigger" column where each saved reply can have a 1-line trigger name (defaults to slugified name, e.g., "missing-err-handling"). Backwards-compat: existing saved replies without an explicit trigger fall back to slugified name.
  - **Conflict guard**: do NOT trigger on `/` alone (only on `/<chars>` followed by space/enter/tab), to avoid blocking future OpenCode slash-commands from R-pattern.
- **LOC estimate**: ~50-100 prod + ~30-50 tests = ~80-150 LOC total across 1-2 files. **Smallest possible feature profile**.
  - Trigger listener (textarea onkeydown / oninput): ~30 LOC
  - Autocomplete popover: ~30 LOC (reuse existing dropdown CSS)
  - Trigger-name field in Saved Replies modal: ~10 LOC
  - Unit + e2e tests: ~30-50 LOC (3 unit: trigger expansion, autocomplete, conflict guard; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - Save 3 templates with explicit triggers ("missing-err", "needs-test", "duplicate-of-X")
    - Set `textarea.value = "/missing-err "` (trailing space) and dispatch keydown event → assertion: textarea.value becomes the template body after the cursor position; the literal `/missing-err ` is consumed
    - Set `textarea.value = "/no-such-trigger "` → assertion: textarea.value unchanged (no silent corruption)
  - **E2E (1 scenario)**: open review → save 3 templates → reload page → templates persist → focus comment box → type `/missing-err ` → comment box contains the saved reply body → submit → next round retains the trigger-name mapping
- **Risk**: **LOW** — pure UI enhancement to R10's Saved Replies, no schema change, no server change, no agent-prompt surface, no new dependency. The `/` character is already used by the plugin's incoming slash-command prefix (`/diff-review-dashboard`) — but that's handled at the OpenCode TUI level, not inside the browser comment box, so no conflict.

### Candidate #2: Per-finding permalink anchor (deep-link to a specific finding) [FRESH — self-investigation]

> **As a** reviewer collaborating with a teammate via Slack/Notion, you want to link your teammate directly to "finding #17 (the missing-error-handling bug)" without them having to scroll through 42 findings to find it,
> **I want** a "Copy link" button next to each finding ID in the Conversation + Previously discussed panels, and the dashboard automatically highlights + scrolls to that finding + expands its comment thread when the URL hash matches `#finding-<id>`,
> **So that** you can paste a single URL into Slack and your teammate lands directly on the relevant finding, with the same UX GitHub PR threads have via `#discussion_r<id>` URLs.

- **user-value**: 3.5/5 — currently the dashboard URL is one-shot per `/diff-review-dashboard` invocation (`README.md` says "bookmarking it only works for the current round"). For a 4-round review with 32+ findings, teammates can't share specific finding context. This closes a real GitHub capability gap.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on per-finding permalinks. Currently the only URL affordance is the "one-shot per round" note in README.
  - **Test 2 (非开发者可见)**: PASS — Copy-link button visible on every finding; incoming URL hash visibly scrolls + highlights + expands the matching finding on page load.
  - **Test 3 (竞品已具备)**: PASS (closing gap) — GitHub uses `#discussion_r<id>`; Gerrit uses `#c<id>`; Phabricator Differential uses `#<id>`. **All 3 major competitors support this**. The WICG Scroll-To-Text-Fragment standard ([https://github.com/WICG/ScrollToTextFragment](https://github.com/WICG/ScrollToTextFragment)) formalizes the underlying `:~:text=...` mechanism.
- **file:line evidence** (re-verified on `f9ac431` v5.3 baseline):
  - **No anchor-route exists**: `grep -nE 'window\.location\.hash|history\.pushState|fragment' src/ui/app.ts src/index.ts` → **0 matches**. No hash-anchor reading exists.
  - **Copy-link UI absent**: `grep -nE 'Copy link|permalink|copyLink' src/ui/app.ts src/ui/review.html` → **0 matches**. (Note: `navigator.clipboard.writeText` DOES already exist at `src/ui/app.ts:1672` for the Commits panel "copy SHA" button — R11 reuses that existing helper rather than introducing a new pattern.)
  - **Server-rendered URL format**: the URL the plugin prints is `http://127.0.0.1:<port>/review/<session-id>?token=<token>` per `src/index.ts:550-560` region. Already absolute + shareable; the only missing piece is hash-anchor support.
  - **Finding ID source**: every finding has a stable `id` (UUID-like, generated at finding creation in `src/index.ts:319` `reconcile()` and persisted across rounds).
  - **Finding-render points**: `src/ui/app.ts:1781-1859` `renderConversationPanel` (Conversation tab), `src/ui/app.ts` `renderPreviouslyDiscussedPanel` (Previously discussed tab — built R4).
- **"what's missing" note**:
  - **`Copy link` button**: per finding card in Conversation + Previously discussed panels (placed next to the existing `Remove | Resolve | Reopen | Jump` button row). Click → `navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#finding-' + id)` + show a transient "✓ Copied" toast.
  - **Hash-anchor handler on page load**: parse `window.location.hash` for `#finding-<id>` pattern; look up the finding; if found, scroll into view (`element.scrollIntoView({ behavior: 'smooth', block: 'center' })`), add a brief flash-highlight class (CSS keyframe ~1.5 sec), expand the comment thread if collapsed.
  - **Cross-tab navigation**: if the URL hash matches a finding that's in the Previously discussed tab (not the active Conversation tab), auto-switch to the matching tab before scrolling.
- **LOC estimate**: ~100-150 prod + ~30-50 tests = ~130-200 LOC across 2-3 files.
  - Copy-link button + clipboard helper: ~25 LOC
  - Hash-anchor parser + scroll + highlight handler: ~30 LOC
  - Cross-tab auto-switch: ~20 LOC
  - CSS for flash highlight: ~10 LOC
  - Tests: ~30-50 LOC (3 unit: hash parser, clipboard error fallback, cross-tab switch; 1 e2e scenario)
- **Test plan**:
  - **Unit (3 tests)**:
    - Hash parser: `parseHash("#finding-abc-123")` → `{ tab: "conversation", id: "abc-123" }`; `parseHash("#finding-xyz-in-previous")` → `{ tab: "previous", id: "xyz" }`
    - Clipboard: `copyToClipboard("http://x/#finding-abc")` → returns success; on `navigator.clipboard.writeText` reject → returns failure (fall back to `document.execCommand` or show modal)
    - Cross-tab: `resolveHashForTab("abc-123", "xyz-tab")` → returns the matching tab name; not found → returns `"conversation"` (default)
  - **E2E (1 scenario)**: open review → add 3 findings → on finding #2 click "Copy link" → assert clipboard contains the URL with `#finding-<id>` suffix → open new tab at same URL → assert auto-scroll to finding #2 + flash highlight + comment thread expanded
- **Risk**: **LOW** — browser-native APIs (`window.location.hash`, `navigator.clipboard`, `element.scrollIntoView`), no server change, no schema change, no agent-prompt surface. The clipboard helper needs a fallback for older browsers / non-HTTPS contexts (the localhost URL works because browsers allow clipboard API on `127.0.0.1`).

### Candidate #3 (alternative — consider for R12, NOT for R11): Issue templates bulk-apply [OPEN GH #13, DEFERRED]

> **As a** reviewer with 5+ similar findings (e.g., 5 different files all missing error handling), and you want to insert one Saved Reply into all of them at once instead of opening each one,
> **I want** checkboxes on each finding card + a toolbar that appears when ≥1 selected with a "Apply saved reply to (N) findings" action that bulk-inserts via the R10 edit-finding PATCH endpoint,
> **So that** you can fan-out one template to many findings without 5 separate edit-drawer opens.

- **PM note**: This was supervisor-suggested as a candidate but the supervisor's suggested profile ("feature profile") conflicts with the underlying scope (per-finding checkbox UI + multi-PATCH coordination + R10 PATCH endpoint reuse = likely architecture profile borderline). It WOULD reuse R10's editFinding endpoint (`src/ui/app.ts:2928`), keeping it feature-profile. **Reuse the existing endpoint = feature profile** (single PATCH endpoint, just called N times in parallel). PM recommend R12 over R11 because:
  - R11 should be ≤2 candidates, scope-bounded, single-PR-sized
  - Per-finding permalinks (Candidate #2) is a cleaner standalone story
  - Saved Replies `/trigger` (Candidate #1) is the smallest possible feature (~50-100 LOC)
  - This candidate mixes 2 UI surfaces (Saved Replies modal + per-finding checkbox), which adds test surface
- **Includes for R11 reference only** — see `.omo/proposals.jsonl` line 11 follow_up_candidates `#5 Bulk actions` and `#3 Live file-watcher` (both architecture, both deferred to R12+)

## Recommended candidate

**Candidate #1 alone — Saved Replies `/trigger` keyboard shortcut expansion.** Smallest possible feature profile that closes a documented R10 gap.

**Why**:
1. **Smallest scope in the brief** — ~50-100 LOC prod + ~30-50 LOC tests = ~80-150 LOC. Faster to ship, test, document than any prior round.
2. **Documented R10 follow-up** — R10 brief.md L94 explicitly named this as "what's missing" — it's a known, scoped, minor velocity gap that R10 chose to defer.
3. **Pure UI feature on a stable base** — builds on R10's Saved Replies (working, tested, shipped) without touching the server, schema, or agent prompt.
4. **Validates v5.2 lightweight mode in real use** — R10 was architecture-profile and hit the timeout. R11 lightweight = first real test of the v5.2 lightweight-mode constraint (≤2 small features, ≤30-min Dev budget).
5. **PM-profiles feature**: Rule 2 fires (`U_user_visible=yes` + small bundle = feature). Rule 1 does NOT fire (no contract change, no server widening, no agent-prompt change).

If R11 user wants more scope: bundle with **Candidate #2 Per-finding permalinks** (~130-200 LOC, also feature profile, no agent-prompt risk, total R11 scope ~210-350 LOC = upper end of "lightweight" but still under 30-min Dev budget per v5.2 per-profile timeout). Both share the "external-share/extend affordance" theme: `/trigger` makes you faster typing into your own review; per-finding permalinks make it faster to share your review with others.

**Avoided for R11**:
- **Candidate #3 Issue templates bulk-apply** (mixed surfaces, larger; deferred to R12)
- **#12 Bulk actions** (architecture, deferred from R10 — would re-trigger 30-min timeout)
- **#13 Live file-watcher auto-reload** (architecture, new `chokidar` dep, deferred from R10)

## Self-Critique

- **Clarity rating**: 4/5 — both candidates have concrete `file:line` citations on current main `f9ac431`, web-verification URLs where possible (or explicit UNVERIFIED markers with search-budget honesty), user-value scores, and LOC estimates ranked by scope.

- **Hidden ambiguities**:
  - **Q: Will `/trigger` conflict with future OpenCode slash-commands?** Decision: **No — no conflict**, because (a) OpenCode slash-commands are intercepted at the TUI/prompt level, not inside the browser comment textarea; (b) we only trigger on `/<chars>` followed by `space`/`enter`/`tab`, not on `/` alone, so the literal `/` in any comment still works as plain text. Document the prefix in the Saved Replies modal so users know.
  - **Q: Should Candidate #2 (permalinks) handle the case where finding #N no longer exists (e.g., resolved + purged)?** Decision: **Yes — graceful fallback**: if `#finding-<id>` doesn't match any current finding in either tab, show a small toast "Finding not found — it may have been resolved or the URL is from a different round" and stay on the default tab.
  - **Q: Should permalinks include the round number?** Decision: **Optional v1**: hash uses `#finding-<id>` only (the finding's UUID-like id is unique across rounds since it's generated at creation). v2 could include `#round-<n>-finding-<id>` for explicit round pinning but is not needed.
  - **Q: Will per-finding permalinks break the existing "one-shot per round" URL affordance in README?** Decision: **No** — the round URL stays one-shot per `/diff-review-dashboard` invocation. Permalinks add a hash on top; the same round URL still works without a hash (just opens the dashboard at default scroll position).
  - **Q: Are there any R5-R10 features that R11 candidates duplicate?** Decision: **No** — verified via cross-reference. R10 Saved Replies click-to-insert (Candidate #1) is different from R11 Saved Replies `/trigger` expansion (keyboard path to the same data). R4 Previously discussed (read prior rounds) is different from R11 per-finding permalinks (deep-link within current round + Previously tab).

- **Risks**:
  - **Candidate #1 keyboard-shortcut conflict** (future OpenCode slash-commands): already addressed above; no actual conflict.
  - **Candidate #1 localStorage size limit**: templates now have an additional `trigger` string field (~50 chars each × 200 templates = 10KB), well under the 5-10MB per-origin limit.
  - **Candidate #2 clipboard permission on non-localhost URLs**: not a concern for the localhost-bound plugin (browsers allow clipboard API on `127.0.0.1`), but if the user ever runs the plugin behind a tunnel with HTTPS, the clipboard API still works. Add a `document.execCommand('copy')` fallback for the rare browser case where `navigator.clipboard.writeText` rejects (e.g., insecure context).
  - **Candidate #2 cross-round drift**: if a user shares a permalink to finding X in round 3, then proceeds to round 4 where X has been auto-closed as stale, the deep-link falls into "not found" gracefully. Document this in the README permalinks section.
  - **R11 strategy risk**: by avoiding architecture candidates, R11 may feel "small" relative to R10. **This is intentional** — R11 is the lightweight-mode validation round. R12+ can return to architecture scope.

## User-impact profile

```yaml
user_impact_profile_candidate_1_trigger_expansion:
  pm_source: agent-suggested (R10 brief.md L94 documented backlog + R10 follow-up)
  U_size: small                # 1 feature, ~50-100 LOC prod + ~30-50 LOC tests
  U_files: narrow              # 1-2 files (src/ui/app.ts only + unit test file)
  U_new_capability: no         # Extends R10 Saved Replies, additive keyboard path
  U_behavior_shift: no         # No contract change; agent-prompt unchanged; server endpoints unchanged
  U_user_visible: yes          # Keyboard behavior in comment box; visible dropdown popover on `/`
  U_data_shape_breaking: no    # Adds optional `trigger` string field to Saved Replies JSON; backwards-compat (slugified fallback)
  U_data_safety: yes           # localStorage is per-origin, survives reload; no failure modes
  U_installs_new_dep: no       # Browser-native APIs (textarea events, popover = existing CSS)
  recommended_profile_override: feature    # Rule 2 fires; Rule 1 does NOT fire

user_impact_profile_candidate_2_permalinks:
  pm_source: agent-suggested (R11 PM self-investigation — read app.ts, found no hash-anchor handling + no copy-link button)
  U_size: small                # 1 feature, ~100-150 LOC prod + ~30-50 LOC tests
  U_files: narrow              # 2-3 files (src/ui/app.ts + src/ui/review.html for highlight CSS + unit test)
  U_new_capability: yes        # Per-finding permalink is a new feature category
  U_behavior_shift: no         # URL fragment changes browser-native scroll behavior; no server contract change
  U_user_visible: yes          # Copy-link button on every finding; auto-scroll + highlight on URL hash match
  U_data_shape_breaking: no    # No schema change; finding IDs already exist
  U_data_safety: yes           # Graceful fallback when finding not found; no failure modes beyond missing-elements
  U_installs_new_dep: no       # Browser-native APIs (location.hash, clipboard.writeText, scrollIntoView, CSS keyframes)
  recommended_profile_override: feature    # Rule 2 fires; Rule 1 does NOT fire
```

## Profile recommendation

PM's intuition: **feature (LIGHTWEIGHT)** — Candidate #1 Saved Replies `/trigger` expansion is the recommended R11 candidate; Rule 2 fires (`U_user_visible=yes` + small bundle = feature); Rule 1 architecture does NOT fire (additive UI, no contract change, no server widening, no agent-prompt change).

For the candidates:
- **Candidate #1 (Saved Replies `/trigger` expansion)**: feature (small, scope-bounded; the cleanest 50-100 LOC R10 follow-up).
- **Candidate #2 (Per-finding permalinks)**: feature (small, scope-bounded; closes a real GitHub permalink gap; pure client-side JS).
- **Candidate #3 (Issue templates bulk-apply)**: feature-on-paper, architecture-leaning; DEFERRED to R12 (mixed UI surfaces = larger test budget).

**Lightweight round rationale (v5.2 lightweight-mode first real-world validation)**:
- v5.2 added the lightweight-mode constraint (≤2 small features, ≤30-min Dev budget, feature-profile-only, no architecture-profile candidates).
- R10 was architecture-profile and hit the 30-min default timeout despite v5 spec allowing 45min — concrete evidence that architecture rounds have higher risk in the current pipeline.
- R11 = first round to validate lightweight mode in real use: ship 1-2 small features inside the v5.2 lightweight budget, prove the lightweight round can complete cleanly inside the 30-min Dev timeout.
- R12+ can return to architecture-profile candidates (#12 Bulk actions, #13 Live file-watcher, or fresh).

**Recommended**: Candidate #1 alone (lightest possible feature, ≤30-min Dev budget, PM Manager approves with 1 cosmetic note — `/trigger` is keyboard interaction so the e2e scenario uses `playwright.keyboard.type()` instead of `await page.fill()`). If R11 user wants 2 candidates: bundle Candidate #1 + Candidate #2 (both feature-profile, total ~130-350 LOC + ~60-100 LOC tests = upper end of lightweight, still under 30-min Dev budget).

---

## PM Triage pre-check (R4 lesson — MANDATORY)

**PASS** — verified `git cat-file -e` for every SHA cited in prior round audit-trail:

| SHA | Source | Status |
|---|---|---|
| `f9ac43185187cca1140182d8b71f1edffd74ff60` | R11 baseline (v5.3 kickoff commit) | ✓ exists |
| `55737e5` | R10 Saved Replies feat commit | ✓ exists |
| `c5fed23` | R10 Export review feat commit | ✓ exists |
| `3dfcfb4` | R10 Edit finding feat commit | ✓ exists |
| `643c5b8` | R10 e2e scenario commit | ✓ exists |
| `4ef61de` | R10 closure audit-trail commit | ✓ exists |
| `8bc25b2` | R10 merge commit | ✓ exists |

(5 R10 SHAs + v5.3 baseline + R10 closure + merge = 8/8 verified. No fabricated SHAs. R4 lesson applied.)

---

## Phase -0 Sync summary (R11 v5.3 kickoff)

- **baseline**: `f9ac43185187cca1140182d8b71f1edffd74ff60` (v5.3 commit; main HEAD; clean working tree)
- **local ahead of remote**: 3 commits [70382a2 v5.1, 04a975f v5.2, f9ac431 v5.3] — closure commit will push all 4 (including R11 work)
- **GH labels pre-created** (v5.3 Gap-O fix): `pm-manager-approved` (#0E8A16), `round-11` (#1D76DB) — 11 total repo labels (9 default + 2 R11)
- **tool pre-flight (v5.1)**: git/node/bun/playwright-cli/gh/python3/chrome ALL OK (0 missing)
- **PASS — proceeding to Phase 0.5 PM Manager review**

---

## Loop-internal / rejected candidates

**None rejected** — both candidates pass the 3-test Product-value gate. (R10 brief rejected 1 candidate at gate stage; R11 brief is tighter.)

The 2 deferred items (#12 Bulk actions, #13 Live file-watcher) remain **OPEN on GitHub** as architectural follow-ups for R12+, NOT loop-internal — they're real future features, just not in R11's lightweight scope. They will surface again in the R12 PM Triage prompt's backlog-freshness list.
