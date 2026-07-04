// R93: 9 hardcoded English strings in modals (reopen/resolve/wontfix) + cmdP footer + Saved template.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string; describe?: string }> = [
  // showReopenReasonModal
  { old: '"Force Reopen Finding"', key: "modal.reopen.title", describe: "h3 title" },
  {
    old: '"Why are you re-opening this finding? (Optional but helps the agent understand your intent.)"',
    key: "modal.reopen.body",
  },
  { old: '<button id="reopen-cancel" type="button">Cancel</button>', key: "modal.cancel" },
  {
    old: '<button id="reopen-submit" class="primary" type="button">Re-open</button>',
    key: "action.reopen",
  },
  // showResolveReasonModal
  { old: '"Resolve Finding"', key: "modal.resolve.title" },
  {
    old: '"Why are you resolving this finding? (Optional — helps the agent learn your intent.)"',
    key: "modal.resolve.body",
  },
  // showWontfixReasonModal
  { old: '"Mark as wontfix"', key: "modal.wontfix.title" },
  // cmdP footer
  { old: "jump</span>", key: "palette.cmdP.footer.jump" },
  { old: "navigate</span>", key: "palette.cmdP.footer.navigate" },
  { old: "close</span>", key: "palette.cmdP.footer.close" },
  // Saved template
  {
    old: "el.textContent = `Saved ${formatRelativeSeconds(elapsed)}`;",
    key: "save.indicator.saved",
  },
];

describe("R93 — 11 hardcoded English strings in modals + cmdP footer + Saved template", () => {
  it("all 11 hardcoded English strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 11 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      const escaped = site.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(app).toMatch(new RegExp(`t\\(["']${escaped}["']`));
    }
  });

  it("9 new STRINGS keys added to i18n.ts (modal.cancel/reopen already exist)", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    const newKeys = [
      "modal.reopen.body",
      "modal.resolve.body",
      "palette.cmdP.footer.jump",
      "palette.cmdP.footer.navigate",
      "palette.cmdP.footer.close",
      "save.indicator.saved",
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
