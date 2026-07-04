/**
 * R19 #33 — Language toggle (i18n helper).
 *
 * R17-retro-deferred feature, user-asked via issue #33. Roll-our-own
 * i18n (no new dependency — keeps the bundle tiny):
 *
 *   - `translate(key, lang)` returns the localized string for `key` in
 *      the given language, falling back to English then to `key`.
 *   - `setLanguage(lang)` updates the module-level preferred language
 *      and notifies subscribers (used by toolbar toggle to re-render
 *      labels in place).
 *   - `getLanguage()` reads the persisted language from
 *      `localStorage["diff-review:language"]` (matches the DIFF_SEARCH_KEY
 *      pattern in `src/ui/app.ts:605`); falls back to "en".
 *   - `STRINGS` is the i18n table — keys → { en, "zh-CN" }.
 *
 * AC1.1: Toolbar mounts a button bound to setLanguage(). AC1.2: clicking
 * switches labels. AC1.3: persisted under `diff-review:language`.
 * AC1.4: getLanguage() runs on init so the first paint is in the
 * persisted language. AC1.5: zh-CN strings are stored as UTF-8 source
 * (verified by the build emitting them intact).
 */

export type Lang = "en" | "zh-CN";
export const LANGUAGE_KEY = "diff-review:language";
/**
 * R43 AC5: default locale is now `zh-CN` (previously `en`).
 *
 * Reason: GH #73 user feedback requested default language = Chinese. Per the
 * R43 brief, we change the DEFAULT_LANGUAGE export without changing the
 * LANGUAGE_KEY (so existing user-set preferences still load). Users who
 * already toggled to English will keep English; first-time visitors land
 * on zh-CN.
 *
 * Test regression: i18n.test.ts asserts that on a fresh localStorage, the
 * active language is `zh-CN` after `applyLanguage()`.
 */
export const DEFAULT_LANGUAGE: Lang = "zh-CN";
const SUPPORTED: readonly Lang[] = ["en", "zh-CN"];

