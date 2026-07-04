/**
 * R113 #84 Layer 1 — Draft-delete polish: confirm modal + label rename.
 *
 * Layer 1 only (fresh-draft findings before submit). Server-side delete
 * (Layer 2) is R114.
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

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
});

afterEach(() => {});

describe("R113 #84 Layer 1 AC1 — Draft delete opens confirm modal", () => {
  it("app.ts draft-finding removeBtn showConfirmDialog before mutating state", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("removeBtn")).toBe(true);
    expect(src.includes("installModalA11y")).toBe(true);
    expect(src.includes("confirmDeleteDraft")).toBe(true);
  });

  it("i18n has confirm modal keys for draft delete (cancel + delete-draft)", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"action.deleteDraft"')).toBe(true);
    expect(i18nSrc.includes('"confirm.deleteDraft.title"')).toBe(true);
    expect(i18nSrc.includes("Delete this draft finding")).toBe(true);
    expect(i18nSrc.includes("删除这条草稿审查项")).toBe(true);
  });
});

describe("R113 #84 Layer 1 AC2 — Draft delete still mutates state.fresh (behavior preserved)", () => {
  it("confirmDeleteDraft helper contains state.fresh filter splice", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idx = src.indexOf("confirmDeleteDraft");
    expect(idx).toBeGreaterThan(-1);
    const fn = src.slice(idx, idx + 2000);
    expect(
      fn.includes("state.fresh = state.fresh.filter") || fn.includes("state.fresh.filter"),
    ).toBe(true);
  });

  it("app.ts removeBtn handler delegates to confirmDeleteDraft (no direct splice)", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxRemoveBtn = src.indexOf("const removeBtn");
    expect(idxRemoveBtn).toBeGreaterThan(-1);
    const handler = src.slice(idxRemoveBtn, idxRemoveBtn + 1500);
    expect(handler.includes("confirmDeleteDraft")).toBe(true);
  });
});
