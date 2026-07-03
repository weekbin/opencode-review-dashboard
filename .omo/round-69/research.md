# R69 Research

`renderDiffPanel` builds N cards. Each card-header div has a click handler.

Two-step fix:
1. Initial `aria-expanded` from `state.collapsed.has(file.path)` (true/false)
2. After `toggleCollapse`, update `aria-expanded` to new state
3. keydown handler: Enter or Space → preventDefault + click()

Same pattern as R59 sidebar folder.
