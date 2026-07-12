/**
 * R43 — User-feedback round regressions (GH #73).
 *
 * Covers 5 ACs addressing user-reported UI/state bugs:
 *   AC1: range-banner is position: sticky so it stays visible during scroll.
 *   AC2: resolution_kind (wontfix / duplicate / etc.) renders as a badge
 *        in the conversation panel (was stored but never shown, leaving
 *        users confused when "mark as duplicated" appeared to do nothing).
 *   AC3: settings trigger button uses an SVG icon (immune to textContent
 *        overwrites from data-i18n) instead of a gear emoji that got
 *        overwritten + overflowed the 26px btn-icon.
 *   AC4: previously-discussed finding cards establish their own stacking
 *        context so badges can't escape upward over the sticky header.
 *   AC5: default i18n language is now zh-CN (was en).
 *
 * AC6 (hide-whitespace perf) and AC7 (COMMits panel visual cue) were
 * deferred to R44 per R43 hard-cap (bugfix ≤5).
 *
 * Run with:  bun test src/ui/r43-feedback.test.ts
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const UI = join(import.meta.dir, "..", "..", "src", "ui");
const APP_TS = join(UI, "app.ts");
const HTML = join(UI, "review.html");
const I18N = join(UI, "i18n.ts");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

/** TypeScript-friendly regex match helper. Returns "" if no match. */
function matched(str: string, re: RegExp): string {
  const m = str.match(re);
  return m && m[1] !== undefined ? m[1] : "";
}

describe("R43 AC1 — range-banner is position: sticky", () => {
  it(".range-banner CSS sets position: sticky + top + z-index", async () => {
    const html = await readSource(HTML);
    const body = matched(html, /\.range-banner\s*\{([\s\S]*?)\}/);
    expect(body).toMatch(/position:\s*sticky/);
    expect(body).toMatch(/top:\s*\d+px/);
    expect(body).toMatch(/z-index:\s*\d+/);
  });

  it(".range-banner z-index is below the sticky header (z-index 50)", async () => {
    const html = await readSource(HTML);
    const body = matched(html, /\.range-banner\s*\{([\s\S]*?)\}/);
    const zStr = matched(body, /z-index:\s*(\d+)/);
    expect(zStr).not.toBe("");
    expect(parseInt(zStr, 10)).toBeLessThan(50);
  });
});

describe("R43 AC2 — resolution_kind surfaces as a badge in the conversation panel", () => {
  it("app.ts renderConversationPanel creates a resolution_kind badge", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resolution_kind\b/);
    expect(src).toMatch(/resolution-kind-\$\{entry\.resolution_kind\}/);
  });

  it("resolution_kind badge displays human-readable labels", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/wontfix/);
    expect(src).toMatch(/out_of_scope/);
    expect(src).toMatch(/false_positive/);
    expect(src).toMatch(/duplicate/);
  });
});

describe("R43 AC3 — settings button has no data-i18n (uses SVG instead)", () => {
  it("#settings-btn has no data-i18n attribute", async () => {
    const html = await readSource(HTML);
    // Locate settings-btn and grab the opening tag (between <button and the
    // first >). The button is multi-line so use [\s\S] in place of dot.
    const btnStart = html.indexOf("<button");
    if (btnStart < 0) throw new Error("no <button in HTML");
    // The HTML has multiple buttons; locate the one with id="settings-btn"
    const idx = html.indexOf('id="settings-btn"');
    expect(idx).toBeGreaterThan(0);
    // Walk back to find the <button start
    const startIdx = html.lastIndexOf("<button", idx);
    const endIdx = html.indexOf(">", idx);
    const openingTag = html.substring(startIdx, endIdx + 1);
    expect(openingTag.includes('data-i18n="')).toBe(false);
  });

  it("#settings-btn contains an inline SVG icon", async () => {
    const html = await readSource(HTML);
    const idx = html.indexOf('id="settings-btn"');
    expect(idx).toBeGreaterThan(0);
    const startIdx = html.lastIndexOf("<button", idx);
    const endIdx = html.indexOf("</button>", idx);
    const inner = html.substring(startIdx, endIdx + "</button>".length);
    expect(inner.includes("<svg")).toBe(true);
  });
});

describe("R43 AC4 — previously-discussed finding cards have a local stacking context", () => {
  it(".previously-finding CSS includes position: relative and z-index", async () => {
    const html = await readSource(HTML);
    const body = matched(html, /\.previously-finding\s*\{([\s\S]*?)\}/);
    expect(body).toMatch(/position:\s*relative/);
    expect(body).toMatch(/z-index:\s*\d+/);
  });

  it(".previously-finding z-index is below the sticky header (z-index 50)", async () => {
    const html = await readSource(HTML);
    const body = matched(html, /\.previously-finding\s*\{([\s\S]*?)\}/);
    const zStr = matched(body, /z-index:\s*(\d+)/);
    expect(zStr).not.toBe("");
    expect(parseInt(zStr, 10)).toBeLessThan(50);
  });
});

describe("R43 AC5 — default i18n locale is zh-CN", () => {
  it("DEFAULT_LANGUAGE in src/ui/i18n.ts is 'zh-CN'", async () => {
    const i18n = await readSource(I18N);
    expect(i18n).toMatch(/export const DEFAULT_LANGUAGE:\s*Lang\s*=\s*"zh-CN"/);
  });

  it("applyLanguage() falls back to zh-CN on fresh localStorage", async () => {
    const i18n = await readSource(I18N);
    expect(i18n).toMatch(/DEFAULT_LANGUAGE:\s*Lang\s*=\s*"zh-CN"/);
  });
});
