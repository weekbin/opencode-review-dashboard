/**
 * R125 R117.1 — Per-hunk reconcile badges.
 *
 * Verifies:
 * - AC1: findingsInHunk helper function exists in app.ts
 * - AC2: per-hunk reconcile badge rendered inside [data-hunk] wrapper when reconcile mode on
 * - AC3: badge click handler delegates to jumpToFindingById
 * - AC4: badge only rendered when count > 0
 * - AC5: badge only rendered when reconcile mode is on
 * - AC6: findings filter uses start_line between startLine and endLine
 * - AC7: i18n key reconcile.hunk.badge in en
 * - AC8: i18n key reconcile.hunk.badge in zh-CN
 * - AC9: HunkRange interface has hunkIndex/startLine/endLine fields (R125 prerequisite)
 * - AC10: regression — R117 + R118 + R119 + R120 + R121 + R122 + R123 + R124 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const DIFF_VIRT_TS = join(import.meta.dir, "ui", "diff-virtualization.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R125 R117.1 AC1 — findingsInHunk function exists", () => {
  it("app.ts defines findingsInHunk function", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function findingsInHunk")).toBe(true);
  });
});

describe("R125 R117.1 AC2 — per-hunk badge rendered in data-hunk wrapper", () => {
  it("injectHunkCollapseButtons body creates reconcile-hunk-badge elements", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function injectHunkCollapseButtons");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/reconcile-hunk-badge/);
  });
});

describe("R125 R117.1 AC3 — badge click delegates to jumpToFindingById", () => {
  it("badge addEventListener click calls jumpToFindingById", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function injectHunkCollapseButtons");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/addEventListener\(["']click["']/);
    expect(window).toMatch(/jumpToFindingById/);
  });
});

describe("R125 R117.1 AC4 — badge only rendered when count > 0", () => {
  it("badge insertion guarded by findingsInHunk length check", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function injectHunkCollapseButtons");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/findingsInHunk.*length\s*>\s*0|\.length\s*>\s*0/);
  });
});

describe("R125 R117.1 AC5 — badge only rendered when reconcile mode on", () => {
  it("badge insertion guarded by state.reconcileMode", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function injectHunkCollapseButtons");
    const window = src.slice(fnStart, fnStart + 3000);
    expect(window).toMatch(/state\.reconcileMode/);
  });
});

describe("R125 R117.1 AC6 — findings filter uses start_line between startLine and endLine", () => {
  it("findingsInHunk filters using start_line range", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function findingsInHunk");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/start_line\s*>=\s*hunkRange\.startLine/);
    expect(window).toMatch(/start_line\s*<=\s*hunkRange\.endLine/);
  });
});

describe("R125 R117.1 AC7 — i18n key reconcile.hunk.badge in en", () => {
  it("i18n has reconcile.hunk.badge key with en value", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"reconcile\.hunk\.badge":\s*\{\s*en:/);
  });
});

describe("R125 R117.1 AC8 — i18n key reconcile.hunk.badge in zh-CN", () => {
  it("i18n has reconcile.hunk.badge key with zh-CN value", async () => {
    const src = await readSrc(I18N_TS);
    expect(src).toMatch(/"reconcile\.hunk\.badge":[\s\S]*?"zh-CN":/);
  });
});

describe("R125 R117.1 AC9 — HunkRange interface fields", () => {
  it("diff-virtualization.ts HunkRange has hunkIndex/startLine/endLine", async () => {
    const src = await readSrc(DIFF_VIRT_TS);
    const hunkStart = src.indexOf("interface HunkRange");
    expect(hunkStart).toBeGreaterThan(-1);
    const window = src.slice(hunkStart, hunkStart + 300);
    expect(window).toMatch(/hunkIndex/);
    expect(window).toMatch(/startLine/);
    expect(window).toMatch(/endLine/);
  });
});

describe("R125 R117.1 AC10 — regression renderSparkline still works", () => {
  it("R118 renderSparkline still uses createElementNS svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
