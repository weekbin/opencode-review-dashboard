# R77 Discovery

R76 carry-over: empty.

Fresh scan found help modal (app.ts:1253) was missed by R57-R72 sweep. Has 13 hardcoded English strings in a single `dialog.innerHTML` template:
- h3 "Keyboard shortcuts"
- p "Quick reference for the most common shortcuts. Press ? or Esc to close."
- 9× shortcut descriptions
- button "Close"

All user-facing copy in zh-CN still shows English. Hidden bug for international users — they can't read the help overlay.

Selected scope: 1 round, 1 modal, 13 hardcoded English strings → i18n. TDD-strict (4 tests).
