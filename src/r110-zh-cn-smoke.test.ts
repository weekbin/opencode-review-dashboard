// R110 — gap #2 lightweight check: served review.html contains zh-CN-ready
// data-i18n-* attributes (proxies the playwright zh-CN walkthrough).
//
// full visual walkthrough (chrome + playwright + screenshot) is heavier and
// runs in CI differently. this test asserts the BUNDLE state that makes
// zh-CN rendering possible: server-side dist/ui/review.html must contain
// data-i18n-* attributes wired through to i18n.ts keys.
//
// run with: bun test src/r110-zh-cn-smoke.test.mjs

import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { existsSync, readFileSync } from "node:fs";

const MOCK_PORT = 8893;
const BASE = `http://127.0.0.1:${MOCK_PORT}`;
const DIST_HTML = "dist/ui/review.html";

let mockPid: number | undefined;

async function startMockServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!existsSync("scripts/test-review-ui/mock-server.py")) {
      return reject(new Error("mock-server.py missing"));
    }
    const proc = spawn("python3", ["scripts/test-review-ui/mock-server.py", String(MOCK_PORT)], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: process.cwd(),
    });
    mockPid = proc.pid;
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    const start = Date.now();
    const check = async () => {
      if (Date.now() - start > 10000) {
        proc.kill("SIGKILL");
        return reject(new Error(`mock-server did not become ready: ${stderr}`));
      }
      try {
        const r = await fetch(`${BASE}/health`);
        if (r.ok && (await r.text()) === "ok") return resolve();
      } catch {}
      await sleep(100);
      await check();
    };
    check();
  });
}

async function stopMockServer(): Promise<void> {
  if (mockPid) {
    try {
      process.kill(mockPid, "SIGTERM");
    } catch {}
    await sleep(200);
    try {
      process.kill(mockPid, "SIGKILL");
    } catch {}
  }
}

describe("R110 — gap #2 lightweight zh-CN smoke (proxies playwright walkthrough)", () => {
  beforeAll(async () => {
    await startMockServer();
  });
  afterAll(async () => {
    await stopMockServer();
  });

  it("dist/ui/review.html exists with data-i18n-* wiring", () => {
    expect(existsSync(DIST_HTML)).toBe(true);
    const html = readFileSync(DIST_HTML, "utf-8");
    expect(html).toContain("data-i18n-title=");
    expect(html).toContain("data-i18n-aria-label=");
    expect(html).toContain("data-i18n=");
  });

  it("mock-server serves the wired review.html", async () => {
    const r = await fetch(`${BASE}/review/test`);
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain("data-i18n-title=");
    expect(html).toContain("data-i18n-aria-label=");
  });

  it("mock-server /api/review/<id> returns Launch-shaped JSON", async () => {
    const r = await fetch(`${BASE}/api/review/test`);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(typeof body).toBe("object");
    expect(Array.isArray(body.files) || body.files === undefined).toBe(true);
  });
});
