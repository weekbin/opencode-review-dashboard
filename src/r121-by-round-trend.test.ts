/**
 * R121 R118.1 — Per-round resolution rate sparkline trend.
 *
 * Verifies:
 * - AC1: renderStatsPane byRound section appends renderSparkline after byRoundTable
 * - AC2: rates array computed from aggregateByRound resolution/total*100
 * - AC3: trend sparkline uses 280×32 dimensions (longer than default 120×24)
 * - AC4: trend sparkline passes dataPoints for per-point tooltips (R120 reuse)
 * - AC5: i18n has view.stats.byRound.trend key in en
 * - AC6: i18n has view.stats.byRound.trend key in zh-CN
 * - AC7: byRoundSection appends trend div with stats-by-round-trend class
 * - AC8: trend caption uses t("view.stats.byRound.trend") (i18n-aware)
 * - AC9: trend renders after byRoundTable, before byRoundSection is appended to root
 * - AC10: regression — R118 + R119 + R120 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R121 R118.1 AC1 — byRound section appends renderSparkline", () => {
  it("renderStatsPane byRound section wires renderSparkline for trend", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    expect(window).toMatch(/renderSparkline\([^)]*rates/);
  });
});

describe("R121 R118.1 AC2 — rates computed from aggregateByRound", () => {
  it("byRound trend uses aggregateByRound resolution/total*100", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    expect(window).toMatch(/aggregateByRound\(findings\)/);
    expect(window).toMatch(/agg\.resolved[\s\S]*?agg\.total[\s\S]*?100/);
  });
});

describe("R121 R118.1 AC3 — trend sparkline uses 280×32 dimensions", () => {
  it("renderSparkline call passes width 280 and height 32", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    // Find renderSparkline call sites within byRound trend
    const trendBlock = window.match(/byRound[^]*?trend[\s\S]{0,1500}/);
    expect(trendBlock).not.toBeNull();
    expect(trendBlock![0]).toMatch(/width:\s*280/);
    expect(trendBlock![0]).toMatch(/height:\s*32/);
  });
});

describe("R121 R118.1 AC4 — trend passes dataPoints", () => {
  it("renderSparkline call for byRound trend includes dataPoints", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    const trendBlock = window.match(/byRound[^]*?trend[\s\S]{0,1500}/);
    expect(trendBlock).not.toBeNull();
    expect(trendBlock![0]).toMatch(/dataPoints/);
  });
});

describe("R121 R118.1 AC5 — i18n key view.stats.byRound.trend in en", () => {
  it("i18n has view.stats.byRound.trend key with en value", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.byRound\.trend":\s*\{\s*en:/);
  });
});

describe("R121 R118.1 AC6 — i18n key view.stats.byRound.trend in zh-CN", () => {
  it("i18n has view.stats.byRound.trend key with zh-CN value", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"view\.stats\.byRound\.trend":[\s\S]*?"zh-CN":/);
  });
});

describe("R121 R118.1 AC7 — byRoundSection appends trend div with stats-by-round-trend class", () => {
  it("trend div has stats-by-round-trend class", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    expect(window).toMatch(/stats-by-round-trend/);
  });
});

describe("R121 R118.1 AC8 — trend caption uses t(view.stats.byRound.trend)", () => {
  it("trend caption binds t(view.stats.byRound.trend)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    expect(window).toMatch(/t\(\s*["']view\.stats\.byRound\.trend["']\s*\)/);
  });
});

describe("R121 R118.1 AC9 — trend renders after byRoundTable", () => {
  it("byRoundTable.appendChild precedes trend sparkline append", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    const tableIdx = window.indexOf("byRoundTable.appendChild");
    const trendIdx = window.indexOf("stats-by-round-trend");
    expect(tableIdx).toBeGreaterThan(-1);
    expect(trendIdx).toBeGreaterThan(-1);
    expect(trendIdx).toBeGreaterThan(tableIdx);
  });
});

describe("R121 R118.1 AC10 — regression R118 renderSparkline still works", () => {
  it("R118 AC3 — renderSparkline still uses createElementNS with svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
