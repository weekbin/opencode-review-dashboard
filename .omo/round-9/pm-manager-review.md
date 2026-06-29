# Round 9 PM Manager Review

> **Date**: 2026-06-29
> **Reviewer**: Round 9 PM Manager
> **Verdict**: APPROVE
> **Pre-check result**: PASS (reused from PM Triage brief.md ## Source — Patch G optimization honored)

## Pre-check (code-commit verification)

PM Triage's pre-check writeup at `brief.md:19` was independently re-confirmed by this reviewer before trusting it: ran `git cat-file -e` against all 7 R8 SHAs in `brief.md:19` — **all 7 present** (415ee96 ✓ 3a6a636 ✓ 53fd00f ✓ e701214 ✓ 2fef2f7 ✓ ebbc7c0 ✓ ca22741 ✓). Reuse is sound; no re-run needed. R8 audit trail is grounded on `ca22741` (current main).

## Sub-candidate evaluation

### #1 — Reopen stale findings (R8 carry-over)

- **Real user pain**: When a finding's anchored code drifts between rounds (e.g. user bumped `--base` or the agent rewrote the snippet during auto-apply), the dashboard auto-closes the finding as `closed_auto` (`Finding.status` type union at `src/index.ts:38`) and **strips the only way to resurrect it**: UI hides the Reopen button via `&& !isStale` at `src/ui/app.ts:1850`, AND the server returns 400 on any reopen attempt via guard at `src/index.ts:1796`. Workaround today = Remove + re-add, which loses the comment thread and round attribution.
- **Pseudo-requirement markers**: **None.** No DUPLICATE (verified — see below). No SPECULATION (rooted in `brief.md:21-26` + R8 PM Manager's R9-headline callout at `pm-manager-review.md:110`). No CONTRADICTION (R8 SHIP status matches R8 retro + decision). No INFLATED (single tight 80-130 LOC bundle + 30-50 LOC tests per brief's LOC estimate at `brief.md:74-80`). No OBSCURE (targets the daily multi-round reviewer persona that is the only kind who hits this). No AUDIT_TRAIL_FABRICATED (R8 SHAs verified).
- **Already-shipped verification**:
  - `grep -rn 'manually_reopened' .` → **zero matches** across repo, including tests. The `Finding` type at `src/index.ts:28-46` lacks the field; `ConversationEntry` at `src/ui/app.ts:1680` lacks the field; `reopenFinding(id)` at `app.ts:2356` POSTs only `{ finding_id: id }` without the override payload. **Flag is genuinely absent.**
  - Server guard at `src/index.ts:1796` confirmed verbatim: `if (target.status !== "resolved")` returns 400. Recovery transition at `src/index.ts:1845-1847` confirmed: `target.status = "open"; target.closed_at = undefined;` — only the guard at line 1796 needs widening (anchor validation block at lines 1805-1844 already shared with the resolved-path and reusable as-is).
  - UI panel branches at `src/ui/app.ts:1828-1859` confirmed: 3 branches (isFresh → Remove at 1828, isOpen → Resolve at 1841, isResolved && !isStale → Reopen at 1850). The 4th case (isStale=true) has no branch — Jump button at line 1861 is always appended regardless. **4th branch is genuinely missing.**
- **Verdict**: **APPROVE**

### #2 — Edit a finding in-place (PM's own discovery)

- **Real user pain**: A typo'd comment or wrong severity on a finding you created 3 rounds ago is **unfixable** without Remove + re-add. The only existing POST endpoint that touches an existing finding is `/comment` (append-only comment thread, at `src/index.ts:1861`), and `/reopen` (status flip, at `src/index.ts:1780`) — neither mutates the canonical `Finding.category` / `severity` / `comment` fields. PM's self-critique at `brief.md:99-100` is correct: every reviewer who hits 20+ findings accumulates ≥1 typo'd or severity-missed item; today the only fix loses round attribution + comment thread + (post-#1) `manually_reopened` flag.
- **Pseudo-requirement markers**: **None.** No DUPLICATE (verified — see below). No SPECULATION (PM is the user; this is a self-discovered gap from reading `src/index.ts` + `src/ui/app.ts`). No INFLATED (~150-250 LOC single feature, sits in the medium-feature range already shipped in R6/R7). No OBSCURE (every multi-round reviewer hits this).
- **Already-shipped verification**:
  - `grep -nE '(PUT|PATCH|POST).*finding' src/index.ts` → **no matches**. Full HTTP route table at `src/index.ts:1665-1913` exhaustively: GET `/assets/`, GET `/review/{id}`, GET `/api/review/{id}`, GET `/api/review/{id}/prior-notes`, PUT `/api/review/{id}/draft` (draft fields only — NOT finding fields), POST `/api/review/{id}/resolve`, POST `/api/review/{id}/reopen`, POST `/api/review/{id}/comment`, POST `/api/review/{id}/submit`. **No PUT/PATCH endpoint accepts `category`/`severity`/`comment` mutations on an existing finding.**
  - `grep -n 'editFinding\|updateFinding\|patchFinding' src/` → only 2 matches, both in `src/ui/app.ts`: `updateFindingCount()` at line 809 (UI counter for the "Review" toggle badge — unrelated to editing fields) and the `updateFindingCount()` call at line 2442 (its call site). **No edit-by-field mutation function exists.**
  - `grep -in 'edit' src/ui/*.html` → **zero matches** in `review.html` or any other UI HTML. The `Resolve|Reopen|Remove|Jump` button set is JS-rendered inside `renderConversationPanel` (`src/ui/app.ts:1820-1859`) — none of those button text strings appear in the HTML (confirmed: HTML contains only a `Resolved` CSS class at line 1853 unrelated to a button).
- **Verdict**: **APPROVE**

### #3 — Export state.json for debugging

- **Real user pain**: When a reviewer sees unexpected behavior (a stale finding that shouldn't be stale, missing comment, wrong round attribution), they have to manually `cat .opencode/reviews/<session>/state.json` in the terminal — but the session file path is hidden inside the plugin's working directory and not surfaced anywhere in the UI. There is no debug affordance in the dashboard today; only structured-payload GET endpoints.
- **Pseudo-requirement markers**: **None.** No DUPLICATE (verified — see below). No SPECULATION (debug-maintainer persona is real per R7 retro + R8 retro — every round generates "what does state.json say?" questions in reviewer-channel). No INFLATED (~30-60 LOC micro-feature, smaller than a single bugfix). No OBSCURE (this is a debug aid, not a daily-driver feature — but cheap enough to warrant shipping).
- **Already-shipped verification**:
  - Route table at `src/index.ts:1665-1913` confirmed: **no GET endpoint serves the raw `state.json`**. `/api/review/{id}` (line 1702) returns the UI-shaped `data` payload (files + findings + diff_base) — already filtered. `/api/review/{id}/prior-notes` (line 1708) returns only historical-round notes+findings. The `state.json` file itself, which the agent reads at `src/index.ts:1453-1459` via the `### Workflow Execution Rules: 0. Read Conversation History` step, is **not exposed via any HTTP endpoint**.
  - `grep -in 'Download\|Export\|export' src/ui/*.html` → **zero matches**. The only submit button (`#submit-review`) lives in the page header per `src/index.ts:1913` handler — there is no debug-side export button.
- **Verdict**: **APPROVE** — but explicitly **NOT recommended for R9 bundle**. Theme mismatch with #1 (debug-maintainer vs daily-reviewer), different review lens, different test surface. Brief's `brief.md:146` correctly identifies this as "better as a standalone micro-feature or its own round."

## Bucket coherence

- **Bucket A (#1 alone)**: **NATURAL.** Single coherent story — "re-open my stale findings with explicit override." All work lives on one server endpoint (`/reopen`) + one agent-prompt paragraph + one UI 4th branch. Self-contained.
- **Bucket B (#1 + #2)**: **NATURAL but tight.** Both candidates share the review-lens surface (server-contract + agent-prompt + `renderConversationPanel`). Both are reviewer-agency features. Both touch `Finding`-type mutations. Both are read-then-mutate patterns. The 4 buttons-per-finding-row UI cap (`Remove | Resolve | Reopen | Edit` + Jump) is at the borderline — brief flags the `@container (max-width: 600px) { ... }` CSS risk at `brief.md:195`, which is a real concern. Bundle is ~290-480 LOC prod + 60-100 LOC tests, which is borderline-large but not unprecedented (R6 hit ~300 LOC polish, R7 hit ~140 LOC polish — neither was architecture-bundle, but neither hit the bucket-half-shipped failure mode either). **Verdict: bundle-coherent if Architect keeps LOC tight and the two candidates' agent-prompt paragraphs are merged into a single "honor user corrections" section rather than two separate paragraphs** — that single-paragraph merge is the load-bearing structural choice.
- **Bucket C (#1 + #3)**: **WRONG.** Theme mismatch — #1 is daily-reviewer feature, #3 is debug-maintainer aid. Different review lenses, different test surfaces. Brief's rejection at `brief.md:175-178` is correct.

## Profile validation

Per `docs/team-dev-loop.md:323-336` (the v3 PM↔lead signal conversion table):

**Bucket A — #1 alone:**
- U_size: small (1 feature, ~110-180 LOC) → 1
- U_files: narrow (2 files: `src/ui/app.ts` + `src/index.ts`) → 1
- U_new_capability: yes (manually-reopen previously-rejected transition) → 2
- U_behavior_shift: yes (server guard widens, agent gets new directive) → 3
- U_user_visible: yes (Reopen button appears on stale findings) → 2
- U_data_shape_breaking: no (additive field, defaults undefined for old state.json) → 0
- U_data_safety: yes (atomic writes via existing saveState path) → 1
- U_installs_new_dep: no → 0
- **Total = 10. Rule 1 (architecture) fires on `U_behavior_shift=yes`. → architecture. Confirmed.**

**Bucket B — #1 + #2:**
- U_size: small (2 features, each small) → 1 (per `brief.md:246`)
- U_files: small (3 files: `app.ts` + `index.ts` + `review.html` for edit-drawer CSS) → 2
- U_new_capability: yes → 2
- U_behavior_shift: yes (both shift behavior) → 3
- U_user_visible: yes → 2
- U_data_shape_breaking: no → 0
- U_data_safety: yes → 1
- U_installs_new_dep: no → 0
- **Total = 11. Rule 1 fires on `U_behavior_shift=yes`. → architecture. Confirmed.**

**R8 carry-over rationale re-verified** (per `brief.md:6`):
- Different review lens from R8 (server-contract + agent-prompt, NOT a11y) ✓ — verified, agent prompt at `src/index.ts:1422-1486` is a different surface from R8's accessibility work.
- Feature-shaped, not patch-shaped ✓ — needs new flag + server widening + agent-prompt update.
- Real user need ✓ — cross-round drift scenario with no workaround that preserves thread attribution.

## Overall verdict

**APPROVE** — Bucket A (Candidate #1 alone) as the R9 headline, with Candidate #2 promoted to R10 backlog as PM's own discovery and Candidate #3 promoted to R10 backlog as a standalone micro-feature.

**Bucket A** is the **right recommendation**:
- Honors R8 PM Manager's explicit R9-headline callout (`pm-manager-review.md:110`).
- Honors backlog-freshness gate: PM self-investigation surfaced #2 + #3, ranked them, and (correctly) did not preempt R9 with them.
- Single coherent story, fresh review lens, ~110-180 LOC + tests fits the R6/R7/R8 architecture-class sweet spot.
- Profile = architecture → 7-role loop in full cadence (PM / PM Manager / Architect / Dev / Tester / PM Doc Writer / Decision), 5 parallel review-work lenses per Tester.

**Bucket B is the natural-fallback**, NOT the default:
- Thematically coherent (reviewer-agency bundle).
- BUT doubles LOC and increases bundle-half-shipped risk (R8's "1-of-2 ships" pattern is the precedent — R6/R7 were 3-of-3 and 2-of-2 successful but neither at this size).
- Promote to Bucket B **only if** Architect's design phase confirms both candidates share a single "honor user corrections of findings" agent-prompt paragraph (load-bearing for bundle coherence) AND keeps total LOC ≤ 400. If the Architect splits them into two paragraphs or pushes LOC above 400, demote back to Bucket A.

## Action items

1. **Bucket A promoted to Architect**: `src/index.ts:1796` guard widening, `Finding`/`ConversationEntry` type addition of `manually_reopened: boolean` (default undefined for backward-compat with R1-R8 state.json files), `renderConversationPanel` 4th branch at `src/ui/app.ts:1828-1859`, `reopenFinding(id)` payload change at `src/ui/app.ts:2356`, `### Workflow Execution Rules` agent-prompt paragraph addition at `src/index.ts:1452-1459`, `data.existing_findings` mirror update at `src/index.ts:1850-1855`.
2. **R10 backlog additions** (logged for next round's PM Triage, not for R9):
   - Candidate #2 — Edit finding in-place (PATCH endpoint + Edit button + system-comment thread). Already self-discovered with full file:line evidence; brief.md at lines 93-125 is the seed.
   - Candidate #3 — Export state.json for debugging (GET endpoint + small button next to Submit). Already self-discovered; brief.md at lines 127-146 is the seed.
3. **Architect MUST verify** (Bucket A gate): the new agent-prompt paragraph at `src/index.ts:1452-1459` must be a single concise paragraph (≤ 8 lines) and must not break the existing Round Summary format at `index.ts:1461-1468` (which follows immediately). Mitigation: Architect inserts the new paragraph as sub-bullet (1.) and renumbers existing 1./2./3./4./5. to 2./3./4./5./6.
4. **Tester MUST verify** (Bucket A gate): the e2e test at `brief.md:85` must exercise a stale finding → Reopen → submit → next round's auto-close pass, and assert the finding persists open. This is the load-bearing test that proves the agent prompt honored the flag.
5. **Patch H verification** (R7 retro, apply to R9): every R8 audit-trail item that PM Triage claimed was verified (`brief.md:19` for R8 SHAs) was re-checked by this reviewer before being trusted — same hygiene must apply to Architect's R9 commit claims in R10 brief.
6. **R9 Decision retro**: if R9 ships Bucket A successfully with no slip, R10 brief should re-evaluate Bucket B (now that #1's renderConversationPanel surface is unlocked and the agent-prompt surface has been touched once already, the marginal cost of #2 drops).