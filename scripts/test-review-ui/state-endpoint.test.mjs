/**
 * R44 /state endpoint regression test (added R45).
 *
 * Mocks: spawns mock-server.py on port 8891 (isolated port to avoid R43's 8890 conflicts).
 * Run with: bun test scripts/test-review-ui/state-endpoint.test.mjs
 *
 * Validates:
 * - /api/review/<id>/state returns 200 OK
 * - Response has the documented schema (round, files, existing_findings, prior_notes)
 * - existing_findings includes the F-MOCK-DUP (resolved/duplicate) + F-MOCK-OPEN (open) fixtures
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const MOCK_PORT = 8891; // different from R43's 8890 to avoid conflicts
const BASE = `http://127.0.0.1:${MOCK_PORT}`;

let mockPid;

async function startMockServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "python3",
      ["scripts/test-review-ui/mock-server.py", String(MOCK_PORT)],
      {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: process.cwd(),
      },
    );
    mockPid = proc.pid;
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    // Wait for /health to return "ok"
    const start = Date.now();
    const check = async () => {
      if (Date.now() - start > 10000) {
        proc.kill("SIGKILL");
        return reject(new Error("mock-server did not become ready in 10s: " + stderr));
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

async function stopMockServer() {
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

describe("R44 mock-server /api/review/<id>/state endpoint", () => {
  let serverStarted = false;
  beforeAll(async () => {
    await startMockServer();
    serverStarted = true;
  });
  afterAll(async () => {
    if (serverStarted) await stopMockServer();
  });

  it("returns 200 OK with the documented schema", async () => {
    const r = await fetch(`${BASE}/api/review/test/state`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("application/json");
    const body = await r.json();

    // Verify schema keys
    expect(typeof body.round).toBe("number");
    expect(Array.isArray(body.files)).toBe(true);
    expect(Array.isArray(body.existing_findings)).toBe(true);
    expect(Array.isArray(body.prior_notes)).toBe(true);
    expect(typeof body.draft).toBe("object");
  });

  it("includes F-MOCK-DUP (resolved/duplicate) + F-MOCK-OPEN (open) fixtures", async () => {
    const r = await fetch(`${BASE}/api/review/test/state`);
    const body = await r.json();
    const findings = body.existing_findings;

    const dup = findings.find((f) => f.id === "F-MOCK-DUP");
    const open = findings.find((f) => f.id === "F-MOCK-OPEN");

    expect(dup).toBeDefined();
    expect(dup.status).toBe("resolved");
    expect(dup.resolution_kind).toBe("duplicate");
    expect(typeof dup.resolution_reason).toBe("string");
    expect(typeof dup.resolved_at).toBe("number");

    expect(open).toBeDefined();
    expect(open.status).toBe("open");
    // open finding MUST NOT have resolution_kind (consistency invariant)
    expect(open.resolution_kind).toBeUndefined();
  });

  it("includes at least one prior_note for previously-discussed panel", async () => {
    const r = await fetch(`${BASE}/api/review/test/state`);
    const body = await r.json();
    expect(body.prior_notes.length).toBeGreaterThan(0);
    expect(typeof body.prior_notes[0].round).toBe("number");
    expect(typeof body.prior_notes[0].notes).toBe("string");
  });

  it("does not change existing endpoints (regression: /api/review/<id> still serves default payload)", async () => {
    const r = await fetch(`${BASE}/api/review/test`);
    expect(r.status).toBe(200);
    const body = await r.json();
    // Default DEFAULT_MOCK has empty existing_findings (no prior_notes field)
    expect(body.existing_findings).toEqual([]);
    // prior_notes is undefined in DEFAULT_MOCK (not a bug; new /state endpoint
    // adds the field; existing /api/review payload unchanged)
    expect(body.prior_notes).toBeUndefined();
  });
});
