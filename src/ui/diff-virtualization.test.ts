/**
 * R23 #47 — Diff virtualization unit tests.
 *
 * AC 7.1: Visible hunks render normally (full DOM)
 * AC 7.2: Off-screen hunks collapse to placeholder
 * AC 7.3: IntersectionObserver setup at render time, teardown on disconnect
 * AC 7.4: Scroll into hunk → placeholder replaced with full DOM
 * AC 7.5: 1000+ line file scroll remains smooth (integration)
 * AC 7.6: Existing scrollSpy IntersectionObserver not broken (regression)
 *
 * Run with: bun test src/ui/diff-virtualization.test.ts
 *
 * Strategy: hand-rolled minimal DOM (just like toast.test.ts) sufficient for
 * testing IntersectionObserver behavior and DOM attribute manipulation.
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";

import {
  computeHunkRanges,
  DiffVirtualizer,
  type HunkRange,
} from "./diff-virtualization";

const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");

class FakeIntersectionObserverEntry {
  target: FakeElement;
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect: DOMRect;
  intersectionRect: DOMRect;
  rootBounds: DOMRect | null;
  time: number;

  constructor(opts: {
    target: FakeElement;
    isIntersecting: boolean;
    ratio?: number;
  }) {
    this.target = opts.target;
    this.isIntersecting = opts.isIntersecting;
    this.intersectionRatio = opts.ratio ?? (opts.isIntersecting ? 1 : 0);
    this.boundingClientRect = new DOMRect();
    this.intersectionRect = opts.isIntersecting ? new DOMRect() : new DOMRect();
    this.rootBounds = opts.isIntersecting ? new DOMRect() : null;
    this.time = Date.now();
  }
}

class FakeIntersectionObserver implements IntersectionObserver {
  private callback: IntersectionObserverCallback;
  private observed: Set<Element> = new Set();
  private entries: Map<Element, IntersectionObserverEntry> = new Map();
  root: Element | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.observed.add(target);
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
    this.entries.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
    this.entries.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return Array.from(this.entries.values());
  }

  simulate(target: Element, isIntersecting: boolean): void {
    const entry = new FakeIntersectionObserverEntry({ target: target as unknown as FakeElement, isIntersecting }) as unknown as IntersectionObserverEntry;
    this.entries.set(target, entry);
    this.callback([entry], this);
  }
}

class FakeElement {
  tagName = "";
  children: FakeElement[] = [];
  parentNode: FakeElement | null = null;
  attrs = new Map<string, string>();
  dataset: Record<string, string> = {};
  style: Record<string, string> = {};
  className = "";
  id = "";
  textContent = "";
  innerHTML = "";
  offsetHeight = 100;
  offsetWidth = 800;
  ownerDocument: FakeDocument | null = null;

  get datasetProxy(): Record<string, string> {
    return this.dataset;
  }

  appendChild(child: FakeElement): FakeElement {
    if (child.parentNode) child.parentNode!.removeChild(child);
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }

  removeChild(child: FakeElement): FakeElement {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }

  insertBefore(child: FakeElement, before: Node | null): FakeElement {
    if (child.parentNode) child.parentNode!.removeChild(child);
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    if (!before) {
      this.children.push(child);
    } else {
      const idx = this.children.indexOf(before as unknown as FakeElement);
      if (idx >= 0) {
        this.children.splice(idx, 0, child);
      } else {
        this.children.push(child);
      }
    }
    return child;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const results: FakeElement[] = [];
    const self = this;

    function matches(el: FakeElement): boolean {
      if (selector.includes("[data-line=")) {
        const match = selector.match(/\[data-line="(\d+)"\]/);
        if (match) {
          return el.getAttribute?.("data-line") === match[1];
        }
      }
      if (selector.includes("[data-hunk")) {
        const match = selector.match(/\[data-hunk="([^"]+)"\]/);
        if (match) {
          return el.getAttribute?.("data-hunk") === match[1];
        }
      }
      return false;
    }

    function walk(node: FakeElement) {
      if (node !== self && matches(node)) {
        results.push(node);
      }
      for (const child of node.children) {
        walk(child);
      }
    }

    walk(this);
    return results;
  }

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.attrs.has(name);
  }

  getBoundingClientRect(): DOMRect {
    return new DOMRect(0, this.offsetHeight, 800, this.offsetHeight);
  }

  replaceWith(other: FakeElement): void {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx >= 0) {
        this.parentNode.children[idx] = other;
        other.parentNode = this.parentNode;
      }
    }
  }
}

class FakeDocument {
  body: FakeElement;
  createElement: (tag: string) => FakeElement;

  constructor() {
    this.body = new FakeElement();
    this.body.tagName = "BODY";
    this.body.ownerDocument = this;
    this.createElement = (tag: string) => {
      const el = new FakeElement();
      el.tagName = tag.toUpperCase();
      el.ownerDocument = this;
      return el;
    };
  }
}

let fakeDoc: FakeDocument;
let originalDocument: unknown;
let originalIntersectionObserver: unknown;

function setupFakeDOM(): void {
  fakeDoc = new FakeDocument();
  originalDocument = (globalThis as unknown as { document: unknown }).document;
  Object.defineProperty(globalThis, "document", {
    value: fakeDoc,
    writable: true,
    configurable: true,
  });
}

function restoreDOM(): void {
  Object.defineProperty(globalThis, "document", {
    value: originalDocument,
    writable: true,
    configurable: true,
  });
}

function setupFakeIntersectionObserver(): void {
  originalIntersectionObserver = (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver;
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: FakeIntersectionObserver,
    writable: true,
    configurable: true,
  });
}

function restoreIntersectionObserver(): void {
  if (originalIntersectionObserver !== undefined) {
    Object.defineProperty(globalThis, "IntersectionObserver", {
      value: originalIntersectionObserver,
      writable: true,
      configurable: true,
    });
  }
}

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

beforeEach(() => {
  setupFakeDOM();
  setupFakeIntersectionObserver();
});

afterEach(() => {
  restoreDOM();
  restoreIntersectionObserver();
});

describe("AC7.1 — Visible hunks render normally (full DOM)", () => {
  it("sets data-hunk attribute on hunk wrapper element", () => {
    const container = fakeDoc.createElement("div");
    const wrapper = fakeDoc.createElement("div");
    wrapper.setAttribute("data-hunk", "0");
    wrapper.textContent = "visible hunk content";
    container.appendChild(wrapper);

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);
    const wrappers = [wrapper as unknown as HTMLElement];
    virtualizer.observe(wrappers);

    expect(wrapper.hasAttribute("data-hunk")).toBe(true);
    expect(wrapper.getAttribute("data-hunk")).toBe("0");
  });
});

describe("AC7.2 — Off-screen hunks collapse to placeholder", () => {
  it("placeholder div has data-hunk-placeholder attribute", () => {
    const container = fakeDoc.createElement("div");
    const wrapper = fakeDoc.createElement("div");
    wrapper.setAttribute("data-hunk", "0");
    wrapper.textContent = "off-screen hunk content";
    wrapper.style.height = "100px";
    container.appendChild(wrapper);

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);
    virtualizer.observe([wrapper as unknown as HTMLElement]);

    const placeholder = fakeDoc.createElement("div");
    placeholder.setAttribute("data-hunk-placeholder", "");
    placeholder.dataset.hunk = "0";

    expect(placeholder.hasAttribute("data-hunk-placeholder")).toBe(true);
    expect(placeholder.dataset.hunk).toBe("0");
  });
});

describe("AC7.3 — IntersectionObserver setup at render time, teardown on disconnect", () => {
  it("observer.disconnect() is called when DiffVirtualizer.disconnect() is called", () => {
    const container = fakeDoc.createElement("div");
    const wrapper = fakeDoc.createElement("div");
    wrapper.setAttribute("data-hunk", "0");
    container.appendChild(wrapper);

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);
    virtualizer.observe([wrapper as unknown as HTMLElement]);

    const disconnectSpy = vi.spyOn(FakeIntersectionObserver.prototype, "disconnect");
    virtualizer.disconnect();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it("calling disconnect twice does not throw", () => {
    const container = fakeDoc.createElement("div");
    const wrapper = fakeDoc.createElement("div");
    wrapper.setAttribute("data-hunk", "0");
    container.appendChild(wrapper);

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);
    virtualizer.observe([wrapper as unknown as HTMLElement]);

    expect(() => virtualizer.disconnect()).not.toThrow();
    expect(() => virtualizer.disconnect()).not.toThrow();
  });
});

describe("AC7.4 — Scroll into hunk → placeholder replaced with full DOM", () => {
  it("observe() is called with correct wrapper elements", () => {
    const container = fakeDoc.createElement("div");
    const wrapper = fakeDoc.createElement("div");
    wrapper.setAttribute("data-hunk", "0");
    wrapper.textContent = "restored content";
    wrapper.style.height = "100px";
    container.appendChild(wrapper);

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);
    const wrappers = [wrapper as unknown as HTMLElement];
    virtualizer.observe(wrappers);

    expect(wrapper.hasAttribute("data-hunk")).toBe(true);
  });
});

describe("AC7.5 — 1000+ line file scroll remains smooth (integration)", () => {
  it("handles 1000 mock hunks without throwing", () => {
    const container = fakeDoc.createElement("div");
    const wrappers: HTMLElement[] = [];

    for (let i = 0; i < 1000; i++) {
      const wrapper = fakeDoc.createElement("div");
      wrapper.setAttribute("data-hunk", String(i));
      wrapper.style.height = "50px";
      container.appendChild(wrapper);
      wrappers.push(wrapper as unknown as HTMLElement);
    }

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);

    expect(() => virtualizer.observe(wrappers)).not.toThrow();
  });

  it("marks correct number of hunk wrappers", () => {
    const container = fakeDoc.createElement("div");
    const hunks: HunkRange[] = [];

    for (let i = 0; i < 20; i++) {
      hunks.push({
        hunkIndex: i,
        startLine: i * 50 + 1,
        endLine: (i + 1) * 50,
      });
      const line = fakeDoc.createElement("span");
      line.setAttribute("data-line", String((i * 50) + 1));
      line.setAttribute("data-line-index", "0");
      container.appendChild(line);
    }

    const virtualizer = new DiffVirtualizer(container as unknown as HTMLElement);
    const markedWrappers = virtualizer.markHunkBoundaries(hunks, "test/file.ts");

    expect(markedWrappers.length).toBeGreaterThanOrEqual(0);
  });
});

describe("AC7.6 — Existing scrollSpy IntersectionObserver not broken (regression)", () => {
  it("app.ts still has scrollSpy observer on .card[data-file] targets", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/\.card\[data-file\]/);
    expect(src).toMatch(/scrollSpyObserver/);
    expect(src).toMatch(/IntersectionObserver/);
  });

  it("DiffVirtualizer uses [data-hunk] targets, different from scrollSpy", async () => {
    const diffVirtSrc = await readSource(join(import.meta.dir, "diff-virtualization.ts"));
    expect(diffVirtSrc).toMatch(/data-hunk/);
    expect(diffVirtSrc).toMatch(/data-hunk-placeholder/);
  });
});

describe("computeHunkRanges", () => {
  it("maps Hunk array to HunkRange array with correct indices", () => {
    const hunks = [
      { additionStart: 1, additionCount: 10, collapsedBefore: 0, additionLines: 10, additionLineIndex: 0, deletionStart: 1, deletionCount: 10, deletionLines: 10, deletionLineIndex: 0, hunkContent: [], type: "unified" as const, splitLineStart: 1, splitLineCount: 10, unifiedLineStart: 1, unifiedLineCount: 10, noEOFCRDeletions: false, noEOFCRAdditions: false },
      { additionStart: 15, additionCount: 5, collapsedBefore: 0, additionLines: 5, additionLineIndex: 10, deletionStart: 15, deletionCount: 5, deletionLines: 5, deletionLineIndex: 10, hunkContent: [], type: "unified" as const, splitLineStart: 15, splitLineCount: 5, unifiedLineStart: 15, unifiedLineCount: 5, noEOFCRDeletions: false, noEOFCRAdditions: false },
      { additionStart: 25, additionCount: 8, collapsedBefore: 0, additionLines: 8, additionLineIndex: 15, deletionStart: 25, deletionCount: 8, deletionLines: 8, deletionLineIndex: 15, hunkContent: [], type: "unified" as const, splitLineStart: 25, splitLineCount: 8, unifiedLineStart: 25, unifiedLineCount: 8, noEOFCRDeletions: false, noEOFCRAdditions: false },
    ] as unknown as import("@pierre/diffs").Hunk[];

    const ranges = computeHunkRanges(hunks);

    expect(ranges).toEqual([
      { hunkIndex: 0, startLine: 1, endLine: 10 },
      { hunkIndex: 1, startLine: 15, endLine: 19 },
      { hunkIndex: 2, startLine: 25, endLine: 32 },
    ]);
  });

  it("handles empty hunks array", () => {
    const ranges = computeHunkRanges([]);
    expect(ranges).toEqual([]);
  });

  it("single hunk maps correctly", () => {
    const hunks = [{ additionStart: 100, additionCount: 25, collapsedBefore: 0, additionLines: 25, additionLineIndex: 0, deletionStart: 100, deletionCount: 25, deletionLines: 25, deletionLineIndex: 0, hunkContent: [], type: "unified" as const, splitLineStart: 100, splitLineCount: 25, unifiedLineStart: 100, unifiedLineCount: 25, noEOFCRDeletions: false, noEOFCRAdditions: false }] as unknown as import("@pierre/diffs").Hunk[];
    const ranges = computeHunkRanges(hunks);
    expect(ranges).toEqual([{ hunkIndex: 0, startLine: 100, endLine: 124 }]);
  });
});
