# R69 Research

`card-header` is a `<div>` created by `renderDiffPanel` (app.ts:4997). Click handler at line 5002 toggles `state.collapsed` (Set<string>).

`state.collapsed` is the canonical Set for file-card collapse state (vs `state.collapsedFolders` which is for sidebar folders — separate Set, used by `renderFileTree`).

Initial aria-expanded needs to read from `state.collapsed.has(file.path)` — same state the click handler toggles.

Keydown handler pattern matches R59: `if (e.key === "Enter" || e.key === " ") { e.preventDefault(); header.click(); }`.

## Risk
- 1 src/ file, ~10 LOC
- Zero behavior change for mouse users
- Toggles aria-expanded on both initial render and click (covers the toggle state path)
