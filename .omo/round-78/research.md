# R78 Research

Same fix pattern as R57-R72 (innerHTML createElement.textContent / textContent assignment → t() call).

4 sites use template literals for parameter interpolation; t() with `params?` object supports `{ query }` placeholder substitution (per existing pattern in i18n.ts:261).

## 6 new STRINGS keys

- `palette.cmdP.noResults`: 'No files match "{query}"' / '没有匹配 "{query}" 的文件'
- `palette.cmdP.empty`: 'No files available' / '没有可用文件'
- `save.indicator.idle`: 'All changes saved' / '所有更改已保存'
- `commits.empty.noResults`: 'No commits match "{query}".' / '没有匹配 "{query}" 的提交。'
- `commits.empty.empty`: 'No commits in range.' / '当前范围内没有提交。'
- `conversation.empty.noResults`: 'No findings match "{query}".' / '没有匹配 "{query}" 的审查项。'

save.indicator.idle PRE-EXISTED at i18n.ts:97 (translates same English) — semantic the same; reusing.

## No side-fix needed
Existing tests for save indicator (`data-state="idle"`) anchor on attribute, not textContent. Safe.
