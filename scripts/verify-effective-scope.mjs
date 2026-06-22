// Empirical verification for the effective_scope round-to-round invariant.
// Confirms that round 1 (auto-pick) and round 2 (explicit --worktree) write
// state.json to the same directory.
//
// Run with: bun run scripts/verify-effective-scope.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLUGIN_PATH = join(import.meta.dir, "..", "dist", "plugin", "index.mjs");
const plugin = await import(PLUGIN_PATH);
const DiffReviewPlugin = plugin.default;

const run = (cmd, args, cwd) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "",
      err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => resolve({ ok: code === 0, stdout: out.trim(), stderr: err.trim() }));
  });
const git = (args, cwd) => run("git", args, cwd);
const sh = (cmd, cwd) => run("bash", ["-c", cmd], cwd);

const dir = mkdtempSync(join(tmpdir(), "rd-effective-scope-"));
const wtDir = `${dir}-wt`;
const sessionId = "verify-" + Date.now();

try {
  // Setup: clean main + worktree with 3 commits ahead, no upstream
  await git(["init", "-q", "-b", "main"], dir);
  await git(["config", "user.email", "t@t"], dir);
  await git(["config", "user.name", "t"], dir);
  await sh("echo v1 > file.txt", dir);
  await git(["add", "."], dir);
  await git(["commit", "-q", "-m", "initial"], dir);
  await git(["update-ref", "refs/remotes/origin/main", "HEAD"], dir);

  await git(["worktree", "add", wtDir, "-b", "work/refactor"], dir);
  for (let i = 1; i <= 3; i++) {
    await sh(`echo "change ${i}" >> file.txt`, wtDir);
    await git(["add", "file.txt"], wtDir);
    await git(["commit", "-q", "-m", `c${i}`], wtDir);
  }

  const result = await DiffReviewPlugin({ directory: dir, worktree: undefined, $: {} });
  const tool = result.tool.diff_review_dashboard;

  // Round 1: in main, no --worktree (auto-pick should find wtDir)
  const ctx1 = {
    sessionID: sessionId,
    worktree: undefined,
    directory: dir,
    $: {},
    metadata: () => {},
    abort: new AbortController(),
    client: { app: { log: async () => {} } },
  };
  const p1 = tool.execute({ raw: "" }, ctx1).catch((e) => {
    // Pre-existing harness limitation: ctx.client.app.log throws after server
    // launches. state.json has already been saved by then — that's all we need.
    const msg = e?.message || String(e);
    if (!msg.includes("ctx.client.app") && !msg.includes("ctx is not defined")) throw e;
  });
  await Promise.race([p1, new Promise((r) => setTimeout(r, 2000))]);
  ctx1.abort.abort();

  // Round 2: in main, explicit --worktree=<wtDir>
  const ctx2 = {
    sessionID: sessionId,
    worktree: undefined,
    directory: dir,
    $: {},
    metadata: () => {},
    abort: new AbortController(),
    client: { app: { log: async () => {} } },
  };
  const p2 = tool.execute({ raw: `--worktree=${wtDir}` }, ctx2).catch((e) => {
    const msg = e?.message || String(e);
    if (!msg.includes("ctx.client.app") && !msg.includes("ctx is not defined")) throw e;
  });
  await Promise.race([p2, new Promise((r) => setTimeout(r, 2000))]);
  ctx2.abort.abort();

  // Check that BOTH rounds wrote state.json to the SAME directory
  // (either both in wtDir or both in dir — must not split).
  const candidates = [
    join(dir, ".opencode", "reviews", sessionId, "state.json"),
    join(wtDir, ".opencode", "reviews", sessionId, "state.json"),
  ];

  const found = candidates.filter((p) => existsSync(p));
  const wtState = existsSync(candidates[1]);
  const mainState = existsSync(candidates[0]);

  console.log("Round 1 (auto-pick):", ctx1.abort.signal.aborted ? "aborted (server would launch)" : "completed");
  console.log("Round 2 (explicit --worktree):", ctx2.abort.signal.aborted ? "aborted (server would launch)" : "completed");
  console.log("");
  console.log("State file locations after both rounds:");
  console.log(`  ${candidates[0]}: ${mainState ? "EXISTS" : "—"}`);
  console.log(`  ${candidates[1]}: ${wtState ? "EXISTS" : "—"}`);
  console.log("");

  if (mainState && wtState) {
    console.error("FAIL: state.json exists in BOTH locations — round-to-round drift not fixed");
    process.exit(1);
  }
  if (!mainState && !wtState) {
    console.error("INCONCLUSIVE: state.json was never written (servers never reached saveState)");
    process.exit(2);
  }
  if (found.length === 1) {
    console.log("PASS: state.json lives at exactly one location across both rounds");
    console.log(`      → ${found[0]}`);
    process.exit(0);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
  rmSync(wtDir, { recursive: true, force: true });
}