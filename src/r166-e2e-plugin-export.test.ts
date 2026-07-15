// R166: regression test for SDK 1.17.12+ PluginModule export shape.
// R32b + R32d (June 2026) changed src/index.ts export from
// `export default DiffReviewPlugin` to `export default { id, server: DiffReviewPlugin }`
// to satisfy the strict 1.17.12 loader. The e2e harness at scripts/test-review-ui/e2e.mjs
// wasn't updated and silently broke all 34 scenarios for 5+ months.
//
// This test locks in the export shape so future SDK upgrades that change it
// surface immediately. It complements scripts/verify-plugin-load.mjs (which
// checks the runtime load) with a static check on the dist artifact.

import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PLUGIN_DIST = join(import.meta.dir, "..", "dist", "plugin", "index.mjs");

describe("R166 — dist/plugin/index.mjs PluginModule export shape (SDK 1.17.12+)", () => {
  it("dist/plugin/index.mjs exists (post-build artifact)", () => {
    expect(existsSync(PLUGIN_DIST)).toBe(true);
  });

  it("default export is an object (not a function — SDK 1.17.12 PluginModule shape)", async () => {
    const plugin = await import(PLUGIN_DIST);
    expect(typeof plugin.default).toBe("object");
    expect(plugin.default).not.toBeNull();
  });

  it("default.id is a non-empty string (R32d added this for strict loader)", async () => {
    const plugin = await import(PLUGIN_DIST);
    expect(typeof plugin.default.id).toBe("string");
    expect(plugin.default.id.length).toBeGreaterThan(0);
  });

  it("default.server is a function (the actual plugin entry)", async () => {
    const plugin = await import(PLUGIN_DIST);
    expect(typeof plugin.default.server).toBe("function");
  });
});
