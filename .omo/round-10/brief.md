# PM Brief — Round 10 (v5 first round)

> **Date**: 2026-06-29
> **Author**: Round 10 PM Triage (fresh subagent, v5 cron-style loop kickoff)
> **Status**: PM brief, awaiting PM Manager review (Phase 0.5)
> **Source**: v5 competitor-driven analysis + R9 backlog-freshness carry-over (`#2 Edit in-place`, `#3 Export state.json`) + 4 fresh candidates from self-investigation + 0 open GH issues + 0 SPECULATION/CONTRADICTION markers found
> **Pre-check result**: PASS (R9 baseline `b616c8a` verified, R9 audit-trail SHAs verified — see `## Source` block)
> **Profile recommendation**: feature (Rule 2 — `U_user_visible=yes` + small bundle = feature profile; Rule 1 architecture does NOT fire because recommended candidate is additive UI/data, no agent-prompt contract change)

---

## Title

R10 ships **reviewer velocity shortcuts for high-frequency review actions** — the next major gap after R9's reviewer-agency work is reviewer velocity: every reviewer past round 3 of any real review retypes the same 5-10 comments ("missing error handling", "this is a duplicate of PR #42", "needs a unit test", etc.). Round 10 candidates close that velocity gap with **Saved Replies / Comment Templates** (the GitHub feature), **Edit a finding in-place** (R9 backlog seed), **Bulk actions** (multi-select resolve / reopen), **Live file-watcher auto-reload** (unique OpenCode capability), and **Export review as markdown / patch** (closes the GitHub "download patch" gap).

## Source

- **R10 baseline**: `b616c8a` (v5 skill commit — `git cat-file -e b616c8a7ba9eca2ed6590467f76b5874435389ac` PASS, current `main` HEAD)
- **R9 SHAs verified**: 3/3 product commits exist in git:
  - `db92b37` ✓ (manually_reopened flag + server guard widening + agent prompt)
  - `d5bbafc` ✓ (Force Reopen button on stale findings + reason modal)
  - `785e2b2` ✓ (unit tests + e2e scenario + mock-server fix + Playwright walkthrough)
  - 2 regex artifacts (Dev session ID `61f52cb6`, word "feedback" `feedbac`) — NOT real SHAs, false positives
