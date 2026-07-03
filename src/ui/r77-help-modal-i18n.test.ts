// R77 i18n: help modal (app.ts:1243-1280) was missed by R57-R72 sweep. Has 13 hardcoded English:
// - h3 "Keyboard shortcuts"
// - p "Quick reference for the most common shortcuts. Press ? or Esc to close."
// - 9 shortcut help rows (n/p/Ctrl+F/Cmd+F, /, Cmd+P/Ctrl+P, Cmd+//Ctrl+/, Enter, Esc, Tab, ?)
// - button "Close"

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

function extractHelpModal(ts: string): string | null {
  const m = ts.match(/function showHelpModal[\s\S]*?dialog\.innerHTML = `([\s\S]*?)`;/);
  return m && m[1] !== undefined ? m[1] : null;
}

describe("R77 — help modal uses i18n for all 13 hardcoded English strings", () => {
  it("help-modal h3 uses t() (no hardcoded 'Keyboard shortcuts')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractHelpModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<h3 id="help-modal-title">Keyboard shortcuts<\/h3>/);
    expect(block!).toMatch(/help\.modal\.title/);
  });

  it("help-modal intro paragraph uses i18n", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractHelpModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/Quick reference for the most common shortcuts/);
    expect(block!).toMatch(/help\.modal\.intro/);
  });

  it("help-modal Close button uses i18n (modal.close shared or help-specific)", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractHelpModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<button id="help-close"[^>]*>Close<\/button>/);
    expect(block!).toMatch(/help\.modal\.close|t\("modal\.close"\)/);
  });

  it("all 9 shortcut help rows use t() (no hardcoded 'Jump to next finding' etc)", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractHelpModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/Jump to next finding/);
    expect(block!).not.toMatch(/Jump to previous finding/);
    expect(block!).not.toMatch(/Find text inside the loaded diff/);
    expect(block!).not.toMatch(/Find in diffs \(alternative/);
    expect(block!).not.toMatch(/Open the file quick-jump palette/);
    expect(block!).not.toMatch(/Open this help overlay/);
    expect(block!).not.toMatch(/Submit finding \(when comment is focused\)/);
    expect(block!).not.toMatch(/Close any open modal/);
    expect(block!).not.toMatch(/Move focus inside forms/);
    expect(block!).not.toMatch(/Open this help overlay \(alternative to Cmd\+\/\)/);
    expect(block!).toMatch(/help\.shortcut\./);
  });
});
