/**
 * Unit tests for R10 #4 — Export review as markdown / patch (GH#14).
 *
 * Covers AC4.3 (Markdown content), AC4.4 (Patch content), AC4.5
 * (Filename pattern), AC4.7 (4 unit tests).
 *
 * The browser-only `src/ui/app.ts` module uses DOM globals at module
 * evaluation time, so direct import-based behavioral testing is not
 * feasible. Following the existing pattern in `src/reopen-stale.test.ts`,
 * these tests perform static analysis on `src/ui/app.ts` to confirm the
 * generateMarkdownSummary, generatePatchFile, generateExportFilename,
 * and triggerDownload contracts are correctly implemented.
 *
 * Runtime behavior of the full flow (click Export → Markdown / Patch →
 * download triggered with correct filename + content) is covered by the
 * new e2e scenario `export-review` in `scripts/test-review-ui/scenarios.mjs`
 * (scenario 22).
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const REVIEW_HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC4.3 — Markdown summary helper", () => {
  it("T10.4a generateMarkdownSummary includes heading, summary, findings table, notes", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+generateMarkdownSummary\s*\(\s*state:\s*ExportState/);
    const block = src.match(/function\s+generateMarkdownSummary[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/# Review — Round/);
    expect(block![0]).toMatch(/## Summary/);
    expect(block![0]).toMatch(/## Findings/);
    expect(block![0]).toMatch(/## Notes/);
    expect(block![0]).toMatch(/by_severity|bySeverity|By severity/);
    expect(block![0]).toMatch(/by_category|byCategory|By category/);
    expect(block![0]).toMatch(/\| id \| file:line \|/);
  });
});

describe("AC4.4 — Patch file helper", () => {
  it("T10.4b generatePatchFile produces unified diff with REVIEW annotations", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+generatePatchFile\s*\(\s*files:\s*ExportFile\[\]/);
    const block = src.match(/function\s+generatePatchFile[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/diff --git a\//);
    expect(block![0]).toMatch(/--- a\//);
    expect(block![0]).toMatch(/\+\+\+ b\//);
    expect(block![0]).toMatch(/\/\/ REVIEW \(/);
  });
});

describe("AC4.5 — Filename pattern + AC4.6 Download mechanism", () => {
  it("T10.4c generateExportFilename pattern includes round + sessionId + timestamp + extension", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+generateExportFilename\s*\(\s*format:\s*"md"\s*\|\s*"patch"/);
    const block = src.match(/function\s+generateExportFilename[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/review-\$\{round\}-\$\{short\}-\$\{ts\}\.\$\{format\}/);
  });

  it("T10.4d triggerDownload uses Blob + URL.createObjectURL + synthetic <a> click + revokeObjectURL", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+triggerDownload\s*\(\s*blob:\s*Blob/);
    const block = src.match(/function\s+triggerDownload[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/URL\.createObjectURL/);
    expect(block![0]).toMatch(/document\.createElement\("a"\)/);
    expect(block![0]).toMatch(/a\.click\(\)/);
    expect(block![0]).toMatch(/URL\.revokeObjectURL/);
  });
});

describe("AC4.1 / AC4.2 — UI Export button + modal", () => {
  it("T10.4e Export button exists in review.html header", async () => {
    const html = await readSource(REVIEW_HTML);
    expect(html).toMatch(/id="export"/);
    expect(html).toContain("Export");
  });

  it("T10.4f showExportModal renders 2 format cards (Markdown + Patch)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+showExportModal\s*\(\s*\)/);
    const block = src.match(/function\s+showExportModal[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/Markdown summary \(\.md\)/);
    expect(block![0]).toMatch(/Patch file \(\.patch\)/);
    expect(block![0]).toMatch(/data-format="md"/);
    expect(block![0]).toMatch(/data-format="patch"/);
    expect(block![0]).toMatch(/generateMarkdownSummary/);
    expect(block![0]).toMatch(/generatePatchFile/);
  });
});
