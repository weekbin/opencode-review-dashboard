# R69 Research

`renderDiffPanel` (app.ts:4953) builds N cards per diff. Each `card-header` div (line 4999) has a click handler that calls `toggleCollapse(file.path)` (line 2753). `state.collapsed` (Set<string>) tracks which files are collapsed.

Two-step fix:
1. Set initial `aria-expanded="true"` (or `"false"` if already collapsed) using `state.collapsed.has(file.path)`
2. Inside click handler, after `toggleCollapse`, update `aria-expanded` to reflect new state
3. Add `keydown` handler: Enter or Space → preventDefault + click() (same pattern as R59)

Same a11y pattern as R59 sidebar folder — no new dependency, no data structure change.
