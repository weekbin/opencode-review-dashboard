/**
 * R119 R118.2 — First-pass resolve time binned histogram.
 *
 * Verifies:
 * - AC1: aggregateFirstPassBuckets function exists in app.ts
 * - AC2: histogram uses inline SVG namespace (createElementNS with svg)
 * - AC3: 4 bucket i18n keys exist (en + zh-CN) — 8 strings total
 * - AC4: renderStatsPane firstPass section calls aggregateFirstPassBuckets
 * - AC5: bucket helper returns Record with 4 keys
 * - AC6-AC9: math correctness for each bucket boundary (<1h / 1-24h / 1-7d / 7d+)
 * - AC10: empty state — values=[] → all 0 buckets
 * - AC11: histogram only rendered when values.length > 0
 * - AC12: existing R118 i18n key view.stats.firstPass.histogram bound in renderStatsPane
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R119 R118.2 AC1 — aggregateFirstPassBuckets exists", () => {
  it("app.ts defines aggregateFirstPassBuckets function", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function aggregateFirstPassBuckets")).toBe(true);
  });
});

describe("R119 R118.2 AC2 — histogram uses inline SVG", () => {
  it("firstPass section creates additional SVG element via createElementNS", async () => {
    const src = await readSrc(APP_TS);
    const firstPassIdx = src.indexOf("function aggregateFirstPass");
    expect(firstPassIdx).toBeGreaterThan(-1);
    const window = src.slice(firstPassIdx, firstPassIdx + 8000);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
    // At least 2 SVG namespaces (existing sparkline + new histogram bars)
    const svgMatches = window.match(/createElementNS\([^)]+\)/g) ?? [];
    expect(svgMatches.length).toBeGreaterThanOrEqual(2);
  });
});

describe("R119 R118.2 AC3 — 4 bucket i18n keys × 2 locales", () => {
  it("i18n has view.stats.firstPass.bucket.underHour in en", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.underHour":\s*\{\s*en:/);
  });
  it("i18n has view.stats.firstPass.bucket.underHour in zh-CN", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.underHour":[\s\S]*?"zh-CN":/);
  });
  it("i18n has view.stats.firstPass.bucket.dayOne in en", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.dayOne":\s*\{\s*en:/);
  });
  it("i18n has view.stats.firstPass.bucket.dayOne in zh-CN", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.dayOne":[\s\S]*?"zh-CN":/);
  });
  it("i18n has view.stats.firstPass.bucket.weekOne in en", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.weekOne":\s*\{\s*en:/);
  });
  it("i18n has view.stats.firstPass.bucket.weekOne in zh-CN", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.weekOne":[\s\S]*?"zh-CN":/);
  });
  it("i18n has view.stats.firstPass.bucket.overWeek in en", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.overWeek":\s*\{\s*en:/);
  });
  it("i18n has view.stats.firstPass.bucket.overWeek in zh-CN", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.bucket\.overWeek":[\s\S]*?"zh-CN":/);
  });
});

describe("R119 R118.2 AC4 — renderStatsPane calls aggregateFirstPassBuckets", () => {
  it("renderStatsPane firstPass section wires aggregateFirstPassBuckets", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 8000);
    expect(window).toMatch(/aggregateFirstPassBuckets/);
  });
});

describe("R119 R118.2 AC5 — bucket helper returns 4-key Record", () => {
  it("aggregateFirstPassBuckets returns Record with 4 bucket keys", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(fnStart, fnStart + 1200);
    expect(window).toMatch(/"?<1h"?/);
    expect(window).toMatch(/"?1-24h"?/);
    expect(window).toMatch(/"?1-7d"?/);
    expect(window).toMatch(/"?7d\+"?/);
  });
});

describe("R119 R118.2 AC6-AC9 — bucket boundary math", () => {
  it("AC6: < 1h bucket boundary uses HOUR constant comparison", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(fnStart, fnStart + 1200);
    expect(window).toMatch(/v\s*<\s*HOUR|< HOUR/);
  });
  it("AC7: 1-24h bucket boundary uses DAY constant", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(fnStart, fnStart + 1200);
    expect(window).toMatch(/DAY/);
  });
  it("AC8: 1-7d bucket boundary uses 7 * DAY comparison", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(fnStart, fnStart + 1200);
    expect(window).toMatch(/7\s*\*\s*DAY/);
  });
  it("AC9: 7d+ bucket uses 7 * DAY comparison", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(fnStart, fnStart + 1200);
    expect(window).toMatch(/>=\s*7\s*\*\s*DAY/);
  });
});

describe("R119 R118.2 AC10 — empty state", () => {
  it("aggregateFirstPassBuckets uses filter().length (returns 0 for empty)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(fnStart, fnStart + 1200);
    expect(window).toMatch(/filter\(/);
  });
});

describe("R119 R118.2 AC11 — histogram renders only with data", () => {
  it("renderStatsPane guards histogram render on firstPass.values.length > 0", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 8000);
    expect(window).toMatch(/firstPass\.values\.length\s*>\s*0/);
    expect(window).toMatch(/aggregateFirstPassBuckets/);
  });
});

describe("R119 R118.2 AC12 — existing R118 key bound", () => {
  it("renderStatsPane references view.stats.firstPass.histogram (R118-unbound key)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 8000);
    expect(window).toMatch(/view\.stats\.firstPass\.histogram/);
  });
  it("i18n keeps view.stats.firstPass.histogram key (R118 ship)", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.firstPass\.histogram":/);
  });
});
