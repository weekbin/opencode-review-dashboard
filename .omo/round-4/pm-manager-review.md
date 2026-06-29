# PM Manager Review — Round 4 Brief (v3, re-grounded)

> **Date**: 2026-06-29
> **Reviewer**: Round 4 PM Manager (Sisyphus-Junior, fresh subagent)
> **Subject**: `.omo/round-4/brief.md` v3 — re-grounded after v1 was CLARIFY-rejected for fabricated R3 evidence chain
> **Supersedes**: the previous CLARIFY verdict at this path; the new brief is verified against `main` (870a507)

## Verdict: APPROVE

## Pseudo-requirement markers found

**NONE.** All 5 pseudo-requirement markers (DUPLICATE / SPECULATION / CONTRADICTION / INFLATED / OBSCURE) were checked across all 5 candidates and none triggered.

- **DUPLICATE**: no candidate duplicates an existing feature. Files / Commits / Conversation tabs exist at `src/ui/review.html:1702, 1706, 1710`; no 4th tab. No existing round-filter dropdown. `format()` at `src/index.ts:422-431` confirms comments[] is currently stripped from agent payload. Reopen handler at `src/index.ts:1708-1710` confirms no remap/reconcile on reopen.
- **SPECULATION**: every candidate has a real anchor in current code. #1 has the real R3 forward-reference (`.omo/round-3/playwright-report.md:15`, `.omo/round-3/decision.md:73`) — verified line-by-line. #2/#3/#4 are derived from reading `src/index.ts:422-431` and `src/ui/app.ts:1765-1767` (actual sort-by-round-desc and round-badge code). #5 is the R1+2 backlog #3 carried explicitly as such.
- **CONTRADICTION**: no candidate conflicts with the in-flight `870a507` audit-trail commit or any recent R1-3 SHIP.
- **INFLATED**: scope estimates are bounded. #1 explicitly says "no state change required" (the previous brief's trap). #2/#3/#4/#5 are tight (40 / 60 / 50 / 15 LOC, 1-3 files each).
- **OBSCURE**: the persona "developer running round 2+ of `/diff-review-dashboard`" IS the actual user — the README explicitly markets "Multi-round reviews" as a shipped capability, and the agent's `add_review_comment` tool at `src/index.ts:1929` is explicitly described as "for the multi-round discussion."

## Per-candidate verification

**Verification method**: every cited file:line was checked against `main` (870a507) via `grep -n` / `sed -n` / read tool. Cite source-of-truth: brief claims → actual file content.

### Candidate #1 — "Previously discussed" panel in the Conversation tab

**Verdict: PASS**

Verified facts:
- `Finding` type has `comments?: FindingComment[]` at `src/index.ts:45`, `round: number` at `:30`, `status: "open" | "closed_auto" | "resolved"` at `:38`, `closed_at?: number` at `:43`. **ALL required fields present.**
- `FindingComment` has `author: "user" | "agent"` at `src/index.ts:23`. **Required for comment-thread rendering.**
- `renderConversationPanel` at `src/ui/app.ts:1603` already maps `state.existing.map((item) => ({...item, round: item.round ?? 0, status: item.status ?? "open", created_at: item.created_at ?? 0}))` at `:1605-1611`. **Existing pattern that a new "previously discussed" renderer can mirror.**
- `round-NNN.md` writes notes via `markdown({session_id, round, notes, findings, ...})` at `src/index.ts:1811-1819`; `markdown()` reads `input.notes` at `:452, 467` and emits a `## Notes` section at `:478-479`. **Notes data is in disk already — no new write needed.**
- `state.findings` at `src/index.ts:74` is a flat array with `comments[]` and `round` on every entry. **Round grouping is straightforward.**
- Real R3 forward-reference:
  - `.omo/round-3/playwright-report.md:15` — "If a future round wants to surface `resolved[]` or `prior_notes` in the UI (e.g., as a 'Previously discussed' panel), that would be a separate Round 4 candidate." ✓
  - `.omo/round-3/decision.md:73` — "Surfacing `resolved[]` or `prior_notes` as a 'Previously discussed' panel in the UI is a separate Round 4 candidate." ✓
  - Both are valid as USER PAIN anchors and the brief marks them so.
- The previous brief's R3-fabricated-evidence failure mode is FIXED: the new brief explicitly disclaims `state.notes_history`, `src/format.test.ts`, R3 commit SHAs (`57a447a` / `b4bc02e` / `e14c943` — all `git cat-file -e` MISSING), and the R3 payload fields (`session_id` / `prior_notes` / `resolved[]` — not in `format()` output at `src/index.ts:433-446`, which returns only `{round, cancelled, open_count, by_severity, by_category, notes, findings, artifacts}`). The actual tool response at `src/index.ts:1835-1845` is `{ok, round, json_path, md_path}` only. ✓

