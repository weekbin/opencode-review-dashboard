// R88: 5 hardcoded English labels in drawer/popover UI replaced with t().

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: 'copyLinkBtn.textContent = "Copy link";', key: "action.copyLink" },
  { old: 'copyMdBtn.textContent = "Copy as MD";', key: "action.copyMarkdown" },
  { old: 'submitBtn.textContent = "Comment";', key: "action.submitComment" },
  { old: 'header.textContent = "Saved Replies";', key: "savedReplies.title" },
  {
    old: 'selectionRoot.textContent = "Select lines in the diff to start.";',
    key: "drawer.selectionHint",
  },
];

describe("R88 — 5 hardcoded English labels in drawer/popover use t()", () => {
  it("all 5 hardcoded English labels removed from app.ts", async () => {
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
