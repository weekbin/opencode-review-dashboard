#!/usr/bin/env node
// scripts/verify-plugin-load.mjs
//
// Runtime + shape verification for the OpenCode plugin dist/.
//
// R+ SG.R27.1 (added 2026-07-01, see .opencode/skills/team-dev-loop/SKILL.md):
//   BEFORE declaring SHIP for any round that produces a plugin dist/, the
//   lead MUST run this script. Failure → write .omo/round-N/load-blocked.md
//   and HARD STOP. Closes the R32 + R32b gap where a Bun-only plugin
//   silently broke under OpenCode 1.17.12 (Node.js runtime + strict
//   PluginModule shape).
//
// What this script checks (3 gates):
//   1. Runtime compat — the dist imports WITHOUT throwing under Node.js
//      (catches Bun.* at top-level, import.meta.dir, etc.)
//   2. PluginModule shape — `module.default.server` is a function
//      (catches the `default = function` shape that 1.17.11 accepted but
//      1.17.12 strict loader rejects)
//   3. Hook contract — `module.default.server({...})` returns a hooks
//      object whose `config(output)` populates `output.command` (catches
//      hooks that look right but never actually register the slash cmd)
//
// Exit codes:
//   0 — all checks passed
//   1 — one or more checks failed
//   2 — script setup error (dist missing, no runtime available)
//
// Usage:
//   node scripts/verify-plugin-load.mjs
//   bun scripts/verify-plugin-load.mjs
//
// The script is runtime-agnostic: it runs under whatever invokes it
// (node, bun, deno). It also probes a SECOND runtime if available so we
// catch single-runtime regressions.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGIN_ROOT = path.resolve(__dirname, "..");
const DIST_MAIN = path.join(PLUGIN_ROOT, "dist", "plugin", "index.mjs");

const RUNTIME = typeof globalThis.Bun !== "undefined" ? "bun" : "node";

function log(runtime, gate, ok, detail) {
  const tag = ok ? "✅" : "❌";
  const line = `[${runtime.padEnd(5)}] ${tag} ${gate.padEnd(20)} ${detail}`;
  console.log(line);
  return ok;
}

async function checkIn(runtimeHint) {
  const distUrl = pathToFileURL(DIST_MAIN).href;

  // Gate 1: runtime compat — import without throwing
  let m;
  try {
    m = await import(distUrl);
  } catch (err) {
    log(runtimeHint, "runtime-compat", false, `import threw: ${err.message}`);
    return false;
  }
  log(runtimeHint, "runtime-compat", true, `import OK (default=${typeof m.default})`);

  // Gate 2: PluginModule shape — `default.server` is a function
  const server = m.default?.server;
  const serverOk = typeof server === "function";
  log(
    runtimeHint,
    "PluginModule-shape",
    serverOk,
    `default.server = ${typeof server}${serverOk ? "" : " (need function)"}`,
  );
  if (!serverOk) return false;

  // Gate 3: hook contract — config() registers a non-empty output.command
  let commands = [];
  try {
    const hooks = await server({
      client: {},
      project: { id: "verify-plugin-load" },
      directory: "/tmp",
      worktree: "/tmp",
    });
    if (typeof hooks.config !== "function") {
      log(runtimeHint, "hook-contract", false, "hooks.config is not a function");
      return false;
    }
    const out = {};
    await hooks.config(out);
    commands = Object.keys(out.command || {});
    log(
      runtimeHint,
      "hook-contract",
      commands.length > 0,
      `commands registered: ${commands.join(", ") || "(none)"}`,
    );
  } catch (err) {
    log(runtimeHint, "hook-contract", false, `threw: ${err.message}`);
    return false;
  }

  return commands.length > 0;
}

async function probeOtherRuntime() {
  // If we ran under node, try bun too. If under bun, try node.
  // Returns { runtime, ok } or null if other runtime unavailable.
  const want = RUNTIME === "bun" ? "node" : "bun";
  const probe = spawnSync(`which ${want}`, { shell: true, encoding: "utf8" });
  if (probe.status !== 0) return null;
  const probeScript = `
    import('${pathToFileURL(DIST_MAIN).href}').then(async (m) => {
      const server = m.default?.server;
      if (typeof server !== 'function') { console.error('FAIL: default.server is not a function'); process.exit(1); }
      const hooks = await server({ client:{}, project:{id:'probe'}, directory:'/tmp', worktree:'/tmp' });
      const out = {};
      await hooks.config(out);
      const cmds = Object.keys(out.command || {});
      if (cmds.length === 0) { console.error('FAIL: no commands registered'); process.exit(1); }
      console.log('PROBE_OK ' + cmds.join(','));
    }).catch(e => { console.error('FAIL: ' + e.message); process.exit(1); });
  `;
  const tmp = path.join(PLUGIN_ROOT, "scripts", `.probe-${want}-${Date.now()}.mjs`);
  await import("node:fs/promises").then((fs) => fs.writeFile(tmp, probeScript));
  const res = spawnSync(want, [tmp], { encoding: "utf8", cwd: PLUGIN_ROOT });
  await import("node:fs/promises").then((fs) => fs.unlink(tmp).catch(() => {}));
  if (res.status === 0 && res.stdout?.includes("PROBE_OK")) {
    const cmds = res.stdout.split(" ")[1]?.trim() || "";
    return { runtime: want, ok: true, cmds };
  }
  return { runtime: want, ok: false, error: res.stderr || res.stdout };
}

async function main() {
  console.log(`R+ SG.R27.1 — runtime load verification`);
  console.log(`Primary runtime: ${RUNTIME}`);
  console.log(`Dist path: ${DIST_MAIN}`);
  console.log();

  if (!existsSync(DIST_MAIN)) {
    console.log(`❌ dist missing: ${DIST_MAIN}`);
    console.log(`   Run \`bun run build\` first.`);
    process.exit(2);
  }

  // Primary check
  const primaryOk = await checkIn(RUNTIME);

  // Cross-runtime probe (optional but catches single-runtime regressions)
  console.log();
  console.log("Cross-runtime probe:");
  const probe = await probeOtherRuntime();
  if (probe === null) {
    console.log(`  ⏭  skipped — ${RUNTIME === "bun" ? "node" : "bun"} not on PATH`);
  } else if (probe.ok) {
    console.log(`  [${probe.runtime}] ✅ PASS — commands: ${probe.cmds}`);
  } else {
    console.log(`  [${probe.runtime}] ❌ FAIL — ${probe.error}`);
  }

  console.log();
  if (primaryOk) {
    console.log(`✅ verify-plugin-load PASS (runtime: ${RUNTIME})`);
    process.exit(0);
  } else {
    console.log(`❌ verify-plugin-load FAIL`);
    console.log(`   Suggested fixes:`);
    console.log(`     - Bun API at top-level → use src/runtime-compat.ts helpers`);
    console.log(`     - Wrong export shape → \`export default { server: DiffReviewPlugin }\``);
    console.log(`     - Stale dist → \`bun run build\` and re-run this script`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("verify-plugin-load setup error:", err);
  process.exit(2);
});
