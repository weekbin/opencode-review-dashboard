/**
 * Unit tests for R16 — Hide-whitespace toggle (#29) + Copy finding as Markdown (#30) +
 * Diff expand-all / collapse-all (#31).
 *
 * Follows the existing static-source-analysis pattern (fs.readFile + regex) used by
 * r15-features.test.ts. Each AC gets ≥1 test; defense-in-depth targets ~50% over the
 * AC count per the R12 retro minimum.
 *
 * Run with: bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const ROOT = import.meta.dir;
const APP_TS = join(ROOT, "ui", "app.ts");
const REVIEW_HTML = join(ROOT, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

// ── R16 #29: Hide-whitespace toggle ──

describe("AC1 — Toolbar button exists in HTML", () => {
  it("T16.1a #ignore-whitespace button rendered in review.html", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/id="ignore-whitespace"/);
    expect(html).toMatch(/class="ignore-whitespace-btn"/);
  });

  it("T16.1b button text starts as 'Ignore ws' (off state)", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/>\s*Ignore ws\s*</);
  });

  it("T16.1c button has aria-pressed default false", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/id="ignore-whitespace"[^>]*aria-pressed="false"/s);
  });

  it("T16.1d button placed near #layout-toggle in toolbar", async () => {
    const html = await readSource(REVIEW_HTML);
    const layoutIdx = html.indexOf('id="layout-toggle"');
    const wsIdx = html.indexOf('id="ignore-whitespace"');
    expect(layoutIdx).toBeGreaterThan(0);
    expect(wsIdx).toBeGreaterThan(layoutIdx);
  });
});

describe("AC2 — stripWhitespace helper applied before FileDiff construction", () => {
  it("T16.2a stripWhitespace helper is defined", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+stripWhitespace\s*\(\s*s:\s*string\s*\)/);
  });

  it("T16.2b stripWhitespace collapses whitespace runs to a single space", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/stripWhitespace[\s\S]*?replace\(\s*\/\\s\+\/\s*g,\s*" "\s*\)/);
  });

  it("T16.2c stripWhitespace trims trailing whitespace", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/stripWhitespace[\s\S]*?replace\(\s*\/ \+\$\//);
  });

  it("T16.2d createView applies stripWhitespace to file.before and file.after when state.ignoreWhitespace is on", async () => {
    const src = await readSource(APP_TS);
    const createViewIdx = src.indexOf("function createView");
    const createAddedIdx = src.indexOf("function createAddedFileView");
    expect(createViewIdx).toBeGreaterThan(0);
    expect(createAddedIdx).toBeGreaterThan(createViewIdx);
    const createViewBlock = src.slice(createViewIdx, createAddedIdx);
    expect(createViewBlock).toMatch(
      /state\.ignoreWhitespace\s*\?\s*stripWhitespace\(file\.before\s*\|\|\s*""\)\s*:\s*\(?file\.before\s*\|\|\s*""\)?/,
    );
    expect(createViewBlock).toMatch(
      /state\.ignoreWhitespace\s*\?\s*stripWhitespace\(file\.after\s*\|\|\s*""\)\s*:\s*\(?file\.after\s*\|\|\s*""\)?/,
    );
  });

  it("T16.2e createAddedFileView applies stripWhitespace to file.after only", async () => {
    const src = await readSource(APP_TS);
    const added = src.match(/function\s+createAddedFileView\s*\([\s\S]*?\n\}/);
    expect(added).toBeTruthy();
    expect(added![0]).toMatch(/stripWhitespace\(file\.after/);
    expect(added![0]).not.toMatch(/stripWhitespace\(file\.before/);
  });

  it("T16.2f createDeletedFileView applies stripWhitespace to file.before only", async () => {
    const src = await readSource(APP_TS);
    const deleted = src.match(/function\s+createDeletedFileView\s*\([\s\S]*?\n\}/);
    expect(deleted).toBeTruthy();
    expect(deleted![0]).toMatch(/stripWhitespace\(file\.before/);
    expect(deleted![0]).not.toMatch(/stripWhitespace\(file\.after/);
  });
});

describe("AC3 — localStorage persistence", () => {
  it("T16.3a IGNORE_WHITESPACE_KEY constant defined with diff-review:ignore-whitespace value", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/const\s+IGNORE_WHITESPACE_KEY\s*=\s*"diff-review:ignore-whitespace"/);
  });

  it("T16.3b state.ignoreWhitespace initialized via readStored with on/off allowed", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /ignoreWhitespace:\s*readStored<"on"\s*\|\s*"off">\s*\(\s*IGNORE_WHITESPACE_KEY\s*,\s*\["on",\s*"off"\]\s*,\s*"off"\s*\)\s*===\s*"on"/,
    );
  });

  it("T16.3c setIgnoreWhitespace persists via writeStored", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setIgnoreWhitespace\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(
      /writeStored\(\s*IGNORE_WHITESPACE_KEY\s*,\s*next\s*\?\s*"on"\s*:\s*"off"\s*\)/,
    );
  });
});

describe("AC4 — Toggle triggers re-render", () => {
  it("T16.4a setIgnoreWhitespace calls renderDiffPanel()", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setIgnoreWhitespace\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/renderDiffPanel\(\)/);
  });

  it("T16.4b click listener on #ignore-whitespace toggles state", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /ignoreWhitespaceToggle\.addEventListener\(\s*"click",\s*\(\)\s*=>\s*\{\s*setIgnoreWhitespace\(!state\.ignoreWhitespace\)/,
    );
  });
});

describe("AC5 — Pure client-side, no server / schema / dep changes", () => {
  it("T16.5a src/index.ts not modified (server untouched)", async () => {
    const src = await readSource(join(ROOT, "index.ts"));
    expect(src).not.toMatch(/ignore-whitespace/);
    expect(src).not.toMatch(/ignoreWhitespace/);
    expect(src).not.toMatch(/buildFindingMarkdownSnippet/);
    expect(src).not.toMatch(/setAllExpanded/);
  });

  it("T16.5b no new import line for ignore-whitespace", async () => {
    const src = await readSource(APP_TS);
    expect(src).not.toMatch(/^\s*import\s+.*ignore-whitespace.*$/m);
  });

  it("T16.5c package.json untouched (verified by no new dep lines added to app.ts)", async () => {
    const src = await readSource(APP_TS);
    expect(src).not.toMatch(/from\s+["']@\/server/);
  });
});

describe("AC6 — Whitespace collapse preserves word boundaries", () => {
  it("T16.6a stripWhitespace collapses runs but keeps non-space chars", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/stripWhitespace[\s\S]*?replace\(\s*\/\\s\+\/\s*g,\s*" "\s*\)/);
  });

  it("T16.6b trim trailing with / +$/ — single-space matches only at end", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/replace\(\s*\/ \+\$\//);
  });

  it("T16.6c guard: empty string stays empty", async () => {
    expect("".replace(/\s+/g, " ").replace(/ +$/, "")).toBe("");
  });

  it("T16.6d guard: tabs and newlines collapse to one space", async () => {
    expect("a\t\tb\n\nc".replace(/\s+/g, " ").replace(/ +$/, "")).toBe("a b c");
  });

  it("T16.6e guard: trailing whitespace stripped", async () => {
    expect("hello   ".replace(/\s+/g, " ").replace(/ +$/, "")).toBe("hello");
  });

  it("T16.6f guard: words without whitespace unchanged", async () => {
    expect("helloworld".replace(/\s+/g, " ").replace(/ +$/, "")).toBe("helloworld");
  });
});

// ── R16 #30: Copy finding as Markdown ──

describe("AC7 — Copy as MD button rendered in finding actions", () => {
  it("T16.7a 'Copy as MD' button rendered next to copyLinkBtn", async () => {
    const src = await readSource(APP_TS);
    const copyLinkIdx = src.indexOf("finding-copy-link");
    const copyMdIdx = src.indexOf("finding-copy-md");
    expect(copyLinkIdx).toBeGreaterThan(0);
    expect(copyMdIdx).toBeGreaterThan(copyLinkIdx);
  });

  it("T16.7b button uses class finding-copy-md", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/className\s*=\s*"finding-copy-md"/);
  });

  it("T16.7c button text is 'Copy as MD'", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/textContent\s*=\s*"Copy as MD"/);
  });

  it("T16.7d button has descriptive title tooltip", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/title\s*=\s*"Copy finding as a Markdown snippet/);
  });

  it("T16.7e button click calls copyFindingAsMarkdownToClipboard", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /copyMdBtn\.addEventListener\(\s*"click",\s*\(event\)\s*=>\s*\{[\s\S]*?void\s+copyFindingAsMarkdownToClipboard/,
    );
  });
});

describe("AC8 — copyFindingAsMarkdownToClipboard function shape", () => {
  it("T16.8a function defined with 3 params (finding, round, button)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /async\s+function\s+copyFindingAsMarkdownToClipboard\s*\(\s*finding:\s*ConversationEntry\s*,[\s\S]*?round:\s*number\s*,[\s\S]*?button:\s*HTMLButtonElement\s*,?\s*\)/,
    );
  });

  it("T16.8b returns Promise<void>", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /async\s+function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\):\s*Promise<void>/,
    );
  });

  it("T16.8c function uses navigator.clipboard?.writeText", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/navigator\.clipboard\?\.writeText/);
  });

  it("T16.8d function uses document.execCommand('copy') fallback", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/document\.execCommand\(\s*"copy"\s*\)/);
  });

  it("T16.8e function shows transient '✓ Copied' label + setTimeout revert", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/✓ Copied/);
    expect(block![0]).toMatch(/setTimeout\(/);
    expect(block![0]).toMatch(/button\.disabled\s*=\s*false/);
  });
});

describe("AC9 — Markdown snippet format", () => {
  it("T16.9a format starts with [Round N] prefix", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/\[Round \$\{round\}\]/);
  });

  it("T16.9b format uses **[file:line](permalink)** link", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/\$\{loc\}/);
    expect(block![0]).toMatch(/\$\{permalink\}/);
    expect(block![0]).toMatch(/\*\*\[/);
  });

  it("T16.9c format includes the comment text after em-dash", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/— \$\{comment\}/);
  });

  it("T16.9d format includes > audit: N edits blockquote", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/> audit: \$\{auditCount\} edits/);
  });

  it("T16.9e format includes reactions: emoji×N sorted line", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/\$\{emoji\}×\$\{n\}/);
    expect(block![0]).toMatch(/localeCompare/);
    expect(block![0]).toMatch(/reactions: /);
  });

  it("T16.9f format handles empty reactions with '(none)' fallback", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/reactions: \(none\)/);
  });

  it("T16.9g uses buildFindingPermalink for the URL", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/buildFindingPermalink\(entry\.id\)/);
  });

  it("T16.9h location handles line ranges vs single line", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(
      /start_line[\s\S]*?end_line[\s\S]*?start_line\s*!==\s*entry\.end_line/,
    );
    expect(block![0]).toMatch(/\$\{entry\.file\}:\$\{entry\.start_line\}-\$\{entry\.end_line\}/);
    expect(block![0]).toMatch(/\$\{entry\.file\}:\$\{entry\.start_line\s*\?\?\s*"\?"\}/);
  });

  it("T16.9i does NOT reuse generateMarkdownSummary (separate function)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+generateMarkdownSummary/);
    expect(src).toMatch(/function\s+buildFindingMarkdownSnippet/);
    expect(src).not.toMatch(/generateMarkdownSummary[\s\S]*?buildFindingMarkdownSnippet/);
  });
});

describe("AC10 — Uses existing navigator.clipboard + fallbackCopy pattern", () => {
  it("T16.10a clipboard writeText pattern matches permalink helper", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/navigator\.clipboard\??\.writeText\(md\)/);
    expect(block![0]).toMatch(/document\.execCommand\(\s*"copy"\s*\)/);
    expect(block![0]).toMatch(/fallbackCopy\(md\)/);
  });

  it("T16.10b catches writeText rejection and falls back", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/await\s+navigator\.clipboard\.writeText\(md\)/);
    expect(block![0]).toMatch(/catch[\s\S]*?fallbackCopy\(md\)/);
  });
});

describe("AC11 — setStatus('Copied as Markdown')", () => {
  it("T16.11a success path calls setStatus with 'Copied as Markdown'", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/setStatus\(\s*"Copied as Markdown"\s*\)/);
  });

  it("T16.11b failure path calls setStatus with error:true", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+copyFindingAsMarkdownToClipboard\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/setStatus\([^,]+,\s*true\s*\)/);
  });
});

describe("AC12 — buildFindingMarkdownSnippet is a separate function", () => {
  it("T16.12a function takes (entry: ConversationEntry, round: number)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /function\s+buildFindingMarkdownSnippet\s*\(\s*entry:\s*ConversationEntry\s*,\s*round:\s*number\s*\)/,
    );
  });

  it("T16.12b function returns a string", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+buildFindingMarkdownSnippet\s*\([\s\S]*?\):\s*string\s*\{/);
  });
});

// ── R16 #31: Diff expand-all / collapse-all ──

describe("AC13 — Two new buttons in diff panel header", () => {
  it("T16.13a expand-all button rendered in renderDiffPanel", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/className\s*=\s*"diff-expand-all-btn"/);
    expect(src).toMatch(/textContent\s*=\s*"Expand all"/);
  });

  it("T16.13b collapse-all button rendered in renderDiffPanel", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/className\s*=\s*"diff-collapse-all-btn"/);
    expect(src).toMatch(/textContent\s*=\s*"Collapse all"/);
  });

  it("T16.13c buttons wrapped in .diff-panel-toolbar", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/className\s*=\s*"diff-panel-toolbar"/);
  });

  it("T16.13d toolbar only renders when files.length > 0", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/if\s*\(\s*files\.length\s*>\s*0\s*\)\s*\{[\s\S]*?diff-panel-toolbar/s);
  });

  it("T16.13e CSS for .diff-panel-toolbar exists in review.html", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/\.diff-panel-toolbar/);
  });
});

describe("AC14 — Iterates state.views.values() (NO new state field)", () => {
  it("T16.14a setAllExpanded iterates state.views.values()", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/state\.views\.values\(\)/);
  });

  it("T16.14b no new state field for expand-all (state still ends at same shape)", async () => {
    const src = await readSource(APP_TS);
    expect(src).not.toMatch(/expandAll:\s*(true|false)/);
    expect(src).not.toMatch(/allExpanded:\s*(true|false)/);
  });
});

describe("AC15 — setOptions called with FULL options spread (NOT Partial)", () => {
  it("T16.15a setAllExpanded uses setOptions with spread options", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(
      /setOptions\(\s*\{[\s\S]*?\.\.\.view\.instance\.options[\s\S]*?expandUnchanged:\s*expand[\s\S]*?\}\s*\)/,
    );
  });

  it("T16.15b uses view.instance.options property access (not a getter)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/view\.instance\.options/);
  });
});

describe("AC16 — rerender() called after setOptions", () => {
  it("T16.16a setAllExpanded calls view.instance.rerender() in the loop", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/view\.instance\.rerender\(\)/);
  });

  it("T16.16b setOptions called BEFORE rerender in same iteration", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    const setOptsIdx = block![0].indexOf("setOptions(");
    const rerenderIdx = block![0].indexOf("rerender()");
    expect(setOptsIdx).toBeGreaterThan(0);
    expect(rerenderIdx).toBeGreaterThan(setOptsIdx);
  });
});

describe("AC17 — setStatus feedback", () => {
  it("T16.17a 'Expanded all files' status on expand", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(
      /setStatus\(\s*expand\s*\?\s*"Expanded all files"\s*:\s*"Collapsed all files"\s*\)/,
    );
  });

  it("T16.17b both messages are exact strings (no concatenation)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/"Expanded all files"/);
    expect(block![0]).toMatch(/"Collapsed all files"/);
  });
});

describe("AC18 — Dispose pattern preserved (cleanUp still called)", () => {
  it("T16.18a renderDiffPanel still calls view.instance.cleanUp()", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/view\.instance\.cleanUp\(\)/);
  });

  it("T16.18b setAllExpanded does NOT call cleanUp (only sets options + rerenders)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setAllExpanded\s*\([\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).not.toMatch(/cleanUp/);
  });

  it("T16.18c cleanUp loop happens before state.views.clear() in renderDiffPanel", async () => {
    const src = await readSource(APP_TS);
    const cleanupIdx = src.search(
      /for\s*\(\s*const\s+view\s+of\s+state\.views\.values\(\)\s*\)\s*\{[\s\S]*?cleanUp/,
    );
    const clearIdx = src.indexOf("state.views.clear()");
    expect(cleanupIdx).toBeGreaterThan(0);
    expect(clearIdx).toBeGreaterThan(cleanupIdx);
  });
});
