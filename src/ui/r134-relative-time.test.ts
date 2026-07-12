// R134 — relative timestamp on persistent lock banner.
// Closes the R132 retro risk-surface: state.locked.at is now rendered as a
// localized "3h ago" / "3小时前" string instead of being silently ignored.
// Implementation note: the local formatRelativeTime(ts) in src/ui/app.ts was
// extended in place rather than extracted into a new module — every existing
// call site (5 in conversation panel + 1 in lock banner) now gets bilingual
// output for free.

import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";
const REQUIRED_KEYS = [
  "view.stats.locked.ago.justNow",
  "view.stats.locked.ago.minutes",
  "view.stats.locked.ago.hours",
  "view.stats.locked.ago.days",
  "view.stats.locked.ago.months",
] as const;

const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R134 — relative timestamp on persistent lock banner", () => {
  it("i18n.ts declares all 5 relative-time keys with en + zh-CN", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    for (const key of REQUIRED_KEYS) {
      expect(src).toMatch(I18N_KEY_RE(key));
    }
  });

  it("app.ts extends formatRelativeTime to use the 5-threshold i18n ladder", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/function formatRelativeTime\(ts: number\): string/);
    for (const key of REQUIRED_KEYS) {
      expect(src).toContain(`t("${key}"`);
    }
  });

  it("app.ts appends formatRelativeTime(locked.at) inside the persistent lock banner", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const idx = src.indexOf("renderStatsPane");
    expect(idx).toBeGreaterThan(-1);
    const window = src.slice(idx, idx + 2500);
    expect(window).toMatch(/formatRelativeTime\(locked\.at\)/);
    expect(window).toMatch(/stats-lock-status-ago/);
  });

  it("app.ts no longer imports a duplicate formatRelativeTime from a separate module", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/import\s+\{\s*formatRelativeTime\s*\}\s+from\s+"\.\/relative-time"/);
  });

  it("i18n.ts uses {n} placeholder in the numeric relative-time keys", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const minutesBlock = src.match(/"view\.stats\.locked\.ago\.minutes":\s*\{[\s\S]*?\}/);
    expect(minutesBlock?.[0]).toContain("{n}");
  });

  it("the relative-time thresholds cover 60s / 60min / 24h / 30d boundaries", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/60_000/);
    expect(src).toMatch(/3_600_000/);
    expect(src).toMatch(/86_400_000/);
    expect(src).toMatch(/2_592_000_000/);
  });
});
