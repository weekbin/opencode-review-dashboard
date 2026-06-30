import { FileDiff, parseDiffFromFile, type DiffLineAnnotation } from "@pierre/diffs";

import { DiffVirtualizer, computeHunkRanges } from "./diff-virtualization";

import { cycleTab, TAB_ORDER, tabIndexFor, type TabKey } from "../sidebar-keyboard";
import { filterByQuery } from "../search-utils";
import { sortConversationEntries, type SortFindingsBy } from "../sort-utils";
// R19 #38: additive modal a11y helper (Escape + focus trap + initial focus).
import { installModalA11y } from "./modal-a11y";
// R19 #37: toast notifications (3s auto-dismiss + ARIA live region).
import { showToast } from "./toast";
// R19 #33: language toggle (i18n helper).
import {
  applyLanguage,
  onLanguageChange,
  peekLanguage,
  registerUITranslator,
  setLanguage,
  t,
} from "./i18n";
// R20 #40: sidebar review progress (X / Y reviewed + visual bar).
import { formatReviewProgress } from "./review-progress";
// R20 #42: in-diff search history (recent searches dropdown).
import { addRecentSearch, clearRecentSearches, commitRecentSearch, commitRecentSearchImmediate, cancelPendingCommit, getRecentSearches, MAX_RECENT, removeRecentSearches } from "./search-history";

type Category = "bug" | "style" | "perf" | "question" | "recommend";
type Severity = "high" | "medium" | "low";
type Side = "additions" | "deletions";

type FindingComment = {
  id: string;
  author: "user" | "agent";
  text: string;
  created_at: number;
};

type ReactionEmoji = "👍" | "👎" | "😄" | "❤️" | "🎉" | "👀";
type Reaction = {
  emoji: ReactionEmoji;
  author: "user";
  created_at: number;
};

// R13 #20+#21 — additive optional resolve metadata. Mirrors the
// R9/R10/R11/R12 additive field pattern. Old state.json payloads
// (no `resolve_reason` / `resolution_kind`) load without errors.
type FindingResolutionKind = "wontfix" | "out_of_scope" | "false_positive" | "duplicate";
const RESOLUTION_KIND_WHITELIST: ReadonlySet<FindingResolutionKind> = new Set([
  "wontfix",
  "out_of_scope",
  "false_positive",
  "duplicate",
]);

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
  manually_reopened?: boolean;
  manually_edited?: boolean;
  edited_at?: number;
  close_reason?: "file_removed" | "anchor_missing";
  comments?: FindingComment[];
  pinned?: { by: "user"; at: number };
  manually_pinned?: boolean;
  reactions?: Reaction[];
  resolve_reason?: string;
  resolve_manually_resolved?: boolean;
  resolved_at?: number;
  resolution_kind?: FindingResolutionKind;
  resolution_reason?: string;
};

type Draft = {
  notes: string;
  new_findings: Finding[];
  // R14 #24: server-stamped last save time. Optional — legacy state.json
  // files (R12 or earlier) won't have it; the indicator treats missing
  // as 0 = "All changes saved" (idle).
  lastSavedAt?: number;
};

type FileEntry = {
  path: string;
  status: "added" | "deleted" | "modified";
  additions: number;
  deletions: number;
  before: string;
  after: string;
  source?: "working" | "base";
};

type DiffBase = {
  type: "explicit" | "auto" | "working_only" | "empty";
  from: string;
  to: "HEAD" | "working";
  resolved: string;
  sources: ("working" | "base")[];
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
  diff_base?: DiffBase;
  previous_diff_base?: DiffBase;
  range_changed_from_last_round?: boolean;
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
const IGNORE_WHITESPACE_KEY = "diff-review:ignore-whitespace";
const CONV_FILTER_KEY = "diff-review:conversation-filter";
// R25 #51: diff virtualization toggle (default ON — renders all hunks eagerly when OFF).
const DIFF_VIRTUALIZATION_KEY = "diff-review:virtualization";
const ACTIVE_TAB_KEY = "diff-review:active-tab";
// R14 #23: localStorage key for the Conversation-panel sort dropdown.
// localStorage (not sessionStorage) so the choice survives a page reload,
// matching the conversationFilter pattern.
const SORT_FINDINGS_KEY = "diff-review:sort-findings-by";
// R20 #41: sidebar "show only unread" filter persisted as boolean-as-string.
const SIDEBAR_FILTER_UNREAD_KEY = "diff-review:filter-unread";
// R21 #44: search history max items persisted to localStorage.
const SEARCH_HISTORY_MAX_KEY = "diff-review:search-history-max";

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v && (allowed as readonly string[]).includes(v)) return v as T;
  } catch {
    // ignore — localStorage may be unavailable (private mode, etc.)
  }
  return fallback;
}

// R20 #41: boolean-as-string localStorage reader. Persists the
// "show only unread" sidebar filter so the choice survives a reload.
// Defaults to false (show all files) when the key is missing or
// contains any non-"on" value.
function readStoredFilterUnread(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_FILTER_UNREAD_KEY) === "on";
  } catch {
    return false;
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function stripWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").replace(/ +$/, "");
}

// ── Saved Replies (R10 #1, GH#10) ──
const SAVED_REPLIES_KEY = "opencode-review-dashboard:saved-replies";
const SAVED_REPLIES_SOFT_CAP = 200;

type SavedReply = {
  name: string;
  body: string;
  createdAt: number;
};

function loadSavedReplies(): SavedReply[] {
  try {
    const raw = localStorage.getItem(SAVED_REPLIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SavedReply =>
          item &&
          typeof item.name === "string" &&
          typeof item.body === "string" &&
          typeof item.createdAt === "number",
      )
      .slice(0, SAVED_REPLIES_SOFT_CAP);
  } catch {
    return [];
  }
}

function persistSavedReplies(list: SavedReply[]): boolean {
  try {
    localStorage.setItem(SAVED_REPLIES_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function addSavedReply(name: string, body: string): { ok: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "name is required" };
  if (!body.trim()) return { ok: false, error: "body is required" };
  const list = loadSavedReplies();
  if (list.length >= SAVED_REPLIES_SOFT_CAP) {
    return {
      ok: false,
      error: `soft cap reached (${SAVED_REPLIES_SOFT_CAP}). Delete some templates first.`,
    };
  }
  list.push({ name: trimmed, body, createdAt: Date.now() });
  if (!persistSavedReplies(list)) {
    return { ok: false, error: "localStorage quota exceeded" };
  }
  return { ok: true };
}

function deleteSavedReplyByName(name: string): boolean {
  const list = loadSavedReplies();
  const filtered = list.filter((item) => item.name !== name);
  if (filtered.length === list.length) return false;
  return persistSavedReplies(filtered);
}

function insertAtCursor(textarea: HTMLTextAreaElement, text: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = before + text + after;
  const caret = start + text.length;
  textarea.focus();
  textarea.setSelectionRange(caret, caret);
}

// R11 #1: `/trigger` typed-prefix expansion (GH#15).
function slugifyTriggerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

type TriggerMatch = {
  name: string;
  prefixLength: number;
  body: string;
};

function parseTriggerExpansion(beforeCaret: string, replies: SavedReply[]): TriggerMatch | null {
  // Bare `/` (no chars) never matches; leading whitespace or start-of-string
  // required so substring slashes inside text don't trigger.
  const match = beforeCaret.match(/(^|\s)\/([a-z0-9][a-z0-9._-]*)$/i);
  if (!match) return null;
  const name = (match[2] ?? "").toLowerCase();
  if (!name || !replies.length) return null;
  const bySlug = new Map<string, SavedReply>();
  for (const r of replies) {
    const slug = slugifyTriggerName(r.name);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, r);
  }
  const hit = bySlug.get(name);
  if (!hit) return null;
  const prefixLength = match[0].length - (match[1] ?? "").length;
  return { name, prefixLength, body: hit.body };
}

function tryApplyTrigger(textarea: HTMLTextAreaElement, replies: SavedReply[]): boolean {
  const caret = textarea.selectionStart;
  const beforeCaret = textarea.value.slice(0, caret);
  const m = parseTriggerExpansion(beforeCaret, replies);
  if (!m) return false;
  const newBefore = textarea.value.slice(0, caret - m.prefixLength);
  textarea.value = newBefore + m.body + textarea.value.slice(caret);
  const newCaret = newBefore.length + m.body.length;
  textarea.focus();
  textarea.setSelectionRange(newCaret, newCaret);
  return true;
}

// R11 #2: per-finding permalink anchors (GH#16).
function buildFindingPermalink(findingId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  return `${origin}${pathname}#finding-${findingId}`;
}

function parseFindingHash(hash: string): string | null {
  const m = hash.match(/^#finding-(.+)$/);
  return m ? (m[1] ?? null) : null;
}

async function copyFindingPermalinkToClipboard(
  findingId: string,
  button: HTMLButtonElement,
): Promise<void> {
  const url = buildFindingPermalink(findingId);
  const fallbackCopy = (text: string) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  };
  let ok = false;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = fallbackCopy(url);
    }
  } else {
    ok = fallbackCopy(url);
  }
  if (ok) {
    const original = button.textContent;
    button.textContent = "✓ Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 1200);
    showToast(`Copied permalink for ${findingId}`);
    setStatus(`Copied permalink for ${findingId}`);
  } else {
    showToast("Could not copy permalink — clipboard blocked", { error: true });
    setStatus("Could not copy permalink — clipboard blocked", true);
  }
}

function buildFindingMarkdownSnippet(entry: ConversationEntry, round: number): string {
  const loc =
    entry.start_line && entry.end_line && entry.start_line !== entry.end_line
      ? `${entry.file}:${entry.start_line}-${entry.end_line}`
      : `${entry.file}:${entry.start_line ?? "?"}`;
  const permalink = buildFindingPermalink(entry.id);
  const auditCount = entry.audit_log?.length ?? 0;
  const reactionCounts = new Map<string, number>();
  for (const r of entry.reactions ?? []) {
    reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) ?? 0) + 1);
  }
  const reactionLine =
    reactionCounts.size === 0
      ? "reactions: (none)"
      : `reactions: ${[...reactionCounts.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([emoji, n]) => `${emoji}×${n}`)
          .join(" ")}`;
  const comment = (entry.comment ?? "").replace(/\n+/g, " ").trim();
  const lines: string[] = [];
  lines.push(`[Round ${round}] **[${loc}](${permalink})** — ${comment}`);
  lines.push("");
  lines.push(`> audit: ${auditCount} edits`);
  lines.push(reactionLine);
  return lines.join("\n");
}

async function copyFindingAsMarkdownToClipboard(
  finding: ConversationEntry,
  round: number,
  button: HTMLButtonElement,
): Promise<void> {
  const md = buildFindingMarkdownSnippet(finding, round);
  const fallbackCopy = (text: string) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  };
  let ok = false;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(md);
      ok = true;
    } catch {
      ok = fallbackCopy(md);
    }
  } else {
    ok = fallbackCopy(md);
  }
  if (ok) {
    const original = button.textContent;
    button.textContent = "✓ Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 1200);
    showToast("Copied as Markdown");
    setStatus("Copied as Markdown");
  } else {
    showToast("Could not copy markdown — clipboard blocked", { error: true });
    setStatus("Could not copy markdown — clipboard blocked", true);
  }
}

function flashFindingPermaHighlight(findingId: string): boolean {
  const el = document.getElementById(`finding-${findingId}`);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("finding-permalink-flash");
  // Force reflow so the animation restarts even on rapid re-triggers.
  void el.offsetWidth;
  el.classList.add("finding-permalink-flash");
  setTimeout(() => el.classList.remove("finding-permalink-flash"), 1600);
  return true;
}

function resolveHashOnLoad(): void {
  if (typeof window === "undefined") return;
  const target = parseFindingHash(window.location.hash);
  if (!target) return;
  const tryScroll = () => {
    if (flashFindingPermaHighlight(target)) return;
    if (state.activeTab !== "conversation") {
      setActiveTab("conversation");
    }
    requestAnimationFrame(tryScroll);
  };
  requestAnimationFrame(tryScroll);
}

window.addEventListener("hashchange", () => {
  const target = parseFindingHash(window.location.hash);
  if (target) flashFindingPermaHighlight(target);
});

// ── R12 #19 — Keyboard nav n/p ──
//
// Pure client-side. `n` jumps to the next finding card (round DESC,
// created_at ASC) in the current conversationFilter view; `p` jumps
// to the previous. Focus guard: skip when a <textarea>/<input> is
// focused so typing 'n' or 'p' inside the comment box doesn't fire
// nav. Wraps on overflow. Reuses flashFindingPermaHighlight (R11
// helper) for the scroll-into-view + 1.5s flash effect.

type SortedFinding = {
  id: string;
  round: number;
  created_at: number;
  status: string;
  origin: "existing" | "new";
};

let currentFindingIndex = -1;

function getSortedFindings(): SortedFinding[] {
  const entries: SortedFinding[] = [
    ...state.existing.map((item) => ({
      id: item.id,
      round: item.round ?? 0,
      created_at: item.created_at ?? 0,
      status: item.status ?? "open",
      origin: "existing" as const,
    })),
    ...state.fresh.map((item, index) => ({
      id: item.id,
      round: 0,
      created_at: Date.now() + index,
      status: "open",
      origin: "new" as const,
    })),
  ];
  let filtered = entries;
  if (state.conversationFilter === "open") {
    filtered = filtered.filter((e) => e.status === "open" || e.status === "closed_auto");
  } else if (state.conversationFilter === "resolved") {
    filtered = filtered.filter((e) => e.status === "resolved");
  } else if (state.conversationFilter === "pinned") {
    filtered = filtered.filter((e) =>
      state.existing.some((item) => item.id === e.id && Boolean(item.pinned)),
    );
  } else if (state.conversationFilter === "reacted") {
    filtered = filtered.filter((e) =>
      state.existing.some(
        (item) => item.id === e.id && Boolean(item.reactions && item.reactions.length > 0),
      ),
    );
  }
  return [...filtered].sort((a, b) => {
    if (a.round !== b.round) return b.round - a.round;
    return a.created_at - b.created_at;
  });
}

function jumpToFindingByIndex(index: number): void {
  const sorted = getSortedFindings();
  if (sorted.length === 0) return;
  const wrapped = ((index % sorted.length) + sorted.length) % sorted.length;
  currentFindingIndex = wrapped;
  const target = sorted[wrapped];
  if (!target) return;
  flashFindingPermaHighlight(target.id);
  updateNavHint();
}

function isTextInputFocused(): boolean {
  if (typeof document === "undefined") return false;
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  if (active.tagName === "TEXTAREA") return true;
  if (active.tagName === "INPUT") return true;
  if (active.isContentEditable) return true;
  return false;
}

window.addEventListener("keydown", (event) => {
  if (event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key !== "n" && event.key !== "p") return;
  if (isTextInputFocused()) return;
  if (state.activeTab !== "conversation") return;
  event.preventDefault();
  if (event.key === "n") {
    jumpToFindingByIndex(currentFindingIndex + 1);
  } else {
    jumpToFindingByIndex(currentFindingIndex - 1);
  }
});

let navHintEl: HTMLElement | null = null;
function ensureNavHint(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (navHintEl) return navHintEl;
  const el = document.createElement("div");
  el.className = "nav-hint";
  el.id = "nav-hint";
  el.innerHTML = "Press <kbd>n</kbd> / <kbd>p</kbd> to navigate findings";
  el.hidden = true;
  document.body.appendChild(el);
  navHintEl = el;
  return el;
}

function updateNavHint(): void {
  const el = ensureNavHint();
  if (!el) return;
  const showHint = !isTextInputFocused() && state.activeTab === "conversation";
  el.hidden = !showHint;
}

window.addEventListener("focusin", () => updateNavHint());
window.addEventListener("focusout", () => updateNavHint());

// ── R13 #22 — In-diff search (Cmd+F / Ctrl+F / `/`) ──
//
// Pure client-side. Mirrors vimdiff's `/` search, GitHub's `t` file
// finder, and the n/p nav focus-guard at :445-453. Reuses
// `flashFindingPermaHighlight` style scroll-into-view + 1.5s flash
// (R11 helper). sessionStorage persistence (NOT localStorage — diff
// is round-scoped, so the search query should NOT leak across
// sessions). Fixed-top overlay sits above the diff cards and does not
// scroll with the page.
//
// Flow:
//  - Cmd+F / Ctrl+F / `/` opens the overlay (capture-phase listener
//    intercepts the native browser find so we own the experience;
//    when a text input is focused, the native find still fires
//    because we skip intercept).
//  - User types → substring case-insensitive match across
//    `[data-line-number]` inside every `.card[data-file]`; wraps
//    each hit in `<mark class="diff-search-match">`. Counter
//    shows "N matches" (or "100+ matches, refine your query" past
//    the 100-match cap).
//  - Enter / F3 → next match; Shift+Enter / Shift+F3 → prev match.
//    Each jump scrolls the match into view + 1.5s flash highlight.
//  - Escape → close overlay, remove all `<mark>` wrappers.
//  - Re-opening the overlay restores the last query from
//    sessionStorage (try/catch wrapped for private-mode safety).

const DIFF_SEARCH_KEY = "diff-review:diff-search-query";
const DIFF_SEARCH_MAX_MATCHES = 100;
const DIFF_SEARCH_FLASH_MS = 1500;

type DiffSearchState = {
  query: string;
  matchElements: HTMLElement[];
  currentIndex: number;
  overlay: HTMLElement | null;
  input: HTMLInputElement | null;
  counter: HTMLElement | null;
  // R20 #42: recent-searches dropdown element appended to `.diff-search-bar`.
  history: HTMLElement | null;
  // Set when the user clicks a recent-search item, so the blur handler
  // doesn't immediately hide the dropdown out from under the click.
  historyClickGuard: number;
};

const diffSearch: DiffSearchState = {
  query: "",
  matchElements: [],
  currentIndex: -1,
  overlay: null,
  input: null,
  counter: null,
  history: null,
  historyClickGuard: 0,
};

function readSessionStored(key: string): string | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStored(key: string, value: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(key, value);
  } catch {
    // ignore — private mode, quota, etc.
  }
}

function clearSessionStored(key: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function clearDiffSearchHighlights(): void {
  const marks = diffsRoot.querySelectorAll<HTMLElement>("mark.diff-search-match");
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }
  diffSearch.matchElements = [];
  diffSearch.currentIndex = -1;
}

