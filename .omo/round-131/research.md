# R131 Research — Lock state pattern in OpenCode dashboard codebase

## Existing 409 patterns in src/index.ts

| Line | Use case |
|------|----------|
| 2143 | conflict (reaction removed during cleanup) |
| 2149 | conflict (reaction author mismatch) |
| 2157 | conflict (duplicate reaction) |
| 2174 | conflict (concurrent draft edit) |
| 2336 | conflict (existing finding) |

So 409 for "review locked" follows the existing pattern.

## Round cap patterns

- `ROUND_APPROVALS_CAP = 50` at L701
- `ROUND_SYSTEM_NOTES_CAP = 50` at L700
- Both use slice-trim-from-end pattern at the cap

For R131 we don't add a cap — `state.locked` is a single optional field, not an array.

## UI disable patterns

`showPostSubmit` at L6557 already disables submit/add/clear buttons. We need to extend it to disable resolve/comment/react too.

Currently:
```typescript
addButton.disabled = true;
clearButton.disabled = true;
submitButton.disabled = true;
submitRequestButton.disabled = true;
submitApproveButton.disabled = true;
commentRoot.disabled = true;
```

We add: resolve buttons (via delegated listener check), reaction buttons.

## State schema migration

Adding optional field to `State` is non-breaking (legacy state.json files without `locked` field render as `undefined` → not locked → behaves like R131-naive). R105 conformance rule already applies.

## Round header pattern

`renderStatsPane` at L3578 is the main round header. We can add a lock badge next to the round count.

## Subagent verification: not needed

This is a 1-feature round with clear ACs — lead-direct per v6 spec.