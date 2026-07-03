# R81 Decision

SHIP.

## What was shipped
- 4 navbar tab `<button title="...">` English tooltips replaced with `data-i18n-title="sidebar.X.tooltip"` attributes
- 4 new STRINGS keys added: `sidebar.files.tooltip`, `sidebar.commits.tooltip`, `sidebar.conversation.tooltip`, `sidebar.previously.tooltip`

## Risk
- Zero — pure i18n change, leverages existing applyUI() pipeline
- zh-CN users now see translated tab tooltips on hover (Files / Commits / Conversation / Previously)

## Doc updates
- None (no user-facing README change)

## Loop summary
R81 opens the second 20-round arc (R81-R100). Fresh discovery scanned for new i18n gaps missed by R57-R72 modal sweep — found 4 navbar tab titles in src/ui/review.html. Same `data-i18n-title` pattern as R66 fix. 731/731 tests pass.
