// R133 i18n polish: data-i18n-title and data-i18n-aria-label attributes in
// review.html must actually translate on language switch. R81 retro left this
// as an open carry-over (Other hardcoded English `title=` attributes in
// review.html). R133 wires `applyUITranslator` to also set `title=` and
// `aria-label=` from any matching registered key, and adds
// `initUIDataI18nAttributes` so attribute keys present at boot are
// auto-registered with a translator.

import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";

const KNOWN_TITLE_KEYS = [
  "toolbar.copyBranch.title",
  "saveIndicator.title",
  "toolbar.layout.unified.title",
  "toolbar.layout.split.title",
  "toolbar.ignoreWs.description",
  "toolbar.export.title",
  "submitReview.title",
  "sidebar.files.tooltip",
  "sidebar.commits.tooltip",
  "sidebar.conversation.tooltip",
  "sidebar.previously.tooltip",
  "sidebar.stats.tooltip",
  "sidebar.mode.tree.title",
  "sidebar.mode.flat.title",
  "conversation.filter.open.title",
  "conversation.filter.resolved.title",
  "conversation.filter.all.title",
  "conversation.filter.pinned.title",
  "conversation.filter.reacted.title",
  "conversation.sort.title",
  "previously.filter.title",
  "settings.virtualization.description",
];

const KNOWN_ARIA_KEYS = [
  "toolbar.ignoreWs.ariaLabel",
  "settings.btn.ariaLabel",
  "drawer.toggle.ariaLabel",
  "navbar.tabs.ariaLabel",
  "sidebar.resize.ariaLabel",
  "drawer.close.ariaLabel",
  "settings.close.ariaLabel",
];

const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R133 — data-i18n-title + data-i18n-aria-label wire-up", () => {
  it("i18n.ts: applyUITranslator writes [data-i18n-title] to attribute", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    expect(src).toMatch(/\[data-i18n-title="\$\{ecap\}"\]/);
  });

  it("i18n.ts: applyUITranslator writes [data-i18n-aria-label] to attribute", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    expect(src).toMatch(/\[data-i18n-aria-label="\$\{ecap\}"\]/);
  });

  it("i18n.ts: initUIDataI18nAttributes is exported and discovers both attribute types", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    expect(src).toMatch(
      /export function initUIDataI18nAttributes\([\s\S]*?data-i18n-title[\s\S]*?data-i18n-aria-label/s,
    );
  });

  it("i18n.ts: initUIDataI18nAttributes installs a MutationObserver filtered to those attributes", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    expect(src).toMatch(
      /attributeFilter:\s*\[\s*"data-i18n-title"\s*,\s*"data-i18n-aria-label"\s*\]/,
    );
  });

  it("app.ts: invokes initUIDataI18nAttributes right after applyLanguage", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const idx = src.indexOf("applyLanguage();");
    expect(idx).toBeGreaterThan(-1);
    const window = src.slice(idx, idx + 200);
    expect(window).toMatch(/initUIDataI18nAttributes\(\)/);
  });

  it("review.html: every known data-i18n-title key has a matching i18n key with zh-CN", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const key of KNOWN_TITLE_KEYS) {
      expect(html).toContain(`data-i18n-title="${key}"`);
      expect(i18n).toMatch(I18N_KEY_RE(key));
    }
  });

  it("review.html: every known data-i18n-aria-label key has a matching i18n key with zh-CN", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const key of KNOWN_ARIA_KEYS) {
      expect(html).toContain(`data-i18n-aria-label="${key}"`);
      expect(i18n).toMatch(I18N_KEY_RE(key));
    }
  });

  it("review.html: every data-i18n-title value resolves to an i18n entry (broad scan)", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const m of html.matchAll(/data-i18n-title="([^"]+)"/g)) {
      const key = m[1];
      if (!key) continue;
      expect(i18n).toMatch(I18N_KEY_RE(key));
    }
  });

  it("review.html: every data-i18n-aria-label value resolves to an i18n entry (broad scan)", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const m of html.matchAll(/data-i18n-aria-label="([^"]+)"/g)) {
      const key = m[1];
      if (!key) continue;
      expect(i18n).toMatch(I18N_KEY_RE(key));
    }
  });

  it("app.ts: dynamic deleteBtn setAttribute is wrapped in a registerUITranslator-style call", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/setAttribute\("data-i18n-title",\s*"search\.recent\.delete"\)/);
  });
});
