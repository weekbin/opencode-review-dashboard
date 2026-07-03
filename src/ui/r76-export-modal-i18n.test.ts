// R76 i18n: export modal (app.ts:3880+) has 6 hardcoded English strings.
// - h3 "Export review"
// - p "Choose a format. The file is generated client-side..."
// - "Markdown summary (.md)" + "Round summary + findings table + notes..."
// - "Patch file (.patch)" + "Unified diff with // REVIEW annotations..."
// - Cancel button (uses modal.cancel from R71)

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";
const I18N_TS_PATH = "src/ui/i18n.ts";

function extractExportModal(ts: string): string | null {
  const m = ts.match(/function showExportModal[\s\S]*?dialog\.innerHTML = `([\s\S]*?)`;/);
  return m && m[1] !== undefined ? m[1] : null;
}

describe("R76 — export modal uses i18n for all 6 hardcoded English strings", () => {
  it("export modal h3 title uses t() instead of hardcoded 'Export review'", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractExportModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<h3>Export review<\/h3>/);
  });

  it("export modal body paragraph uses i18n key", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractExportModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/Choose a format/);
    expect(block!).toMatch(/export\.(?:modal|format)\.body/);
  });

  it("export modal format-card titles use i18n keys (Markdown + Patch)", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractExportModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<strong>Markdown summary \(/);
    expect(block!).not.toMatch(/<strong>Patch file \(/);
  });

  it("export modal format-card descriptions use i18n keys", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractExportModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/Round summary \+ findings table/);
    expect(block!).not.toMatch(/Unified diff with \/\/ REVIEW/);
  });

  it("export modal Cancel button uses modal.cancel (already from R71)", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractExportModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<button id="export-cancel"[^>]*>Cancel<\/button>/);
    expect(block!).toMatch(/t\("modal\.cancel"\)/);
  });

  it("6 new STRINGS keys added in i18n.ts with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const key of [
      "export.modal.title",
      "export.modal.body",
      "export.card.md.title",
      "export.card.md.desc",
      "export.card.patch.title",
      "export.card.patch.desc",
    ]) {
      const re = new RegExp(`"${key.replace(/\\./g, "\\\\.")}":\\s*\\{[\\s\\S]*?\\}`);
      const block = i18n.match(re);
      expect(block).not.toBeNull();
      expect(block![0]).toContain("en:");
      expect(block![0]).toContain('"zh-CN":');
    }
  });
});