function flashDiffSearchMatch(el: HTMLElement): void {
  el.classList.remove("diff-search-match-flash");
  // Force reflow so the animation restarts even on rapid re-triggers.
  void el.offsetWidth;
  el.classList.add("diff-search-match-flash");
  setTimeout(() => el.classList.remove("diff-search-match-flash"), DIFF_SEARCH_FLASH_MS);
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMatchesInDiff(query: string): HTMLElement[] {
  clearDiffSearchHighlights();
  if (!query) return [];
  const re = new RegExp(escapeRegExp(query), "gi");
  const cards = diffsRoot.querySelectorAll<HTMLElement>(".card[data-file]");
  const found: HTMLElement[] = [];
  outer: for (const card of cards) {
    const lines = card.querySelectorAll<HTMLElement>("[data-line-number]");
    for (const line of lines) {
      // The @pierre/diffs library nests the actual code text inside
      // child <span> elements (one per token). Walk text nodes
      // directly so we don't break the syntax-highlight spans.
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const targets: Text[] = [];
      let node: Node | null = walker.nextNode();
      while (node) {
        targets.push(node as Text);
        node = walker.nextNode();
      }
      for (const text of targets) {
        const value = text.nodeValue ?? "";
        re.lastIndex = 0;
        let match: RegExpExecArray | null;
        const positions: { start: number; end: number }[] = [];
        while ((match = re.exec(value)) !== null) {
          positions.push({ start: match.index, end: match.index + match[0].length });
          if (positions.length > 0 && re.lastIndex === match.index) {
            re.lastIndex += 1;
          }
        }
        if (positions.length === 0) continue;
        const parent = text.parentNode;
        if (!parent) continue;
        const frag = document.createDocumentFragment();
        let cursor = 0;
        for (const pos of positions) {
          if (pos.start > cursor) {
            frag.appendChild(document.createTextNode(value.slice(cursor, pos.start)));
          }
          const mark = document.createElement("mark");
          mark.className = "diff-search-match";
          mark.textContent = value.slice(pos.start, pos.end);
          frag.appendChild(mark);
          found.push(mark);
          cursor = pos.end;
          if (found.length >= DIFF_SEARCH_MAX_MATCHES) break outer;
        }
        if (cursor < value.length) {
          frag.appendChild(document.createTextNode(value.slice(cursor)));
        }
        parent.replaceChild(frag, text);
      }
    }
  }
  return found;
}

function updateDiffSearchCounter(): void {
  if (!diffSearch.counter) return;
  const total = diffSearch.matchElements.length;
  if (total === 0) {
    diffSearch.counter.textContent = diffSearch.query ? "0 matches" : "";
  } else if (total >= DIFF_SEARCH_MAX_MATCHES) {
    diffSearch.counter.textContent = `${DIFF_SEARCH_MAX_MATCHES}+ matches, refine your query`;
  } else {
    const current = diffSearch.currentIndex + 1;
    diffSearch.counter.textContent = `${current} of ${total} matches`;
  }
}

function jumpToDiffSearchMatch(index: number): void {
  if (diffSearch.matchElements.length === 0) return;
  const total = diffSearch.matchElements.length;
  const wrapped = ((index % total) + total) % total;
  if (diffSearch.currentIndex >= 0) {
    const prev = diffSearch.matchElements[diffSearch.currentIndex];
    prev?.classList.remove("diff-search-match-flash");
  }
  diffSearch.currentIndex = wrapped;
  const target = diffSearch.matchElements[wrapped];
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  flashDiffSearchMatch(target);
  updateDiffSearchCounter();
}

function closeDiffSearch(): void {
  if (diffSearch.overlay?.parentNode) {
    diffSearch.overlay.parentNode.removeChild(diffSearch.overlay);
  }
  diffSearch.overlay = null;
  diffSearch.input = null;
  diffSearch.counter = null;
  // R20 #42: clear the recent-searches dropdown ref so a fresh open
  // doesn't reuse a stale DOM node from the previous open.
  diffSearch.history = null;
  diffSearch.historyClickGuard = 0;
  clearDiffSearchHighlights();
  diffSearch.query = "";
  clearSessionStored(DIFF_SEARCH_KEY);
}

function openDiffSearch(initialQuery: string | null = null): void {
  if (diffSearch.overlay) {
    diffSearch.input?.focus();
    diffSearch.input?.select();
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "diff-search-bar";
  overlay.setAttribute("role", "search");
  overlay.innerHTML = `
    <input type="text" id="diff-search-input" placeholder="Find in diffs (case-insensitive substring)" aria-label="Search diffs">
    <span class="diff-search-counter" id="diff-search-counter"></span>
    <button type="button" class="diff-search-nav" id="diff-search-prev" title="Previous match (Shift+Enter)">↑</button>
    <button type="button" class="diff-search-nav" id="diff-search-next" title="Next match (Enter)">↓</button>
    <button type="button" class="diff-search-close" id="diff-search-close" title="Close (Escape)">×</button>
  `;
  document.body.appendChild(overlay);
  diffSearch.overlay = overlay;
  diffSearch.input = overlay.querySelector<HTMLInputElement>("#diff-search-input");
  diffSearch.counter = overlay.querySelector<HTMLElement>("#diff-search-counter");
  const prevBtn = overlay.querySelector<HTMLButtonElement>("#diff-search-prev");
  const nextBtn = overlay.querySelector<HTMLButtonElement>("#diff-search-next");
  const closeBtn = overlay.querySelector<HTMLButtonElement>("#diff-search-close");

  // R20 #42: recent-searches dropdown mounted inside .diff-search-bar.
  const historyRoot = document.createElement("div");
  historyRoot.className = "diff-search-history";
  historyRoot.setAttribute("role", "listbox");
  historyRoot.hidden = true;
  overlay.appendChild(historyRoot);
  diffSearch.history = historyRoot;

  const startQuery =
    initialQuery !== null ? initialQuery : (readSessionStored(DIFF_SEARCH_KEY) ?? "");
  if (diffSearch.input) {
    diffSearch.input.value = startQuery;
    diffSearch.input.focus();
    diffSearch.input.select();
  }

  const runSearch = () => {
    const q = diffSearch.input?.value ?? "";
    diffSearch.query = q;
    if (!q) {
      clearDiffSearchHighlights();
      clearSessionStored(DIFF_SEARCH_KEY);
      updateDiffSearchCounter();
      return;
    }
    writeSessionStored(DIFF_SEARCH_KEY, q);
    diffSearch.matchElements = findMatchesInDiff(q);
    diffSearch.currentIndex = diffSearch.matchElements.length > 0 ? 0 : -1;
    updateDiffSearchCounter();
    // R21 #43: debounced commit — 300ms quiet window; Enter path uses
    // commitRecentSearchImmediate() instead (see keydown handler below).
    commitRecentSearch(q);
  };

  window.addEventListener("beforeunload", () => {
    cancelPendingCommit();
  });

  if (diffSearch.input) {
    installImeSafeInputListener(diffSearch.input, () => runSearch());
  }
  diffSearch.input?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeDiffSearch();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (diffSearch.matchElements.length === 0) return;
      // R21 #43: cancel any pending debounce and commit immediately.
      cancelPendingCommit();
      commitRecentSearchImmediate(diffSearch.query ?? "");
      jumpToDiffSearchMatch(diffSearch.currentIndex + (e.shiftKey ? -1 : 1));
    }
  });
  prevBtn?.addEventListener("click", () => {
    if (diffSearch.matchElements.length === 0) return;
    jumpToDiffSearchMatch(diffSearch.currentIndex - 1);
  });
  nextBtn?.addEventListener("click", () => {
    if (diffSearch.matchElements.length === 0) return;
    jumpToDiffSearchMatch(diffSearch.currentIndex + 1);
  });
  closeBtn?.addEventListener("click", closeDiffSearch);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDiffSearch();
  });

  // R20 #42: focus → show recent searches; blur → hide (with click guard).
  // R23 #48: multi-select — module-level Set tracks checkbox selections.
  let recentSearchSelected = new Set<string>();
  const showRecentSearches = () => {
    if (!diffSearch.history) return;
    const recent = getRecentSearches().filter((entry) => entry !== (diffSearch.input?.value ?? ""));
    if (recent.length === 0) {
      diffSearch.history.hidden = true;
      return;
    }
    // R23 #48: reset selection on every re-render (mutually exclusive with Clear).
    recentSearchSelected = new Set<string>();
    diffSearch.history.innerHTML = "";
    const title = document.createElement("div");
    title.className = "diff-search-history-title";
    title.textContent = t("search.recent.title");
    diffSearch.history.appendChild(title);

    // R23 #48: when ≥1 selected → "Delete selected"; when 0 → "Clear" (R22).
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "diff-search-history-clear"; // keep same class for styling
    actionBtn.setAttribute("data-i18n", "search.recent.clear");
    actionBtn.textContent = t("search.recent.clear");
    actionBtn.addEventListener("click", () => {
      clearRecentSearches();
      showRecentSearches();
      showToast(t("search.recent.clear.confirm"));
    });
    diffSearch.history.appendChild(actionBtn);

    for (const entry of recent) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "diff-search-history-item";
      item.setAttribute("role", "option");
      item.dataset.query = entry;
      item.textContent = entry;
      diffSearch.history.appendChild(item);

      // R23 #48: per-item checkbox for multi-select bulk delete.
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "diff-search-history-checkbox";
      checkbox.dataset.query = entry;
      checkbox.setAttribute("aria-label", t("search.recent.select"));
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          recentSearchSelected.add(entry);
        } else {
          recentSearchSelected.delete(entry);
        }
        // Mutually exclusive: update button text + behavior based on selection count.
        if (recentSearchSelected.size > 0) {
          actionBtn.textContent = `${t("search.recent.bulkDelete")} (${recentSearchSelected.size})`;
          actionBtn.setAttribute("data-i18n", "search.recent.bulkDelete");
          actionBtn.onclick = () => {
            removeRecentSearches([...recentSearchSelected]);
            recentSearchSelected = new Set<string>();
            showRecentSearches();
          };
        } else {
          actionBtn.textContent = t("search.recent.clear");
          actionBtn.setAttribute("data-i18n", "search.recent.clear");
          actionBtn.onclick = () => {
            clearRecentSearches();
            showRecentSearches();
            showToast(t("search.recent.clear.confirm"));
          };
        }
      });
      diffSearch.history.insertBefore(checkbox, item);
    }
    diffSearch.history.hidden = false;
  };

  const hideRecentSearchesSoon = () => {
    // 120ms gives the user time to click an item before the dropdown
    // tears down; the click handler clears the timeout via
    // diffSearch.historyClickGuard.
    const id = window.setTimeout(() => {
      if (diffSearch.historyClickGuard !== id) return;
      if (diffSearch.history) diffSearch.history.hidden = true;
    }, 120);
    diffSearch.historyClickGuard = id;
  };

  diffSearch.input?.addEventListener("focus", showRecentSearches);
  diffSearch.input?.addEventListener("blur", hideRecentSearchesSoon);

  // Delegate clicks on recent-search items. Use mousedown so the
  // input's blur doesn't fire before our handler runs.
  historyRoot.addEventListener("mousedown", (event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLElement>(".diff-search-history-item");
    if (!btn) return;
    event.preventDefault();
    const query = btn.dataset.query ?? "";
    if (!query || !diffSearch.input) return;
    diffSearch.input.value = query;
    runSearch();
    diffSearch.input.focus();
  });

  if (startQuery) runSearch();
}

// Capture-phase listener so we beat the browser's native find
// (which would steal focus from the comment textarea and behave
// inconsistently across the @pierre/diffs canvas). We skip when a
// text input is focused (so native find still works inside comment
// textareas — the user can search inside their own draft comment if
// they prefer).
window.addEventListener(
  "keydown",
  (event) => {
    if (event.isComposing) return;
    const isFindCombo =
      (event.key === "f" || event.key === "F") && (event.metaKey || event.ctrlKey);
    if (isFindCombo) {
      event.preventDefault();
      openDiffSearch();
      return;
    }
    if (event.key === "F3") {
      event.preventDefault();
      if (!diffSearch.overlay) openDiffSearch();
      if (diffSearch.matchElements.length === 0) return;
      jumpToDiffSearchMatch(diffSearch.currentIndex + (event.shiftKey ? -1 : 1));
      return;
    }
    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      if (isTextInputFocused()) return;
      event.preventDefault();
      openDiffSearch();
      return;
    }
    if (
      (event.key === "p" || event.key === "P") &&
      (event.metaKey || event.ctrlKey) &&
      !event.shiftKey
    ) {
      event.preventDefault();
      openCmdPPalette();
      return;
    }
    if (
      (event.key === "/" || event.key === "?") &&
      (event.metaKey || event.ctrlKey) &&
      !event.shiftKey
    ) {
      event.preventDefault();
      showHelpModal();
      return;
    }
  },
  true,
);

