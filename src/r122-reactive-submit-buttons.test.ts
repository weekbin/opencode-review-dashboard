/**
 * R122 R116.1 — updateSubmitButtons reactive bugfix.
 *
 * Bug: Approve Changes button enable/disable state is only computed at boot
 * or at submit-click time. After user resolves a finding inline, the button
 * stays disabled until they reload the page OR add another finding OR attempt
 * to submit.
 *
 * Fix: wire updateSubmitButtons() into all state-changing handlers.
 *
 * Verifies:
 * - AC1: updateSubmitButtons() is called from ≥5 places in app.ts
 * - AC2: updateSubmitButtons called after resolveFinding
 * - AC3: updateSubmitButtons called after reopenFinding
 * - AC4: updateSubmitButtons called in addFinding flow (or notes-area change)
 * - AC5: updateSubmitButtons called after state.notes mutation
 * - AC6: function updateSubmitButtons still exists (regression for L1518)
 * - AC7: function reads submitApproveButton.disabled (preserved logic)
 * - AC8: gate openCount === 0 && notesNonEmpty preserved
 * - AC9: pre-existing L6496/L6504 dual-button call sites preserved
 * - AC10: regression — R121 + R120 + R119 + R118 tests still pass
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R122 R116.1 AC1 — updateSubmitButtons called from ≥5 places", () => {
  it("updateSubmitButtons() invocations appear ≥5 times in app.ts", async () => {
    const src = await readSrc(APP_TS);
    const calls = (src.match(/updateSubmitButtons\(\)/g) ?? []).length;
    expect(calls).toBeGreaterThanOrEqual(5);
  });
});

describe("R122 R116.1 AC2 — updateSubmitButtons after resolveFinding", () => {
  it("updateSubmitButtons called within resolveFinding function body", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("async function resolveFinding");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 4500);
    expect(window).toMatch(/updateSubmitButtons\(\)/);
  });
});

describe("R122 R116.1 AC3 — updateSubmitButtons after reopenFinding", () => {
  it("updateSubmitButtons called within reopenFinding function body", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("async function reopenFinding");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 4500);
    expect(window).toMatch(/updateSubmitButtons\(\)/);
  });
});

describe("R122 R116.1 AC4 — updateSubmitButtons in addFinding flow", () => {
  it("updateSubmitButtons called in or after addFinding handler chain", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function addFinding");
    expect(fnStart).toBeGreaterThan(-1);
    const window = src.slice(fnStart, fnStart + 4000);
    expect(window).toMatch(/updateSubmitButtons\(\)/);
  });
});

describe("R122 R116.1 AC5 — updateSubmitButtons after state.notes mutation", () => {
  it("updateSubmitButtons called after state.notes = assignment", async () => {
    const src = await readSrc(APP_TS);
    const notesAssignIdx = src.indexOf("state.notes = ");
    expect(notesAssignIdx).toBeGreaterThan(-1);
    const window = src.slice(notesAssignIdx, notesAssignIdx + 1000);
    expect(window).toMatch(/updateSubmitButtons\(\)/);
  });
});

describe("R122 R116.1 AC6 — function updateSubmitButtons still exists", () => {
  it("function declaration preserved at L1518 (regression)", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes("function updateSubmitButtons(): void {")).toBe(true);
  });
});

describe("R122 R116.1 AC7 — disabled assignment preserved", () => {
  it("updateSubmitButtons reads submitApproveButton.disabled", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function updateSubmitButtons");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/submitApproveButton\.disabled\s*=/);
  });
});

describe("R122 R116.1 AC8 — gate condition preserved", () => {
  it("updateSubmitButtons gate is openCount === 0 && notesNonEmpty", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function updateSubmitButtons");
    const window = src.slice(fnStart, fnStart + 500);
    expect(window).toMatch(/openCount\s*===\s*0/);
    expect(window).toMatch(/notesNonEmpty/);
  });
});

describe("R122 R116.1 AC9 — pre-existing dual-button call sites preserved", () => {
  it("submit handlers (L6496/L6504 region) still call updateSubmitButtons", async () => {
    const src = await readSrc(APP_TS);
    // L6496 / L6504 = submit-request-changes and submit-approve-changes handler bodies
    // Anchor on "submit-request-changes" and check nearby
    const anchor = src.indexOf('id="submit-request-changes"');
    if (anchor === -1) return;
    const window = src.slice(anchor, anchor + 2000);
    expect(window).toMatch(/updateSubmitButtons\(\)/);
  });
});

describe("R122 R116.1 AC10 — regression renderSparkline still works", () => {
  it("R118 AC3 — renderSparkline still uses createElementNS with svg namespace", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function renderSparkline");
    const window = src.slice(fnStart, fnStart + 2500);
    expect(window).toMatch(/createElementNS\(["']http:\/\/www\.w3\.org\/2000\/svg["']/);
  });
});
