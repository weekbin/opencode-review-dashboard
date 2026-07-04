// R89: 5 hardcoded "No X findings" empty-state messages in conversation panel replaced with t().

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: '"No unresolved findings."', key: "conversation.empty.unresolved" },
  { old: '"No resolved findings."', key: "conversation.empty.resolved" },
  {
    old: '"No pinned findings — star a finding to revisit it later."',
    key: "conversation.empty.pinned",
  },
  {
    old: '"No reacted findings — click an emoji on a finding to give feedback."',
    key: "conversation.empty.reacted",
  },
  { old: '"No findings found."', key: "conversation.empty.found" },
];

describe("R89 — 5 hardcoded conversation empty-state messages use t()", () => {
  it("all 5 hardcoded English empty-state strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 5 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).toContain(`t("${site.key}")`);
    }
  });

  it("5 new STRINGS keys added to i18n.ts with en + zh-CN", async () => {
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
