# R131 Brief — Lock worktree on final approve

## Goal

Close 11-round deferred R116 retro flag: when user clicks Approve on a round that has 0 open findings + 0 draft, the worktree gets locked. UI permanently disables all interactions. Server rejects all subsequent mutations.

## Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | Server sets `state.locked = { at, round, by: "user" }` when approve succeeds with 0 open findings and 0 draft |
| AC2 | Server rejects `POST /api/review/:id/submit` on locked state with HTTP 409 + `{ error: "review locked", locked_at, locked_round }` |
| AC3 | Server rejects `POST /api/review/:id/resolve` on locked state with same 409 pattern |
| AC4 | Server rejects `POST /api/review/:id/reactions` on locked state with same 409 pattern |
| AC5 | Server rejects `PUT /api/review/:id/draft` on locked state with same 409 pattern |
| AC6 | `submit` endpoint returns `{ ok: true, approved: true, locked: true, ... }` when lock is applied (locked === false when lock NOT applied) |
| AC7 | UI `showPostSubmit` checks `body.locked` and renders "Review complete" card with lock icon |
| AC8 | UI disables ALL interaction buttons when `body.locked` is true (resolve, comment, react, submit, add, clear) |
| AC9 | Round header shows 🔒 badge + "Review locked at round N" text when `state.locked` is present |
| AC10 | Regression: existing approve-with-open-findings path still works (no lock applied, returns `locked: false`) |

## Files to Touch

- `src/index.ts`: add `locked` to `State`, gate POST submit/resolve/reactions/draft on `base.locked`, set `next.locked` when approve+0-open
- `src/ui/app.ts`: `showPostSubmit` checks `body.locked`, new `renderLockedBadge()` helper
- `src/ui/i18n.ts`: add 4 keys (`review.locked.title`, `review.locked.message`, `review.locked.badge`, `error.reviewLocked`)
- `src/ui/review.html`: minimal CSS for the lock badge

## Tests

- `src/r131-round-lock-on-approve.test.ts`: 10 tests covering all 10 ACs above
  - AC1: unit test on `submit` handler — call with 0-open + approve → `state.locked` set
  - AC2-AC5: 4 tests, each gates a different endpoint
  - AC6: response shape test (with and without lock)
  - AC7-AC9: regex tests on app.ts source for the 3 UI behaviors
  - AC10: regression — approve with 1 open finding does NOT lock