export const STRINGS: Record<string, Record<Lang, string>> = {
  "app.title": { en: "Review Dashboard", "zh-CN": "代码审查面板" },
  "toolbar.layout.unified": { en: "Unified", "zh-CN": "统一" },
  "toolbar.layout.split": { en: "Split", "zh-CN": "分屏" },
  "toolbar.ignoreWs": { en: "Ignore ws", "zh-CN": "忽略空白" },
  "toolbar.ignoreWs.label": { en: "Hide whitespace", "zh-CN": "隐藏空白" },
  "toolbar.ignoreWs.description": {
    en: "Collapse consecutive whitespace + trim trailing (useful for reformatting diffs)",
    "zh-CN": "折叠连续空白 + 去除行尾空格 (对重排版 diff 有用)",
  },
  "toolbar.ignoreWs.ariaLabel": {
    en: "Toggle whitespace diff hiding",
    "zh-CN": "切换空白差异隐藏",
  },
  "toolbar.ignoreWs.loading": {
    en: "Applying whitespace changes…",
    "zh-CN": "正在应用空白变更…",
  },
  "toolbar.theme.light": { en: "Light", "zh-CN": "浅色" },
  "toolbar.theme.auto": { en: "Auto", "zh-CN": "自动" },
  "toolbar.theme.dark": { en: "Dark", "zh-CN": "深色" },
  "toolbar.review": { en: "Review", "zh-CN": "审查" },
  "toolbar.export": { en: "Export", "zh-CN": "导出" },
  "toolbar.submit": { en: "Submit Review", "zh-CN": "提交审查" },
  "toolbar.copyBranch.label": { en: "Copy branch", "zh-CN": "复制分支" },
  "toolbar.copyBranch.title": {
    en: "Copy current branch name to clipboard",
    "zh-CN": "复制当前分支名到剪贴板",
  },
  "toolbar.export.title": {
    en: "Export review as Markdown or patch",
    "zh-CN": "导出审查为 Markdown 或 patch",
  },
  "drawer.toggle.ariaLabel": {
    en: "Open review drawer",
    "zh-CN": "打开审查抽屉",
  },
  "close.ariaLabel": { en: "Dismiss", "zh-CN": "关闭" },
  "palette.cmdP.placeholder": { en: "Jump to file…", "zh-CN": "跳转到文件…" },
  "submit.modal.body": {
    en: "You're about to submit your review.",
    "zh-CN": "你即将提交本次审查。",
  },
  "submit.modal.findingCount": {
    en: "{count} open finding(s) will be submitted.",
    "zh-CN": "{count} 个未关闭审查项将被提交。",
  },
  "submit.modal.roundNotes.label": {
    en: "Round notes (appear in next round's Previously discussed panel)",
    "zh-CN": "本轮笔记（将出现在下一轮的「之前讨论过」面板中）",
  },
  "submit.modal.roundNotes.placeholder": {
    en: "Optional global notes for this round",
    "zh-CN": "本轮的可选全局笔记",
  },
  "editFinding.title": { en: "Edit finding", "zh-CN": "编辑审查项" },
  "editFinding.body": {
    en: "Update category, severity, or comment. Changes are audited and visible to the agent.",
    "zh-CN": "更新类别、严重程度或评论。变更会被记录并对 agent 可见。",
  },
  "editFinding.categoryLabel": { en: "Category", "zh-CN": "类别" },
  "editFinding.severityLabel": { en: "Severity", "zh-CN": "严重程度" },
  "editFinding.commentLabel": { en: "Comment", "zh-CN": "评论" },
  "editFinding.save": { en: "Save", "zh-CN": "保存" },
  "help.modal.title": { en: "Keyboard shortcuts", "zh-CN": "键盘快捷键" },
  "help.modal.intro": {
    en: "Quick reference for the most common shortcuts. Press ? or Esc to close.",
    "zh-CN": "最常用快捷键速查表。按 ? 或 Esc 关闭。",
  },
  "help.shortcut.nextFinding": {
    en: "Jump to next finding (Conversation tab)",
    "zh-CN": "跳到下一个审查项（对话标签）",
  },
  "help.shortcut.prevFinding": {
    en: "Jump to previous finding (Conversation tab)",
    "zh-CN": "跳到上一个审查项（对话标签）",
  },
  "help.shortcut.findInDiff": {
    en: "Find text inside the loaded diff",
    "zh-CN": "在加载的 diff 中查找文本",
  },
  "help.shortcut.findInDiffAlt": {
    en: "Find in diffs (alternative, no modifier)",
    "zh-CN": "在 diff 中查找（备用，无需修饰键）",
  },
  "help.shortcut.fileJump": {
    en: "Open the file quick-jump palette",
    "zh-CN": "打开文件快速跳转面板",
  },
  "help.shortcut.help": {
    en: "Open this help overlay",
    "zh-CN": "打开此帮助浮层",
  },
  "help.shortcut.submit": {
    en: "Submit finding (when comment is focused)",
    "zh-CN": "提交审查项（焦点在评论框时）",
  },
  "help.shortcut.close": {
    en: "Close any open modal, palette, or search bar",
    "zh-CN": "关闭任何已打开的浮层、面板或搜索栏",
  },
  "help.shortcut.tabFocus": {
    en: "Move focus inside forms (works in every input)",
    "zh-CN": "在表单内移动焦点（适用于所有输入框）",
  },
  "help.shortcut.helpAlt": {
    en: "Open this help overlay (alternative to Cmd+/)",
    "zh-CN": "打开此帮助浮层（Cmd+/ 的备用）",
  },
  "help.modal.close": { en: "Close", "zh-CN": "关闭" },
  "palette.cmdP.noResults": {
    en: 'No files match "{query}"',
    "zh-CN": '没有匹配 "{query}" 的文件',
  },
  "palette.cmdP.empty": { en: "No files available", "zh-CN": "没有可用文件" },
  "palette.fileJumper.ariaLabel": { en: "File jumper", "zh-CN": "文件跳转" },
  "palette.searchPanel.placeholder": { en: "Search panel…", "zh-CN": "搜索面板…" },
  "palette.searchPanel.ariaLabel": {
    en: "Search current panel",
    "zh-CN": "搜索当前面板",
  },
  "save.indicator.idle": { en: "All changes saved", "zh-CN": "所有更改已保存" },
  "commits.empty.noResults": {
    en: 'No commits match "{query}".',
    "zh-CN": '没有匹配 "{query}" 的提交。',
  },
  "commits.empty.empty": { en: "No commits in range.", "zh-CN": "当前范围内没有提交。" },
  "conversation.empty.noResults": {
    en: 'No findings match "{query}".',
    "zh-CN": '没有匹配 "{query}" 的审查项。',
  },
  "conversation.empty.noFindings": {
    en: "No findings yet.",
    "zh-CN": "暂无审查项。",
  },
  "savedReplies.empty": {
    en: "No saved replies yet — save your first one",
    "zh-CN": "暂无已保存回复 — 保存第一条试试",
  },
  "previously.empty": {
    en: "No prior discussion yet. Submit a round to start the history.",
    "zh-CN": "暂无历史讨论。提交一轮以开始记录历史。",
  },
  "export.modal.title": { en: "Export review", "zh-CN": "导出审查" },
  "export.modal.body": {
    en: "Choose a format. The file is generated client-side from the current round state.",
    "zh-CN": "选择一种格式。文件由当前轮状态在客户端生成。",
  },
  "export.card.md.title": { en: "Markdown summary (.md)", "zh-CN": "Markdown 摘要 (.md)" },
  "export.card.md.desc": {
    en: "Round summary + findings table + notes — paste into Notion / Slack / email.",
    "zh-CN": "本轮摘要 + 审查项表格 + 笔记——可粘贴到 Notion / Slack / 邮件。",
  },
  "export.card.patch.title": { en: "Patch file (.patch)", "zh-CN": "补丁文件 (.patch)" },
  "export.card.patch.desc": {
    en: "Unified diff with // REVIEW (<id>) annotations — attach to a bug report.",
    "zh-CN": "带 // REVIEW (<id>) 注释的统一差异——可附在 bug 报告中。",
  },
  "modal.reopenReason.placeholder": {
    en: "e.g., 'The previous fix removed the symptom but the root cause is still there'",
    "zh-CN": "例如：「上一次修复只消除了症状，但根本原因还在」",
  },
  "modal.resolveReason.placeholder": {
    en: "e.g., 'verified, the function is no longer called from the public path'",
    "zh-CN": "例如：「已验证，该函数不再从公共路径调用」",
  },
  "modal.wontfixReason.placeholder": {
    en: "Optional context (e.g. duplicate of F-002, see #123)",
    "zh-CN": "可选上下文（例如与 F-002 重复，参见 #123）",
  },
  "badge.edited.tooltip": {
    en: "Edited by user at {timestamp}",
    "zh-CN": "用户在 {timestamp} 编辑",
  },
  "badge.resolution.tooltip": {
    en: "Resolution: {kind}{reason}",
    "zh-CN": "解决方案: {kind}{reason}",
  },
  "settings.btn.ariaLabel": { en: "Settings", "zh-CN": "设置" },
  "fileComments.tooltip": {
    en: "File-level findings",
    "zh-CN": "文件级审查项",
  },
  "fileFinding.title": {
    en: "File-level findings",
    "zh-CN": "文件级审查项",
  },
  "toolbar.lang.toggle": { en: "EN | 中文", "zh-CN": "中文 | EN" },
  "toolbar.lang.ariaLabel": {
    en: "Switch interface language",
    "zh-CN": "切换界面语言",
  },
  "sidebar.files": { en: "Files changed", "zh-CN": "变更文件" },
  "sidebar.commits": { en: "Commits", "zh-CN": "提交" },
  "commits.toggle.ariaLabel": {
    en: "Toggle commit files",
    "zh-CN": "切换提交文件显示",
  },
  "sidebar.conversation": { en: "Conversation", "zh-CN": "会话" },
  "sidebar.previously": { en: "Previously discussed", "zh-CN": "历史讨论" },
  "sidebar.files.tooltip": { en: "Files changed", "zh-CN": "变更文件" },
  "sidebar.commits.tooltip": {
    en: "Commits in this review",
    "zh-CN": "本次审查中的提交",
  },
  "sidebar.conversation.tooltip": {
    en: "Conversation (all findings)",
    "zh-CN": "会话（所有审查项）",
  },
  "sidebar.previously.tooltip": {
    en: "Previously discussed (prior round notes + comment threads)",
    "zh-CN": "历史讨论（上一轮笔记 + 评论线程）",
  },
  "saveIndicator.title": { en: "Auto-save status", "zh-CN": "自动保存状态" },
  "toolbar.layout.unified.title": {
    en: "Unified diff (stacked)",
    "zh-CN": "合并 diff（堆叠）",
  },
  "toolbar.layout.split.title": {
    en: "Split diff (side-by-side)",
    "zh-CN": "分屏 diff（并排）",
  },
  "submitReview.title": {
    en: "Submit this review round (your round notes are above)",
    "zh-CN": "提交本轮审查（笔记在上方）",
  },
  "sidebar.mode.tree.title": { en: "Tree view", "zh-CN": "树状视图" },
  "sidebar.mode.flat.title": { en: "Flat list", "zh-CN": "平铺列表" },
  "conversation.sort.title": {
    en: "Sort findings in this Conversation panel",
    "zh-CN": "在对话面板中排序审查项",
  },
  "previously.filter.title": {
    en: "Filter previously-discussed by round",
    "zh-CN": "按轮次筛选历史讨论",
  },
  "previously.allRounds": { en: "All rounds", "zh-CN": "所有轮次" },
  "previously.notesLabel": {
    en: "Notes you sent to the agent",
    "zh-CN": "你发送给 agent 的笔记",
  },
  "previously.findingsHeader": {
    en: "Findings + comment threads",
    "zh-CN": "审查项 + 评论线程",
  },
  "conversation.filter.open.title": {
    en: "Show only unresolved",
    "zh-CN": "仅显示未解决",
  },
  "conversation.filter.resolved.title": {
    en: "Show only resolved",
    "zh-CN": "仅显示已解决",
  },
  "conversation.filter.all.title": {
    en: "Show all including resolved",
    "zh-CN": "显示全部（含已解决）",
  },
  "conversation.filter.pinned.title": {
    en: "Show only pinned findings",
    "zh-CN": "仅显示置顶审查项",
  },
  "conversation.filter.reacted.title": {
    en: "Show only reacted findings",
    "zh-CN": "仅显示有表情反应的审查项",
  },
  "sidebar.tree": { en: "Tree", "zh-CN": "树状" },
  "sidebar.flat": { en: "Flat", "zh-CN": "平铺" },
  "sidebar.reviewProgress": {
    en: "{count} / {total} reviewed ({percent}%)",
    "zh-CN": "已审查 {count} / {total} 个文件 ({percent}%)",
  },
  "sidebar.filter.unread": { en: "Show only unread", "zh-CN": "仅显示未审查" },
  "sidebar.bulkDelete": { en: "Mark selected as reviewed", "zh-CN": "标记已审查" },
  "sidebar.selected": { en: "Selected", "zh-CN": "已选" },
  "search.recent.title": { en: "Recent searches", "zh-CN": "最近搜索" },
  "search.recent.clear": { en: "Clear", "zh-CN": "清空" },
  "search.recent.clear.confirm": { en: "Recent searches cleared", "zh-CN": "最近搜索已清空" },
  "search.recent.select": { en: "Select", "zh-CN": "选择" },
  "search.recent.bulkDelete": { en: "Delete selected", "zh-CN": "删除选中" },
  "search.recent.delete": { en: "Delete from history", "zh-CN": "从历史中删除" },
  "search.recent.delete.confirm": { en: "Removed from history", "zh-CN": "已从历史中移除" },
  "search.diff.placeholder": {
    en: "Find in diffs (case-insensitive substring)",
    "zh-CN": "在 diff 中查找（不区分大小写子串）",
  },
  "search.diff.ariaLabel": { en: "Search diffs", "zh-CN": "搜索 diff" },
  "search.diff.previous": {
    en: "Previous match (Shift+Enter)",
    "zh-CN": "上一个匹配（Shift+Enter）",
  },
  "search.diff.next": { en: "Next match (Enter)", "zh-CN": "下一个匹配（Enter）" },
  "search.diff.close": { en: "Close (Escape)", "zh-CN": "关闭（Escape）" },
  "conversation.bulkDelete": { en: "Delete selected findings", "zh-CN": "删除选中的 finding" },
  "conversation.selected": { en: "Selected", "zh-CN": "已选" },
  "conversation.findings.selectAll.ariaLabel": {
    en: "Select all visible findings",
    "zh-CN": "选择所有可见审查项",
  },
  "finding.comment.placeholder": {
    en: "Add a comment (max 500 chars)",
    "zh-CN": "添加评论（最多 500 字符）",
  },
  "toolbar.settings": { en: "Settings", "zh-CN": "设置" },
  "settings.title": { en: "Settings", "zh-CN": "设置" },
  "settings.section.appearance": { en: "Appearance", "zh-CN": "外观" },
  "settings.section.layout": { en: "Layout", "zh-CN": "布局" },
  "settings.section.search": { en: "Search", "zh-CN": "搜索" },
  "settings.section.language": { en: "Language", "zh-CN": "语言" },
  "settings.theme.label": { en: "Theme", "zh-CN": "主题" },
  "settings.theme.light": { en: "Light", "zh-CN": "浅色" },
  "settings.theme.auto": { en: "Auto", "zh-CN": "自动" },
  "settings.theme.dark": { en: "Dark", "zh-CN": "深色" },
  "settings.layout.label": { en: "Layout", "zh-CN": "布局" },
  "settings.layout.unified": { en: "Unified", "zh-CN": "合并" },
  "settings.layout.split": { en: "Split", "zh-CN": "分屏" },
  "settings.search.history": { en: "Recent searches", "zh-CN": "最近搜索" },
  "settings.search.max": { en: "Max items", "zh-CN": "最多条数" },
  "settings.reset": { en: "Reset to defaults", "zh-CN": "恢复默认设置" },
  "settings.virtualization.label": { en: "Diff virtualization", "zh-CN": "Diff 虚拟化" },
  "settings.virtualization.description": {
    en: "Render only visible hunks for faster scrolling",
    "zh-CN": "仅渲染可见 hunk，加快滚动速度",
  },
  "save.idle": { en: "All changes saved", "zh-CN": "所有更改已保存" },
  "save.fresh": { en: "Saved {seconds}s ago", "zh-CN": "{seconds} 秒前已保存" },
  "status.copiedMarkdown": { en: "Copied as Markdown", "zh-CN": "已复制为 Markdown" },
  "status.copiedBranch": { en: "Copied branch: {name}", "zh-CN": "已复制分支: {name}" },
  "status.copyBranchBlocked": {
    en: "Could not copy branch name — clipboard blocked",
    "zh-CN": "复制分支名失败 — 剪贴板被阻止",
  },
  "status.copyBranchEmpty": {
    en: "No branch name to copy",
    "zh-CN": "没有可复制的分支名",
  },
  "status.copyBlocked": {
    en: "Could not copy markdown — clipboard blocked",
    "zh-CN": "复制失败 — 剪贴板被阻止",
  },
  "status.copyPermalinkBlocked": {
    en: "Could not copy permalink — clipboard blocked",
    "zh-CN": "复制定位链接失败 — 剪贴板被阻止",
  },
  "status.copiedPermalink": {
    en: "Copied permalink for {id}",
    "zh-CN": "已复制定位链接 {id}",
  },
  "status.findingAdded": { en: "Finding added", "zh-CN": "已添加审查项" },
  "status.submitted": {
    en: "Review submitted",
    "zh-CN": "审查已提交",
  },
  // R34 AC2: post-submit banner i18n (Round 4 user feedback — was
  // hardcoded English in app.ts:5591 + app.ts:5606-5607).
  "review.submitted.title": {
    en: "Review submitted{round}",
    "zh-CN": "审查已提交{round}",
  },
  "review.submitted.message": {
    en: "The findings are now in the OpenCode session. The plugin cannot close this tab for you (browsers only allow scripts to close tabs the script itself opened), so please close it manually with {shortcut} or the tab's close button.",
    "zh-CN":
      "审查结果已发送到 OpenCode 会话。插件无法自动关闭此标签页（浏览器只允许脚本关闭自己打开的标签页），请用 {shortcut} 或标签页的关闭按钮手动关闭。",
  },
  "status.submitFailed": {
    en: "Submit failed ({code})",
    "zh-CN": "提交失败 ({code})",
  },
  "status.noChanges": { en: "No changes to save", "zh-CN": "没有要保存的更改" },
  "status.selectLines": {
    en: "Select lines before adding a finding",
    "zh-CN": "请先选择代码行",
  },
  "status.commentRequired": {
    en: "Comment is required",
    "zh-CN": "评论内容不能为空",
  },
  "status.expandedAll": { en: "Expanded all files", "zh-CN": "已展开所有文件" },
  "status.collapsedAll": { en: "Collapsed all files", "zh-CN": "已折叠所有文件" },
  "skipLink": { en: "Skip to main content", "zh-CN": "跳到主要内容" },
  "modal.submit.title": { en: "Submit review?", "zh-CN": "提交审查?" },
  "modal.submit.confirm": { en: "Submit", "zh-CN": "提交" },
  "modal.resolve.title": { en: "Resolve Finding", "zh-CN": "解决审查项" },
  "modal.wontfix.title": { en: "Mark as wontfix", "zh-CN": "标记为不修复" },
  "modal.reopen.title": { en: "Force Reopen Finding", "zh-CN": "强制重新打开审查项" },
  "modal.cancel": { en: "Cancel", "zh-CN": "取消" },
  "action.undo": { en: "Undo", "zh-CN": "撤销" },
  "action.reopen": { en: "Re-open", "zh-CN": "重新打开" },
  "action.mark": { en: "Mark as wontfix", "zh-CN": "标记为不修复" },
  "action.remove": { en: "Remove", "zh-CN": "删除" },
  "action.resolve": { en: "Resolve", "zh-CN": "解决" },
  "action.edit": { en: "Edit", "zh-CN": "编辑" },
  "action.jump": { en: "Jump", "zh-CN": "跳转" },
  "action.copyLink": { en: "Copy link", "zh-CN": "复制链接" },
  "action.copyMarkdown": { en: "Copy as MD", "zh-CN": "复制为 Markdown" },
  "action.submitComment": { en: "Comment", "zh-CN": "评论" },
  "savedReplies.title": { en: "Saved Replies", "zh-CN": "已保存回复" },
  "drawer.selectionHint": {
    en: "Select lines in the diff to start.",
    "zh-CN": "在 diff 中选择代码行开始。",
  },
  "panel.expandAll": { en: "Expand all", "zh-CN": "全部展开" },
  "panel.collapseAll": { en: "Collapse all", "zh-CN": "全部折叠" },
  "diff.hunk.collapse": { en: "Collapse hunk", "zh-CN": "折叠 hunk" },
  "diff.hunk.expand": { en: "Expand hunk", "zh-CN": "展开 hunk" },
};

