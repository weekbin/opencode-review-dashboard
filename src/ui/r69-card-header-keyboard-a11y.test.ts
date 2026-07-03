// R69 a11y: card-header divs in diff panel are click-only. Keyboard users can't
// collapse files. Same pattern as R59 (folder div) — needs role/tabindex/keydown.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R69 — card-header has keyboard a11y", () => {
  it("card-header div has role=button + tabindex=0 + aria-expanded", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    // Find the card-header creation in renderDiffPanel
    const block = ts.match(
      /const header = document\.createElement\("div"\);\s*header\.className = "card-header";[\s\S]*?header\.addEventListener\("click"/,
    );
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/header\.setAttribute\("role", "button"\)/);
    expect(block![0]).toMatch(/header\.setAttribute\("tabindex", "0"\)/);
    expect(block![0]).toMatch(/header\.setAttribute\("aria-expanded",/);
  });

  it("card-header has keydown handler for Enter/Space triggering click", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = ts.match(/header\.addEventListener\("keydown"[\s\S]*?\}\);/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain('e.key === "Enter"');
    expect(block![0]).toContain('e.key === " "');
    expect(block![0]).toContain("header.click()");
  });
});
