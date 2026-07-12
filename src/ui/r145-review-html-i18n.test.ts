import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const REVIEW_HTML_PATH = "src/ui/review.html";
const REQUIRED_KEYS = [
  "conversation.sort.newest",
  "conversation.sort.oldest",
  "conversation.sort.severity",
  "conversation.sort.file",
  "previously.paneTitle",
  "selection.empty",
  "selection.hint",
  "comment.placeholder",
] as const;

const I18N_KEY_RE_EN_ZH = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

async function readSource(path: string): Promise<string> {
  return Bun.file(path).text();
}

describe("R145 — localize 8 hardcoded English strings in review.html", () => {
  it("i18n.ts declares all 8 new keys with en + zh-CN (en ≠ zh-CN)", async () => {
    const src = await readSource(I18N_TS_PATH);
    for (const key of REQUIRED_KEYS) {
      expect(src).toMatch(I18N_KEY_RE_EN_ZH(key));
    }
  });

  it("review.html tags 4 sort <option>s with data-i18n keys", async () => {
    const src = await readSource(REVIEW_HTML_PATH);
    expect(src).toMatch(/<option value="newest" data-i18n="conversation\.sort\.newest">/);
    expect(src).toMatch(/<option value="oldest" data-i18n="conversation\.sort\.oldest">/);
    expect(src).toMatch(/<option value="severity" data-i18n="conversation\.sort\.severity">/);
    expect(src).toMatch(/<option value="file" data-i18n="conversation\.sort\.file">/);
  });

  it("review.html tags pane-title + selection + hint + textarea placeholder with data-i18n attrs", async () => {
    const src = await readSource(REVIEW_HTML_PATH);
    expect(src).toMatch(/data-i18n="previously\.paneTitle"/);
    expect(src).toMatch(/data-i18n="selection\.empty"/);
    expect(src).toMatch(/data-i18n="selection\.hint"/);
    expect(src).toMatch(/data-i18n-placeholder="comment\.placeholder"/);
  });

  it("the 7 hardcoded English literals no longer appear outside i18n.ts or their data-i18n attributes", async () => {
    const src = await readSource(REVIEW_HTML_PATH);
    const stripped = src
      .replace(/data-i18n="[^"]+">[^<]*</g, "")
      .replace(/data-i18n-placeholder="[^"]+"[^>]*>/g, "");
    expect(stripped).not.toMatch(/>Newest first</);
    expect(stripped).not.toMatch(/>Oldest first</);
    expect(stripped).not.toMatch(/>Severity \(high → low\)</);
    expect(stripped).not.toMatch(/>File path \(A.{1,3}Z\)</);
    expect(stripped).not.toMatch(/>Prior rounds — what you told the agent \+ how it replied</);
    expect(stripped).not.toMatch(/>Select lines in the diff to start\.</);
    expect(stripped).not.toMatch(/>Click a line number to start, click another to set range\.</);
  });
});
