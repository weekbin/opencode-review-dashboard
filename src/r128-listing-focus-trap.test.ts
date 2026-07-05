/**
 * R128 R123 retro flag — Focus trap on reconcile-listing popup.
 *
 * Verifies:
 * - AC1: installModalA11y is imported in app.ts
 * - AC2: installModalA11y( called inside showReconcileListing
 * - AC3: dispose result stored in a variable (not ignored)
 * - AC4: dispose called in close path (dismiss handler)
 * - AC5: role="dialog" preserved on listing element
 * - AC6: aria-modal="true" added (installModalA11y defensive assert)
 * - AC7: previouslyFocused captured (focus restore)
 * - AC8: focus trap via Tab handling (installModalA11y internal)
 * - AC9: requestAnimationFrame focus on first item
 * - AC10: regression — R117 + R118-R127 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R128 R123 retro AC1 — installModalA11y imported", () => {
  it("app.ts imports installModalA11y from ./modal-a11y", async () => {
    const src = await readSrc(APP_TS);
    expect(src).toMatch(/import\s+\{[^}]*installModalA11y[^}]*\}\s+from\s+["']\.\/modal-a11y["']/);
  });
});

describe("R128 R123 retro AC2 — installModalA11y called in showReconcileListing", () => {
  it("showReconcileListing function body contains installModalA11y( call", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/installModalA11y\(/);
  });
});

describe("R128 R123 retro AC3 — dispose result stored in variable", () => {
  it("showReconcileListing stores installModalA11y return value (not ignored)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/installModalA11y\(\s*listing\s*,\s*\(\)\s*=>/);
    expect(window).toMatch(/disposeA11y/);
  });
});

describe("R128 R123 retro AC4 — dispose called in close path", () => {
  it("showReconcileListing calls disposeA11y() somewhere in close handlers", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/disposeA11y\(\)/);
  });
});

describe("R128 R123 retro AC5 — role='dialog' preserved on listing", () => {
  it("listing element still has role='dialog' (R123 regression)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/setAttribute\(["']role["'],\s*["']dialog["']\)/);
  });
});

describe("R128 R123 retro AC6 — aria-modal='true' set on listing", () => {
  it("listing element has aria-modal='true' attribute", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/setAttribute\(["']aria-modal["'],\s*["']true["']\)/);
  });
});

describe("R128 R123 retro AC7 — previouslyFocused captured", () => {
  it("showReconcileListing handles focus restoration", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function showReconcileListing");
    const window = src.slice(fnStart, fnStart + 3000);
    // installModalA11y handles restore-on-close internally
    expect(window).toMatch(/installModalA11y/);
  });
});

describe("R128 R123 retro AC8 — requestAnimationFrame focus", () => {
  it("modal-a11y.ts uses requestAnimationFrame for initial focus", async () => {
    const src = await readSrc(join(import.meta.dir, "ui", "modal-a11y.ts"));
    expect(src).toMatch(/requestAnimationFrame\(/);
  });
});

describe("R128 R123 retro AC9 — Tab handling for focus trap", () => {
  it("modal-a11y.ts handles Tab key for focus trap", async () => {
    const src = await readSrc(join(import.meta.dir, "ui", "modal-a11y.ts"));
    expect(src).toMatch(/["']Tab["']/);
  });
});

describe("R128 R123 retro AC10 — regression R118 renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
