import { FileDiff, type DiffLineAnnotation } from "@pierre/diffs";

type Category = "bug" | "style" | "perf" | "question" | "recommend";
type Severity = "high" | "medium" | "low";
type Side = "additions" | "deletions";

type FindingComment = {
  id: string;
  author: "user" | "agent";
  text: string;
  created_at: number;
};

type Finding = {
  id: string;
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
  kind?: "line" | "file";
  status?: "open" | "closed_auto" | "resolved";
  round?: number;
  created_at?: number;
  comments?: FindingComment[];
};

type Draft = {
  notes: string;
  new_findings: Finding[];
};

type FileEntry = {
  path: string;
  status: "added" | "deleted" | "modified";
  additions: number;
  deletions: number;
  before: string;
  after: string;
};

type CommitInfo = {
  sha: string;
  short_sha: string;
  message: string;
  author: string;
  date: string;
  round?: number;
  files: string[];
};

type Launch = {
  id: string;
  session_id: string;
  repo_root: string;
  scope_root: string;
  round: number;
  files: FileEntry[];
  commits?: CommitInfo[];
  existing_findings: Finding[];
  draft: Draft;
  taxonomy: {
    categories: Category[];
    severities: Severity[];
  };
  filter?: string[];
  base?: string;
  auto_base?: string;
  auto_worktree?: string;
  auto_worktree_branch?: string;
  current_branch?: string;
  is_worktree?: boolean;
};

type Meta = {
  id: string;
  origin: "existing" | "new";
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
};

type View = {
  kind: "diff";
  instance: FileDiff<Meta>;
};

type ThemeMode = "light" | "dark" | "auto";
type DiffLayout = "unified" | "split";
type SidebarMode = "tree" | "flat";
const SIDEBAR_KEY = "diff-review:sidebar-mode";
const SIDEBAR_WIDTH_KEY = "diff-review:sidebar-width";
const THEME_KEY = "diff-review:theme-mode";
const LAYOUT_KEY = "diff-review:diff-layout";
const CONV_FILTER_KEY = "diff-review:conversation-filter";
const ACTIVE_TAB_KEY = "diff-review:active-tab";

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v && (allowed as readonly string[]).includes(v)) return v as T;
  } catch {
    // ignore — localStorage may be unavailable (private mode, etc.)
  }
  return fallback;
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

const FOLDER_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.5a1.5 1.5 0 0 1 1.06.44L8.69 3.5H13a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5z"/></svg>`;
const FILE_DEFAULT_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V6.06a1.5 1.5 0 0 0-.44-1.06L10.5 1.94A1.5 1.5 0 0 0 9.44 1.5z"/></svg>`;

const EXTENSION_ICON_OVERRIDES: Record<string, string> = {
  ts: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5zM2 2v12h12V2zM3.75 11h1.5V8.5h2V11h1.5V5h-1.5v2h-2V5h-1.5zm6.5 0h1.5V9.5L13 11h1.75L13 8.75 14.75 6.5H13l-1.25 1.5V5h-1.5z"/></svg>`,
  tsx: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5zM2 2v12h12V2zM3 11h1.5V8.5H6V11h1.5V5H6v2H4.5V5H3zm5 0h1.5V9.5L11 11h1.75L11 8.75 12.75 6.5H11l-1.5 1.5V5H8z"/></svg>`,
  js: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1h12v14H2zm1.5 1.5V13.5h9V2.5zM4.5 11c0 .8.5 1.5 1.5 1.5s1.5-.5 1.5-1.5V6H6v5c0 .3-.2.5-.5.5s-.5-.2-.5-.5H4c0 .3 0 0 0 0zm5.5 0c0 .8.5 1.5 1.5 1.5s1.5-.5 1.5-1.5c0-.7-.4-1.1-1.2-1.3l-.4-.1c-.4-.1-.4-.2-.4-.3 0-.2.1-.3.4-.3.3 0 .5.2.5.5h1c0-.8-.5-1.4-1.5-1.4S9.5 7.7 9.5 8.5c0 .7.4 1 1.2 1.2l.4.1c.3.1.4.2.4.3 0 .2-.2.3-.4.3-.3 0-.5-.2-.5-.5z"/></svg>`,
  jsx: FILE_DEFAULT_ICON_SVG,
  py: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 1h1a2.5 2.5 0 0 1 2.5 2.5V5H7.5A1.5 1.5 0 0 1 6 3.5 1.5 1.5 0 0 1 7.5 2zM4 4.5A2.5 2.5 0 0 1 6.5 2H8v.5A1.5 1.5 0 0 1 6.5 4H4.5zM2 6.5A2.5 2.5 0 0 1 4.5 4H8v-.5h.5A1.5 1.5 0 0 1 10 5v.5H6.5A2.5 2.5 0 0 1 4 8v.5h-.5A1.5 1.5 0 0 1 2 7zM12 9.5A2.5 2.5 0 0 1 9.5 12H8v.5A1.5 1.5 0 0 1 6.5 14h-.5A2.5 2.5 0 0 1 4 11.5V11h5.5A2.5 2.5 0 0 0 12 8.5V8h.5A1.5 1.5 0 0 1 14 9.5zM8 13a1.5 1.5 0 0 1-1.5 1.5H6.5z"/></svg>`,
  c: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM9 4l5 4-5 4z"/></svg>`,
  h: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM2 4h2v3h3V4h2v8H7V9H4v3H2zm9 4h2v-1h-1V6h1V5h-2z"/></svg>`,
  cpp: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM3 6h2v1h1V6h1v4H6V9H5v1H3zm6 0h2v1h1V6h1v4h-1V9h-1v1H9z"/></svg>`,
  hpp: FILE_DEFAULT_ICON_SVG,
  go: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h3v2H4v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
  rs: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2V9h4v1H3v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
  java: FILE_DEFAULT_ICON_SVG,
  rb: FILE_DEFAULT_ICON_SVG,
  sh: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5 5 5 0 0 1 3.5 1.5L9 6h4V2l-1.5 1.5A7 7 0 0 0 8 1zM5 6l3 2-3 2z"/></svg>`,
  json: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h7.5zM3 1.5A.5.5 0 0 0 2.5 2v12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V5H10a2 2 0 0 1-2-2V1.5zm6.5 4v.5c0 .8.7 1.5 1.5 1.5H11v.5h-1V7h1.5A1.5 1.5 0 0 0 13 5.5V5h-1.5a.5.5 0 0 1-.5-.5V4h-1v.5h1V6h-.5a.5.5 0 0 1-.5-.5z"/></svg>`,
  md: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 14V2H2v12zM3 3h10v10H3zm2 8h1V6.5l1 2.5L8 6.5V11h1V5H7.5L7 7.5 6.5 5H5zm5 0h2v-1h-1V6h1V5h-2z"/></svg>`,
  html: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm1.5 2h4l-.1 1.5H7.5L7.4 8h2.6L9.9 9.5 7.5 10.2 5.1 9.5 5 7.5h1.5l.1.7.9.3.9-.3.1-.7H6z"/></svg>`,
  css: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm.5 2h6l-.1 1H8.5L8.4 7H10l-.1 1H7.9L7.8 9.2l1.7.4 1.7-.4.1-1.2h-1l-.1.7-.7.2-.7-.2-.1-1.2h2.3L11 5.5H6z"/></svg>`,
  toml: FILE_DEFAULT_ICON_SVG,
  yaml: FILE_DEFAULT_ICON_SVG,
  yml: FILE_DEFAULT_ICON_SVG,
  lock: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zM6 5v2h4V5a2 2 0 1 0-4 0z"/></svg>`,
  log: FILE_DEFAULT_ICON_SVG,
  txt: FILE_DEFAULT_ICON_SVG,
};

function fileIcon(filename: string): string {
  const base = filename.split("/").pop() ?? filename;
  const lower = base.toLowerCase();
  if (EXTENSION_ICON_OVERRIDES[lower]) {
    return EXTENSION_ICON_OVERRIDES[lower]!;
  }
  const dot = base.lastIndexOf(".");
  const ext = dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
  return EXTENSION_ICON_OVERRIDES[ext] ?? FILE_DEFAULT_ICON_SVG;
}

const params = new URLSearchParams(location.search);
const token = params.get("token") || "";
const reviewID = location.pathname.split("/").filter(Boolean).at(-1) || "";

