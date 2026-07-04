// R91: 4 remaining hardcoded English button textContent in app.ts (jump, mark as wontfix, resolve, remove)
// All 4 keys already exist from R87 (action.jump, action.mark, action.resolve, action.remove).

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";

const SITES: ReadonlyArray<{ old: string; key: string }> = [
  { old: 'jump.textContent = "Jump";', key: "action.jump" },
  { old: 'wontfixBtn.textContent = "Mark as wontfix";', key: "action.mark" },
  { old: 'resolve.textContent = "Resolve";', key: "action.resolve" },
  { old: 'remove.textContent = "Remove";', key: "action.remove" },
];

describe("R91 — 4 remaining hardcoded English button labels use t()", () => {
  it("all 4 hardcoded English button labels removed from app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).not.toContain(site.old);
    }
  });

  it("all 4 t() calls appear in app.ts", async () => {
    const app = await Bun.file(APP_TS).text();
    for (const site of SITES) {
      expect(app).toContain(`t("${site.key}")`);
    }
  });
});
