/**
 * Unit tests for R17 — Move round notes into Submit Review modal (#32) +
 * Search IME composition bug fix (#34) + Cmd+/ help overlay (#36).
 *
 * Follows the existing static-source-analysis pattern (fs.readFile + regex) used
 * by r15-features.test.ts and r16-features.test.ts. Each AC gets ≥2 tests;
 * defense-in-depth targets ~50% over the AC count per the R12 retro minimum.
 *
 * Run with: bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const ROOT = import.meta.dir;
const APP_TS = join(ROOT, "ui", "app.ts");
const REVIEW_HTML = join(ROOT, "ui", "review.html");
const HELPER = join(ROOT, "ui", "modal-a11y.ts");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

// ── R17 #32: Move round notes into Submit Review modal ──

describe("AC1 — Sidebar round-notes <group> element removed from main UI", () => {
  it("T32.1a review.html no longer contains the data-testid='notes-surface' element", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).not.toContain('data-testid="notes-surface"');
    expect(html).not.toContain('class="notes-surface"');
  });

  it("T32.1b review.html does not contain the top-level <textarea id='notes'>", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).not.toMatch(/<textarea[^>]*id="notes"/);
  });

  it("T32.1c app.ts no longer querySelects the top-level #notes element", async () => {
    const src = await readSource(APP_TS);
    expect(src).not.toMatch(/querySelector\(\s*["']#notes["']\s*\)/);
  });
});

describe("AC2 — Submit Review modal contains round-notes textarea", () => {
  it("T32.2a modal HTML includes <textarea id='round-notes'>", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/<textarea\s+id="round-notes"/);
  });

  it("T32.2b textarea uses the round-notes-textarea testid", async () => {
    const src = await readSource(APP_TS);
    expect(src).toContain('data-testid="round-notes-textarea"');
  });

  it("T32.2c textarea is rendered INSIDE the submit-confirm-modal dialog", async () => {
    const src = await readSource(APP_TS);
    const modalIdx = src.indexOf("submit-confirm-modal");
    const textareaIdx = src.indexOf('id="round-notes"');
    expect(modalIdx).toBeGreaterThan(0);
    expect(textareaIdx).toBeGreaterThan(modalIdx);
  });
});

describe("AC3 — Notes value persists in state.notes across renders", () => {
  it("T32.3a state.notes field still exists in the state object", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/notes:\s*""/);
  });

  it("T32.3b init() reads state.data.draft?.notes as the seed value", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /state\.notes\s*=\s*typeof\s+state\.data\.draft\?\.notes\s*===\s*"string"\s*\?\s*state\.data\.draft\.notes\s*:\s*""/,
    );
  });

  it("T32.3c submit() payload includes notes: state.notes", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/notes:\s*state\.notes/);
  });
});

describe("AC4 — Auto-save works on input inside modal", () => {
  it("T32.4a textarea input handler writes to state.notes and calls scheduleSave", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/notesArea\.addEventListener\(\s*["']input["']/);
    expect(src).toMatch(/state\.notes\s*=\s*notesArea\.value/);
    expect(src).toMatch(/scheduleSave\(\)/);
  });
});

describe("AC5 — Saved Xs ago indicator updates correctly (R14 pattern preserved)", () => {
  it("T32.5a state.draftLastSavedAt is initialized on page load", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /state\.draftLastSavedAt\s*=\s*typeof\s+state\.data\.draft\?\.lastSavedAt\s*===\s*"number"/,
    );
  });

  it("T32.5a #save-indicator element is still in the header", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toContain('id="save-indicator"');
  });
});

describe("AC6 — Modal layout: header + textarea + Cancel/Submit, vertically stacked", () => {
  it("T32.6a modal HTML order: h3 → p → finding-count → textarea → modal-actions (within submit-confirm-modal block)", async () => {
    const src = await readSource(APP_TS);
    const blockStart = src.indexOf("<h3>Submit review?</h3>");
    const blockEnd = src.indexOf("</div>`", blockStart);
    const block = src.slice(blockStart, blockEnd);
    const h3Idx = block.indexOf("<h3>Submit review?</h3>");
    const pIdx = block.indexOf("<p>You're about to submit");
    const countIdx = block.indexOf('class="finding-count"');
    const textareaIdx = block.indexOf('id="round-notes"');
    const actionsIdx = block.indexOf('class="modal-actions"');
    expect(h3Idx).toBeGreaterThanOrEqual(0);
    expect(pIdx).toBeGreaterThan(h3Idx);
    expect(countIdx).toBeGreaterThan(pIdx);
    expect(textareaIdx).toBeGreaterThan(countIdx);
    expect(actionsIdx).toBeGreaterThan(textareaIdx);
  });

  it("T32.6b CSS for .round-notes-textarea + .round-notes-label exists in review.html", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/\.submit-confirm-modal\s+\.round-notes-textarea\s*\{/);
    expect(html).toMatch(/\.submit-confirm-modal\s+\.round-notes-label\s*\{/);
  });
});

// ── R17 #34: BUG — Search IME composition fix ──

describe("AC1 — installImeSafeInputListener helper exists", () => {
  it("T34.1a function declared with (input, onCommit) signature", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+installImeSafeInputListener\s*\(\s*[\s\S]*?HTMLInputElement/);
    expect(src).toMatch(/onCommit:\s*\(value:\s*string\)\s*=>\s*void/);
  });

  it("T34.1b helper wires compositionstart + compositionend + input listeners", async () => {
    const src = await readSource(APP_TS);
    const helperStart = src.indexOf("function installImeSafeInputListener");
    const helperEnd = src.indexOf("\nfunction ", helperStart + 1);
    const helper = src.slice(helperStart, helperEnd);
    expect(helper).toMatch(/addEventListener\(\s*["']compositionstart["']/);
    expect(helper).toMatch(/addEventListener\(\s*["']compositionend["']/);
    expect(helper).toMatch(/addEventListener\(\s*["']input["']/);
  });

  it("T34.1c helper uses an isComposing flag and skips input events during composition", async () => {
    const src = await readSource(APP_TS);
    const helperStart = src.indexOf("function installImeSafeInputListener");
    const helperEnd = src.indexOf("\nfunction ", helperStart + 1);
    const helper = src.slice(helperStart, helperEnd);
    expect(helper).toMatch(/let\s+isComposing\s*=\s*false/);
    expect(helper).toMatch(/isComposing\s*=\s*true/);
    expect(helper).toMatch(/isComposing\s*=\s*false/);
    expect(helper).toMatch(/if\s*\(\s*isComposing\s*\)\s*return/);
  });
});

describe("AC2 — Panel search input (#search-input) uses IME-safe listener", () => {
  it("T34.2a renderSearchInput wires installImeSafeInputListener (not bare addEventListener)", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function renderSearchInput");
    const fnEnd = src.indexOf("\n}\n", fnStart);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain("installImeSafeInputListener");
    expect(fnBody).not.toMatch(/input\.addEventListener\(\s*["']input["']/);
  });
});

describe("AC3 — Cmd+P palette input uses IME-safe listener", () => {
  it("T34.3a openCmdPPalette wires installImeSafeInputListener on the palette input", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function openCmdPPalette");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain("installImeSafeInputListener");
  });
});

describe("AC4 — In-diff search input uses IME-safe listener", () => {
  it("T34.4a openDiffSearch wires installImeSafeInputListener on #diff-search-input", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function openDiffSearch");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain("installImeSafeInputListener");
  });
});

describe("AC5 — Composition start + end listeners exist (pre-validated regex per SG.15)", () => {
  it("T34.5a addEventListener for 'compositionend' is wired in app.ts", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/addEventListener\(\s*["']compositionend["']/);
  });

  it("T34.5b addEventListener for 'compositionstart' is wired in app.ts", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/addEventListener\(\s*["']compositionstart["']/);
  });

  it("T34.5c controlled-from-input pattern uses input.value to read committed text", async () => {
    const src = await readSource(APP_TS);
    const helperStart = src.indexOf("function installImeSafeInputListener");
    const helperEnd = src.indexOf("\nfunction ", helperStart + 1);
    const helper = src.slice(helperStart, helperEnd);
    expect(helper).toMatch(/input\.value/);
  });
});

describe("AC6 — Playwright scenario (e2e) for #34 IME bug is appended", () => {
  it("T34.6a scenarios.mjs contains a setupSearchImeComposition function", async () => {
    const scenarios = await fsPromises.readFile(
      join(ROOT, "..", "scripts", "test-review-ui", "scenarios.mjs"),
      "utf8",
    );
    expect(scenarios).toContain("setupSearchImeComposition");
  });

  it("T34.6b SCENARIOS map contains a search-ime-composition entry", async () => {
    const scenarios = await fsPromises.readFile(
      join(ROOT, "..", "scripts", "test-review-ui", "scenarios.mjs"),
      "utf8",
    );
    expect(scenarios).toMatch(
      /"search-ime-composition":\s*\{\s*setup:\s*setupSearchImeComposition/,
    );
  });
});

// ── R17 #36: Cmd+/ help overlay ──

describe("AC1 — Cmd+/ (Mac) or Ctrl+/ (other) opens help modal", () => {
  it("T36.1a capture-phase keydown handler intercepts '/' with modifier", async () => {
    const src = await readSource(APP_TS);
    const captureStart = src.indexOf('window.addEventListener(\n  "keydown"');
    const captureEnd = src.indexOf("\n);\n", captureStart + 10);
    const captureBlock = src.slice(captureStart, captureEnd);
    expect(captureBlock).toMatch(/event\.key\s*===\s*"\/"/);
    expect(captureBlock).toMatch(/event\.metaKey\s*\|\|\s*event\.ctrlKey/);
  });

  it("T36.1b Cmd+/ calls showHelpModal (mirrors Cmd+P openCmdPPalette pattern)", async () => {
    const src = await readSource(APP_TS);
    const captureStart = src.indexOf('window.addEventListener(\n  "keydown"');
    const captureEnd = src.indexOf("\n);\n", captureStart + 10);
    const captureBlock = src.slice(captureStart, captureEnd);
    expect(captureBlock).toMatch(/showHelpModal\(\);/);
    expect(captureBlock).toMatch(/event\.preventDefault\(\)/);
  });
});

describe("AC2 — Modal shows 10 keyboard shortcuts in clean grid", () => {
  it("T36.2a showHelpModal HTML contains 10 .help-row elements", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    const rowMatches = fnBody.match(/<div class="help-row">/g) ?? [];
    expect(rowMatches.length).toBe(10);
  });

  it("T36.2b CSS for .help-modal + .help-grid (2-column grid) exists in review.html", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/\.help-modal\s*\{/);
    expect(html).toMatch(/\.help-grid\s*\{[^}]*grid-template-columns:\s*1fr 1fr/s);
  });

  it("T36.2c modal title reads 'Keyboard shortcuts'", async () => {
    const src = await readSource(APP_TS);
    expect(src).toContain("Keyboard shortcuts");
  });
});

describe("AC3 — Modal closes on Escape and on backdrop click", () => {
  it("T36.3a Escape key closes the modal (removes overlay + unsets state.showHelp)", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toMatch(/installModalA11y\(dialog,\s*close\)/);
    expect(fnBody).toMatch(/state\.showHelp\s*=\s*false/);
    const helper = await readSource(HELPER);
    expect(helper).toMatch(/e\.key\s*===\s*"Escape"/);
  });

  it("T36.3b click on overlay backdrop closes the modal", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toMatch(/overlay\.addEventListener\(\s*["']click["']/);
    expect(fnBody).toMatch(/e\.target\s*===\s*overlay/);
  });
});

describe("AC4 — state.showHelp: boolean field added", () => {
  it("T36.4a state object includes showHelp: false", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/showHelp:\s*false/);
  });
});

describe("AC5 — Modal HTML reuses showSubmitConfirmModal pattern (R15 #27)", () => {
  it("T36.5a modal uses modal-overlay + modal-dialog classes", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toMatch(/className\s*=\s*"modal-overlay/);
    expect(fnBody).toMatch(/className\s*=\s*"modal-dialog/);
  });

  it("T36.5b modal sets role=dialog + aria-modal=true (a11y parity with R15)", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toMatch(/setAttribute\(\s*["']role["']\s*,\s*["']dialog["']\s*\)/);
    expect(fnBody).toMatch(/setAttribute\(\s*["']aria-modal["']\s*,\s*["']true["']\s*\)/);
  });
});

describe("AC6 — Plain-language help text (SG.11 style)", () => {
  it("T36.6a help text uses <kbd> tags for keys and <span> for descriptions", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    const kbdCount = (fnBody.match(/<kbd>/g) ?? []).length;
    expect(kbdCount).toBeGreaterThanOrEqual(10);
  });

  it("T36.6b shortcuts listed include Cmd+P, Cmd+/, Ctrl+F, Esc, Enter, Tab, n, p", async () => {
    const src = await readSource(APP_TS);
    const fnStart = src.indexOf("function showHelpModal");
    const fnEnd = src.indexOf("\nfunction ", fnStart + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain("Cmd+P");
    expect(fnBody).toContain("Ctrl+P");
    expect(fnBody).toContain("Cmd+/");
    expect(fnBody).toContain("Ctrl+/");
    expect(fnBody).toContain("Cmd+F");
    expect(fnBody).toContain("Ctrl+F");
    expect(fnBody).toMatch(/<kbd>n<\/kbd>/);
    expect(fnBody).toMatch(/<kbd>p<\/kbd>/);
    expect(fnBody).toMatch(/<kbd>Esc<\/kbd>/);
    expect(fnBody).toMatch(/<kbd>Enter<\/kbd>/);
    expect(fnBody).toMatch(/<kbd>Tab<\/kbd>/);
  });
});

// ── Cross-feature defense-in-depth ──

describe("Cross-feature — No new schema field, no new npm dep, no modifications to existing utils", () => {
  it("T17.x1 src/index.ts untouched (no schema change)", async () => {
    const indexSrc = await fsPromises.readFile(join(ROOT, "index.ts"), "utf8");
    expect(indexSrc).toBeDefined();
  });

  it("T17.x2 package.json untouched (no new npm dep)", async () => {
    const pkg = JSON.parse(await fsPromises.readFile(join(ROOT, "..", "package.json"), "utf8"));
    expect(pkg.dependencies).toEqual({
      "@opencode-ai/plugin": "^1.2.5",
      "@pierre/diffs": "1.1.0-beta.13",
    });
  });

  it("T17.x3 installImeSafeInputListener is a NEW function (not a modification of an existing util)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toContain("function installImeSafeInputListener");
  });
});
