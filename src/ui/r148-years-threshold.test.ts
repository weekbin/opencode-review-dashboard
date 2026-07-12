import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";
const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R148 — add years threshold to formatRelativeTime (closes R142 retro #2 preventive)", () => {
  it("i18n.ts declares view.stats.locked.ago.years with en + zh-CN (en ≠ zh-CN)", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    expect(src).toMatch(I18N_KEY_RE("view.stats.locked.ago.years"));
    const line = src.split("\n").find((l) => l.includes('"view.stats.locked.ago.years"'));
    expect(line).toBeDefined();
    expect(line!).toContain("{n}y ago");
    expect(line!).toContain("{n}年前");
  });

  it("app.ts formatRelativeTime uses the 31_536_000_000 (365d) threshold for the years branch", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/31_536_000_000/);
    const block = src.match(/function\s+formatRelativeTime[\s\S]*?\n\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/< 31_536_000_000/);
    expect(block![0]).toContain('t("view.stats.locked.ago.years"');
    expect(block![0]).toContain("Math.floor(diff / 31_536_000_000)");
  });

  it("app.ts preserves the months branch for diffs in 30d-365d range", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const block = src.match(/function\s+formatRelativeTime[\s\S]*?\n\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/< 2_592_000_000/);
    expect(block![0]).toContain('t("view.stats.locked.ago.months"');
  });
});
