// R84: 10 hardcoded English strings in app.ts replaced with t() calls.
// 4 showToast messages + 4 setAttribute("aria-label") + 2 placeholder assignments.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string; i18nCall: string }> = [
  {
    old: '"Could not copy permalink — clipboard blocked"',
    key: "status.copyPermalinkBlocked",
    i18nCall: 't("status.copyPermalinkBlocked")',
  },
  {
    old: '"Copied as Markdown"',
    key: "status.copiedMarkdown",
    i18nCall: 't("status.copiedMarkdown")',
  },
  {
    old: '"Could not copy markdown — clipboard blocked"',
    key: "status.copyBlocked",
    i18nCall: 't("status.copyBlocked")',
  },
  { old: '"Finding added"', key: "status.findingAdded", i18nCall: 't("status.findingAdded")' },
  {
    old: '"File jumper"',
    key: "palette.fileJumper.ariaLabel",
    i18nCall: 't("palette.fileJumper.ariaLabel")',
  },
  {
    old: '"Search panel…"',
    key: "palette.searchPanel.placeholder",
    i18nCall: 't("palette.searchPanel.placeholder")',
  },
  {
    old: '"Search current panel"',
    key: "palette.searchPanel.ariaLabel",
    i18nCall: 't("palette.searchPanel.ariaLabel")',
  },
  {
    old: '"Select all visible findings"',
    key: "conversation.findings.selectAll.ariaLabel",
    i18nCall: 't("conversation.findings.selectAll.ariaLabel")',
  },
  {
    old: '"Add a comment (max 500 chars)"',
    key: "finding.comment.placeholder",
    i18nCall: 't("finding.comment.placeholder")',
  },
];

describe("R84 — 9 hardcoded English strings in app.ts use t()", () => {
  it("all 9 hardcoded English strings are removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 9 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).toContain(site.i18nCall);
    }
  });

  it("6 new STRINGS keys (status.copyPermalinkBlocked exists) + 6 new keys added", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    const newKeys = [
      "status.copyPermalinkBlocked",
      "palette.fileJumper.ariaLabel",
      "palette.searchPanel.placeholder",
      "palette.searchPanel.ariaLabel",
      "conversation.findings.selectAll.ariaLabel",
      "finding.comment.placeholder",
    ];
    for (const k of newKeys) {
      const idx = i18n.indexOf(`"${k}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });
});
