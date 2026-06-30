/**
 * Unit tests for #8 — drawer refactor: notes surface + header Submit.
 *
 * Covers AC8-1, AC8-3, AC8-6 (DOM-shape assertions on src/ui/review.html).
 * The DOM-snapshot style mirrors src/prior-notes.test.ts:243-249 (R4 AC1
 * "Previously discussed" tab structural check).
 *
 * AC8-2 (notes-always-visible), AC8-4 (header-submit-only), and
 * AC8-5 (regression — existing 10 e2e scenarios pass) are covered by
 * scripts/test-review-ui/scenarios.mjs and bun run test:ui.
 *
 * Run with:  bun run test:unit
 */

import { describe, expect, it } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

async function readReviewHtml() {
  return fsPromises.readFile(join(import.meta.dir, "ui", "review.html"), "utf8");
}

function findDrawer(html: string): string {
  const start = html.indexOf('<aside class="drawer"');
  const end = html.indexOf("</aside>", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return html.slice(start, end);
}

function findHeader(html: string): string {
  const start = html.indexOf("<header");
  const end = html.indexOf("</header>", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return html.slice(start, end);
}

describe("AC8-1 — state.notes binds to a new always-visible notes surface", () => {
  it("the notes textarea is rendered inside the Submit Review modal (R17 #32)", async () => {
    const appTs = await fsPromises.readFile(join(import.meta.dir, "ui", "app.ts"), "utf8");
    const submitModalIdx = appTs.indexOf("submit-confirm-modal");
    expect(submitModalIdx).toBeGreaterThan(0);
    const roundNotesIdx = appTs.indexOf('data-testid="round-notes-textarea"');
    expect(roundNotesIdx).toBeGreaterThan(submitModalIdx);
  });

  it("the top-level layout does NOT contain a persistent notes-surface element", async () => {
    const html = await readReviewHtml();
    expect(html).not.toContain('data-testid="notes-surface"');
    expect(html).not.toContain('class="notes-surface"');
  });

  it("the notes surface is OUTSIDE the drawer", async () => {
    const html = await readReviewHtml();
    const drawer = findDrawer(html);
    expect(drawer).not.toContain('id="notes"');
    expect(drawer).not.toContain('data-testid="notes-textarea"');
    expect(drawer).not.toContain('data-testid="round-notes-textarea"');
  });
});

describe("AC8-3 — drawer is findings-only (no notes, no submit)", () => {
  it("drawer does NOT contain the notes textarea", async () => {
    const html = await readReviewHtml();
    const drawer = findDrawer(html);
    expect(drawer).not.toContain('id="notes"');
    expect(drawer).not.toContain('data-testid="notes-textarea"');
    expect(drawer).not.toContain('data-testid="round-notes-textarea"');
  });

  it("drawer does NOT contain the submit button", async () => {
    const html = await readReviewHtml();
    const drawer = findDrawer(html);
    expect(drawer).not.toContain('id="submit"');
  });

  it("drawer DOES contain the finding fields (positive assertion)", async () => {
    const html = await readReviewHtml();
    const drawer = findDrawer(html);
    // Finding fields: category select, severity select, comment textarea,
    // Clear + Add Finding buttons, findings list, status div.
    expect(drawer).toContain('id="comment"');
    expect(drawer).toContain('id="clear"');
    expect(drawer).toContain('id="add"');
    expect(drawer).toContain('id="findings"');
    expect(drawer).toContain('id="status"');
  });
});

describe("AC8-4 — submit button is in the header (single terminal action)", () => {
  it("header contains the submit button", async () => {
    const html = await readReviewHtml();
    const header = findHeader(html);
    expect(header).toContain('id="submit"');
    expect(header).toContain("Submit Review");
  });

  it('there is exactly ONE id="submit" in the document', async () => {
    const html = await readReviewHtml();
    const submitMatches = html.match(/id="submit"/g) ?? [];
    expect(submitMatches.length).toBe(1);
  });
});

describe("AC8-6 — DOM snapshot (no notes / no submit in drawer)", () => {
  it('drawer block does NOT contain <textarea id="notes"> or <button id="submit">', async () => {
    const html = await readReviewHtml();
    const drawer = findDrawer(html);
    expect(drawer).not.toMatch(/<textarea[^>]*id="notes"/);
    expect(drawer).not.toMatch(/<button[^>]*id="submit"/);
  });
});
