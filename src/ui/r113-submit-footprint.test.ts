/**
 * R113 #78 — Submit modal shows estimated apply footprint.
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

describe("R113 #78 AC1 — Submit modal contains submit-footprint section", () => {
  it("app.ts renders .submit-footprint element in submit-confirm modal", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("submit-footprint")).toBe(true);
  });

  it("i18n has submit.footprint.heading + body for both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"submit.footprint.heading"')).toBe(true);
    expect(i18nSrc.includes("Expected apply footprint")).toBe(true);
    expect(i18nSrc.includes("预计影响范围")).toBe(true);
  });
});

describe("R113 #78 AC2 — Footprint renders estimates from current findings", () => {
  it("app.ts references state.fresh + state.existing near footprint rendering", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    const idxFootprint = src.indexOf('class="submit-footprint"');
    expect(idxFootprint).toBeGreaterThan(-1);
    const before = Math.max(0, idxFootprint - 2000);
    const after = idxFootprint + 2000;
    const window = src.slice(before, after);
    expect(window.includes("state.fresh")).toBe(true);
    expect(window.includes("state.existing")).toBe(true);
  });
});
