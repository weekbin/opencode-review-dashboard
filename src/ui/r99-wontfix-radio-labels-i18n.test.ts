// R99: hardcoded Wontfix radio labels + readBtn title + 4 setStatus messages.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  // Wontfix radio labels (4)
  { old: 'label: "Wontfix",', key: "wontfix.kind.wontfix" },
  { old: 'label: "Out of scope",', key: "wontfix.kind.outOfScope" },
  { old: 'label: "False positive",', key: "wontfix.kind.falsePositive" },
  { old: 'label: "Duplicate",', key: "wontfix.kind.duplicate" },
  // Wontfix hints (4)
  {
    old: 'hint: "Acknowledged but will not address (e.g. design choice, intentional)"',
    key: "wontfix.kind.wontfix.hint",
  },
  {
    old: 'hint: "Should be tracked elsewhere / not in this review\'s scope"',
    key: "wontfix.kind.outOfScope.hint",
  },
  {
    old: 'hint: "Not actually an issue — the code is correct as-is"',
    key: "wontfix.kind.falsePositive.hint",
  },
  {
    old: 'hint: "Already covered by another finding or fixed elsewhere"',
    key: "wontfix.kind.duplicate.hint",
  },
  // setStatus (3) - "Expanded/Collapsed all files" already have keys, reuse
  { old: '"Finding marked as wontfix"', key: "status.findingMarkedWontfix" },
  { old: '"Finding resolved"', key: "status.findingResolved" },
  { old: '"Finding reopened"', key: "status.findingReopened" },
  // readBtn title
  { old: 'readBtn.title = "Mark as read";', key: "action.markAsRead" },
];

describe("R99 — 12 hardcoded Wontfix radio + setStatus + readBtn strings use t()", () => {
  it("all 12 hardcoded English strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("12 new STRINGS keys added to i18n.ts (3 reused: expandedAll/collapsedAll not in this list)", async () => {
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
