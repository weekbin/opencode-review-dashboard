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
  cancelPendingCommit,
  clearRecentSearches,
  commitRecentSearch,
  commitRecentSearchImmediate,
  COMMIT_DEBOUNCE_MS,
  getRecentSearches,
  MAX_RECENT,
  RECENT_SEARCHES_KEY,
  removeRecentSearches,
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

describe("R21 #43 AC3.1 — type 'func' → wait 350ms → recent-searches contains 'func'", () => {
  it("commits after 350ms quiet window", async () => {
    commitRecentSearch("func");
    expect(getRecentSearches()).not.toContain("func");
    await new Promise((r) => setTimeout(r, COMMIT_DEBOUNCE_MS + 50));
    expect(getRecentSearches()).toContain("func");
  });
});

describe("R21 #43 AC3.2 — type 'func' + 't' within 300ms → recent-searches does NOT contain 'func'", () => {
  it("debounce resets on each keystroke — only final query commits", async () => {
    commitRecentSearch("func");
    commitRecentSearch("funct");
    await new Promise((r) => setTimeout(r, COMMIT_DEBOUNCE_MS + 50));
    expect(getRecentSearches()).not.toContain("func");
    expect(getRecentSearches()).toContain("funct");
  });
});

describe("R21 #43 AC3.3 — type 'func' + Enter → recent-searches contains 'func' immediately", () => {
  it("commitRecentSearchImmediate commits without waiting", () => {
    commitRecentSearchImmediate("func");
    expect(getRecentSearches()).toContain("func");
  });

  it("commitRecentSearchImmediate cancels pending debounce", async () => {
    commitRecentSearch("func");
    commitRecentSearchImmediate("funct");
    await new Promise((r) => setTimeout(r, COMMIT_DEBOUNCE_MS + 50));
    expect(getRecentSearches()).not.toContain("func");
    expect(getRecentSearches()).toContain("funct");
  });
});

describe("R21 #43 AC3.4 — empty query → no-op", () => {
  it("commitRecentSearch skips empty/whitespace", async () => {
    commitRecentSearch("");
    commitRecentSearch("   ");
    await new Promise((r) => setTimeout(r, COMMIT_DEBOUNCE_MS + 50));
    expect(getRecentSearches()).toEqual([]);
  });

  it("commitRecentSearchImmediate skips empty", () => {
    commitRecentSearchImmediate("");
    expect(getRecentSearches()).toEqual([]);
  });
});

describe("R21 #43 AC3.5 — localStorage key unchanged", () => {
  it("still writes to diff-review:recent-searches", () => {
    commitRecentSearchImmediate("testkey");
    expect(fakeStorage.store.has(RECENT_SEARCHES_KEY)).toBe(true);
    expect(RECENT_SEARCHES_KEY).toBe("diff-review:recent-searches");
  });
});

describe("R21 #43 AC3.6 — max 5 cap preserved", () => {
  it("immediate commits still cap to MAX_RECENT", () => {
    for (let i = 1; i <= MAX_RECENT + 3; i++) {
      commitRecentSearchImmediate(`iq${i}`);
    }
    const result = getRecentSearches();
    expect(result.length).toBe(MAX_RECENT);
  });

  it("addRecentSearch still caps to MAX_RECENT (existing behavior)", () => {
    for (let i = 1; i <= MAX_RECENT + 3; i++) {
      addRecentSearch(`aq${i}`);
    }
    const result = getRecentSearches();
    expect(result.length).toBe(MAX_RECENT);
  });
});

describe("R21 #43 cancelPendingCommit", () => {
  it("cancels a pending debounced commit", async () => {
    commitRecentSearch("pending");
    cancelPendingCommit();
    await new Promise((r) => setTimeout(r, COMMIT_DEBOUNCE_MS + 50));
    expect(getRecentSearches()).not.toContain("pending");
  });
});

describe("R22 #45 AC5.2 — clearRecentSearches sets localStorage to []", () => {
  it("writes an empty JSON array to localStorage", () => {
    addRecentSearch("to-be-cleared");
    expect(getRecentSearches()).not.toEqual([]);
    clearRecentSearches();
    const raw = fakeStorage.getItem(RECENT_SEARCHES_KEY);
    expect(raw).toBe("[]");
    expect(getRecentSearches()).toEqual([]);
  });

  it("cancels any pending debounced commit so clear is not undone", async () => {
    commitRecentSearch("pending-query");
    clearRecentSearches();
    await new Promise((r) => setTimeout(r, COMMIT_DEBOUNCE_MS + 50));
    expect(getRecentSearches()).toEqual([]);
  });
});

describe("R22 #45 AC5.6 — max 5 cap + debounce preserved (no regression)", () => {
  it("clearRecentSearches does not affect MAX_RECENT constant", () => {
    expect(MAX_RECENT).toBe(5);
  });

  it("addRecentSearch still caps to MAX_RECENT after clear", () => {
    clearRecentSearches();
    for (let i = 1; i <= MAX_RECENT + 3; i++) {
      addRecentSearch(`q${i}`);
    }
    expect(getRecentSearches().length).toBe(MAX_RECENT);
  });
});

describe("R23 #48 AC8.4 — removeRecentSearches removes selected entries from localStorage", () => {
  it("removes the specified queries and returns the new list", () => {
    addRecentSearch("alpha");
    addRecentSearch("beta");
    addRecentSearch("gamma");
    addRecentSearch("delta");
    const result = removeRecentSearches(["beta", "gamma"]);
    expect(result).toEqual(["delta", "alpha"]);
    expect(getRecentSearches()).toEqual(["delta", "alpha"]);
  });

  it("returns new list and updates localStorage atomically", () => {
    addRecentSearch("one");
    addRecentSearch("two");
    addRecentSearch("three");
    const result = removeRecentSearches(["two"]);
    expect(result).toEqual(["three", "one"]);
    expect(getRecentSearches()).toEqual(["three", "one"]);
  });

  it("deduping at add-time preserved after bulk remove", () => {
    addRecentSearch("foo");
    addRecentSearch("bar");
    addRecentSearch("foo");
    expect(getRecentSearches()).toEqual(["foo", "bar"]);
    removeRecentSearches(["foo"]);
    expect(getRecentSearches()).toEqual(["bar"]);
  });
});

describe("R23 #48 AC8.6 — removeRecentSearches does not change localStorage key", () => {
  it("still writes to diff-review:recent-searches key", () => {
    addRecentSearch("x");
    addRecentSearch("y");
    removeRecentSearches(["x"]);
    expect(fakeStorage.store.has(RECENT_SEARCHES_KEY)).toBe(true);
    expect(RECENT_SEARCHES_KEY).toBe("diff-review:recent-searches");
  });

  it("removeRecentSearches is a no-op for empty queries array", () => {
    addRecentSearch("a");
    addRecentSearch("b");
    const result = removeRecentSearches([]);
    expect(result).toEqual(["b", "a"]);
    expect(getRecentSearches()).toEqual(["b", "a"]);
  });
});
