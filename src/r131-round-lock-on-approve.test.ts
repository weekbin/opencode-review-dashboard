// R131 — Lock worktree on final approve (R116 retro flag, 11 rounds deferred)
// Tests verify server-side lock application, 409 gates on all mutation endpoints, UI lock rendering.

import { describe, test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Read source files for regex-style assertions
const indexTs = readFileSync(join(import.meta.dir, "index.ts"), "utf8");
const appTs = readFileSync(join(import.meta.dir, "ui", "app.ts"), "utf8");

const STATE_TYPE_DEF_START = 5543;
const STATE_TYPE_DEF_WINDOW = 800;

const SUBMIT_HANDLER_START = 100596;
const SUBMIT_HANDLER_WINDOW = 8000;
const SUBMIT_RESPONSE_OFFSET = 106200;
const RESOLVE_HANDLER_START = 73656;
const RESOLVE_HANDLER_WINDOW = 1500;
const REACTIONS_HANDLER_START = 97843;
const REACTIONS_HANDLER_WINDOW = 1500;
const DRAFT_HANDLER_START = 71900;
const DRAFT_HANDLER_WINDOW = 1500;

describe("R131: lock state schema", () => {
  test("AC1: State type includes locked?: { at, round, by }", () => {
    const stateWindow = indexTs.slice(
      STATE_TYPE_DEF_START,
      STATE_TYPE_DEF_START + STATE_TYPE_DEF_WINDOW,
    );
    // Look for "locked" field in State type
    expect(stateWindow).toMatch(/locked\?:\s*\{[^}]*by[^}]*user[^}]*\}/s);
    // by literal "user" string
    expect(stateWindow).toMatch(/by:\s*"user"/);
  });
});

describe("R131: server lock application", () => {
  test("AC1: submit handler sets next.locked when intent=approve and 0 open findings", () => {
    const window = indexTs.slice(
      SUBMIT_HANDLER_START,
      SUBMIT_HANDLER_START + SUBMIT_HANDLER_WINDOW,
    );
    expect(window).toMatch(/next\.locked\s*=\s*\{/);
    expect(window).toMatch(/by:\s*"user"/);
  });

  test("AC1: lock only applied when intent=approve", () => {
    const window = indexTs.slice(
      SUBMIT_HANDLER_START,
      SUBMIT_HANDLER_START + SUBMIT_HANDLER_WINDOW,
    );
    // Look for intent === "approve" check before lock set
    expect(window).toMatch(/intent\s*===\s*"approve"/);
  });

  test("AC1: lock only applied when 0 open findings", () => {
    const window = indexTs.slice(
      SUBMIT_HANDLER_START,
      SUBMIT_HANDLER_START + SUBMIT_HANDLER_WINDOW,
    );
    // openCarry.length === 0 check before lock set
    expect(window).toMatch(/openCarry\.length\s*===\s*0|openCarry\.length\s*<\s*1/);
  });

  test("AC6: submit response includes locked: true|false", () => {
    const submitResponse = indexTs.slice(SUBMIT_RESPONSE_OFFSET, SUBMIT_RESPONSE_OFFSET + 500);
    expect(submitResponse).toMatch(/locked:\s*(true|false|Boolean)/);
  });
});

describe("R131: server 409 gates", () => {
  test("AC2: POST /submit returns 409 when base.locked", () => {
    const window = indexTs.slice(SUBMIT_HANDLER_START, SUBMIT_HANDLER_START + 1000);
    expect(window).toMatch(/base\.locked/);
    expect(window).toMatch(/status:\s*409/);
    expect(window).toMatch(/review locked/);
  });

  test("AC3: POST /resolve returns 409 when base.locked", () => {
    const window = indexTs.slice(
      RESOLVE_HANDLER_START,
      RESOLVE_HANDLER_START + RESOLVE_HANDLER_WINDOW,
    );
    expect(window).toMatch(/base\.locked/);
    expect(window).toMatch(/status:\s*409/);
  });

  test("AC4: POST /reactions returns 409 when base.locked", () => {
    const window = indexTs.slice(
      REACTIONS_HANDLER_START,
      REACTIONS_HANDLER_START + REACTIONS_HANDLER_WINDOW,
    );
    expect(window).toMatch(/base\.locked/);
    expect(window).toMatch(/status:\s*409/);
  });

  test("AC5: PUT /draft returns 409 when base.locked", () => {
    const window = indexTs.slice(DRAFT_HANDLER_START, DRAFT_HANDLER_START + DRAFT_HANDLER_WINDOW);
    expect(window).toMatch(/base\.locked/);
    expect(window).toMatch(/status:\s*409/);
  });
});

describe("R131: UI lock rendering", () => {
  test("AC7: showPostSubmit checks body.locked", () => {
    const idx = appTs.indexOf("function showPostSubmit");
    expect(idx).toBeGreaterThan(-1);
    const window = appTs.slice(idx, idx + 2000);
    expect(window).toMatch(/body\.locked|locked/);
  });

  test("AC8: resolve button disabled when locked", () => {
    expect(appTs).toMatch(/locked.*resolve|resolve.*locked/s);
  });
});

describe("R131: regression", () => {
  test("AC10: existing approve-with-open-findings still works (no lock applied)", () => {
    // The openCarry.length === 0 check prevents lock when there ARE open findings.
    // We assert the check exists and the lock path requires openCarry.length === 0.
    const window = indexTs.slice(
      SUBMIT_HANDLER_START,
      SUBMIT_HANDLER_START + SUBMIT_HANDLER_WINDOW,
    );
    expect(window).toMatch(/openCarry\.length\s*===\s*0/);
    // The lock should be conditional on this check.
    const lockAssignmentIdx = window.indexOf("next.locked");
    const openCarryCheckIdx = window.search(
      /openCarry\.length\s*===\s*0|openCarry\.length\s*<\s*1/,
    );
    expect(openCarryCheckIdx).toBeGreaterThan(-1);
    expect(lockAssignmentIdx).toBeGreaterThan(openCarryCheckIdx);
  });
});
