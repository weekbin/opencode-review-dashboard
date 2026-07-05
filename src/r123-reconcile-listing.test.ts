/**
 * R123 R117.2 — Click-to-expand reconcile badge listing.
 *
 * Verifies:
 * - AC1: showReconcileListing function exists in app.ts
 * - AC2: reconcile badge click handler checks for finding count ≥2 before jumping
 * - AC3: showReconcileListing creates a <div class="reconcile-listing"> element
 * - AC4: listing contains one <button> per finding in array
 * - AC5: each listing button has data-finding-id attribute
 * - AC6: listing button click handler delegates to jumpToFindingById
 * - AC7: i18n has reconcile.listing.heading in en
 * - AC8: i18n has reconcile.listing.heading in zh-CN
 * - AC9: existing R117 reconcile badge wiring preserved
 * - AC10: regression — R117 + R118 + R119 + R120 + R121 + R122 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R123 R117.2 AC1 — showReconcileListing function exists", () => {
  it("app.ts defines showReconcileListing function", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function showReconcileListing")).toBe(true);
  });
});

describe("R123 R117.2 AC2 — click handler checks for ≥2 findings", () => {
  it("badge click handler distinguishes 1-finding vs ≥2-findings paths", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("findingsRoot.addEventListener");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 15000);
    expect(window).toMatch(/reconcile-badge\[data-finding-id\]/);
    expect(window).toMatch(/showReconcileListing/);
    expect(window).toMatch(/length\s*>=\s*2|\.length\s*===\s*1/);
  });
});

describe("R123 R117.2 AC3 — listing creates div with reconcile-listing class", () => {
  it("showReconcileListing creates div.reconcile-listing element", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/["']reconcile-listing["']/);
  });
});

describe("R123 R117.2 AC4 — listing contains one button per finding", () => {
  it("showReconcileListing iterates findings array to create buttons", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/for\s*\(\s*const\s+f\s+of\s+findings/);
    expect(window).toMatch(/createElement\(["']button["']\)/);
  });
});

describe("R123 R117.2 AC5 — listing buttons have data-finding-id attribute", () => {
  it("showReconcileListing sets data-finding-id on each button", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/data-finding-id|setAttribute\(["']data-finding-id/);
  });
});

describe("R123 R117.2 AC6 — button click delegates to jumpToFindingById", () => {
  it("showReconcileListing wires button click to jumpToFindingById", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/addEventListener\(["']click["']/);
    expect(window).toMatch(/jumpToFindingById/);
  });
});

describe("R123 R117.2 AC7 — i18n reconcile.listing.heading in en", () => {
  it("i18n has reconcile.listing.heading key with en value", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"reconcile\.listing\.heading":\s*\{\s*en:/);
  });
});

describe("R123 R117.2 AC8 — i18n reconcile.listing.heading in zh-CN", () => {
  it("i18n has reconcile.listing.heading key with zh-CN value", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"reconcile\.listing\.heading":[\s\S]*?"zh-CN":/);
  });
});

describe("R123 R117.2 AC9 — R117 reconcile badge wiring preserved", () => {
  it("renderReconcileOverlay still creates reconcile-badge elements with data-finding-id", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderReconcileOverlay");
    const window = src.slice(fnStart, fnStart + 1500);
    expect(window).toMatch(/reconcile-badge\s+reconcile-(green|amber|red)/);
    expect(window).toMatch(/dataset\.findingId/);
  });
});

describe("R123 R117.2 AC10 — no regression to renderSparkline", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
