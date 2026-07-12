// R113 #77 — Content-hash auto-resolve.
// Behavior-contract upgrade (R152): sanitize() writes context_hash to each finding using fnv1a.
// R152 also retired `contextHash` function (was unused).

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
  it("src/index.ts defines fnv1a function for anchor context hashing (R152: contextHash retired)", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src).toContain("function fnv1a");
  });
});

describe("R113 #77 AC3 — contentMatches uses fnv1a for hash comparison (R152 behavior-contract)", () => {
  it("src/index.ts contentMatches() body uses fnv1a() to compare anchor selected/before/after", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    const contentMatchesMatch = src.match(/function\s+contentMatches\([\s\S]*?\n\}/);
    expect(contentMatchesMatch).not.toBeNull();
    const body = contentMatchesMatch![0];
    // The auto-resolve logic compares each anchor field via fnv1a hash.
    expect(body).toContain("fnv1a(prev.selected)");
    expect(body).toContain("fnv1a(prev.before)");
    expect(body).toContain("fnv1a(prev.after)");
    expect(body).toContain("fnv1a(next.selected)");
    expect(body).toContain("fnv1a(next.before)");
    expect(body).toContain("fnv1a(next.after)");
  });
});
