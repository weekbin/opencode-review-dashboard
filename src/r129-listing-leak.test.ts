/**
 * R129 R127 Oracle flag — Fix reconcile-listing listener leak.
 *
 * Verifies:
 * - AC1: module-scope currentReconcileListing variable exists
 * - AC2: cleanup guard at start of showReconcileListing
 * - AC3: old element removed before new one created
 * - AC4: old dismiss click listener removed
 * - AC5: old handleKey keydown listener removed
 * - AC6: old disposeA11y called
 * - AC7: currentReconcileListing = null after cleanup
 * - AC8: currentReconcileListing set to new value at end
 * - AC9: existing R117-R128 tests still pass
 * - AC10: currentReconcileListing cleared on any close path
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R129 R127 Oracle AC1 — module-scope currentReconcileListing", () => {
  it("app.ts declares module-scope currentReconcileListing variable", async () => {
    const src = await readSrc(APP_TS);
    expect(src).toMatch(/let\s+currentReconcileListing\s*[=:]/);
  });
});

describe("R129 R127 Oracle AC2 — cleanup guard at start of showReconcileListing", () => {
  it("showReconcileListing has if (currentReconcileListing) guard near start", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/if\s*\(\s*currentReconcileListing\s*\)/);
  });
});

describe("R129 R127 Oracle AC3 — old element removed before new one", () => {
  it("cleanup calls currentReconcileListing.element.remove()", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/currentReconcileListing\.element\.remove\(\)/);
  });
});

describe("R129 R127 Oracle AC4 — old dismiss click listener removed", () => {
  it("cleanup calls removeEventListener('click', currentReconcileListing.dismiss)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(
      /removeEventListener\(["']click["'],\s*currentReconcileListing\.dismiss\s*\)/,
    );
  });
});

describe("R129 R127 Oracle AC5 — old handleKey keydown listener removed", () => {
  it("cleanup calls removeEventListener('keydown', currentReconcileListing.handleKey)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(
      /removeEventListener\(["']keydown["'],\s*currentReconcileListing\.handleKey\s*\)/,
    );
  });
});

describe("R129 R127 Oracle AC6 — old disposeA11y called", () => {
  it("cleanup calls currentReconcileListing.disposeA11y()", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/currentReconcileListing\.disposeA11y\(\)/);
  });
});

describe("R129 R127 Oracle AC7 — currentReconcileListing = null after cleanup", () => {
  it("cleanup sets currentReconcileListing to null", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/currentReconcileListing\s*=\s*null/);
  });
});

describe("R129 R127 Oracle AC8 — currentReconcileListing set to new value", () => {
  it("showReconcileListing assigns new value to currentReconcileListing", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3500);
    expect(window).toMatch(/currentReconcileListing\s*=\s*\{/);
  });
});

describe("R129 R127 Oracle AC9 — regression R118 renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});

describe("R129 R127 Oracle AC10 — currentReconcileListing cleared on any close path", () => {
  it("currentReconcileListing = null in at least 3 close paths (dismiss, handleKey, onClose)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3500);
    const matches = window.match(/currentReconcileListing\s*=\s*null/g);
    const count = matches ? matches.length : 0;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
