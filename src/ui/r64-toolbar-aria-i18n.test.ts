// R64 toolbar a11y i18n: copy-branch button + settings-btn still have hardcoded
// English title/aria-label. Replace with data-i18n-* attributes.

import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R64 — copy-branch + settings-btn use i18n for title/aria-label", () => {
  it("copy-branch button uses data-i18n-title for toolbar.copyBranch.title", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const block = html.match(/<button[^>]*id="copy-branch"[^>]*>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/title="Copy current branch/);
    expect(block![0]).toMatch(/data-i18n-title="toolbar\.copyBranch\.title"/);
  });

  it("settings-btn uses data-i18n-aria-label for settings.btn.ariaLabel", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const block = html.match(/<button[^>]*id="settings-btn"[^>]*>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/aria-label="Settings"/);
    expect(block![0]).toMatch(/data-i18n-aria-label="settings\.btn\.ariaLabel"/);
  });

  it("i18n has toolbar.copyBranch.title + settings.btn.ariaLabel with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const key of ["toolbar.copyBranch.title", "settings.btn.ariaLabel"]) {
      const block = i18n.match(new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?\\}`));
      expect(block).not.toBeNull();
      expect(block![0]).toContain("en:");
      expect(block![0]).toContain('"zh-CN":');
    }
  });
});
