// R98: 4 hardcoded English strings in audit trail changeText builder.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: "`category: ${row.before.category} → ${row.after.category}`", key: "audit.category" },
  { old: "`severity: ${row.before.severity} → ${row.after.severity}`", key: "audit.severity" },
  { old: '"comment updated"', key: "audit.commentUpdated" },
  { old: '"no field changes"', key: "audit.noChanges" },
];

describe("R98 — 4 hardcoded English audit trail strings use t()", () => {
  it("all 4 hardcoded English strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
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
