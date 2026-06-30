/**
 * Unit tests for R13 #22 — In-diff search (GH#22, close #22).
 *
 * Covers AC6 (Cmd+F / Ctrl+F / / global keydown opens fixed-top
 * search overlay + capture-phase preventDefault), AC7 (counter shows
 * "N matches" + Enter/Shift+Enter/F3/Shift+F3 jumps next/prev with
 * 1.5s flash highlight + Escape clears), AC8 (`/` key skipped when
 * textarea/input/contentEditable focused, reuses isTextInputFocused),
 * AC9 (match-finding iterates [data-line-number] inside .card[data-file]
 * + wraps in <mark class="diff-search-match">), AC10 (sessionStorage
 * persists last query + try/catch wrapped + NOT localStorage).
 *
 * Runtime flows (Cmd+F opens overlay + matches highlight on
 * diff lines + Enter jumps + Escape clears) are verified via the
 * `in-diff-search` e2e scenario + the Lead's Playwright walkthrough.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC6 — Cmd+F / Ctrl+F / `/` global keydown opens fixed-top search overlay", () => {
  it("T13.22.R6a capture-phase window keydown listener registered (third arg = true)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /window\.addEventListener\(\s*"keydown",\s*\(event\)\s*=>\s*\{[\s\S]*?isComposing[\s\S]*?\},?\s*true,?\s*\)/,
    );
  });

  it("T13.22.R6b listener intercepts Cmd+F / Ctrl+F (metaKey or ctrlKey) + key === 'f'", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown",[\s\S]*?true,?\s*\)/,
    );
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(
      /\(event\.key\s*===\s*"f"\s*\|\|\s*event\.key\s*===\s*"F"\)\s*&&\s*\(event\.metaKey\s*\|\|\s*event\.ctrlKey\)/,
    );
    expect(block![0]).toMatch(/event\.preventDefault\(\)/);
    expect(block![0]).toMatch(/openDiffSearch\(\)/);
  });

  it("T13.22.R6c `/` key also opens search overlay (only when no text input is focused)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown",[\s\S]*?true,?\s*\)/,
    );
    expect(block![0]).toMatch(/event\.key\s*===\s*"\/"/);
    expect(block![0]).toMatch(/isTextInputFocused\(\)/);
    expect(block![0]).toMatch(/openDiffSearch\(\)/);
  });

  it("T13.22.R6d openDiffSearch creates a .diff-search-bar overlay (fixed-top, role=search)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+openDiffSearch\s*\([\s\S]*?\n\}\s*\n/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/className\s*=\s*"diff-search-bar"/);
    expect(block![0]).toMatch(/setAttribute\("role",\s*"search"\)/);
    expect(block![0]).toMatch(/document\.body\.appendChild\(overlay\)/);
  });
});

describe("AC7 — Counter + Enter / Shift+Enter / F3 / Shift+F3 jump + 1.5s flash + Escape", () => {
  it("T13.22.R7a counter shows 'N of M matches' (or '100+ matches, refine your query' past the cap)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+updateDiffSearchCounter\s*\([\s\S]*?\n\}\s*\n/);
    expect(block).toBeTruthy();
    // The notice string is built via template literal referencing
    // DIFF_SEARCH_MAX_MATCHES, not a hardcoded "100".
    expect(block![0]).toMatch(/\$\{DIFF_SEARCH_MAX_MATCHES\}\+\s+matches,\s+refine your query/);
    expect(block![0]).toMatch(/of\s+\$\{total\}\s+matches/);
  });

  it("T13.22.R7b Enter jumps to next match; Shift+Enter jumps to prev", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/diffSearch\.input\?\.addEventListener\("keydown"[\s\S]*?\),\s*\)/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/e\.key\s*===\s*"Enter"/);
    expect(block![0]).toMatch(/e\.shiftKey\s*\?\s*-1\s*:\s*1/);
    expect(block![0]).toMatch(/e\.preventDefault\(\)/);
  });

  it("T13.22.R7c F3 / Shift+F3 jump next / prev (mirrors Enter / Shift+Enter)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown",[\s\S]*?true,?\s*\)/,
    );
    expect(block![0]).toMatch(/event\.key\s*===\s*"F3"/);
    expect(block![0]).toMatch(/event\.shiftKey\s*\?\s*-1\s*:\s*1/);
    expect(block![0]).toMatch(/jumpToDiffSearchMatch/);
  });

  it("T13.22.R7d Escape on the overlay closes it + clears all <mark> wrappers", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/e\.key\s*===\s*"Escape"/);
    expect(src).toMatch(/closeDiffSearch\(\)/);
    const block = src.match(/function\s+closeDiffSearch\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/clearDiffSearchHighlights\(\)/);
    expect(block![0]).toMatch(/clearSessionStored\(DIFF_SEARCH_KEY\)/);
  });

  it("T13.22.R7e jumpToDiffSearchMatch reuses the 1.5s flash pattern (no new flash helper)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+jumpToDiffSearchMatch\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/scrollIntoView\(\{\s*behavior:\s*"smooth"/);
    expect(block![0]).toMatch(/flashDiffSearchMatch\(target\)/);
    // 1.5s flash constant
    expect(src).toMatch(/DIFF_SEARCH_FLASH_MS\s*=\s*1500/);
  });
});

describe("AC8 — `/` focus-guard reuses isTextInputFocused (R12 n/p nav pattern)", () => {
  it("T13.22.R8a `/` key is skipped when isTextInputFocused() returns true", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown",[\s\S]*?true,?\s*\)/,
    );
    expect(block![0]).toMatch(
      /if\s*\(event\.key\s*===\s*"\/"\s*&&\s*!event\.metaKey\s*&&\s*!event\.ctrlKey\s*&&\s*!event\.altKey\)/,
    );
    expect(block![0]).toMatch(/if\s*\(isTextInputFocused\(\)\)\s*return/);
  });

  it("T13.22.R8b isTextInputFocused is the existing helper (R12 n/p nav at :445-453)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+isTextInputFocused\s*\(\)/);
    // Verify it checks TEXTAREA + INPUT + isContentEditable
    const block = src.match(/function\s+isTextInputFocused\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/tagName\s*===\s*"TEXTAREA"/);
    expect(block![0]).toMatch(/tagName\s*===\s*"INPUT"/);
    expect(block![0]).toMatch(/isContentEditable/);
  });
});

describe("AC9 — Match-finding iterates [data-line-number] inside .card[data-file] + <mark> wrap", () => {
  it("T13.22.R9a findMatchesInDiff selector targets [data-line-number] inside .card[data-file]", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+findMatchesInDiff\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/\.card\[data-file\]/);
    expect(block![0]).toMatch(/\[data-line-number\]/);
  });

  it("T13.22.R9b matches are wrapped in <mark class='diff-search-match'>", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+findMatchesInDiff\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/document\.createElement\("mark"\)/);
    expect(block![0]).toMatch(/mark\.className\s*=\s*"diff-search-match"/);
  });

  it("T13.22.R9c match count is capped at 100 with '100+ matches, refine your query' notice", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/DIFF_SEARCH_MAX_MATCHES\s*=\s*100/);
    const block = src.match(/function\s+updateDiffSearchCounter\s*\([\s\S]*?\n\}\s*\n/);
    // Template literal, not a hardcoded "100+".
    expect(block![0]).toMatch(/\$\{DIFF_SEARCH_MAX_MATCHES\}\+\s+matches,\s+refine your query/);
  });

  it("T13.22.R9d CSS for .diff-search-bar + mark.diff-search-match + .diff-search-match-flash exists in review.html", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.diff-search-bar\s*\{/);
    expect(html).toMatch(/mark\.diff-search-match\s*\{/);
    expect(html).toMatch(/\.diff-search-match-flash\s*\{/);
  });
});

describe("AC10 — sessionStorage persistence (try/catch wrapped, NOT localStorage)", () => {
  it("T13.22.R10a readSessionStored + writeSessionStored + clearSessionStored all wrap sessionStorage in try/catch", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+readSessionStored\s*\(/);
    expect(src).toMatch(/function\s+writeSessionStored\s*\(/);
    expect(src).toMatch(/function\s+clearSessionStored\s*\(/);
    // Each helper uses try/catch (mirrors readStored/writeStored at :133-149)
    const readBlock = src.match(/function\s+readSessionStored\s*\([\s\S]*?\n\}\s*\n/);
    expect(readBlock![0]).toMatch(/try\s*\{/);
    expect(readBlock![0]).toMatch(/\}\s*catch/);
    const writeBlock = src.match(/function\s+writeSessionStored\s*\([\s\S]*?\n\}\s*\n/);
    expect(writeBlock![0]).toMatch(/try\s*\{/);
    expect(writeBlock![0]).toMatch(/\}\s*catch/);
  });

  it("T13.22.R10b DIFF_SEARCH_KEY uses sessionStorage (NOT localStorage)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/DIFF_SEARCH_KEY\s*=\s*"diff-review:diff-search-query"/);
    // The helper must reference sessionStorage
    expect(src).toMatch(/sessionStorage\.getItem/);
    expect(src).toMatch(/sessionStorage\.setItem/);
    // And NOT localStorage (we want round-scoped persistence only)
    const searchBlock = src.match(/function\s+writeSessionStored\s*\([\s\S]*?\n\}\s*\n/);
    expect(searchBlock![0]).not.toMatch(/localStorage/);
  });

  it("T13.22.R10c openDiffSearch restores last query from sessionStorage on reopen", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+openDiffSearch\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/readSessionStored\(DIFF_SEARCH_KEY\)/);
  });
});
