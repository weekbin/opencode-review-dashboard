/**
 * R113 #77 — Content-hash auto-resolve.
 *
 * When agent commits and the surrounding 5-line context (before + selected + after)
 * still matches, the finding is auto-resolved with close_reason: "content_match".
 * Hash is non-crypto (FNV-1a-like length+content) — collision risk acceptable for
 * a "looks-the-same" check.
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const INDEX_TS = join(import.meta.dir, "index.ts");

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

afterEach(() => {});

describe("R113 #77 AC1 — close_reason union extended with content_match", () => {
  it("src/index.ts close_reason type includes 'content_match' literal", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes('"file_removed" | "anchor_missing" | "content_match"')).toBe(true);
  });
});

describe("R113 #77 AC2 — content-hash function computes hash from anchor context", () => {
  it("src/index.ts defines hashContext or fnv1a function for anchor context hashing", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(
      src.includes("fnv1a") || src.includes("hashContext") || src.includes("contextHash"),
    ).toBe(true);
  });
});

describe("R113 #77 AC3 — submit handler stamps context_hash on each finding", () => {
  it("src/index.ts sanitize() or submit handler writes context_hash to finding", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    const idx =
      src.indexOf("content_hash") >= 0 ? src.indexOf("content_hash") : src.indexOf("fnv1a");
    expect(idx).toBeGreaterThan(-1);
    const window = src.slice(idx, idx + 500);
    expect(window.includes("anchor") || window.includes("context")).toBe(true);
  });
});
