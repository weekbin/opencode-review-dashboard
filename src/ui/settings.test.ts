import * as fsPromises from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const UI = join(import.meta.dir, "..", "..", "src", "ui");
const APP_TS = join(UI, "app.ts");
const HTML = join(UI, "review.html");
const I18N = join(UI, "i18n.ts");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC4.1 — settings button exists in header", () => {
  it("review.html contains #settings-btn with data-i18n=toolbar.settings", async () => {
    const html = await readSource(HTML);
    expect(html.includes('id="settings-btn"')).toBe(true);
    expect(html.includes('data-i18n="toolbar.settings"')).toBe(true);
  });

  it("settings button is inside the header-right element", async () => {
    const html = await readSource(HTML);
    const headerRightMatch = html.match(/<div class="header-right">([\s\S]*?)<\/div>\s*<\/header>/);
    expect(headerRightMatch).not.toBeNull();
    const content = headerRightMatch![1] ?? "";
    expect(content.includes("settings-btn")).toBe(true);
  });
});

describe("AC4.2 — modal has role=dialog + aria-modal=true", () => {
  it("settings modal markup has role=dialog and aria-modal=true", async () => {
    const html = await readSource(HTML);
    expect(html.includes('id="settings-modal"')).toBe(true);
    expect(html.includes('role="dialog"')).toBe(true);
    expect(html.includes('aria-modal="true"')).toBe(true);
  });

  it("settings overlay is a modal-overlay", async () => {
    const html = await readSource(HTML);
    expect(html.includes('id="settings-overlay"')).toBe(true);
    expect(html.includes('class="modal-overlay"')).toBe(true);
  });
});

describe("AC4.3 — focus trap installed via installModalA11y", () => {
  it("app.ts imports installModalA11y for settings modal", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/installModalA11y\(settingsModal/);
  });
});

describe("AC4.4 — Escape closes modal via installModalA11y", () => {
  it("openSettingsModal calls installModalA11y with closeSettingsModal as callback", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/installModalA11y\(settingsModal,\s*closeSettingsModal\)/);
  });

  it("closeSettingsModal hides the overlay and restores focus to settingsBtn", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsOverlay\.hidden\s*=\s*true/);
    expect(src).toMatch(/settingsBtn\.focus\(\)/);
  });
});

describe("AC4.5 — 4 sections render in settings modal", () => {
  it("modal contains 4 section elements with data-section attributes", async () => {
    const html = await readSource(HTML);
    const sections = ["appearance", "layout", "search", "language"];
    for (const s of sections) {
      expect(html.includes(`data-section="${s}"`)).toBe(true);
    }
  });

  it("each section has a translated h4 heading", async () => {
    const html = await readSource(HTML);
    expect(html.includes('data-i18n="settings.section.appearance"')).toBe(true);
    expect(html.includes('data-i18n="settings.section.layout"')).toBe(true);
    expect(html.includes('data-i18n="settings.section.search"')).toBe(true);
    expect(html.includes('data-i18n="settings.section.language"')).toBe(true);
  });
});

describe("AC4.6 — theme change persists in localStorage", () => {
  it("THEME_KEY constant is defined in app.ts", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/const THEME_KEY\s*=\s*"diff-review:theme-mode"/);
  });

  it("openSettingsModal populates theme select from state.themeMode", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsThemeSelect\.value\s*=\s*state\.themeMode/);
  });

  it("theme change handler calls setTheme with selected value", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsThemeSelect\?\.addEventListener\("change",\s*\(\)\s*=>\s*\{\s*setTheme\(/);
  });
});

describe("AC4.7 — layout change persists in localStorage", () => {
  it("LAYOUT_KEY constant is defined in app.ts", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/const LAYOUT_KEY\s*=\s*"diff-review:diff-layout"/);
  });

  it("openSettingsModal populates layout select from state.diffLayout", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsLayoutSelect\.value\s*=\s*state\.diffLayout/);
  });

  it("layout change handler calls setLayout with selected value", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsLayoutSelect\?\.addEventListener\("change",\s*\(\)\s*=>\s*\{\s*setLayout\(/);
  });
});

describe("AC4.8 — language change persists + UI re-renders", () => {
  it("setLanguage from i18n is called by language select handler", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsLanguageSelect\?\.addEventListener\("change",\s*\(\)\s*=>\s*\{\s*setLanguage\(/);
  });

  it("openSettingsModal populates language select from peekLanguage()", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsLanguageSelect\.value\s*=\s*peekLanguage\(\)/);
  });

  it("language change handler calls setLanguage with selected value", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/settingsLanguageSelect\?\.addEventListener\("change",\s*\(\)\s*=>\s*\{\s*setLanguage\(/);
  });
});

describe("AC4.9 — Reset to defaults button restores all 6 keys", () => {
  it("resetSettings function is defined in app.ts", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function resetSettings\(\)/);
  });

  it("resetSettings calls setTheme with 'light'", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resetSettings[\s\S]{0,200}setTheme\("light"\)/);
  });

  it("resetSettings calls setLayout with 'split'", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resetSettings[\s\S]{0,200}setLayout\("split"\)/);
  });

  it("resetSettings calls setLanguage with 'en'", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resetSettings[\s\S]{0,200}setLanguage\("en"\)/);
  });

  it("resetSettings calls setIgnoreWhitespace with false", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resetSettings[\s\S]{0,200}setIgnoreWhitespace\(false\)/);
  });

  it("resetSettings calls setFilterUnread with false", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resetSettings[\s\S]{0,200}setFilterUnread\(false\)/);
  });

  it("resetSettings removes SEARCH_HISTORY_MAX_KEY from localStorage", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resetSettings[\s\S]{0,200}localStorage\.removeItem\(SEARCH_HISTORY_MAX_KEY\)/);
  });

  it("SEARCH_HISTORY_MAX_KEY constant is defined", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/SEARCH_HISTORY_MAX_KEY\s*=\s*"diff-review:search-history-max"/);
  });
});

describe("i18n coverage — all 15 settings keys have both en + zh-CN translations", () => {
  const keys = [
    "toolbar.settings",
    "settings.title",
    "settings.section.appearance",
    "settings.section.layout",
    "settings.section.search",
    "settings.section.language",
    "settings.theme.label",
    "settings.theme.light",
    "settings.theme.auto",
    "settings.theme.dark",
    "settings.layout.label",
    "settings.layout.unified",
    "settings.layout.split",
    "settings.search.max",
    "settings.reset",
  ];

  for (const key of keys) {
    it(`${key} has both en and zh-CN in STRINGS table`, async () => {
      const i18n = await readSource(I18N);
      const enRe = new RegExp(`"${key}"\\s*:\\s*\\{\\s*en:\\s*"[^"]+"`, "g");
      const zhRe = new RegExp(`"${key}"\\s*:\\s*\\{[\\s\\S]*?"zh-CN":\\s*"[^"]+"`, "g");
      expect(enRe.test(i18n)).toBe(true);
      expect(zhRe.test(i18n)).toBe(true);
    });
  }
});
