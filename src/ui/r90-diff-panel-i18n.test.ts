// R90: 4 hardcoded English textContent + title in diff panel toolbar replaced with t().

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: 'expandAllBtn.textContent = "Expand all";', key: "panel.expandAll" },
  { old: 'collapseAllBtn.textContent = "Collapse all";', key: "panel.collapseAll" },
  {
    old: 'expandAllBtn.title = "Expand all unchanged regions across every file";',
    key: "panel.expandAll.title",
  },
  {
    old: 'collapseAllBtn.title = "Collapse all unchanged regions across every file";',
    key: "panel.collapseAll.title",
  },
];

describe("R90 — 4 hardcoded diff panel labels use t()", () => {
  it("all 4 hardcoded English labels removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 4 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).toContain(`t("${site.key}")`);
    }
  });

  it("2 new STRINGS keys added to i18n.ts (panel.expandAll/collapseAll already exist)", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    const newKeys = ["panel.expandAll.title", "panel.collapseAll.title"];
    for (const k of newKeys) {
      const idx = i18n.indexOf(`"${k}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });
});
