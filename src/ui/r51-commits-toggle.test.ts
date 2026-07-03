import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const APP_TS_PATH = "src/ui/app.ts";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R51 — commit-card-head has visible fold/unfold chevron", () => {
  it("review.html .commit-card-head CSS includes chevron styling", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    expect(html).toContain(".commit-card-chevron");
    expect(html).toContain(".commit-card-head[data-files-collapsed] .commit-card-chevron");
  });

  it("app.ts commit-card-head creation appends a chevron element", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/commit-card-chevron/);
    const chevronBlock = ts.match(/chevron\.className = "commit-card-chevron"/);
    expect(chevronBlock).not.toBeNull();
  });

  it("app.ts click handler toggles data-files-collapsed + aria-expanded on head", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toContain("data-files-collapsed");
    expect(ts).toContain("aria-expanded");
    const collapsePath = ts.match(/setAttribute\("data-files-collapsed", ""\)/);
    const expandPath = ts.match(/removeAttribute\("data-files-collapsed"\)/);
    expect(collapsePath).not.toBeNull();
    expect(expandPath).not.toBeNull();
  });

  it("head has role=button + tabindex=0 for keyboard accessibility", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toContain('head.setAttribute("role", "button")');
    expect(ts).toContain('head.setAttribute("tabindex", "0")');
  });

  it("i18n has commits.toggle.ariaLabel with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    // The string should be in the STRINGS table with both locales.
    const block = i18n.match(/"commits\.toggle\.ariaLabel":\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("en:");
    expect(block![0]).toContain('"zh-CN":');
    expect(block![0]).toContain("Toggle commit files");
    expect(block![0]).toContain("切换提交文件显示");
  });

  it("CHEVRON_SVG constant exists (reused from card-chevron pattern)", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/const CHEVRON_SVG/);
  });
});
