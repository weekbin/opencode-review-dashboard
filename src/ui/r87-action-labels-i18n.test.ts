// R87: 4 hardcoded English button textContent in app.ts replaced with t().
// action.mark already exists from earlier rounds.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: 'removeBtn.textContent = "Remove";', key: "action.remove" },
  { old: 'resolveBtn.textContent = "Resolve";', key: "action.resolve" },
  { old: 'editBtn.textContent = "Edit";', key: "action.edit" },
  { old: 'jumpBtn.textContent = "Jump";', key: "action.jump" },
];

describe("R87 — 4 hardcoded English button labels in drawer use t()", () => {
  it("all 4 hardcoded English button labels removed from app.ts", async () => {
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

  it("4 new STRINGS keys added to i18n.ts with en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    for (const site of SITES) {
      const idx = i18n.indexOf(`"${site.key}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });
});
