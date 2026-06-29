/**
 * Unit tests for R10 #2 — Edit a finding in-place (GH#11, architecture).
 *
 * Covers AC2.1 (UI button), AC2.3 (PATCH endpoint), AC2.4 (server
 * endpoint pattern), AC2.5 (validation: category / severity enum +
 * comment length + empty body), AC2.6 (flag + timestamp + system
 * comment), AC2.7 (auto-close preserves flag — multi-round), AC2.8
 * (mirror to existing_findings), AC2.9 (UI badge), AC2.13 (agent prompt
 * notice), AC2.11 (8 unit tests).
 *
 * The browser-only `src/ui/app.ts` module uses DOM globals at module
 * evaluation time, so direct import-based behavioral testing is not
 * feasible. Following the existing pattern in `src/reopen-stale.test.ts`,
 * these tests perform static analysis on `src/index.ts` and
 * `src/ui/app.ts` to confirm:
 *   - Finding type has additive `manually_edited?` + `edited_at?` fields
 *   - PATCH endpoint exists at /api/review/:id/findings/:findingId
 *   - Validation rejects invalid category / severity / comment length / empty body
 *   - Flag + timestamp + system comment are stamped on success
 *   - Auto-close path (reconcile) preserves `manually_edited` + `edited_at`
 *   - Mirror to `data.existing_findings[]` is performed
 *   - UI Edit button + showEditFindingModal + editFinding PATCH call exist
 *   - "edited <relative-time>" badge renders when `manually_edited === true`
 *   - Agent prompt notice mentions `manually_edited: true`
 *
 * Runtime behavior of the full flow (click Edit → modal → save → state
 * mutation) is covered by the new e2e scenario `edit-finding` in
 * `scripts/test-review-ui/scenarios.mjs` (scenario 23).
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const INDEX_TS = join(import.meta.dir, "index.ts");
const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

function patchBlock(src: string): string {
  const handlerIdx = src.indexOf('request.method === "PATCH" && editFindingPathnameMatch');
  if (handlerIdx < 0) return "";
  return src.slice(handlerIdx, handlerIdx + 6000);
}

describe("AC2.4 — Finding type + PATCH endpoint + URL pattern", () => {
  it("T10.2a Finding type has additive manually_edited + edited_at fields", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/manually_edited\?:\s*boolean;/);
    expect(src).toMatch(/edited_at\?:\s*number;/);
  });

  it("T10.2b PATCH endpoint matches /api/review/<id>/findings/<findingId>", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toContain("EDIT_FINDING_RE");
    expect(src).toContain("/api/review/");
    expect(src).toMatch(/function\s+editFindingPathnameMatch/);
    const block = patchBlock(src);
    expect(block).toMatch(/no fields to update/);
  });
});

describe("AC2.5 — Server validation (400 on bad input)", () => {
  it("T10.2c rejects invalid category", async () => {
    const block = patchBlock(await readSource(INDEX_TS));
    expect(block).toMatch(/invalid category:/);
    expect(block).toMatch(/isCategory/);
  });

  it("T10.2d rejects invalid severity", async () => {
    const block = patchBlock(await readSource(INDEX_TS));
    expect(block).toMatch(/invalid severity:/);
    expect(block).toMatch(/isSeverity/);
  });

  it("T10.2e rejects comment exceeding 2000 chars", async () => {
    const block = patchBlock(await readSource(INDEX_TS));
    expect(block).toMatch(/comment exceeds 2000 characters/);
  });
});

describe("AC2.6 / AC2.7 / AC2.8 — Flag + timestamp + audit + mirror", () => {
  it("T10.2f sets manually_edited + edited_at + appends system comment", async () => {
    const block = patchBlock(await readSource(INDEX_TS));
    expect(block).toMatch(/target\.manually_edited\s*=\s*true/);
    expect(block).toMatch(/target\.edited_at\s*=\s*Date\.now\(\)/);
    expect(block).toMatch(/Edited by user/);
    expect(block).toMatch(/target\.comments\.push/);
    expect(block).toMatch(/saveState/);
    expect(block).toMatch(/data\.existing_findings\[idx\]\s*=\s*\{\s*\.\.\.target\s*\}/);
  });

  it("T10.2g auto-close (reconcile) preserves manually_edited + edited_at — multi-round AC2.7", async () => {
    const src = await readSource(INDEX_TS);
    const reconcileIdx = src.indexOf("function reconcile");
    expect(reconcileIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(reconcileIdx, reconcileIdx + 2500);
    expect(block).toMatch(/\.\.\.item/);
    expect(block).toMatch(/status:\s*"closed_auto"/);
    expect(block).toMatch(/close_reason:\s*"anchor_missing"/);
    expect(block).toMatch(/updated_at:\s*now/);
  });

  it("T10.2h UI Edit button + showEditFindingModal + editFinding exist", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/async function\s+editFinding\s*\(/);
    expect(src).toMatch(/function\s+showEditFindingModal\s*\(/);
    expect(src).toMatch(/method:\s*"PATCH"/);
    expect(src).toContain("/findings/");
  });
});

describe("AC2.9 / AC2.13 — UI badge + agent prompt notice", () => {
  it("T10.2i edited badge renders when manually_edited === true", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/badge-edited/);
    expect(src).toMatch(/entry\.manually_edited\s*&&\s*entry\.edited_at/);
    expect(src).toMatch(/edited \$\{escapeHtml\(formatRelativeTime/);
  });

  it("T10.2j agent prompt notice mentions manually_edited", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/Manually-edited findings \(R10 honor directive\)/);
    expect(src).toMatch(/manually_edited:\s*true/);
  });
});
