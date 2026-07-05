/**
 * R126 R123 retro flag — CSS for reconcile badges + listing popup.
 *
 * Verifies:
 * - AC1: .reconcile-overlay-banner rule in review.html
 * - AC2: .card-reconcile-strip rule in review.html
 * - AC3: .reconcile-badge base rule in review.html
 * - AC4: .reconcile-green rule in review.html
 * - AC5: .reconcile-amber rule in review.html
 * - AC6: .reconcile-red rule in review.html
 * - AC7: .reconcile-listing rule in review.html (popup base)
 * - AC8: .reconcile-listing-item rule in review.html
 * - AC9: .reconcile-hunk-badge rule in review.html (R125 element)
 * - AC10: regression — R117 + R118-R125 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const REVIEW_HTML = join(import.meta.dir, "ui", "review.html");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

function hasCssRule(src: string, selector: string): boolean {
  const re = new RegExp(`\\${selector}\\s*\\{`);
  return re.test(src);
}

describe("R126 R123 retro AC1 — .reconcile-overlay-banner rule", () => {
  it("review.html contains .reconcile-overlay-banner CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-overlay-banner")).toBe(true);
  });
});

describe("R126 R123 retro AC2 — .card-reconcile-strip rule", () => {
  it("review.html contains .card-reconcile-strip CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".card-reconcile-strip")).toBe(true);
  });
});

describe("R126 R123 retro AC3 — .reconcile-badge base rule", () => {
  it("review.html contains .reconcile-badge CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-badge")).toBe(true);
  });
});

describe("R126 R123 retro AC4 — .reconcile-green rule", () => {
  it("review.html contains .reconcile-green CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-green")).toBe(true);
  });
});

describe("R126 R123 retro AC5 — .reconcile-amber rule", () => {
  it("review.html contains .reconcile-amber CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-amber")).toBe(true);
  });
});

describe("R126 R123 retro AC6 — .reconcile-red rule", () => {
  it("review.html contains .reconcile-red CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-red")).toBe(true);
  });
});

describe("R126 R123 retro AC7 — .reconcile-listing popup base rule", () => {
  it("review.html contains .reconcile-listing CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-listing")).toBe(true);
  });
});

describe("R126 R123 retro AC8 — .reconcile-listing-item rule", () => {
  it("review.html contains .reconcile-listing-item CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-listing-item")).toBe(true);
  });
});

describe("R126 R123 retro AC9 — .reconcile-hunk-badge rule (R125 element)", () => {
  it("review.html contains .reconcile-hunk-badge CSS rule", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(hasCssRule(src, ".reconcile-hunk-badge")).toBe(true);
  });
});

describe("R126 R123 retro AC10 — regression renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(join(import.meta.dir, "ui", "app.ts"));
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
