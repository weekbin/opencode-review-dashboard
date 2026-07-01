/**
 * Atomic state persistence helpers.
 *
 * Extracted from `src/index.ts` (round 1, candidate #1) so that:
 *   1. The atomic-write invariant can be unit-tested in isolation.
 *   2. The corrupt-file recovery path is no longer intertwined with HTTP routing.
 *
 * Invariants this module guarantees:
 *   - `saveState(file, state)` either fully replaces `file` with the new state
 *     (POSIX-atomic on same filesystem) OR throws without touching `file`.
 *     Readers never observe a partial write.
 *   - `readState(file, session_id, defaultState)` returns the parsed state if
 *     the file parses. If the file is unreadable (corrupt JSON), the file is
 *     moved aside as `<file>.corrupt-<ISO-ts>` for manual recovery, a warning
 *     is logged, and a fresh state is returned. The previous behavior
 *     silently dropped corrupt state — see the `// FIX:` comment in `readState`.
 *
 * Known limitation (documented; NOT fixed in this round):
 *   - We do not call `fsync(fd)` before rename. The rename is atomic on
 *     POSIX so readers see all-or-nothing, but a kernel panic mid-write may
 *     leave the post-rename data in the page cache without an on-disk flush.
 *     Surviving a kernel panic mid-write requires `fsync`; cost is 1-10 ms
 *     per save. Tracked as a follow-up.
 *
 * Types: the state object is treated as opaque JSON. The shape is owned by
 * `src/index.ts` (State / Finding / etc.) — we keep this module free of
 * duplicated type definitions to avoid drift between two unrelated type
 * declarations.
 */

import { copyFile, mkdir, rename, unlink } from "node:fs/promises";
import path from "node:path";
import {
  fileExists as compatFileExists,
  readFileJson as compatReadFileJson,
  writeFile as compatWriteFile,
} from "./runtime-compat";

/**
 * Test injection seams (module-private mutable refs).
 *
 * Tests need to simulate `rename` failures (EXDEV / EACCES / etc.) and
 * `Bun.write` failures (ENOSPC / EIO) without touching real filesystem
 * state. Direct `import { rename }` reassignment trips ESLint
 * `no-import-assign` and TS's `readonly` module-binding check, AND
 * `Bun.write = fakeWrite` in test scope doesn't propagate to other modules
 * (Bun freezes the Bun global binding per-module). So we hold the
 * references in `let` bindings and expose a tiny setter for tests.
 * Production callers never touch these.
 *
 * R32 (2026-07-01) — replaced the top-level `Bun.write.bind(Bun)` with the
 * `compatWriteFile` indirection from `runtime-compat.ts`. The compat layer
 * resolves to `Bun.write` on Bun and `fs/promises.writeFile` on Node.js.
 * Storing the seam in a `let` keeps the existing test-injection shape
 * (tests can swap the function reference) without forcing the import to
 * read `Bun` at module top-level — which was the root cause of OpenCode
 * 1.17.12's "Plugin export is not a function" error.
 */
let _rename: typeof rename = rename;
let _copyFile: typeof copyFile = copyFile;
let _unlink: typeof unlink = unlink;
let _mkdir: typeof mkdir = mkdir;
let _writeFile: typeof compatWriteFile = compatWriteFile;

/** @internal — exported only for unit tests. Do not call from production code. */
export function __setFsPromisesForTest(overrides?: {
  rename?: typeof rename;
  copyFile?: typeof copyFile;
  unlink?: typeof unlink;
  mkdir?: typeof mkdir;
  writeFile?: typeof compatWriteFile;
}): void {
  if (overrides?.rename !== undefined) _rename = overrides.rename;
  if (overrides?.copyFile !== undefined) _copyFile = overrides.copyFile;
  if (overrides?.unlink !== undefined) _unlink = overrides.unlink;
  if (overrides?.mkdir !== undefined) _mkdir = overrides.mkdir;
  if (overrides?.writeFile !== undefined) _writeFile = overrides.writeFile;
}

/**
 * Atomic file write: temp file in same dir + rename.
 *
 * POSIX rename within a single filesystem is atomic — readers see either
 * the old file or the new file, never a partial mix. Cross-device (EXDEV)
 * falls back to copy + unlink (not atomic, but rare in practice). On any
 * failure, attempts to clean up the temp file before re-throwing so the
 * caller never sees orphan `.tmp.*` files in the directory.
 */
export async function writeFileAtomic(target: string, content: string | Uint8Array): Promise<void> {
  await _mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  try {
    await _writeFile(tmp, content);
    try {
      await _rename(tmp, target);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException | undefined)?.code;
      if (code === "EXDEV") {
        // Cross-device: rename is not atomic across filesystems.
        await _copyFile(tmp, target);
        await _unlink(tmp);
      } else {
        throw err;
      }
    }
  } catch (err) {
    // Best-effort cleanup of the orphan temp file.
    await _unlink(tmp).catch(() => {});
    throw new Error(`atomic write failed for ${target}: ${(err as Error).message}`);
  }
}

/**
 * Persist the review state atomically.
 *
 * Replaces `src/index.ts:saveState`. Call shape is preserved so all 7
 * existing call sites need only an import swap (no signature change).
 *
 * The state object is treated as opaque JSON. We don't constrain the type
 * here — that lives in `src/index.ts:State` so call sites keep full type
 * safety while this module stays free of duplicated type definitions.
 */
export async function saveState(file: string, state: unknown): Promise<void> {
  await writeFileAtomic(file, JSON.stringify(state, null, 2));
}

/**
 * Read the review state, with corrupt-file preservation.
 *
 * Replaces `src/index.ts:readState`. The previous version silently returned
 * a fresh state on parse failure — destroying the user's review history.
 * The new version preserves the corrupt file as `<file>.corrupt-<ts>` so
 * the data can be inspected or merged back manually, then returns the
 * caller's default. If even the rename-to-preserve fails (rare), we log an
 * error and still return the default — losing data is preferable to
 * crashing the plugin.
 *
 * Generic over the state shape so call sites keep full type safety:
 * `readState<State>(file, session_id, (id) => defaultState(id))`.
 */
export async function readState<T>(
  file: string,
  session_id: string,
  defaultState: (session_id: string) => T,
): Promise<T> {
  if (!(await compatFileExists(file))) return defaultState(session_id);
  let parsed: T | undefined;
  let parseError: unknown = undefined;
  try {
    // compatReadFileJson swallows ENOENT; with the fileExists check above
    // the only failure mode left is JSON.parse — capture and re-throw so
    // the corrupt-file preservation path runs.
    const sentinel = {} as T;
    const got = await compatReadFileJson<T>(file, sentinel);
    parsed = got === sentinel ? undefined : got;
  } catch (err) {
    parseError = err;
  }
  if (parsed !== undefined) return parsed;

  // FIX: was `.catch(() => defaultState(...))` — silently destroyed data.
  // Now: preserve the corrupt file as evidence, log a warning, return fresh.
  const err = parseError;
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const corruptPath = `${file}.corrupt-${ts}`;
  try {
    await _rename(file, corruptPath);
    console.warn(
      `[diff-review-dashboard] state.json at ${file} was unreadable; preserved as ${corruptPath}. ` +
        `Starting fresh. Original error: ${(err as Error)?.message ?? "unknown"}`,
    );
  } catch (renameErr) {
    console.error(
      `[diff-review-dashboard] state.json at ${file} was unreadable AND could not be preserved ` +
        `(rename failed: ${(renameErr as Error).message}). Starting fresh; data is lost.`,
    );
  }
  return defaultState(session_id);
}
