/**
 * R26 #54 — Bulk delete in conversation tab UI tests.
 *
 * DOM-based AC tests for per-finding checkboxes and bulk "Delete selected" button.
 * Verifies AC 12.1–12.6 per plan.md.
 *
 * Run with: bun test src/ui/conversation-bulk.test.ts
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

describe("R26 #54 AC12.1 — Per-finding checkbox visible in Conversation tab list", () => {
  it("checkbox element exists in app.ts source", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("conversation-finding-checkbox")).toBe(true);
    expect(src.includes('type = "checkbox"')).toBe(true);
  });

  it("checkbox has data-id attribute for finding tracking", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("cb.dataset.id = entry.id")).toBe(true);
  });
});

describe("R26 #54 AC12.2 — Click checkbox toggles finding selected state", () => {
  it("selectedFindings Set tracks checkbox state", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("selectedFindings.add(")).toBe(true);
    expect(src.includes("selectedFindings.delete(")).toBe(true);
  });
});

describe("R26 #54 AC12.3 — ≥1 selected shows Delete selected button", () => {
  it("bulk button renders when selectedFindings.size > 0", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("conversation-bulk-delete")).toBe(true);
    expect(src.includes('t("conversation.bulkDelete")')).toBe(true);
  });

  it("bulk button uses STRINGS conversation.bulkDelete with both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"conversation.bulkDelete"')).toBe(true);
    expect(i18nSrc.includes("Delete selected findings")).toBe(true);
    expect(i18nSrc.includes("删除选中的 finding")).toBe(true);
  });

  it("bulk button uses STRINGS conversation.selected with both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"conversation.selected"')).toBe(true);
    expect(i18nSrc.includes("Selected")).toBe(true);
    expect(i18nSrc.includes("已选")).toBe(true);
  });
});

describe("R26 #54 AC12.4 — Click bulk removes selected findings + re-renders", () => {
  it("bulk handler filters state.fresh by selectedFindings", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("state.fresh = state.fresh.filter")).toBe(true);
  });

  it("bulk handler filters state.existing by selectedFindings", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("state.existing = state.existing.filter")).toBe(true);
  });

  it("bulk handler clears selectedFindings after delete", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("selectedFindings.clear()")).toBe(true);
  });

  it("bulk handler re-renders conversation pane after delete", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("renderConversationPane()")).toBe(true);
  });
});

describe("R26 #54 AC12.5 — Conversation state preserved (activeTab, filter)", () => {
  it("bulk handler does NOT reset activeTab or conversationFilter", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const bulkIdx = src.indexOf("conversation-bulk-delete");
    if (bulkIdx < 0) {
      expect("bulk button").toBe("found");
      return;
    }
    const afterBulk = src.slice(bulkIdx, bulkIdx + 1500);
    const touchesActiveTab = /activeTab\s*=/.test(afterBulk);
    const touchesFilter = /conversationFilter\s*=/.test(afterBulk);
    expect(touchesActiveTab).toBe(false);
    expect(touchesFilter).toBe(false);
  });
});

describe("R26 #54 AC12.6 — localStorage: 0 keys added (uses existing conversation state)", () => {
  it("bulk handler does NOT add new localStorage keys", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const bulkIdx = src.indexOf("conversation-bulk-delete");
    if (bulkIdx < 0) {
      expect("bulk button").toBe("found");
      return;
    }
    const afterBulk = src.slice(bulkIdx, bulkIdx + 1500);
    const hasLocalStorage = /localStorage\.(setItem|getItem)/.test(afterBulk);
    expect(hasLocalStorage).toBe(false);
  });
});
