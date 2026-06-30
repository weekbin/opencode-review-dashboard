/**
 * R20 #42 — Search history unit tests.
 *
 * Single-round ACs (AC3.1–AC3.5 search history) verify pure-logic
 * helpers in isolation. The dropdown UI itself is verified by the
 * Playwright walkthrough in Phase 3c (per R20 plan § 5) — that path is
 * outside the scope of `bun test`.
 *
 * Covers:
 *   - AC3.1: getRecentSearches() returns up to 5 newest-first
 *   - AC3.3: addRecentSearch() dedupes by EXACT match + caps to 5
 *   - AC3.4: localStorage persistence under
 *     `diff-review:recent-searches` (JSON array)
 *
 * Run with:  bun test src/ui/search-history.test.ts
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  addRecentSearch,
  getRecentSearches,
  MAX_RECENT,
  RECENT_SEARCHES_KEY,
  __testonlyClearRecentSearches,
} from "./search-history";

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
  __testonlyClearRecentSearches();
});

afterEach(() => {
  __testonlyClearRecentSearches();
});

describe("AC3.1 — getRecentSearches returns newest-first, capped to MAX_RECENT", () => {
  it("returns empty array when nothing is stored", () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it("returns the persisted list when present", () => {
    fakeStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(["a", "b", "c"]));
    expect(getRecentSearches()).toEqual(["a", "b", "c"]);
  });

  it("ignores malformed JSON and returns empty array", () => {
    fakeStorage.setItem(RECENT_SEARCHES_KEY, "{not valid json");
    expect(getRecentSearches()).toEqual([]);
  });

  it("ignores non-array payloads", () => {
    fakeStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify({ not: "an array" }));
    expect(getRecentSearches()).toEqual([]);
  });

  it("filters out non-string entries defensively", () => {
    fakeStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(["valid", 42, null, "also-valid"]));
    expect(getRecentSearches()).toEqual(["valid", "also-valid"]);
  });
});

describe("AC3.3 — addRecentSearch dedupes + caps to MAX_RECENT", () => {
  it("adds a fresh query at position 0 (newest first)", () => {
    addRecentSearch("foo");
    expect(getRecentSearches()).toEqual(["foo"]);
  });

  it("returns the updated list", () => {
    const result = addRecentSearch("TODO");
    expect(result[0]).toBe("TODO");
  });

  it("dedupes by EXACT match — re-adding moves to front, not duplicate", () => {
    addRecentSearch("foo");
    addRecentSearch("bar");
    addRecentSearch("baz");
    expect(getRecentSearches()).toEqual(["baz", "bar", "foo"]);
    addRecentSearch("foo");
    expect(getRecentSearches()).toEqual(["foo", "baz", "bar"]);
  });

  it("caps the list to MAX_RECENT entries — older ones fall off", () => {
    for (let i = 1; i <= MAX_RECENT + 3; i++) {
      addRecentSearch(`q${i}`);
    }
    const result = getRecentSearches();
    expect(result.length).toBe(MAX_RECENT);
    expect(result[0]).toBe(`q${MAX_RECENT + 3}`);
    // The oldest two queries (q1, q2) should be gone.
    expect(result.includes("q1")).toBe(false);
    expect(result.includes("q2")).toBe(false);
    // The newest MAX_RECENT queries are present.
    for (let i = MAX_RECENT + 3 - MAX_RECENT + 1; i <= MAX_RECENT + 3; i++) {
      expect(result.includes(`q${i}`)).toBe(true);
    }
  });

  it("empty/whitespace queries are no-ops (no junk in history)", () => {
    addRecentSearch("foo");
    addRecentSearch("");
    addRecentSearch("   ");
    addRecentSearch("\t\n");
    addRecentSearch("bar");
    expect(getRecentSearches()).toEqual(["bar", "foo"]);
  });

  it("trims surrounding whitespace before storing", () => {
    addRecentSearch("  TODO  ");
    expect(getRecentSearches()).toEqual(["TODO"]);
    // After trimming, dedupe matches against the trimmed form.
    addRecentSearch("TODO");
    expect(getRecentSearches()).toEqual(["TODO"]);
  });
});

describe("AC3.4 — persists to localStorage as JSON array under diff-review:recent-searches", () => {
  it("writes a JSON array on every addRecentSearch call", () => {
    addRecentSearch("alpha");
    addRecentSearch("beta");
    const raw = fakeStorage.getItem(RECENT_SEARCHES_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(["beta", "alpha"]);
  });

  it("writes to the diff-review:recent-searches key (matches project convention)", () => {
    addRecentSearch("hello");
    expect(fakeStorage.store.has(RECENT_SEARCHES_KEY)).toBe(true);
    expect(RECENT_SEARCHES_KEY).toBe("diff-review:recent-searches");
  });

  it("__testonlyClearRecentSearches removes the key", () => {
    addRecentSearch("x");
    expect(fakeStorage.store.has(RECENT_SEARCHES_KEY)).toBe(true);
    __testonlyClearRecentSearches();
    expect(fakeStorage.store.has(RECENT_SEARCHES_KEY)).toBe(false);
  });
});

describe("AC3.3 — case-sensitive dedup matches user's verbatim query", () => {
  // Per the brief: we dedupe by exact match. A user who types "TODO"
  // and later types "todo" gets two entries — they look similar but
  // they are different queries. The dropdown surfaces both for the
  // user to pick whichever is correct.
  it("'TODO' and 'todo' are stored as distinct entries", () => {
    addRecentSearch("TODO");
    addRecentSearch("todo");
    expect(getRecentSearches()).toEqual(["todo", "TODO"]);
  });
});
