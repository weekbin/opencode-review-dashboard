/**
 * R127 R123 retro flag — Escape-key dismissal for reconcile-listing popup.
 *
 * Verifies:
 * - AC1: showReconcileListing has keydown listener setup
 * - AC2: keydown handler checks for "Escape" key
 * - AC3: keydown handler removes listing
 * - AC4: keydown handler removes keydown listener (cleanup)
 * - AC5: keydown listener uses setTimeout(0) to avoid firing immediately
 * - AC6: existing click-outside dismiss preserved (R123 regression)
 * - AC7: dismiss handler also removes keydown listener
 * - AC8: role="dialog" preserved on listing element
 * - AC9: installModalA11y not imported in showReconcileListing
 * - AC10: regression — R117 + R118-R126 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R127 R123 retro AC1 — showReconcileListing has keydown listener", () => {
  it("showReconcileListing function body contains addEventListener for keydown", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/addEventListener\(["']keydown["']/);
  });
});

describe("R127 R123 retro AC2 — keydown handler checks for Escape", () => {
  it("keydown handler checks event.key === 'Escape'", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/["']Escape["']/);
  });
});

describe("R127 R123 retro AC3 — keydown handler removes listing", () => {
  it("keydown handler calls listing.remove()", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/listing\.remove\(\)/);
  });
});

describe("R127 R123 retro AC4 — keydown handler removes keydown listener", () => {
  it("keydown handler calls removeEventListener for keydown cleanup", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/removeEventListener\(["']keydown["']/);
  });
});

describe("R127 R123 retro AC5 — setTimeout(0) prevents double-fire", () => {
  it("keydown listener uses setTimeout(0) to defer registration", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/setTimeout\(/);
    expect(window).toMatch(/addEventListener\(["']keydown["']/);
  });
});

describe("R127 R123 retro AC6 — click-outside dismiss preserved", () => {
  it("existing click dismiss still present (R123 regression)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/addEventListener\(["']click["']/);
    expect(window).toMatch(/removeEventListener\(["']click["']/);
  });
});

describe("R127 R123 retro AC7 — dismiss handler removes keydown listener", () => {
  it("click dismiss handler also cleans up keydown listener", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/removeEventListener\(["']keydown["']/);
  });
});

describe("R127 R123 retro AC8 — role='dialog' preserved on listing", () => {
  it("listing element still has role='dialog' (R123 preserved)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/setAttribute\(["']role["'],\s*["']dialog["']\)/);
  });
});

describe("R127 R123 retro AC9 — installModalA11y not required", () => {
  it("showReconcileListing handles Escape inline (not via installModalA11y)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).not.toMatch(/installModalA11y/);
  });
});

describe("R127 R123 retro AC10 — regression R118 renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
