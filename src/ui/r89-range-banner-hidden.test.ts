// R163 #1: regression test for R162 #89 (range-banner always shown when empty).
// R162 added `.range-banner[hidden] { display: none; }` because the original
// `.range-banner { display: flex; ... }` rule overrode the HTML [hidden] attribute.
// Without this rule, an empty range banner renders as a collapsed yellow box.
//
// If a future refactor removes or weakens this rule, this test catches it.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const HTML_PATH = "src/ui/review.html";

function extractRangeBannerCss(html: string): string {
  const m = html.match(/\.range-banner\s*\{([\s\S]*?)\}/);
  if (!m || !m[1]) return "";
  return m[1];
}

function extractRangeBannerHiddenRule(html: string): string {
  const m = html.match(/\.range-banner\[hidden\]\s*\{([\s\S]*?)\}/);
  if (!m || !m[1]) return "";
  return m[1];
}

describe("R163 — R162 #89 range-banner hidden regression", () => {
  it("review.html declares the .range-banner block (R43 baseline)", () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const body = extractRangeBannerCss(html);
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("display: flex");
  });

  it("review.html declares .range-banner[hidden] { display: none } (R162 fix)", () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const rule = extractRangeBannerHiddenRule(html);
    expect(rule).toContain("display: none");
  });

  it(".range-banner[hidden] rule appears AFTER .range-banner (CSS specificity wins)", () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const mainIdx = html.indexOf(".range-banner {");
    const hiddenIdx = html.indexOf(".range-banner[hidden]");
    expect(mainIdx).toBeGreaterThan(-1);
    expect(hiddenIdx).toBeGreaterThan(mainIdx);
  });
});
