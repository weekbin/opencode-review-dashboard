// R92: 10 hardcoded English setStatus messages in app.ts replaced with t() calls.
// 2 keys (status.commentRequired, status.selectLines) already exist from R79.
// 8 new keys needed.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const NEW_SITES: ReadonlyArray<{ old: string; key: string }> = [
  {
    old: '"Comment box is empty — write the template body first", true',
    key: "status.commentBoxEmpty",
  },
  { old: '"Finding edited"', key: "status.findingEdited" },
  { old: '"Pinned — will revisit this finding"', key: "status.pinned" },
  { old: '"Unpinned"', key: "status.unpinned" },
  { old: '"Failed to save draft", true', key: "status.draftSaveFailed" },
  { old: '"Submitting review..."', key: "status.submitting" },
  { old: '"Submit failed: request was interrupted", true', key: "status.submitInterrupted" },
  { old: '"Invalid review URL", true', key: "status.invalidReviewUrl" },
];

const EXISTING_SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: '"Comment is required", true', key: "status.commentRequired" },
  { old: '"Select lines before adding a finding", true', key: "status.selectLines" },
];

const ALL_SITES = [...NEW_SITES, ...EXISTING_SITES];

describe("R92 — 10 hardcoded setStatus messages use t()", () => {
  it("all 10 hardcoded English setStatus strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of ALL_SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 10 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of ALL_SITES) {
      expect(app).toContain(`t("${site.key}")`);
    }
  });

  it("8 new STRINGS keys added to i18n.ts (status.commentRequired/selectLines exist)", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    for (const site of NEW_SITES) {
      const idx = i18n.indexOf(`"${site.key}":`);
      expect(idx).toBeGreaterThan(0);
      const block = i18n.substring(idx, idx + 300);
      expect(block).toMatch(/en:\s*"[^"]+"/);
      expect(block).toMatch(/"zh-CN":\s*"[^"]+"/);
    }
  });
});
