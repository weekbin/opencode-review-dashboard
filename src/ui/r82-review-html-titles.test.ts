// R82: 8 of 13 remaining hardcoded English title="..." attributes in review.html
// (R81 carry-over). Groups 1+2: top toolbar (4) + left sidebar (4).
// R83 will handle Group 3 (conversation filter chips x5 — separate scope).

import { describe, expect, it } from "bun:test";

const REVIEW_HTML = "src/ui/review.html";
const I18N_TS = "src/ui/i18n.ts";

interface Site {
  marker: string;
  i18nKey: string;
  oldTitle: string;
}

const SITES: Site[] = [
  // Group 1: top toolbar
  {
    marker: 'id="save-indicator"',
    i18nKey: "saveIndicator.title",
    oldTitle: "Auto-save status",
  },
  {
    marker: 'data-layout="unified"',
    i18nKey: "toolbar.layout.unified.title",
    oldTitle: "Unified diff (stacked)",
  },
  {
    marker: 'data-layout="split"',
    i18nKey: "toolbar.layout.split.title",
    oldTitle: "Split diff (side-by-side)",
  },
  {
    marker: 'id="submit"',
    i18nKey: "submitReview.title",
    oldTitle: "Submit this review round (your round notes are above)",
  },
  // Group 2: left sidebar
  {
    marker: 'data-mode="tree"',
    i18nKey: "sidebar.mode.tree.title",
    oldTitle: "Tree view",
  },
  {
    marker: 'data-mode="flat"',
    i18nKey: "sidebar.mode.flat.title",
    oldTitle: "Flat list",
  },
  {
    marker: 'id="sort-findings"',
    i18nKey: "conversation.sort.title",
    oldTitle: "Sort findings in this Conversation panel",
  },
  {
    marker: 'id="filter-previously-by-round"',
    i18nKey: "previously.filter.title",
    oldTitle: "Filter previously-discussed by round",
  },
];

describe("R82 — 8 remaining hardcoded English title attributes use data-i18n-title", () => {
  it("all 8 sites have data-i18n-title attribute in the block following each marker", async () => {
    const html = await Bun.file(REVIEW_HTML).text();
    for (const site of SITES) {
      const idx = html.indexOf(site.marker);
      expect(idx).toBeGreaterThan(0);
      // Read 400 chars after marker to capture multi-line element opening.
      const block = html.substring(idx, idx + 400);
      expect(block).toContain(`data-i18n-title="${site.i18nKey}"`);
    }
  });

  it("all 8 hardcoded English title strings are REMOVED", async () => {
    const html = await Bun.file(REVIEW_HTML).text();
    for (const site of SITES) {
      expect(html).not.toContain(`title="${site.oldTitle}"`);
    }
  });

  it("all 8 new STRINGS keys exist in i18n.ts with en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    for (const site of SITES) {
      const keyRe = new RegExp(`"${site.i18nKey.replace(/\./g, "\\.")}":`);
      const m = i18n.match(keyRe);
      expect(m).not.toBeNull();
      const row = i18n.substring(m!.index!, m!.index! + 400);
      expect(row).toMatch(/en:\s*"[^"]*"/);
      expect(row).toMatch(/"zh-CN":\s*"[^"]*"/);
    }
  });
});
