/**
 * R19 #38 — A11y audit tests.
 *
 * Verifies the static ARIA markup added to `src/ui/review.html` and the
 * modal a11y wiring in `src/ui/app.ts`. Source-grep strategy mirrors
 * the existing `src/draft-autosave.test.ts` pattern (lines 28-44): load
 * the source as a string and `toMatch`/regex assertions keep the
 * test browser-free.
 *
 * Run with:  bun test src/ui/a11y.test.ts
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");
const HTML = join(import.meta.dir, "..", "..", "src", "ui", "review.html");
const MODAL_HELPER = join(import.meta.dir, "..", "..", "src", "ui", "modal-a11y.ts");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC3.1 — Sidebar tabs role=tablist, tabs carry role=tab + aria-selected", () => {
  it("review.html: navbar container has role=tablist + aria-label", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(
      /<nav[^>]*class="navbar-tabs"[^>]*id="navbar-tabs"[^>]*role="tablist"[^>]*aria-label="Sidebar sections"/,
    );
  });

  it("review.html: each of the 4 sidebar tabs has role=tab", async () => {
    const html = await readSource(HTML);
    const matches = html.match(/<button[^>]*role="tab"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });

  it("app.ts: applyActiveTab toggles aria-selected true|false per tab", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+applyActiveTab/);
    expect(src).toMatch(/aria-selected/);
    expect(src).toMatch(/setAttribute\("aria-selected",\s*isActive\s*\?\s*"true"\s*:\s*"false"\)/);
  });
});

describe("AC3.2 — Auto-save indicator exposes role=status + aria-live=polite", () => {
  it("review.html: #save-indicator has role=status and aria-live=polite", async () => {
    const html = await readSource(HTML);
    const idx = html.indexOf('id="save-indicator"');
    expect(idx).toBeGreaterThan(-1);
    const block = html.slice(idx, idx + 400);
    expect(block).toMatch(/role="status"/);
    expect(block).toMatch(/aria-live="polite"/);
  });
});

describe("AC3.3 — Modals: role=dialog + aria-modal=true + Escape + focus trap + initial focus", () => {
  it("app.ts: at least 5 modal dialog sites carry role=dialog AND aria-modal=true", async () => {
    const src = await readSource(APP_TS);
    const dialogOpens = src.match(/setAttribute\("role",\s*"dialog"\)/g) ?? [];
    const ariaModalOpens = src.match(/setAttribute\("aria-modal",\s*"true"\)/g) ?? [];
    expect(dialogOpens.length).toBeGreaterThanOrEqual(5);
    expect(ariaModalOpens.length).toBeGreaterThanOrEqual(5);
  });

  it("app.ts: installModalA11y is invoked from every modal builder (>= 5 sites)", async () => {
    const src = await readSource(APP_TS);
    const calls = src.match(/installModalA11y\(/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(5);
  });

  it("modal-a11y.ts: wires Escape, focus trap, and initial focus", async () => {
    const src = await readSource(MODAL_HELPER);
    expect(src).toMatch(/function\s+installModalA11y/);
    expect(src).toMatch(/e\.key === "Escape"/);
    expect(src).toMatch(/e\.key !== "Tab"/);
    expect(src).toMatch(/getFocusable\(/);
    expect(src).toMatch(/setAttribute\("role",\s*"dialog"\)/);
    expect(src).toMatch(/setAttribute\("aria-modal",\s*"true"\)/);
    expect(src).toMatch(/previouslyFocused\.focus\(\)/);
  });
});

describe("AC3.4 — Skip-to-content link is the first focusable element", () => {
  it("review.html: skip-link appears immediately inside <body>, before <header>", async () => {
    const html = await readSource(HTML);
    const idxBody = html.indexOf("<body>");
    const idxSkip = html.indexOf('class="skip-link"');
    const idxHeader = html.indexOf("<header>");
    expect(idxBody).toBeGreaterThan(-1);
    expect(idxSkip).toBeGreaterThan(idxBody);
    expect(idxHeader).toBeGreaterThan(idxSkip);
    const between = html.slice(idxBody, idxSkip);
    expect(between).not.toMatch(/<button\b/);
  });

  it("review.html: skip-link CSS rule .skip-link:focus makes it visible", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.skip-link:focus[\s\S]{0,200}?left:\s*\d/);
  });
});

describe("AC3.5 — <main> landmark wraps the dashboard diffs", () => {
  it("review.html: <main id=diffs> exists and wraps the rendered diff area", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/<main\s+id="diffs">/);
    expect(html).toMatch(/href="#diffs"/);
  });
});
