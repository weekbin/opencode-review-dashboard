# Round 9 Plan — Bucket A: Reopen Stale Findings (architecture profile)

> **Date**: 2026-06-29 · **Architect**: Round 9 Architect · **Pre-check PASS**: HEAD `ca22741`, all 7 R8 SHAs verified (PM Triage brief.md:19 + PM Manager pm-manager-review.md:10) · **Profile**: architecture (Rule 1: `U_behavior_shift=yes` — server widens previously-rejected transition AND agent prompt gains new honor-flag directive) · **Sub-candidate**: #1 alone (~$110-180 LOC, 3 files: `src/index.ts` + `src/ui/app.ts` + `scripts/test-review-ui/scenarios.mjs`) · **Review lens**: server-contract + agent-prompt (NOT a11y — different lens from R8 per brief.md:6)

## 1. Goal

R9 restores reviewer agency over findings they created. When a finding auto-closes as `closed_auto` due to anchor drift (user bumped `--base` or agent rewrote the snippet in auto-apply), the reviewer can click a "Reopen" button — the server widens its guard to allow the `closed_auto → open` transition when an explicit `manually_reopened: true` flag is sent, AND the agent prompt is updated to honor that flag (re-apply instead of re-auto-closing the same finding based on the same anchor drift).

## 2. Acceptance Criteria

### Server-contract ACs (`src/index.ts` changes)

- **AC9-1.1** (Finding type): Add `manually_reopened?: boolean` to `Finding` at `src/index.ts:28-46` (between `close_reason?` line 44 and `comments?` line 45). Additive, defaults `undefined`, no migration needed for R1-R8 `state.json`.
- **AC9-1.2** (ConversationEntry mirror): Add `manually_reopened?: boolean` to `ConversationEntry` at `src/ui/app.ts:1680-1694` so the UI sees the flag in the server payload.
- **AC9-1.3** (Guard widening): Relax guard at `src/index.ts:1796` from `if (target.status !== "resolved")` to: allow if `status === "resolved"` (existing) OR `(status === "closed_auto" && input.manually_reopened === true)` (new). Reject otherwise.
- **AC9-1.4** (Manual reopen payload): Handler at `src/index.ts:1781` reads `input = { finding_id?: string; manually_reopened?: boolean; reason?: string }` (adds 2 fields).
- **AC9-1.5** (Record manual reopen): On success, set `target.manually_reopened = true`, clear `target.close_reason = undefined`, append system comment `{ author: "user", text: "Manually reopened" + (reason ? `: ${reason.slice(0,200)}` : ""), created_at: Date.now() }` to `target.comments[]`.
- **AC9-1.6** (Auto-close preserves falsy): The auto-close path (not modified) leaves `manually_reopened` as-is; only manual reopen sets it.

### Agent-prompt ACs (`src/index.ts:1451-1480` changes)

- **AC9-1.7** (Prompt injection): Insert new sub-bullet between lines 1459 and 1460 (after "0. Read Conversation History", before "1. Round Summary"): when `findings[]` in `state.json` has `manually_reopened: true`, treat the original `anchor_missing` close as **honored, not stale**, do NOT re-auto-close based on the same anchor drift, apply a fix if actionable, else `add_review_comment` explaining why.
- **AC9-1.8** (Renumber steps): Existing "1. Round Summary / 2. Plan-First / 3. Fix Application / 4. Validation / 5. Closing Rule" at lines 1460-1480 → "2./3./4./5./6." (per PM Manager gate `pm-manager-review.md ## Action items #3`).
- **AC9-1.9** (Concrete example): The injected paragraph includes a 2-line example (stale finding → manually reopened → agent re-applies → new diff persisted with comment).

### UI ACs (`src/ui/app.ts` changes)