function openCmdPPalette(): void {
  if (isTextInputFocused()) return;
  const ordered = getOrderedFiles();
  let selectedIndex = -1;
  const overlay = document.createElement("div");
  overlay.className = "cmd-p-overlay";
  const palette = document.createElement("div");
  palette.className = "cmd-p-palette";
  palette.setAttribute("role", "dialog");
  palette.setAttribute("aria-label", "File jumper");
  const inputWrap = document.createElement("div");
  inputWrap.className = "cmd-p-input-wrap";
  inputWrap.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><input class="cmd-p-input" type="text" placeholder="Jump to file…" autocomplete="off" autocorrect="off" spellcheck="false"/>`;
  const results = document.createElement("div");
  results.className = "cmd-p-results";
  const footer = document.createElement("div");
  footer.className = "cmd-p-footer";
  footer.innerHTML = `<span><kbd>↵</kbd> jump</span><span><kbd>↑↓</kbd> navigate</span><span><kbd>Esc</kbd> close</span>`;
  palette.appendChild(inputWrap);
  palette.appendChild(results);
  palette.appendChild(footer);
  overlay.appendChild(palette);
  document.body.appendChild(overlay);
  const input = inputWrap.querySelector(".cmd-p-input") as HTMLInputElement;
  input.focus();
  const close = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
  const renderResults = (query: string) => {
    const q = query.toLowerCase();
    const filtered = ordered.filter((f) => !q || f.path.toLowerCase().includes(q)).slice(0, 10);
    results.innerHTML = "";
    selectedIndex = -1;
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cmd-p-empty";
      empty.textContent = query ? `No files match "${query}"` : "No files available";
      results.appendChild(empty);
      return;
    }
    filtered.forEach((file) => {
      const item = document.createElement("div");
      item.className = "cmd-p-result";
      item.setAttribute("data-path", file.path);
      let displayPath = file.path;
      if (q) {
        const idx = file.path.toLowerCase().indexOf(q);
        displayPath =
          idx >= 0
            ? escapeHtml(file.path.slice(0, idx)) +
              "<mark>" +
              escapeHtml(file.path.slice(idx, idx + q.length)) +
              "</mark>" +
              escapeHtml(file.path.slice(idx + q.length))
            : escapeHtml(file.path);
      } else {
        displayPath = escapeHtml(file.path);
      }
      item.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><rect x="5" y="7" width="6" height="4" rx="0.5" stroke="currentColor" stroke-width="1"/></svg><span class="file-path">${displayPath}</span>`;
      item.addEventListener("click", () => {
        jumpToFile(file.path);
        close();
      });
      results.appendChild(item);
    });
    if (filtered.length > 0) {
      selectedIndex = 0;
      results.children[0]?.classList.add("active");
    }
  };
  const selectNext = (dir: number) => {
    const items = results.querySelectorAll<HTMLElement>(".cmd-p-result");
    if (items.length === 0) return;
    items[selectedIndex]?.classList.remove("active");
    selectedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex + dir));
    items[selectedIndex]?.classList.add("active");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  };
  const confirmSelection = () => {
    const items = results.querySelectorAll<HTMLElement>(".cmd-p-result");
    const selected = items[selectedIndex];
    if (selected) {
      const path = selected.getAttribute("data-path");
      if (path) {
        jumpToFile(path);
        close();
      }
    }
  };
  installImeSafeInputListener(input, (value) => renderResults(value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectNext(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectNext(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      confirmSelection();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  renderResults("");
}

function showHelpModal(): void {
  if (state.showHelp) return;
  state.showHelp = true;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay help-overlay";
  const dialog = document.createElement("div");
  dialog.className = "modal-dialog help-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "help-modal-title");
  dialog.innerHTML = `<h3 id="help-modal-title">Keyboard shortcuts</h3><p class="help-intro">Quick reference for the most common shortcuts. Press <kbd>?</kbd> or <kbd>Esc</kbd> to close.</p><div class="help-grid"><div class="help-row"><kbd>n</kbd><span>Jump to next finding (Conversation tab)</span></div><div class="help-row"><kbd>p</kbd><span>Jump to previous finding (Conversation tab)</span></div><div class="help-row"><kbd>Ctrl+F</kbd> / <kbd>Cmd+F</kbd><span>Find text inside the loaded diff</span></div><div class="help-row"><kbd>/</kbd><span>Find in diffs (alternative, no modifier)</span></div><div class="help-row"><kbd>Cmd+P</kbd> / <kbd>Ctrl+P</kbd><span>Open the file quick-jump palette</span></div><div class="help-row"><kbd>Cmd+/</kbd> / <kbd>Ctrl+/</kbd><span>Open this help overlay</span></div><div class="help-row"><kbd>Enter</kbd><span>Submit finding (when comment is focused)</span></div><div class="help-row"><kbd>Esc</kbd><span>Close any open modal, palette, or search bar</span></div><div class="help-row"><kbd>Tab</kbd><span>Move focus inside forms (works in every input)</span></div><div class="help-row"><kbd>?</kbd><span>Open this help overlay (alternative to Cmd+/)</span></div></div><div class="modal-actions"><button id="help-close" class="primary" type="button">Close</button></div>`;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  const close = () => {
    state.showHelp = false;
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
  const closeBtn = dialog.querySelector("#help-close") as HTMLButtonElement;
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  installModalA11y(dialog, close);
  closeBtn.focus();
}

// ── File-type icon table ──
//
// The icon table is a curated subset of vscode-material-icon-theme (Apache-2.0),
// simplified to single-color SVGs that respect `currentColor` so callers can
// re-color per theme or per language via CSS. Every entry corresponds to either
// an exact filename match (Dockerfile, LICENSE, .gitignore, …) or a file
// extension. `fileExt()` returns the matched key so the sidebar can set
// `data-ext` on the icon element and CSS rules can color it per-language.
//
// Sources of inspiration for the SVG paths:
//   - vscode-material-icon-theme (https://github.com/PKief/vscode-material-icon-theme)
//   - vscode-icons (https://github.com/vscode-icons/vscode-icons)
//   - phosphor-icons (https://phosphoricons.com/) — for the line/folder icons
//
// All SVGs use the same 14×14 viewBox so the existing layout keeps working.

const FOLDER_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.5a1.5 1.5 0 0 1 1.06.44L8.69 3.5H13a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5z"/></svg>`;
const FOLDER_OPEN_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.5a1.5 1.5 0 0 1 1.06.44L8.69 3.5H13a1.5 1.5 0 0 1 1.5 1.5H2A1.5 1.5 0 0 0 .5 6.5v-3zm0 4H14l-1.3 5.2A1.5 1.5 0 0 1 11.24 14H3a1.5 1.5 0 0 1-1.5-1.5z"/></svg>`;
const FILE_DEFAULT_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V6.06a1.5 1.5 0 0 0-.44-1.06L10.5 1.94A1.5 1.5 0 0 0 9.44 1.5z"/></svg>`;

// Special filename entries (matched case-insensitively against the basename).
// Listed before extension overrides so e.g. "Dockerfile.dockerignore" can be
// resolved by the dotfile rule when present.
const FILENAME_ICON_OVERRIDES: Record<string, string> = {
  dockerfile: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h2v2H2zm3 0h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zM2 7h2v2H2zm3 0h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm-6 3h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zM1 12h1.5v.5l1 1.5h9l1-1.5V12H15v1l-1.5 2h-11L1 13z"/></svg>`,
  containerfile: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h2v2H2zm3 0h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zM2 7h2v2H2zm3 0h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm-6 3h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zM1 12h1.5v.5l1 1.5h9l1-1.5V12H15v1l-1.5 2h-11L1 13z"/></svg>`,
  makefile: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10v2H3zm0 3h10v2H3zm0 3h10v2H3zm0 3h7v2H3zm0 3h10v2H3z"/></svg>`,
  rakefile: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 2v8h8V4zm1.5 1.5h2v2h-2zm3 0h2v2h-2zm-3 3h2v2h-2zm3 0h2v2h-2z"/></svg>`,
  license: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM2 4h2v3h3V4h2v8H7V9H4v3H2zm9 4h2v-1h-1V6h1V5h-2z"/></svg>`,
  licence: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM2 4h2v3h3V4h2v8H7V9H4v3H2zm9 4h2v-1h-1V6h1V5h-2z"/></svg>`,
  readme: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 14V2H2v12zM3 3h10v10H3zm2 8h1V6.5l1 2.5L8 6.5V11h1V5H7.5L7 7.5 6.5 5H5z"/></svg>`,
  changelog: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10v2H3zm0 3h10v2H3zm0 3h7v2H3zm0 3h10v2H3zm0 3h10v1H3z"/></svg>`,
  contributing: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v10H2zm1.5 1.5V7h3V4.5zm0 4h3v3h-3zm4.5-4V7h3V4.5zm0 4h3v3h-3z"/></svg>`,
  ".gitignore": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 3h6v2H2zm0 3h12v2H2zm0 3h6v2H2z"/></svg>`,
  ".gitattributes": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 3h6v2H2zm0 3h12v2H2zm0 3h6v2H2z"/></svg>`,
  ".editorconfig": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm1.5 1.5v9h9v-9zm1.5 1.5h6v1.5H5zm0 3h6v1.5H5zm0 3h4v1.5H5z"/></svg>`,
  ".env": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l5 2v5c0 3-2 5.5-5 7-3-1.5-5-4-5-7V3zm-2 5l1 1 3-3-1-1-2 2-1-1z"/></svg>`,
  ".npmrc": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  ".nvmrc": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  ".prettierrc": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 3h10v10H3zm2 2v6h6V5zm1 1h4v1H6zm0 2h4v1H6zm0 2h2v1H6z"/></svg>`,
  ".eslintrc": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3l1 4 1.5-3 1.5 3 1-4h-1l-.5 2L7 5H6L5 7l-.5-2zm5 0v6h5v-1h-4V8h3V7h-3V6h4V5z"/></svg>`,
  ".dockerignore": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h2v2H2zm3 0h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zM2 7h2v2H2zm3 0h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm-6 3h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zM1 12h1.5v.5l1 1.5h9l1-1.5V12H15v1l-1.5 2h-11L1 13z"/></svg>`,
  ".babelrc": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3l1 4 1.5-3 1.5 3 1-4h-1l-.5 2L7 5H6L5 7l-.5-2zm5 0v6h5v-1h-4V8h3V7h-3V6h4V5z"/></svg>`,
  ".gitmodules": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 3h6v2H2zm0 3h12v2H2zm0 3h6v2H2z"/></svg>`,
  "package.json": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm1.5 1.5v9h9v-9zm1.5 1.5h6v1.5H5zm0 3h6v1.5H5zm0 3h4v1.5H5z"/></svg>`,
  "package-lock.json": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm1.5 1.5v9h9v-9zm1.5 1.5h6v1.5H5zm0 3h6v1.5H5zm0 3h4v1.5H5z"/></svg>`,
  "tsconfig.json": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5zM2 2v12h12V2zM3.75 11h1.5V8.5h2V11h1.5V5h-1.5v2h-2V5h-1.5zm6.5 0h1.5V9.5L13 11h1.75L13 8.75 14.75 6.5H13l-1.25 1.5V5h-1.5z"/></svg>`,
  "bun.lock": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zM6 5v2h4V5a2 2 0 1 0-4 0z"/></svg>`,
  "bun.lockb": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zM6 5v2h4V5a2 2 0 1 0-4 0z"/></svg>`,
  "yarn.lock": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zM6 5v2h4V5a2 2 0 1 0-4 0z"/></svg>`,
  "pnpm-lock.yaml": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zM6 5v2h4V5a2 2 0 1 0-4 0z"/></svg>`,
  "pnpm-workspace.yaml": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zM6 5v2h4V5a2 2 0 1 0-4 0z"/></svg>`,
  "cargo.toml": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2V9h4v1H3v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
  "go.mod": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h3v2H4v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
  "go.sum": `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h3v2H4v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
};

// Extension entries. Keys are lowercased file extensions (no leading dot).
// SVG paths are kept short to keep the bundle small.
const EXTENSION_ICON_OVERRIDES: Record<string, string> = {
  // Web / JS / TS
  ts: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2v12h12V2zm4 6h3v1H8v4H7V9H6zm5 0h2v1h-2v1h1a1.003 1.003 0 0 1 1 1v1a1.003 1.003 0 0 1-1 1h-2v-1h2v-1h-1a1.003 1.003 0 0 1-1-1V9a1.003 1.003 0 0 1 1-1"/></svg>`,
  tsx: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><g fill="currentColor"><path d="M2 2v12h12V2zm1 1h10v10H3z"/><path d="M5 7v1h1v4h1V8h1V7zm5 0a1.003 1.003 0 0 0-1 1v1a1.003 1.003 0 0 0 1 1h1v1H9v1h2a1.003 1.003 0 0 0 1-1v-1a1.003 1.003 0 0 0-1-1h-1V8h2V7z"/></g></svg>`,
  js: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2v12h12V2zm6 6h1v4a1.003 1.003 0 0 1-1 1H7a1.003 1.003 0 0 1-1-1v-1h1v1h1zm3 0h2v1h-2v1h1a1.003 1.003 0 0 1 1 1v1a1.003 1.003 0 0 1-1 1h-2v-1h2v-1h-1a1.003 1.003 0 0 1-1-1V9a1.003 1.003 0 0 1 1-1"/></svg>`,
  jsx: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5zM2 2v12h12V2zM3 11h1.5V8.5H6V11h1.5V5H6v2H4.5V5H3zm5 0h1.5V9.5L11 11h1.75L11 8.75 12.75 6.5H11l-1.5 1.5V5H8z"/></svg>`,
  mjs: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1h12v14H2zm1.5 1.5V13.5h9V2.5zM4.5 11c0 .8.5 1.5 1.5 1.5s1.5-.5 1.5-1.5V6H6v5c0 .3-.2.5-.5.5s-.5-.2-.5-.5H4c0 .3 0 0 0 0zm5.5 0c0 .8.5 1.5 1.5 1.5s1.5-.5 1.5-1.5c0-.7-.4-1.1-1.2-1.3l-.4-.1c-.4-.1-.4-.2-.4-.3 0-.2.1-.3.4-.3.3 0 .5.2.5.5h1c0-.8-.5-1.4-1.5-1.4S9.5 7.7 9.5 8.5c0 .7.4 1 1.2 1.2l.4.1c.3.1.4.2.4.3 0 .2-.2.3-.4.3-.3 0-.5-.2-.5-.5z"/></svg>`,
  cjs: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1h12v14H2zm1.5 1.5V13.5h9V2.5zM4.5 11c0 .8.5 1.5 1.5 1.5s1.5-.5 1.5-1.5V6H6v5c0 .3-.2.5-.5.5s-.5-.2-.5-.5H4c0 .3 0 0 0 0zm5.5 0c0 .8.5 1.5 1.5 1.5s1.5-.5 1.5-1.5c0-.7-.4-1.1-1.2-1.3l-.4-.1c-.4-.1-.4-.2-.4-.3 0-.2.1-.3.4-.3.3 0 .5.2.5.5h1c0-.8-.5-1.4-1.5-1.4S9.5 7.7 9.5 8.5c0 .7.4 1 1.2 1.2l.4.1c.3.1.4.2.4.3 0 .2-.2.3-.4.3-.3 0-.5-.2-.5-.5z"/></svg>`,
  vue: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5L8 15l8-13.5h-3L8 9 3 1.5zm6 0l2 3.5L10 1.5H8.5L8 2.5 7.5 1.5z"/></svg>`,
  svelte: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm3 2.5h2v.5L6 5v3.5l1.5 2v.5H5v-.5L6.5 8V4.5zm3 0h2v.5L9 5v3.5l1.5 2v.5H8v-.5L9.5 8V4.5z"/></svg>`,
  astro: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 13H2zm0 2L4 12h8z"/></svg>`,
  html: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M20 18h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 20 22h2v2h2v-2c0-.388-.562-.851-1.254-1.034C20.356 20.34 20 18.84 20 18m-3.254 2.966C14.356 20.34 14 18.84 14 18h-2v-2h-2v8h2v-2h4v2h2v-2c0-.388-.562-.851-1.254-1.034"/><path d="M24 4H4v20a4 4 0 0 0 4 4h16.16A3.84 3.84 0 0 0 28 24.16V8a4 4 0 0 0-4-4m2 14h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 26 22v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"/></svg>`,
  htm: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm1.5 2h4l-.1 1.5H7.5L7.4 8h2.6L9.9 9.5 7.5 10.2 5.1 9.5 5 7.5h1.5l.1.7.9.3.9-.3.1-.7H6z"/></svg>`,
  css: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M20 18h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 20 22h2v2h2v-2c0-.388-.562-.851-1.254-1.034C20.356 20.34 20 18.84 20 18m-3.254 2.966C14.356 20.34 14 18.84 14 18h-2v-2h-2v8h2v-2h4v2h2v-2c0-.388-.562-.851-1.254-1.034"/><path d="M24 4H4v20a4 4 0 0 0 4 4h16.16A3.84 3.84 0 0 0 28 24.16V8a4 4 0 0 0-4-4m2 14h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 26 22v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"/></svg>`,
  scss: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm.5 2h6l-.1 1H8.5L8.4 7H10l-.1 1H7.9L7.8 9.2l1.7.4 1.7-.4.1-1.2h-1l-.1.7-.7.2-.7-.2-.1-1.2h2.3L11 5.5H6z"/></svg>`,
  sass: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm.5 2h6l-.1 1H8.5L8.4 7H10l-.1 1H7.9L7.8 9.2l1.7.4 1.7-.4.1-1.2h-1l-.1.7-.7.2-.7-.2-.1-1.2h2.3L11 5.5H6z"/></svg>`,
  less: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm.5 2h6l-.1 1H8.5L8.4 7H10l-.1 1H7.9L7.8 9.2l1.7.4 1.7-.4.1-1.2h-1l-.1.7-.7.2-.7-.2-.1-1.2h2.3L11 5.5H6z"/></svg>`,
  styl: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10l-.8 12.2L7.5 14.5l-4.7-1.3zM4.5 2.5l.6 9.4 2.4.7 2.4-.7.6-9.4zm.5 2h6l-.1 1H8.5L8.4 7H10l-.1 1H7.9L7.8 9.2l1.7.4 1.7-.4.1-1.2h-1l-.1.7-.7.2-.7-.2-.1-1.2h2.3L11 5.5H6z"/></svg>`,

  // Python
  py: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.86 2A2.86 2.86 0 0 0 7 4.86v1.68h4.29c.39 0 .71.57.71.96H4.86A2.86 2.86 0 0 0 2 10.36v3.781a2.86 2.86 0 0 0 2.86 2.86h1.18v-2.68a2.85 2.85 0 0 1 2.85-2.86h5.25c1.58 0 2.86-1.271 2.86-2.851V4.86A2.86 2.86 0 0 0 14.14 2zm-.72 1.61c.4 0 .72.12.72.71s-.32.891-.72.891c-.39 0-.71-.3-.71-.89s.32-.711.71-.711"/><path d="M17.959 7v2.68a2.85 2.85 0 0 1-2.85 2.859H9.86A2.85 2.85 0 0 0 7 15.389v3.75a2.86 2.86 0 0 0 2.86 2.86h4.28A2.86 2.86 0 0 0 17 19.14v-1.68h-4.291c-.39 0-.709-.57-.709-.96h7.14A2.86 2.86 0 0 0 22 13.64V9.86A2.86 2.86 0 0 0 19.14 7zM8.32 11.513l-.004.004.038-.004zm6.54 7.276c.39 0 .71.3.71.89a.71.71 0 0 1-.71.71c-.4 0-.72-.12-.72-.71s.32-.89.72-.89"/></svg>`,
  pyi: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 1h1a2.5 2.5 0 0 1 2.5 2.5V5H7.5A1.5 1.5 0 0 1 6 3.5 1.5 1.5 0 0 1 7.5 2zM4 4.5A2.5 2.5 0 0 1 6.5 2H8v.5A1.5 1.5 0 0 1 6.5 4H4.5zM2 6.5A2.5 2.5 0 0 1 4.5 4H8v-.5h.5A1.5 1.5 0 0 1 10 5v.5H6.5A2.5 2.5 0 0 1 4 8v.5h-.5A1.5 1.5 0 0 1 2 7zM12 9.5A2.5 2.5 0 0 1 9.5 12H8v.5A1.5 1.5 0 0 1 6.5 14h-.5A2.5 2.5 0 0 1 4 11.5V11h5.5A2.5 2.5 0 0 0 12 8.5V8h.5A1.5 1.5 0 0 1 14 9.5zM8 13a1.5 1.5 0 0 1-1.5 1.5H6.5z"/></svg>`,
  pyc: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 1h1a2.5 2.5 0 0 1 2.5 2.5V5H7.5A1.5 1.5 0 0 1 6 3.5 1.5 1.5 0 0 1 7.5 2zM4 4.5A2.5 2.5 0 0 1 6.5 2H8v.5A1.5 1.5 0 0 1 6.5 4H4.5zM2 6.5A2.5 2.5 0 0 1 4.5 4H8v-.5h.5A1.5 1.5 0 0 1 10 5v.5H6.5A2.5 2.5 0 0 1 4 8v.5h-.5A1.5 1.5 0 0 1 2 7zM12 9.5A2.5 2.5 0 0 1 9.5 12H8v.5A1.5 1.5 0 0 1 6.5 14h-.5A2.5 2.5 0 0 1 4 11.5V11h5.5A2.5 2.5 0 0 0 12 8.5V8h.5A1.5 1.5 0 0 1 14 9.5zM8 13a1.5 1.5 0 0 1-1.5 1.5H6.5z"/></svg>`,
  pyd: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 1h1a2.5 2.5 0 0 1 2.5 2.5V5H7.5A1.5 1.5 0 0 1 6 3.5 1.5 1.5 0 0 1 7.5 2zM4 4.5A2.5 2.5 0 0 1 6.5 2H8v.5A1.5 1.5 0 0 1 6.5 4H4.5zM2 6.5A2.5 2.5 0 0 1 4.5 4H8v-.5h.5A1.5 1.5 0 0 1 10 5v.5H6.5A2.5 2.5 0 0 1 4 8v.5h-.5A1.5 1.5 0 0 1 2 7zM12 9.5A2.5 2.5 0 0 1 9.5 12H8v.5A1.5 1.5 0 0 1 6.5 14h-.5A2.5 2.5 0 0 1 4 11.5V11h5.5A2.5 2.5 0 0 0 12 8.5V8h.5A1.5 1.5 0 0 1 14 9.5zM8 13a1.5 1.5 0 0 1-1.5 1.5H6.5z"/></svg>`,
  ipynb: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm1.5 1.5v9h9v-9zm2 1.5h5v1.5h-5zm0 3h5v1.5h-5zm0 3h3v1.5h-3z"/></svg>`,

  // C-family
  c: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M19.563 22A5.57 5.57 0 0 1 14 16.437v-2.873A5.57 5.57 0 0 1 19.563 8H24V2h-4.437A11.563 11.563 0 0 0 8 13.563v2.873A11.564 11.564 0 0 0 19.563 28H24v-6Z"/></svg>`,
  h: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M19.563 22A5.57 5.57 0 0 1 14 16.437v-2.873A5.57 5.57 0 0 1 19.563 8H24V2h-4.437A11.563 11.563 0 0 0 8 13.563v2.873A11.564 11.564 0 0 0 19.563 28H24v-6Z"/></svg>`,
  cpp: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M28 14v-4h-2v4h-6v-4h-2v4h-4v2h4v4h2v-4h6v4h2v-4h4v-2z"/><path d="M13.563 22A5.57 5.57 0 0 1 8 16.437v-2.873A5.57 5.57 0 0 1 13.563 8H18V2h-4.437A11.563 11.563 0 0 0 2 13.563v2.873A11.564 11.564 0 0 0 13.563 28H18v-6Z"/></svg>`,
  hpp: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M28 14v-4h-2v4h-6v-4h-2v4h-4v2h4v4h2v-4h6v4h2v-4h4v-2z"/><path d="M13.563 22A5.57 5.57 0 0 1 8 16.437v-2.873A5.57 5.57 0 0 1 13.563 8H18V2h-4.437A11.563 11.563 0 0 0 2 13.563v2.873A11.564 11.564 0 0 0 13.563 28H18v-6Z"/></svg>`,
  cc: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM3 6h2v1h1V6h1v4H6V9H5v1H3z"/></svg>`,
  m: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM9 4l5 4-5 4z"/></svg>`,
  mm: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM9 4l5 4-5 4z"/></svg>`,

  // Systems
  go: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M2 12h4v2H2zm-2 4h6v2H0zm4 4h2v2H4zm16.954-5H14v3h3.239a4.42 4.42 0 0 1-3.531 2 2.65 2.65 0 0 1-2.053-.858 2.86 2.86 0 0 1-.628-2.28A4.515 4.515 0 0 1 15.292 13a2.73 2.73 0 0 1 1.749.584l2.962-1.185A5.6 5.6 0 0 0 15.292 10a7.526 7.526 0 0 0-7.243 6.5 5.614 5.614 0 0 0 5.659 6.5 7.526 7.526 0 0 0 7.243-6.5 6.4 6.4 0 0 0 .003-1.5"/><path d="M26.292 10a7.526 7.526 0 0 0-7.243 6.5 5.614 5.614 0 0 0 5.659 6.5 7.526 7.526 0 0 0 7.243-6.5 5.614 5.614 0 0 0-5.659-6.5m2.681 6.137A4.515 4.515 0 0 1 24.708 20a2.65 2.65 0 0 1-2.053-.858 2.86 2.86 0 0 1-.628-2.28A4.515 4.515 0 0 1 26.292 13a2.65 2.65 0 0 1 2.053.858 2.86 2.86 0 0 1 .628 2.28Z"/></svg>`,
  rs: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="m30 12-4-2V6h-4l-2-4-4 2-4-2-2 4H6v4l-4 2 2 4-2 4 4 2v4h4l2 4 4-2 4 2 2-4h4v-4l4-2-2-4ZM6 16a9.9 9.9 0 0 1 .842-4H10v8H6.842A9.9 9.9 0 0 1 6 16m10 10a9.98 9.98 0 0 1-7.978-4H16v-2h-2v-2h4c.819.819.297 2.308 1.179 3.37a1.89 1.89 0 0 0 1.46.63h3.34A9.98 9.98 0 0 1 16 26m-2-12v-2h4a1 1 0 0 1 0 2Zm11.158 6H24a2.006 2.006 0 0 1-2-2 2 2 0 0 0-2-2 3 3 0 0 0 3-3q0-.08-.004-.161A3.115 3.115 0 0 0 19.83 10H8.022a9.986 9.986 0 0 1 17.136 10"/></svg>`,
  java: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 13c0-1 .8-2 2-3 1 0 1 0 1 1s-1 2-1 3c0 1 1 1 2 1 2 0 4-1 4-3 0-1-1-1-1-2 0-2 1-3 0-5C12 3 11 1 9 1 7 1 5 2 5 4c0 1 1 2 1 2 0 1-1 1-1 2 0 2 1 2 1 2 0 1-1 1-1 3zm4 0c0-1 1-1 1-2 1 0 1 1 1 2z"/></svg>`,
  kt: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2V9h4v1H3v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
  kts: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H4v2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2V9h4v1H3v2h3v2H2zm7 0h5v2h-3v1h3v2h-3v1h3v2H9z"/></svg>`,
  swift: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 13l4-4 4 1-3 3zm5-5l5-5 2 1-4 5z"/></svg>`,
  dart: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 13L8 1l3 6-5 6zm6-1l3-5 2 4-3 4z"/></svg>`,
  php: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v10H2zm2 2v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  rb: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM5 5h4l-1 2H5zm-1 4h5l-1 2H4z"/></svg>`,
  scala: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 2v8h8V4zm2 2h4v1H6zm0 2h4v1H6zm0 2h2v1H6z"/></svg>`,
  clj: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v2H3zm0 3h6v2H3zm0 3h10v2H3zm0 3h6v2H3zm0 3h10v1H3z"/></svg>`,
  cljs: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v2H3zm0 3h6v2H3zm0 3h10v2H3zm0 3h6v2H3zm0 3h10v1H3z"/></svg>`,
  ex: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 2v8h8V4zm2 1h4v1H6zm0 2h4v1H6zm0 2h2v1H6z"/></svg>`,
  exs: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 2v8h8V4zm2 1h4v1H6zm0 2h4v1H6zm0 2h2v1H6z"/></svg>`,
  lua: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 3h12v2H2zm0 3h12v2H2zm0 3h6v2H2z"/></svg>`,
  zig: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12l-2 4-3-1-2 4-3-1 1 3-3 3z"/></svg>`,
  nim: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V1zM2 4h2v3h3V4h2v8H7V9H4v3H2z"/></svg>`,
  v: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L2 14h2l4-9 4 9h2z"/></svg>`,

  // Shell / scripts
  sh: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2a1 1 0 0 0-1 1v10c0 .554.446 1 1 1h12c.554 0 1-.446 1-1V3a1 1 0 0 0-1-1zm0 3h12v8H2zm1 2 2 2-2 2 1 1 3-3-3-3zm5 3.5V12h5v-1.5z"/></svg>`,
  bash: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5 5 5 0 0 1 3.5 1.5L9 6h4V2l-1.5 1.5A7 7 0 0 0 8 1zM5 6l3 2-3 2z"/></svg>`,
  zsh: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5 5 5 0 0 1 3.5 1.5L9 6h4V2l-1.5 1.5A7 7 0 0 0 8 1zM5 6l3 2-3 2z"/></svg>`,
  fish: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5 5 5 0 0 1 3.5 1.5L9 6h4V2l-1.5 1.5A7 7 0 0 0 8 1zM5 6l3 2-3 2z"/></svg>`,
  ps1: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5 5 5 0 0 1 3.5 1.5L9 6h4V2l-1.5 1.5A7 7 0 0 0 8 1zM5 6l3 2-3 2z"/></svg>`,

  // Data / config
  json: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="m14 10-4 3.5L6 10H4v12h4v-6l2 2 2-2v6h4V10zm12 6v-6h-4v6h-4l6 8 6-8z"/></svg>`,
  json5: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h7.5zM3 1.5A.5.5 0 0 0 2.5 2v12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V5H10a2 2 0 0 1-2-2V1.5zm6.5 4v.5c0 .8.7 1.5 1.5 1.5H11v.5h-1V7h1.5A1.5 1.5 0 0 0 13 5.5V5h-1.5a.5.5 0 0 1-.5-.5V4h-1v.5h1V6h-.5a.5.5 0 0 1-.5-.5z"/></svg>`,
  jsonc: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h7.5zM3 1.5A.5.5 0 0 0 2.5 2v12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V5H10a2 2 0 0 1-2-2V1.5zm6.5 4v.5c0 .8.7 1.5 1.5 1.5H11v.5h-1V7h1.5A1.5 1.5 0 0 0 13 5.5V5h-1.5a.5.5 0 0 1-.5-.5V4h-1v.5h1V6h-.5a.5.5 0 0 1-.5-.5z"/></svg>`,
  yaml: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  yml: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  toml: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  xml: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  ini: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  env: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l5 2v5c0 3-2 5.5-5 7-3-1.5-5-4-5-7V3zm-2 5l1 1 3-3-1-1-2 2-1-1z"/></svg>`,
  properties: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  conf: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  cfg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  lock: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M25 12h-3V8a6 6 0 0 0-12 0v4H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V13a1 1 0 0 0-1-1M14 8a2 2 0 0 1 4 0v4h-4Zm2 17a4 4 0 1 1 4-4 4 4 0 0 1-4 4"/></svg>`,

  // Documentation
  md: `<svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="m4 4 2 22 10 2 10-2 2-22Zm19.72 7H11.28l.29 3h11.86l-.802 9.335L15.99 25l-6.635-1.646L8.93 19h3.02l.19 2 3.86.77 3.84-.77.29-4H8.84L8 8h16Z"/></svg>`,
  mdx: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 14V2H2v12zM3 3h10v10H3zm2 8h1V6.5l1 2.5L8 6.5V11h1V5H7.5L7 7.5 6.5 5H5zm5 0h2v-1h-1V6h1V5h-2z"/></svg>`,
  txt: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v12H3zm1.5 1.5v9h7v-9zM5 5h6v1.5H5zm0 3h6v1.5H5zm0 3h4v1.5H5z"/></svg>`,
  rst: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v12H3zm1.5 1.5v9h7v-9zM5 5h6v1.5H5zm0 3h6v1.5H5zm0 3h4v1.5H5z"/></svg>`,
  log: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v12H3zm1.5 1.5v9h7v-9zM5 5h6v1.5H5zm0 3h6v1.5H5zm0 3h4v1.5H5z"/></svg>`,

  // SQL / DB
  sql: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v8H2zm1.5 1.5v5h9v-5zm1.5 1.5h6v1.5H5z"/></svg>`,
  prisma: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 13L8 1l3 6-5 6zm6-1l3-5 2 4-3 4z"/></svg>`,
  graphql: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 4v6l-6 4-6-4V5zm0 2L4 6v4l4 3 4-3V6z"/></svg>`,
  gql: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 4v6l-6 4-6-4V5zm0 2L4 6v4l4 3 4-3V6z"/></svg>`,

  // Infra / devops
  tf: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 4v6l-6 4-6-4V5zm0 2L4 6v4l4 3 4-3V6z"/></svg>`,
  hcl: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  proto: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  graphqls: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 4v6l-6 4-6-4V5zm0 2L4 6v4l4 3 4-3V6z"/></svg>`,

  // Other
  wasm: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 2v8h8V4zm1.5 1.5h5v1H5.5zm0 2.5h5v1H5.5zm0 2.5h3v1h-3z"/></svg>`,
  asm: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
  vim: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2zm2 3v6h2V8h1l2 3h2L9 8l2-3H9L7 8H6V5z"/></svg>`,
};

// Returns the language key that should be exposed as `data-ext` on the icon
// element. Mirrors `fileIcon()`'s lookup order so the CSS selector always
// matches the icon actually rendered. Falls back to the lowercased extension
// (or empty string for files without an extension) so callers can still
// attribute a color even when the icon is the generic file.
function fileExt(filename: string): string {
  const base = filename.split("/").pop() ?? filename;
  const lower = base.toLowerCase();
  if (FILENAME_ICON_OVERRIDES[lower]) return lower;
  const dot = base.lastIndexOf(".");
  if (dot < 0) return lower.startsWith(".") ? lower : "";
  return base.slice(dot + 1).toLowerCase();
}

function fileIcon(filename: string): string {
  const ext = fileExt(filename);
  return EXTENSION_ICON_OVERRIDES[ext] ?? FILENAME_ICON_OVERRIDES[ext] ?? FILE_DEFAULT_ICON_SVG;
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
const selectionRoot = document.querySelector("#selection") as HTMLDivElement;
const scopeRoot = document.querySelector("#scope") as HTMLSpanElement;
const statusRoot = document.querySelector("#status") as HTMLDivElement;
const addButton = document.querySelector("#add") as HTMLButtonElement;
const clearButton = document.querySelector("#clear") as HTMLButtonElement;
const submitButton = document.querySelector("#submit") as HTMLButtonElement;
const exportButton = document.querySelector("#export") as HTMLButtonElement | null;
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
  themeMode: readStored<ThemeMode>(THEME_KEY, ["light", "dark", "auto"], "light"),
  diffLayout: readStored<DiffLayout>(LAYOUT_KEY, ["unified", "split"], "split"),
  ignoreWhitespace: readStored<"on" | "off">(IGNORE_WHITESPACE_KEY, ["on", "off"], "off") === "on",
  sidebarMode: readStored<SidebarMode>(SIDEBAR_KEY, ["tree", "flat"], "tree"),
  // R20 #41: "show only unread" toggle — persisted under
  // diff-review:filter-unread. Default false (show all files).
  filterUnread: readStoredFilterUnread(),
  activeTab: readStored<"files" | "commits" | "conversation" | "previously">(
    ACTIVE_TAB_KEY,
    ["files", "commits", "conversation", "previously"],
    "files",
  ),
  conversationFilter: readStored<"open" | "resolved" | "all" | "pinned" | "reacted">(
    CONV_FILTER_KEY,
    ["open", "resolved", "all", "pinned", "reacted"],
    "open",
  ),
  // R14 #23: sort the Conversation panel — 4 modes; default = "newest"
  // (round DESC, created_at ASC) preserves the pre-R14 chronological order.
  sortFindingsBy: readStored<SortFindingsBy>(
    SORT_FINDINGS_KEY,
    ["newest", "oldest", "severity", "file"],
    "newest",
  ),
  // R14 #25: previously-discussed round filter. In-memory only (NOT
  // localStorage — round filter is session-scoped; reload reverts to "all").
  previouslyFilterByRound: "all" as "all" | number,
  // R14 #24: timestamp of the last successful draft save (server-stamped
  // max of client + server clock; see saveDraft). 0 = no save yet this
  // session → indicator hidden. The server's state.draft.lastSavedAt
  // mirrors this on the next GET; the in-memory value is the source of
  // truth for the indicator during the current session.
  draftLastSavedAt: 0 as number,
  priorNotes: [] as Array<{ round: number; notes: string }>,
  priorNotesLoaded: false,
  drawerOpen: false,
  pendingFileFinding: null as string | null,
  showHelp: false,
};

// R25 #52: bulk-select set for sidebar multi-select
const selectedFiles = new Set<string>();

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

// R19 #33: language toggle — one toolbar button flips en ↔ zh-CN.
applyLanguage();
const languageToggle = document.querySelector("#language-toggle");
function applyLanguageToggle(): void {
  if (!(languageToggle instanceof HTMLElement)) return;
  const lang = peekLanguage();
  const btn = languageToggle.querySelector<HTMLButtonElement>("button");
  if (btn) {
    btn.textContent = t("toolbar.lang.toggle");
    btn.setAttribute("aria-label", t("toolbar.lang.ariaLabel"));
    btn.dataset.lang = lang;
  }
}
function buildLanguageToggle(): void {
  if (!(languageToggle instanceof HTMLElement)) return;
  languageToggle.innerHTML = "";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "language-toggle-btn";
  btn.id = "language-toggle-btn";
  languageToggle.appendChild(btn);
  applyLanguageToggle();
}
buildLanguageToggle();
languageToggle?.addEventListener("click", () => {
  const next = peekLanguage() === "zh-CN" ? "en" : "zh-CN";
  setLanguage(next);
  applyLanguageToggle();
});
onLanguageChange(() => applyLanguageToggle());

// R19 #33 AC1.2 follow-up: register static-HTML elements for i18n re-render.
registerUITranslator("app.title", () => t("app.title"));
// R20 #40: re-render the sidebar progress counter on language change —
// its text comes from t("sidebar.reviewProgress", {count,total,percent})
// with runtime params, so it can't go through the static data-i18n
// pipeline. Cheaper than re-walking the DOM.
onLanguageChange(() => renderReviewProgress());
registerUITranslator("skipLink", () => t("skipLink"));
registerUITranslator("toolbar.layout.unified", () => t("toolbar.layout.unified"));
registerUITranslator("toolbar.layout.split", () => t("toolbar.layout.split"));
registerUITranslator("toolbar.ignoreWs", () => t("toolbar.ignoreWs"));
registerUITranslator("toolbar.theme.light", () => t("toolbar.theme.light"));
registerUITranslator("toolbar.theme.auto", () => t("toolbar.theme.auto"));
registerUITranslator("toolbar.theme.dark", () => t("toolbar.theme.dark"));
registerUITranslator("toolbar.review", () => t("toolbar.review"));
registerUITranslator("toolbar.export", () => t("toolbar.export"));
registerUITranslator("toolbar.submit", () => t("toolbar.submit"));
registerUITranslator("sidebar.files", () => t("sidebar.files"));
registerUITranslator("sidebar.commits", () => t("sidebar.commits"));
registerUITranslator("sidebar.conversation", () => t("sidebar.conversation"));
registerUITranslator("sidebar.previously", () => t("sidebar.previously"));
registerUITranslator("sidebar.tree", () => t("sidebar.tree"));
registerUITranslator("sidebar.flat", () => t("sidebar.flat"));
registerUITranslator("sidebar.filter.unread", () => t("sidebar.filter.unread"));
registerUITranslator("save.idle", () => t("save.idle"));
// R21 #44: settings modal i18n (data-i18n elements exist in static HTML).
registerUITranslator("toolbar.settings", () => t("toolbar.settings"));
registerUITranslator("settings.title", () => t("settings.title"));
registerUITranslator("settings.section.appearance", () => t("settings.section.appearance"));
registerUITranslator("settings.section.layout", () => t("settings.section.layout"));
registerUITranslator("settings.section.search", () => t("settings.section.search"));
registerUITranslator("settings.section.language", () => t("settings.section.language"));
registerUITranslator("settings.theme.label", () => t("settings.theme.label"));
registerUITranslator("settings.theme.light", () => t("settings.theme.light"));
registerUITranslator("settings.theme.auto", () => t("settings.theme.auto"));
registerUITranslator("settings.theme.dark", () => t("settings.theme.dark"));
registerUITranslator("settings.layout.label", () => t("settings.layout.label"));
registerUITranslator("settings.layout.unified", () => t("settings.layout.unified"));
registerUITranslator("settings.layout.split", () => t("settings.layout.split"));
registerUITranslator("settings.search.max", () => t("settings.search.max"));
registerUITranslator("settings.reset", () => t("settings.reset"));
registerUITranslator("settings.virtualization.label", () => t("settings.virtualization.label"));
registerUITranslator("settings.virtualization.description", () => t("settings.virtualization.description"));

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

const ignoreWhitespaceToggle = document.querySelector("#ignore-whitespace") as HTMLButtonElement;

function applyIgnoreWhitespace() {
  ignoreWhitespaceToggle.setAttribute("aria-pressed", state.ignoreWhitespace ? "true" : "false");
  ignoreWhitespaceToggle.textContent = state.ignoreWhitespace ? "✓ Ignore ws" : "Ignore ws";
}

function setIgnoreWhitespace(next: boolean) {
  if (state.ignoreWhitespace === next) return;
  state.ignoreWhitespace = next;
  applyIgnoreWhitespace();
  writeStored(IGNORE_WHITESPACE_KEY, next ? "on" : "off");
  renderDiffPanel();
}

applyIgnoreWhitespace();

ignoreWhitespaceToggle.addEventListener("click", () => {
  setIgnoreWhitespace(!state.ignoreWhitespace);
});

function isVirtualizationEnabled(): boolean {
  return localStorage.getItem(DIFF_VIRTUALIZATION_KEY) !== "false";
}

// R21 #44: Settings modal
const settingsOverlay = document.querySelector("#settings-overlay") as HTMLElement;
const settingsModal = document.querySelector("#settings-modal") as HTMLElement;
const settingsBtn = document.querySelector("#settings-btn") as HTMLButtonElement;
const settingsThemeSelect = document.querySelector("#settings-theme") as HTMLSelectElement;
const settingsLayoutSelect = document.querySelector("#settings-layout") as HTMLSelectElement;
const settingsLanguageSelect = document.querySelector("#settings-language") as HTMLSelectElement;
const settingsSearchMaxSelect = document.querySelector("#settings-search-max") as HTMLSelectElement;
const settingsResetBtn = document.querySelector("#settings-reset") as HTMLButtonElement;
const settingsOkBtn = document.querySelector("#settings-ok") as HTMLButtonElement;
const settingsCloseBtn = document.querySelector("#settings-close") as HTMLButtonElement;
const settingsVirtualizationToggle = document.querySelector("#settings-virtualization-toggle") as HTMLInputElement;

let settingsDispose: (() => void) | null = null;

function openSettingsModal(): void {
  settingsThemeSelect.value = state.themeMode;
  settingsLayoutSelect.value = state.diffLayout;
  settingsLanguageSelect.value = peekLanguage();
  const stored = localStorage.getItem(SEARCH_HISTORY_MAX_KEY);
  const max = stored ? String(stored) : String(MAX_RECENT);
  if (![...settingsSearchMaxSelect.options].some((o) => o.value === max)) {
    settingsSearchMaxSelect.value = String(MAX_RECENT);
  } else {
    settingsSearchMaxSelect.value = max;
  }
  settingsVirtualizationToggle.checked = isVirtualizationEnabled();
  settingsOverlay.hidden = false;
  settingsDispose = installModalA11y(settingsModal, closeSettingsModal);
}

function closeSettingsModal(): void {
  if (settingsDispose) {
    settingsDispose();
    settingsDispose = null;
  }
  settingsOverlay.hidden = true;
  settingsBtn.focus();
}

function resetSettings(): void {
  setTheme("light");
  setLayout("split");
  setIgnoreWhitespace(false);
  setLanguage("en");
  setFilterUnread(false);
  localStorage.removeItem(SEARCH_HISTORY_MAX_KEY);
  openSettingsModal();
}

settingsBtn?.addEventListener("click", openSettingsModal);
settingsOkBtn?.addEventListener("click", closeSettingsModal);
settingsCloseBtn?.addEventListener("click", closeSettingsModal);
settingsResetBtn?.addEventListener("click", resetSettings);

settingsThemeSelect?.addEventListener("change", () => {
  setTheme(settingsThemeSelect.value as ThemeMode);
});
settingsLayoutSelect?.addEventListener("change", () => {
  setLayout(settingsLayoutSelect.value as DiffLayout);
});
settingsLanguageSelect?.addEventListener("change", () => {
  setLanguage(settingsLanguageSelect.value as "en" | "zh-CN");
});
settingsSearchMaxSelect?.addEventListener("change", () => {
  const val = settingsSearchMaxSelect.value;
  localStorage.setItem(SEARCH_HISTORY_MAX_KEY, val);
});
settingsVirtualizationToggle?.addEventListener("change", () => {
  localStorage.setItem(DIFF_VIRTUALIZATION_KEY, String(settingsVirtualizationToggle.checked));
});

// ── Sidebar mode toggle ──
const sidebarMode = document.querySelector("#sidebar-mode") as HTMLDivElement;
const navbarTabs = document.querySelector("#navbar-tabs") as HTMLDivElement;

function applySidebarMode() {
  for (const btn of sidebarMode.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", btn.dataset.mode === state.sidebarMode ? "true" : "false");
  }
}
applySidebarMode();
applyConversationFilter();
applyActiveTab();

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

// R20 #41: sidebar "show only unread" filter checkbox. Persists the
// state to localStorage; re-renders the Files pane whenever the
// checkbox toggles. The progress counter (AC2.5) keeps tracking the
// TOTAL count regardless of filter state — only the visible file list
// is filtered.
const filterUnreadEl = document.querySelector<HTMLInputElement>("#filter-unread");
function applyFilterUnread() {
  if (!filterUnreadEl) return;
  filterUnreadEl.checked = state.filterUnread;
  // Visual: highlight the chip when the filter is active.
  const label = filterUnreadEl.closest<HTMLElement>(".sidebar-filter");
  if (label) {
    if (state.filterUnread) label.setAttribute("data-active", "true");
    else label.removeAttribute("data-active");
  }
}

function setFilterUnread(next: boolean) {
  if (state.filterUnread === next) return;
  state.filterUnread = next;
  applyFilterUnread();
  try {
    localStorage.setItem(SIDEBAR_FILTER_UNREAD_KEY, next ? "on" : "off");
  } catch {
    // ignore — localStorage may be unavailable (private mode, etc.)
  }
  // Re-render the Files pane so the filtered list takes effect. Also
  // re-render the review progress because turning the filter ON may
  // remove a "read" file from view — the user should still see the
  // same TOTAL counter (X / Y where Y is total), per AC2.5.
  if (state.activeTab === "files") renderActivePane();
  renderReviewProgress();
}

filterUnreadEl?.addEventListener("change", () => {
  setFilterUnread(Boolean(filterUnreadEl.checked));
});
applyFilterUnread();

function applyActiveTab() {
  const tabButtons = [...navbarTabs.querySelectorAll<HTMLButtonElement>("button")];
  const activeIndex = TAB_ORDER.indexOf(state.activeTab as TabKey);
  const tabindexes = tabIndexFor(activeIndex < 0 ? 0 : activeIndex, tabButtons.length);
  for (const [i, btn] of tabButtons.entries()) {
    const isActive = btn.dataset.tab === state.activeTab;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    // R8 #2: ARIA tablist semantics — aria-selected + roving tabindex.
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
    btn.setAttribute("tabindex", tabindexes[i] ?? "-1");
  }
  for (const pane of document.querySelectorAll("[data-pane]")) {
    (pane as HTMLElement).hidden = (pane as HTMLElement).dataset.pane !== state.activeTab;
  }
}

function setActiveTab(tab: TabKey) {
  if (state.activeTab === tab) {
    renderActivePane();
    updateNavHint();
    return;
  }
  state.activeTab = tab;
  cancelSidebarDrag();
  if (state.drawerOpen) closeDrawer();
  applyActiveTab();
  writeStored(ACTIVE_TAB_KEY, tab);
  updateTabCounts();
  renderActivePane();
  updateNavHint();
  // R8 #2: keep keyboard focus in sync with the new active tab.
  const newTab = navbarTabs.querySelector<HTMLButtonElement>(`button[data-tab="${tab}"]`);
  newTab?.focus();
}

navbarTabs.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest("button");
  if (!btn) return;
  const tab = btn.dataset.tab as TabKey | undefined;
  if (tab) setActiveTab(tab);
});

// R8 #2: keyboard navigation across sidebar tabs (WAI-ARIA tablist).
// ArrowLeft/Right/Up/Down cycle, Home/End jump to first/last, default
// Tab/Shift+Tab still exit the tablist (browser default — R8-4 risk
// mitigated by roving tabindex above).
navbarTabs.addEventListener("keydown", (event) => {
  const key = event.key;
  if (
    key !== "ArrowLeft" &&
    key !== "ArrowRight" &&
    key !== "ArrowUp" &&
    key !== "ArrowDown" &&
    key !== "Home" &&
    key !== "End"
  ) {
    return;
  }
  const currentIndex = TAB_ORDER.indexOf(state.activeTab as TabKey);
  if (currentIndex < 0) return;
  let nextIndex: number;
  if (key === "Home") {
    nextIndex = 0;
  } else if (key === "End") {
    nextIndex = TAB_ORDER.length - 1;
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    nextIndex = cycleTab(currentIndex, -1, TAB_ORDER.length);
  } else {
    nextIndex = cycleTab(currentIndex, 1, TAB_ORDER.length);
  }
  event.preventDefault();
  const nextTab = TAB_ORDER[nextIndex];
  if (nextTab) setActiveTab(nextTab);
});

function setConversationFilter(filter: "open" | "resolved" | "all" | "pinned" | "reacted") {
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
    const filter = btn.dataset.filter as
      | "open"
      | "resolved"
      | "all"
      | "pinned"
      | "reacted"
      | undefined;
    if (filter) setConversationFilter(filter);
  });
}

