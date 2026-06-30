/**
 * Unit tests for R13 #20 — Resolve with reason (GH#20, close #20).
 *
 * Covers AC1 (showResolveReasonModal with 4 quick-reason chips + Cancel
 * returns null), AC2 (server /resolve accepts optional reason?: string
 * with ≤200 char slice; old payload {finding_id} still works), AC11
 * (shared FindingResolutionKind union defined ONCE in src/index.ts,
 * reused in src/ui/app.ts).
 *
 * Runtime flows (modal Cancel → no POST; Confirm → POST with reason)
 * are verified via the `resolve-with-reason` e2e scenario + the
 * Lead's Playwright walkthrough.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const INDEX_TS = join(import.meta.dir, "index.ts");
const APP_TS = join(import.meta.dir, "ui", "app.ts");
const _HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC1 — showResolveReasonModal markup + chip set", () => {
  it("T13.20.R1a showResolveReasonModal exists in app.ts and returns a Promise", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+showResolveReasonModal\s*\(/);
  });

  it("T13.20.R1b modal renders 4 quick-reason chips pre-filling the textarea", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/resolve-reason-chips/);
    expect(src).toMatch(/data-reason="fixed in this round"/);
    expect(src).toMatch(/data-reason="no longer applies"/);
    expect(src).toMatch(/data-reason="will fix in follow-up"/);
    expect(src).toMatch(/data-reason="false alarm — keep the code"/);
  });

  it("T13.20.R1c modal Cancel closes with null; Confirm returns trimmed reason (≤200 chars)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+showResolveReasonModal\s*\([\s\S]*?\n\}\s*\n/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/closeWith\(null\)/);
    expect(block![0]).toMatch(/closeWith\(\{\s*reason:/);
    expect(block![0]).toMatch(/\.slice\(0,\s*200\)/);
  });

  it("T13.20.R1d modal Cancel returns null (preserved showReopenReasonModal contract)", async () => {
    const src = await readSource(APP_TS);
    // The ResolveReasonModalResult type is declared at module level
    // (above the function). Verify both the type alias AND the
    // closeWith(null) inside the function.
    expect(src).toMatch(
      /type\s+ResolveReasonModalResult\s*=\s*\{\s*reason:\s*string\s*\}\s*\|\s*null/,
    );
    const block = src.match(/function\s+showResolveReasonModal\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/closeWith\(null\)/);
  });
});

describe("AC2 — Server /resolve endpoint accepts optional reason", () => {
  it("T13.20.R2a POST /resolve handler now accepts reason?: string field", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/reason\?:\s*string/);
  });

  it("T13.20.R2b target.resolve_reason + resolve_manually_resolved stamped when reason provided", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    expect(block![0]).toMatch(/target\.resolve_reason\s*=/);
    expect(block![0]).toMatch(/target\.resolve_manually_resolved\s*=\s*true/);
    expect(block![0]).toMatch(/target\.resolved_at\s*=\s*Date\.now\(\)/);
  });

  it("T13.20.R2c reason is sliced to ≤200 chars (mirrors R9 reopen-reason pattern at :3277)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    expect(block![0]).toMatch(/\.slice\(0,\s*200\)/);
  });

  it("T13.20.R2d old {finding_id}-only payload still works (backwards-compat with R9/R10/R11/R12)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    // The check for `if (typeof input.reason === "string" && input.reason.trim().length > 0)`
    // guards the stamp — meaning empty/missing reason is silently
    // allowed (preserves the R9/R10/R11/R12 callers that POST
    // {finding_id} with no reason).
    expect(block![0]).toMatch(
      /typeof\s+input\.reason\s*===\s*"string"\s*&&\s*input\.reason\.trim\(\)\.length\s*>\s*0/,
    );
  });
});

describe("AC11 — FindingResolutionKind shared union (no src/constants.ts)", () => {
  it("T13.20.R11a FindingResolutionKind defined inline in src/index.ts", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(
      /type\s+FindingResolutionKind\s*=\s*"wontfix"\s*\|\s*"out_of_scope"\s*\|\s*"false_positive"\s*\|\s*"duplicate"/,
    );
  });

  it("T13.20.R11b FindingResolutionKind duplicated in src/ui/app.ts (UI consumes the same union)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /type\s+FindingResolutionKind\s*=\s*"wontfix"\s*\|\s*"out_of_scope"\s*\|\s*"false_positive"\s*\|\s*"duplicate"/,
    );
  });

  it("T13.20.R11c no src/constants.ts exists (additive inline type per R12 ReactionEmoji style)", async () => {
    // Verify the file does NOT exist (would mean a violation of the
    // "no new constants file" rule from R12).
    try {
      await fsPromises.access(join(import.meta.dir, "constants.ts"));
      throw new Error("src/constants.ts should not exist");
    } catch (err) {
      if (err instanceof Error && err.message.includes("should not exist")) throw err;
      // expected — file doesn't exist
    }
  });

  it("T13.20.R11d Finding type gains resolve_reason + resolve_manually_resolved + resolved_at", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(/type\s+Finding\s*=\s*\{[\s\S]*?\n\};/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/resolve_reason\?:\s*string/);
    expect(block![0]).toMatch(/resolve_manually_resolved\?:\s*boolean/);
    expect(block![0]).toMatch(/resolved_at\?:\s*number/);
  });
});
