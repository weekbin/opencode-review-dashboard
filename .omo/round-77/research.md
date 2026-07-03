# R77 Research

Pattern matches R57-R72 (innerHTML template → t() with escapeHtml).

## 13 new STRINGS keys

- `help.modal.title`: "Keyboard shortcuts" / "键盘快捷键"
- `help.modal.intro`: "Quick reference for the most common shortcuts. Press ? or Esc to close." / "最常用快捷键速查表。按 ? 或 Esc 关闭。"
- `help.modal.close`: "Close" / "关闭" (already close.ariaLabel existed; modal.close more appropriate as button label)

Plus 9 shortcut descriptions under `help.shortcut.*`:
- `help.shortcut.nextFinding` / `prevFinding` — n/p keys
- `help.shortcut.findInDiff` / `findInDiffAlt` — / keys
- `help.shortcut.fileJump` — Cmd+P
- `help.shortcut.help` — Cmd+/
- `help.shortcut.submit` — Enter
- `help.shortcut.close` — Esc
- `help.shortcut.tabFocus` — Tab
- `help.shortcut.helpAlt` — ?

## Side fix needed

src/r17-features.test.ts:273 (R17 T36.2c) was asserting `src/ui/app.ts` contains literal `"Keyboard shortcuts"`. R77 broke it. Updated to anchor on i18n key reference `t("help.modal.title")` — proves wiring without coupling to English copy.
