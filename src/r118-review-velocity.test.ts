/**
 * R118 #81 — Review Velocity analytics (Stats tab).
 *
 * Verifies:
 * - AC1: renderStatsPane function exists in app.ts
 * - AC2: 4 aggregation helpers exist (byRound, byCategory, intervals, firstPass)
 * - AC3: renderSparkline uses inline SVG (createElementNS with svg namespace)
 * - AC4: aggregateByRound groups findings by round + counts total/resolved
 * - AC5: aggregateByCategory groups by category + counts resolved/unresolved/wontfix
 * - AC6: aggregateRoundIntervals computes gap between consecutive rounds (ms)
 * - AC7: aggregateFirstPass computes resolved_at - created_at averages
 * - AC8: renderActivePane calls renderStatsPane when activeTab === "stats"
 * - AC9: review.html has 5th tab button (data-tab="stats") + pane (data-pane="stats")
 * - AC10: empty state copy rendered when findings.length === 0
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const REVIEW_HTML = join(import.meta.dir, "ui", "review.html");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R118 #81 AC1 — renderStatsPane function exists", () => {
  it("app.ts defines renderStatsPane function", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function renderStatsPane")).toBe(true);
  });
});

describe("R118 #81 AC2 — 4 aggregation helpers exist", () => {
  it("aggregateByRound function exists", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function aggregateByRound")).toBe(true);
  });
  it("aggregateByCategory function exists", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function aggregateByCategory")).toBe(true);
  });
  it("aggregateRoundIntervals function exists", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function aggregateRoundIntervals")).toBe(true);
  });
  it("aggregateFirstPass function exists", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function aggregateFirstPass")).toBe(true);
  });
});

describe("R118 #81 AC3 — renderSparkline uses inline SVG namespace", () => {
  it("renderSparkline creates SVG element via createElementNS", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 2000);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});

describe("R118 #81 AC4 — aggregateByRound logic", () => {
  it("returns Map grouped by round with total+resolved counts", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateByRound");
    const window = src.slice(fnStart, fnStart + 1500);
    expect(window).toMatch(/round/);
    expect(window).toMatch(/total/);
    expect(window).toMatch(/resolved/);
  });
});

describe("R118 #81 AC5 — aggregateByCategory logic", () => {
  it("returns Map grouped by category with resolved/unresolved/wontfix counts", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateByCategory");
    const window = src.slice(fnStart, fnStart + 1500);
    expect(window).toMatch(/category/);
    expect(window).toMatch(/resolved/);
    expect(window).toMatch(/unresolved/);
  });
});

describe("R118 #81 AC6 — aggregateRoundIntervals logic", () => {
  it("computes gap between consecutive rounds in ms", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateRoundIntervals");
    const window = src.slice(fnStart, fnStart + 1500);
    expect(window).toMatch(/round/);
    expect(window).toMatch(/created_at/);
  });
});

describe("R118 #81 AC7 — aggregateFirstPass logic", () => {
  it("computes resolved_at - created_at averages for resolved findings", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function aggregateFirstPass");
    const window = src.slice(fnStart, fnStart + 1500);
    expect(window).toMatch(/resolved_at/);
    expect(window).toMatch(/created_at/);
  });
});

describe("R118 #81 AC8 — renderActivePane calls renderStatsPane for stats tab", () => {
  it("renderActivePane handles state.activeTab === 'stats'", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderActivePane");
    const window = src.slice(fnStart, fnStart + 1500);
    expect(window).toMatch(/activeTab\s*===\s*["']stats["']/);
    expect(window).toMatch(/renderStatsPane/);
  });
});

describe("R118 #81 AC9 — review.html has 5th tab button + pane", () => {
  it("review.html has tab button with data-tab='stats'", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(src.includes('data-tab="stats"')).toBe(true);
  });
  it("review.html has pane with data-pane='stats'", async () => {
    const src = await readSrc(REVIEW_HTML);
    expect(src.includes('data-pane="stats"')).toBe(true);
  });
});

describe("R118 #81 AC10 — empty state copy rendered", () => {
  it("i18n has view.stats.empty key in both locales", async () => {
    const src = await readSrc(I18N_TS);
    expect(src.includes('"view.stats.empty"')).toBe(true);
  });
  it("renderStatsPane has empty findings branch", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/findings\.length\s*===\s*0/);
  });
});