const fileListRoot = document.querySelector("#file-list") as HTMLDivElement;
const diffsRoot = document.querySelector("#diffs") as HTMLDivElement;
const findingsRoot = document.querySelector("#findings") as HTMLDivElement;
const categoryRoot = document.querySelector("#category") as HTMLSelectElement;
const severityRoot = document.querySelector("#severity") as HTMLSelectElement;
const commentRoot = document.querySelector("#comment") as HTMLTextAreaElement;
const notesRoot = document.querySelector("#notes") as HTMLTextAreaElement;
const selectionRoot = document.querySelector("#selection") as HTMLDivElement;
const scopeRoot = document.querySelector("#scope") as HTMLSpanElement;
const statusRoot = document.querySelector("#status") as HTMLDivElement;
const addButton = document.querySelector("#add") as HTMLButtonElement;
const clearButton = document.querySelector("#clear") as HTMLButtonElement;
const submitButton = document.querySelector("#submit") as HTMLButtonElement;
const drawerToggle = document.querySelector("#drawer-toggle") as HTMLButtonElement;
const drawer = document.querySelector("#drawer") as HTMLElement;
const drawerBackdrop = document.querySelector("#drawer-backdrop") as HTMLElement;
const drawerClose = document.querySelector("#drawer-close") as HTMLButtonElement;
const findingCount = document.querySelector("#finding-count") as HTMLSpanElement;
const themeToggle = document.querySelector("#theme-toggle") as HTMLDivElement;
const layoutToggle = document.querySelector("#layout-toggle") as HTMLDivElement;

const CHEVRON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.47 5.47a.75.75 0 0 1 1.06 0L8 7.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z"/></svg>`;
const FILE_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10.75 0c.199 0 .39.08.53.22l3.5 3.5c.14.14.22.331.22.53v9A2.75 2.75 0 0 1 12.25 16h-8.5A2.75 2.75 0 0 1 1 13.25V2.75A2.75 2.75 0 0 1 3.75 0zm-7 1.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V5h-1.25A2.25 2.25 0 0 1 10 2.75V1.5z"/></svg>`;
const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l3.5 3.5L13 5"/></svg>`;

const state = {
  data: undefined as Launch | undefined,
  existing: [] as Finding[],
  fresh: [] as Finding[],
  selection: undefined as
    | {
        file: string;
        side: Side;
        start_line: number;
        end_line: number;
      }
    | undefined,
  notes: "",
  timer: 0 as ReturnType<typeof setTimeout> | 0,
  collapsed: new Set<string>(),
  collapsedFolders: new Set<string>(),
  read: new Set<string>(),
  cards: new Map<string, HTMLElement>(),
  sidebarItems: new Map<string, HTMLButtonElement>(),
  views: new Map<string, View>(),
  themeMode: readStored<ThemeMode>(THEME_KEY, ["light", "dark", "auto"], "dark"),
  diffLayout: readStored<DiffLayout>(LAYOUT_KEY, ["unified", "split"], "split"),
  sidebarMode: readStored<SidebarMode>(SIDEBAR_KEY, ["tree", "flat"], "tree"),
  activeTab: readStored<"files" | "commits" | "conversation">(
    ACTIVE_TAB_KEY,
    ["files", "commits", "conversation"],
    "files",
  ),
  conversationFilter: readStored<"open" | "all">(CONV_FILTER_KEY, ["open", "all"], "open"),
  drawerOpen: false,
  pendingFileFinding: null as string | null,
};

function resolvedTheme(): "light" | "dark" {
  if (state.themeMode === "auto")
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return state.themeMode;
}

function pierreTheme() {
  return { dark: "pierre-dark", light: "pierre-light" } as const;
}

function pierreThemeType(): "dark" | "light" {
  return resolvedTheme();
}

function applyTheme() {
  const mode = state.themeMode;
  if (mode === "auto") {
    document.documentElement.style.removeProperty("color-scheme");
  } else {
    document.documentElement.style.colorScheme = mode;
  }
  for (const btn of themeToggle.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", btn.dataset.theme === mode ? "true" : "false");
  }
}

function setTheme(mode: ThemeMode) {
  state.themeMode = mode;
  applyTheme();
  writeStored(THEME_KEY, mode);
  renderDiffPanel();
}

themeToggle.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest("button");
  if (!btn) return;
  setTheme(btn.dataset.theme as ThemeMode);
});

// ── Layout toggle ──
function applyLayout() {
  for (const btn of layoutToggle.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", btn.dataset.layout === state.diffLayout ? "true" : "false");
  }
}

function setLayout(layout: DiffLayout) {
  if (state.diffLayout === layout) return;
  state.diffLayout = layout;
  applyLayout();
  writeStored(LAYOUT_KEY, layout);
  renderDiffPanel();
}

layoutToggle.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest("button");
  if (!btn) return;
  setLayout(btn.dataset.layout as DiffLayout);
});

// ── Sidebar mode toggle ──
const sidebarMode = document.querySelector("#sidebar-mode") as HTMLDivElement;

function applySidebarMode() {
  for (const btn of sidebarMode.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", btn.dataset.mode === state.sidebarMode ? "true" : "false");
  }
}
applySidebarMode();
applyConversationFilter();

function setSidebarMode(mode: SidebarMode) {
  if (state.sidebarMode === mode) return;
  state.sidebarMode = mode;
  applySidebarMode();
  writeStored(SIDEBAR_KEY, mode);
  renderActivePane();
}

sidebarMode.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest("button");
  if (!btn) return;
  setSidebarMode(btn.dataset.mode as SidebarMode);
});

const navbarTabs = document.querySelector("#navbar-tabs") as HTMLDivElement;

function applyActiveTab() {
  for (const btn of navbarTabs.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", btn.dataset.tab === state.activeTab ? "true" : "false");
  }
  for (const pane of document.querySelectorAll("[data-pane]")) {
    (pane as HTMLElement).hidden = (pane as HTMLElement).dataset.pane !== state.activeTab;
  }
}

function setActiveTab(tab: "files" | "commits" | "conversation") {
  if (state.activeTab === tab) {
    renderActivePane();
    return;
  }
  state.activeTab = tab;
  cancelSidebarDrag();
  if (state.drawerOpen) closeDrawer();
  applyActiveTab();
  writeStored(ACTIVE_TAB_KEY, tab);
  updateTabCounts();
  renderActivePane();
}

navbarTabs.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest("button");
  if (!btn) return;
  const tab = btn.dataset.tab as "files" | "commits" | "conversation" | undefined;
  if (tab) setActiveTab(tab);
});

function setConversationFilter(filter: "open" | "all") {
  if (state.conversationFilter === filter) return;
  state.conversationFilter = filter;
  writeStored(CONV_FILTER_KEY, filter);
  applyConversationFilter();
  applyActiveTab();
  renderActivePane();
}

function applyConversationFilter() {
  const root = document.querySelector("#conversation-filter");
  if (!root) return;
  for (const btn of root.querySelectorAll("button")) {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.filter === state.conversationFilter ? "true" : "false",
    );
  }
}

const conversationFilter = document.querySelector("#conversation-filter");
if (conversationFilter) {
  conversationFilter.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest("button");
    if (!btn) return;
    const filter = btn.dataset.filter as "open" | "all" | undefined;
    if (filter) setConversationFilter(filter);
  });
}

// ── Sidebar resize ──
const SIDEBAR_MIN = 160;
const SIDEBAR_MAX_RATIO = 0.8;
const sidebarEl = document.querySelector("#sidebar") as HTMLElement;
const sidebarResizer = document.querySelector("#sidebar-resizer") as HTMLDivElement;
let sidebarWidth = readSidebarWidth();

function readSidebarWidth(): number {
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= SIDEBAR_MIN) return n;
    }
  } catch {
    // ignore
  }
  return 400;
}

function clampSidebarWidth(value: number): number {
  const max = Math.max(SIDEBAR_MIN, Math.floor(window.innerWidth * SIDEBAR_MAX_RATIO));
  return Math.min(max, Math.max(SIDEBAR_MIN, value));
}

function applySidebarWidth(width: number): void {
  sidebarWidth = width;
  document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
}

applySidebarWidth(clampSidebarWidth(sidebarWidth));

function cancelSidebarDrag() {
  if (resizerDragging) {
    resizerDragging = false;
    sidebarResizer.classList.remove("dragging");
  }
  if (resizeRaf !== null) {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = null;
  }
}

let resizeRaf: number | null = null;
let resizerDragging = false;
let dragPreviewWidth = 0;
let activeScrollSpyFile: string | null = null;
let scrollSpyObserver: IntersectionObserver | null = null;

