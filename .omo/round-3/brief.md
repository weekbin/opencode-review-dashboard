# Round 3 Brief

## Title
Expose prior-round resolution context + structured `resolved[]` in the tool's return payload

## Source
- Agent self-investigation (no open GitHub issues, no `.omo/backlog.md`)
- v3 PM reframe: user-need surfaced by reading README + agent auto-apply workflow code (`src/index.ts:1320-1365`) + comparing to actual return payload shape (`src/index.ts:431-445`)

## User pain

When an agent auto-applies review findings across rounds (the README's "Auto-apply workflow"), it needs to know:
1. Which prior-round findings were **resolved** (so it doesn't re-apply a fix the user already accepted)
2. Which prior-round findings were **resolved by the user's own rejection** (so it doesn't re-apply a pattern the user explicitly rejected)
3. The **chronology** — which findings were raised when, which comments were exchanged

Currently the return payload at `src/index.ts:431-445` only exposes **currently-open** findings (`open.map(...)` filters out resolved/stale/closed_auto). The agent has to **discover the session ID, find `state.json`, parse it, and walk the `comments[]` array itself** — this is exactly what line 1339 of the agent prompt tells it to do.

## Acceptance criteria

- AC1: Return payload includes a new top-level `resolved[]` array containing findings with `status === "resolved"` from any prior round (not the current round), each with `id`, `severity`, `category`, `file`, `start_line`, `end_line`, `comment`, `comments[]`, `resolved_at` (timestamp).
- AC2: Return payload includes a new top-level `prior_notes` string (concatenated notes from all prior rounds, joined with `\n---\n`).
- AC3: Return payload includes a new `session_id` field (currently the agent must discover it externally — make it explicit so agents don't have to read `.opencode/reviews/<session>/state.json` to get the basics).
- AC4: AC1-AC3 are backward-compatible: existing fields unchanged, new fields additive only. Existing e2e scenarios still pass.
- AC5: Update the agent's auto-apply workflow prompt (the multiline `description` for the tool) to use the new payload fields instead of "read state.json manually" — but ONLY if the new fields are sufficient (if state.json has richer data like timeline, keep the prompt mentioning it for completeness).
- AC6: Add 1 e2e scenario verifying: round 1 returns 3 findings, user resolves 1 via UI, round 2's payload includes that finding in `resolved[]` with `resolved_at` set.

## File changes

| File | Change |
|---|---|
| `src/index.ts:431-445` | Add `resolved[]`, `prior_notes`, `session_id` to return JSON |
| `src/index.ts` (agent description around line 1320-1365) | Update "Read Conversation History" instruction to use new payload fields |
| `src/index.ts` | Extend `Finding` export type with `resolved_at?: number` field (set when status flips to resolved) |
| `scripts/test-review-ui/e2e.mjs` | Add new scenario `round-2-resolved-context` that verifies the new fields |
| `README.md` | Add 1-paragraph note in "Multi-round reviews" section about the new payload fields |

## Implementation steps

1. Create worktree per project memory 372
2. Add `resolved_at?: number` field to `Finding` type (line 38 area)
3. In `collect()` result builder (line 416-446): add new fields to return JSON
4. Update agent description in `tool` definition (line 1320-1365) to use new fields
5. Add 1 e2e scenario
6. README 1-paragraph note
7. Run `bun run check` (clean)
8. Run unit tests + e2e (≥ 14/14)

## Test plan

- Unit test: extend `state-store.test.ts` to verify `resolved_at` is set when `status` transitions to `resolved`
- E2E test (new scenario): round 1 finds 3 issues → user resolves 1 → round 2 sees that finding in `resolved[]`
- Regression: existing 13 e2e scenarios still pass

## Risk register

| Risk | Mitigation |
|---|---|
| New fields break existing consumer of the JSON payload (e.g. the diff-report skill, agent auto-apply workflow) | Additive only — no field renamed, no field removed. Existing consumers ignore unknown fields. |
| `resolved_at` field requires updating existing finding-resolution paths (UI button + agent add_review_comment) | Search for all `status: "resolved"` assignments and add `resolved_at: Date.now()` |
| Payload size grows with rounds (resolved[] could be hundreds of items for long sessions) | Document expected behavior — payload is round-level, so resolved[] is bounded by prior rounds. For sessions with 100+ rounds, consider pagination later. |

## Worker hand-off checklist

- [ ] Create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-3`
- [ ] Branch: `team-dev-loop-round-3-payload-context`
- [ ] Add `resolved_at?: number` to `Finding` type
- [ ] Update `saveState` / `resolve` paths to set `resolved_at` when status flips
- [ ] Add `resolved[]`, `prior_notes`, `session_id` to return payload
- [ ] Update agent description in tool definition to use new fields
- [ ] Add 1 e2e scenario `round-2-resolved-context`
- [ ] Run `bun run check`
- [ ] Run unit tests (≥ 11/11 — Round 1 had 10, this adds 1)
- [ ] Run e2e tests (≥ 14/14)
- [ ] Update README "Multi-round reviews" section (1 paragraph)
- [ ] Commit + push

## Profile signals

```yaml
profile_signals:
  pm_source: agent-suggested (v3 PM reframe — README/agent-workflow gap)
  U_size: "small (1-2)"        # 1-2 src files + 1 test file
  U_files: "small (2-3)"
  U_new_capability: yes        # agents gain access to prior-round data in payload (currently they must read state.json manually)
  U_behavior_shift: no         # tool's external behavior unchanged
  U_user_visible: no           # internal API change; users don't see this directly
  U_data_shape_breaking: no    # state.json schema unchanged; only new optional fields in the JSON payload
  U_data_safety: no
  U_installs_new_dep: no
  # lead conversion: U_size=0 + U_files=1 + U_new_capability=2 + others all 0 → total=3
```

## Recommended profile

Apply the auto-classification rules (v3):

1. Rule 1 (architecture): `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO (3). → skip.
2. Rule 2 (feature): `U_user_visible==yes`? NO. → skip.   ← *this is interesting — the new capability is for AGENTS not humans, so it's not user-visible in the README/docs sense*
3. Rule 3 (bugfix): default → **bugfix**.

Wait — re-reading the rules. `U_user_visible` says "User notices the change at all (README/docs/UI)?" — strictly, this IS a doc-visible change (new payload fields documented in README). So `U_user_visible=yes` and total=3 (after adding the 2 points for U_user_visible).

Recomputed: U_size=0 + U_files=1 + U_new_capability=2 + U_user_visible=2 → **total=5**.

Rule 2: `U_user_visible=yes` AND `total >= 3`? YES (5 ≥ 3). → **feature**.

So Round 3 classifies as **feature** — a new capability for the agent, documented in README.

## Self-Critique

**Clarity**: HIGH. The gap is precisely located (`src/index.ts:431-445` return payload + `src/index.ts:1339` agent instruction to "read state.json manually"). The fix is additive (no breaking changes).

**Hidden ambiguities**:
- Should `resolved[]` include all-time resolved, or just last round's resolutions? **All-time** (bounded by round count, not finding count). Easier for agent to understand full history.
- Should `prior_notes` include the CURRENT round's notes (in addition to `notes` field) or only PRIOR rounds? **Prior only** — current round already has the `notes` field.
- Should `session_id` be a UUID or a friendly string? **UUID format** (matches OpenCode convention).

**Risks**: LOW. Additive changes, backward-compatible, well-scoped.

## Files (Round 3 artifacts)

- `.omo/round-3/brief.md` (this file)
- `.omo/round-3/plan.md` (1-paragraph plan — bugfix profile simplification note: feature profile gets full plan)
- `.omo/round-3/review-{goal,qa,security}.md`
- `.omo/round-3/test-report.md`
- `.omo/round-3/diff-report.md`
- `.omo/round-3/doc-update-report.md`
- `.omo/round-3/decision.md`
- `.omo/proposals.jsonl` (1 line appended)