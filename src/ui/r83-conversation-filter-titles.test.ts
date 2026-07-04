// R83: 5 conversation filter chip tooltips (Group 3 of R81 carry-over).
// Sibling patterns already use data-i18n-title (R82).

import { describe, expect, it } from "bun:test";

const REVIEW_HTML = "src/ui/review.html";
const I18N_TS = "src/ui/i18n.ts";

const FILTERS: ReadonlyArray<{ key: string; oldTitle: string }> = [
  { key: "open", oldTitle: "Show only unresolved" },
  { key: "resolved", oldTitle: "Show only resolved" },
  { key: "all", oldTitle: "Show all including resolved" },
  { key: "pinned", oldTitle: "Show only pinned findings" },
  { key: "reacted", oldTitle: "Show only reacted findings" },
];

describe("R83 — 5 conversation filter chip tooltips use data-i18n-title", () => {
  it("all 5 filter chips have data-i18n-title on the <button>", async () => {
    const html = await Bun.file(REVIEW_HTML).text();
    for (const f of FILTERS) {
      // Match the button's data-filter attribute (multi-line form: appears
      // after a `\n            <button` newline). The CSS rule on L2565
      // `.conversation-filter[data-filter="pinned"]` shares the same
      // substring, so we must anchor on the HTML button tag instead.
      const marker = `\n            <button\n              data-filter="${f.key}"`;
      const idx = html.indexOf(marker);
      expect(idx).toBeGreaterThan(0);
      const block = html.substring(idx, idx + 400);
      expect(block).toContain(`data-i18n-title="conversation.filter.${f.key}.title"`);
    }
  });

  it("all 5 hardcoded English titles are removed", async () => {
    const html = await Bun.file(REVIEW_HTML).text();
    for (const f of FILTERS) {
      expect(html).not.toContain(`title="${f.oldTitle}"`);
    }
  });

  it("5 new STRINGS keys exist in i18n.ts (en + zh-CN)", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    for (const f of FILTERS) {
      const k = `conversation.filter.${f.key}.title`;
      const idx = i18n.indexOf(`"${k}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });
});