// ── R14 #23: sort findings in the Conversation panel ──
// Sticky per-session via localStorage. The sort is a pure client-side
// reducer over state.existing + state.fresh — no network call, mirrors
// filterByQuery semantics (compose, don't reset search).
function setSortFindingsBy(sort: SortFindingsBy) {
  if (state.sortFindingsBy === sort) return;
  state.sortFindingsBy = sort;
  writeStored(SORT_FINDINGS_KEY, sort);
  applySortFindingsBy();
  if (state.activeTab === "conversation") {
    // Re-render only the active pane; cheaper than renderActivePane().
    renderConversationPane();
  }
}

function applySortFindingsBy() {
  const sel = document.querySelector<HTMLSelectElement>("#sort-findings");
  if (sel && sel.value !== state.sortFindingsBy) sel.value = state.sortFindingsBy;
}

const sortFindingsSel = document.querySelector<HTMLSelectElement>("#sort-findings");
if (sortFindingsSel) {
  // Apply the persisted default BEFORE the user can interact.
  sortFindingsSel.value = state.sortFindingsBy;
  sortFindingsSel.addEventListener("change", () => {
    const v = sortFindingsSel.value as SortFindingsBy;
    setSortFindingsBy(v);
  });
}

// ── R14 #25: filter previously-discussed by round ──
// In-memory state, NOT localStorage. Round filter is session-scoped
// because which rounds exist depends on the current review session;
// persisting across sessions would leave a stale "Round 3" filter with
// zero matches on a new session that has 0 rounds.
function setPreviouslyFilterByRound(round: "all" | number) {
  if (state.previouslyFilterByRound === round) return;
  state.previouslyFilterByRound = round;
  if (state.activeTab === "previously") {
    // Re-render the active pane; previously-list is rebuilt from
    // state.existing on every render so the dropdown repopulates too.
    renderPreviouslyPane();
  }
}