sidebarResizer.addEventListener("pointerdown", (event: PointerEvent) => {
  event.preventDefault();
  sidebarResizer.setPointerCapture(event.pointerId);
  sidebarResizer.setAttribute("data-dragging", "");
  resizerDragging = true;
  const startX = event.clientX;
  const startWidth = sidebarWidth;
  const body = document.body;
  const prevSelect = body.style.userSelect;
  const prevCursor = body.style.cursor;
  body.style.userSelect = "none";
  body.style.cursor = "col-resize";

  const onMove = (e: PointerEvent) => {
    const delta = e.clientX - startX;
    const target = clampSidebarWidth(startWidth + delta);
    dragPreviewWidth = target;
    sidebarEl.style.width = `${target}px`;
  };
  const onUp = (e: PointerEvent) => {
    sidebarResizer.releasePointerCapture(e.pointerId);
    sidebarResizer.removeAttribute("data-dragging");
    body.style.userSelect = prevSelect;
    body.style.cursor = prevCursor;
    sidebarResizer.removeEventListener("pointermove", onMove);
    sidebarResizer.removeEventListener("pointerup", onUp);
    sidebarResizer.removeEventListener("pointercancel", onUp);
    resizerDragging = false;
    sidebarEl.style.width = "";
    applySidebarWidth(dragPreviewWidth);
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    } catch {
      // ignore
    }
  };
  sidebarResizer.addEventListener("pointermove", onMove);
  sidebarResizer.addEventListener("pointerup", onUp);
  sidebarResizer.addEventListener("pointercancel", onUp);
});

sidebarResizer.addEventListener("keydown", (event: KeyboardEvent) => {
  const step = event.shiftKey ? 32 : 8;
  if (event.key === "ArrowLeft") {
    applySidebarWidth(clampSidebarWidth(sidebarWidth - step));
    event.preventDefault();
  } else if (event.key === "ArrowRight") {
    applySidebarWidth(clampSidebarWidth(sidebarWidth + step));
    event.preventDefault();
  } else if (event.key === "Home") {
    applySidebarWidth(SIDEBAR_MIN);
    event.preventDefault();
  } else if (event.key === "End") {
    applySidebarWidth(Math.floor(window.innerWidth * SIDEBAR_MAX_RATIO));
    event.preventDefault();
  } else {
    return;
  }
  try {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  } catch {
    // ignore
  }
});

window.addEventListener("resize", () => {
  applySidebarWidth(clampSidebarWidth(sidebarWidth));
});

// ── Drawer ──
function openDrawer() {
  state.drawerOpen = true;
  drawer.setAttribute("data-open", "");
  drawerBackdrop.setAttribute("data-open", "");
  drawerToggle.setAttribute("data-active", "");
}

function closeDrawer() {
  state.drawerOpen = false;
  drawer.removeAttribute("data-open");
  drawerBackdrop.removeAttribute("data-open");
  drawerToggle.removeAttribute("data-active");
  state.pendingFileFinding = null;
}

drawerToggle.addEventListener("click", () => {
  if (state.drawerOpen) {
    closeDrawer();
  } else {
    if (state.activeTab !== "files") setActiveTab("files");
    openDrawer();
  }
});
drawerBackdrop.addEventListener("click", closeDrawer);
drawerClose.addEventListener("click", closeDrawer);

// ── Helpers ──
function endpoint(suffix: string) {
  return `/api/review/${reviewID}${suffix}?token=${encodeURIComponent(token)}`;
}

function setStatus(text: string, error = false) {
  statusRoot.textContent = text;
  statusRoot.classList.toggle("error", error);
}

function side(input: unknown): Side {
  if (input === "deletions") return "deletions";
  return "additions";
}

function number(input: unknown) {
  const value = Number(input);
  if (!Number.isFinite(value)) return undefined;
  return Math.max(1, Math.floor(value));
}

function range(start: unknown, end: unknown) {
  const left = number(start);
  const right = number(end);
  if (left == null || right == null) return undefined;
  if (left <= right) return { start: left, end: right };
  return { start: right, end: left };
}

function byPath(file: string) {
  return state.data?.files.find((item) => item.path === file);
}

function all() {
  return [
    ...state.existing.map((item) => ({ ...item, origin: "existing" as const })),
    ...state.fresh.map((item) => ({ ...item, origin: "new" as const })),
  ];
}

function countFileLevelFindings(path: string): number {
  let n = 0;
  for (const item of state.fresh) if (item.file === path && item.kind === "file") n++;
  for (const item of state.existing) if (item.file === path && item.kind === "file") n++;
  return n;
}

function updateFindingCount() {
  const count = all().length;
  findingCount.textContent = String(count);
}

function updateTabCounts() {
  const filesEl = document.querySelector("#files-count") as HTMLElement | null;
  const commitsEl = document.querySelector("#commits-count") as HTMLElement | null;
  const convEl = document.querySelector("#conversation-count") as HTMLElement | null;

  const fileCount = state.data?.files.length ?? 0;
  const commitCount = state.data?.commits?.length ?? 0;
  const totalConv = all().length;

  if (filesEl) {
    filesEl.textContent = String(fileCount);
    filesEl.hidden = fileCount === 0;
  }
  if (commitsEl) {
    commitsEl.textContent = String(commitCount);
    commitsEl.hidden = commitCount === 0;
  }
  if (convEl) {
    convEl.textContent = String(totalConv);
    convEl.hidden = totalConv === 0;
  }
}

function diffAnnotations(file: string) {
  return all()
    .filter((item) => item.file === file && item.kind !== "file")
    .flatMap((item) => {
      const parsed = range(item.start_line, item.end_line);
      if (!parsed) return [];
      return [
        {
          side: side(item.side),
          lineNumber: parsed.start,
          metadata: {
            id: item.id,
            origin: item.origin,
            file,
            side: side(item.side),
            start_line: parsed.start,
            end_line: parsed.end,
            category: item.category,
            severity: item.severity,
            comment: item.comment,
          },
        } satisfies DiffLineAnnotation<Meta>,
      ];
    });
}

function selectionFor(file: string) {
  if (!state.selection || state.selection.file !== file) return null;
  const item = byPath(file);
  if (item?.status !== "modified") {
    return {
      start: state.selection.start_line,
      end: state.selection.end_line,
    };
  }

  return {
    start: state.selection.start_line,
    end: state.selection.end_line,
    side: state.selection.side,
    endSide: state.selection.side,
  };
}

function syncFile(file: string) {
  const view = state.views.get(file);
  if (!view) return;
  view.instance.setLineAnnotations(diffAnnotations(file));
  view.instance.rerender();
  view.instance.setSelectedLines(selectionFor(file));
}

function syncAll() {
  for (const file of state.views.keys()) {
    syncFile(file);
  }
}

function renderSelection() {
  if (!state.selection) {
    selectionRoot.textContent = "Select lines in the diff to start.";
    return;
  }

  selectionRoot.textContent = `${state.selection.file}:${state.selection.start_line}-${state.selection.end_line} (${state.selection.side})`;
}

function applyFileState(file: string) {
  const card = state.cards.get(file);
  const item = state.sidebarItems.get(file);
  const collapsed = state.collapsed.has(file);
  const marked = state.read.has(file);

  if (card) {
    card.toggleAttribute("data-collapsed", collapsed);
    card.toggleAttribute("data-read", marked);
    const cardBadge = card.querySelector(".card-reviewed") as HTMLElement | null;
    if (cardBadge) cardBadge.style.display = marked ? "" : "none";
  }

  if (item) {
    if (marked) item.setAttribute("data-read", "");
    else item.removeAttribute("data-read");
    const badge = item.querySelector(".sidebar-reviewed") as HTMLElement | null;
    if (badge) badge.style.display = marked ? "" : "none";
  }
}

function toggleCollapse(file: string) {
  if (state.collapsed.has(file)) state.collapsed.delete(file);
  else state.collapsed.add(file);
  applyFileState(file);
}

function toggleRead(file: string) {
  if (state.read.has(file)) {
    state.read.delete(file);
    applyFileState(file);
    return;
  }

  state.read.add(file);
  state.collapsed.add(file);
  applyFileState(file);
}

function renderAnnotation(annotation: DiffLineAnnotation<Meta>) {
  const metadata = annotation.metadata;
  if (!metadata) return undefined;

  const root = document.createElement("div");
  root.className = "diff-annotation";
  root.tabIndex = 0;

  const head = document.createElement("div");
  head.className = "diff-annotation-head";

  const severity = document.createElement("span");
  severity.className = `badge ${metadata.severity}`;
  severity.textContent = metadata.severity;

  const category = document.createElement("span");
  category.className = "badge";
  category.textContent = metadata.category;

  const kind = document.createElement("span");
  kind.className = "badge";
  kind.textContent = metadata.origin;

  head.appendChild(severity);
  head.appendChild(category);
  head.appendChild(kind);

  const body = document.createElement("div");
  body.className = "diff-annotation-body";
  body.textContent = metadata.comment;

  root.appendChild(head);
  root.appendChild(body);

  const focus = () => {
    jumpToFinding({
      file: metadata.file,
      side: metadata.side,
      start_line: metadata.start_line,
      end_line: metadata.end_line,
    });
  };

  root.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    focus();
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    focus();
  });

  return root;
}

