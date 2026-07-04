// R81 i18n: 4 navbar tab title attributes in review.html:3298-3318 still hardcoded
// English. Parent <button> has data-i18n-title pattern (data-i18n-title="...").
// Existing i18n.ts infrastructure (R57+) wires data-i18n-title via
// registerUITranslator pipeline. Span text inside the button is already
// i18n'd via data-i18n="sidebar.X" — only the parent title="..." is missing.

import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R81 — navbar tab title attributes use i18n", () => {
  it("all 4 navbar tab buttons have data-i18n-title attribute", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const nav = html.match(/<nav[\s\S]*?class="navbar-tabs"[\s\S]*?<\/nav>/);
    expect(nav).not.toBeNull();
    expect(nav![0]).toMatch(/data-tab="files"[\s\S]*?data-i18n-title=/);
    expect(nav![0]).toMatch(/data-tab="commits"[\s\S]*?data-i18n-title=/);
    expect(nav![0]).toMatch(/data-tab="conversation"[\s\S]*?data-i18n-title=/);
    expect(nav![0]).toMatch(/data-tab="previously"[\s\S]*?data-i18n-title=/);
  });

  it("navbar tab buttons have NO hardcoded English title", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const nav = html.match(/<nav[\s\S]*?class="navbar-tabs"[\s\S]*?<\/nav>/);
    expect(nav).not.toBeNull();
    expect(nav![0]).not.toMatch(/title="Files changed"/);
    expect(nav![0]).not.toMatch(/title="Commits in this review"/);
    expect(nav![0]).not.toMatch(/title="Conversation \(all findings\)"/);
    expect(nav![0]).not.toMatch(/title="Previously discussed/);
  });

  it("i18n.ts has 4 sidebar.*.tooltip keys with en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const key of [
      "sidebar.files.tooltip",
      "sidebar.commits.tooltip",
      "sidebar.conversation.tooltip",
      "sidebar.previously.tooltip",
    ]) {
      const re = new RegExp(
        `"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`,
      );
      expect(i18n).toMatch(re);
    }
  });

  it("data-i18n-title references in review.html have matching i18n keys", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const i18n = await Bun.file(I18N_TS_PATH).text();
    for (const match of html.matchAll(/data-i18n-title="([^"]+)"/g)) {
      const key = match[1];
      if (!key) continue;
      // Allow dynamic keys (placeholder convention)
      if (key.includes(".")) {
        const re = new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{`);
        expect(i18n).toMatch(re);
      }
    }
  });
});