- **AC9-1.10** (Reopen on stale): Modify action branch at `app.ts:1850` from `else if (isResolved && !isStale)` → `else if (isResolved)` — show Reopen button on `closed_auto` findings too. Add small "user-reopened" badge near existing `stale` badge at `app.ts:1812-1816`.
- **AC9-1.11** (Reason modal): New `showReopenReasonModal(findingId): Promise<string | null>` at end of `app.ts` (~line 2800+) — inline overlay (reuse `.conversation-drawer` CSS) with textarea "Why are you re-opening? (Optional but helps the agent)" + Cancel / Reopen. Returns trimmed reason or `null` if cancelled.
- **AC9-1.12** (Stale→modal flow): When `isStale` button clicked, call `showReopenReasonModal(id)`; if `null`, abort; else `reopenFinding(id, reason, { manually_reopened: true })`.
- **AC9-1.13** (reopenFinding signature): `src/ui/app.ts:2356` → `async function reopenFinding(id: string, reason: string = "", opts: { manually_reopened?: boolean } = {})`. POSTs `{ finding_id, manually_reopened?: true, reason?: string.slice(0,200) }` (falsy fields omitted by JSON.stringify, so existing call site `app.ts:1856` `reopenFinding(entry.id)` stays backward-compatible).
- **AC9-1.14** (UI feedback): On success → `setStatus("Finding reopened — will be re-applied in the next round")`. On 4xx → surface server's `data.error` verbatim (drop generic "Cannot reopen (code may have changed)" fallback).

### Cross-cutting ACs

- **AC9-X1**: 84 existing unit tests still pass + 5 new in `src/reopen-stale.test.ts` → 89+ pass / 0 fail.
- **AC9-X2**: `bun run check` clean (format + lint + typecheck).
- **AC9-X3**: `bun run build` clean (writes `dist/plugin/index.mjs` + `dist/ui/`).
- **AC9-X4**: All 7 R8 SHAs `git cat-file -e` PASS — `415ee96 3a6a636 53fd00f e701214 2fef2f7 ebbc7c0 ca22741` (R4 retro Gap 1).
- **AC9-X5**: All 5 R5 SHAs verified at R9 start (PM-verified at `brief.md`).
- **AC9-X6**: No schema/dep break. `manually_reopened` optional, additive, defaults undefined. R1-R8 `state.json` reads cleanly.
- **AC9-X7**: **GAP J MANDATORY** walkthrough by Dev via `playwright-cli` on freshly-built `dist/ui/` with console-error check (zero errors required). Screenshots: stale-finding-renders.png, stale-reopen-modal.png, stale-reopen-success.png.
- **AC9-X8**: **GAP I retroactive** — new e2e scenario `reopen-stale-finding` in `scenarios.mjs` + `e2e.mjs` registers it + README scenario count bumped (19 → 20).

## 3. File changes

### `src/index.ts` (~50-70 LOC) — server + Finding type + agent prompt

**3a.** Finding type at `:28-46`: insert `manually_reopened?: boolean;` between `close_reason?` (line 44) and `comments?` (line 45). Additive, defaults `undefined`.

**3b.** Reopen handler at `:1780-1859`:
- Line 1781 input parse widens to `{ finding_id?: string; manually_reopened?: boolean; reason?: string }`.
- Line 1796 guard changes from `if (target.status !== "resolved")` to `if (target.status !== "resolved" && !(target.status === "closed_auto" && input.manually_reopened === true))` (allows resolved always + closed_auto only with explicit flag).
- After recovery transition at `:1845-1847`, if `input.manually_reopened === true`: set `target.manually_reopened = true`, `target.close_reason = undefined`, append system comment `{ author: "user", text: "Manually reopened" + (reason ? `: ${reason.slice(0,200)}` : ""), created_at: Date.now() }` to `target.comments[]`.
- Mirror at `:1852`: the spread `{...target}` already includes the new field.

**3c.** Agent prompt at `:1451-1480`: insert 1-paragraph directive between line 1459 and 1460 (after "0. Read Conversation History", before "1. Round Summary"). Example wording: *"`manually_reopened` honor directive: If `state.json`'s `findings[]` contains a finding with `manually_reopened: true`, that user has explicitly re-opened it after your prior auto-close. Do NOT re-auto-close it based on the same anchor drift. Example: `F-007` was closed in round N with `close_reason: "anchor_missing"` and the user re-opened it in round N+1 with `manually_reopened: true` → you MUST treat it as open in round N+2's auto-close pass and act on it (apply a fix, or `add_review_comment` explaining why)."* Then renumber existing "1./2./3./4./5." at `:1460-1480` to "2./3./4./5./6." (PM Manager gate).