let currentLanguage: Lang = DEFAULT_LANGUAGE;
const subscribers = new Set<(lang: Lang) => void>();

/**
 * Apply a one-shot `{token}` replacement. Mirrors the pattern in the
 * existing app.ts (e.g. `Copied permalink for ${findingId}`).
 */
function fillTemplate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_m, name) =>
    params[name] === undefined ? `{${name}}` : String(params[name]),
  );
}

/**
 * Look up the localized string for `key` in `lang`. Falls back through
 * English → key itself. Accepts an optional `params` map for `{token}`
 * placeholders.
 */
export function translate(
  key: string,
  lang: Lang = currentLanguage,
  params?: Record<string, string | number>,
): string {
  const row = STRINGS[key];
  if (row) {
    const hit = row[lang] ?? row[DEFAULT_LANGUAGE] ?? key;
    return fillTemplate(hit, params);
  }
  return params?.placeholder !== undefined
    ? fillTemplate(`{placeholder}`, { placeholder: params.placeholder })
    : key;
}

/** Convenience wrapper: `t("foo")` reads the current language. */
export function t(key: string, params?: Record<string, string | number>): string {
  return translate(key, currentLanguage, params);
}

/** Read the persisted language from localStorage (browser-safe). */
export function getLanguage(): Lang {
  if (typeof localStorage === "undefined") return DEFAULT_LANGUAGE;
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY);
    if (raw && (SUPPORTED as readonly string[]).includes(raw)) return raw as Lang;
  } catch {
    /* ignore: private mode / quota */
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Switch the active language and persist it. Triggers every subscriber
 * registered via `onLanguageChange`, so the toolbar can re-render
 * labels without a page reload.
 */
export function setLanguage(lang: Lang): void {
  if (!SUPPORTED.includes(lang)) return;
  currentLanguage = lang;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }
  for (const cb of subscribers) cb(lang);
  applyUI();
}