function select(file: string, input: { start: unknown; end: unknown; side: unknown }) {
  const parsed = range(input.start, input.end);
  if (!parsed) return;

  state.selection = {
    file,
    side: side(input.side),
    start_line: parsed.start,
    end_line: parsed.end,
  };

  renderSelection();
  syncAll();
  if (!state.drawerOpen) openDrawer();
}

function createView(file: FileEntry, mount: HTMLElement) {
  const themeType = pierreThemeType();

  const instance = new FileDiff<Meta>({
    theme: pierreTheme(),
    themeType,
    diffStyle: state.diffLayout,
    overflow: "wrap",
    disableFileHeader: true,
    diffIndicators: "bars",
    expandUnchanged: false,
    collapsedContextThreshold: 3,
    expansionLineCount: 20,
    hunkSeparators: "line-info",
    enableLineSelection: true,
    onLineSelectionEnd: (value) => {
      if (!value) {
        state.selection = undefined;
        renderSelection();
        syncAll();
        return;
      }

      const fileEntry = byPath(file.path);
      const defaultSide = fileEntry?.status === "deleted" ? "deletions" : "additions";
      select(file.path, {
        start: value.start,
        end: value.end,
        side: value.side || value.endSide || defaultSide,
      });
    },
    onLineClick: (value) => {
      const fileEntry = byPath(file.path);
      const defaultSide = fileEntry?.status === "deleted" ? "deletions" : "additions";
      select(file.path, {
        start: value.lineNumber,
        end: value.lineNumber,
        side: value.annotationSide || defaultSide,
      });
    },
    renderAnnotation,
  });

  instance.render({
    oldFile: {
      name: file.path,
      contents: file.before || "",
    },
    newFile: {
      name: file.path,
      contents: file.after || "",
    },
    containerWrapper: mount,
    lineAnnotations: diffAnnotations(file.path),
  });

  return {
    kind: "diff" as const,
    instance,
  };
}

function createAddedFileView(file: FileEntry, mount: HTMLElement) {
  const themeType = pierreThemeType();
  const instance = new FileDiff<Meta>({
    theme: pierreTheme(),
    themeType,
    diffStyle: state.diffLayout,
    overflow: "wrap",
    disableFileHeader: true,
    diffIndicators: "bars",
    expandUnchanged: false,
    collapsedContextThreshold: 3,
    expansionLineCount: 20,
    hunkSeparators: "line-info",
    enableLineSelection: true,
    onLineSelectionEnd: (value) => {
      if (!value) {
        state.selection = undefined;
        renderSelection();
        syncAll();
        return;
      }
      select(file.path, {
        start: value.start,
        end: value.end,
        side: value.side || value.endSide || "additions",
      });
    },
    onLineClick: (value) => {
      select(file.path, {
        start: value.lineNumber,
        end: value.lineNumber,
        side: value.annotationSide || "additions",
      });
    },
    renderAnnotation,
  });

  instance.render({
    oldFile: { name: file.path, contents: "\n\n" },
    newFile: { name: file.path, contents: file.after || "" },
    containerWrapper: mount,
    lineAnnotations: diffAnnotations(file.path),
  });

  return { kind: "diff" as const, instance };
}

function createDeletedFileView(file: FileEntry, mount: HTMLElement) {
  const themeType = pierreThemeType();
  const instance = new FileDiff<Meta>({
    theme: pierreTheme(),
    themeType,
    diffStyle: state.diffLayout,
    overflow: "wrap",
    disableFileHeader: true,
    diffIndicators: "bars",
    expandUnchanged: false,
    collapsedContextThreshold: 3,
    expansionLineCount: 20,
    hunkSeparators: "line-info",
    enableLineSelection: true,
    onLineSelectionEnd: (value) => {
      if (!value) {
        state.selection = undefined;
        renderSelection();
        syncAll();
        return;
      }
      select(file.path, {
        start: value.start,
        end: value.end,
        side: value.side || value.endSide || "deletions",
      });
    },
    onLineClick: (value) => {
      select(file.path, {
        start: value.lineNumber,
        end: value.lineNumber,
        side: value.annotationSide || "deletions",
      });
    },
    renderAnnotation,
  });

  instance.render({
    oldFile: { name: file.path, contents: file.before || "" },
    newFile: { name: file.path, contents: "\n\n" },
    containerWrapper: mount,
    lineAnnotations: diffAnnotations(file.path),
  });

  return { kind: "diff" as const, instance };
}

function basename(path: string) {
  return path.split("/").pop() || path;
}

function typeIconSvg(path: string): string {
  return fileIcon(path);
}

