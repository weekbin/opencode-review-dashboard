// R168 AC1-AC5: regression test bundle for R162 #91 settings UX overhaul.
// R162 added: Save button (was Close), Cancel button, success toast on save,
// topbar consolidation (layout/theme/language toggles hidden).
// R163 added 1 lock-in test (r91-settings-save.test.ts). R168 extends that
// to cover Cancel (no toast), Reset, topbar-hide, and gear-icon confirmation.
//
// If a future refactor reverts any of these to the R162-pre behavior, this
// test catches it. Same regex-extract-source pattern as other R162 lock-ins.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HTML = join(import.meta.dir, "review.html");
const APP_TS = join(import.meta.dir, "app.ts");

function readSrc(path: string): string {
  return readFileSync(path, "utf-8");
}

function extractSettingsFooter(html: string): string {
  const m = html.match(/<div\s+class="settings-footer">([\s\S]*?)<\/div>/);
  return m && m[1] ? m[1] : "";
}

function extractSettingsBtn(html: string): string {
  // Capture the full <button id="settings-btn" ...> ... </button> element
  // (opening tag attributes + inner content). Tests assert both the SVG
  // icon (inner) and the data-i18n-aria-label (opening tag).
  const m = html.match(/<button[^>]*id="settings-btn"[^>]*>[\s\S]*?<\/button>/);
  return m && m[0] ? m[0] : "";
}

function extractSettingsCancelClickHandler(src: string): string {
  // settingsCancelBtn?.addEventListener("click", closeSettingsModal);
  const start = src.indexOf('settingsCancelBtn?.addEventListener("click"');
  if (start < 0) return "";
  const end = src.indexOf(");", start);
  return end < 0 ? "" : src.slice(start, end + 2);
}

describe("R168 — R162 #91 settings modal full regression bundle", () => {
  describe("AC1 Save button → modal closes + toast", () => {
    it("settings-cancel handler is registered and just closes (no toast)", () => {
      const src = readSrc(APP_TS);
      const handler = extractSettingsCancelClickHandler(src);
      expect(handler).toContain("closeSettingsModal");
      expect(handler).not.toContain("showToast");
    });

    it("settings-ok (Save) handler closes modal AND calls showToast", () => {
      const src = readSrc(APP_TS);
      // The Save click handler is the next addEventListener("click") after
      // settingsCancelBtn?.addEventListener. Search for showToast near Close.
      const saveIdx = src.indexOf('settingsOkBtn?.addEventListener("click"');
      expect(saveIdx).toBeGreaterThan(-1);
      const end = src.indexOf("})", saveIdx);
      const handler = src.slice(saveIdx, end + 2);
      expect(handler).toContain("showToast");
      expect(handler).toContain("settings.save.toast");
      expect(handler).toContain("closeSettingsModal");
    });
  });

  describe("AC2 Reset button wired", () => {
    it("settings footer includes Reset button", () => {
      const html = readSrc(HTML);
      const footer = extractSettingsFooter(html);
      expect(footer).toContain('id="settings-reset"');
      expect(footer).toContain("settings.reset");
    });

    it("settingsResetBtn click handler is registered (app.ts:1910)", () => {
      const src = readSrc(APP_TS);
      expect(src).toContain('settingsResetBtn?.addEventListener("click"');
      expect(src).toContain("resetSettings()");
    });
  });

  describe("AC3 topbar consolidation", () => {
    it("layout-toggle has hidden attribute (R162 consolidation)", () => {
      const html = readSrc(HTML);
      expect(html).toMatch(/<div\s+class="layout-toggle"\s+id="layout-toggle"\s+hidden>/);
    });

    it("theme-toggle has hidden attribute (R162 consolidation)", () => {
      const html = readSrc(HTML);
      expect(html).toMatch(/<div\s+class="theme-toggle"\s+id="theme-toggle"\s+hidden>/);
    });

    it("language-toggle has hidden attribute (R162 consolidation)", () => {
      const html = readSrc(HTML);
      expect(html).toMatch(/<div\s+class="language-toggle"\s+id="language-toggle"\s+hidden>/);
    });

    it(".layout-toggle[hidden] CSS rule ensures display:none (regression of #91 fix)", () => {
      const html = readSrc(HTML);
      expect(html).toMatch(/\.layout-toggle\[hidden\]\s*\{[\s\S]*?display:\s*none/);
    });
  });

  describe("AC4 Settings button is gear SVG icon (not text)", () => {
    it("settings-btn contains <svg> gear icon", () => {
      const html = readSrc(HTML);
      const btn = extractSettingsBtn(html);
      expect(btn).toContain("<svg");
      expect(btn).toContain("circle cx"); // gear SVG has a circle element
    });

    it("settings-btn has aria-label but NOT text 'Settings' or '设置' (no overflow)", () => {
      const html = readSrc(HTML);
      const btn = extractSettingsBtn(html);
      // data-i18n-aria-label points to the i18n key (used for screen readers)
      expect(btn).toContain("data-i18n-aria-label");
      // The button must NOT contain a text label that would overflow 26px
      // (R43 AC3 fix landed the SVG icon specifically because data-i18n
      // applied to the button set textContent to "Settings"/"设置")
      const btnText = btn.replace(/<svg[\s\S]*?<\/svg>/g, "").trim();
      expect(btnText).not.toContain("Settings");
      expect(btnText).not.toContain("设置");
    });
  });
});