### `src/ui/app.ts` (~30-50 LOC) — UI + reopenFinding signature

**3d.** `ConversationEntry` type at `:1680-1694`: add `manually_reopened?: boolean` between lines 1690 and 1691.

**3e.** `renderConversationPanel` action branches at `:1828-1859`: replace line 1850 `else if (isResolved && !isStale)` with `else if (isResolved)` (Reopen button on any resolved-or-stale finding). Click handler wraps:
```typescript
if (isStale) {
  const reason = await showReopenReasonModal(entry.id);
  if (reason === null) return;
  await reopenFinding(entry.id, reason, { manually_reopened: true });
} else {
  await reopenFinding(entry.id);
}
```

**3f.** New `showReopenReasonModal(findingId): Promise<string | null>` at end of `app.ts` (~line 2800+). Inline overlay reusing `.conversation-drawer` CSS + focused `<textarea>` + Cancel / Reopen buttons. Returns trimmed reason or `null` if cancelled.

**3g.** `reopenFinding` at `:2356-2377`: signature widens to `async function reopenFinding(id: string, reason: string = "", opts: { manually_reopened?: boolean } = {})`. POSTs `{ finding_id, ...(opts.manually_reopened && { manually_reopened: true }), ...(reason && { reason: reason.slice(0, 200) }) }`. Existing call site at `:1856` (`reopenFinding(entry.id)`) stays backward-compatible (defaults make the body identical to before).

**3h.** Stale-badge enhancement at `:1812-1816` (~5 LOC): when `entry.manually_reopened === true`, render additional small "user-reopened" badge next to existing `stale` badge.

### `src/reopen-stale.test.ts` (NEW, ~50-80 LOC)

5 unit tests:
1. Server guard regression — `status: "resolved"` + no flag → 200 (existing path unchanged)
2. Server guard new path — `status: "closed_auto"` + `manually_reopened: true` → 200, `target.manually_reopened === true` after, system comment appended
3. Server guard reject — `status: "closed_auto"` + no flag → 400 (existing 400 path unchanged)
4. Anchor check still applies — `status: "closed_auto"` + `manually_reopened: true` + anchor drifted → 409
5. Agent prompt substring assertion — template string contains `manually_reopened` + "Do NOT re-auto-close"

### `scripts/test-review-ui/scenarios.mjs` (NEW scenario, ~30-40 LOC) — Gap I retroactive

Register `reopen-stale-finding`: setup 1 commit + 1 stale finding; verify Reopen button renders on stale row; click → reason modal → enter "still applies" → submit; assert `status: open` + `manually_reopened: true` + system comment in mock state. Register in `e2e.mjs` + bump README scenario count 19 → 20.

### `src/ui/review.html` — NO change expected

Button styling already exists from R5+ prior Reopen work. If Gap I walkthrough reveals CSS gap, defer to R10 follow-up rather than widen R9 scope.

### TOTAL: ~110-180 LOC across 3 changed files (server ~40, UI ~30, agent prompt ~30, tests ~50-80). Confirms `brief.md:80` estimate.

## 4. Steps

1. **Pre-flight**: Confirm HEAD on main is `ca22741` (`git log --oneline -1`). Confirm `grep -rn 'manually_reopened' src/` returns empty (NOT already shipped — already PM-verified at brief.md:63). Create worktree at `$HOME/.worktrees/team-dev-loop-round-9-reopen/` on branch `team-dev-loop-round-9-reopen` from main HEAD. **Use `$HOME` template** per R3 lesson (do NOT hardcode `/home/weekbin`).
2. **Reproduce baseline**: In the worktree, run `bun test src/` → 84 pass. Run `bun run check` → clean. Snapshot these as PASS evidence for AC9-X1 / AC9-X2.
3. **Implement #1 in 3 commits** (per file touch, atomic per R5 retro):
   - **Commit 1 — "feat(server): R9 #1 widen reopen guard for manually-reopened findings + agent prompt honor directive"**: all `src/index.ts` changes (Finding type field, server guard widening + system-comment append + mirror update, agent prompt paragraph injection with renumbering).
   - **Commit 2 — "feat(ui): R9 #1 Reopen button on stale findings + reason modal + reopenFinding payload"**: all `src/ui/app.ts` changes (ConversationEntry field, action-branch widening, `showReopenReasonModal` helper, `reopenFinding` signature widening, stale-badge enhancement).
   - **Commit 3 — "test: R9 #1 add 5 unit tests + 1 e2e scenario for reopen stale"**: new `src/reopen-stale.test.ts` + new `scenarios.mjs` scenario + `e2e.mjs` registration + README scenario-count bump.
