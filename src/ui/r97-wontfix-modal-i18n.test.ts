// R97: 3 hardcoded English strings in showWontfixReasonModal().

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  {
    old: "<p>Why is this finding not actionable? Pick a category and add an optional reason.</p>",
    key: "modal.wontfix.body",
  },
  { old: '<button id="wontfix-cancel" type="button">Cancel</button>', key: "modal.cancel" },
  {
    old: '<button id="wontfix-submit" class="primary" type="button">Mark as wontfix</button>',
    key: "action.mark",
  },
];

describe("R97 — 3 hardcoded English strings in showWontfixReasonModal use t()", () => {
  it("all 3 hardcoded English strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 3 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      const escaped = site.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(app).toMatch(new RegExp(`t\\(["']${escaped}["']`));
    }
  });

  it("1 new STRINGS key added to i18n.ts (modal.cancel/action.mark exist)", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    const newKeys = ["modal.wontfix.body"];
    for (const k of newKeys) {
      const idx = i18n.indexOf(`"${k}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });
});
