/**
 * R23 #47 — Diff virtualization using IntersectionObserver.
 *
 * Virtualizes hunk rendering: only visible hunks + small buffer are rendered.
 * Off-screen hunks collapse to `<div data-hunk-placeholder>` placeholders.
 *
 * Pattern: reuse IntersectionObserver from scrollSpy (app.ts:3139).
 * Two observers coexist: scrollSpy → `[data-file-card]`, new → `[data-hunk]`.
 *
 * Run with: bun test src/ui/diff-virtualization.test.ts
 */

import type { Hunk } from "@pierre/diffs";

export interface HunkRange {
  hunkIndex: number;
  startLine: number;
  endLine: number;
}

export interface DiffVirtualizerOptions {
  rootMargin?: string;
  onHunkVisibilityChange?: (hunkIndex: number, isVisible: boolean) => void;
}

export class DiffVirtualizer {
  private observer: IntersectionObserver | null = null;
  private container: HTMLElement;
  private rootMargin: string;
  private onHunkVisibilityChange?: (hunkIndex: number, isVisible: boolean) => void;
  private hunkStates: Map<number, { wrapper: HTMLElement; isVisible: boolean }> = new Map();
  private collapsedHunks = new Map<string, Set<number>>();
  private hunkRanges: Map<string, HunkRange[]> = new Map();

  constructor(container: HTMLElement, options: DiffVirtualizerOptions = {}) {
    this.container = container;
    this.rootMargin = options.rootMargin ?? "200px";
    this.onHunkVisibilityChange = options.onHunkVisibilityChange;
  }

  /**
   * Mark hunk boundaries within the rendered diff container by wrapping each
   * hunk's lines in a `<div data-hunk="N">` container. Returns the wrapper
   * elements for observation.
   */
  markHunkBoundaries(
    hunkRanges: HunkRange[],
    filePath: string,
  ): HTMLElement[] {
    this.hunkRanges.set(filePath, hunkRanges);
    const wrappers: HTMLElement[] = [];

    for (const hunk of hunkRanges) {
      const startLine = hunk.startLine;
      const endLine = hunk.endLine;

      const linesInRange = this.container.querySelectorAll<HTMLElement>(
        `[data-line="${startLine}"], [data-line][data-line-index]`,
      );

      let firstLine: HTMLElement | null = null;
      let lastLine: HTMLElement | null = null;

      for (const el of Array.from(linesInRange)) {
        const lineNum = parseInt(el.getAttribute("data-line") ?? "-1", 10);
        if (lineNum === startLine && !firstLine) {
          firstLine = el;
        }
        if (lineNum === endLine) {
          lastLine = el;
        }
        if (firstLine && lastLine) break;
      }

      if (!firstLine || !lastLine) {
        const allLines = this.container.querySelectorAll<HTMLElement>("[data-line]");
        for (const el of Array.from(allLines)) {
          const lineNum = parseInt(el.getAttribute("data-line") ?? "-1", 10);
          if (lineNum >= startLine && (!firstLine || lineNum < parseInt(firstLine.getAttribute("data-line") ?? "-1", 10))) {
            firstLine = el;
          }
          if (lineNum <= endLine && lineNum > parseInt(lastLine?.getAttribute("data-line") ?? "-1", 10)) {
            lastLine = el;
          }
        }
      }

      if (!firstLine || !lastLine) continue;

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-hunk", String(hunk.hunkIndex));
      wrapper.dataset.file = filePath;
      wrapper.dataset.hunkStart = String(startLine);
      wrapper.dataset.hunkEnd = String(endLine);

      let current: Node | null = firstLine;
      while (current && current !== lastLine.nextSibling) {
        const next: Node | null = current.nextSibling;
        wrapper.appendChild(current);
        if (current === lastLine) break;
        current = next;
      }

      this.container.appendChild(wrapper);
      this.hunkStates.set(hunk.hunkIndex, { wrapper, isVisible: true });
      wrappers.push(wrapper);
    }

    return wrappers;
  }

