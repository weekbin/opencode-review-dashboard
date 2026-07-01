/**
 * Runtime-agnostic helpers for the plugin.
 *
 * Why: OpenCode 1.17.12 switched the plugin runtime from Bun to Node.js
 * (commit opencode-ai@1.17.12 — see release notes / user's audit 2026-07-01).
 * This plugin originally used Bun-only APIs (`Bun.file`, `Bun.serve`,
 * `Bun.spawn`, `Bun.which`, `Bun.write`, `Bun.readableStreamToText`) at
 * multiple call sites. Loading the plugin in 1.17.12 caused
 * `ReferenceError: Bun is not defined` at top-level (state-store.ts:50 —
 * `Bun.write.bind(Bun)`), which made `m.default` undefined and triggered
 * the "Plugin export is not a function" error in OpenCode's plugin loader.
 *
 * This module provides a single layer of helpers that auto-detect Bun vs
 * Node.js and route to the right implementation. All other plugin code
 * imports from here instead of touching `Bun.*` directly.
 *
 * Conventions:
 *   - All file I/O helpers return `""` (empty string) on ENOENT or
 *     permission errors, mirroring the original `Bun.file().text().catch()`
 *     behavior the plugin relied on. This means callers don't need their
 *     own try/catch around file reads.
 *   - Spawn helpers collect stdout/stderr to text and never throw — the
 *     original `Bun.spawn` returned a promise that always resolved with
 *     an exit code, so callers checked `result.ok` instead of catching.
 *   - The serve helper returns `{ port, stop }` regardless of runtime.
 *     `port = 0` asks the OS for a free port; the resolved port is on the
 *     returned instance (matches Bun.serve's behavior).
 *
 * Scope: ONLY the 7 helpers the plugin actually uses. Do NOT grow this
 * layer with speculative Bun APIs the plugin doesn't touch — every
 * added helper is another runtime-detection branch to maintain.
 */

// ---------------------------------------------------------------------------
// Runtime detection
// ---------------------------------------------------------------------------

const _bunGlobal = (globalThis as { Bun?: unknown }).Bun;
const IS_BUN = typeof _bunGlobal !== "undefined";

// `Bun.write` has a very different shape from Node's `fs/promises.writeFile`.
// We keep the lazy reference to the Bun global so test injection can swap it
// without breaking the runtime-compat layer's own detection.
function bun(): any {
  return (globalThis as { Bun?: any }).Bun;
}

// ---------------------------------------------------------------------------
// 1. fileExists(path) -> boolean
//
// Bun:  Bun.file(p).exists()
// Node: fs.access(p) (no throw on success)
// ---------------------------------------------------------------------------

