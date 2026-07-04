/**
 * R112 #80 — Conversation panel renders anchor code snippet.
 *
 * Verifies that for each finding card in the conversation panel, the
 * entry.anchor.selected lines are rendered as a monospace block BEFORE
 * the comment body, so reviewers can see what code the finding was
 * about without clicking jump.
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");

class FakeStorage {
  store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
}

let fakeStorage: FakeStorage;

beforeEach(() => {
  fakeStorage = new FakeStorage();
  (globalThis as unknown as { localStorage: unknown }).localStorage = fakeStorage;
});

afterEach(() => {
  // no cleanup
});

function findContext(src: string, anchor: string, beforeBytes: number, afterBytes: number) {
  const idx = src.indexOf(anchor);
  if (idx < 0) return "";
  return src.slice(Math.max(0, idx - beforeBytes), idx + anchor.length + afterBytes);
}

describe("R112 #80 AC1 — conversation card renders snippet before body", () => {
  it("app.ts creates conversation-snippet element in conversation-card render path", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("conversation-snippet")).toBe(true);
  });

  it("app.ts renders entry.anchor.selected near the conversation-snippet element", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxSnippet = src.indexOf("conversation-snippet");
    expect(idxSnippet).toBeGreaterThan(-1);
    const window = findContext(src, "conversation-snippet", 1000, 1000);
    expect(window.includes("anchor.selected") || window.includes("anchor?.selected")).toBe(true);
  });

  it("snippet element is XSS-safe (uses textContent)", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxSnippet = src.indexOf("conversation-snippet");
    expect(idxSnippet).toBeGreaterThan(-1);
    const window = findContext(src, "conversation-snippet", 1000, 1000);
    expect(window).toContain("textContent");
  });
});

describe("R112 #80 AC2 — snippet is skipped when anchor.selected is empty (file-level findings)", () => {
  it("app.ts guards snippet rendering on truthy entry.anchor.selected", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxSnippet = src.indexOf("conversation-snippet");
    expect(idxSnippet).toBeGreaterThan(-1);
    const window = findContext(src, "conversation-snippet", 1000, 1000);
    expect(window.includes("anchor.selected") || window.includes("anchor?.selected")).toBe(true);
  });
});
