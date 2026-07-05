/**
 * R130 R126 retro flag — Dark mode CSS variants for reconcile UI.
 *
 * Verifies:
 * - AC1: @media (prefers-color-scheme: dark) block in review.html
 * - AC2: .reconcile-overlay-banner dark variant
 * - AC3: .card-reconcile-strip dark variant
 * - AC4: .reconcile-green dark variant
 * - AC5: .reconcile-amber dark variant
 * - AC6: .reconcile-red dark variant
 * - AC7: .reconcile-hunk-badge dark variant
 * - AC8: .reconcile-listing dark variant
 * - AC9: .reconcile-listing-item:hover dark variant
 * - AC10: regression — R117 + R118-R129 tests still pass
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

describe("R130 R126 retro AC1 — @media (prefers-color-scheme: dark) block", () => {
  it("review.html contains @media (prefers-color-scheme: dark) block", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(src).toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{/);
  });
});

describe("R130 R126 retro AC2 — .reconcile-overlay-banner dark variant", () => {
  it("review.html contains .reconcile-overlay-banner rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    expect(mediaStart).toBeGreaterThan(-1);
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-overlay-banner")).toBe(true);
  });
});

describe("R130 R126 retro AC3 — .card-reconcile-strip dark variant", () => {
  it("review.html contains .card-reconcile-strip rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".card-reconcile-strip")).toBe(true);
  });
});

describe("R130 R126 retro AC4 — .reconcile-green dark variant", () => {
  it("review.html contains .reconcile-green rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-green")).toBe(true);
  });
});

describe("R130 R126 retro AC5 — .reconcile-amber dark variant", () => {
  it("review.html contains .reconcile-amber rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-amber")).toBe(true);
  });
});

describe("R130 R126 retro AC6 — .reconcile-red dark variant", () => {
  it("review.html contains .reconcile-red rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-red")).toBe(true);
  });
});

describe("R130 R126 retro AC7 — .reconcile-hunk-badge dark variant", () => {
  it("review.html contains .reconcile-hunk-badge rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-hunk-badge")).toBe(true);
  });
});

describe("R130 R126 retro AC8 — .reconcile-listing dark variant", () => {
  it("review.html contains .reconcile-listing rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-listing")).toBe(true);
  });
});

describe("R130 R126 retro AC9 — .reconcile-listing-item:hover dark variant", () => {
  it("review.html contains .reconcile-listing-item:hover rule inside @media (prefers-color-scheme: dark)", async () => {
    const src = await readSrc(REVIEW_HTML);
    const mediaStart = src.indexOf("@media (prefers-color-scheme: dark)");
    const mediaWindow = src.slice(mediaStart, mediaStart + 3000);
    expect(hasCssRule(mediaWindow, ".reconcile-listing-item:hover")).toBe(true);
  });
});

describe("R130 R126 retro AC10 — regression R118 renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(join(import.meta.dir, "ui", "app.ts"));
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
