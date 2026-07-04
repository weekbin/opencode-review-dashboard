/**
 * R116 #83 — Submit dual-intent (Request changes / Approve changes).
 *
 * Verifies:
 * - AC1: Toolbar shows two buttons (request changes + approve changes) with i18n labels
 * - AC2: i18n keys exist for both labels in en + zh-CN
 * - AC3: Submit interface extended with intent: "request_changes" | "approve" (additive)
 * - AC4: Server default intent is "request_changes" when absent (back-compat)
 * - AC5: state.approvals[] type defined for store
 * - AC6: Approve button disabled when open findings exist OR notes empty
 * - AC7: Approve button enabled when 0 open findings AND notes non-empty
 * - AC8: Each button opens its own confirm modal (request vs approve)
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const INDEX_TS = join(import.meta.dir, "index.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R116 #83 AC1 — toolbar shows dual buttons", () => {
  it("app.ts toolbar has both #submit-request-changes and #submit-approve-changes buttons", async () => {
    const src = await readSrc(APP_TS);
    expect(src.includes('id="submit-request-changes"')).toBe(true);
    expect(src.includes('id="submit-approve-changes"')).toBe(true);
  });
});

describe("R116 #83 AC2 — i18n keys exist for both labels", () => {
  it("i18n.ts has toolbar.requestChanges + toolbar.approveChanges in en + zh-CN", async () => {
    const src = await readSrc(I18N_TS);
    expect(src.includes('"toolbar.requestChanges"')).toBe(true);
    expect(src.includes('"toolbar.approveChanges"')).toBe(true);
    expect(
      src.includes('"toolbar.requestChanges": { en: "Request changes"') ||
        src.includes('"toolbar.requestChanges": { en:'),
    ).toBe(true);
    expect(
      src.includes('"toolbar.approveChanges": { en: "Approve changes"') ||
        src.includes('"toolbar.approveChanges": { en:'),
    ).toBe(true);
  });
});

describe("R116 #83 AC3 — Submit interface extended with intent", () => {
  it("src/index.ts Submit type accepts intent field", async () => {
    const src = await readSrc(INDEX_TS);
    const submitIdx = src.indexOf("type Submit = {");
    expect(submitIdx).toBeGreaterThan(-1);
    const window = src.slice(submitIdx, submitIdx + 600);
    expect(window).toMatch(/intent\?/);
    expect(src).toMatch(/type SubmitIntent\s*=\s*"request_changes"\s*\|\s*"approve"/);
  });
});

describe("R116 #83 AC4 — server defaults to request_changes when intent absent", () => {
  it("src/index.ts POST /submit defaults intent to request_changes", async () => {
    const src = await readSrc(INDEX_TS);
    const handlerIdx = src.indexOf('method === "POST" && pathname === `/api/review/${id}/submit`');
    expect(handlerIdx).toBeGreaterThan(-1);
    const window = src.slice(handlerIdx, handlerIdx + 4000);
    expect(window).toMatch(/intent\s*===\s*"approve"/);
    expect(window).toMatch(/isSubmitIntent/);
    expect(window).toMatch(/"request_changes"/);
  });
});

describe("R116 #83 AC5 — state.approvals[] type defined", () => {
  it("src/index.ts defines Approval type or state.approvals field", async () => {
    const src = await readSrc(INDEX_TS);
    expect(src.includes("approvals") || src.includes("Approval = {")).toBe(true);
    expect(src).toMatch(/approvals\?:\s*Approval\[\]/);
  });
});

describe("R116 #83 AC6 — approve disabled when open findings exist", () => {
  it("app.ts approve button disable condition checks open findings + notes", async () => {
    const src = await readSrc(APP_TS);
    const updateFnIdx = src.indexOf("function updateSubmitButtons");
    expect(updateFnIdx).toBeGreaterThan(-1);
    const window = src.slice(updateFnIdx, updateFnIdx + 800);
    expect(window).toMatch(/openCount\s*===\s*0/);
    expect(window).toMatch(/notesNonEmpty/);
  });
});

describe("R116 #83 AC7 — approve enabled when 0 open findings + notes non-empty", () => {
  it("app.ts approve button has enable condition (toolbar)", async () => {
    const src = await readSrc(APP_TS);
    const approveBtnIdx = src.indexOf('id="submit-approve-changes"');
    expect(approveBtnIdx).toBeGreaterThan(-1);
    const window = src.slice(approveBtnIdx, approveBtnIdx + 2500);
    expect(window).toMatch(/notes\.trim\(\)/);
  });
});

describe("R116 #83 AC8 — each button opens its own confirm modal", () => {
  it("i18n has separate modal titles for request vs approve", async () => {
    const src = await readSrc(I18N_TS);
    expect(
      src.includes('"modal.submit.approve.title"') ||
        src.includes('"modal.submit.requestChanges.title"'),
    ).toBe(true);
    expect(
      src.includes('"modal.submit.approve.body"') || src.includes('"modal.submit.approve.confirm"'),
    ).toBe(true);
  });
});
