import { File, FileDiff, type DiffLineAnnotation, type LineAnnotation } from "@pierre/diffs";

type Category = "bug" | "style" | "perf" | "question" | "recommend";
type Severity = "high" | "medium" | "low";
type Side = "additions" | "deletions";

type Finding = {
  id: string;
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
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

type Launch = {
  id: string;
  session_id: string;
  repo_root: string;
  scope_root: string;
  round: number;
  files: FileEntry[];
  existing_findings: Finding[];
  draft: Draft;
  taxonomy: {
    categories: Category[];
    severities: Severity[];
  };
  filter?: string[];
  base?: string;
};

type Meta = {
  id: string;
  kind: "existing" | "new";
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
};

type View =
  | {
      kind: "diff";
      instance: FileDiff<Meta>;
    }
  | {
      kind: "file";
      instance: File<Meta>;
    };

type ThemeMode = "light" | "dark" | "auto";
type DiffLayout = "unified" | "split";
type SidebarMode = "tree" | "flat";
const SIDEBAR_KEY = "diff-review:sidebar-mode";
const THEME_KEY = "diff-review:theme-mode";
const LAYOUT_KEY = "diff-review:diff-layout";

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
  json: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h7.5zM3 1.5A.5.5 0 0 0 2.5 2v12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V5H10a2 2 0 0 1-2-2V1.5zm6.5 4v.5c0 .8.7 1.5 1.5 1.5H11v.5h-1V7h1.5A1.5 1.5 0 0 0 13 5.5V5h-1.5a.5.5 0 0 1-.5-.5V4h-1v.5h1V6h-.5a.5.5 0 0 1-.5-.5z"/></svg>`,
  md: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 14V2H2v12zM3 3h10v10H3zm2 8h1V6.5l1 2.5L8 6.5V11h1V5H7.5L7 7.5 6.5 5H5zm5 0h2v-1h-1V6h1V5h-2z"/></svg>`,
  html: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm1.5 2h4l-.1 1.5H7.5L7.4 8h2.6L9.9 9.5 7.5 10.2 5.1 9.5 5 7.5h1.5l.1.7.9.3.9-.3.1-.7H6z"/></svg>`,
  css: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm.5 2h6l-.1 1H8.5L8.4 7H10l-.1 1H7.9L7.8 9.2l1.7.4 1.7-.4.1-1.2h-1l-.1.7-.7.2-.7-.2-.1-1.2h2.3L11 5.5H6z"/></svg>`,
  toml: FILE_DEFAULT_ICON_SVG,
  yaml: FILE_DEFAULT_ICON_SVG,
  yml: FILE_DEFAULT_ICON_SVG,
};

function fileIcon(filename: string): string {
  const ext = filename.includes(".") ? filename.split(".").pop()!.toLowerCase() : "";
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
  drawerOpen: false,
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

function setSidebarMode(mode: SidebarMode) {
  if (state.sidebarMode === mode) return;
  state.sidebarMode = mode;
  applySidebarMode();
  writeStored(SIDEBAR_KEY, mode);
  renderSidebar();
}

sidebarMode.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest("button");
  if (!btn) return;
  setSidebarMode(btn.dataset.mode as SidebarMode);
});

// ── Drawer ──
function openDrawer() {
  state.drawerOpen = true;
  drawer.setAttribute("data-open", "");
  drawerBackdrop.setAttribute("data-open", "");
}

function closeDrawer() {
  state.drawerOpen = false;
  drawer.removeAttribute("data-open");
  drawerBackdrop.removeAttribute("data-open");
}

drawerToggle.addEventListener("click", () => {
  if (state.drawerOpen) closeDrawer();
  else openDrawer();
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
    ...state.existing.map((item) => ({ ...item, kind: "existing" as const })),
    ...state.fresh.map((item) => ({ ...item, kind: "new" as const })),
  ];
}

function updateFindingCount() {
  const count = all().length;
  findingCount.textContent = String(count);
}

