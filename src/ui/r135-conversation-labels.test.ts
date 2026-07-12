// R135 — localize hardcoded English labels in conversation / previously panels.
// Closes the R134 retro "Risks Surfaced" item: pinned-badge tooltip,
// comment author labels, and empty-notes placeholder were staying English on
// zh-CN locale despite the R134 relative-timestamp fix already making the
// surrounding timestamps bilingual.

import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";
const REQUIRED_KEYS = [
  "finding.pinned.tooltip",
  "comment.author.agent",
  "comment.author.user",
  "previously.notes.empty",
] as const;

const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R135 — localize hardcoded English labels in conversation panel", () => {
  it("i18n.ts declares all 4 new keys with en + zh-CN", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    for (const key of REQUIRED_KEYS) {
      expect(src).toMatch(I18N_KEY_RE(key));
    }
  });

  it("finding.pinned.tooltip uses {ago} placeholder for relative time", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const block = src.match(/"finding\.pinned\.tooltip":\s*\{[\s\S]*?\}/);
    expect(block?.[0]).toContain("{ago}");
  });

  it("comment.author.user zh-CN value is 🧑 你 (not 🧑 You)", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const block = src.match(/"comment\.author\.user":\s*\{[\s\S]*?\}/);
    expect(block?.[0]).toContain('"zh-CN": "🧑 你"');
  });

  it("app.ts renders the pinned-badge tooltip via t('finding.pinned.tooltip')", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/t\("finding\.pinned\.tooltip"/);
    expect(src).not.toMatch(/`Pinned for revisit \(/);
  });

  it("app.ts uses t('comment.author.agent') and t('comment.author.user') in both panels", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/t\("comment\.author\.agent"\)/);
    expect(src).toMatch(/t\("comment\.author\.user"\)/);
    // Two call sites each (Conversation panel + Previously panel)
    expect(src.match(/t\("comment\.author\.agent"\)/g)?.length).toBeGreaterThanOrEqual(2);
    expect(src.match(/t\("comment\.author\.user"\)/g)?.length).toBeGreaterThanOrEqual(2);
    // No remaining hardcoded "🤖 Agent" or "🧑 You" string literals
    expect(src).not.toMatch(/"🤖 Agent"/);
    expect(src).not.toMatch(/"🧑 You"/);
  });

  it("app.ts renders the empty-notes placeholder via t('previously.notes.empty')", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/t\("previously\.notes\.empty"\)/);
    expect(src).not.toMatch(/textContent = "\(no notes sent this round\)"/);
  });
});
