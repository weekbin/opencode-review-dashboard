# R81 Research

4 new STRINGS keys (en + zh-CN):
- `sidebar.files.tooltip`: "Files changed" / "变更文件"
- `sidebar.commits.tooltip`: "Commits in this review" / "本次审查中的提交"
- `sidebar.conversation.tooltip`: "Conversation (all findings)" / "会话（所有审查项）"
- `sidebar.previously.tooltip`: "Previously discussed (prior round notes + comment threads)" / "历史讨论（上一轮笔记 + 评论线程）"

Naming: `sidebar.<tab>.tooltip` (matches existing `sidebar.files` / `sidebar.commits` etc.).

Fix pattern (matches R66 drawer-toggle fix):
- Remove `title="..."` hardcoded English attribute
- Add `data-i18n-title="sidebar.<tab>.tooltip"` — wired by `registerUITranslator`/`applyUI()` pipeline at app.ts:1618

Why a separate `*.tooltip` key (not reuse `sidebar.files` etc): the existing `sidebar.files` is short ("Files changed" / "变更文件") and is the button label. The tooltip is a longer description.

TDD: 4 regression tests verify (1) no hardcoded English title, (2) data-i18n-title attribute present on all 4 buttons, (3) all 4 keys exist in i18n.ts with both locales, (4) data-i18n-title references in review.html have matching keys in i18n.ts.
