/**
 * Unit tests for R10 #1 — Saved Replies / Comment Templates (GH#10).
 *
 * Covers AC1.1 (UI button), AC1.2 (save action), AC1.3 (insert action),
 * AC1.5 (persistence), AC1.6 (empty state), AC1.7 (soft cap),
 * AC1.8 (5 unit tests).
 *
 * The browser-only `src/ui/app.ts` module uses DOM globals at module
 * evaluation time, so direct import-based behavioral testing is not
 * feasible. Following the existing pattern in `src/reopen-stale.test.ts`,
 * these tests perform static analysis on `src/ui/app.ts` to confirm the
 * localStorage CRUD helpers, the dropdown UI wiring, and the
 * insertAtCursor / soft-cap contracts are correctly implemented.
 *
 * Runtime behavior of the full flow (click → dropdown → save → insert
 * → reload) is covered by the new e2e scenario `saved-replies` in
 * `scripts/test-review-ui/scenarios.mjs` (scenario 21).
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC1.1 / AC1.2 — Saved Replies helpers + UI button", () => {
  it("T10.1a SAVED_REPLIES_KEY + soft cap constant declared", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/SAVED_REPLIES_KEY\s*=\s*"opencode-review-dashboard:saved-replies"/);
    expect(src).toMatch(/SAVED_REPLIES_SOFT_CAP\s*=\s*200/);
  });

  it("T10.1b loadSavedReplies reads + parses + filters invalid entries", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+loadSavedReplies\s*\(\s*\)\s*:\s*SavedReply\[\]/);
    const block = src.match(/function\s+loadSavedReplies[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/localStorage\.getItem/);
    expect(block![0]).toMatch(/JSON\.parse/);
    expect(block![0]).toMatch(/return \[\]/);
    expect(block![0]).toMatch(/typeof item\.name === "string"/);
    expect(block![0]).toMatch(/typeof item\.body === "string"/);
    expect(block![0]).toMatch(/typeof item\.createdAt === "number"/);
  });

  it("T10.1c addSavedReply enforces soft cap + valid input", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+addSavedReply[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/name\.trim\(\)/);
    expect(block![0]).toMatch(/body\.trim\(\)/);
    expect(block![0]).toMatch(/SAVED_REPLIES_SOFT_CAP/);
    expect(block![0]).toMatch(/localStorage quota exceeded/);
  });
});

describe("AC1.3 / AC1.5 / AC1.7 — Insert + persistence + soft cap UI", () => {
  it("T10.2a insertAtCursor handles focused cursor + no-focus fallback", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+insertAtCursor\s*\(\s*textarea:\s*HTMLTextAreaElement/);
    const block = src.match(/function\s+insertAtCursor[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/selectionStart/);
    expect(block![0]).toMatch(/selectionEnd/);
    expect(block![0]).toMatch(/setSelectionRange/);
    expect(block![0]).toMatch(/textarea\.focus\(\)/);
  });

  it("T10.2b Dropdown renders saved replies with insert + delete buttons + empty state + soft cap badge", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/saved-replies-dropdown/);
    expect(src).toMatch(/saved-replies-toggle/);
    expect(src).toMatch(/saved-replies-row/);
    expect(src).toMatch(/saved-replies-insert/);
    expect(src).toMatch(/saved-replies-delete/);
    expect(src).toMatch(/No saved replies yet — save your first one/);
    expect(src).toMatch(/Save current as template/);
    expect(src).toMatch(/overCap = initialReplies\.length > 100/);
  });

  it("T10.2c deleteSavedReplyByName + localStorage round-trip", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+deleteSavedReplyByName\s*\(\s*name:\s*string\s*\)/);
    const block = src.match(/function\s+deleteSavedReplyByName[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/list\.filter/);
    expect(block![0]).toMatch(/persistSavedReplies/);
  });

  it("T10.2d HTML CSS for dropdown is present in review.html", async () => {
    const html = await fsPromises.readFile(join(import.meta.dir, "ui", "review.html"), "utf8");
    expect(html).toMatch(/\.saved-replies-dropdown\s*\{/);
    expect(html).toMatch(/\.saved-replies-empty\s*\{/);
    expect(html).toMatch(/\.saved-replies-insert\s*\{/);
    expect(html).toMatch(/\.saved-replies-delete\s*\{/);
    expect(html).toMatch(/\.saved-replies-save-current\s*\{/);
    expect(html).toMatch(/\.saved-replies-header\s*\{/);
  });

  it("T10.2e persistSavedReplies wraps localStorage.setItem in try/catch", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+persistSavedReplies[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/try\s*\{/);
    expect(block![0]).toMatch(/localStorage\.setItem/);
    expect(block![0]).toMatch(/catch\s*\{/);
    expect(block![0]).toMatch(/return false/);
  });
});
