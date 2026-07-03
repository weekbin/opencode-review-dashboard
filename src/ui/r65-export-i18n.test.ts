// R65 export button i18n: hardcoded English title="Export review as Markdown or patch"
// → data-i18n-title="toolbar.export.title"
import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R65 — export button uses data-i18n-title for toolbar.export.title", () => {
  it("export button has no hardcoded title attribute", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const block = html.match(/<button[^>]*id="export"[^>]*>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/title="Export review as Markdown or patch"/);
  });

  it("export button uses data-i18n-title='toolbar.export.title'", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const block = html.match(/<button[^>]*id="export"[^>]*>/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/data-i18n-title="toolbar\.export\.title"/);
  });

  it("i18n has toolbar.export.title with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    const block = i18n.match(/"toolbar\.export\.title":\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("en:");
    expect(block![0]).toContain('"zh-CN":');
  });
});
