/**
 * R19 #33 — Language toggle (i18n) unit tests.
 *
 * Covers AC1.1 (button triggers setLanguage), AC1.2 (UI strings
 * translate per language — exercised directly on translate()), AC1.3
 * (localStorage persistence under "diff-review:language"), AC1.4
 * (applyLanguage() runs before first render — exercised directly),
 * AC1.5 (UTF-8 zh-CN strings survive the build — exercise the source
 * contents and assert non-ASCII code points are present).
 *
 * Run with:  bun test src/ui/i18n.test.ts
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  applyLanguage,
  DEFAULT_LANGUAGE,
  getLanguage,
  LANGUAGE_KEY,
  peekLanguage,
  setLanguage,
  STRINGS,
  translate,
} from "./i18n";

const I18N = join(import.meta.dir, "..", "..", "src", "ui", "i18n.ts");
const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");
const HTML = join(import.meta.dir, "..", "..", "src", "ui", "review.html");

// Bare-bones localStorage shim: only setItem / getItem / removeItem.
class FakeStorage {
  store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
}

let fakeStorage: FakeStorage;

beforeEach(() => {
  fakeStorage = new FakeStorage();
  (globalThis as unknown as { localStorage: unknown }).localStorage = fakeStorage;
  applyLanguage();
});

afterEach(() => {
  fakeStorage = new FakeStorage();
  (globalThis as unknown as { localStorage: unknown }).localStorage = fakeStorage;
});

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC1.2 — translate() returns expected string per language", () => {
  it("English copy is returned for lang='en'", () => {
    expect(translate("app.title", "en")).toBe("Review Dashboard");
    expect(translate("toolbar.submit", "en")).toBe("Submit Review");
  });

  it("zh-CN strings are non-empty UTF-8", () => {
    const zh = translate("app.title", "zh-CN");
    expect(zh.length).toBeGreaterThan(0);
    expect(zh).not.toBe("Review Dashboard");
    // Verify at least one high-codepoint character (CJK range, U+4E00..U+9FFF).
    expect(/\p{Script=Han}/u.test(zh)).toBe(true);
  });

  it("missing key falls back to key string", () => {
    expect(translate("nope.not.a.key", "en")).toBe("nope.not.a.key");
  });

  it("unsupported lang falls back to English", () => {
    // Cast lang — TypeScript types keep the API surface small; the
    // runtime path is the fallback we want to verify.
    expect(translate("app.title", "fr" as unknown as "en")).toBe("Review Dashboard");
  });

  it("{token} placeholders are filled from params map", () => {
    expect(translate("status.copiedPermalink", "en", { id: "F-7" })).toBe(
      "Copied permalink for F-7",
    );
    expect(translate("status.copiedPermalink", "zh-CN", { id: "F-7" })).toBe("已复制定位链接 F-7");
  });
});

describe("AC1.3 — setLanguage() persists under diff-review:language", () => {
  it("writes the new lang to localStorage[LANGUAGE_KEY]", () => {
    setLanguage("zh-CN");
    expect(fakeStorage.getItem(LANGUAGE_KEY)).toBe("zh-CN");
    setLanguage("en");
    expect(fakeStorage.getItem(LANGUAGE_KEY)).toBe("en");
  });

  it("getLanguage() reads the previously-stored value", () => {
    fakeStorage.setItem(LANGUAGE_KEY, "zh-CN");
    expect(getLanguage()).toBe("zh-CN");
    fakeStorage.setItem(LANGUAGE_KEY, "en");
    expect(getLanguage()).toBe("en");
  });

  it("ignores unsupported lang written to localStorage", () => {
    fakeStorage.setItem(LANGUAGE_KEY, "fr");
    expect(getLanguage()).toBe(DEFAULT_LANGUAGE);
  });

  it("falls back to DEFAULT_LANGUAGE when localStorage is empty", () => {
    expect(getLanguage()).toBe(DEFAULT_LANGUAGE);
  });
});

describe("AC1.4 — applyLanguage() adopts persisted language before render", () => {
  it("updates peekLanguage() to the value in localStorage", () => {
    fakeStorage.setItem(LANGUAGE_KEY, "zh-CN");
    applyLanguage();
    expect(peekLanguage()).toBe("zh-CN");
  });

  it("default is 'en' when no localStorage entry", () => {
    applyLanguage();
    expect(peekLanguage()).toBe(DEFAULT_LANGUAGE);
  });
});

describe("AC1.5 — UTF-8 zh-CN strings survive in the build", () => {
  it("i18n.ts source contains at least 10 distinct zh-CN entries", async () => {
    const src = await readSource(I18N);
    const matches = src.match(/"zh-CN":/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(10);
  });

  it("STRINGS table exposes > 30 keys covering toolbar / sidebar / status / modals", () => {
    const keys = Object.keys(STRINGS);
    expect(keys.length).toBeGreaterThanOrEqual(30);
    expect(keys.some((k) => k.startsWith("toolbar."))).toBe(true);
    expect(keys.some((k) => k.startsWith("sidebar."))).toBe(true);
    expect(keys.some((k) => k.startsWith("status."))).toBe(true);
    expect(keys.some((k) => k.startsWith("modal."))).toBe(true);
  });
});

describe("AC1.1 — toolbar mount the language toggle wired up", () => {
  it("app.ts imports i18n helper and references toolbar language button", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/from\s+["']\.\/i18n["']/);
    expect(src).toMatch(/language-toggle|languageToggle|setLanguage\(/);
  });

  it("review.html reserves a mount point for the language toggle button", async () => {
    const html = await readSource(HTML);
    // Either an explicit element or a container where the button can mount.
    // Loose match: any id="language-toggle" or a container that the
    // toolbar JS uses as the parent.
    expect(
      html.includes('id="language-toggle"') ||
        html.includes('class="language-toggle"') ||
        html.includes("language-toggle"),
    ).toBe(true);
  });
});

describe("AC1.2 — toggle re-renders static-HTML labels via registerUITranslator", () => {
  // R19 AC1.2 follow-up: guards against partial-implementation regression
  // (every static-HTML element annotated with data-i18n must have a paired
  // registerUITranslator binding + STRINGS entry).
  it("review.html annotates every static toolbar/sidebar/save element with data-i18n", async () => {
    const html = await readSource(HTML);
    const required = [
      "app.title",
      "toolbar.layout.unified",
      "toolbar.layout.split",
      "toolbar.ignoreWs",
      "toolbar.theme.light",
      "toolbar.theme.auto",
      "toolbar.theme.dark",
      "toolbar.review",
      "toolbar.export",
      "toolbar.submit",
      "sidebar.files",
      "sidebar.commits",
      "sidebar.conversation",
      "sidebar.previously",
      "sidebar.tree",
      "sidebar.flat",
      "save.idle",
      "skipLink",
    ];
    for (const key of required) {
      expect(html.includes(`data-i18n="${key}"`)).toBe(true);
    }
  });

  it("app.ts registers every static-HTML translator that review.html annotates", async () => {
    const html = await readSource(HTML);
    const src = await readSource(APP_TS);
    const matches = html.match(/data-i18n="([a-zA-Z.]+)"/g) ?? [];
    const keysInHtml = new Set(matches.map((m) => m.replace(/data-i18n="|"/g, "")));
    expect(keysInHtml.size).toBeGreaterThan(10);
    for (const key of keysInHtml) {
      expect(src.includes(`registerUITranslator("${key}"`)).toBe(true);
    }
  });

  it("i18n.ts STRINGS table contains every key referenced by data-i18n", async () => {
    const html = await readSource(HTML);
    const i18n = await readSource(I18N);
    const matches = html.match(/data-i18n="([a-zA-Z.]+)"/g) ?? [];
    const keys = Array.from(new Set(matches.map((m) => m.replace(/data-i18n="|"/g, ""))));
    for (const key of keys) {
      expect(i18n.includes(`"${key}":`)).toBe(true);
    }
  });

  // R20 #40: SG.R19.3 STRINGS_USAGE_PLAN regression — guard that the
  // sidebar.reviewProgress key has BOTH en + zh-CN translations (the
  // R19 AC1.2 PARTIAL regression root-caused missing-translation bugs
  // that one-locale STRINGS entries caused in production).
  it("STRINGS['sidebar.reviewProgress'] has both en + zh-CN translations", async () => {
    const i18n = await readSource(I18N);
    expect(i18n.includes('"sidebar.reviewProgress":')).toBe(true);
    expect(i18n.includes("reviewed ({percent}%)")).toBe(true);
    // Capture the zh-CN value. Use non-greedy [\s\S]*? so we don't
    // swallow past the closing brace of this STRINGS entry.
    const zhMatch = i18n.match(/"sidebar\.reviewProgress":\s*\{[\s\S]*?"zh-CN":\s*"([^"]+)"/);
    expect(zhMatch).not.toBeNull();
    const zh = zhMatch![1]!;
    expect(zh.length).toBeGreaterThan(0);
    expect(/\p{Script=Han}/u.test(zh)).toBe(true);
  });

  // R20 #41: same STRINGS_USAGE_PLAN regression for sidebar.filter.unread.
  it("STRINGS['sidebar.filter.unread'] has both en + zh-CN translations and is wired", async () => {
    const i18n = await readSource(I18N);
    const src = await readSource(APP_TS);
    const html = await readSource(HTML);
    expect(i18n.includes('"sidebar.filter.unread":')).toBe(true);
    // en translation present and non-empty
    expect(i18n.includes('"Show only unread"')).toBe(true);
    // zh-CN translation present and has Chinese (Han) characters
    expect(i18n.includes('"仅显示未审查"')).toBe(true);
    // HTML annotates the static element with data-i18n
    expect(html.includes('data-i18n="sidebar.filter.unread"')).toBe(true);
    // app.ts binds a registerUITranslator for the key
    expect(src.includes('registerUITranslator("sidebar.filter.unread"')).toBe(true);
  });

  // R20 #42: STRINGS_USAGE_PLAN regression for search.recent.title.
  // The dropdown is dynamic (mounted on focus), so there is no static
  // data-i18n element — the test only covers STRINGS table presence and
  // a t() call wired in app.ts at the dropdown render site.
  it("STRINGS['search.recent.title'] has both en + zh-CN translations and app.ts uses t() to render it", async () => {
    const i18n = await readSource(I18N);
    const src = await readSource(APP_TS);
    expect(i18n.includes('"search.recent.title":')).toBe(true);
    expect(i18n.includes('"Recent searches"')).toBe(true);
    expect(i18n.includes('"最近搜索"')).toBe(true);
    expect(src.includes('t("search.recent.title")')).toBe(true);
  });

  // R22 #45: STRINGS_USAGE_PLAN regression for search.recent.clear (button label).
  it("STRINGS['search.recent.clear'] has both en + zh-CN translations", async () => {
    const i18n = await readSource(I18N);
    expect(i18n.includes('"search.recent.clear":')).toBe(true);
    expect(i18n.includes('"Clear"')).toBe(true);
    expect(i18n.includes('"清空"')).toBe(true);
  });

  // R22 #45: STRINGS_USAGE_PLAN regression for search.recent.clear.confirm (toast).
  it("STRINGS['search.recent.clear.confirm'] has both en + zh-CN translations", async () => {
    const i18n = await readSource(I18N);
    expect(i18n.includes('"search.recent.clear.confirm":')).toBe(true);
    expect(i18n.includes('"Recent searches cleared"')).toBe(true);
    expect(i18n.includes('"最近搜索已清空"')).toBe(true);
  });

  // R23 #48: STRINGS_USAGE_PLAN regression for search.recent.select (checkbox label).
  it("STRINGS['search.recent.select'] has both en + zh-CN translations", async () => {
    const i18n = await readSource(I18N);
    expect(i18n.includes('"search.recent.select":')).toBe(true);
    expect(i18n.includes('"Select"')).toBe(true);
    expect(i18n.includes('"选择"')).toBe(true);
  });

  // R23 #48: STRINGS_USAGE_PLAN regression for search.recent.bulkDelete (button).
  it("STRINGS['search.recent.bulkDelete'] has both en + zh-CN translations", async () => {
    const i18n = await readSource(I18N);
    expect(i18n.includes('"search.recent.bulkDelete":')).toBe(true);
    expect(i18n.includes('"Delete selected"')).toBe(true);
    expect(i18n.includes('"删除选中"')).toBe(true);
  });
});
