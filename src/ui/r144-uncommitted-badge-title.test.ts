// R144 — close R143 retro #3 (source-side audit + localize).
// Closes the last remaining hardcoded English user-facing string in
// src/ui/app.ts:5696 — the uncommittedBadge tooltip shown when a file
// has working-tree changes not in the diff base.

import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";

const I18N_KEY_RE_EN_ZH = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R144 — localize uncommittedBadge.title", () => {
  it("i18n.ts declares file.uncommitted.title with en + zh-CN (en ≠ zh-CN)", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    expect(src).toMatch(I18N_KEY_RE_EN_ZH("file.uncommitted.title"));
    const block = src.match(/"file\.uncommitted\.title":\s*\{[\s\S]*?\}/);
    expect(block?.[0]).toContain('"Working-tree only (not in diff base)"');
    expect(block?.[0]).toContain('"仅在工作区中（不在 diff 基线中）"');
  });

  it("app.ts renders uncommittedBadge.title via t('file.uncommitted.title') instead of hardcoded English", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const idx = src.indexOf("uncommittedBadge.title");
    expect(idx).toBeGreaterThan(-1);
    const block = src.slice(idx, idx + 120);
    expect(block).toMatch(/t\("file\.uncommitted\.title"\)/);
  });

  it("the hardcoded English string is no longer present anywhere in src/ui/app.ts", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/"Working-tree only \(not in diff base\)"/);
  });
});
