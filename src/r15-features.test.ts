/**
 * Unit tests for R15 — Cmd+P file jumper (#26) + Submit confirm modal (#27) + Comments audit trail (#28).
 *
 * 12 AC tests + 2 defense-in-depth tests (AC11, AC12).
 * Follows existing test pattern: static source analysis via fs.readFile + regex assertions.
 *
 * Run with: bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const ROOT = import.meta.dir;
const INDEX_TS = join(ROOT, "index.ts");
const APP_TS = join(ROOT, "ui", "app.ts");
const REVIEW_HTML = join(ROOT, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

// ── R15 #26: Cmd+P file jumper ──

describe("AC1 — Cmd+P trigger", () => {
  it("T15.1a Cmd+P keydown listener exists in app.ts", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/\(event\.key === "p" \|\| event\.key === "P"\)/);
    expect(src).toMatch(/\(event\.metaKey \|\| event\.ctrlKey\)/);
    expect(src).toMatch(/!event\.shiftKey/);
  });

  it("T15.1b openCmdPPalette function is defined", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function openCmdPPalette\(\): void/);
  });

  it("T15.1c Cmd+P palette CSS exists in review.html", async () => {
    const src = await readSource(REVIEW_HTML);
    expect(src).toMatch(/\.cmd-p-overlay/);
    expect(src).toMatch(/\.cmd-p-palette/);
    expect(src).toMatch(/\.cmd-p-result/);
  });
});

describe("AC2 — Cmd+P palette content", () => {
  it("T15.2a palette filters getOrderedFiles() by substring", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/getOrderedFiles\(\)/);
    expect(src).toMatch(/path\.toLowerCase\(\)\.includes\(q\)/);
  });

  it("T15.2b results capped at 10", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/\.slice\(0,\s*10\)/);
  });
});

describe("AC3 — Cmd+P selection + navigation", () => {
  it("T15.3a Enter confirms selection", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/e\.key === "Enter".*confirmSelection/s);
  });

  it("T15.3b Escape closes palette", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/e\.key === "Escape".*close\(\)/s);
  });

  it("T15.3c Arrow keys navigate", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/ArrowDown.*selectNext\(1\)/s);
    expect(src).toMatch(/ArrowUp.*selectNext\(-1\)/s);
  });

  it("T15.3d click on result calls jumpToFile", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/jumpToFile\(file\.path\)/);
  });
});

// ── R15 #27: Submit confirm modal ──

describe("AC4 — Submit modal trigger", () => {
  it("T15.4a submitButton wrapped with modal opener", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/submitButton\.addEventListener\("click", \(\) =>/);
  });

  it("T15.4b modal shows open finding count", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/openCount/);
    expect(src).toMatch(/finding-count/);
  });

  it("T15.4c submit-confirm-modal CSS exists", async () => {
    const src = await readSource(REVIEW_HTML);
    expect(src).toMatch(/\.submit-confirm-modal/);
  });
});

describe("AC5 — Submit modal close behaviors", () => {
  it("T15.5a Cancel button closes", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/submit-confirm-cancel/);
  });

  it("T15.5b Escape key closes", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/e\.key === "Escape".*close\(\)/s);
  });

  it("T15.5c click-outside closes", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /overlay\.addEventListener\("click", \(e\) =>.*e\.target === overlay.*close/s,
    );
  });
});

// ── R15 #28: Comments audit trail ──

describe("AC6 — Audit trail trigger", () => {
  it("T15.6a editFinding captures before state before applying edits", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/const before:.*Pick<Finding, "category" \| "severity" \| "comment">/);
  });

  it("T15.6b editFinding pushes audit row when changes.length > 0", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/target\.audit_log\.push\(\{/);
  });
});

describe("AC7 — Audit trail storage", () => {
  it("T15.7a FindingAuditRow type is defined in index.ts", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/type FindingAuditRow = \{/);
  });

  it("T15.7b FindingAuditRow has before/after/at/by fields", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/before:.*Pick<Finding/);
    expect(src).toMatch(/after:.*Pick<Finding/);
    expect(src).toMatch(/at: number;/);
    expect(src).toMatch(/by: string;/);
  });

  it("T15.7c Finding type has audit_log?: FindingAuditRow[]", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/audit_log\?: FindingAuditRow\[\];/);
  });
});

describe("AC8 — Audit trail rendering", () => {
  it("T15.8a renderConversationPanel renders audit rows", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/auditLog && auditLog\.length > 0/);
  });

  it("T15.8b collapsible disclosure with edit count", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/audit-disclosure/);
    expect(src).toMatch(/edit.*click to expand/);
  });

  it("T15.8c audit-trail-row CSS exists", async () => {
    const src = await readSource(REVIEW_HTML);
    expect(src).toMatch(/\.audit-trail-row/);
  });
});

describe("AC9 — Backwards-compat", () => {
  it("T15.9 audit_log is optional (undefined-safe)", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/target\.audit_log = target\.audit_log \?\? \[\]/);
  });
});

describe("AC10 — Agent prompt integration", () => {
  it("T15.10 agent prompt mentions audit_log honor directive", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/Audit-trail findings \(R15 honor directive\)/);
    expect(src).toMatch(/audit_log.*is the user's current intent/);
  });
});

describe("AC11 — FindingAuditRow shared (no constants.ts)", () => {
  it("T15.11 FindingAuditRow defined in index.ts only", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/type FindingAuditRow = \{/);
  });
});

describe("AC12 — All 3 features additive", () => {
  it("T15.12 existing Finding fields all preserved", async () => {
    const src = await readSource(INDEX_TS);
    expect(src).toMatch(/manually_edited\?: boolean;/);
    expect(src).toMatch(/edited_at\?: number;/);
    expect(src).toMatch(/manually_reopened\?: boolean;/);
    expect(src).toMatch(/pinned\?: FindingPin;/);
    expect(src).toMatch(/resolution_kind\?: FindingResolutionKind;/);
  });
});