const previouslyRoundSel = document.querySelector<HTMLSelectElement>("#filter-previously-by-round");
if (previouslyRoundSel) {
  previouslyRoundSel.addEventListener("change", () => {
    const v = previouslyRoundSel.value;
    if (v === "all") {
      setPreviouslyFilterByRound("all");
    } else {
      const n = parseInt(v, 10);
      if (Number.isFinite(n) && n > 0) setPreviouslyFilterByRound(n);
    }
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
let priorNotesController: AbortController | null = null;
// R23 #47: per-file diff virtualizers (keyed by file path)
const diffVirtualizers = new Map<string, DiffVirtualizer>();

// R8 #1: in-tab search state — survives tab switches within the session.
let currentSearchQuery = "";

/**
 * R8 #1: build the `<input type="search">` shown at the top of each panel.
 * The input re-renders the active pane on every keystroke (cheap; 20-40
 * items typical) and clears + refocuses the first focusable pane element
 * on Escape.
 */
function renderSearchInput(paneId: string): HTMLElement {
  const input = document.createElement("input");
  input.type = "search";
  input.id = "search-input";
  input.className = "search-input";
  input.placeholder = "Search panel…";
  input.value = currentSearchQuery;
  input.dataset.pane = paneId;
  input.setAttribute("aria-label", "Search current panel");
  installImeSafeInputListener(input, (value) => {
    currentSearchQuery = value;
    renderActivePane();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    currentSearchQuery = "";
    input.value = "";
    renderActivePane();
    const pane = document.querySelector(`[data-pane="${paneId}"]`);
    if (!pane) return;
    const firstFocusable = pane.querySelector<HTMLElement>(
      "button:not([disabled]), [tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();
  });
  return input;
}

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

// ── R14 #24: persistent "Saved Xs ago" auto-save indicator ──
// Replaces the intrusive "Draft saved at HH:MM:SS" toast. Ticks every 5s
// via setInterval; after 60s of no new saves the indicator falls back
// to "All changes saved" (signals the work is durably persisted).
// Pure helpers (formatRelativeSeconds + tick constants) live in
// src/format-utils.ts so unit tests can import them without dragging
// in the browser-only window.* initializers at the top of this file.
import {
  formatRelativeSeconds,
  SAVE_INDICATOR_HIDE_AFTER_MS,
  SAVE_INDICATOR_TICK_MS,
} from "../format-utils";

function updateSaveIndicator() {
  const el = document.querySelector<HTMLSpanElement>("#save-indicator");
  if (!el) return;
  const stamp = state.draftLastSavedAt;
  if (!stamp) {
    el.textContent = "All changes saved";
    el.dataset.state = "idle";
    return;
  }
  const elapsed = Date.now() - stamp;
  if (elapsed >= SAVE_INDICATOR_HIDE_AFTER_MS) {
    el.textContent = "All changes saved";
    el.dataset.state = "idle";
    return;
  }
  el.textContent = `Saved ${formatRelativeSeconds(elapsed)}`;
  el.dataset.state = "fresh";
  // Subtle 1-frame pulse on fresh save to draw the eye.
  el.classList.remove("pulse-on-save");
  // Force reflow so the animation restarts on rapid consecutive saves.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void el.offsetWidth;
  el.classList.add("pulse-on-save");
}

let saveIndicatorInterval: number | null = null;
function startAutoSaveIndicator() {
  if (saveIndicatorInterval !== null) return;
  saveIndicatorInterval = window.setInterval(() => {
    updateSaveIndicator();
  }, SAVE_INDICATOR_TICK_MS);
  // Render once immediately so the initial state is correct.
  updateSaveIndicator();
}

function showReopenReasonModal(_findingId: string): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "modal-dialog conversation-drawer";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.innerHTML = `
      <h3>Force Reopen Finding</h3>
      <p>Why are you re-opening this finding? (Optional but helps the agent understand your intent.)</p>
      <textarea id="reopen-reason" rows="3" placeholder="e.g., 'The previous fix removed the symptom but the root cause is still there'"></textarea>
      <div class="modal-actions">
        <button id="reopen-cancel" type="button">Cancel</button>
        <button id="reopen-submit" class="primary" type="button">Re-open</button>
      </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const textarea = dialog.querySelector("#reopen-reason") as HTMLTextAreaElement | null;
    const cancelBtn = dialog.querySelector("#reopen-cancel") as HTMLButtonElement | null;
    const submitBtn = dialog.querySelector("#reopen-submit") as HTMLButtonElement | null;

    const closeWith = (value: string | null) => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(value);
    };

    installModalA11y(dialog, () => closeWith(null));
    textarea?.focus();
    cancelBtn?.addEventListener("click", () => closeWith(null));
    submitBtn?.addEventListener("click", () => {
      const trimmed = (textarea?.value ?? "").trim();
      closeWith(trimmed || "(no reason provided)");
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeWith(null);
    });
  });
}

// R13 #20 — Resolve-with-reason modal. Mirrors `showReopenReasonModal`
// at :1120-1159 (same modal-overlay + dialog markup, same
// Cancel/Confirm button shape, same textarea focus). Diff vs the
// reopen modal:
//  - 4 quick-reason chips pre-fill the textarea on click (one per
//    common R13 #20 reason shape, mirrors GitHub's "Resolve
//    conversation" dropdown + Jira's resolution list).
//  - Cancel returns `null` (the existing reopen modal also returns
//    null on Cancel — preserved contract).
//  - Confirm returns the trimmed reason text OR `""` if the user
//    confirms with an empty textarea. The server treats `""` as
//    "resolve without reason" (back-compat with R9/R10/R11/R12 callers
//    that POST {finding_id} with no reason).
// The modal's "Resolve" button forwards the reason to the existing
// POST /api/review/{id}/resolve endpoint, which now accepts
// `reason?` (≤200 chars).
type ResolveReasonModalResult = { reason: string } | null;
function showResolveReasonModal(_findingId: string): Promise<ResolveReasonModalResult> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "modal-dialog conversation-drawer";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.innerHTML = `
      <h3>Resolve Finding</h3>
      <p>Why are you resolving this finding? (Optional — helps the agent learn your intent.)</p>
      <div class="resolve-reason-chips" id="resolve-reason-chips">
        <button type="button" class="resolve-reason-chip" data-reason="fixed in this round">fixed in this round</button>
        <button type="button" class="resolve-reason-chip" data-reason="no longer applies">no longer applies</button>
        <button type="button" class="resolve-reason-chip" data-reason="will fix in follow-up">will fix in follow-up</button>
        <button type="button" class="resolve-reason-chip" data-reason="false alarm — keep the code">false alarm — keep the code</button>
      </div>
      <textarea id="resolve-reason" rows="3" placeholder="e.g., 'verified, the function is no longer called from the public path'"></textarea>
      <div class="modal-actions">
        <button id="resolve-cancel" type="button">Cancel</button>
        <button id="resolve-submit" class="primary" type="button">Resolve</button>
      </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const textarea = dialog.querySelector("#resolve-reason") as HTMLTextAreaElement | null;
    const cancelBtn = dialog.querySelector("#resolve-cancel") as HTMLButtonElement | null;
    const submitBtn = dialog.querySelector("#resolve-submit") as HTMLButtonElement | null;
    const chipContainer = dialog.querySelector("#resolve-reason-chips") as HTMLDivElement | null;

    const closeWith = (value: ResolveReasonModalResult) => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(value);
    };

    installModalA11y(dialog, () => closeWith(null));
    textarea?.focus();
    cancelBtn?.addEventListener("click", () => closeWith(null));
    submitBtn?.addEventListener("click", () => {
      const trimmed = (textarea?.value ?? "").trim();
      closeWith({ reason: trimmed.slice(0, 200) });
    });
    chipContainer?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const reason = target.dataset.reason;
      if (!reason || !textarea) return;
      textarea.value = reason;
      textarea.focus();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeWith(null);
    });
  });
}

// R13 #21 — Mark-as-wontfix modal. Radio-button picker (4 enum
// values mirroring the server's RESOLUTION_KIND_WHITELIST) + optional
// reason textarea. Cancel returns `null` (preserves the existing
// reopen / resolve modal Cancel contract). Confirm returns
// `{ kind, reason }` (or `null` if the user Canceled). The server
// validates `kind` against RESOLUTION_KIND_WHITELIST (400 on miss,
// mirrors EMOJI_WHITELIST validation at :2161-2168).
type MarkAsWontfixResult = { kind: FindingResolutionKind; reason: string } | null;
const MARKS_AS_WONTFIX_KINDS: { value: FindingResolutionKind; label: string; hint: string }[] = [
  {
    value: "wontfix",
    label: "Wontfix",
    hint: "Acknowledged but will not address (e.g. design choice, intentional)",
  },
  {
    value: "out_of_scope",
    label: "Out of scope",
    hint: "Should be tracked elsewhere / not in this review's scope",
  },
  {
    value: "false_positive",
    label: "False positive",
    hint: "Not actually an issue — the code is correct as-is",
  },
  {
    value: "duplicate",
    label: "Duplicate",
    hint: "Already covered by another finding or fixed elsewhere",
  },
];
function showMarkAsWontfixModal(_findingId: string): Promise<MarkAsWontfixResult> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "modal-dialog conversation-drawer";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    const radios = MARKS_AS_WONTFIX_KINDS.map(
      (item, idx) => `
        <label class="wontfix-radio" data-kind="${item.value}">
          <input type="radio" name="wontfix-kind" value="${item.value}" ${idx === 0 ? "checked" : ""}>
          <span class="wontfix-radio-label">${item.label}</span>
          <span class="wontfix-radio-hint">${item.hint}</span>
        </label>
      `,
    ).join("");
    dialog.innerHTML = `
      <h3>Mark as wontfix</h3>
      <p>Why is this finding not actionable? Pick a category and add an optional reason.</p>
      <div class="wontfix-radios" id="wontfix-radios">${radios}</div>
      <textarea id="wontfix-reason" rows="3" placeholder="Optional context (e.g. duplicate of F-002, see #123)"></textarea>
      <div class="modal-actions">
        <button id="wontfix-cancel" type="button">Cancel</button>
        <button id="wontfix-submit" class="primary" type="button">Mark as wontfix</button>
      </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const reasonEl = dialog.querySelector("#wontfix-reason") as HTMLTextAreaElement | null;
    const cancelBtn = dialog.querySelector("#wontfix-cancel") as HTMLButtonElement | null;
    const submitBtn = dialog.querySelector("#wontfix-submit") as HTMLButtonElement | null;

    const closeWith = (value: MarkAsWontfixResult) => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(value);
    };

    installModalA11y(dialog, () => closeWith(null));
    const firstRadio = dialog.querySelector<HTMLInputElement>('input[name="wontfix-kind"]');
    firstRadio?.focus();
    cancelBtn?.addEventListener("click", () => closeWith(null));
    submitBtn?.addEventListener("click", () => {
      const checked = dialog.querySelector<HTMLInputElement>('input[name="wontfix-kind"]:checked');
      const kind = (checked?.value ?? "") as FindingResolutionKind;
      if (!RESOLUTION_KIND_WHITELIST.has(kind)) {
        closeWith(null);
        return;
      }
      const trimmed = (reasonEl?.value ?? "").trim();
      closeWith({ kind, reason: trimmed.slice(0, 200) });
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeWith(null);
    });
  });
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
  updateConversationTabBadge();
}

function updateConversationTabBadge(): void {
  const tab = document.querySelector('button[data-tab="conversation"]') as HTMLElement | null;
  if (!tab) return;
  const pinnedCount = state.existing.filter((item) => Boolean(item.pinned)).length;
  const reactCount = state.existing.filter((item) =>
    Boolean(item.reactions && item.reactions.length > 0),
  ).length;
  let existingBadge = tab.querySelector(".tab-meta-badges") as HTMLElement | null;
  if (!existingBadge) {
    existingBadge = document.createElement("span");
    existingBadge.className = "tab-meta-badges";
    tab.appendChild(existingBadge);
  }
  existingBadge.innerHTML = "";
  if (pinnedCount > 0) {
    const star = document.createElement("span");
    star.className = "tab-badge tab-badge-pinned";
    star.textContent = `★${pinnedCount}`;
    star.title = `${pinnedCount} pinned finding${pinnedCount === 1 ? "" : "s"}`;
    existingBadge.appendChild(star);
  }
  if (reactCount > 0) {
    const react = document.createElement("span");
    react.className = "tab-badge tab-badge-reacted";
    react.textContent = `😀${reactCount}`;
    react.title = `${reactCount} reacted finding${reactCount === 1 ? "" : "s"}`;
    existingBadge.appendChild(react);
  }
  existingBadge.hidden = existingBadge.childElementCount === 0;
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

  // R20 #40: progress counter derives from state.read.size + total file
  // count, so any toggleRead path must re-render the counter too.
  // Live update is required by AC1.2.
  renderReviewProgress();
}

/**
 * R20 #40: re-render the sidebar review progress indicator (AC1.1,
 * AC1.2, AC1.3, AC1.4). Reads `state.read.size` + total file count,
 * hands them to `formatReviewProgress()` (pure helper), and writes
 * the localized text + visual-bar width into `#sidebar-progress-text`
 * / `#sidebar-progress-fill` declared in `review.html`. Safe on the
 * first paint when no data has loaded yet (renders empty). i18n lives
 * here, not in the helper, per SG.R19.3.
 */
