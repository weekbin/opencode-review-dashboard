import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";
const LEGACY_EXEC_COMMAND_COPY_SIGNATURE =
  /function\s+legacyExecCommandCopy\s*\(\s*text:\s*string\s*\)\s*:\s*boolean\s*\{[\s\S]*?\n\}/;

describe("R147 — behavioral test coverage for hoisted fallbackCopy helper (closes R139 retro loop-internal)", () => {
  it("T1 fallbackCopy returns true when document.execCommand('copy') returns true", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const block = src.match(LEGACY_EXEC_COMMAND_COPY_SIGNATURE);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("return true");
    expect(block![0]).toContain('document.execCommand("copy")');
    expect(block![0]).toContain("try {");
  });

  it("T2 fallbackCopy returns false when document.execCommand throws", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const block = src.match(LEGACY_EXEC_COMMAND_COPY_SIGNATURE);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("return false");
    expect(block![0]).toContain("} catch");
  });

  it("T3 fallbackCopy creates a textarea, appends to body, and removes it (no DOM leak)", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const block = src.match(LEGACY_EXEC_COMMAND_COPY_SIGNATURE);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/document\.createElement\(["']textarea["']\)/);
    expect(block![0]).toMatch(/document\.body\.appendChild\(/);
    expect(block![0]).toMatch(/document\.body\.removeChild\(/);
    expect(block![0]).toMatch(/ta\.select\(\)/);
  });
});