- **R9 backlog-freshness carry-over**: `.omo/proposals.jsonl` last line `follow_up_candidates` for R10 explicitly seeds `#2 Edit a finding in-place` and `#3 Export state.json` (R9 PM's own discoveries from self-investigation). Both are valid candidates but the brief prefers fresh stories per v5 ("R10 should be a fresh user-story not in follow_up backlog if possible").
- **R9 closure**: SHIP per `.omo/round-9/decision.md` — architecture profile, 102/102 unit tests pass, 20/20 e2e scenarios, 0 console errors (Gap K mandatory check passed), 4 Playwright walkthrough screenshots, no in-flight items block R10.
- **GitHub issue list**: `gh issue list --state open --limit 30` returned `[]` — no open user complaints. All feedback is captured via the round-by-round retro path.
- **v5 competitor analysis** (mandatory): see `## Competitor analysis` below. All "competitor has X" claims web-verified via `MiniMax_web_search` with cited URLs (see per-candidate notes); claims without verification URLs are marked `UNVERIFIED`.

## User pain (1-3 sentences, user terms)

You finish a 4-round review of a 1,200-LOC PR with 32 findings, and you realize you've typed "missing error handling" 9 times, "needs a unit test" 6 times, and "duplicate of PR #42" 4 times — and the dashboard has **no Saved Replies** (GitHub has had this for years at https://help.github.com/articles/about-saved-replies/), **no Edit button** so a typo'd severity means Remove + re-add (which loses your comment thread), **no Bulk action** so resolving 6 obvious duplicates means 6 clicks, **no live auto-reload** so when you tweak a typo in your editor mid-review the diff stays stale, and **no Export button** so you can't share the review with a teammate without SSH'ing into the plugin's working dir. Round 10 fixes that — Saved Replies is the headline (single highest-value velocity feature, no agent-prompt risk), with 4 other velocity candidates queued behind it.

## Competitor analysis (v5 — mandatory)

| Tool | Core capability | opencode-review-dashboard |
|---|---|---|
| GitHub PR review | Inline comments, suggested changes, **saved replies**, draft review | Partial: inline findings + multi-round review, **NO saved replies**, **NO suggested-change apply** |
| GitLab MR | Approvals, multi-reviewer, MR rules, **suggestions** | Has: single-user review |
| Gerrit | Code review voting (-2..+2), **patch sets**, Change-Id | Has: severity, no voting, **NO patch-set comparison** |
| Phabricator / Differential | Audit trail, herald rules, **bulk edit / batch edit** | Has: round history, no audit log, **NO bulk edit** |
| Sourcetree | Visual diff, no review | Partial: diff is core, no review |
| Cursor review | AI-suggested review, inline, **Cmd+K to apply AI fix** | Partial: no AI suggestion |
| aider rewind | Whole-file re-suggestion, **AI-driven patch** | No |
| diff.nvim | Side-by-side diff, **live file-watcher** | Has: split view, **NO live file-watcher** |

### Unique OpenCode + plugin capabilities (我们独占)

- **Round-by-round review** with stale-finding auto-close (no competitor does this natively)
- **Local-only** review (no server, no PR required) — uniquely friction-free for solo work
- **Auto-apply agent workflow** — agent reads findings, applies fixes, re-reviews (no competitor has this loop; Cursor/aider have AI patches but not the find → apply → re-review loop)
- **Cross-round drift banner** (yellow banner when diff range changes between rounds) — unique
- **localStorage-resizable sidebar** + sidebar keyboard navigation (R8) + in-tab search (R8)
- **Force Reopen** (R9) with `manually_reopened` flag honored by the agent
- **Language-matched agent replies** (R5) — CJK detection, replies in user's language
- **Atomic state writes** (R1) — survive power loss
- **Previously discussed panel** (R4) — round-by-round notes + threads in dedicated tab
- **Crash-safe corrupt-state preservation** (R1) — `.corrupt-<ts>` recovery

### Gaps (competitor 上有但我们没有) — PM turns into candidates below

- **Saved Replies / Comment Templates** (GitHub has, we don't) → **Candidate #1 (recommended)**
  - VERIFIED: https://help.github.com/articles/about-saved-replies/ — GitHub's "About saved replies" docs page (canonical)
  - GitHub docs: "Save time by creating a saved reply for the responses you use most frequently. Once you've added a saved reply, it can be used in issues, pull requests, and discussions. Saved replies are tied to your personal account. Once they're created, you'll be able to use them across repositories and organizations. You can create a maximum of 100 saved replies."
- **Edit finding in-place** (GitHub does NOT have — they require delete + re-add) → **Candidate #2**
  - UNVERIFIED unique claim: GitHub's review comments are immutable post-submission per common knowledge; no canonical docs URL found in 5-search budget. **Marked as plausible unique.**
- **Live file-watcher auto-reload** (diff.nvim has this for plugin users; not a competitor-feature per se) → **Candidate #3**
  - VERIFIED partial: vscode-pull-request-github extension (`https://github.com/microsoft/vscode-pull-request-github`) tracks file changes for VS Code reviewers; the web-GitHub UI does not. Our case is "reviewing locally in a browser tab against a working tree", where file-watcher auto-reload is genuinely novel.
- **Export review as markdown / patch download** (GitHub has `.patch` and `.diff` URLs via `https://github.com/<owner>/<repo>/pull/<n>.patch` and `.diff`) → **Candidate #4**
  - VERIFIED: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews — GitHub's "About pull request reviews" docs section discusses `Commits`, `Files changed`, and `Patch` view modes; the `.patch`/`.diff` URL trick is documented community knowledge.
- **Bulk actions (multi-select + bulk resolve / bulk reopen)** (Phabricator / Differential has it; Gerrit has batch review actions; GitHub does NOT have a bulk UI) → **Candidate #5**
  - UNVERIFIED: Phabricator batch-edit confirmed via Gerrit-vs-Phabricator comparison docs found in searches but no canonical Phabricator URL cited; mark as plausible closing-gap for "bulk action" UX even though GitHub lacks it.

## Candidates ranked (3-5 user-stories)

### Candidate #1: Saved Replies / Comment Templates [RECOMMENDED]

> **As a** reviewer who finishes 30+ finding reviews and retypes the same 5-10 boilerplate comments ("missing error handling", "needs a unit test", "duplicate of issue #N", "consider extracting to a helper"),
> **I want** a "Saved Replies" affordance on every finding's comment box — a dropdown showing my saved-reply list, one click inserts the comment, plus a Settings menu where I can save the current draft as a new saved reply with a `/trigger` shorthand (like GitHub's "Duplicate issue" built-in),
> **So that** I can stop retyping the same comments, ship reviews faster, and keep my review prose consistent across rounds.

- **user-value**: 4/5 — saves 30-60 seconds per re-used comment × 10-30 re-uses per review = 5-30 minutes per review. The single most common velocity feature in code review (every senior reviewer has 5+ boilerplate comments they reuse).
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on "saved replies", "comment templates", "comment shortcuts", or any equivalent. Adding "Saved Replies" would add a new section to "Other shipped features" + a paragraph to "Review UI > Conversation".
  - **Test 2 (非开发者可见)**: PASS — a non-developer (PM, designer, technical writer) reviewing comments would see the dropdown icon and 1-click inserts; visible in the Conversation panel and the per-finding comment box.
  - **Test 3 (竞品已具备)**: PASS — GitHub has Saved Replies (https://help.github.com/articles/about-saved-replies/), GitLab has "Quick actions" (e.g. `/assign`, `/close", same UX family), Sourcetree has "Saved searches" for file filters. Closing competitor gap = valid feature.
- **file:line evidence**:
  - Comment-add UI: `src/ui/app.ts:2445` `async function addComment(id: string, text: string)` — POST handler, no template mechanism
  - Comment input box: `src/ui/app.ts:2000-2050` (the textarea + send button region per the `setStatus` call at line 2662)
  - Settings menu: `src/ui/review.html` has zero "Saved Replies" or "Templates" affordance (verified via `grep -nE 'savedReplies|presets|template' src/ -r` → only "Draft saved" status at `app.ts:2662`)
  - Storage location: `localStorage` (already used for sidebar width persistence per R5) — no new dependency
- **"what's missing" note**:
  - **No client-side template storage**: `grep -nE 'localStorage|savedReplies' src/ui/app.ts` → only sidebar width persistence (R5). No template list, no CRUD.
  - **No server-side template sync**: like GitHub's "saved replies tied to your personal account, used across repositories" — would require a server endpoint, but for v1 localStorage is sufficient (matches GitHub's behavior on the local browser; sync is a v2 concern).
  - **No keyboard shortcut**: GitHub's saved replies dropdown opens via a button; we can do the same plus `/`-prefix triggering (typed `/missing-err` expands to the saved reply).
- **LOC estimate**: ~100-150 across 2 files (`src/ui/app.ts` + `src/ui/review.html` for the dropdown CSS)
  - Settings UI: ~30 LOC (modal or sidebar section with template list + add/edit/delete)
  - Dropdown trigger: ~30 LOC (per-finding comment box gains a 📋 button + dropdown rendering)
  - LocalStorage CRUD: ~20 LOC (load/save/delete with JSON encoding)
  - Keyboard shortcut `/` prefix: ~20 LOC (autocomplete detection)
  - Tests: ~30-50 LOC (4 unit tests: insert template, save template, delete template, /-prefix expand + 1 e2e)
- **Test plan**:
  - Unit: save 3 templates → reload page → templates persist via localStorage; click template → text inserts into comment box at cursor position; type `/missing` + space → expands to saved reply; delete template → disappears from dropdown
  - E2E: open review → add 3 findings → open comment box → see 📋 button with 0 templates (first-time UX) → click "Save current as template" → name it "needs-test" → re-open comment box → see 📋 with 1 template → click → comment text appears → submit → next round retains template
- **Risk**: LOW — localStorage-only, no schema change, no agent-prompt surface, no new dependency. Pure UI enhancement.

### Candidate #2: Edit a finding's category / severity / comment in-place [R9 backlog seed]

> **As a** reviewer who created a finding 3 rounds ago and noticed you picked `low severity` when it's actually `high`, or had a typo in the comment,
> **I want** an "Edit" button on every finding in the Conversation panel that re-opens the drawer with the current category / severity / comment pre-filled and a separate `PATCH /api/review/${id}/finding` endpoint that updates only those fields,
> **So that** you can fix findings you got wrong without removing + re-adding (which loses round attribution, comment thread, and the `manually_reopened` flag from R9).

- **user-value**: 4/5 — same reviewer-agency theme as R9 Force Reopen. Real pain across all multi-round reviewers — every reviewer has at least 1 typo or severity miss out of every 20-40 findings.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on editing a finding's fields post-creation. Currently only Remove + re-add is documented.
  - **Test 2 (非开发者可见)**: PASS — visible Edit button on every finding; would surface in README "Other shipped features" + Conversation panel docs.
  - **Test 3 (竞品已具备)**: FAIL — UNVERIFIED unique claim. GitHub PR review comments are immutable post-submission (must delete + re-add); no canonical URL found in 5-search budget. Marked plausible unique.
- **file:line evidence** (re-verified on `b616c8a`):
  - **No edit endpoint**: `grep -nE '(PUT|PATCH|POST).*finding' src/index.ts` shows only `/api/review/${id}/resolve`, `/api/review/${id}/reopen`, `/api/review/${id}/comment`, `/api/review/${id}/submit`, `/api/review/${id}/draft` — NONE accept `category` / `severity` / `comment` mutations on an existing finding.
  - **No edit button in UI**: `src/ui/review.html` has zero "Edit" affordance. `renderConversationPanel` (`src/ui/app.ts:1781-1859`) renders only `Remove | Resolve | Reopen | Jump` per item (with Force Reopen for stale added in R9).
  - **`Finding` type immutable post-creation**: `src/index.ts:28-46` — fields like `category`, `severity`, `comment` are written once on creation and never mutated.
- **"what's missing" note**:
  - **`PATCH /api/review/${id}/finding` endpoint** — accepts `{ finding_id, category?, severity?, comment? }`, validates category∈{bug,style,perf,question,recommend} and severity∈{high,medium,low} and `comment.length ≤ 2000`, updates the finding, mirrors to `data.existing_findings`, appends a system comment (`Finding edited by user: severity low→high`) to preserve history.
  - **Edit button on each item** in Conversation + Previously discussed panels — opens the drawer pre-filled with current values, the "Save" button updates instead of adds.
- **LOC estimate**: ~150-250 across 3 files (~150-250 LOC prod + ~30-50 LOC tests). Borderline-medium feature.
- **Risk**: MEDIUM — TOUCHES THE AGENT PROMPT (agent reads `findings[].severity` + `findings[].comment`, so edits need to flow through the structured payload). Same architecture profile as R9 Force Reopen.
- **Architecture profile note**: This candidate would be classified as architecture (Rule 1: `U_behavior_shift=yes`) — server now accepts category/severity/comment mutation that was previously rejected, agent prompt needs a 1-paragraph note that edited fields are honored.

### Candidate #3: Live file-watcher auto-reload [FRESH — unique OpenCode capability]

> **As a** reviewer who is also the author, fixing typos in your editor while the review tab is open,
> **I want** the diff to auto-reload within ~500ms whenever a file in the working tree changes (git working tree watcher, not just the committed diff),
> **So that** you can re-review your own in-progress fixes without clicking a "Refresh" button or re-running `/diff-review-dashboard` every time.

- **user-value**: 3/5 — niche but high-value when it applies. Only matters when you're both the reviewer AND the author (very common in solo work, less common in team PR review). Eliminates a friction loop: edit file → switch to review tab → click reload → re-scan the diff.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on live auto-reload, file watching, or hot-reload of diffs.
  - **Test 2 (非开发者可见)**: PASS — diff cards visibly auto-update without a page refresh; banner ("diff auto-updated 3s ago") makes it clear what happened.
  - **Test 3 (竞品已具备)**: FAIL — UNVERIFIED unique claim. vscode-pull-request-github extension tracks file changes (`https://github.com/microsoft/vscode-pull-request-github`), but only for VS Code users — not for browser-tab reviewers. GitHub web UI never auto-reloads. Marked plausible unique (cannot prove a negative, but no browser-tab reviewer-tool offers this).
- **file:line evidence** (re-verified on `b616c8a`):
  - **No file watcher exists**: `grep -nE 'fs\.watch|chokidar|watchFile|onDidChange|fileWatch' src/index.ts src/ui/app.ts` → **0 matches**. No file-watching code at all.
  - **Diff is static per round**: `src/index.ts:1400-1500` (the diff-collection path) runs once on `/diff-review-dashboard` invocation; the client receives a frozen `data.files[]` snapshot per round.
  - **WebSocket / SSE infrastructure**: `grep -nE 'WebSocket|EventSource|server-sent' src/` → **0 matches**. No live-update channel exists.
- **"what's missing" note**:
  - **Server-side file watcher**: a small `chokidar` watcher on the working tree that fires on `.js`/`.ts`/`.tsx`/etc. changes (NOT on `.opencode/` or `node_modules` or `dist/`).
  - **SSE endpoint**: `/api/review/${id}/events` that pushes `{ type: "file-changed", path: "..." }` events to the browser.
  - **Client-side handler**: `EventSource` connection in `src/ui/app.ts`, on `file-changed` event re-fetches the diff (debounced 500ms) and updates only the affected file card (not the whole list).
- **LOC estimate**: ~150-250 across 3 files (`src/index.ts` server + `src/ui/app.ts` client + `package.json` for `chokidar` dependency)
- **Risk**: MEDIUM — installs a new dependency (`chokidar`, ~250KB). Need a debounce strategy to avoid hammering the diff endpoint on every keystroke (e.g., save in editor → 10 file-change events fire in 200ms).
- **Fresh-investigation signal**: This candidate was NOT in any prior `follow_up_candidates` backlog — surfaced from R10 PM self-investigation reading the API surface and finding zero live-update infrastructure. Fresh signal true.

### Candidate #4: Export review as markdown / patch download [R9 backlog seed as #3 Export state.json, broader]

> **As a** reviewer who wants to share the current round's findings with a teammate via Slack/email/notion, or attach the review to a bug report,
> **I want** an "Export" button next to Submit that downloads the current round's findings as a single Markdown document (`.md`) or as a `.patch`-style file with all finding comments appended as inline `// REVIEW:` comments to the diff,
> **So that** you can share the review with anyone without needing them to install OpenCode or have a session ID.

- **user-value**: 3/5 — debug-aid + share-aid. Matters during bug investigation and team async review. ~5-10 minutes saved per share scenario. Lower than Saved Replies or Edit because sharing reviews is less frequent than commenting on them.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on exporting or sharing the review. Currently only `state.json` and `round-NNN.md` exist on disk (filesystem-level, not user-accessible).
  - **Test 2 (非开发者可见)**: PASS — visible Export button next to Submit; would surface in README "Header actions" + "Other shipped features".
  - **Test 3 (竞品已具备)**: PASS — GitHub has `.patch` and `.diff` URLs (`https://github.com/<owner>/<repo>/pull/<n>.patch`, verified via docs `https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews`). Closing competitor gap.
- **file:line evidence** (re-verified on `b616c8a`):
  - **No GET for the raw state**: only `/api/review/${id}` (returns the UI-shaped `data` payload, filtered) and `/api/review/${id}/prior-notes` (returns historical-round notes+findings only) exist.
  - **No download UI**: `src/ui/review.html` has zero export/download buttons. Submit button is the only POST that produces a downloadable artifact (the round-NNN.md written server-side, not downloadable from the UI).
  - **`Content-Disposition` not used anywhere**: `grep -nE 'Content-Disposition|attachment' src/index.ts` → **0 matches**. The server never sets attachment headers.
- **"what's missing" note**:
  - **GET endpoint** `/api/review/${id}/export.md` returning the round's findings as a Markdown doc with `Content-Disposition: attachment; filename="review-<round>-<session>.md"`.
  - **GET endpoint** `/api/review/${id}/export.patch` returning a unified-diff with finding comments as `// REVIEW: ...` annotations on the relevant lines.
  - **Two client buttons** next to Submit (one for .md, one for .patch) that trigger the downloads via the existing `endpoint()` helper.
- **LOC estimate**: ~80-120 across 2 files (~80-120 LOC prod + ~20-30 LOC tests). Small feature.
- **Risk**: LOW — read-only, no schema change, no agent-prompt surface. Touches server + tiny UI piece.

### Candidate #5: Bulk actions (multi-select + bulk resolve / bulk reopen) [FRESH]

> **As a** reviewer who accumulates 20+ findings and wants to resolve 5 obvious duplicates at once, or reopen 3 stale-but-still-relevant findings in one batch,
> **I want** checkboxes next to each finding in the Conversation panel, plus a toolbar that appears when ≥1 is selected ("Resolve (3) | Reopen (3) | Remove (3) | Jump to first"),
> **So that** you can clear the obvious cases in 3 clicks instead of 15.

- **user-value**: 4/5 — high for multi-round reviewers with 20+ findings. Eliminates the "click-click-click-click" loop for obvious cases.
- **Product-value gate (3-test, v5)**:
  - **Test 1 (README 缺段)**: PASS — README.md has 0 paragraphs on bulk actions or multi-select.
  - **Test 2 (非开发者可见)**: PASS — visible checkbox column + toolbar; would surface in README "Conversation" section.
  - **Test 3 (竞品已具备)**: PARTIAL — Phabricator Differential has batch-edit; Gerrit has batch review actions (verified via search results but no canonical URL); GitHub does NOT have bulk-action UI for review threads (each must be resolved individually). Closing Phabricator/Gerrit gap = valid feature.
- **file:line evidence** (re-verified on `b616c8a`):
  - **No checkbox UI**: `grep -nE 'checkbox|multiSelect|selectAll|bulk' src/ui/app.ts src/ui/review.html` → **0 matches** (only false positives like "select" in option lists).
  - **No bulk endpoint**: `grep -nE 'bulk|batch' src/index.ts` → **0 matches**. Endpoints accept a single `finding_id` only.
- **"what's missing" note**:
  - **Checkboxes on each finding row** in `renderConversationPanel` (`src/ui/app.ts:1781-1859`).
  - **Bulk-action toolbar** that appears when ≥1 checkbox is checked, with "Resolve", "Reopen", "Remove" buttons.
  - **`POST /api/review/${id}/bulk` endpoint** that accepts `{ finding_ids: string[], action: "resolve" | "reopen" | "remove" }` and applies the action atomically (using the existing atomic-write helpers from R1).
- **LOC estimate**: ~150-250 across 3 files (~150-250 LOC prod + ~30-50 LOC tests). Medium feature.
- **Risk**: MEDIUM — atomicity requirements (bulk action is all-or-nothing), and Force Reopen (R9) interaction (bulk reopen would need to set `manually_reopened: true` for stale findings in the batch). Need to coordinate with R9's `manually_reopened` flag logic.

## Recommended candidate

**Candidate #1 — Saved Replies / Comment Templates** is the recommended R10 candidate.

**Why**:
1. **Highest user-value density per LOC**: 4/5 user value at ~100-150 LOC = best ratio of any candidate.
2. **Clean closing-competitor-gap**: GitHub has it (`https://help.github.com/articles/about-saved-replies/`), so the user has clear expectations from day 1.
3. **Lowest risk**: localStorage-only, no schema change, no agent-prompt surface, no new dependency. Pure UI enhancement. **Will NOT trigger architecture profile.**
4. **Fresh, not in R9 backlog**: Per v5 brief instructions ("R10 should be a fresh user-story not in follow_up backlog if possible"), this is a clean break from the R1-R9 trajectory.
5. **Thematic coherence with R5 + R8**: R5 added language-matched replies (CJK detection); R8 added in-tab search + sidebar keyboard nav; R10's Saved Replies is the natural "velocity" cousin — every user-facing affordance we've added lately has been a "make the user faster" affordance, not a "make the system smarter" affordance. R9 broke the streak with Force Reopen (architecture); R10 returns to the velocity streak.
6. **Tests land cleanly**: 4 unit tests + 1 e2e scenario = ~50 LOC of tests, ~150 LOC of prod = fits "small feature" hard cap.

If R10 user wants more scope: bundle with **Candidate #4 Export review as markdown** (both are localStorage + read-only server work, no agent-prompt risk, together ~180-270 LOC + ~50-80 LOC tests = upper end of "medium feature" hard cap). Both share the "external-share affordance" theme: Saved Replies makes your own review faster, Export makes sharing your review with others faster.

**Profile**: feature (Rule 2: `U_user_visible=yes` + small bundle = feature profile; Rule 1 architecture does NOT fire — recommended candidate is additive UI/data, no agent-prompt contract change, no server guard widening).

## Self-Critique

- **Clarity rating**: 4/5 — every candidate has concrete `file:line` citations on current `main` `b616c8a`, web-verified competitor URLs (where possible), user-value scores, and LOC estimates. The 5 candidates are ranked by user-value × implementation cost ratio, not by "looks impressive".

- **Hidden ambiguities**:
  - **Q: Should Saved Replies be localStorage-only (per-browser) or sync to the plugin server?** Decision: **localStorage-only for v1**. GitHub's saved replies are server-synced (across repositories and organizations) but that requires user identity + server-side persistence. For a local plugin, localStorage matches the user's mental model — "my templates are on this browser, on this machine." A future v2 could add sync if multiple-machine reviews become common.
  - **Q: Will Saved Replies clash with R5's language matching (CJK detection)?** Decision: **No — Saved Replies is the template, language matching is the auto-reply from the agent**. The user's template can be in any language; the agent's reply still matches the template's CJK ratio. Two separate concerns.
  - **Q: Should Edit finding in-place (Candidate #2) be in this round or saved for R11?** Decision: **Saved for R11**. R9 PM explicitly seeded it for R10 backlog, but Candidate #1 (Saved Replies) is higher user-value AND lower-risk AND fresh (not in backlog). The brief instructions prefer fresh, so #1 wins.
  - **Q: Is Candidate #3 (Live file-watcher) actually worth the new dependency cost?** Decision: **Borderline**. The `chokidar` dependency is ~250KB and adds a non-trivial failure mode (file-system events are flaky on some platforms). The user-value is real but niche (only matters for solo authors reviewing their own work). Recommend deferring to R11 unless R10 user explicitly opts in.
  - **Q: Is Candidate #5 (Bulk actions) too big for R10?** Decision: **Yes — 150-250 LOC + agent-prompt coordination with R9's Force Reopen = borderline-medium feature, possibly architecture profile**. Recommend deferring to R11 or R12 when the codebase has more reviewer-agency features stable.
  - **Q: Are there any R5-R9 features that R10 candidates duplicate?** Decision: **No** — verified via cross-reference. R8 In-tab search (filter existing content) is different from R10 Saved Replies (insert from template). R4 Previously discussed (read prior rounds) is different from R10 Bulk actions (batch-mutate current round). R9 Force Reopen (single stale finding) is different from R10 Bulk reopen (multi-finding batch).

- **Risks**:
  - **Candidate #1 localStorage size limit**: 5-10MB per origin. Saved replies are text (1-2KB each × 100 max = 100-200KB), well under limit. No risk.
  - **Candidate #1 keyboard shortcut conflict**: Typing `/` in the comment box to trigger saved-replies might conflict with future `/slash-commands` from OpenCode. Mitigation: only trigger on exact match `/<name>` followed by space or Enter, never on `/` alone. Document the prefix in the dropdown tooltip.
  - **Candidate #2 (if user picks it over #1) agent-prompt risk**: Edits flow through structured payload, so the agent must re-read `findings[].severity` and `findings[].comment` after the edit. Architect designs a 1-paragraph patch; tester verifies in Playwright walkthrough.

## User-impact profile

```yaml
user_impact_profile_candidate_1_saved_replies:
  pm_source: agent-suggested (R10 PM self-investigation + v5 competitor analysis)
  U_size: small                # 1 feature, ~100-150 LOC prod + ~30-50 LOC tests
  U_files: narrow              # 2 files (src/ui/app.ts + src/ui/review.html); no server change
  U_new_capability: yes        # Saved Replies is a new feature category, not an iteration
  U_behavior_shift: no         # No contract change; agent-prompt unchanged; server endpoints unchanged
  U_user_visible: yes          # 📋 button + dropdown + Settings menu are all visible UI
  U_data_shape_breaking: no    # localStorage-only persistence, no schema change
  U_data_safety: yes           # localStorage is per-origin and survives page reloads; no failure modes
  U_installs_new_dep: no       # localStorage is browser-native
  recommended_profile_override: feature    # Rule 2 fires (U_user_visible=yes + small bundle = feature); Rule 1 does NOT fire

user_impact_profile_candidate_4_export_review:
  pm_source: agent-suggested (R10 PM self-investigation + v5 competitor analysis; extends R9 backlog seed #3 Export state.json)
  U_size: small                # 1 feature, ~80-120 LOC prod + ~20-30 LOC tests
  U_files: narrow              # 2 files (src/index.ts + src/ui/app.ts); no schema change
  U_new_capability: yes        # Export button is a new feature category
  U_behavior_shift: no         # Read-only GET endpoints, no server-side state mutation
  U_user_visible: yes          # Export button visible in header next to Submit
  U_data_shape_breaking: no    # Output is a new file format, not a schema change
  U_data_safety: yes           # Read-only, no failure modes beyond missing-files
  U_installs_new_dep: no       # No new dependencies; uses existing HTTP server
  recommended_profile_override: feature    # Rule 2 fires; Rule 1 does NOT fire

user_impact_profile_candidate_2_edit_finding_R9_backlog_seed:
  pm_source: agent-suggested (R9 PM Manager callout + R9 closure follow_up_candidates #2)
  U_size: small                # 1 feature, ~150-250 LOC prod + ~30-50 LOC tests
  U_files: small               # 3 files (src/index.ts + src/ui/app.ts + src/ui/review.html for edit-drawer prefill CSS)
  U_new_capability: yes        # Edit button is a new feature category
  U_behavior_shift: yes        # Server now accepts category/severity/comment mutation that was previously rejected
  U_user_visible: yes          # Edit button on every finding row
  U_data_shape_breaking: no    # Additive PATCH endpoint; existing POST endpoints unchanged
  U_data_safety: yes           # Atomic writes via existing helpers; system-comment preserves history
  U_installs_new_dep: no       # No new dependencies
  recommended_profile_override: architecture    # Rule 1 fires (U_behavior_shift=yes); would need 7-role loop

user_impact_profile_candidate_3_live_file_watcher:
  pm_source: agent-suggested (R10 PM self-investigation; unique OpenCode capability)
  U_size: medium               # 1 feature, ~150-250 LOC prod + ~30-50 LOC tests
  U_files: small               # 3 files (src/index.ts + src/ui/app.ts + package.json for chokidar)
  U_new_capability: yes        # Live auto-reload is a new feature category
  U_behavior_shift: yes        # Diff now updates without user action; new SSE channel
  U_user_visible: yes          # Diff cards visibly auto-update
  U_data_shape_breaking: no    # No schema change; just a new event channel
  U_data_safety: yes           # Debounced re-fetch prevents hammering; old data preserved if fetch fails
  U_installs_new_dep: yes      # chokidar (~250KB)
  recommended_profile_override: feature    # Rule 1 might fire (U_behavior_shift=yes); recommend architecture review

user_impact_profile_candidate_5_bulk_actions:
  pm_source: agent-suggested (R10 PM self-investigation + v5 competitor analysis)
  U_size: medium               # 1 feature, ~150-250 LOC prod + ~30-50 LOC tests
  U_files: small               # 3 files (src/index.ts + src/ui/app.ts + src/ui/review.html for checkbox CSS)
  U_new_capability: yes        # Bulk actions is a new feature category
  U_behavior_shift: yes        # Server now accepts batch operations; atomicity requirements
  U_user_visible: yes          # Checkbox column + toolbar
  U_data_shape_breaking: no    # New bulk endpoint; existing single-finding endpoints unchanged
  U_data_safety: yes           # Atomic batch via existing helpers; partial failures must rollback
  U_installs_new_dep: no       # No new dependencies
  recommended_profile_override: architecture    # Rule 1 fires (U_behavior_shift=yes); would need 7-role loop
```

## Profile recommendation

PM's intuition: **feature** (Rule 2 — for Candidate #1 Saved Replies: `U_user_visible=yes` + small bundle = feature profile; Rule 1 architecture does NOT fire because Saved Replies is additive UI/data, no agent-prompt contract change, no server guard widening).

For the 4 backup candidates:
- **Candidate #2 (Edit finding)**: architecture (Rule 1: `U_behavior_shift=yes` — server widens category/severity/comment mutation rejection).
- **Candidate #3 (Live file-watcher)**: feature OR architecture (borderline; new SSE channel + new dependency could flip to architecture). Defer until R11.
- **Candidate #4 (Export review)**: feature (Rule 2 fires; Rule 1 does NOT — read-only, no contract change).
- **Candidate #5 (Bulk actions)**: architecture (Rule 1: `U_behavior_shift=yes` — server now accepts batch operations with atomicity guarantees).

For all candidates: 7-role loop runs in full (PM → PM Manager → Architect → Dev → Tester → PM Doc Writer → Decision), 5 parallel review-work lenses per Tester (Goal / QA / Code / Security / Context) — same cadence as R6/R7/R8/R9.

**Recommended**: Candidate #1 alone (feature profile). If R10 user wants more: bundle Candidate #1 + Candidate #4 (both feature-profile, no agent-prompt risk, ~180-270 LOC + ~50-80 LOC tests = upper end of "medium feature" hard cap, thematic coherence on "external-share affordance").