export async function fileExists(path: string): Promise<boolean> {
  if (IS_BUN) {
    return bun().file(path).exists();
  }
  const { access } = await import("node:fs/promises");
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 2. readFileText(path) -> string
//
// Returns "" if the file doesn't exist or is unreadable, matching the
// previous `Bun.file(p).text().catch(() => "")` pattern.
// ---------------------------------------------------------------------------

export async function readFileText(path: string): Promise<string> {
  if (IS_BUN) {
    const f = bun().file(path);
    if (!(await f.exists())) return "";
    return f.text();
  }
  const { readFile } = await import("node:fs/promises");
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// 3. readFileJson(path, default) -> T
//
// Returns default if the file doesn't exist or JSON.parse fails.
// Mirrors the old `Bun.file(p).json()` + try/catch.
// ---------------------------------------------------------------------------

export async function readFileJson<T>(path: string, defaultValue: T): Promise<T> {
  if (IS_BUN) {
    const f = bun().file(path);
    if (!(await f.exists())) return defaultValue;
    try {
      return (await f.json()) as T;
    } catch {
      return defaultValue;
    }
  }
  const { readFile } = await import("node:fs/promises");
  try {
    const text = await readFile(path, "utf8");
    return JSON.parse(text) as T;
  } catch {
    return defaultValue;
  }
}

// ---------------------------------------------------------------------------
// 4. writeFile(path, content) -> void
//
// Bun:  Bun.write(path, content)  — sync under the hood but returns a Promise
// Node: fs/promises.writeFile(path, content)
// ---------------------------------------------------------------------------

export async function writeFile(path: string, content: string | Uint8Array): Promise<void> {
  if (IS_BUN) {
    return bun().write(path, content);
  }
  const { writeFile: nodeWriteFile } = await import("node:fs/promises");
  return nodeWriteFile(path, content);
}

// ---------------------------------------------------------------------------
// 5. which(bin) -> string | null
//
// Bun:  Bun.which(bin) returns the absolute path or undefined
// Node: spawn `which` (POSIX) or `where` (Windows); take the first line.
// ---------------------------------------------------------------------------

export async function which(bin: string): Promise<string | null> {
  if (IS_BUN) {
    const found = bun().which(bin);
    return found ?? null;
  }
  const { spawn } = await import("node:child_process");
  return new Promise((resolve) => {
    const cmd = process.platform === "win32" ? "where" : "which";
    let stdout = "";
    let settled = false;
    const finish = (v: string | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    try {
      const proc = spawn(cmd, [bin], { stdio: ["ignore", "pipe", "ignore"] });
      proc.stdout?.on("data", (chunk: Buffer | string) => {
        stdout += typeof chunk === "string" ? chunk : chunk.toString("utf8");
      });
      proc.on("error", () => finish(null));
      proc.on("close", (code) => {
        if (code === 0) {
          const first = stdout.split(/\r?\n/).find((line) => line.trim().length > 0);
          finish(first ? first.trim() : null);
        } else {
          finish(null);
        }
      });
    } catch {
      finish(null);
    }
  });
}

// ---------------------------------------------------------------------------
// 6. spawnText(args, opts) -> { ok, stdout, stderr, code }
//
// Replaces the plugin's `run()` helper that used Bun.spawn +
// Bun.readableStreamToText. Always resolves; callers check `ok`.
// ---------------------------------------------------------------------------

export interface SpawnTextResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
}

export interface SpawnTextOptions {
  cwd?: string;
  env?: Record<string, string | undefined>;
}

export async function spawnText(
  args: string[],
  opts: SpawnTextOptions = {},
): Promise<SpawnTextResult> {
  if (IS_BUN) {
    const proc = bun().spawn(args, {
      cwd: opts.cwd,
      env: opts.env as Record<string, string> | undefined,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      bun()
        .readableStreamToText(proc.stdout)
        .catch(() => ""),
      bun()
        .readableStreamToText(proc.stderr)
        .catch(() => ""),
      proc.exited as Promise<number>,
    ]);
    return { ok: code === 0, stdout, stderr, code };
  }
  const { spawn } = await import("node:child_process");
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (r: SpawnTextResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };
    try {
      const proc = spawn(args[0]!, args.slice(1), {
        cwd: opts.cwd,
        env: { ...process.env, ...(opts.env ?? {}) } as NodeJS.ProcessEnv,
        stdio: ["ignore", "pipe", "pipe"],
        // Cast through ChildProcess because spawn()'s overload
        // intersection collapses proc to `never` when stdio is a
        // 3-tuple (TS narrowing bug with cross-platform types).
        // Runtime behavior unchanged — `as` only widens the type.
      }) as ReturnType<typeof spawn>;
      proc.stdout?.on("data", (chunk: Buffer | string) => {
        stdout += typeof chunk === "string" ? chunk : chunk.toString("utf8");
      });
      proc.stderr?.on("data", (chunk: Buffer | string) => {
        stderr += typeof chunk === "string" ? chunk : chunk.toString("utf8");
      });
      proc.on("error", (err: Error) => {
        finish({ ok: false, stdout, stderr: stderr + err.message, code: -1 });
      });
      proc.on("close", (code) => {
        finish({ ok: code === 0, stdout, stderr, code });
      });
    } catch (err) {
      finish({
        ok: false,
        stdout,
        stderr: stderr + (err instanceof Error ? err.message : String(err)),
        code: -1,
      });
    }
  });
}

