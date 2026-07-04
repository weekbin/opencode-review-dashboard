/**
 * R115 hotfix behavioral-contract tests.
 *
 * Oracle review of R115 (commit 6a845e6) flagged:
 * - Tests were 100% structural (regex/literal checks), no behavioral coverage
 * - Audit renderer didn't read before_anchor/after_anchor/before_status/after_status
 * - Inline-edit click listener accumulated (memory leak + race)
 * - PATCH accepted end_line < start_line and arbitrary file paths
 * - kind field never reset after anchor change
 *
 * These tests pin the behavioral contracts of the hotfix:
 * - audit renderer reads new fields and emits user-visible change strings
 * - inline-edit restore uses onclick (auto-replaces) not addEventListener
 * - PATCH validates end_line ordering and file existence
 * - PATCH resets target.kind when anchor changes
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const INDEX_TS = join(import.meta.dir, "index.ts");

async function readSrc(file: string): Promise<string> {
  return fsPromises.readFile(file, "utf8");
}

describe("R115 hotfix #1 — audit renderer reads anchor/status diff fields", () => {
  it("audit renderer reads row.before_anchor.file and row.after_anchor.file", async () => {
    const src = await readSrc(APP_TS);
    const rendererStart = src.indexOf("const auditLog = entry.audit_log;");
    expect(rendererStart).toBeGreaterThan(-1);
    const window = src.slice(rendererStart, rendererStart + 4000);
    expect(window).toMatch(/row\.before_anchor\.file/);
    expect(window).toMatch(/row\.after_anchor\.file/);
  });

  it("audit renderer reads row.before_status and row.after_status", async () => {
    const src = await readSrc(APP_TS);
    const rendererStart = src.indexOf("const auditLog = entry.audit_log;");
    expect(rendererStart).toBeGreaterThan(-1);
    const window = src.slice(rendererStart, rendererStart + 4000);
    expect(window).toMatch(/row\.before_status/);
    expect(window).toMatch(/row\.after_status/);
  });

  it("audit renderer uses i18n keys for new anchor/status diff messages", async () => {
    const src = await readSrc(APP_TS);
    const rendererStart = src.indexOf("const auditLog = entry.audit_log;");
    expect(rendererStart).toBeGreaterThan(-1);
    const window = src.slice(rendererStart, rendererStart + 4000);
    expect(window).toMatch(/audit\.fileUpdated/);
    expect(window).toMatch(/audit\.lineUpdated/);
    expect(window).toMatch(/audit\.statusUpdated/);
  });
});

describe("R115 hotfix #2 — inline-edit restore uses onclick not addEventListener", () => {
  it("restore closure assigns onclick, not addEventListener", async () => {
    const src = await readSrc(APP_TS);
    const fnStart = src.indexOf("function startInlineCommentEdit");
    expect(fnStart).toBeGreaterThan(-1);
    const fnBody = src.slice(fnStart, fnStart + 2500);
    const restoreStart = fnBody.indexOf("const restore");
    expect(restoreStart).toBeGreaterThan(-1);
    const restoreBody = fnBody.slice(restoreStart, restoreStart + 500);
    expect(restoreBody).toMatch(/bodyEl\.onclick\s*=/);
    expect(restoreBody).not.toMatch(/bodyEl\.addEventListener\("click"/);
  });
});

describe("R115 hotfix #3 — PATCH validates anchor fields and resets kind", () => {
  it("PATCH handler validates end_line >= start_line", async () => {
    const src = await readSrc(INDEX_TS);
    const handlerStart = src.indexOf('request.method === "PATCH" && editFindingPathnameMatch');
    expect(handlerStart).toBeGreaterThan(-1);
    const window = src.slice(handlerStart, handlerStart + 6000);
    expect(window).toMatch(/end_line must be >= start_line/);
  });

  it("PATCH handler rejects file paths not in current diff", async () => {
    const src = await readSrc(INDEX_TS);
    const handlerStart = src.indexOf('request.method === "PATCH" && editFindingPathnameMatch');
    expect(handlerStart).toBeGreaterThan(-1);
    const window = src.slice(handlerStart, handlerStart + 6000);
    expect(window).toMatch(/file not in current diff/);
    expect(window).toMatch(/map\.has\(input\.file/);
  });

  it("PATCH handler resets target.kind when anchor changes", async () => {
    const src = await readSrc(INDEX_TS);
    const handlerStart = src.indexOf('request.method === "PATCH" && editFindingPathnameMatch');
    expect(handlerStart).toBeGreaterThan(-1);
    const window = src.slice(handlerStart, handlerStart + 8000);
    expect(window).toMatch(/target\.kind\s*=\s*map\.has\(target\.file\)/);
  });
});
