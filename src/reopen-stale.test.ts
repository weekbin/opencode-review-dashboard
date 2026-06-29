/**
 * Unit tests for R9 #1 — Manually re-open stale (closed_auto) findings.
 *
 * Covers AC9-1.1, AC9-1.2, AC9-1.3, AC9-1.5, AC9-1.6, AC9-1.7, AC9-1.9,
 * AC9-1.10, AC9-1.13.
 *
 * The browser-only `src/ui/app.ts` module uses DOM globals at module
 * evaluation time, so direct import-based behavioral testing is not
 * feasible. Following the existing pattern in `src/abort-controller.test.ts`
 * and `src/sidebar-keyboard.test.ts`, these tests perform static analysis
 * on `src/index.ts` and `src/ui/app.ts` to confirm the server-guard
 * widening, the agent-prompt honor directive, the UI Force Reopen button,
 * and the reopenFinding payload shape are correctly wired up.
 *
 * Runtime behavior of the full flow (click → modal → POST → state
 * mutation) is covered by:
 *   - the new e2e scenario `reopen-stale-finding` in
 *     `scripts/test-review-ui/scenarios.mjs` (scenario 20)
 *   - the Playwright walkthrough screenshot in
 *     `docs/screenshots/r9-s1-reopen-stale.png`
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

describe("AC9-1.1 / AC9-1.2 — Finding.manually_reopened field + server input shape", () => {
  it("T9.1a Finding type has optional manually_reopened field", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/manually_reopened\?:\s*boolean;/);
  });

  it("T9.1b reopen handler accepts manually_reopened + reason in the input body", async () => {
    const src = await readSource(INDEX_TS);
    // Locate the reopen handler block.
    const handlerIdx = src.indexOf("pathname === `/api/review/${id}/reopen`");
    expect(handlerIdx).toBeGreaterThanOrEqual(0);
    // The handler must declare the input shape with manually_reopened + reason.
    const block = src.slice(handlerIdx, handlerIdx + 1500);
    expect(block).toMatch(/manually_reopened\?:\s*boolean/);
    expect(block).toMatch(/reason\?:\s*string/);
  });
});

describe("AC9-1.3 — server guard widens for closed_auto + manually_reopened === true", () => {
  it("T9.1c guard accepts manually_reopened === true AND status === 'closed_auto'", async () => {
    const src = await readSource(INDEX_TS);
    const handlerIdx = src.indexOf("pathname === `/api/review/${id}/reopen`");
    expect(handlerIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(handlerIdx, handlerIdx + 2000);
    // The guard line must allow manualOverride when status is closed_auto.
    expect(block).toMatch(
      /manualOverride\s*=\s*input\.manually_reopened\s*===\s*true\s*&&\s*target\.status\s*===\s*"closed_auto"/,
    );
    expect(block).toMatch(/target\.status\s*!==\s*"resolved"\s*&&\s*!manualOverride/);
  });

  it("T9.1d on manualOverride, target.manually_reopened = true + close_reason = undefined", async () => {
    const src = await readSource(INDEX_TS);
    const handlerIdx = src.indexOf("pathname === `/api/review/${id}/reopen`");
    expect(handlerIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(handlerIdx, handlerIdx + 5000);
    expect(block).toMatch(
      /if\s*\(\s*manualOverride\s*\)\s*\{[\s\S]*?target\.manually_reopened\s*=\s*true/,
    );
    expect(block).toMatch(/target\.close_reason\s*=\s*undefined/);
  });

  it("T9.1e on manualOverride, a user-author comment 'Manually reopened: <reason>' is appended", async () => {
    const src = await readSource(INDEX_TS);
    const handlerIdx = src.indexOf("pathname === `/api/review/${id}/reopen`");
    expect(handlerIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(handlerIdx, handlerIdx + 5000);
    expect(block).toMatch(/Manually reopened:/);
    expect(block).toMatch(/author:\s*"user"/);
    expect(block).toMatch(/\.slice\(\s*0\s*,\s*200\s*\)/);
  });

  it("T9.1f without manually_reopened, the strict status guard still rejects closed_auto", async () => {
    const src = await readSource(INDEX_TS);
    const handlerIdx = src.indexOf("pathname === `/api/review/${id}/reopen`");
    expect(handlerIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(handlerIdx, handlerIdx + 2000);
    // The 400 reject path must still fire when manualOverride is false AND
    // status is not 'resolved' (so the !manualOverride negation in the guard
    // is critical to preserving the original behavior).
    expect(block).toMatch(/cannot reopen \(status: \$\{target\.status\}\)/);
  });
});

describe("AC9-1.5 / AC9-1.6 — agent prompt honor directive + step renumber", () => {
  it("T9.1g agent prompt contains 'Manually-reopened findings (R9 honor directive)' section", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/\*\*Manually-reopened findings \(R9 honor directive\)\*\*:/);
  });

  it("T9.1h prompt contains 'Do NOT re-auto-close' explicit directive", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/Do NOT re-auto-close/);
  });

  it("T9.1i prompt contains a concrete F-007 example illustrating stale → force reopen → re-apply", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/F-007/);
    expect(src).toMatch(/close_reason:\s*'anchor_missing'/);
  });

  it("T9.1j existing 1./2./3./4./5. steps renumbered to 2./3./4./5./6. (PM Manager gate)", async () => {
    const src = await readSource(INDEX_TS);
    // The old '1. **Round Summary**' should now be '2. **Round Summary**'.
    expect(src).toMatch(/2\. \*\*Round Summary/);
    expect(src).toMatch(/3\. \*\*Plan-First Rule\*\*/);
    expect(src).toMatch(/4\. \*\*Fix Application\*\*/);
    expect(src).toMatch(/5\. \*\*Validation\*\*/);
    expect(src).toMatch(/6\. \*\*Closing Rule\*\*/);
    // The new '1.' slot is occupied by the R9 honor directive.
    expect(src).toMatch(/1\. \*\*Manually-reopened findings/);
  });
});

