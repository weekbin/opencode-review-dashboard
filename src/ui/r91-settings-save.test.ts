// R163 #5: regression test for R162 #91 (settings Save + cancel + toast).
// R162 changed the settings footer:
//   - "Close" button → "Save" (id="settings-ok" with data-i18n="settings.save")
//   - new "Cancel" button (id="settings-cancel" with data-i18n="settings.cancel")
//   - Save click handler now calls showToast(t("settings.save.toast"))
// Without these, the modal still shows the old "Close" button with no feedback.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const HTML_PATH = "src/ui/review.html";
const APP_TS = "src/ui/app.ts";

function extractSettingsFooter(html: string): string {
  const m = html.match(/<div\s+class="settings-footer">([\s\S]*?)<\/div>/);
  if (!m || !m[1]) return "";
  return m[1];
}

function extractSettingsOkClickHandler(src: string): string {
  // The handler is between `settingsOkBtn?.addEventListener("click", () => {` and its closing `});`
  const start = src.indexOf('settingsOkBtn?.addEventListener("click"');
  if (start < 0) return "";
  const end = src.indexOf("});", start);
  if (end < 0) return "";
  return src.slice(start, end);
}

describe("R163 — R162 #91 settings Save + cancel regression", () => {
  it('settings footer includes the Save button (data-i18n="settings.save")', () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const footer = extractSettingsFooter(html);
    expect(footer).toContain('id="settings-ok"');
    expect(footer).toContain('data-i18n="settings.save"');
  });

  it('settings footer includes a Cancel button (id="settings-cancel")', () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const footer = extractSettingsFooter(html);
    expect(footer).toContain('id="settings-cancel"');
  });

  it("settings-ok click handler calls showToast on save", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractSettingsOkClickHandler(src);
    expect(handler).toContain("showToast(");
    expect(handler).toContain("settings.save.toast");
  });
});
