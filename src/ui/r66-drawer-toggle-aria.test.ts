// R66 drawer-toggle a11y: drawer-toggle has visible "Review" text but no aria-label.
// Screen readers may announce the count but not the button purpose.
// Add data-i18n-aria-label for "Open review drawer".

import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R66 — drawer-toggle has aria-label for screen readers", () => {
  it("drawer-toggle button uses data-i18n-aria-label", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const idx = html.indexOf('id="drawer-toggle"');
    expect(idx).toBeGreaterThan(0);
    const startIdx = html.lastIndexOf("<button", idx);
    const endIdx = html.indexOf(">", idx);
    const openingTag = html.substring(startIdx, endIdx + 1);
    expect(openingTag.includes("data-i18n-aria-label=")).toBe(true);
    expect(openingTag).toMatch(/data-i18n-aria-label="drawer\.toggle\.ariaLabel"/);
  });

  it("i18n has drawer.toggle.ariaLabel with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    const match = i18n.match(/"drawer\.toggle\.ariaLabel":\s*\{[\s\S]*?\}/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain("en:");
    expect(match![0]).toContain('"zh-CN":');
  });
});