describe("AC9-1.10 — UI Force Reopen button on stale findings", () => {
  it("T9.1k renderConversationPanel action branch widened to isResolved || isStale (no !isStale)", async () => {
    const src = await readSource(APP_TS);
    // The branch must be `else if (isResolved || isStale)` so the Reopen
    // button shows on both resolved findings AND stale (closed_auto)
    // findings. The old `&& !isStale` clause is gone.
    expect(src).toMatch(/\}\s*else\s+if\s*\(\s*isResolved\s*\|\|\s*isStale\s*\)\s*\{/);
    // Belt-and-suspenders: assert the old broken form is no longer present.
    expect(src).not.toMatch(/isResolved\s*&&\s*!isStale/);
  });

  it("T9.1l button text changes to 'Force Reopen' when isStale", async () => {
    const src = await readSource(APP_TS);
    // Find the isResolved||isStale branch and inspect the button text logic.
    const branchIdx = src.indexOf("} else if (isResolved || isStale) {");
    expect(branchIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(branchIdx, branchIdx + 1500);
    expect(block).toMatch(/isStale\s*\?\s*"Force Reopen"\s*:\s*"Reopen"/);
  });

  it("T9.1m click handler awaits showReopenReasonModal + passes manually_reopened: true on stale", async () => {
    const src = await readSource(APP_TS);
    const branchIdx = src.indexOf("} else if (isResolved || isStale) {");
    expect(branchIdx).toBeGreaterThanOrEqual(0);
    const block = src.slice(branchIdx, branchIdx + 2000);
    expect(block).toMatch(/await\s+showReopenReasonModal/);
    expect(block).toMatch(/manually_reopened:\s*true/);
  });
});

describe("AC9-1.11 — showReopenReasonModal helper exists", () => {
  it("T9.1n showReopenReasonModal returns Promise<string | null>", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /function\s+showReopenReasonModal\s*\([^)]*\)\s*:\s*Promise<string\s*\|\s*null>/,
    );
  });

  it("T9.1o modal renders textarea + Cancel + Re-open buttons + click-outside dismiss", async () => {
    const src = await readSource(APP_TS);
    const fnIdx = src.indexOf("function showReopenReasonModal(");
    expect(fnIdx).toBeGreaterThanOrEqual(0);
    const fnEnd = src.indexOf("\n}\n", fnIdx);
    const block = src.slice(fnIdx, fnEnd);
    expect(block).toMatch(/<textarea[^>]*id="reopen-reason"/);
    expect(block).toMatch(/id="reopen-cancel"/);
    expect(block).toMatch(/id="reopen-submit"/);
    expect(block).toMatch(/e\.target\s*===\s*overlay/);
  });
});

describe("AC9-1.13 — reopenFinding signature widens with reason + opts", () => {
  it("T9.1p reopenFinding signature: (id, reason='', opts={manually_reopened?})", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /async\s+function\s+reopenFinding\s*\(\s*\n?\s*id:\s*string\s*,\s*\n?\s*reason\s*=\s*"",\s*\n?\s*opts:\s*\{\s*manually_reopened\?:\s*boolean\s*\}\s*=\s*\{\}\s*,?\s*\)/,
    );
  });

  it("T9.1q reopenFinding POST body includes manually_reopened when set + reason.slice(0,200)", async () => {
    const src = await readSource(APP_TS);
    const fnIdx = src.indexOf("async function reopenFinding(");
    expect(fnIdx).toBeGreaterThanOrEqual(0);
    const fnEnd = src.indexOf("\n}\n", fnIdx);
    const block = src.slice(fnIdx, fnEnd);
    expect(block).toMatch(/body\.manually_reopened\s*=\s*true/);
    expect(block).toMatch(/body\.reason\s*=\s*reason\.slice\(\s*0\s*,\s*200\s*\)/);
    expect(block).toMatch(/JSON\.stringify\(\s*body\s*\)/);
  });

  it("T9.1r reopenFinding updates in-memory item.manually_reopened + clears close_reason on success", async () => {
    const src = await readSource(APP_TS);
    const fnIdx = src.indexOf("async function reopenFinding(");
    expect(fnIdx).toBeGreaterThanOrEqual(0);
    const fnEnd = src.indexOf("\n}\n", fnIdx);
    const block = src.slice(fnIdx, fnEnd);
    expect(block).toMatch(/item\.manually_reopened\s*=\s*true/);
    expect(block).toMatch(/item\.close_reason\s*=\s*undefined/);
  });
});