function jumpToFile(filePath: string) {
  setActiveTab("files");
  state.collapsed.delete(filePath);
  applyFileState(filePath);
  const orderedIndex = getOrderedFiles().findIndex((f) => f.path === filePath);
  if (orderedIndex < 0) return;
  requestAnimationFrame(() => {
    document
      .querySelector(`#file-${orderedIndex}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

type TreeNode = {
  name: string;
  path: string;
  files: Map<string, FileEntry>;
  children: Map<string, TreeNode>;
};

function buildTree(files: FileEntry[]): TreeNode {
  const root: TreeNode = { name: "", path: "", files: new Map(), children: new Map() };
  for (const file of files) {
    const segments = file.path.split("/");
    const filename = segments.pop()!;
    let cursor = root;
    let acc = "";
    for (const segment of segments) {
      acc = acc ? `${acc}/${segment}` : segment;
      let next = cursor.children.get(segment);
      if (!next) {
        next = { name: segment, path: acc, files: new Map(), children: new Map() };
        cursor.children.set(segment, next);
      }
      cursor = next;
    }
    cursor.files.set(filename, file);
  }
  return root;
}

function makeSidebarItem(file: FileEntry, index: number, extraClass = ""): HTMLButtonElement {
  const item = document.createElement("button");
  item.type = "button";
  item.className = `sidebar-item ${extraClass}`.trim();
  if (state.read.has(file.path)) item.setAttribute("data-read", "");

  const dot = document.createElement("span");
  dot.className = `sidebar-dot ${file.status}`;

  const typeIcon = document.createElement("span");
  typeIcon.className = "sidebar-type-icon";
  typeIcon.innerHTML = fileIcon(file.path);
  typeIcon.setAttribute("aria-hidden", "true");

  const name = document.createElement("span");
  name.className = "sidebar-name";
  name.textContent = basename(file.path);
  name.title = file.path;

  const fileComments = document.createElement("span");
  fileComments.className = "sidebar-item-file-comments";
  fileComments.title = "File-level findings";
  const fileCount = countFileLevelFindings(file.path);
  fileComments.textContent = `📄 ${fileCount}`;
  if (fileCount === 0) fileComments.style.display = "none";

  const reviewed = document.createElement("span");
  reviewed.className = "sidebar-reviewed";
  reviewed.textContent = "✓ reviewed";
  if (!state.read.has(file.path)) reviewed.style.display = "none";

  const stats = document.createElement("span");
  stats.className = "sidebar-stats";
  const parts = [];
  if (file.additions) parts.push(`<span class="sa">+${file.additions}</span>`);
  if (file.deletions) parts.push(`<span class="sd">-${file.deletions}</span>`);
  stats.innerHTML = parts.join(" ");

  item.appendChild(dot);
  item.appendChild(typeIcon);
  item.appendChild(name);
  item.appendChild(fileComments);
  item.appendChild(reviewed);
  item.appendChild(stats);

  item.addEventListener("click", () => {
    state.collapsed.delete(file.path);
    applyFileState(file.path);
    const orderedIndex = getOrderedFiles().findIndex((f) => f.path === file.path);
    const targetIndex = orderedIndex >= 0 ? orderedIndex : index;
    document
      .querySelector(`#file-${targetIndex}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return item;
}

function renderFlatSidebar(files: FileEntry[]) {
  for (const [index, file] of files.entries()) {
    const item = makeSidebarItem(file, index);
    fileListRoot.appendChild(item);
    state.sidebarItems.set(file.path, item);
  }
}

function renderTreeSidebar(root: TreeNode) {
  const renderNode = (node: TreeNode, depth: number, container: HTMLElement) => {
    const sortedChildren = [...node.children.values()].sort((a, b) => a.path.localeCompare(b.path));
    for (const child of sortedChildren) {
      const folder = document.createElement("div");
      folder.className = "sidebar-folder";
      folder.dataset.depth = String(depth);
      const collapsed = state.collapsedFolders.has(child.path);
      if (collapsed) folder.dataset.collapsed = "";

      const chevron = document.createElement("span");
      chevron.className = "folder-chevron";
      const folderIcon = document.createElement("span");
      folderIcon.className = "folder-icon";
      folderIcon.innerHTML = FOLDER_ICON_SVG;
      const folderName = document.createElement("span");
      folderName.className = "folder-name";
      folderName.textContent = child.name;
      folderName.title = child.path;
      const fileCount = document.createElement("span");
      fileCount.className = "folder-count";
      const directCount = child.files.size;
      const totalCount = countFiles(child);
      fileCount.textContent =
        directCount === totalCount ? String(totalCount) : `${directCount} / ${totalCount}`;

      folder.appendChild(chevron);
      folder.appendChild(folderIcon);
      folder.appendChild(folderName);
      folder.appendChild(fileCount);
      folder.addEventListener("click", () => {
        // Toggle the attribute directly on the DOM. This avoids the
        // full re-render that was destroying + rebuilding the entire
        // diff panel on every chevron click — for 30+ files that was
        // visibly laggy. Now collapse is a CSS-only operation.
        const isCollapsed = folder.hasAttribute("data-collapsed");
        if (isCollapsed) {
          folder.removeAttribute("data-collapsed");
          state.collapsedFolders.delete(child.path);
        } else {
          folder.setAttribute("data-collapsed", "");
          state.collapsedFolders.add(child.path);
        }
        if (childrenContainer) childrenContainer.style.display = isCollapsed ? "" : "none";
      });
      container.appendChild(folder);

      const childrenContainer = document.createElement("div");
      childrenContainer.className = "sidebar-folder-children";
      childrenContainer.style.setProperty("--depth", String(depth));
      for (const [, file] of [...child.files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const index = state.data?.files.findIndex((f) => f.path === file.path) ?? -1;
        const item = makeSidebarItem(file, index, "tree");
        childrenContainer.appendChild(item);
        state.sidebarItems.set(file.path, item);
      }
      if (collapsed) childrenContainer.style.display = "none";
      renderNode(child, depth + 1, childrenContainer);
      container.appendChild(childrenContainer);
    }
  };
  renderNode(root, 0, fileListRoot);

  for (const [, file] of [...root.files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const index = state.data?.files.findIndex((f) => f.path === file.path) ?? -1;
    const item = makeSidebarItem(file, index, "tree");
    fileListRoot.appendChild(item);
    state.sidebarItems.set(file.path, item);
  }
}

function getOrderedFiles(): FileEntry[] {
  const all = state.data?.files ?? [];
  return depthFirstOrder(all);
}

function depthFirstOrder(files: FileEntry[]): FileEntry[] {
  const byPath = new Map<string, FileEntry>();
  for (const f of files) byPath.set(f.path, f);
  const childrenOf = (dir: string): FileEntry[] => {
    const prefix = dir ? `${dir}/` : "";
    return files
      .filter((f) => f.path.startsWith(prefix) && f.path.slice(prefix.length).indexOf("/") === -1)
      .sort((a, b) => a.path.localeCompare(b.path));
  };
  const dirsOf = (dir: string): string[] => {
    const prefix = dir ? `${dir}/` : "";
    const out = new Set<string>();
    for (const f of files) {
      const rest = f.path.startsWith(prefix) ? f.path.slice(prefix.length) : null;
      if (rest && rest.indexOf("/") >= 0) {
        const head = rest.split("/")[0];
        out.add(`${prefix}${head}`);
      }
    }
    return [...out].sort((a, b) => a.localeCompare(b));
  };

  const result: FileEntry[] = [];
  const visit = (dir: string) => {
    for (const f of childrenOf(dir)) {
      if (byPath.has(f.path)) {
        result.push(f);
        byPath.delete(f.path);
      }
    }
    for (const sub of dirsOf(dir)) visit(sub);
  };
  visit("");
  return result;
}

function countFiles(node: TreeNode): number {
  let n = node.files.size;
  for (const child of node.children.values()) n += countFiles(child);
  return n;
}

function renderActivePane() {
  if (state.activeTab === "files") {
    renderFilesPane();
    setupScrollSpy();
  } else {
    teardownScrollSpy();
  }
  if (state.activeTab === "commits") {
    renderCommitsPane();
  } else if (state.activeTab === "conversation") {
    renderConversationPane();
  }
  updateTabCounts();
}

function setupScrollSpy() {
  teardownScrollSpy();
  activeScrollSpyFile = null;
  scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      let bestEntry: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
          bestEntry = entry;
        }
      }
      if (!bestEntry) return;
      const file = (bestEntry.target as HTMLElement).dataset.file;
      if (!file || file === activeScrollSpyFile) return;
      setActiveFileInSidebar(file);
    },
    {
      // Trigger band between 30% and 50% from the top: when a card's
      // top crosses this band, it becomes the active sidebar item.
      rootMargin: "-30% 0px -50% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  );
  for (const card of diffsRoot.querySelectorAll<HTMLElement>(".card[data-file]")) {
    scrollSpyObserver.observe(card);
  }
}

function teardownScrollSpy() {
  if (scrollSpyObserver) {
    scrollSpyObserver.disconnect();
    scrollSpyObserver = null;
  }
}

function setActiveFileInSidebar(file: string) {
  activeScrollSpyFile = file;
  for (const [path, item] of state.sidebarItems) {
    if (path === file) item.setAttribute("data-active", "");
    else item.removeAttribute("data-active");
  }
}

function renderFilesPane() {
  fileListRoot.innerHTML = "";
  state.sidebarItems.clear();

  const files = getOrderedFiles();
  if (state.sidebarMode === "tree") {
    renderTreeSidebar(buildTree(files));
  } else {
    renderFlatSidebar(files);
  }
}

function renderCommitsPane() {
  const commitsListRoot = document.querySelector("#commits-list") as HTMLDivElement;
  commitsListRoot.innerHTML = "";
  renderCommitsPanel(commitsListRoot);
}

function renderConversationPane() {
  const conversationListRoot = document.querySelector("#conversation-list") as HTMLDivElement;
  conversationListRoot.innerHTML = "";
  renderConversationPanel(conversationListRoot);
}

function renderCommitsPanel(root: HTMLElement) {
  const commits = state.data?.commits ?? [];
  if (commits.length === 0) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    empty.textContent = "No commits in range.";
    root.appendChild(empty);
    return;
  }
  for (const commit of commits) {
    const card = document.createElement("div");
    card.className = "commit-card";

    const head = document.createElement("div");
    head.className = "commit-card-head";

    const title = document.createElement("div");
    title.className = "commit-card-title";

    const msg = document.createElement("div");
    msg.className = "commit-card-msg";
    msg.textContent = commit.message;

    const roundBadge = document.createElement("span");
    roundBadge.className = "navbar-count";
    roundBadge.textContent = commit.round != null ? `Round ${commit.round}` : "";

    title.appendChild(msg);
    if (commit.round != null) title.appendChild(roundBadge);

    const meta = document.createElement("div");
    meta.className = "commit-card-meta";

    const sha = document.createElement("span");
    sha.className = "commit-sha";
    sha.textContent = commit.short_sha;
    sha.title = `Click to copy full SHA\n${commit.sha}`;
    sha.addEventListener("click", (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(commit.sha).catch(() => undefined);
      setStatus(`Copied ${commit.short_sha}`);
    });

    const author = document.createElement("span");
    author.textContent = commit.author;

    const date = document.createElement("span");
    date.textContent = commit.date;

    meta.appendChild(sha);
    meta.appendChild(author);
    meta.appendChild(date);

    head.appendChild(title);
    head.appendChild(meta);

    const filesContainer = document.createElement("div");
    filesContainer.className = "commit-card-files";
    for (const filePath of commit.files) {
      const fileEntry = state.data?.files.find((f) => f.path === filePath);
      if (!fileEntry) continue;
      const row = document.createElement("div");
      row.className = "commit-file-row";
      row.title = `Jump to ${filePath} in Files tab`;

      const fileIcon = document.createElement("span");
      fileIcon.className = "sidebar-type-icon";
      fileIcon.innerHTML = typeIconSvg(filePath);
      fileIcon.setAttribute("aria-hidden", "true");

      const name = document.createElement("span");
      name.className = "commit-file-name";
      name.textContent = filePath;
      name.title = filePath;

      const stats = document.createElement("span");
      stats.className = "commit-file-stats";
      if (fileEntry.additions) {
        const a = document.createElement("span");
        a.className = "sa";
        a.textContent = `+${fileEntry.additions}`;
        stats.appendChild(a);
      }
      if (fileEntry.deletions) {
        const d = document.createElement("span");
        d.className = "sd";
        d.textContent = `-${fileEntry.deletions}`;
        stats.appendChild(d);
      }

      const jump = document.createElement("span");
      jump.className = "commit-file-jump";
      jump.textContent = "Jump";

      row.appendChild(fileIcon);
      row.appendChild(name);
      row.appendChild(stats);
      row.appendChild(jump);
      row.addEventListener("click", () => {
        jumpToFile(filePath);
      });
      filesContainer.appendChild(row);
    }
    head.addEventListener("click", () => {
      const isCollapsed = filesContainer.hasAttribute("data-collapsed");
      if (isCollapsed) filesContainer.removeAttribute("data-collapsed");
      else filesContainer.setAttribute("data-collapsed", "");
    });

    card.appendChild(head);
    card.appendChild(filesContainer);
    root.appendChild(card);
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ConversationEntry = {
  id: string;
  round: number;
  file: string;
  start_line: number;
  end_line: number;
  category: string;
  severity: string;
  comment: string;
  status: string;
  kind?: string;
  origin: "existing" | "new";
  created_at: number;
  comments?: FindingComment[];
};

function formatRelativeTime(ts: number): string {
  if (!ts) return "";
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function renderConversationPanel(root: HTMLElement) {
  const entries: ConversationEntry[] = [
    ...state.existing.map((item) => ({
      ...item,
      origin: "existing" as const,
      round: item.round ?? 0,
      status: item.status ?? ("open" as const),
      created_at: item.created_at ?? 0,
    })),
    ...state.fresh.map((item, index) => ({
      id: item.id,
      round: 0,
      file: item.file,
      start_line: item.start_line,
      end_line: item.end_line,
      category: item.category,
      severity: item.severity,
      comment: item.comment,
      status: "open" as const,
      kind: item.kind ?? "line",
      origin: "new" as const,
      created_at: Date.now() + index,
      comments: item.comments,
    })),
  ];

  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    empty.textContent = "No findings yet.";
    root.appendChild(empty);
    return;
  }

  const filtered =
    state.conversationFilter === "open"
      ? entries.filter((e) => e.status === "open" || e.status === "closed_auto")
      : entries;
  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    empty.textContent =
      state.conversationFilter === "open" ? "No unresolved findings." : "No findings found.";
    root.appendChild(empty);
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    if (a.round !== b.round) return b.round - a.round;
    return a.created_at - b.created_at;
  });

  for (const entry of sorted) {
    const item = document.createElement("div");
    item.className = "conversation-item";
    item.dataset.status = entry.status;
    item.dataset.origin = entry.origin;

    const head = document.createElement("div");
    head.className = "conversation-head";

    const headLeft = document.createElement("div");
    headLeft.className = "conversation-head-left";

    const fileLabel = document.createElement("span");
    fileLabel.className = "conversation-file";
    const loc =
      entry.kind === "file"
        ? entry.file
        : entry.start_line === entry.end_line
          ? `${entry.file}:${entry.start_line}`
          : `${entry.file}:${entry.start_line}-${entry.end_line}`;
    fileLabel.textContent = loc;
    fileLabel.title = loc;
    fileLabel.addEventListener("click", (event) => {
      event.stopPropagation();
      jumpToFile(entry.file);
      requestAnimationFrame(() => {
        if (entry.start_line) flashLine(entry.file, entry.start_line, entry.end_line);
      });
    });
    headLeft.appendChild(fileLabel);

    const statusBadge = document.createElement("span");
    statusBadge.className = "conversation-status";
    statusBadge.dataset.status = entry.status;
    statusBadge.textContent = entry.status === "closed_auto" ? "stale" : entry.status;
    headLeft.appendChild(statusBadge);

    head.appendChild(headLeft);

    const actions = document.createElement("div");
    actions.className = "conversation-actions";

    const isFresh = entry.origin === "new";
    const isOpen = entry.status === "open";
    const isStale = entry.status === "closed_auto";
    const isResolved = entry.status === "resolved";

    if (isFresh) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "primary";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        state.fresh = state.fresh.filter((item) => item.id !== entry.id);
        renderConversationPane();
        renderFindings();
        syncAll();
        scheduleSave();
      });
      actions.appendChild(removeBtn);
    } else if (isOpen) {
      const resolveBtn = document.createElement("button");
      resolveBtn.className = "primary";
      resolveBtn.textContent = "Resolve";
      resolveBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        resolveFinding(entry.id);
      });
      actions.appendChild(resolveBtn);
    } else if (isResolved && !isStale) {
      const reopenBtn = document.createElement("button");
      reopenBtn.className = "primary";
      reopenBtn.textContent = "Reopen";
      reopenBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        reopenFinding(entry.id);
      });
      actions.appendChild(reopenBtn);
    }

    const jumpBtn = document.createElement("button");
    jumpBtn.textContent = "Jump";
    jumpBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      jumpToFile(entry.file);
      requestAnimationFrame(() => {
        if (entry.start_line) flashLine(entry.file, entry.start_line, entry.end_line);
      });
    });
    actions.appendChild(jumpBtn);
    head.appendChild(actions);
    item.appendChild(head);

    const subhead = document.createElement("div");
    subhead.className = "conversation-subhead";

    const subheadLeft = document.createElement("div");
    subheadLeft.className = "conversation-subhead-left";
    if (entry.origin === "new") {
      const newBadge = document.createElement("span");
      newBadge.className = "badge-new";
      newBadge.textContent = "new";
      subheadLeft.appendChild(newBadge);
    } else {
      const round = document.createElement("span");
      round.textContent = `Round ${entry.round}`;
      subheadLeft.appendChild(round);
    }
    if (entry.created_at) {
      const time = document.createElement("span");
      time.textContent = `· ${formatRelativeTime(entry.created_at)}`;
      subheadLeft.appendChild(time);
    }
    subhead.appendChild(subheadLeft);

    const badgesRow = document.createElement("div");
    badgesRow.className = "finding-badges";
    badgesRow.innerHTML = [
      `<span class="badge ${entry.severity}">${escapeHtml(entry.severity)}</span>`,
      `<span class="badge">${escapeHtml(entry.category)}</span>`,
      `<span class="badge">${escapeHtml(entry.kind ?? "line")}</span>`,
    ].join("");
    subhead.appendChild(badgesRow);
    item.appendChild(subhead);

    const body = document.createElement("div");
    body.className = "conversation-body";
    body.textContent = entry.comment;
    item.appendChild(body);

    const commentsRoot = document.createElement("div");
    commentsRoot.className = "conversation-comments";

    if (entry.comments?.length) {
      for (const comment of entry.comments) {
        const commentEl = document.createElement("div");
        commentEl.className = "conversation-comment";
        const meta = document.createElement("div");
        meta.className = "conversation-comment-meta";
        meta.textContent = `${comment.author === "agent" ? "🤖 Agent" : "🧑 You"} · ${formatRelativeTime(comment.created_at)}`;
        commentEl.appendChild(meta);
        const text = document.createElement("div");
        text.className = "conversation-comment-text";
        text.textContent = comment.text;
        commentEl.appendChild(text);
        commentsRoot.appendChild(commentEl);
      }
    }

    const inputRow = document.createElement("div");
    inputRow.className = "conversation-comment-input-row";
    const textarea = document.createElement("textarea");
    textarea.className = "conversation-comment-input";
    textarea.placeholder = "Add a comment (max 500 chars)";
    textarea.maxLength = 500;
    textarea.rows = 2;
    const counter = document.createElement("span");
    counter.className = "conversation-comment-counter";
    counter.textContent = "0/500";
    textarea.addEventListener("input", () => {
      counter.textContent = `${textarea.value.length}/500`;
    });
    const submitBtn = document.createElement("button");
    submitBtn.className = "primary";
    submitBtn.textContent = "Comment";
    submitBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const text = textarea.value.trim();
      if (!text) return;
      submitBtn.disabled = true;
      addComment(entry.id, text).finally(() => {
        submitBtn.disabled = false;
      });
    });
    inputRow.appendChild(textarea);
    inputRow.appendChild(counter);
    inputRow.appendChild(submitBtn);
    commentsRoot.appendChild(inputRow);
    item.appendChild(commentsRoot);

    root.appendChild(item);
  }
}

