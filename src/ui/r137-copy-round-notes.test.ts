// R137 — Copy round notes button in Previously-discussed panel.
// Adds a small "Copy notes" button next to each round's notes label so the
// user can one-click copy the round notes they sent to the agent. Reuses the
// established copy pattern (copyBranchNameToClipboard shape at app.ts:1762).

import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";
const REQUIRED_KEYS = ["previously.notes.copyButton", "status.copiedNotes"] as const;

const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R137 — Copy round notes button", () => {
  it("i18n.ts declares the new keys with en + zh-CN", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    for (const key of REQUIRED_KEYS) {
      expect(src).toMatch(I18N_KEY_RE(key));
    }
  });

  it("status.copiedNotes zh-CN value is 已复制本轮笔记 (not empty)", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const block = src.match(/"status\.copiedNotes":\s*\{[\s\S]*?\}/);
    expect(block?.[0]).toContain('"zh-CN": "已复制本轮笔记"');
  });

  it("app.ts defines copyRoundNotesToClipboard with the established copy pattern", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/async function copyRoundNotesToClipboard\(/);
    expect(src).toMatch(/navigator\.clipboard\?\.writeText/);
    expect(src).toMatch(/showToast\(t\("status\.copiedNotes"\)\)/);
    expect(src).toMatch(/showToast\(t\("status\.copyBlocked"\), \{ error: true \}\)/);
  });

  it("app.ts wires copyRoundNotesToClipboard to a button in the notes block", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/copyRoundNotesToClipboard\(roundEntry\.notes, copyNotesBtn\)/);
    expect(src).toMatch(/t\("previously\.notes\.copyButton"\)/);
  });

  it("the empty-state notes branch does not get a copy button", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/previously-notes-empty/);
    // The empty-state branch (else { notesBlock.textContent = t("previously.notes.empty"); })
    // must not contain the copy button. Assert the .empty block has no button wiring.
    const emptyBlock = src.match(/previously-notes-empty[\s\S]{0,300}/);
    expect(emptyBlock?.[0]).not.toMatch(/copyNotesBtn/);
  });
});
