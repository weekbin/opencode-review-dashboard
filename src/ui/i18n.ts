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
export const DEFAULT_LANGUAGE: Lang = "en";
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
  "toolbar.theme.light": { en: "Light", "zh-CN": "浅色" },
  "toolbar.theme.auto": { en: "Auto", "zh-CN": "自动" },
  "toolbar.theme.dark": { en: "Dark", "zh-CN": "深色" },
  "toolbar.review": { en: "Review", "zh-CN": "审查" },
  "toolbar.export": { en: "Export", "zh-CN": "导出" },
  "toolbar.submit": { en: "Submit Review", "zh-CN": "提交审查" },
  "toolbar.lang.toggle": { en: "EN | 中文", "zh-CN": "中文 | EN" },
  "toolbar.lang.ariaLabel": {
    en: "Switch interface language",
    "zh-CN": "切换界面语言",
  },
  "sidebar.files": { en: "Files changed", "zh-CN": "变更文件" },
  "sidebar.commits": { en: "Commits", "zh-CN": "提交" },
  "sidebar.conversation": { en: "Conversation", "zh-CN": "会话" },
  "sidebar.previously": { en: "Previously discussed", "zh-CN": "历史讨论" },
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
  "conversation.bulkDelete": { en: "Delete selected findings", "zh-CN": "删除选中的 finding" },
  "conversation.selected": { en: "Selected", "zh-CN": "已选" },
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
  "status.copyBlocked": {
    en: "Could not copy markdown — clipboard blocked",
    "zh-CN": "复制失败 — 剪贴板被阻止",
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
  skipLink: { en: "Skip to main content", "zh-CN": "跳到主要内容" },
  "modal.submit.title": { en: "Submit review?", "zh-CN": "提交审查?" },
  "modal.submit.confirm": { en: "Submit", "zh-CN": "提交" },
  "modal.resolve.title": { en: "Resolve Finding", "zh-CN": "解决审查项" },
  "modal.wontfix.title": { en: "Mark as wontfix", "zh-CN": "标记为不修复" },
  "modal.reopen.title": { en: "Force Reopen Finding", "zh-CN": "强制重新打开审查项" },
  "modal.cancel": { en: "Cancel", "zh-CN": "取消" },
  "action.undo": { en: "Undo", "zh-CN": "撤销" },
  "action.reopen": { en: "Re-open", "zh-CN": "重新打开" },
  "action.mark": { en: "Mark as wontfix", "zh-CN": "标记为不修复" },
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
