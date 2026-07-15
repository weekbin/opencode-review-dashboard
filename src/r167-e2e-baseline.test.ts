// R167: regression test that locks in the R166 e2e harness fix.
// R166 changed scripts/test-review-ui/e2e.mjs to use `plugin.default.server`
// instead of `plugin.default` (SDK 1.17.12+ PluginModule shape). This test
// catches any future regression of that fix.
//
// We check the harness file content (not the runtime) because:
// - Running the full 35-scenario e2e suite in bun test would add 5+ min
// - The harness file is the source of truth; if it references the wrong
//   export, the suite WILL fail at runtime — but a static check catches
//   the bug earlier and in CI.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const E2E_HARNESS = join(import.meta.dir, "..", "scripts", "test-review-ui", "e2e.mjs");

describe("R167 — R166 e2e harness PluginModule fix (lock-in)", () => {
  it("e2e.mjs exists", () => {
    const content = readFileSync(E2E_HARNESS, "utf-8");
    expect(content.length).toBeGreaterThan(1000);
  });

  it("e2e.mjs uses plugin.default.server (NOT plugin.default) — R166 fix", () => {
    const content = readFileSync(E2E_HARNESS, "utf-8");
    // The fix replaces the bare `plugin.default` reference with `plugin.default.server`
    expect(content).toContain("plugin.default.server");
  });

  it("e2e.mjs does NOT have a bare `plugin.default` line (regression of R166 fix)", () => {
    const content = readFileSync(E2E_HARNESS, "utf-8");
    // Match lines like `const X = plugin.default;` (no `.server` after)
    // Allow `.default.server` (the fix) and `.default.id` (the round-166 regression test)
    const bareDefaultLines = content.split("\n").filter((line) => {
      const trimmed = line.trim();
      return (
        /plugin\.default\s*[;)]/.test(trimmed) &&
        !trimmed.includes(".server") &&
        !trimmed.includes(".id")
      );
    });
    expect(bareDefaultLines).toEqual([]);
  });
});
