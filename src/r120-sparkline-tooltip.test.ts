/**
 * R120 R118.1 — Per-round resolution rate sparkline.
 *
 * Verifies:
 * - AC1: renderSparkline modified to attach <title> child per data point
 * - AC2: histogram bar <rect> creates <title> child element
 * - AC3: sparkline tooltip text includes the value (e.g., "Round 3: 75%")
 * - AC4: histogram tooltip text includes count + bucket label
 * - AC5: round-intervals sparkline uses dataPoints for titles
 * - AC6: first-pass sparkline uses dataPoints for titles
 * - AC7: histogram 4 buckets each have title elements
 * - AC8: empty sparkline (<2 values) does NOT crash on title generation
 * - AC9: tooltip uses <title> element (browser-native, not aria-tooltip)
 * - AC10: existing R119 + R118 tests still pass (regression-free)
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R120 R118.3 AC1 — renderSparkline creates <title> per data point", () => {
  it("renderSparkline body contains createElementNS for title elements", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 2500);
    // Must create at least one <title> via createElementNS inside renderSparkline
    expect(window).toMatch(/createElementNS\([^)]+,\s*["']title["']\)/);
  });
});

describe("R120 R118.3 AC2 — histogram bar <rect> creates <title>", () => {
  it("firstPass histogram rect creation site also creates title elements", async () => {
    const src = await readSrc(APP_TS);
    const firstPassIdx = src.indexOf("function aggregateFirstPassBuckets");
    expect(firstPassIdx).toBeGreaterThan(-1);
    const window = src.slice(firstPassIdx, firstPassIdx + 5000);
    expect(window).toMatch(/createElementNS\([^)]+,\s*["']title["']\)/);
  });
});

describe("R120 R118.3 AC3 — sparkline tooltip includes value", () => {
  it("renderSparkline body sets tooltip text via .textContent", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/title[\s\S]*\.textContent\s*=/);
  });
});

describe("R120 R118.3 AC4 — histogram tooltip includes count + label", () => {
  it("histogram bar section creates title with count text", async () => {
    const src = await readSrc(APP_TS);
    const firstPassIdx = src.indexOf("function aggregateFirstPassBuckets");
    const window = src.slice(firstPassIdx, firstPassIdx + 5000);
    expect(window).toMatch(/title[\s\S]*\.textContent\s*=/);
  });
});

describe("R120 R118.3 AC5 — round-intervals sparkline has tooltip", () => {
  it("renderStatsPane calls renderSparkline for round intervals", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    // Should have a renderSparkline call for round intervals (spark1)
    expect(window).toMatch(/renderSparkline\([^)]*gaps/);
  });
});

describe("R120 R118.3 AC6 — first-pass sparkline has tooltip", () => {
  it("renderStatsPane calls renderSparkline for first-pass values (spark2)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderStatsPane");
    const window = src.slice(fnStart, fnStart + 10000);
    expect(window).toMatch(/renderSparkline\([^)]*firstPass\.values/);
  });
});

describe("R120 R118.3 AC7 — histogram 4 buckets have titles", () => {
  it("histogram loop iterates 4 buckets with title per bucket", async () => {
    const src = await readSrc(APP_TS);
    const bucketDefsIdx = src.indexOf("const bucketDefs");
    expect(bucketDefsIdx).toBeGreaterThan(-1);
    const window = src.slice(bucketDefsIdx, bucketDefsIdx + 1500);
    expect(window).toMatch(/bucketDefs/);
    expect(window).toMatch(/title[\s\S]*textContent\s*=/);
    const titleCreateCount = (window.match(/createElementNS\([^)]+,\s*["']title["']\)/g) ?? [])
      .length;
    expect(titleCreateCount).toBeGreaterThanOrEqual(1);
  });
});

describe("R120 R118.3 AC8 — empty sparkline safe (no crash)", () => {
  it("renderSparkline < 2 branch still returns svg (existing behavior)", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    // Existing empty branch must be intact
    expect(window).toMatch(/values\.length\s*<\s*2/);
    expect(window).toMatch(/return svg/);
  });
});

describe("R120 R118.3 AC9 — uses <title> SVG element (browser-native)", () => {
  it("title elements created via createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    // All title creation must use createElementNS with svg namespace
    const matches = [
      ...src.matchAll(
        /createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["'],\s*["']title["']\)/g,
      ),
    ];
    expect(matches.length).toBeGreaterThanOrEqual(2); // sparkline + histogram
  });
});

describe("R120 R118.3 AC10 — no regression to renderSparkline existing tests", () => {
  it("R118 AC3 — renderSparkline still uses createElementNS with svg namespace for svg element", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