Minor nit (not blocker): the brief says `app.ts:497-506` for `setConversationFilter` but the function body is `:497-504`; `applyConversationFilter` is `:506-515`. Cite is +11 lines off but the function name and pattern are unambiguous.

### Candidate #2 — Filter Conversation panel by round

**Verdict: PASS**

Verified facts:
- `state.existing[].round` set at `src/ui/app.ts:1608` via `round: item.round ?? 0` (fallback, but always populated in persisted state.json since `Finding.round` at `src/index.ts:30` is required, not optional). **Brief's cite is accurate.**
- `setConversationFilter` pattern at `src/ui/app.ts:497-504`: `setConversationFilter(filter)` → `state.conversationFilter = filter` → `writeStored(CONV_FILTER_KEY, filter)` → `applyConversationFilter()` → `renderActivePane()`. **This is the exact pattern for `setRoundFilter` to mirror.**
- `CONV_FILTER_KEY = "diff-review:conversation-filter"` at `src/ui/app.ts:113`. **A new key + helper mirrors the pattern.**
- Sort by round descending at `src/ui/app.ts:1656-1659`: `if (a.round !== b.round) return b.round - a.round; return a.created_at - b.created_at;` **Already sorts by round — the new filter just narrows the set.**
- Round badge per entry at `src/ui/app.ts:1765-1767`: `const round = document.createElement("span"); round.textContent = `Round ${entry.round}`; subheadLeft.appendChild(round);` **Round is already visible per row; the filter only adds scope.**
- 3-status filter logic at `src/ui/app.ts:1637-1642` (`"open"` / `"resolved"` / `"all"`) is the analog the new round filter extends.
- Existing `<select>` would slot into `src/ui/review.html:1744-1757` (the `pane-toolbar` for the Conversation pane).

Minor nit: the brief says "current round" as a filter option, which is a slight ambiguity in a single-round review (round=1, no prior rounds). Acceptable for a multi-round persona; brief scope is "round 4 of a long review".

### Candidate #3 — Agent sees prior-round comment thread in tool payload

**Verdict: PASS**

Verified facts:
- `format()` open-only filter at `src/index.ts:415`: `const open = result.findings.filter((item) => item.status === "open");` **Confirmed — drops resolved and closed_auto.**
- `format()` findings map at `src/index.ts:422-431`:
  ```
  const findings = open.map((f) => ({
    id, severity, category, file, start_line, end_line, side, comment
  }));
  ```
  **Drops `comments[]`, `closed_at`, `round`, `kind`, `status`, `created_at`, `updated_at`, `anchor` — explicitly mapped down to a 7-field subset.** The brief's "comments[] dropped" claim is exact.
- `format()` return shape at `src/index.ts:433-446`:
  ```
  { round, cancelled, open_count, by_severity, by_category, notes, findings, artifacts }
  ```
  **Brief's `U_size: small-medium (2-4)` estimate (~60 LOC + 1 e2e scenario) is realistic for adding `comments[]` to each finding + a `resolved[]` top-level array.**
- Agent prompt at `src/index.ts:1335-1342` (the brief said `:1336-1341`, which is within the instruction block):
  ```
  0. **Read Conversation History (do this BEFORE printing the round summary)**:
     The tool's `notes` and `findings[]` are only the CURRENT round. To understand the full
     conversation (every comment, every rejection, every follow-up across rounds), read
     `.opencode/reviews/<session>/state.json` directly.
  ```
  **Confirmed — the agent is explicitly told to do manual state.json reads because the payload is incomplete. Real symptom.**
- `add_review_comment` tool at `src/index.ts:1929` (description: "Append a comment to an existing review finding so the multi-round discussion is persisted in state.json") **Confirms the comment-thread mechanism exists; the payload gap is real.**
- `Finding.comments?: FindingComment[]` at `src/index.ts:45` **Data is in state — the format() map just needs to include it.**
- Brief's caveat about "R3's scope inflation" is a fair warning and the brief itself scopes candidate #3 tightly (~60 LOC, no `notes_history` or `session_id` change, no new test file).

Minor nit: the brief cites the agent prompt as `src/index.ts:1336-1341` but the actual instruction block is `:1335-1342` (1-line drift). Non-blocking.

### Candidate #4 — Surface prior-round `notes` in the UI

**Verdict: PASS**

