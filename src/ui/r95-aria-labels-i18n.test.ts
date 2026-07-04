// R95: 4 remaining hardcoded English aria-label attributes in review.html.

import { describe, expect, it } from "bun:test";

const REVIEW_HTML = "src/ui/review.html";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: 'aria-label="Sidebar sections"', key: "navbar.tabs.ariaLabel" },
  { old: 'aria-label="Resize sidebar"', key: "sidebar.resize.ariaLabel" },
  { old: 'aria-label="Close review drawer"', key: "drawer.close.ariaLabel" },
  { old: 'aria-label="Close settings"', key: "settings.close.ariaLabel" },
];

describe("R95 — 4 remaining hardcoded English aria-labels use data-i18n-aria-label", () => {
  it("all 4 hardcoded English aria-labels replaced with data-i18n-aria-label", async () => {
    const html = await Bun.file(REVIEW_HTML).text();
    for (const site of SITES) {
      expect(html).not.toContain(site.old);
      expect(html).toContain(`data-i18n-aria-label="${site.key}"`);
    }
  });

  it("all 4 new STRINGS keys added to i18n.ts with en + zh-CN", async () => {
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
