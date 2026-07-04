// R102 Gap #1 fix regression test.
// Pins the structural order: .husky/pre-commit must run format --write BEFORE bun test
// so anchor drift caused by silent reformat is caught deterministically.
//
// Without this order, the previous sequence ran `bun run check` (which includes
// `oxfmt --check` only) BEFORE `bun test`, then `bun run format` (which rewrites
// files) could be run separately. Anchor drift from silent reformat would not be
// caught at commit time.

import { describe, expect, it } from "bun:test";

const PRE_COMMIT = ".husky/pre-commit";

describe("R102 — pre-commit Gap #1 fix (format-write runs before bun test)", () => {
  it("pre-commit script contains 'oxfmt --write' command (line-anchored, gate only)", async () => {
    const script = await Bun.file(PRE_COMMIT).text();
    // Match lines that begin with the command (gate code), not header-comment prose.
    expect(script).toMatch(/^bunx oxfmt --write/m);
  });

  it("pre-commit re-stages src/ via 'git add -u src/' (line-anchored, gate only)", async () => {
    const script = await Bun.file(PRE_COMMIT).text();
    expect(script).toMatch(/^git add -u src\//m);
  });

  it("'bun test' line runs AFTER 'oxfmt --write' line (drift detection order)", async () => {
    const script = await Bun.file(PRE_COMMIT).text();
    const writeMatch = script.match(/^bunx oxfmt --write/m);
    const testMatch = script.match(/^bun test/m);
    expect(writeMatch).not.toBeNull();
    expect(testMatch).not.toBeNull();
    expect(writeMatch!.index!).toBeLessThan(testMatch!.index!);
  });

  it("header comment documents Gap #1 rationale", async () => {
    const script = await Bun.file(PRE_COMMIT).text();
    expect(script).toContain("Gap #1 fix");
    expect(script).toMatch(/anchor drift/i);
  });
});
