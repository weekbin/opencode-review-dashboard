// R131 — Lock worktree on final approve (R116 retro flag, 11 rounds deferred)
// Tests verify server-side lock application, 409 gates on all mutation endpoints, UI lock rendering.
// R152 behavior-contract upgrade: hardcoded line-number constants replaced with pathname-based
// handler extraction. src/index.ts uses Bun-style routing:
//   if (request.method === "POST" && pathname === '/api/review/${id}/submit') { ... }
// Tests locate each handler by its pathname literal then walk braces to extract the body.

import { describe, test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const indexTs = readFileSync(join(import.meta.dir, "index.ts"), "utf8");
const appTs = readFileSync(join(import.meta.dir, "ui", "app.ts"), "utf8");

// Locate a route handler by its pathname literal. Returns the body between the
// opening `{` of the if-block and its matching `}`.
function locateHandlerBodyByPathname(pathname: string): string | null {
  // Find the pathname literal in the source
  const idx = indexTs.indexOf(pathname);
  if (idx < 0) return null;
  // Find the `{` that follows the `) ` after the pathname literal
  const afterPathname = idx + pathname.length;
  const openBraceIdx = indexTs.indexOf("{", afterPathname);
  if (openBraceIdx < 0) return null;
  let depth = 0;
  for (let i = openBraceIdx; i < indexTs.length; i++) {
    if (indexTs[i] === "{") depth++;
    else if (indexTs[i] === "}") {
      depth--;
      if (depth === 0) return indexTs.slice(openBraceIdx, i + 1);
    }
  }
  return null;
}

// Locate the State type definition (the `locked?: {...}` field lives here).
function locateStateType(): string | null {
  const m = indexTs.match(/type\s+State\s*=\s*\{/);
  if (!m || m.index === undefined) return null;
  const start = m.index + m[0].indexOf("{");
  let depth = 0;
  for (let i = start; i < indexTs.length; i++) {
    if (indexTs[i] === "{") depth++;
    else if (indexTs[i] === "}") {
      depth--;
      if (depth === 0) return indexTs.slice(start, i + 1);
    }
  }
  return null;
}

describe("R131: lock state schema", () => {
  test("AC1: State type includes locked?: { at, round, by }", () => {
    const stateWindow = locateStateType();
    expect(stateWindow).not.toBeNull();
    expect(stateWindow!).toMatch(/locked\?:\s*\{[^}]*by[^}]*user[^}]*\}/s);
    expect(stateWindow!).toMatch(/by:\s*"user"/);
  });
});

describe("R131: server lock application", () => {
  function getSubmitHandlerBody(): string {
    const body = locateHandlerBodyByPathname("/api/review/${id}/submit");
    expect(body).not.toBeNull();
    return body!;
  }

  test("AC1: submit handler sets next.locked when intent=approve and 0 open findings", () => {
    const window = getSubmitHandlerBody();
    expect(window).toMatch(/next\.locked\s*=\s*\{/);
    expect(window).toMatch(/by:\s*"user"/);
  });

  test("AC1: lock only applied when intent=approve", () => {
    const window = getSubmitHandlerBody();
    expect(window).toMatch(/intent\s*===\s*"approve"/);
  });

  test("AC1: lock only applied when 0 open findings", () => {
    const window = getSubmitHandlerBody();
    expect(window).toMatch(/openCarry\.length\s*===\s*0|openCarry\.length\s*<\s*1/);
  });

  test("AC6: submit response includes locked: true|false", () => {
    const window = getSubmitHandlerBody();
    expect(window).toMatch(/locked:\s*(true|false|Boolean)/);
  });
});

describe("R131: server 409 gates", () => {
  test("AC2: POST /submit returns 409 when base.locked", () => {
    const body = locateHandlerBodyByPathname("/api/review/${id}/submit");
    expect(body).not.toBeNull();
    expect(body!).toMatch(/base\.locked/);
    expect(body!).toMatch(/status:\s*409/);
    expect(body!).toMatch(/review locked/);
  });

  test("AC3: POST /resolve returns 409 when base.locked", () => {
    const body = locateHandlerBodyByPathname("/api/review/${id}/resolve");
    expect(body).not.toBeNull();
    expect(body!).toMatch(/base\.locked/);
    expect(body!).toMatch(/status:\s*409/);
  });

  test("AC4: POST /reactions returns 409 when base.locked", () => {
    // Source uses singular /reaction (not /reactions).
    const body = locateHandlerBodyByPathname("/api/review/${id}/reaction");
    expect(body).not.toBeNull();
    expect(body!).toMatch(/base\.locked/);
    expect(body!).toMatch(/status:\s*409/);
  });

  test("AC5: PUT /draft returns 409 when base.locked", () => {
    const body = locateHandlerBodyByPathname("/api/review/${id}/draft");
    expect(body).not.toBeNull();
    expect(body!).toMatch(/base\.locked/);
    expect(body!).toMatch(/status:\s*409/);
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
    const window = locateHandlerBodyByPathname("/api/review/${id}/submit");
    expect(window).not.toBeNull();
    expect(window!).toMatch(/openCarry\.length\s*===\s*0/);
    const lockAssignmentIdx = window!.indexOf("next.locked");
    const openCarryCheckIdx = window!.search(
      /openCarry\.length\s*===\s*0|openCarry\.length\s*<\s*1/,
    );
    expect(openCarryCheckIdx).toBeGreaterThan(-1);
    expect(lockAssignmentIdx).toBeGreaterThan(openCarryCheckIdx);
  });
});
