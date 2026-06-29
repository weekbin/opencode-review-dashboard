# Round 9 Brief — #4 Reopen Stale Findings (R8 Carry-Over) + Fresh User-Stories

> **Date**: 2026-06-29
> **Author**: Round 9 PM Triage
> **Status**: PM brief, awaiting PM Manager review
> **Source**: R8 PM Manager callout (`.omo/round-8/pm-manager-review.md` ## Action items #3) — #4 reopen is REAL gap saved from R8 brief as Bucket B; #4 is **feature-shaped, not bugfix**, needs **server-contract + agent-prompt** review lens (different from R8's a11y lens)
> **Pre-check result**: PASS (see `## Source` block for canonical R8 SHA verification writeup, PM Manager reuse per Patch G optimization)

## Title

R9 ships **reviewer agency over the findings they create** — the ability to manually re-open a stale (`closed_auto`) finding with an explicit user override (a `manually_reopened` flag the server carries through to the agent so it does not silently re-auto-close), plus in-place edit of a finding's category / severity / comment after it has been created (currently only Remove + re-add is possible, which loses anchors and round attribution).

## Source

- **R8 carry-over (PM Manager callout)**: `.omo/round-8/pm-manager-review.md` ## Action items #3 — "schedule Bucket B (#4 reopen stale) as Round 9 standalone feature round, NOT a bugfix. If Round 8 ships Bucket A successfully, file `.omo/round-9/brief.md` with #4 as the headline candidate." R8 brief candidate #4 (`brief.md:88-105`) is the canonical description; R8 retro confirmed it (`retro.md:38`). R8 decision listed it as the only follow-up (`decision.md` self-check §).

- **Backlog-freshness gate (R3+R8 retro)**: PM MUST surface ≥1 fresh user-story via self-investigation OR justify why #4 alone is sufficient. **PM self-investigation surfaced 2 fresh candidates** — Candidate #2 "Edit a finding after creation" (PM's own discovery reading the code, not on any R5/R6/R7/R8 list) and Candidate #3 "Export state.json for debugging" (debug-aid gap visible from the API surface: only `/api/review/${id}/prior-notes` is a GET; no GET exists for the raw current state). See Candidates #2 and #3 below with file:line evidence.

- **R8 audit-trail code-commit verification**: ALL 7 R8 SHAs verified OK via `git cat-file -e` — 415ee96 ✓ 3a6a636 ✓ 53fd00f ✓ e701214 ✓ 2fef2f7 ✓ ebbc7c0 ✓ ca22741 ✓. R8 audit-trail is grounded.

- **`#4` gap verified on current main `ca22741`** (re-verified now, post-closure):
  - **UI hides the Reopen button**: `src/ui/app.ts:1850` — `} else if (isResolved && !isStale) {` — the `&& !isStale` clause intentionally excludes stale (`status === "closed_auto"`) findings; only the always-present Jump button renders. Reads at `app.ts:1712-1859` (`renderConversationPanel`) confirm 3 branches (`isFresh→Remove`, `isOpen→Resolve`, `isResolved && !isStale→Reopen`); the 4th case (stale) has NO branch.
  - **Server rejects the reopen**: `src/index.ts:1796` — `if (target.status !== "resolved") { return new Response(JSON.stringify({ error: \`cannot reopen (status: ${target.status})\` }), { status: 400, ... }); }` — even with the UI fixed, the server guard returns 400 for any `status === "closed_auto"` finding. Gap is **two-part**: client hides AND server rejects.
  - **Actual reopen transition already exists**: `src/index.ts:1845-1847` — `target.status = "open"; target.closed_at = undefined;` — the recovery transition is in place; only the guard at line 1796 needs widening. (Anchor re-validation at `index.ts:1805-1844` remains.)
  - **`manually_reopened` flag does NOT exist** — confirmed via repo-wide grep. The `Finding` type at `src/index.ts:28-46` has `status: "open" | "closed_auto" | "resolved"`, `close_reason?: "file_removed" | "anchor_missing"`, but no `manually_reopened` field. The client `ConversationEntry` at `src/ui/app.ts:1680` has the same shape (no flag). `reopenFinding(id)` at `app.ts:2356` POSTs only `{ finding_id: id }` — no manual-override payload. So the flag is genuinely missing; #4 is **not partially shipped**.
  - **Agent prompt surface to update**: `src/index.ts:1422-1486` (inside the `config` callback for the slash-command template). The current `### Workflow Execution Rules` "Read Conversation History" step at `index.ts:1452-1459` already instructs the agent to read `state.json` for cross-round context — this is the right place to add a 1-paragraph note that `manually_reopened: true` findings MUST be re-applied (don't re-auto-close them based on anchor drift).

- **`#2 Edit finding` gap verified on current main `ca22741`** (PM's own discovery from reading `src/`):
  - **No edit endpoint exists**: `grep -n 'editFinding\|updateFinding\|patchFinding' src/index.ts src/ui/app.ts` → **only `updateFindingCount()` at `app.ts:809`** (UI counter, unrelated). No PUT/PATCH endpoint exists for any finding in `src/index.ts` route table (`grep -nE 'PUT|PATCH|POST|GET' src/index.ts` shows endpoints for `/review/${id}` (GET), `/api/review/${id}` (GET), `/api/review/${id}/prior-notes` (GET), `/api/review/${id}/draft` (PUT, only draft fields), `/api/review/${id}/resolve` (POST), `/api/review/${id}/reopen` (POST), `/api/review/${id}/comment` (POST), `/api/review/${id}/submit` (POST) — NO endpoint accepts a category/severity/comment mutation on an existing finding).
  - **Client has no edit button**: `src/ui/review.html` has no edit affordance anywhere. `renderConversationPanel` (`app.ts:1781-1859`) shows only `Remove | Resolve | Reopen | Jump` per item. The comments sub-system (`addComment` at `app.ts:2379`) is the only way to add prose, and it just appends a comment, doesn't edit the existing one.
  - **This is a real pain**: typo'd comment or wrong severity category is unfixable without Remove + re-add, which loses the round attribution and the finding id used by the agent.

- **`#3 Export state.json for debugging` gap verified on current main `ca22741`** (debug-aid from API surface scan):
  - **No GET for the raw state**: the only GET endpoints under `/api/review/${id}` are `/api/review/${id}` (returns the structured `data` payload with files + findings + diff_base — already filtered for the UI's needs, not the raw state file) and `/api/review/${id}/prior-notes` (returns historical-round notes+findings only). The `state.json` itself (the canonical source-of-truth that the agent reads via `index.ts:1453`) is not exposed.
  - **No UI affordance**: `src/ui/review.html` has zero "Export" / "Download state" / "Debug" buttons. There's a submit button (`#submit-review` near line ~570 per `submit` handler at `app.ts:2681`), but no debug-side export.
  - **Pain shape**: when a reviewer sees unexpected behavior (a stale finding that shouldn't be stale, a missing comment, a wrong round attribution), they have to manually `cat .opencode/reviews/<session>/state.json` in the terminal — but the session file path is hidden inside the plugin's working directory, not printed anywhere. A "Download state.json" button next to the Submit button would be the standard debug affordance.

- **R8 closure status**: R8 decided SHIP (`decision.md:28-39`) — all R8 SHAs verified, 84/84 unit tests pass, 19 e2e scenarios, 0 console errors after TDZ fix (`53fd00f`), 1 critical bug caught + fixed by lead Playwright walkthrough (validating R7 retro's Gap I + Patch H patches).

- **All R7 followups SHIPPED + #7/#8/#9 closed retroactively** (per R7 retro Gap K + commit `5babc0b`). Backlog is genuinely empty of bugfixes; only feature/architecture candidates remain.

## User pain (1-3 sentences, user terms)

When you run `/diff-review-dashboard` on a real PR with 3+ rounds, you accumulate 20-40 findings — and the dashboard gives you **three knobs you can't actually use**: (a) you can't re-open a stale (`closed_auto`) finding to tell the agent "this is still wrong, please fix it again" — the Reopen button silently disappears and the server returns a 400 if you wire it up yourself; (b) you can't fix a typo'd comment or wrong severity on a finding you already created — you have to Remove and re-add, which loses the round attribution and the comment thread the agent has been replying to; (c) when something looks wrong, you have no way to download the live `state.json` without SSH'ing into the plugin's working dir to grep it. Round 9 gives you all three: a Reopen-with-override path that persists a `manually_reopened` flag so the agent doesn't re-auto-close it, an Edit button on every finding, and a "Download state.json" button next to Submit.

## Candidates ranked

### Candidate #1 — Manually re-open stale (`closed_auto`) findings [R8 carry-over, recommended]

> **As a** reviewer whose finding was auto-closed as stale because the anchored code changed between rounds (e.g. you bumped `--base`, or the agent's prior fix rewrote the snippet),
> **I want** a "Reopen" button on stale findings in the Conversation panel, plus a server endpoint that allows `closed_auto → open` transition with an explicit `manually_reopened: true` override, **and** the agent prompt to honor that flag so the agent doesn't immediately re-auto-close it,
> **So that** I can resurrect a finding I still care about without manually re-creating it as a brand-new finding (which loses the comment thread and round attribution).

- **User value**: 4/5 — restores reviewer agency over the auto-close mechanic. Especially acute in cross-round drift scenarios (you bumped `--base`, several findings went stale, and you want to keep half of them open because you still believe they apply). The user only ever needs this when an auto-close was wrong, but when they need it, they really need it — the only workaround today is Remove + re-add, which loses the thread.

- **File:line evidence (re-verified on `ca22741`)**:
  - UI hides button: `src/ui/app.ts:1850` `} else if (isResolved && !isStale) {` — the `&& !isStale` clause intentionally excludes stale (`status === "closed_auto"`) findings
  - UI renders 3 action branches, no 4th: `src/ui/app.ts:1828-1859` (fresh → Remove, open → Resolve, resolved+!stale → Reopen; isStale has none)
  - Server rejects reopen: `src/index.ts:1796` `if (target.status !== "resolved")` returns 400 `cannot reopen (status: closed_auto)`
  - Server recovery transition already exists: `src/index.ts:1845-1847` `target.status = "open"; target.closed_at = undefined;` (only the guard needs widening)
  - Server anchor re-validation already exists: `src/index.ts:1805-1844` (file still in diff + (for line-kind) snippet still matches)
  - Client function: `src/ui/app.ts:2356` `async function reopenFinding(id: string)` — POST `/api/review/${id}/reopen` with `{ finding_id: id }`, swallows the real 400 error into a generic `Cannot reopen (code may have changed)` at `app.ts:2365`
  - `manually_reopened` flag absent: `grep -n 'manually_reopened' src/ .` → **No matches found** (full-repo, including tests). `Finding` type at `src/index.ts:28-46` has no such field
  - Agent prompt surface: `src/index.ts:1422-1486` (the slash-command template). Already has `### Workflow Execution Rules: 0. Read Conversation History` at `index.ts:1452-1459` which instructs reading `state.json` and parsing the `findings[]` array — natural injection point for a 1-paragraph honor-the-flag directive

- **What's missing for the user**:
  - **UI button on stale findings**: add a 4th action branch to `renderConversationPanel` (`app.ts:1828-1859`) for `isStale` items — a "Reopen" button that POSTs `{ finding_id: id, manually_reopened: true }` (new field)
  - **`manually_reopened: boolean` field on the Finding type** (`src/index.ts:28-46` and the parallel `ConversationEntry` at `app.ts:1680`); default false; preserved across rounds; visible in the payload the agent reads
  - **Server guard widening** (`src/index.ts:1796`): allow reopen when `target.status === "resolved"` (existing path) OR `(target.status === "closed_auto" && input.manually_reopened === true)` (new path). Validate anchor same way either path.
  - **Patch the existing reopen transition** (`src/index.ts:1845-1847`) to also set `target.manually_reopened = true` and `target.close_reason = undefined` so the visual badge (currently `stale` per `app.ts:1815`) flips to `open` and stays open across the next round's auto-close pass
  - **Agent prompt update** (`src/index.ts:1422-1486`, inside `### Workflow Execution Rules` near `0. Read Conversation History`): add 1 paragraph directing the model — "if a finding has `manually_reopened: true`, treat it as the user explicitly re-raising the finding. Do not auto-close it based on the same anchor drift that originally closed it. Apply a fix if actionable; otherwise, add_review_comment explaining why you can't."
  - **Submit-payload**: include `manually_reopened` in `data.existing_findings` mirror (`index.ts:1850-1855`) so the agent sees the flag in its structured output

- **LOC**: ~80-150 across 3 files (`src/ui/app.ts` + `src/index.ts`; agent prompt lives in same `src/index.ts` file — no separate `src/agent-prompt.ts` exists)
  - Server: ~30 LOC (1 new input field, 1 guard widening, 1 flag-set, 1 mirror-write)
  - Client UI: ~30 LOC (4th action branch, button click handler, payload field)
  - Types: ~10 LOC (1 type-field on `Finding`, 1 on `ConversationEntry`)
  - Agent prompt: ~10 LOC (1 paragraph injected into existing section)
  - Tests: ~30-50 LOC (4 unit tests + 1 e2e)
  - Total **~80-130 LOC + ~30-50 LOC tests = 110-180 LOC bundle**, fits "medium feature" sweet spot

- **Test plan**:
  - **Unit: server guard** — (a) reopen resolved still works (regression); (b) reopen stale without `manually_reopened: true` → still 400 (regression for accidental relaxation); (c) reopen stale WITH `manually_reopened: true` → 200, status flips to `open`, `manually_reopened: true` persists; (d) reopen stale with anchor drift → 409 (anchor check still applies even on manual override — security guarantee)
  - **Unit: type-shape** — `Finding.manually_reopened` is optional, defaults to `undefined` on existing records (backward-compatible)
  - **E2E**: stale finding rendered in Conversation panel after round-N+1 → click "Reopen" → submit round → agent reads `state.json` → finding persists open into round-N+2 (not re-auto-closed)

- **Risk**: TOUCHES THE AGENT PROMPT. The agent's mental model of `stale = unfixable, ignore on re-render` is changing. Mitigation: additive change (flag is opt-in, default behavior unchanged), explicit "honor the flag" directive added, anchor check still runs so a stale finding whose file was deleted still rejects. **MEDIUM risk** → architecture profile triggered.

- **Out of scope for R9** (explicit non-goals, called out for the next round):
  - No "bulk reopen" (multi-select) — that's a separate feature, candidate for R10
  - No "auto-reopen on resubmit if user added notes mentioning the finding id" — would need server-side fuzzy matching, not in scope

### Candidate #2 — Edit a finding's category / severity / comment in-place [PM's own discovery]

> **As a** reviewer who created a finding 3 rounds ago and noticed I picked `low severity` when it's actually `high`, or had a typo in the comment,
> **I want** an "Edit" button on every finding in the Conversation panel that re-opens the drawer with the current category / severity / comment pre-filled and a separate `PATCH /api/review/${id}/finding` endpoint that updates only those fields,
> **So that** I can fix findings I got wrong without removing + re-adding (which loses round attribution, comment thread, and the `manually_reopened` flag from Candidate #1).

- **User value**: 4/5 — same-domain pain as #4 (reviewer agency), same theme (correcting things after they were recorded). Real pain across all multi-round reviewers — every reviewer has at least 1 typo or severity miss out of every 20-40 findings; the only workaround is Remove + re-add which loses the comment thread the agent has been replying to.

- **File:line evidence (re-verified on `ca22741`)**:
  - **No edit endpoint**: `grep -nE '(PUT|PATCH|POST).*finding' src/index.ts` shows only `/api/review/${id}/resolve`, `/api/review/${id}/reopen`, `/api/review/${id}/comment`, `/api/review/${id}/submit`, `/api/review/${id}/draft` — NONE accept `category` / `severity` / `comment` mutations on an existing finding
  - **No edit button in UI**: `src/ui/review.html` has zero "Edit" affordance. `renderConversationPanel` (`app.ts:1781-1859`) renders only `Remove | Resolve | Reopen | Jump` per item
  - **`Finding` type immutable post-creation**: `src/index.ts:28-46` — fields like `category`, `severity`, `comment` are written once on creation (via the draft → submit path at `index.ts:1913+`) and never mutated again
  - **Workaround exists but loses data**: `Remove` at `app.ts:1832-1839` filters `state.fresh` (doesn't even touch existing findings), then `Reopen` (Candidate #1) or manual agent-reapply is needed to bring the finding back — and round attribution is bumped, comment thread is lost

- **What's missing for the user**:
  - **`PATCH /api/review/${id}/finding` endpoint** — accepts `{ finding_id, category?, severity?, comment? }`, validates category∈{bug,style,perf,question,recommend} and severity∈{high,medium,low} and `comment.length ≤ 2000`, updates the finding, mirrors to `data.existing_findings`, appends a system comment (`Finding edited by user: severity low→high`) to preserve history
  - **Edit button on each item** in Conversation + Previously discussed panels — opens the drawer pre-filled with current values, the "Save" button updates instead of adds
  - **`submit` payload** mirrors the edited values so the agent sees the current state

- **LOC**: ~150-250 across 3 files
  - Server: ~50-80 LOC (PATCH endpoint + validation + system-comment + mirror)
  - Client UI: ~80-120 LOC (Edit button + drawer prefill logic + Save handler + comment thread update)
  - Type mutations + tests: ~30-50 LOC (3 unit tests, 1 e2e)
  - Total **~150-250 LOC + ~30-50 LOC tests = 180-300 LOC bundle**, **borderline-medium feature**

- **Test plan**:
  - **Unit: validation** — invalid category → 400, invalid severity → 400, empty body → 204, partial update (only severity) only mutates that field, comment > 2000 → 400
  - **Unit: idempotency** — same PATCH twice → same result, no double comment thread
  - **E2E**: open round-N finding → Edit → change severity high→low → submit → next round renders with new severity

- **Risk**: TOUCHES THE AGENT PROMPT (same as #1) — agent receives edits in its structured payload via `findings[]`, so its instruction "honor the prior decision reflected in findings[].severity + findings[].comment" needs the same `state.json` read-it-yourself pattern. Same architecture profile as #1. MEDIUM risk.

- **Bonus combo value with #1**: the two candidates share review lens (server-contract + agent-prompt + UI conversation-panel). Shipping them as a single "reviewer-agency-over-findings" bundle means one review cycle, one agent-prompt patch, one set of UI changes to `renderConversationPanel`. **Thematic coherence**.

### Candidate #3 — Export state.json for debugging [debug-aid candidate from instructions]

> **As a** reviewer (or maintainer helping debug a user-reported issue),
> **I want** a "Download state.json" button next to the Submit button that fetches the raw `state.json` from the server and downloads it as `state-<round>-<session>.json`,
> **So that** I can attach it to a bug report / share it with a teammate / diff it against prior rounds without SSH'ing into the plugin's working directory.

- **User value**: 2/5 (low-volume, niche) — only matters during bug investigation, but it eliminates a category of "wait, where does the file live?" confusion. Niche but cheap (~30-60 LOC).

- **File:line evidence**:
  - **No GET for raw state**: only `/api/review/${id}` (returns the UI-shaped `data` payload, filtered) and `/api/review/${id}/prior-notes` (returns historical-round notes+findings only) exist; the underlying `state.json` file the agent reads is not exposed
  - **No download UI**: `src/ui/review.html` has zero export/download buttons. Submit button at `index.ts:1913+` is the only POST that produces a downloadable artifact (the round-NNN.md)

- **What's missing for the user**:
  - **GET endpoint** `/api/review/${id}/state.json` returning the parsed JSON with `Content-Disposition: attachment; filename="state-<round>-<session>.json"`
  - **Small client button** next to Submit that downloads via the existing `endpoint()` helper

- **LOC**: ~30-60 total (1 endpoint + 1 button + 1 fetch + 1 download trigger)
- **Risk**: LOW — read-only, no schema change, no agent-prompt surface. Touches server + tiny UI piece.

- **Theme mismatch with #1**: this is a debug aid; #1 is a reviewer-agency feature. They're different review lenses and different reviewer personas (debug-maintainer vs. daily-reviewer). Don't bundle. **Better as a standalone micro-feature or its own round**, not a Bucket B candidate.

## Scope buckets

### Bucket A — Candidate #1 alone (R8 carry-over) [RECOMMENDED]

- **Contains**: Candidate #1 (manually-reopen stale findings)
- **Combined user value**: 4/5
- **Files touched**: 2 (`src/ui/app.ts` + `src/index.ts`; agent prompt is in same `src/index.ts` file)
- **Combined LOC**: ~110-180 (prod) + ~30-50 (tests)
- **Why recommended**:
  - Single coherent story — "re-open my stale findings with explicit override"
  - R8 PM Manager explicitly assigned this as the R9 headline (`pm-manager-review.md` ## Action items #3)
  - Different review lens from R8 (server-contract + agent-prompt, not a11y) → fresh perspective in the next round's review
  - Doesn't preempt or overlap with #2 (different feature, could be R10 if R9 unlocks the conversation-panel surface for review)
- **Bundle risk**: minimal — single-candidate, similar R3-R7 LOC range, profile=architecture requires full 7-role loop (PM, PM Manager, Architect, Dev, Tester, PM Doc Writer, Decision) which is already the standard cadence
- **Profile**: **architecture** (Rule 1: `U_behavior_shift=yes` — server now allows a previously-rejected transition, agent now reads a new flag and behaves differently on it)

### Bucket B — Candidate #1 + Candidate #2 (reviewer-agency-over-findings bundle)

- **Contains**: #1 (reopen stale) + #2 (edit in-place)
- **Combined user value**: 4.5/5 (both are agency-restoration features, both touch Conversation panel, both touch agent prompt)
- **Files touched**: 3 (`src/ui/app.ts` + `src/index.ts` + `src/ui/review.html` for the edit-drawer prefill CSS)
- **Combined LOC**: ~290-480 (prod) + ~60-100 (tests) — borderline-large for an architecture round
- **Why this could work**: thematic coherence — both are "after you created a finding, give the reviewer powers they didn't have at creation time". Both touch the `renderConversationPanel` surface. Both touch the agent prompt (same paragraph shape — "honor user corrections of findings"). **One review cycle covers both** (single agent-prompt patch, single UI surface, single server endpoint pattern).
- **Why it might be too big**: 290-480 LOC is at the upper end of "medium feature" — R6/R7 polish rounds were ~140-300 LOC. Pushes the test surface to 60-100 LOC across 6+ unit tests + 2 e2e scenarios, which is closer to "R4 MINOR" scope.
- **Risk**: medium-large bundle in 1 round if either sub-candidate hits friction → both might drop in `bucket-half-shipped` failure mode. R6 had the only clean 3-of-3 bundle; R7 was 2-of-2. Risk is non-trivial for a 2-of-2 architecture round this size.
- **Profile**: still **architecture** (Rule 1 fires for both — both `U_behavior_shift=yes`).

### Bucket C — Candidate #1 + Candidate #3 (separate, do not bundle)

- **Contains**: #1 + #3
- **Why this DOESN'T work**: theme mismatch. #1 is reviewer-agency (daily reviewer pain), #3 is debug-aid (maintainer pain, fire-once-per-bug). Different review lenses, different reviewer personas, different test surfaces. Listing only to explicitly reject.

### Recommendation

**Bucket A** — Candidate #1 alone.
- Honors R8 PM Manager's explicit R9 headline call (`pm-manager-review.md:110`).
- Honors backlog-freshness gate **WITH** Candidate #2 surfaced for R10 backlog (PM's own discovery, R9-not-preempting, just ranked + filed).
- Profile = architecture, single coherent story, fresh review lens, ~110-180 LOC + tests fits "medium feature" sweet spot.
- If R9 user wants more: Bucket B is the fallback, but bundle risk is higher.

## Self-Critique

- **Clarity**: 4/5 — every candidate has concrete `file:line` citations on current main `ca22741`, a one-sentence user story, and a LOC estimate. The "manually_reopened doesn't already exist" was verified by full-repo grep, not assumed.

- **Hidden ambiguities** (PM asked themselves the hard questions):
  - **Q: Should the manually-reopened flag be visible in the UI (badge: "user-reopened") or just internal (DB only)?** Decision: **internal + visible**. A small badge so the user remembers "I reopened this, the agent will fix it again" — keeps them oriented. Implementation: badge near the `stale` badge position per `app.ts:1812-1816`.
  - **Q: What happens if the agent re-applies a fix that regresses the anchor, and the next round auto-closes the manually-reopened finding again?** Decision: **agent prompt explicitly says don't auto-close `manually_reopened: true` findings, but anchor drift CAN re-close them in a follow-up round if the user's later code change genuinely removes the snippet**. Mitigation: the user can re-Reopen with the same flag (idempotent). This is acceptable behavior — it matches "user override can be re-overridden by a larger context shift".
  - **Q: Should Candidate #2's edit-button be on the same row as Resolve / Reopen or in a dropdown menu?** Decision: **same row** for discoverability (R8 retro Gap K forced all features to be obviously visible — no hidden menu). UI typography cap prevents overflow: at 4 buttons per item, it's already at the borderline (Conversation panel action bar). May need responsive CSS `@container (max-width: 600px) { ... }` to wrap on narrow sidebars.
  - **Q: Does Candidate #2 break the comment-thread invariant (Finding.comments[] is append-only)?** Decision: **append-only at server side**. The Edit operation appends a system comment "Edited: severity high→low, comment changed from X to Y" rather than mutating history. Renders in the thread as a `system` author. The thread is preserved; the canonical finding.commen[]t field is updated in-place.
  - **Q: Does R9 R9-self-investigation touch only #2, or could it have surfaced something deeper?** Decision: PM read `src/index.ts` (2131 lines — endpoints, prompts, types), `src/ui/app.ts` (2859 lines), `src/ui/review.html` (1918 lines), 2 READMEs, 6 test files, R8 brief + pm-manager-review + retro + decision. The Edit gap surfaced from `grep` for missing endpoints; Export state.json surfaced from reading API surface; #4 was already known from R8. No other obvious gaps surfaced that pass the "real evidence + non-trivial user pain" bar. R6-R7 a11y/UX cleanup makes the UI surface mostly polished.

- **Risks**:
  - **Candidate #1 agent-prompt patch**: if the new paragraph is wrong or the agent misinterprets `manually_reopened`, the agent might re-auto-close anyway. Mitigation: architect designs the prompt paragraph and adds an inline test ("if the JSON payload contains any finding with `manually_reopened: true`, that finding's `anchor drift` is honored as `expected`, not `drift`"); tester verifies in Playwright walkthrough via a finding that goes through reopen → submit → next round's auto-close pass.
  - **Candidate #1 schema backward-compat**: existing `state.json` files (from R1-R8 users) lack the `manually_reopened` field. Default to `undefined` (falsy) on read; new writes include it as `false`. No migration needed.
  - **Bucket B size**: see bucket analysis above. Bundling #1 + #2 means if either hits a mid-round snag, the other is at risk of being dropped — R8's "1-of-2 ships" pattern accepts this, R6/R7's full-bundle success rate is encouraging but not guaranteed.

- **Tests**:
  - **Bucket A unit (4)**: server guard regression (resolved-still-works, stale-without-flag-still-400, stale-with-flag-200, anchor-still-409-even-with-flag); type-shape backward-compat; reopen-button-renders-on-stale (DOM test); reopen-button-absent-on-resolved (regression)
  - **Bucket A unit (1 type)**: `manually_reopened` defaults to `undefined` on missing — backward-compat with R1-R8 state.json files
  - **Bucket A e2e (1)**: stale finding in Conversation panel → click Reopen → submit → next round: finding persists open (no re-auto-close)
  - **Bucket B adds**: edit-validation × 3, edit-idempotency × 1, edit-system-comment × 1, edit-drawer-prefill × 1, edit-e2e × 1 (total +6 unit + 1 e2e)
  - All tests should land with their feature per R5's "regression coverage in same round" pattern

## User-impact profile

```yaml
user_impact_profile_bucket_a:
  pm_source: "agent-suggested (R8 carry-over #4 reopen + backlog-freshness gate)"
  U_size: small           # Bucket A: 1 feature, ~110-180 LOC + 30-50 tests
  U_files: narrow         # Bucket A: 2 files (src/ui/app.ts + src/index.ts; agent prompt is in src/index.ts)
  U_new_capability: yes   # manually-reopen previously-rejected button
  U_behavior_shift: yes   # server now allows a previously-rejected transition when flag is set
  U_user_visible: yes     # Reopen button appears on stale findings
  U_data_shape_breaking: no    # additive flag on Finding type, defaults undefined for old state.json
  U_data_safety: yes      # atomic writes via existing saveState path; no new failure modes
  U_installs_new_dep: no
  recommended_profile_override: architecture

user_impact_profile_bucket_b_incremental_vs_bucket_a:
  delta_files: 1          # src/ui/review.html (for edit-drawer prefill CSS)
  delta_loc: ~150-300     # Candidate #2 alone
  delta_ux_risk: medium   # edit button on every finding row + new drawer prefill flow + system-comment thread

# Critical rule: Rule 1 (architecture) fires for BOTH Bucket A and Bucket B
# because U_behavior_shift=yes for both #1 (server widens guard) and #2 (server
# accepts category/severity/comment mutation). User-visible yes for both.
# Profile = architecture either way.

# Profile NOT changed by adding Candidate #2 to Bucket A → still architecture.
# Profile NOT changed by adding Candidate #3 to Bucket A → still architecture.
```

## Profile recommendation

PM's intuition: **architecture** (Rule 1: `U_behavior_shift=yes` for the force-reopen behavior — server guard `index.ts:1796` widens from `=== "resolved"` to `[ "resolved", "closed_auto" ].includes(...) when manually_reopened === true`, AND agent prompt `index.ts:1422-1486` gets a new paragraph directing the model to honor `manually_reopened: true` findings). Lead validates: Rule 1 fires cleanly for Bucket A. For Bucket B, Rule 1 still fires (same shift for the edit-mutation). Rule 2 (feature) does NOT fire because `U_behavior_shift=yes` is an architecture trigger, and even where Rule 2 would also fire (U_user_visible=yes AND total ≥ 3), Rule 1 takes precedence.

For Bucket A: total positive fields = 5 (small + narrow + new_capability + behavior_shift + user_visible + data_safety = 6 — `data_shape_breaking` is no). Rule 1 applies → **architecture**. No override needed.

For Bucket B: same as Bucket A plus +1 from Candidate #2 (U_size stays small because 2 sub-features each touch small surfaces; U_files becomes small instead of narrow — 3 files instead of 2 → +1 in profile score but doesn't flip field). Rule 1 still fires → **architecture**.

For both buckets: 7-role loop runs in full (PM → PM Manager → Architect → Dev → Tester → PM Doc Writer → Decision), 5 parallel review-work lenses per Tester (Goal / QA / Code / Security / Context) — same cadence as R6/R7/R8 architecture-class rounds.