// ---------------------------------------------------------------------------
// 7. spawnDetached(args, opts) -> void
//
// Fire-and-forget spawn for the "open browser" use case. Doesn't wait for
// exit, doesn't throw. On Node, uses detached + unref so the child
// survives parent exit if needed.
// ---------------------------------------------------------------------------

export function spawnDetached(args: string[], opts: SpawnTextOptions = {}): void {
  if (IS_BUN) {
    bun().spawn(args, {
      cwd: opts.cwd,
      env: opts.env as Record<string, string> | undefined,
      stdout: "ignore",
      stderr: "ignore",
    });
    return;
  }
  // Lazy require so the top-level import only triggers when actually
  // called (Node.js path). `require` keeps it CommonJS-compatible.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { spawn } = require("node:child_process") as typeof import("node:child_process");
  try {
    const proc = spawn(args[0]!, args.slice(1), {
      cwd: opts.cwd,
      env: { ...process.env, ...(opts.env ?? {}) } as NodeJS.ProcessEnv,
      stdio: "ignore",
      detached: true,
    }) as ReturnType<typeof spawn>;
    proc.unref();
  } catch {
    // best-effort — caller doesn't await this
  }
}

// ---------------------------------------------------------------------------
// 8. serve(opts) -> { port, stop }
//
// Bun:  Bun.serve({ port, fetch }) → server with .port, .stop()
// Node: node:http.createServer with manual Request→Response bridging.
//       The Request/Response objects (Web Fetch API) are globally available
//       in Node 22+ so we don't polyfill them, just bridge the I/O.
//
// The fetch handler is the same in both runtimes. In the Node path we
// convert node's IncomingMessage → Web Request and Web Response → ServerResponse.
// ---------------------------------------------------------------------------

export interface ServeOptions {
  port?: number;
  fetch: (request: Request) => Promise<Response> | Response;
  error?: (error: Error) => void;
}

export interface ServeInstance {
  port: number;
  stop: () => Promise<void>;
}

export async function serve(opts: ServeOptions): Promise<ServeInstance> {
  if (IS_BUN) {
    const server = bun().serve({
      port: opts.port ?? 0,
      fetch: opts.fetch,
    });
    return {
      port: server.port,
      stop: async () => {
        await server.stop();
      },
    };
  }

  // Node 18+: Web Request/Response/Headers/fetch are available globally.
  // We use node:http for the actual TCP listener and bridge the I/O.
  const http = await import("node:http");

  return new Promise<ServeInstance>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const protocol = "http";
        const host = req.headers.host ?? "localhost";
        const url = `${protocol}://${host}${req.url ?? "/"}`;

        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers)) {
          if (v == null) continue;
          if (Array.isArray(v)) v.forEach((item) => headers.append(k, String(item)));
          else headers.set(k, String(v));
        }

        const method = (req.method ?? "GET").toUpperCase();
        let body: BodyInit | null = null;
        if (method !== "GET" && method !== "HEAD") {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const buf = Buffer.concat(chunks);
          body = buf.length > 0 ? (buf as unknown as BodyInit) : null;
        }

        const request = new Request(url, {
          method,
          headers,
          body,
        });

        const response = await opts.fetch(request);

        res.statusCode = response.status;
        response.headers.forEach((v, k) => {
          try {
            res.setHeader(k, v);
          } catch {
            // ignore invalid header names (some Web Headers use lowercase)
          }
        });
        if (response.body) {
          const ab = await response.arrayBuffer();
          res.end(Buffer.from(ab));
        } else {
          res.end();
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (opts.error) {
          try {
            opts.error(e);
          } catch {
            // ignore user-thrown error handler errors
          }
        }
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        } else {
          try {
            res.end();
          } catch {
            // ignore
          }
        }
      }
    });

    server.on("error", (e) => reject(e));
    server.listen(opts.port ?? 0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolve({
        port,
        stop: () =>
          new Promise<void>((res) => {
            server.close(() => res());
          }),
      });
    });
  });
}
