// R140 — Tighten i18n fallbacks + adopt `data-i18n-title` for copyNotesBtn.
// Closes R137 retro stale flag (data-i18n-title for copyNotesBtn button) +
// localizes 4 hardcoded English fallback messages to zh-CN.

import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";
const REQUIRED_KEYS = [
  "resolve.reason.empty",
  "status.pinFailed",
  "status.unpinFailed",
  "status.reactionFailed",
] as const;

const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R140 — tighten i18n fallbacks + adopt data-i18n-title", () => {
  it("i18n.ts declares all 4 new keys with en + zh-CN", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    for (const key of REQUIRED_KEYS) {
      expect(src).toMatch(I18N_KEY_RE(key));
    }
  });

  it("app.ts wraps (no reason provided) with t('resolve.reason.empty')", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/"\(no reason provided\)"/);
    expect(src).toMatch(/closeWith\(trimmed \|\| t\("resolve\.reason\.empty"\)\)/);
  });

  it("app.ts uses t('status.pinFailed') / unpinFailed / reactionFailed for fallbacks", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/Failed to pin finding/);
    expect(src).not.toMatch(/Failed to unpin finding/);
    expect(src).not.toMatch(/Failed to toggle reaction/);
    expect(src).toMatch(/t\("status\.pinFailed"\)/);
    expect(src).toMatch(/t\("status\.unpinFailed"\)/);
    expect(src).toMatch(/t\("status\.reactionFailed"\)/);
  });

  it("copyNotesBtn uses data-i18n-title attribute (not direct title= assignment)", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(
      /copyNotesBtn\.setAttribute\("data-i18n-title", "previously\.notes\.copyButton"\)/,
    );
    expect(src).not.toMatch(/copyNotesBtn\.title\s*=/);
  });
});