Verified facts:
- `round-NNN.md` export at `src/index.ts:1799-1819` (the brief said `:1808-1819`, which is the markdown write block — close enough):
  ```
  const export_data = {
    session_id, round, notes, findings, filter, base, generated_at
  };
  await writeFileAtomic(json_path, JSON.stringify(export_data, null, 2));
  await writeFileAtomic(md_path, markdown({ session_id, round, notes, findings, ... }));
  ```
  **Notes ARE written per round. The data exists.**
- `markdown()` at `src/index.ts:449-484` reads `input.notes` (`:452, 467`) and emits `## Notes` section at `:478-479`. **Format includes notes.**
- File path template: `String(round).padStart(3, "0")` at `src/index.ts:1796`, yielding `round-001.md`, `round-002.md`, etc. **Easy to enumerate.**
- `state.notes` UI binding at `src/ui/app.ts:2215` (in `draftPayload()`): `notes: state.notes` — **the textarea is bound to `state.notes` for submission, but the round-NNN.md contents are not surfaced back into the UI.**
- Notes textarea HTML at `src/ui/review.html:1804-1805`: `<label for="notes">Notes for this round</label>` + `<textarea id="notes" placeholder="Optional global notes"></textarea>`. **A new `<details>` element above/inside this textarea is the natural insertion point.**
- Brief's overlap acknowledgment with #1 (`If #1 ships, #4 becomes redundant`) is honest and correct.

Minor nit: 50 LOC for "new GET endpoint + `<details>` + e2e scenario" is on the optimistic side; an authoritative dev might come in at 70-80 LOC. Still small.

### Candidate #5 — Stale backlog #3: Reopen anchor `end_line` reset

**Verdict: PASS**

Verified facts:
- Reopen handler at `src/index.ts:1643-1722`. **Confirmed location and function purpose.**
- Reopen writes at `src/index.ts:1708-1711`:
  ```
  target.status = "open";
  target.updated_at = Date.now();
  target.closed_at = undefined;
  base.updated_at = Date.now();
  ```
  **Drops `closed_at`, sets `status` → `"open"`, sets `updated_at`. Does NOT touch `end_line`, `start_line`, `anchor`, or call `remap()` / `reconcile()`.** Stale anchor bug is real.
- `remap()` at `src/index.ts:294-306` (brief said `:285-306`, actual starts at `:294`): the natural place to re-derive `start_line`/`end_line` from the current `anchor.selected` text match.
- `reconcile()` at `src/index.ts:308-345` (brief said `:308-345`, actual ends at `:343`): the natural single-finding re-derive is `remap()`, but `reconcile()` works too (and is idempotent for an already-open finding; would re-set `updated_at` which is fine since reopen also sets it).
- Brief is honest about this being stale backlog (demoted to "considered, not selected").

Minor nit: brief cites `reconcile() :308` as the natural place; the more surgical fix is `remap() :294` for the single reopened finding (avoids the `updated_at` re-stamp). Dev should pick `remap()` over `reconcile()` for tighter scope.

## Suggested rewrites

**NONE.** The brief is sound as-is for the recommended candidate (#1).

Optional micro-polish (not required for APPROVE):

1. **Candidate #2 cite correction** — line 49 says "setConversationFilter (`:497-506`)" but the function body is `:497-504`. Not worth a CLARIFY cycle; cosmetic.

2. **Candidate #5 remap/reconcile preference** — line 94 suggests calling `reconcile()` first. Suggest preferring `remap()` because (a) it has narrower blast radius (no `updated_at` re-stamp on other findings), (b) reopen already updates `updated_at` for the one target. Cosmetic; dev will pick the right one.

3. **Candidate #3 prompt cite** — line 124 says "agent prompt at `:1336-1341`" — the actual instruction block is `:1335-1342`. Cosmetic.

4. **Candidate #4 LOC estimate** — line 80 says ~50 LOC; a tight GET endpoint + `<details>` + filter logic could be 70-80 LOC. Still small; budget-conscious PM might prefer #2 if scope sensitivity is high.

These are nits, not blockers. The five candidates each have a real, verifiable, in-scope motivation against current main, no fabrication, and no over-scoping.

## Rationale

Every one of the 5 candidates passes verification against current `main` (870a507). The previous brief's failure modes — fabricated R3 SHIP evidence, broken retro line citations, scope inflation on candidate #1 (which would have required a `State` schema change for `notes_history`) — are all explicitly addressed in this re-grounded brief via the AUDIT-TRAIL-INTEGRITY-NOTE.md priority, the "DO NOT cite R3 fabricated fields" rule, the corrected file:line cites, and the scoped-down candidate #1 (no state change required). No pseudo-requirement markers (DUPLICATE / SPECULATION / CONTRADICTION / INFLATED / OBSCURE) are present. APPROVE.
