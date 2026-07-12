import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";

describe("R150 — localize 2 hardcoded English strings in app.ts (L619 nav hint + L5358 prior rounds hint)", () => {
  it("i18n.ts declares navHint.navigate with en + zh-CN (en ≠ zh-CN)", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const enLine = src.split("\n").find((l) => l.includes('en: "Press <kbd>n</kbd>'));
    expect(enLine).toBeDefined();
    expect(enLine).toContain("navigate findings");
    const zhLine = src.split("\n").find((l) => l.includes('"zh-CN": "按 <kbd>n</kbd>'));
    expect(zhLine).toBeDefined();
    expect(zhLine).toContain("审查项间导航");
  });

  it("i18n.ts declares previously.panelHint with en + zh-CN + {prevRound} placeholder", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const enLine = src.split("\n").find((l) => l.includes("Showing prior rounds only"));
    expect(enLine).toBeDefined();
    expect(enLine).toContain("{prevRound}");
    const zhLine = src.split("\n").find((l) => l.includes("仅显示历史轮次"));
    expect(zhLine).toBeDefined();
    expect(zhLine).toContain("{prevRound}");
  });

  it("app.ts renders the nav hint via t('navHint.navigate') instead of hardcoded English", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const idx = src.indexOf("navHint.navigate");
    expect(idx).toBeGreaterThan(-1);
    const block = src.slice(idx - 40, idx + 60);
    expect(block).toContain('el.innerHTML = t("navHint.navigate")');
    expect(src).not.toMatch(/Press <kbd>n<\/kbd> \/ <kbd>p<\/kbd> to navigate findings/);
  });

  it("app.ts renders the prior rounds hint via t('previously.panelHint', { prevRound })", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const idx = src.indexOf("previously.panelHint");
    expect(idx).toBeGreaterThan(-1);
    const block = src.slice(idx - 60, idx + 80);
    expect(block).toContain('t("previously.panelHint"');
    expect(block).toContain("prevRound:");
    expect(src).not.toMatch(/Showing prior rounds only \(round \$\{currentRound/);
  });
});