function renderDiffPanel() {
  for (const view of state.views.values()) {
    view.instance.cleanUp();
  }
  diffsRoot.innerHTML = "";
  state.views.clear();
  state.cards.clear();

  const files = getOrderedFiles();
  for (const [index, file] of files.entries()) {
    // ── Card ──
    const card = document.createElement("section");
    card.className = "card";
    card.id = `file-${index}`;
    card.dataset.file = file.path;

    // ── Card header (always visible) ──
    const header = document.createElement("div");
    header.className = "card-header";
    header.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("button, .file-comments-badge")) return;
      toggleCollapse(file.path);
    });

    const chevron = document.createElement("span");
    chevron.className = "card-chevron";
    chevron.innerHTML = CHEVRON_SVG;

    const icon = document.createElement("span");
    icon.className = "card-file-icon";
    icon.innerHTML = FILE_ICON_SVG;

    const filename = document.createElement("span");
    filename.className = "card-filename";
    filename.textContent = file.path;

    const cardReviewed = document.createElement("span");
    cardReviewed.className = "card-reviewed";
    cardReviewed.textContent = "✓ reviewed";
    if (!state.read.has(file.path)) cardReviewed.style.display = "none";

    const meta = document.createElement("span");
    meta.className = "card-meta";

    const statusBadge = document.createElement("span");
    statusBadge.className = `card-status ${file.status}`;
    statusBadge.textContent = file.status;

    const addStat = document.createElement("span");
    addStat.className = "stat-add";
    addStat.textContent = `+${file.additions}`;

    const delStat = document.createElement("span");
    delStat.className = "stat-del";
    delStat.textContent = `-${file.deletions}`;

    meta.appendChild(statusBadge);
    meta.appendChild(addStat);
    meta.appendChild(delStat);

    const actions = document.createElement("span");
    actions.className = "card-actions";

    const fileCommentsBadge = document.createElement("span");
    fileCommentsBadge.className = "file-comments-badge";
    fileCommentsBadge.dataset.file = file.path;
    fileCommentsBadge.title = "File-level findings";
    const fileLevelCount = countFileLevelFindings(file.path);
    fileCommentsBadge.textContent = `📄 ${fileLevelCount}`;
    fileCommentsBadge.style.display = fileLevelCount === 0 ? "none" : "";

    const addFileBtn = document.createElement("button");
    addFileBtn.type = "button";
    addFileBtn.className = "btn-icon";
    addFileBtn.title = "Add file-level finding";
    addFileBtn.dataset.action = "add-file-finding";
    addFileBtn.dataset.file = file.path;
    addFileBtn.textContent = "+";

    const readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "btn-icon";
    readBtn.title = "Mark as read";
    readBtn.innerHTML = CHECK_SVG;
    readBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleRead(file.path);
      readBtn.toggleAttribute("data-active", state.read.has(file.path));
    });

    actions.appendChild(fileCommentsBadge);
    actions.appendChild(addFileBtn);
    actions.appendChild(readBtn);

    header.appendChild(chevron);
    header.appendChild(icon);
    header.appendChild(filename);
    header.appendChild(cardReviewed);
    header.appendChild(meta);
    header.appendChild(actions);

    // ── Card body ──
    const body = document.createElement("div");
    body.className = "card-body";

    const mount = document.createElement("div");
    body.appendChild(mount);

    card.appendChild(body);
    card.appendChild(header);
    diffsRoot.appendChild(card);

    state.cards.set(file.path, card);

    if (file.status === "deleted") state.collapsed.add(file.path);

    applyFileState(file.path);

    let view: View;
    if (file.status === "added") {
      view = createAddedFileView(file, mount);
    } else if (file.status === "deleted") {
      view = createDeletedFileView(file, mount);
    } else {
      view = createView(file, mount);
    }
    state.views.set(file.path, view);
    syncFile(file.path);
  }
}

