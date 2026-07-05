/**
 * R124 R119.2 — Histogram bar baseline = absolute count normalization.
 *
 * Verifies:
 * - AC1: histogram uses totalCount (sum across all buckets) for normalization
 * - AC2: histogram no longer uses Math.max(...bucketDefs.map(b => buckets[b.key])) directly
 * - AC3: barHeight formula uses count / maxCount * 28 (preserved)
 * - AC4: bar opacity for count=0 preserved at 0.15
 * - AC5: 4 buckets still rendered (R119 regression)
 * - AC6: view.stats.firstPass.histogram heading still bound (R119 regression)
 * - AC7: bucket label keys still used (R119 regression)
 * - AC8: regression — R119 + R120 + R121 + R122 + R123 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R124 R119.2 AC1 — totalCount variable used for normalization", () => {
  it("histogram block computes totalCount via reduce across bucketDefs", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const bucketDefs");
    expect(anchor).toBeGreaterThan(-1);
    const window = src.slice(anchor, anchor + 1500);
    expect(window).toMatch(/totalCount/);
    expect(window).toMatch(/\.reduce\(\s*\(\s*sum\s*,\s*b\s*\)/);
  });
});

describe("R124 R119.2 AC2 — maxCount no longer uses Math.max on bucketDefs directly", () => {
  it("maxCount uses Math.max(totalCount, 1) not Math.max(...bucketDefs.map)", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const bucketDefs");
    const window = src.slice(anchor, anchor + 1500);
    expect(window).toMatch(/maxCount\s*=\s*Math\.max\(\s*totalCount\s*,\s*1\s*\)/);
    expect(window).not.toMatch(/Math\.max\(\s*\.\.\.\s*bucketDefs\.map\(/);
  });
});

describe("R124 R119.2 AC3 — barHeight formula preserved", () => {
  it("barHeight formula still uses count / maxCount * 28", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const histogramRow");
    const window = src.slice(anchor, anchor + 2500);
    expect(window).toMatch(/barHeight\s*=\s*\(\s*count\s*\/\s*maxCount\s*\)\s*\*\s*28/);
  });
});

describe("R124 R119.2 AC4 — opacity 0.15 for empty bars preserved", () => {
  it("bar opacity for count === 0 still 0.15", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const histogramRow");
    const window = src.slice(anchor, anchor + 2500);
    expect(window).toMatch(/count\s*===\s*0\s*\?\s*["']0\.15["']\s*:\s*["']0\.85["']/);
  });
});

describe("R124 R119.2 AC5 — 4 buckets still rendered (R119 regression)", () => {
  it("bucketDefs has 4 entries", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const bucketDefs");
    const window = src.slice(anchor, anchor + 2000);
    expect(window).toMatch(/bucketDefs/);
    expect(window).toContain('key: "<1h"');
    expect(window).toContain('key: "1-24h"');
    expect(window).toContain('key: "1-7d"');
    expect(window).toContain('key: "7d+"');
  });
});

describe("R124 R119.2 AC6 — histogram heading still bound", () => {
  it("view.stats.firstPass.histogram still used as heading text", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const bucketDefs");
    const window = src.slice(anchor - 500, anchor + 800);
    expect(window).toMatch(/view\.stats\.firstPass\.histogram/);
  });
});

describe("R124 R119.2 AC7 — bucket label keys still used", () => {
  it("bucket i18n keys from R119 still wired through t()", async () => {
    const src = await readSrc(APP_TS);
    const anchor = src.indexOf("const bucketDefs");
    const window = src.slice(anchor, anchor + 1500);
    expect(window).toMatch(/view\.stats\.firstPass\.bucket\.underHour/);
    expect(window).toMatch(/view\.stats\.firstPass\.bucket\.dayOne/);
    expect(window).toMatch(/view\.stats\.firstPass\.bucket\.weekOne/);
    expect(window).toMatch(/view\.stats\.firstPass\.bucket\.overWeek/);
  });
});

describe("R124 R119.2 AC8 — regression renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