function diffAnnotations(file: string) {
  return all()
    .filter((item) => item.file === file)
    .flatMap((item) => {
      const parsed = range(item.start_line, item.end_line);
      if (!parsed) return [];
      return [
        {
          side: side(item.side),
          lineNumber: parsed.start,
          metadata: {
            id: item.id,
            kind: item.kind,
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

function fileAnnotations(file: string) {
  return all()
    .filter((item) => item.file === file)
    .flatMap((item) => {
      const parsed = range(item.start_line, item.end_line);
      if (!parsed) return [];
      return [
        {
          lineNumber: parsed.start,
          metadata: {
            id: item.id,
            kind: item.kind,
            file,
            side: side(item.side),
            start_line: parsed.start,
            end_line: parsed.end,
            category: item.category,
            severity: item.severity,
            comment: item.comment,
          },
        } satisfies LineAnnotation<Meta>,
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

  if (view.kind === "diff") {
    view.instance.setLineAnnotations(diffAnnotations(file));
  } else {
    view.instance.setLineAnnotations(fileAnnotations(file));
  }

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
  }

  if (item) {
    if (marked) item.setAttribute("data-read", "");
    else item.removeAttribute("data-read");
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

function renderAnnotation(annotation: LineAnnotation<Meta> | DiffLineAnnotation<Meta>) {
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
  kind.textContent = metadata.kind;

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

  if (file.status !== "modified") {
    const fixed = file.status === "deleted" ? "deletions" : "additions";
    const instance = new File<Meta>({
      theme: pierreTheme(),
      themeType,
      overflow: "wrap",
      disableFileHeader: true,
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
          side: fixed,
        });
      },
      onLineClick: (value) => {
        select(file.path, {
          start: value.lineNumber,
          end: value.lineNumber,
          side: fixed,
        });
      },
      renderAnnotation,
    });

    instance.render({
      file: {
        name: file.path,
        contents: file.status === "deleted" ? file.before || "" : file.after || "",
      },
      containerWrapper: mount,
      lineAnnotations: fileAnnotations(file.path),
    });

    return {
      kind: "file" as const,
      instance,
    };
  }

  const instance = new FileDiff<Meta>({
    theme: pierreTheme(),
    themeType,
    diffStyle: state.diffLayout,
    overflow: "wrap",
    disableFileHeader: true,
    diffIndicators: "bars",
    expandUnchanged: false,
    collapsedContextThreshold: 5,
    hunkSeparators: "simple",
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
        side: value.side || value.endSide,
      });
    },
    onLineClick: (value) => {
      select(file.path, {
        start: value.lineNumber,
        end: value.lineNumber,
        side: value.annotationSide,
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

function basename(path: string) {
  return path.split("/").pop() || path;
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

  const stats = document.createElement("span");
  stats.className = "sidebar-stats";
  const parts = [];
  if (file.additions) parts.push(`<span class="sa">+${file.additions}</span>`);
  if (file.deletions) parts.push(`<span class="sd">-${file.deletions}</span>`);
  stats.innerHTML = parts.join(" ");

  item.appendChild(dot);
  item.appendChild(typeIcon);
  item.appendChild(name);
  item.appendChild(stats);

  item.addEventListener("click", () => {
    state.collapsed.delete(file.path);
    applyFileState(file.path);
    document
      .querySelector(`#file-${index}`)
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
    const sortedChildren = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
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

function countFiles(node: TreeNode): number {
  let n = node.files.size;
  for (const child of node.children.values()) n += countFiles(child);
  return n;
}

function renderSidebar() {
  fileListRoot.innerHTML = "";
  state.sidebarItems.clear();

  const files = state.data?.files ?? [];
  if (state.sidebarMode === "tree") {
    renderTreeSidebar(buildTree(files));
  } else {
    renderFlatSidebar(files);
  }
}

function renderDiffPanel() {
  for (const view of state.views.values()) {
    view.instance.cleanUp();
  }
  diffsRoot.innerHTML = "";
  state.views.clear();
  state.cards.clear();

  const files = state.data?.files ?? [];
  for (const [index, file] of files.entries()) {
    // ── Card ──
    const card = document.createElement("section");
    card.className = "card";
    card.id = `file-${index}`;

    // ── Card header (always visible) ──
    const header = document.createElement("div");
    header.className = "card-header";
    header.addEventListener("click", () => toggleCollapse(file.path));

    const chevron = document.createElement("span");
    chevron.className = "card-chevron";
    chevron.innerHTML = CHEVRON_SVG;

    const icon = document.createElement("span");
    icon.className = "card-file-icon";
    icon.innerHTML = FILE_ICON_SVG;

    const filename = document.createElement("span");
    filename.className = "card-filename";
    filename.textContent = file.path;

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

    actions.appendChild(readBtn);

    header.appendChild(chevron);
    header.appendChild(icon);
    header.appendChild(filename);
    header.appendChild(meta);
    header.appendChild(actions);

    // ── Card body ──
    const body = document.createElement("div");
    body.className = "card-body";

    const mount = document.createElement("div");
    body.appendChild(mount);

    card.appendChild(header);
    card.appendChild(body);
    diffsRoot.appendChild(card);

    state.cards.set(file.path, card);

    if (file.status === "deleted") state.collapsed.add(file.path);

    applyFileState(file.path);

    const view = createView(file, mount);
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
  syncAll();
  setStatus("Finding resolved");
}

function renderFindings() {
  const items = all();
  findingsRoot.innerHTML = "";
  updateFindingCount();

  if (items.length === 0) {
    findingsRoot.textContent = "No findings yet.";
    setStatus("");
    return;
  }

  setStatus(`${state.fresh.length} new finding${state.fresh.length === 1 ? "" : "s"} ready`);

  for (const item of items) {
    const box = document.createElement("div");
    box.className = "finding";
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
      `<span class="badge">${item.kind}</span>`,
    ].join("");
    head.appendChild(badges);

    const actions = document.createElement("div");
    actions.className = "finding-actions";

    if (item.kind === "existing") {
      const resolve = document.createElement("button");
      resolve.className = "btn-resolve";
      resolve.type = "button";
      resolve.textContent = "Resolve";
      resolve.dataset.resolve = item.id;
      actions.appendChild(resolve);
    }

    if (item.kind === "new") {
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
    body.textContent = `${item.file}:${item.start_line}-${item.end_line} — ${item.comment}`;

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
}) {
  if (!input.file) return;
  const parsed = range(input.start_line, input.end_line);
  if (!parsed) return;

  state.selection = {
    file: input.file,
    side: side(input.side),
    start_line: parsed.start,
    end_line: parsed.end,
  };

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
  if (!state.selection) {
    setStatus("Select lines before adding a finding", true);
    return;
  }

  const comment = commentRoot.value.trim();
  if (!comment) {
    setStatus("Comment is required", true);
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
  });

  commentRoot.value = "";
  state.selection = undefined;
  renderSelection();
  renderFindings();
  syncAll();
  scheduleSave();
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
  const diff = state.data.base ? ` · ${state.data.base}...HEAD` : " · working tree";
  scopeRoot.textContent = `${scope}${diff}`;

  fillOptions();
  renderSidebar();
  renderDiffPanel();
  renderFindings();
  renderSelection();
  syncAll();
}

init();