async function resolveFinding(id: string) {
  const response = await fetch(endpoint("/resolve"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ finding_id: id }),
  }).catch(() => undefined);

  if (!response?.ok) {
    setStatus("Failed to resolve finding", true);
    return;
  }

  state.existing = state.existing.filter((item) => item.id !== id);
  renderFindings();
  renderConversationPane();
  syncAll();
  setStatus("Finding resolved");
}

async function reopenFinding(id: string) {
  const response = await fetch(endpoint("/reopen"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ finding_id: id }),
  }).catch(() => undefined);

  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Cannot reopen (code may have changed)", true);
    return;
  }

  const item = state.existing.find((f) => f.id === id);
  if (item) {
    item.status = "open";
  }
  renderFindings();
  renderConversationPane();
  syncAll();
  setStatus("Finding reopened");
}

async function addComment(id: string, text: string) {
  if (!text.trim()) return;
  if (text.length > 500) {
    setStatus("Comment exceeds 500 characters", true);
    return;
  }
  const response = await fetch(endpoint("/comment"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ finding_id: id, text }),
  }).catch(() => undefined);

  if (!response?.ok) {
    setStatus("Failed to add comment", true);
    return;
  }

  const data = (await response.json().catch(() => undefined)) as
    | { ok: true; comment: FindingComment }
    | undefined;
  if (!data?.ok || !data.comment) return;

  const existing = state.existing.find((item) => item.id === id);
  if (existing) {
    existing.comments = existing.comments ?? [];
    existing.comments.push(data.comment);
  } else {
    const fresh = state.fresh.find((item) => item.id === id);
    if (fresh) {
      fresh.comments = fresh.comments ?? [];
      fresh.comments.push(data.comment);
    }
  }
  renderConversationPane();
  setStatus("Comment added");
}

function flashLine(filePath: string, startLine: number, endLine: number) {
  const file = state.data?.files.find((f) => f.path === filePath);
  if (!file) return;
  const view = state.views.get(filePath);
  if (!view) return;
  // Use the view's internal rendering to find the line element. The @pierre/diffs
  // library exposes a `getHoveredLine` and a rendered DOM; we look for the
  // closest line container by line number.
  const cards = diffsRoot.querySelectorAll<HTMLElement>(".card");
  for (const card of cards) {
    const lines = card.querySelectorAll<HTMLElement>("[data-line-number]");
    for (const el of lines) {
      const ln = Number(el.dataset.lineNumber);
      if (ln >= startLine && ln <= endLine) {
        el.classList.add("jump-highlight");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.classList.remove("jump-highlight"), 2100);
        return;
      }
    }
  }
}

function renderFindings() {
  const items = all();
  findingsRoot.innerHTML = "";
  updateFindingCount();
  updateTabCounts();
  updateFileCommentsBadges();

  if (items.length === 0) {
    findingsRoot.textContent = "No findings yet.";
    setStatus("");
    return;
  }

  setStatus(`${state.fresh.length} new finding${state.fresh.length === 1 ? "" : "s"} ready`);

  for (const item of items) {
    const box = document.createElement("div");
    box.className = `finding ${item.kind === "file" ? "file-level" : "line-level"}`;
    box.dataset.focusFile = item.file;
    box.dataset.focusSide = item.side;
    box.dataset.focusStart = String(item.start_line);
    box.dataset.focusEnd = String(item.end_line);

    const head = document.createElement("div");
    head.className = "finding-head";

    const badges = document.createElement("div");
    badges.className = "finding-badges";
    badges.innerHTML = [
      `<span class="badge ${item.severity}">${item.severity}</span>`,
      `<span class="badge">${item.category}</span>`,
      `<span class="badge">${item.kind === "file" ? "file" : "line"}</span>`,
    ].join("");
    head.appendChild(badges);

    const actions = document.createElement("div");
    actions.className = "finding-actions";

    if (item.origin === "existing") {
      const resolve = document.createElement("button");
      resolve.className = "btn-resolve";
      resolve.type = "button";
      resolve.textContent = "Resolve";
      resolve.dataset.resolve = item.id;
      actions.appendChild(resolve);
    }

    if (item.origin === "new") {
      const remove = document.createElement("button");
      remove.className = "btn-remove";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.dataset.remove = item.id;
      actions.appendChild(remove);
    }

    head.appendChild(actions);

    const body = document.createElement("div");
    body.className = "finding-body";
    body.textContent =
      item.kind === "file"
        ? `${item.file} — ${item.comment}`
        : `${item.file}:${item.start_line}-${item.end_line} — ${item.comment}`;

    box.appendChild(head);
    box.appendChild(body);
    findingsRoot.appendChild(box);
  }
}

