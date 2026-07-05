# R131 Discovery — Lock worktree on final approve (R116 retro flag)

## R116 Retro (deferred 11 rounds now)

> "Approve path doesn't lock the worktree (R116): still deferred (semantic, no clear spec)"

But now the spec is clear: **when the user clicks Approve on a round that contains 0 open findings and 0 draft, the server should mark the state as `locked`** and the UI should disable ALL interactions permanently, marking the review as complete.

## Current Behavior (gap)

```typescript
// src/index.ts L2595: approve intent
const findings =
  intent === "approve"
    ? [
        ...closed,
        ...openCarry.map((item) => ({ ...item, status: "resolved", ... })),
        ...created,
      ]
    : [...closed, ...openCarry, ...created];
// + L2620: next.approvals = [...approvalsCap, { round, notes, at: Date.now() }];
// returns: { ok: true, round, intent, approved: true, json_path, md_path }
```

The approve path:
- Marks remaining open findings as `resolved` (good)
- Appends approval entry to `approvals[]` (good)
- **Does NOT lock the state** — a new submit/round can be created even though nothing is left

The UI (showPostSubmit) shows a post-submit overlay but doesn't permanently disable interactions. There's no concept of "review complete".

## Target Behavior (R131)

1. **Server-side**: when approve succeeds with `intent === "approve"` AND there are 0 open findings after the apply, set `next.locked = { at: Date.now(), round, by: "user" }`.
2. **Reject submits on locked state**: any subsequent `POST /api/review/:id/submit` returns HTTP 409 with `{ error: "review locked", locked_at: ..., locked_round: ... }`.
3. **Reject reactions/comments on locked state**: same 409 pattern.
4. **UI**: `showPostSubmit` checks `body.locked` and replaces the post-submit card with a "Review complete" card. All interaction buttons (resolve, comment, react, submit, add, clear) get disabled permanently.
5. **Persistence**: the `State` type gets a new optional `locked?: { at: number; round: number; by: "user" }` field. Renders as "🔒 Review locked" badge in the round header if set.

## Round Profile

- Bugfix: 1 (R116 retro flag, 11 rounds deferred)
- Total: 1
- Subagents: 0
- Time: ~15 minutes

## Risks Surfaced

None — implementation is straightforward state extension + 1 server guard + 1 UI guard.