function renderReviewProgress(): void {
  const total = state.data?.files.length ?? 0;
  const progress = formatReviewProgress(state.read.size, total);

  const textEl = document.querySelector<HTMLElement>("#sidebar-progress-text");
  const fillEl = document.querySelector<HTMLElement>("#sidebar-progress-fill");
  const container = document.querySelector<HTMLElement>("#sidebar-progress");

  if (textEl) {
    if (progress.total === 0) {
      textEl.textContent = "";
      textEl.removeAttribute("data-complete");
    } else {
      textEl.textContent = t("sidebar.reviewProgress", {
        count: progress.count,
        total: progress.total,
        percent: progress.percent,
      });
      if (progress.complete) textEl.setAttribute("data-complete", "true");
      else textEl.removeAttribute("data-complete");
    }
  }

  if (fillEl) {
    fillEl.style.width = progress.widthPct;
    if (progress.complete) fillEl.setAttribute("data-complete", "true");
    else fillEl.removeAttribute("data-complete");
  }

  if (container) {
    if (progress.total === 0) container.setAttribute("data-empty", "true");
    else container.removeAttribute("data-empty");
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
      contents: state.ignoreWhitespace ? stripWhitespace(file.before || "") : file.before || "",
    },
    newFile: {
      name: file.path,
      contents: state.ignoreWhitespace ? stripWhitespace(file.after || "") : file.after || "",
    },
    containerWrapper: mount,
    lineAnnotations: diffAnnotations(file.path),
  });

  const virtualizer = new DiffVirtualizer(mount, { enabled: isVirtualizationEnabled() });
  diffVirtualizers.set(file.path, virtualizer);

  const oldContent = state.ignoreWhitespace ? stripWhitespace(file.before || "") : file.before || "";
  const newContent = state.ignoreWhitespace ? stripWhitespace(file.after || "") : file.after || "";
  const metadata = parseDiffFromFile(
    { name: file.path, contents: oldContent },
    { name: file.path, contents: newContent },
  );
  const ranges = computeHunkRanges(metadata.hunks);
  const wrappers = virtualizer.markHunkBoundaries(ranges, file.path);
  virtualizer.observe(wrappers);
  injectHunkCollapseButtons(mount, file.path, virtualizer);

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
    newFile: {
      name: file.path,
      contents: state.ignoreWhitespace ? stripWhitespace(file.after || "") : file.after || "",
    },
    containerWrapper: mount,
    lineAnnotations: diffAnnotations(file.path),
  });

  const virtualizer = new DiffVirtualizer(mount, { enabled: isVirtualizationEnabled() });
  diffVirtualizers.set(file.path, virtualizer);

  const newContent = state.ignoreWhitespace ? stripWhitespace(file.after || "") : file.after || "";
  const metadata = parseDiffFromFile(
    { name: file.path, contents: "\n\n" },
    { name: file.path, contents: newContent },
  );
  const ranges = computeHunkRanges(metadata.hunks);
  const wrappers = virtualizer.markHunkBoundaries(ranges, file.path);
  virtualizer.observe(wrappers);
  injectHunkCollapseButtons(mount, file.path, virtualizer);

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
    oldFile: {
      name: file.path,
      contents: state.ignoreWhitespace ? stripWhitespace(file.before || "") : file.before || "",
    },
    newFile: { name: file.path, contents: "\n\n" },
    containerWrapper: mount,
    lineAnnotations: diffAnnotations(file.path),
  });

  const virtualizer = new DiffVirtualizer(mount, { enabled: isVirtualizationEnabled() });
  diffVirtualizers.set(file.path, virtualizer);

  const oldContent = state.ignoreWhitespace ? stripWhitespace(file.before || "") : file.before || "";
  const metadata = parseDiffFromFile(
    { name: file.path, contents: oldContent },
    { name: file.path, contents: "\n\n" },
  );
  const ranges = computeHunkRanges(metadata.hunks);
  const wrappers = virtualizer.markHunkBoundaries(ranges, file.path);
  virtualizer.observe(wrappers);
  injectHunkCollapseButtons(mount, file.path, virtualizer);

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
  if (file.source) item.setAttribute("data-source", file.source);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "sidebar-file-checkbox";
  checkbox.dataset.path = file.path;
  checkbox.addEventListener("change", (e) => {
    e.stopPropagation();
    if (checkbox.checked) selectedFiles.add(file.path);
    else selectedFiles.delete(file.path);
    renderBulkButton();
  });

  const dot = document.createElement("span");
  dot.className = `sidebar-dot ${file.status}`;

  const typeIcon = document.createElement("span");
  typeIcon.className = "sidebar-type-icon";
  const ext = fileExt(file.path);
  if (ext) typeIcon.dataset.ext = ext;
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

  item.appendChild(checkbox);
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
      folderIcon.innerHTML = collapsed ? FOLDER_OPEN_ICON_SVG : FOLDER_ICON_SVG;
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
          folderIcon.innerHTML = FOLDER_ICON_SVG;
        } else {
          folder.setAttribute("data-collapsed", "");
          state.collapsedFolders.add(child.path);
          folderIcon.innerHTML = FOLDER_OPEN_ICON_SVG;
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
  } else if (state.activeTab === "previously") {
    priorNotesController?.abort();
    priorNotesController = new AbortController();
    void loadPriorNotes(priorNotesController.signal).then(() => {
      if (state.activeTab === "previously") renderPreviouslyPane();
    });
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

function renderBulkButton(): void {
  let bulkEl = document.querySelector<HTMLElement>(".sidebar-bulk-toolbar");
  if (selectedFiles.size === 0) {
    if (bulkEl) bulkEl.remove();
    return;
  }
  if (!bulkEl) {
    bulkEl = document.createElement("div");
    bulkEl.className = "sidebar-bulk-toolbar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sidebar-bulk-mark-reviewed";
    bulkEl.appendChild(btn);
    btn.addEventListener("click", () => {
      for (const path of selectedFiles) {
        if (!state.read.has(path)) {
          state.read.add(path);
          const item = state.sidebarItems.get(path);
          if (item) {
            item.setAttribute("data-read", "");
            const reviewed = item.querySelector<HTMLElement>(".sidebar-reviewed");
            if (reviewed) reviewed.style.display = "";
          }
        }
      }
      selectedFiles.clear();
      document.querySelectorAll<HTMLInputElement>(".sidebar-file-checkbox").forEach((cb) => {
        cb.checked = false;
      });
      renderBulkButton();
      renderReviewProgress();
    });
    fileListRoot.appendChild(bulkEl);
  }
  const btn = bulkEl.querySelector<HTMLButtonElement>(".sidebar-bulk-mark-reviewed");
  if (btn) {
    btn.textContent = `${t("sidebar.bulkDelete")} (${selectedFiles.size})`;
  }
  document.querySelectorAll<HTMLInputElement>(".sidebar-file-checkbox").forEach((cb) => {
    cb.checked = selectedFiles.has(cb.dataset.path ?? "");
  });
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

  // R8 #1: search bar at top of the Files pane.
  fileListRoot.appendChild(renderSearchInput("files"));

  // R20 #41: keep the chip's visual state in sync with state.filterUnread
  // after render (the chip lives inside .sidebar-header but renderFilesPane
  // mutates only #file-list; the chip's aria/visual state is initialized
  // once at startup via applyFilterUnread).
  applyFilterUnread();

  const allFiles = getOrderedFiles();
  const searched = filterByQuery(allFiles, currentSearchQuery, (f) => f.path);
  // R20 #41: apply the "show only unread" filter AFTER the search filter,
  // so the two compose (search first, then unread). Tree mode naturally
  // collapses folders whose files are all read — buildTree() filters at
  // construction time.
  const files = state.filterUnread ? searched.filter((f) => !state.read.has(f.path)) : searched;
  if (state.sidebarMode === "tree") {
    renderTreeSidebar(buildTree(files));
  } else {
    renderFlatSidebar(files);
  }
  renderBulkButton();
}

function renderCommitsPane() {
  const commitsListRoot = document.querySelector("#commits-list") as HTMLDivElement;
  commitsListRoot.innerHTML = "";
  // R8 #1: search bar at top of the Commits pane.
  commitsListRoot.appendChild(renderSearchInput("commits"));
  renderCommitsPanel(commitsListRoot);
}

function renderConversationPane() {
  const conversationListRoot = document.querySelector("#conversation-list") as HTMLDivElement;
  conversationListRoot.innerHTML = "";
  // R8 #1: search bar at top of the Conversation pane.
  conversationListRoot.appendChild(renderSearchInput("conversation"));
  updateConversationFilterCounts();
  renderConversationPanel(conversationListRoot);
}

function updateConversationFilterCounts(): void {
  const pinnedCount = state.existing.filter((item) => Boolean(item.pinned)).length;
  const reactCount = state.existing.filter((item) =>
    Boolean(item.reactions && item.reactions.length > 0),
  ).length;
  const pinnedEl = document.querySelector('[data-count-for="pinned"]');
  const reactEl = document.querySelector('[data-count-for="reacted"]');
  if (pinnedEl) pinnedEl.textContent = `(${pinnedCount})`;
  if (reactEl) reactEl.textContent = `(${reactCount})`;
}

function renderCommitsPanel(root: HTMLElement) {
  const allCommits = state.data?.commits ?? [];
  // R8 #1: search filter composes with the commits list (no second filter
  // exists on this pane — `renderCommitsPanel` is the only path).
  const commits = filterByQuery(allCommits, currentSearchQuery, (c) => c.message);
  if (commits.length === 0) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    empty.textContent = currentSearchQuery.trim()
      ? `No commits match "${currentSearchQuery.trim()}".`
      : "No commits in range.";
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

function formatDiffBase(db?: DiffBase): string {
  if (!db) return "(none)";
  if (db.type === "empty") return "empty";
  const hasBase = db.sources.includes("base");
  const hasWorking = db.sources.includes("working");
  if (hasBase && hasWorking) return `${db.from} + working`;
  if (hasWorking) return "working tree only";
  return db.from;
}

function renderDiffBaseHeader(db?: DiffBase): string {
  if (!db || db.type === "empty") return "";
  const fromSafe = escapeHtml(db.from);
  const hasBase = db.sources.includes("base");
  const hasWorking = db.sources.includes("working");
  if (hasBase && hasWorking) {
    return `[base: <span class="from">${fromSafe}</span><span class="working-tag"> + working</span>]`;
  }
  if (hasWorking) return `[working tree only]`;
  return `[base: <span class="from">${fromSafe}</span>]`;
}

function renderRangeBanner(): void {
  const banner = document.querySelector("#range-banner") as HTMLElement | null;
  if (!banner) return;
  const data = state.data;
  if (!data || !data.range_changed_from_last_round || !data.previous_diff_base) {
    banner.hidden = true;
    banner.innerHTML = "";
    return;
  }
  const cur = formatDiffBase(data.diff_base);
  const prev = formatDiffBase(data.previous_diff_base);
  banner.innerHTML = `
    <span class="icon">⚠️</span>
    <span class="text">Round ${data.round} diff range changed: was ${escapeHtml(prev)}, now ${escapeHtml(cur)}. Findings may shift.</span>
    <button class="close" aria-label="Dismiss" type="button">×</button>
  `;
  banner.hidden = false;
  banner.querySelector(".close")?.addEventListener("click", () => {
    banner.hidden = true;
  });
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
  manually_reopened?: boolean;
  manually_edited?: boolean;
  edited_at?: number;
  comments?: FindingComment[];
  pinned?: { by: "user"; at: number };
  manually_pinned?: boolean;
  reactions?: Reaction[];
  resolve_reason?: string;
  resolve_manually_resolved?: boolean;
  resolved_at?: number;
  resolution_kind?: FindingResolutionKind;
  resolution_reason?: string;
  audit_log?: { at: number; by: string }[];
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

// ── Export review (R10 #4, GH#14) ──
type ExportFile = {
  path: string;
  status: "added" | "deleted" | "modified";
  additions: number;
  deletions: number;
  before: string;
  after: string;
};

type ExportFinding = {
  id: string;
  file: string;
  start_line?: number;
  end_line?: number;
  category?: string;
  severity?: string;
  comment?: string;
  status?: string;
};

type ExportState = {
  round?: number;
  notes?: string;
  session_id?: string;
  findings?: ExportFinding[];
  files?: ExportFile[];
};

function generateMarkdownSummary(state: ExportState): string {
  const round = state.round ?? 0;
  const findings = state.findings ?? [];
  const files = state.files ?? [];
  const open = findings.filter((f) => f.status === "open").length;
  const resolved = findings.filter((f) => f.status === "resolved").length;
  const stale = findings.filter((f) => f.status === "closed_auto").length;
  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const f of findings) {
    if (f.status !== "open") continue;
    const sev = f.severity ?? "medium";
    const cat = f.category ?? "recommend";
    bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }
  const isoTs = new Date().toISOString();
  const lines: string[] = [];
  lines.push(`# Review — Round ${round} (${isoTs})`);
  lines.push("");
  lines.push("## Summary");
  lines.push(`- Files reviewed: ${files.length}`);
  lines.push(
    `- Findings: ${findings.length} total (${open} open / ${resolved} resolved / ${stale} stale)`,
  );
  const sevParts = Object.entries(bySeverity).sort(([a], [b]) => a.localeCompare(b));
  if (sevParts.length === 0) {
    lines.push("- By severity (open): (none)");
  } else {
    lines.push(`- By severity (open): ${sevParts.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  const catParts = Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b));
  if (catParts.length === 0) {
    lines.push("- By category (open): (none)");
  } else {
    lines.push(`- By category (open): ${catParts.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  lines.push("");
  lines.push("## Findings");
  if (findings.length === 0) {
    lines.push("_No findings in this round._");
  } else {
    lines.push("| id | file:line | category | severity | status | comment |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const f of findings) {
      const loc =
        f.start_line && f.end_line && f.start_line !== f.end_line
          ? `${f.file}:${f.start_line}-${f.end_line}`
          : `${f.file}:${f.start_line ?? "?"}`;
      const raw = (f.comment ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      const excerpt = raw.length > 120 ? raw.slice(0, 117) + "…" : raw;
      lines.push(
        `| ${f.id} | ${loc} | ${f.category ?? ""} | ${f.severity ?? ""} | ${f.status ?? ""} | ${excerpt} |`,
      );
    }
  }
  const notes = (state.notes ?? "").trim();
  if (notes) {
    lines.push("");
    lines.push("## Notes");
    lines.push("");
    lines.push(notes);
  }
  return lines.join("\n") + "\n";
}

function generatePatchFile(files: ExportFile[], findings: ExportFinding[]): string {
  const out: string[] = [];
  for (const file of files) {
    const a = file.path;
    const b = file.path;
    if (file.status === "added") {
      out.push(`diff --git a/${a} b/${b}`);
      out.push("new file mode 100644");
      out.push(`--- /dev/null`);
      out.push(`+++ b/${b}`);
    } else if (file.status === "deleted") {
      out.push(`diff --git a/${a} b/${b}`);
      out.push("deleted file mode 100644");
      out.push(`--- a/${a}`);
      out.push(`+++ /dev/null`);
    } else {
      out.push(`diff --git a/${a} b/${b}`);
      out.push(`--- a/${a}`);
      out.push(`+++ b/${b}`);
    }
    const fileFindings = findings.filter((f) => f.file === file.path);
    const fromLines = (file.before ?? "").split("\n");
    const toLines = (file.after ?? "").split("\n");
    if (file.status === "added") {
      out.push(`@@ -0,0 +1,${toLines.length} @@`);
      for (const line of toLines) out.push(`+${line}`);
    } else if (file.status === "deleted") {
      out.push(`@@ -1,${fromLines.length} +0,0 @@`);
      for (const line of fromLines) out.push(`-${line}`);
    } else {
      const fromCount = fromLines.length || 1;
      const toCount = toLines.length || 1;
      out.push(`@@ -1,${fromCount} +1,${toCount} @@`);
      for (const line of fromLines) out.push(`-${line}`);
      for (const line of toLines) out.push(`+${line}`);
    }
    for (const finding of fileFindings) {
      const tag = `// REVIEW (${finding.id}): ${(finding.comment ?? "").replace(/\n/g, " ").slice(0, 200)}`;
      out.push(tag);
    }
    out.push("");
  }
  return out.join("\n");
}

function generateExportFilename(
  format: "md" | "patch",
  round: number,
  sessionId: string,
  ts: number,
): string {
  const short = sessionId.length > 8 ? sessionId.slice(0, 8) : sessionId;
  return `review-${round}-${short}-${ts}.${format}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showExportModal(): void {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  const dialog = document.createElement("div");
  dialog.className = "modal-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.innerHTML = `
    <h3>Export review</h3>
    <p>Choose a format. The file is generated client-side from the current round state.</p>
    <div class="export-cards">
      <button class="export-card" data-format="md" type="button">
        <strong>Markdown summary (.md)</strong>
        <span class="export-card-desc">Round summary + findings table + notes — paste into Notion / Slack / email.</span>
      </button>
      <button class="export-card" data-format="patch" type="button">
        <strong>Patch file (.patch)</strong>
        <span class="export-card-desc">Unified diff with // REVIEW (&lt;id&gt;) annotations — attach to a bug report.</span>
      </button>
    </div>
    <div class="modal-actions">
      <button id="export-cancel" type="button">Cancel</button>
    </div>
  `;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const cancelBtn = dialog.querySelector("#export-cancel") as HTMLButtonElement | null;
  const close = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
  installModalA11y(dialog, close);
  cancelBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  for (const card of dialog.querySelectorAll<HTMLButtonElement>(".export-card")) {
    card.addEventListener("click", () => {
      const format = card.dataset.format === "patch" ? "patch" : "md";
      const data = state.data;
      if (!data) {
        close();
        setStatus("No review data to export", true);
        return;
      }
      const ts = Date.now();
      const filename = generateExportFilename(
        format,
        data.round ?? 0,
        data.session_id ?? "session",
        ts,
      );
      let content = "";
      let mime = "text/plain;charset=utf-8";
      if (format === "md") {
        content = generateMarkdownSummary({
          round: data.round,
          notes: state.notes,
          session_id: data.session_id,
          findings: all() as ExportFinding[],
          files: data.files as ExportFile[],
        });
        mime = "text/markdown;charset=utf-8";
      } else {
        content = generatePatchFile(data.files as ExportFile[], all() as ExportFinding[]);
        mime = "text/x-diff;charset=utf-8";
      }
      const blob = new Blob([content], { type: mime });
      triggerDownload(blob, filename);
      close();
      setStatus(`Exported ${filename}`);
    });
  }
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
      : state.conversationFilter === "resolved"
        ? entries.filter((e) => e.status === "resolved")
        : state.conversationFilter === "pinned"
          ? entries.filter((e) => Boolean(e.pinned))
          : state.conversationFilter === "reacted"
            ? entries.filter((e) => Boolean(e.reactions && e.reactions.length > 0))
            : entries;
  // R8 #1: search filter composes with the 3-button conversationFilter.
  // Match against comment text + category + severity (per AC8-1.2).
  const searched = filterByQuery(
    filtered,
    currentSearchQuery,
    (e) => `${e.comment} ${e.category} ${e.severity}`,
  );
  if (searched.length === 0) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    if (currentSearchQuery.trim()) {
      empty.textContent = `No findings match "${currentSearchQuery.trim()}".`;
    } else {
      empty.textContent =
        state.conversationFilter === "open"
          ? "No unresolved findings."
          : state.conversationFilter === "resolved"
            ? "No resolved findings."
            : state.conversationFilter === "pinned"
              ? "No pinned findings — star a finding to revisit it later."
              : state.conversationFilter === "reacted"
                ? "No reacted findings — click an emoji on a finding to give feedback."
                : "No findings found.";
    }
    root.appendChild(empty);
    return;
  }

  // R14 #23: pure client-side sort reducer. No network call, composes with
  // the existing filterByQuery. Default "newest" = round DESC, created_at ASC
  // (preserves pre-R14 chronological behavior).
  const sorted = sortConversationEntries(searched, state.sortFindingsBy);

  for (const entry of sorted) {
    const item = document.createElement("div");
    item.className = "conversation-item";
    item.dataset.status = entry.status;
    item.dataset.origin = entry.origin;
    // R11 #2: stable element-id for permalink deep-linking.
    if (entry.id) item.id = `finding-${entry.id}`;

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
      resolveBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        // R13 #20 — open the resolve-with-reason modal first; if the
        // user Cancels, do not POST. Otherwise forward the trimmed
        // reason to the existing /resolve endpoint (which now accepts
        // `reason?` and stamps resolve_reason + resolve_manually_resolved).
        const result = await showResolveReasonModal(entry.id);
        if (result === null) return;
        await resolveFinding(entry.id, { reason: result.reason });
      });
      actions.appendChild(resolveBtn);
      // R13 #21 — sibling button to "Resolve" for the explicit
      // wontfix flow. Secondary visual style (no .primary class) so
      // the primary "Resolve" remains the default happy path.
      const wontfixBtn = document.createElement("button");
      wontfixBtn.type = "button";
      wontfixBtn.className = "finding-wontfix";
      wontfixBtn.textContent = "Mark as wontfix";
      wontfixBtn.title =
        "Mark this finding as wontfix / out_of_scope / false_positive / duplicate (R13 #21)";
      wontfixBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const result = await showMarkAsWontfixModal(entry.id);
        if (result === null) return;
        await resolveFinding(entry.id, {
          resolution_kind: result.kind,
          resolution_reason: result.reason,
        });
      });
      actions.appendChild(wontfixBtn);
    } else if (isResolved || isStale) {
      const reopenBtn = document.createElement("button");
      reopenBtn.className = "primary";
      // R9 #1: on stale (closed_auto) findings the button is labeled
      // "Force Reopen" to indicate the user is overriding the auto-close.
      reopenBtn.textContent = isStale ? "Force Reopen" : "Reopen";
      reopenBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isStale) {
          const reason = await showReopenReasonModal(entry.id);
          if (reason === null) return;
          await reopenFinding(entry.id, reason, { manually_reopened: true });
        } else {
          await reopenFinding(entry.id);
        }
      });
      actions.appendChild(reopenBtn);
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.title = "Edit category / severity / comment in-place";
    editBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const fields = await showEditFindingModal({
        id: entry.id,
        category: entry.category,
        severity: entry.severity,
        comment: entry.comment,
      });
      if (!fields) return;
      const patch: { category?: string; severity?: string; comment?: string } = {};
      if (fields.category !== entry.category) patch.category = fields.category;
      if (fields.severity !== entry.severity) patch.severity = fields.severity;
      if (fields.comment !== entry.comment) patch.comment = fields.comment;
      if (Object.keys(patch).length === 0) {
        setStatus("No changes to save");
        return;
      }
      await editFinding(entry.id, patch);
    });
    actions.appendChild(editBtn);

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

    if (entry.id) {
      const copyLinkBtn = document.createElement("button");
      copyLinkBtn.type = "button";
      copyLinkBtn.className = "finding-copy-link";
      copyLinkBtn.textContent = "Copy link";
      copyLinkBtn.title = `Copy permalink: ${buildFindingPermalink(entry.id)}`;
      copyLinkBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        void copyFindingPermalinkToClipboard(entry.id, copyLinkBtn);
      });
      actions.appendChild(copyLinkBtn);

      const copyMdBtn = document.createElement("button");
      copyMdBtn.type = "button";
      copyMdBtn.className = "finding-copy-md";
      copyMdBtn.textContent = "Copy as MD";
      copyMdBtn.title =
        "Copy finding as a Markdown snippet (round, file:line, permalink, comment, audit count, reactions)";
      copyMdBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        void copyFindingAsMarkdownToClipboard(entry, entry.round ?? 0, copyMdBtn);
      });
      actions.appendChild(copyMdBtn);
    }

    if (entry.id) {
      const starBtn = document.createElement("button");
      starBtn.type = "button";
      const isPinned = Boolean(entry.pinned);
      starBtn.className = `finding-star${isPinned ? " is-pinned" : ""}`;
      starBtn.textContent = isPinned ? "★" : "☆";
      starBtn.title = isPinned
        ? `Pinned for revisit (${formatRelativeTime(entry.pinned?.at ?? 0)}) — click to unpin`
        : "Pin this finding to revisit it later";
      starBtn.setAttribute("aria-pressed", isPinned ? "true" : "false");
      starBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (entry.pinned) {
          void unpinFinding(entry.id);
        } else {
          void pinFinding(entry.id);
        }
      });
      actions.appendChild(starBtn);
    }
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
    const editedBadge =
      entry.manually_edited && entry.edited_at
        ? `<span class="badge badge-edited" title="Edited by user at ${new Date(entry.edited_at).toISOString()}">edited ${escapeHtml(formatRelativeTime(entry.edited_at))}</span>`
        : "";
    // R13 #21 — render a `badge-resolution-<kind>` next to the existing
    // severity / category / kind badges when the finding has a
    // resolution_kind. Distinct badge per kind so the user can scan the
    // Conversation tab and see "wontfix" vs "false_positive" at a glance.
    // Distinct from `editedBadge` (R10) and `pinned` (R12) — both render
    // a separate badge too, additive composition.
    const resolutionKindBadge = entry.resolution_kind
      ? `<span class="badge badge-resolution-${escapeHtml(entry.resolution_kind)}" title="Resolution: ${escapeHtml(entry.resolution_kind)}${entry.resolution_reason ? ` — ${escapeHtml(entry.resolution_reason)}` : ""}">${escapeHtml(entry.resolution_kind)}</span>`
      : "";
    badgesRow.innerHTML = [
      `<span class="badge ${entry.severity}">${escapeHtml(entry.severity)}</span>`,
      `<span class="badge">${escapeHtml(entry.category)}</span>`,
      `<span class="badge">${escapeHtml(entry.kind ?? "line")}</span>`,
      editedBadge,
      resolutionKindBadge,
    ].join("");
    subhead.appendChild(badgesRow);
    item.appendChild(subhead);

    const body = document.createElement("div");
    body.className = "conversation-body";
    body.textContent = entry.comment;
    item.appendChild(body);

    if (entry.id) {
      const reactionRow = document.createElement("div");
      reactionRow.className = "reaction-row";
      const existingReactions = entry.reactions ?? [];
      const emojiSet: ReactionEmoji[] = ["👍", "👎", "😄", "❤️", "🎉", "👀"];
      const grouped = new Map<ReactionEmoji, Reaction[]>();
      for (const r of existingReactions) {
        const list = grouped.get(r.emoji) ?? [];
        list.push(r);
        grouped.set(r.emoji, list);
      }
      if (grouped.size > 0) {
        for (const [emoji, list] of grouped.entries()) {
          const pill = document.createElement("span");
          pill.className = "reaction-display";
          pill.textContent = emoji;
          const count = document.createElement("span");
          count.className = "reaction-display-count";
          count.textContent = ` ${list.length}`;
          pill.appendChild(count);
          pill.title = `${emoji} · ${list.length} reaction${list.length === 1 ? "" : "s"}`;
          reactionRow.appendChild(pill);
        }
      }
      const picker = document.createElement("div");
      picker.className = "reaction-picker";
      for (const emoji of emojiSet) {
        const pill = document.createElement("button");
        pill.type = "button";
        const isActive = grouped.has(emoji);
        pill.className = `reaction-pill${isActive ? " is-active" : ""}`;
        pill.textContent = emoji;
        pill.title = isActive ? `Remove your ${emoji} reaction` : `React with ${emoji}`;
        pill.addEventListener("click", (event) => {
          event.stopPropagation();
          void toggleReaction(entry.id, emoji);
        });
        picker.appendChild(pill);
      }
      reactionRow.appendChild(picker);
      item.appendChild(reactionRow);
    }

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

    const auditLog = (entry as any).audit_log as
      | Array<{
          before: { category: string; severity: string; comment: string };
          after: { category: string; severity: string; comment: string };
          at: number;
          by: string;
        }>
      | undefined;
    if (auditLog && auditLog.length > 0) {
      const auditDisclosure = document.createElement("details");
      auditDisclosure.className = "audit-disclosure";
      const summary = document.createElement("summary");
      summary.textContent = `${auditLog.length} edit${auditLog.length !== 1 ? "s" : ""} — click to expand`;
      auditDisclosure.appendChild(summary);
      for (const row of auditLog) {
        const ts = new Date(row.at).toLocaleString();
        const changes: string[] = [];
        if (row.before.category !== row.after.category)
          changes.push(`category: ${row.before.category} → ${row.after.category}`);
        if (row.before.severity !== row.after.severity)
          changes.push(`severity: ${row.before.severity} → ${row.after.severity}`);
        if (row.before.comment !== row.after.comment) changes.push("comment updated");
        const changeText = changes.length > 0 ? changes.join(", ") : "no field changes";
        const rowEl = document.createElement("div");
        rowEl.className = "audit-trail-row";
        rowEl.innerHTML = `<span class="audit-icon">✏️</span><div class="audit-body"><div class="audit-changes">${escapeHtml(changeText)}</div></div><span class="audit-ts">${escapeHtml(ts)}</span>`;
        auditDisclosure.appendChild(rowEl);
      }
      commentsRoot.appendChild(auditDisclosure);
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
    // R11 #1: `/trigger` typed-prefix expansion.
    textarea.addEventListener("keydown", (event) => {
      if (event.isComposing) return;
      if (event.key !== " " && event.key !== "Tab" && event.key !== "Enter") {
        return;
      }
      const replies = loadSavedReplies();
      if (!replies.length) return;
      if (tryApplyTrigger(textarea, replies)) {
        event.preventDefault();
        counter.textContent = `${textarea.value.length}/500`;
      }
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

    const savedRepliesBtn = document.createElement("button");
    savedRepliesBtn.type = "button";
    savedRepliesBtn.className = "saved-replies-toggle";
    savedRepliesBtn.title = "Saved Replies (R10) — type /<name>+space to expand";
    const initialReplies = loadSavedReplies();
    const overCap = initialReplies.length > 100;
    savedRepliesBtn.textContent = `📋${initialReplies.length ? ` ${initialReplies.length}` : ""}${overCap ? " ⚠️" : ""}`;
    const dropdown = document.createElement("div");
    dropdown.className = "saved-replies-dropdown";
    dropdown.hidden = true;
    const renderSavedRepliesDropdown = () => {
      dropdown.innerHTML = "";
      const list = loadSavedReplies();
      const header = document.createElement("div");
      header.className = "saved-replies-header";
      header.textContent = "Saved Replies";
      dropdown.appendChild(header);

      const saveCurrent = document.createElement("button");
      saveCurrent.type = "button";
      saveCurrent.className = "saved-replies-save-current";
      saveCurrent.textContent = "💾 Save current as template…";
      saveCurrent.addEventListener("click", (e) => {
        e.stopPropagation();
        const body = textarea.value.trim();
        if (!body) {
          setStatus("Comment box is empty — write the template body first", true);
          return;
        }
        const name =
          typeof window !== "undefined"
            ? window.prompt("Template name (e.g. 'needs-test'):", "")
            : null;
        if (name === null) return;
        const result = addSavedReply(name, body);
        if (!result.ok) {
          setStatus(result.error ?? "Failed to save template", true);
          return;
        }
        setStatus(`Saved template "${name.trim()}"`);
        renderSavedRepliesDropdown();
        const updated = loadSavedReplies();
        const over = updated.length > 100;
        savedRepliesBtn.textContent = `📋${updated.length ? ` ${updated.length}` : ""}${over ? " ⚠️" : ""}`;
      });
      dropdown.appendChild(saveCurrent);

      if (list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "saved-replies-empty";
        empty.textContent = "No saved replies yet — save your first one";
        dropdown.appendChild(empty);
      } else {
        for (const item of list) {
          const row = document.createElement("div");
          row.className = "saved-replies-row";
          const insert = document.createElement("button");
          insert.type = "button";
          insert.className = "saved-replies-insert";
          const preview = item.body.length > 60 ? item.body.slice(0, 57) + "…" : item.body;
          insert.textContent = `${item.name} — ${preview}`;
          insert.title = item.body;
          insert.addEventListener("click", (e) => {
            e.stopPropagation();
            insertAtCursor(textarea, item.body);
            counter.textContent = `${textarea.value.length}/500`;
            dropdown.hidden = true;
          });
          row.appendChild(insert);
          const del = document.createElement("button");
          del.type = "button";
          del.className = "saved-replies-delete";
          del.textContent = "×";
          del.title = `Delete "${item.name}"`;
          del.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSavedReplyByName(item.name);
            renderSavedRepliesDropdown();
            const updated = loadSavedReplies();
            const over = updated.length > 100;
            savedRepliesBtn.textContent = `📋${updated.length ? ` ${updated.length}` : ""}${over ? " ⚠️" : ""}`;
          });
          row.appendChild(del);
          dropdown.appendChild(row);
        }
      }
    };
    savedRepliesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      renderSavedRepliesDropdown();
      dropdown.hidden = !dropdown.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target as Node) && e.target !== savedRepliesBtn) {
        dropdown.hidden = true;
      }
    });
    inputRow.appendChild(savedRepliesBtn);
    inputRow.appendChild(dropdown);
    inputRow.appendChild(submitBtn);
    commentsRoot.appendChild(inputRow);
    item.appendChild(commentsRoot);

    root.appendChild(item);
  }
}

// ── Previously discussed panel ──

// parsePriorNotes lives in src/index.ts (server-shared). The UI consumes the
// pre-parsed notes from GET /api/review/${id}/prior-notes, so no client-side
// markdown parsing is needed.

type PriorRoundEntry = {
  round: number;
  notes: string;
  findings: ConversationEntry[];
};

function groupFindingsByRound(entries: ConversationEntry[]): Map<number, ConversationEntry[]> {
  const byRound = new Map<number, ConversationEntry[]>();
  for (const entry of entries) {
    if (!entry.round || entry.round <= 0) continue;
    const list = byRound.get(entry.round) ?? [];
    list.push(entry);
    byRound.set(entry.round, list);
  }
  return byRound;
}

function buildPriorRoundEntries(
  notes: Array<{ round: number; notes: string }>,
  entries: ConversationEntry[],
): PriorRoundEntry[] {
  const byRound = groupFindingsByRound(entries);
  const rounds = new Set<number>();
  for (const item of notes) if (item.round > 0) rounds.add(item.round);
  for (const r of byRound.keys()) rounds.add(r);
  return Array.from(rounds)
    .sort((a, b) => a - b)
    .map((round) => {
      const note = notes.find((item) => item.round === round);
      return {
        round,
        notes: note?.notes ?? "",
        findings: (byRound.get(round) ?? []).sort((a, b) => a.created_at - b.created_at),
      };
    });
}

async function loadPriorNotes(signal?: AbortSignal): Promise<void> {
  if (state.priorNotesLoaded) return;
  if (signal?.aborted) return;
  state.priorNotesLoaded = true;
  try {
    const response = await fetch(endpoint("/prior-notes"), { signal });
    if (signal?.aborted) return;
    if (!response?.ok) {
      state.priorNotes = [];
      return;
    }
    const data = (await response.json().catch(() => ({}))) as {
      rounds?: Array<{ round: number; notes: string }>;
    };
    state.priorNotes = Array.isArray(data.rounds) ? data.rounds : [];
  } catch {
    if (signal?.aborted) return;
    state.priorNotes = [];
  }
}

function renderPreviouslyDiscussedPanel(root: HTMLElement) {
  // Exclude the current round — the panel is "previously" (prior rounds only);
  // the current round is already covered by the Conversation tab.
  const currentRound = state.data?.round ?? 0;
  const priorEntries: ConversationEntry[] = state.existing
    .map((item) => ({
      ...item,
      origin: "existing" as const,
      round: item.round ?? 0,
      status: item.status ?? ("open" as const),
      created_at: item.created_at ?? 0,
    }))
    .filter((entry) => entry.round > 0 && entry.round < currentRound);

  const priorNotes = state.priorNotes.filter((item) => item.round < currentRound);
  const groupedRaw = buildPriorRoundEntries(priorNotes, priorEntries);

  // R14 #25: populate the round filter dropdown from the unique round
  // numbers currently in scope. Done before the search filter so the
  // dropdown always lists every prior round (even if a round has no
  // search matches — surfacing it lets the user re-check by clearing
  // the search). Dropdown is rebuilt on every render (cheap; < 10 items).
  const sel = document.querySelector<HTMLSelectElement>("#filter-previously-by-round");
  if (sel) {
    const roundNumbers = [...new Set(groupedRaw.map((r) => r.round))].sort((a, b) => a - b);
    const currentFilter = state.previouslyFilterByRound;
    // If the persisted filter is "round N" but N no longer exists, fall back
    // to "all" for this render (without mutating state — user choice is
    // preserved in case round N reappears).
    const effectiveFilter =
      currentFilter === "all" || roundNumbers.includes(currentFilter) ? currentFilter : "all";
    // Repopulate options: "all" + one <option> per round (descending: newest first).
    sel.innerHTML = "";
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "All rounds";
    sel.appendChild(allOpt);
    for (const n of roundNumbers) {
      const opt = document.createElement("option");
      opt.value = String(n);
      opt.textContent = `Round ${n}`;
      sel.appendChild(opt);
    }
    sel.value = effectiveFilter === "all" ? "all" : String(effectiveFilter);
  }

  // R8 #1: search filter — keep a round only if its notes OR any finding
  // (comment text + comment thread replies) match the query. AC8-1.2.
  const searched = filterByQuery(
    groupedRaw,
    currentSearchQuery,
    (r) =>
      `${r.notes} ${r.findings.map((f) => `${f.comment} ${(f.comments ?? []).map((c) => c.text).join(" ")}`).join(" ")}`,
  );

  // R14 #25: round filter is additive to the search filter. The dropdown
  // may have just fallen back to "all" above; use the same effective value
  // so the visible filter state matches the rendered list.
  const effectiveFilter = sel
    ? sel.value === "all"
      ? "all"
      : (() => {
          const n = parseInt(sel.value, 10);
          return Number.isFinite(n) && n > 0 ? n : "all";
        })()
    : state.previouslyFilterByRound;
  const grouped =
    effectiveFilter === "all" ? searched : searched.filter((r) => r.round === effectiveFilter);

  if (grouped.length === 0) {
    const empty = document.createElement("div");
    empty.className = "previously-empty";
    if (currentSearchQuery.trim()) {
      empty.textContent = `No prior rounds match "${currentSearchQuery.trim()}".`;
    } else if (effectiveFilter !== "all") {
      empty.textContent = `No findings in round ${effectiveFilter}.`;
    } else {
      empty.textContent = "No prior discussion yet. Submit a round to start the history.";
    }
    root.appendChild(empty);
    return;
  }

  if (currentRound > 1) {
    const hint = document.createElement("p");
    hint.className = "previously-panel-hint";
    hint.textContent = `Showing prior rounds only (round ${currentRound - 1} and earlier). The current round's findings are in the Conversation tab.`;
    root.appendChild(hint);
  }

  for (const roundEntry of grouped) {
    const section = document.createElement("section");
    section.className = "previously-round";
    section.dataset.round = String(roundEntry.round);

    const header = document.createElement("header");
    header.className = "previously-round-header";

    const roundBadge = document.createElement("span");
    roundBadge.className = "previously-round-badge";
    roundBadge.textContent = `Round ${roundEntry.round}`;
    header.appendChild(roundBadge);

    const counts = document.createElement("span");
    counts.className = "previously-round-counts";
    const findingsCount = roundEntry.findings.length;
    const openCount = roundEntry.findings.filter(
      (f) => f.status === "open" || f.status === "closed_auto",
    ).length;
    const resolvedCount = roundEntry.findings.filter((f) => f.status === "resolved").length;
    const countBits: string[] = [];
    if (findingsCount > 0) {
      countBits.push(`${findingsCount} finding${findingsCount === 1 ? "" : "s"}`);
      if (openCount > 0) countBits.push(`${openCount} open`);
      if (resolvedCount > 0) countBits.push(`${resolvedCount} resolved`);
    } else {
      countBits.push("no findings");
    }
    counts.textContent = countBits.join(" · ");
    header.appendChild(counts);

    section.appendChild(header);

    if (roundEntry.notes) {
      const notesBlock = document.createElement("div");
      notesBlock.className = "previously-notes";
      const notesLabel = document.createElement("div");
      notesLabel.className = "previously-notes-label";
      notesLabel.textContent = "Notes you sent to the agent";
      notesBlock.appendChild(notesLabel);
      const notesText = document.createElement("div");
      notesText.className = "previously-notes-text";
      notesText.textContent = roundEntry.notes;
      notesBlock.appendChild(notesText);
      section.appendChild(notesBlock);
    } else {
      const notesBlock = document.createElement("div");
      notesBlock.className = "previously-notes previously-notes-empty";
      notesBlock.textContent = "(no notes sent this round)";
      section.appendChild(notesBlock);
    }

    if (roundEntry.findings.length > 0) {
      const findingsHeader = document.createElement("div");
      findingsHeader.className = "previously-findings-header";
      findingsHeader.textContent = "Findings + comment threads";
      section.appendChild(findingsHeader);

      for (const finding of roundEntry.findings) {
        const findingItem = document.createElement("div");
        findingItem.className = "previously-finding";
        findingItem.dataset.status = finding.status;
        // R11 #2: stable element-id for permalink deep-linking.
        if (finding.id) findingItem.id = `finding-${finding.id}`;

        const head = document.createElement("div");
        head.className = "previously-finding-head";

        const fileLabel = document.createElement("span");
        fileLabel.className = "previously-finding-file";
        const loc =
          finding.kind === "file"
            ? finding.file
            : finding.start_line === finding.end_line
              ? `${finding.file}:${finding.start_line}`
              : `${finding.file}:${finding.start_line}-${finding.end_line}`;
        fileLabel.textContent = loc;
        head.appendChild(fileLabel);

        const statusBadge = document.createElement("span");
        statusBadge.className = "conversation-status";
        statusBadge.dataset.status = finding.status;
        statusBadge.textContent = finding.status === "closed_auto" ? "stale" : finding.status;
        head.appendChild(statusBadge);

        findingItem.appendChild(head);

        const body = document.createElement("div");
        body.className = "previously-finding-body";
        body.textContent = finding.comment;
        findingItem.appendChild(body);

        if (finding.comments?.length) {
          const thread = document.createElement("div");
          thread.className = "previously-thread";
          for (const comment of finding.comments) {
            const commentEl = document.createElement("div");
            commentEl.className = "previously-comment";
            const meta = document.createElement("div");
            meta.className = "previously-comment-meta";
            meta.textContent = `${comment.author === "agent" ? "🤖 Agent" : "🧑 You"} · ${formatRelativeTime(comment.created_at)}`;
            commentEl.appendChild(meta);
            const text = document.createElement("div");
            text.className = "previously-comment-text";
            text.textContent = comment.text;
            commentEl.appendChild(text);
            thread.appendChild(commentEl);
          }
          findingItem.appendChild(thread);
        }

        section.appendChild(findingItem);
      }
    }

    root.appendChild(section);
  }
}

function renderPreviouslyPane() {
  const previouslyListRoot = document.querySelector("#previously-list") as HTMLDivElement;
  previouslyListRoot.innerHTML = "";
  // R8 #1: search bar at top of the Previously discussed pane.
  previouslyListRoot.appendChild(renderSearchInput("previously"));
  renderPreviouslyDiscussedPanel(previouslyListRoot);
}

function setAllExpanded(expand: boolean) {
  for (const view of state.views.values()) {
    view.instance.setOptions({
      ...view.instance.options,
      expandUnchanged: expand,
    });
    view.instance.rerender();
  }
  setStatus(expand ? "Expanded all files" : "Collapsed all files");
}

function injectHunkCollapseButtons(mount: HTMLElement, filePath: string, virtualizer: DiffVirtualizer): void {
  const wrappers = mount.querySelectorAll<HTMLElement>("[data-hunk]");
  for (const wrapper of wrappers) {
    const hunkIndex = parseInt(wrapper.getAttribute("data-hunk") ?? "-1", 10);
    if (hunkIndex < 0) continue;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "diff-hunk-collapse-btn";
    btn.setAttribute("aria-label", virtualizer.isCollapsed(filePath, hunkIndex) ? t("diff.hunk.expand") : t("diff.hunk.collapse"));
    btn.textContent = virtualizer.isCollapsed(filePath, hunkIndex) ? "▶" : "▼";
    btn.addEventListener("click", () => {
      virtualizer.toggleHunk(filePath, hunkIndex);
      const isCollapsed = virtualizer.isCollapsed(filePath, hunkIndex);
      btn.setAttribute("aria-label", isCollapsed ? t("diff.hunk.expand") : t("diff.hunk.collapse"));
      btn.textContent = isCollapsed ? "▶" : "▼";
    });
    wrapper.insertBefore(btn, wrapper.firstChild);
  }
}

function renderDiffPanel() {
  for (const view of state.views.values()) {
    view.instance.cleanUp();
  }
  // R13 #22 — clear in-diff search state when the diff panel is
  // rebuilt. The previous `<mark>` wrappers are gone (innerHTML
  // reset), so any cached matchElements would point at detached
  // nodes. The overlay input stays put (it's outside diffsRoot);
  // the next input event re-runs the search against the new diffs.
  diffSearch.matchElements = [];
  diffSearch.currentIndex = -1;
  updateDiffSearchCounter();
  diffsRoot.innerHTML = "";
  for (const v of diffVirtualizers.values()) {
    v.disconnect();
  }
  diffVirtualizers.clear();
  state.views.clear();
  state.cards.clear();

  const files = getOrderedFiles();

  if (files.length > 0) {
    const panelToolbar = document.createElement("div");
    panelToolbar.className = "diff-panel-toolbar";
    const expandAllBtn = document.createElement("button");
    expandAllBtn.type = "button";
    expandAllBtn.className = "diff-expand-all-btn";
    expandAllBtn.textContent = "Expand all";
    expandAllBtn.title = "Expand all unchanged regions across every file";
    expandAllBtn.addEventListener("click", () => setAllExpanded(true));
    const collapseAllBtn = document.createElement("button");
    collapseAllBtn.type = "button";
    collapseAllBtn.className = "diff-collapse-all-btn";
    collapseAllBtn.textContent = "Collapse all";
    collapseAllBtn.title = "Collapse all unchanged regions across every file";
    collapseAllBtn.addEventListener("click", () => setAllExpanded(false));
    panelToolbar.appendChild(expandAllBtn);
    panelToolbar.appendChild(collapseAllBtn);
    diffsRoot.appendChild(panelToolbar);
  }

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

    const uncommittedBadge = document.createElement("span");
    if (file.source === "working") {
      uncommittedBadge.className = "file-badge-uncommitted";
      uncommittedBadge.textContent = "uncommitted";
      uncommittedBadge.title = "Working-tree only (not in diff base)";
    }

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
    if (file.source === "working") header.appendChild(uncommittedBadge);
    header.appendChild(cardReviewed);
    header.appendChild(meta);

    const fileVirtualizer = diffVirtualizers.get(file.path);
    if (fileVirtualizer) {
      const perFileExpandBtn = document.createElement("button");
      perFileExpandBtn.type = "button";
      perFileExpandBtn.className = "diff-per-file-expand-btn";
      perFileExpandBtn.textContent = t("panel.expandAll");
      perFileExpandBtn.title = t("panel.expandAll");
      perFileExpandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileVirtualizer.expandAll(file.path);
      });
      const perFileCollapseBtn = document.createElement("button");
      perFileCollapseBtn.type = "button";
      perFileCollapseBtn.className = "diff-per-file-collapse-btn";
      perFileCollapseBtn.textContent = t("panel.collapseAll");
      perFileCollapseBtn.title = t("panel.collapseAll");
      perFileCollapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileVirtualizer.collapseAll(file.path);
      });
      header.appendChild(perFileExpandBtn);
      header.appendChild(perFileCollapseBtn);
    }

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

async function resolveFinding(
  id: string,
  opts: {
    reason?: string;
    resolution_kind?: FindingResolutionKind;
    resolution_reason?: string;
  } = {},
) {
  const body: {
    finding_id: string;
    reason?: string;
    resolution_kind?: FindingResolutionKind;
    resolution_reason?: string;
  } = { finding_id: id };
  if (opts.reason) body.reason = opts.reason.slice(0, 200);
  if (opts.resolution_kind) body.resolution_kind = opts.resolution_kind;
  if (opts.resolution_reason) body.resolution_reason = opts.resolution_reason.slice(0, 200);
  const response = await fetch(endpoint("/resolve"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined);

  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Failed to resolve finding", true);
    return;
  }

  const item = state.existing.find((f) => f.id === id);
  if (item) {
    item.status = "resolved";
    if (opts.reason) {
      item.resolve_reason = opts.reason.slice(0, 200);
      item.resolve_manually_resolved = true;
    }
    if (opts.resolution_kind) {
      item.resolution_kind = opts.resolution_kind;
      if (opts.resolution_reason) {
        item.resolution_reason = opts.resolution_reason.slice(0, 200);
      }
    }
  }
  renderFindings();
  renderConversationPane();
  syncAll();
  setStatus(opts.resolution_kind ? "Finding marked as wontfix" : "Finding resolved");
}

async function reopenFinding(id: string, reason = "", opts: { manually_reopened?: boolean } = {}) {
  const body: { finding_id: string; manually_reopened?: true; reason?: string } = {
    finding_id: id,
  };
  if (opts.manually_reopened) body.manually_reopened = true;
  if (reason) body.reason = reason.slice(0, 200);
  const response = await fetch(endpoint("/reopen"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined);

  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Cannot reopen (code may have changed)", true);
    return;
  }

  const item = state.existing.find((f) => f.id === id);
  if (item) {
    item.status = "open";
    if (opts.manually_reopened) {
      item.manually_reopened = true;
      item.close_reason = undefined;
    }
  }
  renderFindings();
  renderConversationPane();
  syncAll();
  setStatus(
    opts.manually_reopened
      ? "Finding force-reopened — will be re-applied in the next round"
      : "Finding reopened",
  );
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

async function editFinding(
  id: string,
  fields: { category?: string; severity?: string; comment?: string },
): Promise<boolean> {
  const response = await fetch(endpoint(`/findings/${id}`), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(fields),
  }).catch(() => undefined);
  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Failed to edit finding", true);
    return false;
  }
  const payload = (await response.json().catch(() => undefined)) as
    | { ok: true; finding: Finding }
    | undefined;
  if (!payload?.ok || !payload.finding) return false;
  const existing = state.existing.find((item) => item.id === id);
  if (existing) {
    Object.assign(existing, payload.finding);
  } else {
    const fresh = state.fresh.find((item) => item.id === id);
    if (fresh) Object.assign(fresh, payload.finding);
  }
  renderFindings();
  renderConversationPane();
  syncAll();
  setStatus("Finding edited");
  return true;
}

async function pinFinding(id: string): Promise<void> {
  const response = await fetch(endpoint("/pin"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ finding_id: id }),
  }).catch(() => undefined);
  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Failed to pin finding", true);
    return;
  }
  const payload = (await response.json().catch(() => undefined)) as
    | { ok: true; pinned: { by: "user"; at: number } }
    | undefined;
  if (!payload?.ok || !payload.pinned) return;
  const existing = state.existing.find((item) => item.id === id);
  if (existing) {
    existing.pinned = payload.pinned;
    existing.manually_pinned = true;
  } else {
    const fresh = state.fresh.find((item) => item.id === id);
    if (fresh) {
      fresh.pinned = payload.pinned;
      fresh.manually_pinned = true;
    }
  }
  renderConversationPane();
  updateConversationTabBadge();
  setStatus("Pinned — will revisit this finding");
}