function jumpToFinding(input: {
  file?: string;
  side?: string;
  start_line?: unknown;
  end_line?: unknown;
  kind?: string;
}) {
  if (!input.file) return;
  const isFileLevel = input.kind === "file";

  if (!isFileLevel) {
    const parsed = range(input.start_line, input.end_line);
    if (!parsed) return;
    state.selection = {
      file: input.file,
      side: side(input.side),
      start_line: parsed.start,
      end_line: parsed.end,
    };
  } else {
    state.selection = undefined;
  }

  state.collapsed.delete(input.file);
  applyFileState(input.file);

  const card = state.cards.get(input.file);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  renderSelection();
  syncAll();
}

function fillOptions() {
  categoryRoot.innerHTML = "";
  severityRoot.innerHTML = "";

  for (const item of state.data?.taxonomy.categories ?? []) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    categoryRoot.appendChild(option);
  }

  for (const item of state.data?.taxonomy.severities ?? []) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    severityRoot.appendChild(option);
  }
}

function draftPayload() {
  return {
    notes: state.notes,
    new_findings: state.fresh.map((item) => ({
      id: item.id,
      file: item.file,
      side: item.side,
      start_line: item.start_line,
      end_line: item.end_line,
      category: item.category,
      severity: item.severity,
      comment: item.comment,
      kind: item.kind ?? "line",
    })),
  };
}

async function saveDraft() {
  if (!state.data) return;
  const response = await fetch(endpoint("/draft"), {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(draftPayload()),
  }).catch(() => undefined);

  if (!response?.ok) {
    setStatus("Failed to save draft", true);
    return;
  }

  setStatus(`Draft saved at ${new Date().toLocaleTimeString()}`);
}

function scheduleSave() {
  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    saveDraft();
  }, 250);
}

function addFinding() {
  const comment = commentRoot.value.trim();
  if (!comment) {
    setStatus("Comment is required", true);
    return;
  }

  if (state.pendingFileFinding) {
    state.fresh.push({
      id: `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      file: state.pendingFileFinding,
      side: "additions",
      start_line: 0,
      end_line: 0,
      category: categoryRoot.value as Category,
      severity: severityRoot.value as Severity,
      comment,
      kind: "file",
    });
    commentRoot.value = "";
    state.pendingFileFinding = null;
    renderFindings();
    updateFileCommentsBadges();
    syncAll();
    scheduleSave();
    return;
  }

  if (!state.selection) {
    setStatus("Select lines before adding a finding", true);
    return;
  }

  state.fresh.push({
    id: `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    file: state.selection.file,
    side: state.selection.side,
    start_line: state.selection.start_line,
    end_line: state.selection.end_line,
    category: categoryRoot.value as Category,
    severity: severityRoot.value as Severity,
    comment,
    kind: "line",
  });

  commentRoot.value = "";
  state.selection = undefined;
  renderSelection();
  renderFindings();
  syncAll();
  scheduleSave();
}

function addFileFinding(filePath: string) {
  state.pendingFileFinding = filePath;
  if (!state.drawerOpen) openDrawer();
  commentRoot.focus();
  setStatus(`Add file-level finding to ${filePath}`);
}

function clearSelection() {
  state.selection = undefined;
  renderSelection();
  syncAll();
}

async function submit() {
  submitButton.disabled = true;
  setStatus("Submitting review...");

  const response = await fetch(endpoint("/submit"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(draftPayload()),
  }).catch(() => undefined);

  if (!response) {
    submitButton.disabled = false;
    setStatus("Submit failed: request was interrupted", true);
    return;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    submitButton.disabled = false;
    setStatus(`Submit failed (${response.status}) ${detail || "unknown error"}`, true);
    return;
  }

  const body = await response.json().catch(() => ({}));
  showPostSubmit(body?.round);
}

function showPostSubmit(round: number | undefined) {
  addButton.disabled = true;
  clearButton.disabled = true;
  submitButton.disabled = true;
  commentRoot.disabled = true;
  notesRoot.disabled = true;
  document.body.classList.add("submitted");

  const overlay = document.createElement("div");
  overlay.className = "post-submit";
  overlay.innerHTML = `
    <div class="post-submit-card">
      <h2>Review submitted${round ? ` — round ${round}` : ""}</h2>
      <p>The findings are now in the OpenCode session. The plugin cannot close this tab for you (browsers only allow scripts to close tabs the script itself opened), so please close it manually with <kbd>⌘W</kbd> / <kbd>Ctrl+W</kbd> or the tab's close button.</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

findingsRoot.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const resolveBtn = target.closest("button[data-resolve]");
  if (resolveBtn instanceof HTMLElement) {
    const id = resolveBtn.dataset.resolve;
    if (!id) return;
    resolveFinding(id);
    return;
  }

  const removeBtn = target.closest("button[data-remove]");
  if (removeBtn instanceof HTMLElement) {
    const id = removeBtn.dataset.remove;
    if (!id) return;
    state.fresh = state.fresh.filter((item) => item.id !== id);
    renderFindings();
    syncAll();
    scheduleSave();
    return;
  }

  const finding = target.closest(".finding");
  if (!(finding instanceof HTMLElement)) return;
  jumpToFinding({
    file: finding.dataset.focusFile,
    side: finding.dataset.focusSide,
    start_line: finding.dataset.focusStart,
    end_line: finding.dataset.focusEnd,
  });
});

addButton.addEventListener("click", addFinding);
clearButton.addEventListener("click", clearSelection);
submitButton.addEventListener("click", submit);

diffsRoot.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const btn = target.closest("button[data-action='add-file-finding']");
  if (btn instanceof HTMLElement) {
    const filePath = btn.dataset.file;
    if (filePath) {
      event.stopPropagation();
      addFileFinding(filePath);
    }
  }
});

function updateFileCommentsBadges() {
  for (const badge of diffsRoot.querySelectorAll<HTMLElement>(".file-comments-badge[data-file]")) {
    const file = badge.dataset.file;
    if (!file) continue;
    const count = countFileLevelFindings(file);
    badge.textContent = `📄 ${count}`;
    badge.style.display = count === 0 ? "none" : "";
  }
  for (const [filePath, item] of state.sidebarItems) {
    const badge = item.querySelector(".sidebar-item-file-comments") as HTMLElement | null;
    if (!badge) continue;
    const count = countFileLevelFindings(filePath);
    badge.textContent = `📄 ${count}`;
    badge.style.display = count === 0 ? "none" : "";
  }
}

notesRoot.addEventListener("input", () => {
  state.notes = notesRoot.value;
  scheduleSave();
});

commentRoot.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (!event.metaKey && !event.ctrlKey) return;
  event.preventDefault();
  addFinding();
});

async function init() {
  applyTheme();
  applyLayout();

  if (!token || !reviewID) {
    setStatus("Invalid review URL", true);
    return;
  }

  const response = await fetch(endpoint("")).catch(() => undefined);
  if (!response?.ok) {
    setStatus("Failed to load review payload", true);
    return;
  }

  const data = await response.json().catch(() => undefined);
  if (!data) {
    setStatus("Invalid review payload", true);
    return;
  }

  state.data = data as Launch;
  state.existing = Array.isArray(state.data.existing_findings) ? state.data.existing_findings : [];
  state.fresh = Array.isArray(state.data.draft?.new_findings) ? state.data.draft.new_findings : [];
  state.notes = typeof state.data.draft?.notes === "string" ? state.data.draft.notes : "";
  notesRoot.value = state.notes;

  const scope =
    Array.isArray(state.data.filter) && state.data.filter.length
      ? `Round ${state.data.round} · filtered: ${state.data.filter.join(", ")}`
      : `Round ${state.data.round} · all files`;
  const diff = state.data.base
    ? ` · ${state.data.base}...HEAD`
    : state.data.auto_base
      ? ` · ${state.data.auto_base}...HEAD (auto)`
      : " · working tree";
  const scopeLabel = state.data.auto_worktree_branch
    ? `[worktree: ${state.data.auto_worktree_branch}]`
    : state.data.is_worktree
      ? `[worktree: ${state.data.current_branch || "?"}]`
      : state.data.current_branch
        ? `[main: ${state.data.current_branch}]`
        : "";
  scopeRoot.textContent = `${scope}${diff}${scopeLabel ? ` · ${scopeLabel}` : ""}`;

  fillOptions();
  renderActivePane();
  renderDiffPanel();
  renderFindings();
  renderSelection();
  syncAll();
}

init();
