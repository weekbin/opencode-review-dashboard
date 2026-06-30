/**
 * Unit tests for R13 #21 — Mark as wontfix (GH#21, close #21).
 *
 * Covers AC3 (Mark as wontfix button + 4 radio modal),
 * AC4 (server /resolve accepts resolution_kind? with 400 on unknown
 * enum + finding gets resolution_kind + resolution_reason; status
 * stays "resolved"), AC5 (conversation panel renders
 * <span class="badge badge-resolution-{kind}">).
 *
 * Runtime flows (radio click → POST /resolve with kind → badge render)
 * are verified via the `mark-as-wontfix` e2e scenario + the Lead's
 * Playwright walkthrough.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const INDEX_TS = join(import.meta.dir, "index.ts");
const APP_TS = join(import.meta.dir, "ui", "app.ts");
const HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC3 — Mark as wontfix button + radio modal", () => {
  it("T13.21.R3a 'Mark as wontfix' button rendered next to 'Resolve' on open findings", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/finding-wontfix/);
    expect(src).toMatch(/wontfixBtn\.textContent\s*=\s*"Mark as wontfix"/);
  });

  it("T13.21.R3b showMarkAsWontfixModal renders 4 radio buttons (one per enum value)", async () => {
    const src = await readSource(APP_TS);
    // The 4 enum values live in the MARKS_AS_WONTFIX_KINDS table
    // (declared at module level above the function). The function
    // references it via .map(). Verify both the table AND the
    // function body's use of it.
    expect(src).toMatch(
      /MARKS_AS_WONTFIX_KINDS:\s*\{[^}]*value:\s*FindingResolutionKind[^}]*\}\[\]\s*=\s*\[/,
    );
    expect(src).toMatch(/value:\s*"wontfix"/);
    expect(src).toMatch(/value:\s*"out_of_scope"/);
    expect(src).toMatch(/value:\s*"false_positive"/);
    expect(src).toMatch(/value:\s*"duplicate"/);
    const block = src.match(/function\s+showMarkAsWontfixModal\s*\([\s\S]*?\n\}\s*\n/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/MARKS_AS_WONTFIX_KINDS\.map/);
    expect(block![0]).toMatch(/type="radio"/);
  });

  it("T13.21.R3c modal Cancel returns null; Confirm returns { kind, reason } (≤200 char slice)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+showMarkAsWontfixModal\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/closeWith\(null\)/);
    expect(block![0]).toMatch(
      /closeWith\(\{\s*kind,\s*reason:\s*trimmed\.slice\(0,\s*200\)\s*\}\)/,
    );
  });

  it("T13.21.R3d Mark as wontfix button uses .finding-wontfix class (secondary visual style)", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.finding-wontfix\s*\{/);
  });
});

describe("AC4 — Server /resolve endpoint accepts optional resolution_kind with 400 validation", () => {
  it("T13.21.R4a POST /resolve validates resolution_kind against the 4-value whitelist (400 on miss)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/isFindingResolutionKind\(input\.resolution_kind\)/);
    expect(block![0]).toMatch(/status:\s*400/);
    expect(block![0]).toMatch(/invalid resolution_kind:/);
  });

  it("T13.21.R4b error message lists allowed values (mirrors EMOJI_WHITELIST shape at :2161-2168)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    expect(block![0]).toMatch(/\[\.\.\.RESOLUTION_KIND_WHITELIST\]\.join\(",\s*"\)/);
  });

  it("T13.21.R4c target.resolution_kind + target.resolution_reason stamped when kind provided", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    expect(block![0]).toMatch(/target\.resolution_kind\s*=\s*input\.resolution_kind/);
    expect(block![0]).toMatch(/target\.resolution_reason\s*=/);
  });

  it("T13.21.R4d status stays 'resolved' (NOT a new 'wontfix' status — just stamps the kind)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/resolve`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/reopen`)/,
    );
    // The existing target.status = "resolved" line must remain (no
    // branching on resolution_kind for status).
    expect(block![0]).toMatch(/target\.status\s*=\s*"resolved"/);
  });
});

describe("AC5 — Conversation panel renders badge-resolution-{kind}", () => {
  it("T13.21.R5a badgesRow renders a `badge badge-resolution-{kind}` span", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/badge-resolution-\$\{escapeHtml\(entry\.resolution_kind\)\}/);
  });

  it("T13.21.R5b badge is appended to the existing severity / category / kind badges", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/badgesRow\.innerHTML\s*=\s*\[[\s\S]*?\]\.join\(""\)/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/entry\.severity/);
    expect(block![0]).toMatch(/entry\.category/);
    expect(block![0]).toMatch(/entry\.kind/);
    expect(block![0]).toMatch(/resolutionKindBadge/);
  });

  it("T13.21.R5c badge hidden when entry has no resolution_kind", async () => {
    const src = await readSource(APP_TS);
    // The ternary spans multiple lines. Search for both the truthy
    // and falsy branches.
    expect(src).toMatch(/const\s+resolutionKindBadge\s*=\s*entry\.resolution_kind[\s\S]*?:\s*""/);
  });

  it("T13.21.R5d CSS for all 4 badge-resolution-{kind} variants exists in review.html", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.badge-resolution-wontfix\s*\{/);
    expect(html).toMatch(/\.badge-resolution-out_of_scope\s*\{/);
    expect(html).toMatch(/\.badge-resolution-false_positive\s*\{/);
    expect(html).toMatch(/\.badge-resolution-duplicate\s*\{/);
  });
});

describe("AC12 — Agent prompt gains 2 R13 honor directives", () => {
  it("T13.21.R12a Manually-resolved (R13) honor directive appended (parallel to 1b Manually-pinned)", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/1c\.\s+\*\*Manually-resolved findings \(R13 honor directive\)\*\*:/);
  });

  it("T13.21.R12b Resolution-kind (R13) honor directive appended (parallel to 1b Manually-pinned)", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/1d\.\s+\*\*Resolution-kind findings \(R13 honor directive\)\*\*:/);
  });
});
