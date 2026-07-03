// R52 ignore-ws-loading: GH#73 #6 "Hide whitespace is slow + no loading indicator on toggle".
// Verifies the toggle shows a loading state via data-loading attribute + status text during re-render.

import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const APP_TS_PATH = "src/ui/app.ts";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R52 — ignore-whitespace toggle shows loading feedback", () => {
  it("review.html .ignore-whitespace-btn has data-loading CSS state with spinner", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    expect(html).toContain('.ignore-whitespace-btn[data-loading="true"]');
    expect(html).toMatch(/data-loading="true"[\s\S]*animation:\s*ignoreWsSpin/);
    expect(html).toContain("@keyframes ignoreWsSpin");
  });

  it("app.ts setIgnoreWhitespace sets data-loading before renderDiffPanel and clears after", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    // The setter must add data-loading and call setStatus before deferring renderDiffPanel
    const block = ts.match(/function setIgnoreWhitespace[\s\S]*?\n\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain('setAttribute("data-loading", "true")');
    expect(block![0]).toContain("setStatus");
    expect(block![0]).toContain("renderDiffPanel");
    expect(block![0]).toContain('removeAttribute("data-loading")');
    // Two requestAnimationFrame calls: outer to defer renderDiffPanel, inner to clear state
    const rafCount = (block![0].match(/requestAnimationFrame/g) || []).length;
    expect(rafCount).toBe(2);
  });

  it("i18n has toolbar.ignoreWs.loading in both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    const block = i18n.match(/"toolbar\.ignoreWs\.loading":\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("en:");
    expect(block![0]).toContain('"zh-CN":');
    expect(block![0]).toContain("Applying whitespace");
    expect(block![0]).toContain("正在应用空白变更");
  });
});
