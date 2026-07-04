// R101: 7 final hardcoded English strings — button title attributes + setStatus error fallbacks.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  {
    old: 'wontfixBtn.title = "Mark this finding as wontfix / out_of_scope / false_positive / duplicate (R13 #21)";',
    key: "action.mark.title",
  },
  {
    old: 'editBtn.title = "Edit category / severity / comment in-place";',
    key: "action.edit.title",
  },
  { old: 'addFileBtn.title = "Add file-level finding";', key: "action.addFile.title" },
  {
    old: 'setStatus(result.error ?? "Failed to save template", true);',
    key: "status.templateSaveFailed",
  },
  {
    old: 'setStatus(data?.error ?? "Failed to resolve finding", true);',
    key: "status.resolveFailed",
  },
  {
    old: 'setStatus(data?.error ?? "Cannot reopen (code may have changed)", true);',
    key: "status.reopenFailed",
  },
  { old: 'setStatus(data?.error ?? "Failed to edit finding", true);', key: "status.editFailed" },
  { old: '"Pin this finding to revisit it later"', key: "action.pin.title" },
  {
    old: '"Copy finding as a Markdown snippet (round, file:line, permalink, comment, audit count, reactions)"',
    key: "action.copyMarkdown.title",
  },
  {
    old: '"Finding force-reopened — will be re-applied in the next round"',
    key: "status.findingForceReopened",
  },
];

describe("R101 — 10 final hardcoded English strings use t()", () => {
  it("all 10 hardcoded English strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("10 new STRINGS keys added to i18n.ts with en + zh-CN", async () => {
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
