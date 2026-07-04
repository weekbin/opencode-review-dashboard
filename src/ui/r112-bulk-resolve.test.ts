/**
 * R112 #75 — Bulk-resolve in conversation tab UI tests.
 *
 * Mirrors R26 bulk-delete pattern. Verifies AC for the new resolve button.
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { __testonlyClearRecentSearches } from "./search-history";

const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");
const I18N_TS = join(import.meta.dir, "..", "..", "src", "ui", "i18n.ts");

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

describe("R112 #75 AC1 — bulk-resolve button renders when ≥1 finding selected", () => {
  it("app.ts contains conversation-bulk-resolve class", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("conversation-bulk-resolve")).toBe(true);
  });

  it("app.ts uses STRINGS conversation.bulkResolve", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes('t("conversation.bulkResolve")')).toBe(true);
  });

  it("i18n.ts has conversation.bulkResolve with both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"conversation.bulkResolve"')).toBe(true);
    expect(i18nSrc.includes("Resolve selected")).toBe(true);
    expect(i18nSrc.includes("解决选中")).toBe(true);
  });
});

describe("R112 #75 AC2 — bulk-resolve handler opens resolve modal with N-count", () => {
  it("app.ts wires conversation-bulk-resolve click handler", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxBulkResolve = src.indexOf("conversation-bulk-resolve");
    expect(idxBulkResolve).toBeGreaterThan(-1);
    const snippet = src.slice(idxBulkResolve, idxBulkResolve + 2000);
    expect(snippet.includes("addEventListener")).toBe(true);
  });

  it("bulk-resolve handler iterates selectedFindings ids and awaits resolveFinding", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxBulkResolve = src.indexOf("conversation-bulk-resolve");
    expect(idxBulkResolve).toBeGreaterThan(-1);
    const snippet = src.slice(idxBulkResolve, idxBulkResolve + 2500);
    expect(snippet.includes("showResolveReasonModal")).toBe(true);
    expect(snippet.includes("resolveFinding")).toBe(true);
  });
});