async function unpinFinding(id: string): Promise<void> {
  const response = await fetch(endpoint("/unpin"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ finding_id: id }),
  }).catch(() => undefined);
  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Failed to unpin finding", true);
    return;
  }
  const existing = state.existing.find((item) => item.id === id);
  if (existing) {
    existing.pinned = undefined;
    existing.manually_pinned = undefined;
  } else {
    const fresh = state.fresh.find((item) => item.id === id);
    if (fresh) {
      fresh.pinned = undefined;
      fresh.manually_pinned = undefined;
    }
  }
  renderConversationPane();
  updateConversationTabBadge();
  setStatus("Unpinned");
}

async function toggleReaction(id: string, emoji: ReactionEmoji): Promise<void> {
  const response = await fetch(endpoint("/reaction"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ finding_id: id, emoji }),
  }).catch(() => undefined);
  if (!response?.ok) {
    const data = await response?.json().catch(() => undefined);
    setStatus(data?.error ?? "Failed to toggle reaction", true);
    return;
  }
  const payload = (await response.json().catch(() => undefined)) as
    | { ok: true; reactions?: Reaction[] }
    | undefined;
  if (!payload?.ok) return;
  const existing = state.existing.find((item) => item.id === id);
  if (existing) {
    existing.reactions = payload.reactions ?? [];
  } else {
    const fresh = state.fresh.find((item) => item.id === id);
    if (fresh) fresh.reactions = payload.reactions ?? [];
  }
  renderConversationPane();
  updateConversationTabBadge();
}

