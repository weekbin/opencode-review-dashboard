// R59 a11y: sidebar folder divs were click-only (no keyboard equivalent).
// Keyboard users couldn't collapse/expand folders via Enter/Space.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R59 — sidebar folder has keyboard a11y", () => {
  it("folder div has role=button + tabindex=0 + aria-expanded", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const folderBlock = ts.match(
      /const folder = document\.createElement\("div"\)[\s\S]*?folder\.setAttribute\("aria-expanded", collapsed \? "false" : "true"\)/,
    );
    expect(folderBlock).not.toBeNull();
    expect(folderBlock![0]).toContain('folder.setAttribute("role", "button")');
    expect(folderBlock![0]).toContain('folder.setAttribute("tabindex", "0")');
    expect(folderBlock![0]).toContain(
      'folder.setAttribute("aria-expanded", collapsed ? "false" : "true")',
    );
  });

  it("folder has keydown handler for Enter/Space triggering click", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const keydownBlock = ts.match(/folder\.addEventListener\("keydown"[\s\S]*?\}\);/);
    expect(keydownBlock).not.toBeNull();
    expect(keydownBlock![0]).toContain('e.key === "Enter"');
    expect(keydownBlock![0]).toContain('e.key === " "');
    expect(keydownBlock![0]).toContain("folder.click()");
  });

  it("folder click handler updates aria-expanded on toggle", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/folder\.setAttribute\("aria-expanded", isCollapsed \? "true" : "false"\)/);
  });
});