/** Read-only accessor for code that wants to know the active language. */
export function peekLanguage(): Lang {
  return currentLanguage;
}

/** Subscribe to language changes; returns an unsubscribe function. */
export function onLanguageChange(cb: (lang: Lang) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

/**
 * Registry for UI elements whose visible text depends on the current language.
 * Each entry maps a stable key to a function that returns the localized text.
 * Registered callbacks are re-invoked on every `setLanguage` (and on the
 * initial `applyLanguage`), so callers do not need to subscribe manually.
 */
const uiTranslators = new Map<string, () => string>();

/**
 * Register a UI translator. The callback is invoked synchronously on the
 * current language, on every language change, and again when `applyUI()` is
 * called manually. Returns the unsubscribe function.
 *
 * Typical usage:
 *   registerUITranslator("toolbar.unified", () => t("toolbar.layout.unified"));
 */
export function registerUITranslator(key: string, fn: () => string): () => void {
  uiTranslators.set(key, fn);
  applyUITranslator(key, fn);
  return () => {
    if (uiTranslators.get(key) === fn) uiTranslators.delete(key);
  };
}

function applyUITranslator(key: string, fn: () => string): void {
  try {
    const text = fn();
    const targets = document.querySelectorAll<HTMLElement>(`[data-i18n="${CSS.escape(key)}"]`);
    for (const el of targets) el.textContent = text;
  } catch {
    // Element may not yet be in the DOM; setLanguage will re-render once it exists.
  }
}

/** Re-render every registered UI translator. Called on `setLanguage` and on demand. */
export function applyUI(): void {
  for (const [key, fn] of uiTranslators) applyUITranslator(key, fn);
}

/** Synchronously adopt the persisted language before any UI renders. */
export function applyLanguage(): Lang {
  currentLanguage = getLanguage();
  if (typeof document !== "undefined") applyUI();
  return currentLanguage;
}

export const __testonly = { SUPPORTED };