function showEditFindingModal(finding: {
  id: string;
  category: string;
  severity: string;
  comment: string;
}): Promise<{ category: string; severity: string; comment: string } | null> {
  return new Promise((resolve) => {
    const categories = state.data?.taxonomy.categories ?? [];
    const severities = state.data?.taxonomy.severities ?? [];
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "modal-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    const catOptions = categories
      .map((c) => `<option value="${c}"${c === finding.category ? " selected" : ""}>${c}</option>`)
      .join("");
    const sevOptions = severities
      .map((s) => `<option value="${s}"${s === finding.severity ? " selected" : ""}>${s}</option>`)
      .join("");
    dialog.innerHTML = `
      <h3>Edit finding</h3>
      <p>Update category, severity, or comment. Changes are audited and visible to the agent.</p>
      <div class="modal-field">
        <label for="edit-category">Category</label>
        <select id="edit-category">${catOptions}</select>
      </div>
      <div class="modal-field">
        <label for="edit-severity">Severity</label>
        <select id="edit-severity">${sevOptions}</select>
      </div>
      <div class="modal-field">
        <label for="edit-comment">Comment</label>
        <textarea id="edit-comment" rows="4" maxlength="2000"></textarea>
      </div>
      <div class="modal-actions">
        <button id="edit-cancel" type="button">Cancel</button>
        <button id="edit-save" class="primary" type="button">Save</button>
      </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const categoryEl = dialog.querySelector("#edit-category") as HTMLSelectElement | null;
    const severityEl = dialog.querySelector("#edit-severity") as HTMLSelectElement | null;
    const commentEl = dialog.querySelector("#edit-comment") as HTMLTextAreaElement | null;
    const cancelBtn = dialog.querySelector("#edit-cancel") as HTMLButtonElement | null;
    const saveBtn = dialog.querySelector("#edit-save") as HTMLButtonElement | null;
    if (commentEl) commentEl.value = finding.comment;

    const closeWith = (value: { category: string; severity: string; comment: string } | null) => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(value);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWith(null);
    };
    document.addEventListener("keydown", onKey, { once: false });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        document.removeEventListener("keydown", onKey);
        closeWith(null);
      }
    });
    cancelBtn?.addEventListener("click", () => {
      document.removeEventListener("keydown", onKey);
      closeWith(null);
    });
    saveBtn?.addEventListener("click", () => {
      document.removeEventListener("keydown", onKey);
      closeWith({
        category: categoryEl?.value ?? finding.category,
        severity: severityEl?.value ?? finding.severity,
        comment: commentEl?.value ?? finding.comment,
      });
    });
  });
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
    // R14 #24: client stamp of the last save. Server uses max(client, server)
    // to keep state.draft.lastSavedAt monotonic across clock skew.
    lastSavedAt: Date.now(),
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

  // R14 #24: replace the intrusive "Draft saved at HH:MM:SS" toast with a
  // persistent "Saved Xs ago" indicator in the header. The indicator
  // ticks every 5s (startAutoSaveIndicator) and resets to "All changes
  // saved" after 60s of no saves. The server response includes the
  // canonical lastSavedAt (max of client + server clocks) so we adopt
  // that as the new baseline.
  const body = (await response.json().catch(() => ({}))) as { lastSavedAt?: number };
  const serverStamp =
    typeof body.lastSavedAt === "number" && Number.isFinite(body.lastSavedAt)
      ? body.lastSavedAt
      : Date.now();
  state.draftLastSavedAt = serverStamp;
  // Clear any leftover failure-flash on the indicator.
  setStatus("");
  updateSaveIndicator();
}

function scheduleSave() {
  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    saveDraft();
  }, 250);
}

function installImeSafeInputListener(
  input: HTMLInputElement,
  onCommit: (value: string) => void,
): void {
  let isComposing = false;
  input.addEventListener("compositionstart", () => {
    isComposing = true;
  });
  input.addEventListener("compositionend", () => {
    isComposing = false;
    onCommit(input.value);
  });
  input.addEventListener("input", () => {
    if (isComposing) return;
    onCommit(input.value);
  });
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
  showToast("Finding added");
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
    showToast(`Submit failed (${response.status})`, { error: true });
    setStatus(`Submit failed (${response.status}) ${detail || "unknown error"}`, true);
    return;
  }

  const body = await response.json().catch(() => ({}));
  showToast(`Review submitted${body?.round ? ` — round ${body.round}` : ""}`);
  showPostSubmit(body?.round);
}

function showPostSubmit(round: number | undefined) {
  addButton.disabled = true;
  clearButton.disabled = true;
  submitButton.disabled = true;
  commentRoot.disabled = true;
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
submitButton.addEventListener("click", () => {
  const findings = all();
  const openCount = findings.filter(
    (f) => f.status === "open" || f.status === "closed_auto",
  ).length;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  const dialog = document.createElement("div");
  dialog.className = "modal-dialog submit-confirm-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.innerHTML = `<h3>Submit review?</h3><p>You're about to submit your review.</p><div class="finding-count">${openCount}</div><p style="text-align:center;font-size:13px;color:light-dark(#666,#aaa);margin-bottom:0">open finding${openCount !== 1 ? "s" : ""} will be submitted.</p><label for="round-notes" class="round-notes-label">Round notes (appear in next round's "Previously discussed" panel)</label><textarea id="round-notes" data-testid="round-notes-textarea" class="round-notes-textarea" placeholder="Optional global notes for this round" rows="5"></textarea><div class="modal-actions"><button id="submit-confirm-cancel" type="button">Cancel</button><button id="submit-confirm-ok" class="primary" type="button">Submit</button></div>`;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  const close = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
  const cancelBtn = dialog.querySelector("#submit-confirm-cancel") as HTMLButtonElement;
  const okBtn = dialog.querySelector("#submit-confirm-ok") as HTMLButtonElement;
  const notesArea = dialog.querySelector("#round-notes") as HTMLTextAreaElement;
  notesArea.value = state.notes ?? "";
  notesArea.addEventListener("input", () => {
    state.notes = notesArea.value;
    scheduleSave();
  });
  cancelBtn.addEventListener("click", close);
  okBtn.addEventListener("click", () => {
    state.notes = notesArea.value;
    close();
    submit();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  installModalA11y(dialog, close);
  notesArea.focus();
});
exportButton?.addEventListener("click", () => {
  if (!state.data) {
    setStatus("No review data to export", true);
    return;
  }
  showExportModal();
});

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
  // R14 #24: read the server-stamped lastSavedAt on initial load so the
  // "Saved Xs ago" indicator is correct on page reload. Backwards-compat:
  // missing on legacy state.json files → 0 → indicator shows "All changes
  // saved" (the "idle" state).
  state.draftLastSavedAt =
    typeof state.data.draft?.lastSavedAt === "number" ? state.data.draft.lastSavedAt : 0;

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

  const diffBaseEl = document.querySelector("#diff-base") as HTMLElement | null;
  if (diffBaseEl) {
    diffBaseEl.innerHTML = renderDiffBaseHeader(state.data.diff_base);
  }

  renderRangeBanner();

  fillOptions();
  renderActivePane();
  renderDiffPanel();
  renderFindings();
  renderSelection();
  syncAll();
  // R20 #40: sidebar progress depends on state.read.size + total file
  // count — must render after state.data is loaded and after every
  // language change (the text uses t() with params, so it can't ride
  // the static data-i18n / registerUITranslator pipeline).
  renderReviewProgress();
  resolveHashOnLoad();
  // R14 #24: kick off the 5s "Saved Xs ago" indicator ticker. The
  // indicator starts in the "idle" / "All changes saved" state; the
  // first saveDraft() call flips it to "fresh" and updates the
  // timestamp.
  startAutoSaveIndicator();
}

init();

// R14 #23: re-export the pure sort helper so existing __test consumers
// (if any) still resolve. The canonical export is now from
// src/sort-utils.ts.
export { sortConversationEntries } from "../sort-utils";
