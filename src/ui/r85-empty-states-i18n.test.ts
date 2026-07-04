// R85: 4 hardcoded "No X yet" empty-state messages in app.ts replaced with t() calls.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string; i18nCall: string }> = [
  {
    old: '"No findings yet."',
    key: "conversation.empty.noFindings",
    i18nCall: 't("conversation.empty.noFindings")',
  },
  {
    old: '"No saved replies yet — save your first one"',
    key: "savedReplies.empty",
    i18nCall: 't("savedReplies.empty")',
  },
  {
    old: '"No prior discussion yet. Submit a round to start the history."',
    key: "previously.empty",
    i18nCall: 't("previously.empty")',
  },
];

describe("R85 — 3 hardcoded empty-state messages in app.ts use t()", () => {
  it("all 3 hardcoded English empty-state strings are removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 3 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      const matches = app.match(
        new RegExp(site.i18nCall.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      );
      expect(matches && matches.length).toBeGreaterThan(0);
    }
  });

  it("3 new STRINGS keys added to i18n.ts with en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    for (const site of SITES) {
      const idx = i18n.indexOf(`"${site.key}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });

  it("'No findings yet.' appears 2x in app.ts (1 in conversation, 1 in find/search)", async () => {
    const app = await Bun.file(APP_TS).text();
    const count = (app.match(/No findings yet\./g) || []).length;
    expect(count).toBe(0);
  });
});
