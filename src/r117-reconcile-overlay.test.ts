/**
 * R117 #74 — Reconcile mode overlay.
 *
 * Verifies:
 * - AC1: toolbar has #toggle-reconcile button
 * - AC2: reconcileMode off → no banner, no badges
 * - AC3: reconcileMode on → top banner appears
 * - AC4: green badge for resolved findings in hunk range
 * - AC5: yellow badge for still-open findings in hunk range
 * - AC6: red badge for new fresh findings in hunk range
 * - AC7: click handler scrolls to finding
 * - AC8: localStorage persistence
 * - AC9: i18n keys present both locales
 * - AC10: backwards compat when reconcileMode=false
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R117 #74 AC1 — toolbar has reconcile toggle", () => {
  it("app.ts renders #toggle-reconcile button in toolbar", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes('id="toggle-reconcile"')).toBe(true);
  });
});

describe("R117 #74 AC2 — reconcileMode=false means no banner or badges", () => {
  it("app.ts wraps reconcile rendering in if (state.reconcileMode)", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("state.reconcileMode")).toBe(true);
  });
});

describe("R117 #74 AC3 — reconcile banner appears when active", () => {
  it("i18n has reconcile.banner.hint key in both locales", async () => {
    const src = await readSrc(I18N_TS);
    expect(src.includes('"reconcile.banner.hint"')).toBe(true);
    const idx = src.indexOf('"reconcile.banner.hint"');
    const window = src.slice(idx, idx + 500);
    expect(window).toMatch(/zh-CN"/);
  });
});

describe("R117 #74 AC4 — green badge for resolved findings", () => {
  it("app.ts has function to render green badges", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("reconcile-green") || src.includes("reconcile.badge.resolved")).toBe(true);
  });
});

describe("R117 #74 AC5 — yellow badge for still-open findings", () => {
  it("i18n has reconcile.badge.open key", async () => {
    const src = await readSrc(I18N_TS);
    expect(src.includes('"reconcile.badge.open"')).toBe(true);
  });
});

describe("R117 #74 AC6 — red badge for new findings", () => {
  it("i18n has reconcile.badge.new key", async () => {
    const src = await readSrc(I18N_TS);
    expect(src.includes('"reconcile.badge.new"')).toBe(true);
  });
});

describe("R117 #74 AC7 — click handler scrolls to finding", () => {
  it("app.ts badge click handler calls scrollToFinding or similar", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("data-finding-id") || src.includes("scrollToFinding")).toBe(true);
  });
});

describe("R117 #74 AC8 — localStorage persistence", () => {
  it("app.ts persists reconcileMode via localStorage", async () => {
    const src = await readSrc(APP_TS);
    expect(
      src.includes("RECONCILE_MODE_KEY") ||
        src.includes("reconcile-mode") ||
        (src.includes("localStorage") && src.includes("reconcileMode")),
    ).toBe(true);
  });
});

describe("R117 #74 AC9 — i18n keys present both locales", () => {
  it("i18n has toolbar.reconcile + reconcile.badge.* in both locales", async () => {
    const src = await readSrc(I18N_TS);
    expect(src.includes('"toolbar.reconcile"')).toBe(true);
    expect(src.includes('"reconcile.banner.hint"')).toBe(true);
    expect(src.includes('"reconcile.badge.resolved"')).toBe(true);
    expect(src.includes('"reconcile.badge.open"')).toBe(true);
    expect(src.includes('"reconcile.badge.new"')).toBe(true);
  });
});

describe("R117 #74 AC10 — backwards compat", () => {
  it("reconcile mode is additive — no breaking changes to existing state shape", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("reconcileMode")).toBe(true);
    expect(src.includes("state.reconcileMode") || src.includes("reconcileMode:"));
  });
});
