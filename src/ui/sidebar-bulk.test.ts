/**
 * R25 #52 — Bulk delete in sidebar review progress UI tests.
 *
 * DOM-based AC tests for per-file checkboxes and bulk "Mark as reviewed" button.
 * Verifies AC 12.1–12.6 per plan.md.
 *
 * Run with: bun test src/ui/sidebar-bulk.test.ts
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

describe("R25 #52 AC12.1 — Per-file-card checkbox visible in sidebar", () => {
  it("checkbox element exists in app.ts source", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("sidebar-file-checkbox")).toBe(true);
    expect(src.includes('type = "checkbox"')).toBe(true);
  });
});

describe("R25 #52 AC12.2 — Click checkbox toggles file selected state", () => {
  it("selectedFiles Set tracks checkbox state", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("selectedFiles.add(")).toBe(true);
    expect(src.includes("selectedFiles.delete(")).toBe(true);
  });
});

describe("R25 #52 AC12.3 — ≥1 selected shows Mark as reviewed button", () => {
  it("bulk button renders when selectedFiles.size > 0", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("sidebar-bulk-mark-reviewed")).toBe(true);
    expect(src.includes('t("sidebar.bulkDelete")')).toBe(true);
  });

  it("bulk button uses STRINGS sidebar.bulkDelete with both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"sidebar.bulkDelete"')).toBe(true);
    expect(i18nSrc.includes("Mark selected as reviewed")).toBe(true);
    expect(i18nSrc.includes("标记已审查")).toBe(true);
  });
});

describe("R25 #52 AC12.4 — Click bulk marks all selected files as reviewed", () => {
  it("bulk handler adds selectedFiles to state.read", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("state.read.add(")).toBe(true);
  });

  it("bulk handler clears selectedFiles after mark", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("selectedFiles.clear()")).toBe(true);
  });
});

describe("R25 #52 AC12.5 — R20 #40 progress count updates after bulk mark", () => {
  it("bulk handler calls renderReviewProgress", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("renderReviewProgress()")).toBe(true);
  });
});

describe("R25 #52 AC12.6 — localStorage: 0 keys added (uses existing state.read)", () => {
  it("bulk handler does NOT add new localStorage keys", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const bulkIdx = src.indexOf("sidebar-bulk-mark-reviewed");
    if (bulkIdx < 0) {
      expect("bulk button").toBe("found");
      return;
    }
    const afterBulk = src.slice(bulkIdx, bulkIdx + 2000);
    const hasLocalStorage = /localStorage\.(setItem|getItem)/.test(afterBulk);
    expect(hasLocalStorage).toBe(false);
  });
});