  /**
   * Set up IntersectionObserver to watch marked hunk wrappers.
   * When a wrapper enters viewport → restore full content (uncollapse).
   * When a wrapper exits viewport → replace content with height-preserving placeholder.
   */
  observe(hunkWrappers: HTMLElement[]): void {
    this.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const hunkIndex = parseInt(target.getAttribute("data-hunk") ?? "-1", 10);
          if (hunkIndex < 0) continue;

          const state = this.hunkStates.get(hunkIndex);
          if (!state) continue;

          if (entry.isIntersecting) {
            this.uncollapseHunk(state, hunkIndex);
          } else {
            this.collapseHunk(state, hunkIndex);
          }
        }
      },
      {
        rootMargin: this.rootMargin,
        threshold: 0,
      },
    );

    for (const wrapper of hunkWrappers) {
      this.observer.observe(wrapper);
    }
  }

  private collapseHunk(
    state: { wrapper: HTMLElement; isVisible: boolean },
    hunkIndex: number,
  ): void {
    if (!state.isVisible) return;
    const height = state.wrapper.offsetHeight;
    const placeholder = document.createElement("div");
    placeholder.setAttribute("data-hunk-placeholder", "");
    placeholder.dataset.hunk = String(hunkIndex);
    placeholder.style.height = `${height}px`;
    placeholder.style.display = "block";
    placeholder.textContent = `\n  // hunk ${hunkIndex} collapsed\n`;

    state.wrapper.replaceWith(placeholder);
    this.hunkStates.set(hunkIndex, { wrapper: placeholder, isVisible: false });
    this.onHunkVisibilityChange?.(hunkIndex, false);
  }

  private uncollapseHunk(
    state: { wrapper: HTMLElement; isVisible: boolean },
    hunkIndex: number,
  ): void {
    if (state.isVisible) return;
    const placeholder = state.wrapper;
    if (!placeholder.hasAttribute("data-hunk-placeholder")) return;

    const height = parseInt(placeholder.style.height ?? "0", 10);

    const restored = document.createElement("div");
    restored.setAttribute("data-hunk", String(hunkIndex));
    restored.dataset.hunkStart = placeholder.dataset.hunkStart ?? "";
    restored.dataset.hunkEnd = placeholder.dataset.hunkEnd ?? "";
    restored.style.height = `${height}px`;
    restored.textContent = `\n  // hunk ${hunkIndex} content restored\n`;

    placeholder.replaceWith(restored);
    this.hunkStates.set(hunkIndex, { wrapper: restored, isVisible: true });
    this.onHunkVisibilityChange?.(hunkIndex, true);
  }

  toggleHunk(filePath: string, hunkIndex: number): void {
    const set = this.collapsedHunks.get(filePath) ?? new Set();
    if (set.has(hunkIndex)) {
      set.delete(hunkIndex);
    } else {
      set.add(hunkIndex);
    }
    this.collapsedHunks.set(filePath, set);
    const state = this.hunkStates.get(hunkIndex);
    if (state) {
      if (set.has(hunkIndex)) {
        this.userCollapseHunk(state, hunkIndex);
      } else {
        this.userExpandHunk(state, hunkIndex);
      }
    }
  }

  isCollapsed(filePath: string, hunkIndex: number): boolean {
    return this.collapsedHunks.get(filePath)?.has(hunkIndex) ?? false;
  }

  expandAll(filePath: string): void {
    const ranges = this.hunkRanges.get(filePath) ?? [];
    const set = this.collapsedHunks.get(filePath) ?? new Set();
    for (const range of ranges) {
      if (set.has(range.hunkIndex)) {
        set.delete(range.hunkIndex);
        const state = this.hunkStates.get(range.hunkIndex);
        if (state) this.userExpandHunk(state, range.hunkIndex);
      }
    }
    this.collapsedHunks.set(filePath, set);
  }

  collapseAll(filePath: string): void {
    const ranges = this.hunkRanges.get(filePath) ?? [];
    const set = this.collapsedHunks.get(filePath) ?? new Set();
    for (const range of ranges) {
      if (!set.has(range.hunkIndex)) {
        set.add(range.hunkIndex);
        const state = this.hunkStates.get(range.hunkIndex);
        if (state) this.userCollapseHunk(state, range.hunkIndex);
      }
    }
    this.collapsedHunks.set(filePath, set);
  }

  getCollapsedCount(filePath: string): number {
    return this.collapsedHunks.get(filePath)?.size ?? 0;
  }

  private userCollapseHunk(
    state: { wrapper: HTMLElement; isVisible: boolean },
    hunkIndex: number,
  ): void {
    const height = state.wrapper.offsetHeight;
    const startLine = state.wrapper.dataset.hunkStart ?? "?";
    const endLine = state.wrapper.dataset.hunkEnd ?? "?";
    const placeholder = document.createElement("div");
    placeholder.setAttribute("data-hunk-placeholder", "");
    placeholder.dataset.hunk = String(hunkIndex);
    placeholder.dataset.collapsed = "user";
    placeholder.style.height = `${height}px`;
    placeholder.style.display = "block";
    placeholder.textContent = `\n  // hunk ${hunkIndex} (${startLine}–${endLine}) collapsed by user\n`;

    state.wrapper.replaceWith(placeholder);
    this.hunkStates.set(hunkIndex, { wrapper: placeholder, isVisible: false });
  }

  private userExpandHunk(
    state: { wrapper: HTMLElement; isVisible: boolean },
    hunkIndex: number,
  ): void {
    const placeholder = state.wrapper;
    if (!placeholder.hasAttribute("data-hunk-placeholder")) return;
    if (placeholder.dataset.collapsed !== "user") return;

    const height = parseInt(placeholder.style.height ?? "0", 10);

    const restored = document.createElement("div");
    restored.setAttribute("data-hunk", String(hunkIndex));
    restored.dataset.hunkStart = placeholder.dataset.hunkStart ?? "";
    restored.dataset.hunkEnd = placeholder.dataset.hunkEnd ?? "";
    restored.dataset.file = placeholder.dataset.file ?? "";
    restored.style.height = `${height}px`;
    restored.textContent = `\n  // hunk ${hunkIndex} content restored\n`;

    placeholder.replaceWith(restored);
    this.hunkStates.set(hunkIndex, { wrapper: restored, isVisible: true });
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.hunkStates.clear();
  }
}

/**
 * Given the file path and an array of Hunk objects from @pierre/diffs,
 * compute the line ranges for each hunk so we can mark boundaries.
 */
export function computeHunkRanges(hunks: Hunk[]): HunkRange[] {
  return hunks.map((h, i) => ({
    hunkIndex: i,
    startLine: h.additionStart,
    endLine: h.additionStart + h.additionCount - 1,
  }));
}
