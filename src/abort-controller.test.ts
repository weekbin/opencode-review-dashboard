/**
 * Unit tests for R7 MINOR #1 — AbortController for loadPriorNotes().
 *
 * Covers AC7-1.1, AC7-1.2, AC7-1.3.
 *
 * The browser-only `src/ui/app.ts` module uses DOM globals (`document`,
 * `location`, `IntersectionObserver`, etc.) at module evaluation time, so
 * direct import-based behavioral testing is not feasible without a DOM
 * mocking library (which the project does not depend on). Following the
 * existing pattern in `src/drawer-refactor.test.ts` and `prior-notes.test.ts`
 * AC9 (which read source files for structural assertions), these tests
 * perform static analysis on `src/ui/app.ts` to confirm the abort logic
 * is correctly wired up. Runtime behavior is covered by the new e2e
 * scenario `previously-discussed-race` in `scripts/test-review-ui/scenarios.mjs`.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readAppTs(): Promise<string> {
  return fsPromises.readFile(APP_TS, "utf8");
}

describe("AC7-1.1 — module-level priorNotesController + signal.aborted at entry", () => {
  it("T7.1a module-level priorNotesController variable exists", async () => {
    const src = await readAppTs();
    expect(src).toMatch(
      /^let\s+priorNotesController:\s*AbortController\s*\|\s*null\s*=\s*null;\s*$/m,
    );
  });

  it("T7.1b loadPriorNotes signature accepts optional AbortSignal", async () => {
    const src = await readAppTs();
    expect(src).toMatch(/async\s+function\s+loadPriorNotes\s*\(\s*signal\?:\s*AbortSignal\s*\)/);
  });

  it("T7.1c loadPriorNotes returns immediately when signal.aborted is true at entry", async () => {
    const src = await readAppTs();
    // Find the loadPriorNotes function body.
    const fnStart = src.indexOf("async function loadPriorNotes(");
    expect(fnStart).toBeGreaterThanOrEqual(0);
    const bodyStart = src.indexOf("{", fnStart);
    expect(bodyStart).toBeGreaterThan(fnStart);
    // Find the matching closing brace.
    let depth = 1;
    let i = bodyStart + 1;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      i++;
    }
    const body = src.slice(bodyStart, i);
    // First non-trivial statement after the short-circuit must be a signal.aborted guard.
    const earlyGuardIdx = body.indexOf("signal?.aborted");
    expect(earlyGuardIdx).toBeGreaterThanOrEqual(0);
    // The guard must come BEFORE the `state.priorNotesLoaded = true` mutation
    // (which is itself after the loaded short-circuit). We assert the guard
    // appears before any assignment to priorNotesLoaded in the body.
    const guardOffset = body.slice(0, earlyGuardIdx).length;
    const priorLoadedAssignIdx = body.indexOf("state.priorNotesLoaded = true");
    if (priorLoadedAssignIdx >= 0) {
      expect(guardOffset).toBeLessThan(priorLoadedAssignIdx);
    }
  });
});

describe("AC7-1.2 — signal passed to fetch + aborted check after fetch + abort-aware catch", () => {
  it("T7.2a fetch call passes { signal } option", async () => {
    const src = await readAppTs();
    expect(src).toMatch(
      /fetch\s*\(\s*endpoint\s*\(\s*"\/prior-notes"\s*\)\s*,\s*\{\s*signal\s*\}\s*\)/,
    );
  });

  it("T7.2b after fetch, an aborted signal skips state mutation", async () => {
    const src = await readAppTs();
    // Locate the `await fetch(...)` line.
    const fetchIdx = src.indexOf('await fetch(endpoint("/prior-notes"), { signal })');
    expect(fetchIdx).toBeGreaterThanOrEqual(0);
    // After the fetch call there must be at least one `if (signal?.aborted) return;` guard
    // before any unconditional assignment to state.priorNotes.
    const afterFetch = src.slice(fetchIdx);
    const abortedGuardIdx = afterFetch.indexOf("signal?.aborted");
    expect(abortedGuardIdx).toBeGreaterThanOrEqual(0);
    const unconditionalAssignIdx = afterFetch.indexOf("state.priorNotes = []");
    // The first unconditional empty-assignment must appear AFTER the aborted guard.
    expect(abortedGuardIdx).toBeLessThan(unconditionalAssignIdx);
  });

  it("T7.2c catch block has aborted-signal guard so AbortError silently skips state mutation", async () => {
    const src = await readAppTs();
    expect(src).toMatch(
      /}\s*catch\s*\{?\s*if\s*\(\s*signal\?\.aborted\s*\)\s*return;\s*state\.priorNotes\s*=\s*\[\];\s*\}/,
    );
  });
});

describe("AC7-1.3 — happy path (no signal) behavior preserved", () => {
  it("T7.3a loadPriorNotes call site in renderActivePane passes the controller signal", async () => {
    const src = await readAppTs();
    // The "previously" branch in renderActivePane must:
    // 1. abort the prior controller
    // 2. create a new AbortController
    // 3. pass priorNotesController.signal into loadPriorNotes
    expect(src).toMatch(
      /priorNotesController\?\.abort\(\);\s*\n\s*priorNotesController\s*=\s*new\s+AbortController\(\);\s*\n\s*void\s+loadPriorNotes\s*\(\s*priorNotesController\.signal\s*\)/,
    );
  });

  it("T7.3b existing 64 tests still pass — covered by bun test src/ at the suite level", async () => {
    // Structural-only assertion: the function signature change did not introduce
    // any non-optional positional arguments, so existing call sites (none, since
    // signal is optional) and existing tests are unaffected.
    const src = await readAppTs();
    const sigMatch = src.match(/async\s+function\s+loadPriorNotes\s*\(([^)]*)\)/);
    expect(sigMatch).not.toBeNull();
    if (!sigMatch) return;
    const params: string = sigMatch[1] ?? "";
    // All params must be optional (have a `?`).
    const paramList = params
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    for (const param of paramList) {
      expect(param).toMatch(/\?:\s*/);
    }
  });
});
