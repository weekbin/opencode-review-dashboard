# R75 Research

Pattern matches existing `DIFF_SEARCH_FLASH_MS = 1500` (app.ts:672).

New constants:
- `COPY_FEEDBACK_MS = 1200` — 3 copy-button sites use this for textContent revert
- `PERMALINK_FLASH_MS = 1600` — 1 flashFindingPermaHighlight site uses this

After replace, no `}, 1200) as unknown as number` or `}, 1600) as unknown as number` literals remain.

## Risk
- 1 src/ file, ~6 LOC + 4 sed replacements
- Zero behavior change (literal value = constant value)
- TypeScript type inference: setTimeout return type is `NodeJS.Timeout`, but casting to `number` via `as unknown as number` is unchanged