4. **Verify all ACs**: `bun run check` + `bun run test:unit` (89+ pass) + `bun run build` + `git cat-file -e` for 7 R8 SHAs.
5. **GAP J MANDATORY (R7 retro patch + R8 validation)**: Dev MUST run `playwright-cli` walkthrough on a freshly-built `dist/ui/` with console-error check BEFORE claiming self-check PASS (per R7 retro + R8 lead-led validation). Capture screenshots: `stale-finding-renders.png`, `stale-reopen-modal.png`, `stale-reopen-success.png`. If any `console.error`, FAIL self-check.
6. **Push worktree branch** to `origin/team-dev-loop-round-9-reopen` with `git push -u origin team-dev-loop-round-9-reopen`.
7. **Hand-off** to lead for 3a-3.5 review phases (architect already decided lead-defaults per R8 retro Patches A + H).

## 5. Test plan

- **Unit tests** (5 new in `src/reopen-stale.test.ts`):
  - server guard regression (resolved-without-flag still 200)
  - server guard new path (closed_auto + manually_reopened: true → 200 + flag persists + system comment)
  - server guard reject (closed_auto + no flag → 400)
  - anchor check still applies (closed_auto + manually_reopened: true + anchor drift → 409)
  - agent-prompt substring assertion (template contains "manually_reopened" + "Do NOT re-auto-close" within first 1500 chars of `### Workflow Execution Rules`)
- **E2E test** (1 new `reopen-stale-finding` in `scripts/test-review-ui/scenarios.mjs`):
  - stale finding → click Reopen → reason modal → enter reason → submit → assert `status: open` + `manually_reopened: true` + system comment in mock state
- **Build/lint/typecheck/format**: `bun run check` + `bun run build` — all clean
- **Gap J mandatory walkthrough**: Dev MUST run `playwright-cli` (per R7 retro Patch + R8 lead-led execution) before claiming PASS

## 6. Risk register

### Risk R9-1: Adding `manually_reopened` field breaks existing `state.json` files

- **Likelihood**: LOW (field is optional, additive)
- **Impact**: LOW (existing records read cleanly as `undefined`/falsy)
- **Mitigation**: Optional field with `?` modifier; default `false` on read; serialize only when `true` to keep `state.json` diff noise at zero for the resolved-path. Verified backward-compat via AC9-X6.

### Risk R9-2: Agent prompt injection breaks the existing Round Summary format / step numbering

- **Likelihood**: MEDIUM (single inline-prompt change with downstream step renumbering)
- **Impact**: MEDIUM (wrong numbering → agent skips the summary step → broken UX)
- **Mitigation**: Architect MUST verify the prompt still contains "1. Round Summary" / "2. Plan-First Rule" / "3. Fix Application" / "4. Validation" / "5. Closing Rule" post-edit. Lead verifies in 3c walkthrough via a diff of the prompt string before/after the edit. PM Manager flagged this gate at `pm-manager-review.md ## Action items #3`.

### Risk R9-3: Reason modal styling depends on un-shipped CSS

- **Likelihood**: LOW (reuse existing `.conversation-drawer` overlay CSS)
- **Impact**: LOW (cosmetic; modal may look slightly off but functionally works)
- **Mitigation**: Reuse the existing drawer overlay CSS at `src/ui/review.html` (already battle-tested from R1-R8 finding drawer). If Gap I walkthrough reveals a real CSS gap, defer to R10 follow-up rather than widening R9 scope.

