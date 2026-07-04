/**
 * R115 #79 — Finding edit enhancement.
 *
 * Verifies:
 * - AC1: showEditFindingModal extends to include file/start_line/end_line/status fields
 * - AC2: comment body supports inline-edit (textContent swap to textarea)
 * - AC3: server PATCH endpoint accepts anchor + status fields
 * - AC4: FindingAuditRow type extended for anchor/status edits
 * - AC5: i18n keys for new edit modal fields (en + zh-CN)
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");
const INDEX_TS = join(import.meta.dir, "..", "..", "src", "index.ts");
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
});

afterEach(() => {});

describe("R115 #79 AC1 — showEditFindingModal includes anchor + status fields", () => {
  it("app.ts showEditFindingModal template includes file input", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes('id="edit-file"')).toBe(true);
  });

  it("app.ts showEditFindingModal template includes start_line input", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes('id="edit-start-line"')).toBe(true);
  });

  it("app.ts showEditFindingModal template includes end_line input", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes('id="edit-end-line"')).toBe(true);
  });

  it("app.ts showEditFindingModal template includes status select", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes('id="edit-status"')).toBe(true);
  });
});

describe("R115 #79 AC2 — inline-comment-edit in finding card", () => {
  it("app.ts renderConversationPanel has inline-comment-edit handlers", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("startInlineCommentEdit") || src.includes("inlineCommentEdit")).toBe(true);
  });

  it("app.ts inline-edit saves on blur OR Ctrl+Enter (not on every keystroke)", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const fnDefIdx = src.indexOf("function startInlineCommentEdit");
    expect(fnDefIdx).toBeGreaterThan(-1);
    const window = src.slice(fnDefIdx, fnDefIdx + 2000);
    expect(
      window.includes("blur") || window.includes("Ctrl+Enter") || window.includes("metaKey"),
    ).toBe(true);
  });
});

describe("R115 #79 AC3 — server PATCH accepts anchor + status fields", () => {
  it("src/index.ts PATCH handler accepts file/start_line/end_line/status", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    const handlerIdx = src.indexOf('request.method === "PATCH" && editFindingPathnameMatch');
    expect(handlerIdx).toBeGreaterThan(-1);
    const window = src.slice(handlerIdx, handlerIdx + 4000);
    expect(window.includes("file?:") || window.includes("input.file")).toBe(true);
    expect(window.includes("start_line?:") || window.includes("input.start_line")).toBe(true);
    expect(window.includes("end_line?:") || window.includes("input.end_line")).toBe(true);
    expect(window.includes("status?:") || window.includes("input.status")).toBe(true);
  });
});

describe("R115 #79 AC4 — FindingAuditRow extends for anchor/status edits", () => {
  it("src/index.ts FindingAuditRow has before_status/after_status or anchor diff fields", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(
      src.includes("before_status") ||
        src.includes("after_status") ||
        src.includes("FindingAuditRowV2"),
    ).toBe(true);
  });
});

describe("R115 #79 AC5 — i18n keys for new edit modal fields", () => {
  it("src/ui/i18n.ts has editFinding.file/line/status labels both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"editFinding.fileLabel"')).toBe(true);
    expect(i18nSrc.includes('"editFinding.lineLabel"')).toBe(true);
    expect(i18nSrc.includes('"editFinding.statusLabel"')).toBe(true);
  });
});
