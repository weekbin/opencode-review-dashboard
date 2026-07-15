// R163 #2: regression test for R162 #90 (tree/flat toggle button too tall).
// R162 reduced padding 5px→3px and font-size 14px→13px so the buttons visually
// match the height of adjacent file-row entries. Without this test, a future
// CSS edit could regress the height mismatch.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const HTML_PATH = "src/ui/review.html";

function extractSidebarModeButtonCss(html: string): string {
  const m = html.match(/\.sidebar-mode\s+button\s*\{([\s\S]*?)\}/);
  if (!m || !m[1]) return "";
  return m[1];
}

describe("R163 — R162 #90 sidebar-mode button height regression", () => {
  it("review.html declares the .sidebar-mode button block", () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const body = extractSidebarModeButtonCss(html);
    expect(body.length).toBeGreaterThan(20);
  });

  it("padding is 3px (not the pre-R162 5px)", () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const body = extractSidebarModeButtonCss(html);
    expect(body).toMatch(/padding:\s*3px\s+10px/);
  });

  it("font-size is 13px (not the pre-R162 14px)", () => {
    const html = readFileSync(HTML_PATH, "utf-8");
    const body = extractSidebarModeButtonCss(html);
    expect(body).toMatch(/font-size:\s*13px/);
  });
});