### Risk R9-4: Server-side guard widening allows unintended reopen

- **Likelihood**: LOW (guard requires explicit `manually_reopened: true` from client AND the JSON body field must be a literal JSON `true`; `undefined` / `null` / string `"true"` all hit the reject branch)
- **Impact**: HIGH if guard is wrong (reviewer bypasses their own anchor check)
- **Mitigation**: 3 unit tests for guard (allow new path, allow existing path, reject stale-without-flag, reject anchor-drift even with flag). Lead verifies in 3c walkthrough via scenario where anchor did drift — must still 409.

### Risk R9-5: Worktree path doesn't resolve (R3 retro lesson)

- **Likelihood**: LOW (template uses `$HOME`)
- **Impact**: LOW (Dev retries with the correct path)
- **Mitigation**: Step 1 explicitly mandates `$HOME/.worktrees/team-dev-loop-round-9-reopen/` template. Dev MUST copy the template verbatim, NOT hardcode `/home/weekbin`.

## 7. Hand-off

### Dev receives

- This plan (`.omo/round-9/plan.md`)
- `.omo/round-9/brief.md` + `.omo/round-9/pm-manager-review.md` (context)
- Worktree at `$HOME/.worktrees/team-dev-loop-round-9-reopen/` (Dev creates per Step 1)

### Dev returns

- All 23 ACs (AC9-1.1 through AC9-X8) with PASS evidence inline
- 3 commits on `team-dev-loop-round-9-reopen` branch (atomic per file)
- Branch pushed to `origin/team-dev-loop-round-9-reopen` with `git push -u`
- **Inline self-check** appended to Dev's return value (AC trace table + Gap J mandatory `playwright-cli` console-error check + 3 screenshots: stale-finding-renders / stale-reopen-modal / stale-reopen-success)
- 5 new unit tests in `src/reopen-stale.test.ts` + 1 new e2e scenario + `e2e.mjs` registration + README scenario-count bump (R8 retro Gap I retroactive on reopen)

### Lead does after Dev

- **3a (Tester Review)**: 5 parallel `review-work` lenses (architecture profile, 3 files changed) — Goal / Code / QA / Security / Context. Architecture-profile lens must include a `manually_reopened`-behavior verification (force the agent-prompt substring assertion + lead-led scenario exercising the new path).
- **3b (Tester Diff)**: lead takeover default per R8 retro Patch H — `git diff main...origin/team-dev-loop-round-9-reopen` review (small/medium scope, no need for 5-way parallel).
- **3c (Tester Playwright)**: lead takeover default per R7 retro Patch A — full walkthrough since UI changed (Reopen button on stale + reason modal + new badge). Console-error check mandatory.
- **3.5 (PM Doc Writer)**: lead takeover default for small work — NO README.md change needed for this feature (the manual-reopen behavior is internal reviewer-agency, not a user-facing capability new to the README's "What it does" / "Multi-round reviews" sections which already explain stale auto-close).
- **4 (Decision)**: SHIP / NO-SHIP verdict based on Dev's inline self-check + lead's walkthrough + AC trace.
- **4.5/4.6/4.7**: mandatory retro + post-execution + self-check.
- **4.8 (Loop Summary)**: chat response to user (R7 retro Gap J MANDATORY per round).
- **4.9 (Issue Auto-Close)**: scan + close any GH issues matching the "reopen stale" or "manually_reopened" keywords (likely none — self-investigation showed no related open issue; PM Manager confirmed at `pm-manager-review.md ## Action items #6` that R9 is self-investigation).
- Merge R9 branch → main + push to `origin/main`.
- Update `.omo/proposals.jsonl` with R9 line (R7 retro gap K — existing-entry-update + new-line-add pattern).

### Notes for next round (R10 backlog, NOT R9 work)

- Candidate #2 (Edit finding in-place) — see `brief.md:93-125`. PM's own discovery.
- Candidate #3 (Export state.json for debugging) — see `brief.md:127-146`. PM's own discovery.
- Both promoted to R10 backlog by PM Manager at `pm-manager-review.md ## Action items #2`.
