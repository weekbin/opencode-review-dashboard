// R57 diff-search-i18n: diff search input + nav buttons had hardcoded English
// strings (placeholder, aria-label, title attributes). Refactor to i18n so
// zh-CN users see translated labels.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R57 — diff search input/buttons use i18n keys", () => {
  it("app.ts openDiffSearch no longer contains hardcoded English 'Find in diffs' placeholder", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const openFn = ts.match(
      /function openDiffSearch[\s\S]*?document\.body\.appendChild\(overlay\)/,
    );
    expect(openFn).not.toBeNull();
    expect(openFn![0]).not.toMatch(/placeholder="Find in diffs \(case-insensitive substring\)"/);
    expect(openFn![0]).toMatch(/search\.diff\.placeholder/);
  });

  it("app.ts openDiffSearch uses t() for input aria-label and button titles", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const openFn = ts.match(
      /function openDiffSearch[\s\S]*?document\.body\.appendChild\(overlay\)/,
    );
    expect(openFn).not.toBeNull();
    expect(openFn![0]).toMatch(/aria-label="\$\{escapeHtml\(t\("search\.diff\.ariaLabel"\)\)\}"/);
    expect(openFn![0]).toMatch(/title="\$\{escapeHtml\(t\("search\.diff\.previous"\)\)\}"/);
    expect(openFn![0]).toMatch(/title="\$\{escapeHtml\(t\("search\.diff\.next"\)\)\}"/);
    expect(openFn![0]).toMatch(/title="\$\{escapeHtml\(t\("search\.diff\.close"\)\)\}"/);
  });

  it("i18n has 5 new search.diff.* keys with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const key of [
      "search.diff.placeholder",
      "search.diff.ariaLabel",
      "search.diff.previous",
      "search.diff.next",
      "search.diff.close",
    ]) {
      const block = i18n.match(new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?\\}`));
      expect(block).not.toBeNull();
      expect(block![0]).toContain("en:");
      expect(block![0]).toContain('"zh-CN":');
    }
  });
});
