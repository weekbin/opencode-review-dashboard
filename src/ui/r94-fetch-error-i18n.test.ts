// R94: 2 hardcoded English setStatus error messages in fetch path + 1 setAttribute + 1 prompt.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: '"Failed to load review payload", true', key: "status.loadFailed" },
  { old: '"Invalid review payload", true', key: "status.invalidPayload" },
];

describe("R94 — 2 hardcoded setStatus error messages use t()", () => {
  it("all 2 hardcoded English error strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 2 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).toContain(`t("${site.key}")`);
    }
  });

  it("2 new STRINGS keys added to i18n.ts with en + zh-CN", async () => {
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
