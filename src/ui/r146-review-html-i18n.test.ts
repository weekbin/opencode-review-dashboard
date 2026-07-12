import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const REVIEW_HTML_PATH = "src/ui/review.html";
const APP_TS_PATH = "src/ui/app.ts";

describe("R146 — localize previously-discussed 'All rounds' filter default", () => {
  it("i18n.ts declares previously.allRounds with en + zh-CN (en ≠ zh-CN)", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const block = src.match(/"previously\.allRounds":\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain('"All rounds"');
    expect(block![0]).toContain('"所有轮次"');
  });

  it("review.html annotates the <option value='all'> with data-i18n='previously.allRounds'", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    expect(html).toMatch(
      /<option\s+value="all"\s+data-i18n="previously\.allRounds">All rounds<\/option>/,
    );
  });

  it("app.ts registers registerUITranslator('previously.allRounds', ...) for AC1.2 invariant", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toContain(
      'registerUITranslator("previously.allRounds", () => t("previously.allRounds"))',
    );
  });
});
