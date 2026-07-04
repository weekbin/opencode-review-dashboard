// R96: 4 resolve reason chip labels + 2 button labels (Cancel/Resolve) hardcoded English in app.ts.

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";
const I18N_TS = "src/ui/i18n.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: ">fixed in this round</button>", key: "resolve.reason.fixedInRound" },
  { old: ">no longer applies</button>", key: "resolve.reason.noLongerApplies" },
  { old: ">will fix in follow-up</button>", key: "resolve.reason.followUp" },
  { old: ">false alarm — keep the code</button>", key: "resolve.reason.falseAlarm" },
  { old: '<button id="resolve-cancel" type="button">Cancel</button>', key: "modal.cancel" },
  {
    old: '<button id="resolve-submit" class="primary" type="button">Resolve</button>',
    key: "action.resolve",
  },
];

describe("R96 — 4 resolve reason chip labels + 2 button labels use t()", () => {
  it("all 6 hardcoded English strings removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 6 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      const escaped = site.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(app).toMatch(new RegExp(`t\\(["']${escaped}["']`));
    }
  });

  it("4 new STRINGS keys added to i18n.ts (modal.cancel/action.resolve exist)", async () => {
    const i18n = await Bun.file(I18N_TS).text();
    const newKeys = [
      "resolve.reason.fixedInRound",
      "resolve.reason.noLongerApplies",
      "resolve.reason.followUp",
      "resolve.reason.falseAlarm",
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
