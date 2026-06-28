/**
 * Unit tests for src/state-store.ts
 *
 * Scenarios map to the plan at `.omo/plans/atomic-state-writes.md` §4:
 *   T1 — atomic invariant happy path
 *   T2 — mid-write failure isolation (ENOSPC)
 *   T3 — EXDEV cross-device fallback
 *   T4 — EACCES rename failure propagation
 *   T5 — concurrent saves (10× Promise.all)
 *   T6 — corrupt-file preservation + console.warn capture
 *   T7 — round-export atomicity (round-NNN.json + round-NNN.md)
 *
 * Run with:  bun run test:unit
 */

import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { __setFsPromisesForTest, readState, saveState, writeFileAtomic } from "./state-store";

let work: string;

beforeEach(async () => {
  work = await fsPromises.mkdtemp(join(tmpdir(), "state-store-test-"));
});

afterEach(async () => {
  // Reset FS test seam so previous test's failure injection doesn't leak.
  __setFsPromisesForTest({
    rename: fsPromises.rename,
    copyFile: fsPromises.copyFile,
    unlink: fsPromises.unlink,
    mkdir: fsPromises.mkdir,
    bunWrite: Bun.write.bind(Bun),
  });
  await fsPromises.rm(work, { recursive: true, force: true });
});

type TestState = {
  session_id: string;
  round: number;
  findings: unknown[];
  updated_at: number;
};

function defaultState(session_id: string): TestState {
  return {
    session_id,
    round: 0,
    findings: [],
    updated_at: Date.now(),
  };
}

function makeState(round: number, session = "test-session"): TestState {
  return {
    session_id: session,
    round,
    findings: [],
    updated_at: Date.now(),
  };
}

async function readStateFile(file: string): Promise<TestState> {
  return JSON.parse(await fsPromises.readFile(file, "utf8")) as TestState;
}

async function listTmpFiles(dir: string, target: string): Promise<string[]> {
  const entries = await fsPromises.readdir(dir);
  return entries.filter((e) => e.startsWith(`${target}.tmp.`));
}

describe("writeFileAtomic — T1 atomic invariant (happy path)", () => {
  it("writes content that is byte-equal to the input on disk", async () => {
    const file = join(work, "state.json");
    const content = JSON.stringify({ hello: "world" }, null, 2);
    await writeFileAtomic(file, content);
    const onDisk = await fsPromises.readFile(file, "utf8");
    expect(onDisk).toBe(content);
  });

  it("saveState: on-disk file is the most-recent state and parses as JSON between/after every call", async () => {
    const file = join(work, "state.json");
    // RED pre-condition: without atomic write, killing between truncate and
    // flush would leave a partial file. We can't easily kill mid-flush in a
    // unit test, so we assert the observable invariant: after every save,
    // the file MUST parse as JSON AND be byte-equal to the most-recent input.
    const a = makeState(1, "session-a");
    const b = makeState(2, "session-b");
    await saveState(file, a);
    const after1 = await readStateFile(file);
    expect(after1).toEqual(a);
    expect(after1.session_id).toBe("session-a");
    await saveState(file, b);
    const after2 = await readStateFile(file);
    expect(after2).toEqual(b);
    expect(after2.session_id).toBe("session-b");
  });
});

describe("writeFileAtomic — T2 mid-write failure isolation (ENOSPC)", () => {
  it("when Bun.write throws, the target file is left untouched and the temp file is cleaned up", async () => {
    const file = join(work, "state.json");
    const original = makeState(0, "original");
    await saveState(file, original);
    const before = await readStateFile(file);
    expect(before).toEqual(original);

    const realWrite = Bun.write.bind(Bun);
    const fakeWrite = ((..._args: Parameters<typeof Bun.write>) => {
      const err: NodeJS.ErrnoException = new Error("ENOSPC: no space left on device");
      err.code = "ENOSPC";
      throw err;
    }) as unknown as typeof Bun.write;
    __setFsPromisesForTest({ bunWrite: fakeWrite });

    let caught: Error | undefined;
    try {
      await saveState(file, makeState(99, "new-session"));
    } catch (e) {
      caught = e as Error;
    } finally {
      __setFsPromisesForTest({ bunWrite: realWrite });
    }

    expect(caught).toBeDefined();
    expect(caught!.message).toMatch(/atomic write failed/);

    // Target file is unchanged — original state still intact.
    const after = await readStateFile(file);
    expect(after).toEqual(original);

    // No orphan .tmp.* files remain.
    const orphans = await listTmpFiles(work, "state.json");
    expect(orphans).toEqual([]);
  });
});

describe("writeFileAtomic — T3 EXDEV cross-device fallback", () => {
  it("when rename throws EXDEV, falls back to copyFile + unlink and the target ends up with new content", async () => {
    const file = join(work, "state.json");
    const target = makeState(7, "exdev-session");
    const expectedJson = JSON.stringify(target, null, 2);

    __setFsPromisesForTest({
      rename: (async () => {
        const err: NodeJS.ErrnoException = new Error("EXDEV: cross-device link not permitted");
        err.code = "EXDEV";
        throw err;
      }) as typeof fsPromises.rename,
    });

    try {
      await saveState(file, target);
    } finally {
      __setFsPromisesForTest(); // reset to defaults
    }

    const onDisk = await fsPromises.readFile(file, "utf8");
    expect(onDisk).toBe(expectedJson);
    const parsed = await readStateFile(file);
    expect(parsed).toEqual(target);

    // No orphan .tmp.* files remain (the EXDEV path explicitly unlinks tmp).
    const orphans = await listTmpFiles(work, "state.json");
    expect(orphans).toEqual([]);
  });
});

describe("writeFileAtomic — T4 EACCES rename failure propagation", () => {
  it("when rename throws EACCES, error propagates with context AND temp file is cleaned up", async () => {
    const file = join(work, "state.json");
    const original = makeState(0, "original");
    await saveState(file, original);

    __setFsPromisesForTest({
      rename: (async () => {
        const err: NodeJS.ErrnoException = new Error("EACCES: permission denied");
        err.code = "EACCES";
        throw err;
      }) as typeof fsPromises.rename,
    });

    let caught: Error | undefined;
    try {
      await saveState(file, makeState(1, "new"));
    } catch (e) {
      caught = e as Error;
    } finally {
      __setFsPromisesForTest(); // reset to defaults
    }

    expect(caught).toBeDefined();
    expect(caught!.message).toMatch(/atomic write failed/);
    expect(caught!.message).toMatch(/EACCES/);

    // Target file is unchanged (original state preserved).
    const after = await readStateFile(file);
    expect(after).toEqual(original);

    // No orphan .tmp.* files remain (outer catch always cleans up).
    const orphans = await listTmpFiles(work, "state.json");
    expect(orphans).toEqual([]);
  });
});

describe("writeFileAtomic — T5 concurrent saves (race)", () => {
  it("10 parallel saveState calls: final file is one of the 10 inputs (not a blend), no orphan temp files", async () => {
    const file = join(work, "state.json");
    const states = Array.from({ length: 10 }, (_, i) => makeState(i, `concurrent-${i}`));
    await Promise.all(states.map((s) => saveState(file, s)));
    const final = await readStateFile(file);
    // Final is exactly one of the 10 inputs.
    const matched = states.some(
      (s) => s.session_id === final.session_id && s.round === final.round,
    );
    expect(matched).toBe(true);
    // No orphan .tmp.* files remain.
    const orphans = await listTmpFiles(work, "state.json");
    expect(orphans).toEqual([]);
  });
});

describe("readState — T6 corrupt-file preservation", () => {
  it("corrupt JSON: renames to .corrupt-<ts>, logs warn, returns defaultState", async () => {
    const file = join(work, "state.json");
    await fsPromises.mkdir(work, { recursive: true });
    const corruptContent = "{ this is not valid JSON ::: }";
    await fsPromises.writeFile(file, corruptContent, "utf8");

    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});

    let result: TestState;
    let warnCalls: string[];
    try {
      result = await readState<TestState>(file, "fresh-session", defaultState);
      warnCalls = warnSpy.mock.calls.map((c) => String(c[0]));
    } finally {
      warnSpy.mockRestore();
    }

    expect(result.session_id).toBe("fresh-session");
    expect(result.round).toBe(0);
    expect(result.findings).toEqual([]);
    expect(
      warnCalls.some((m) => m.includes("unreadable") && m.includes("preserved")),
      `expected warn to mention "unreadable" and "preserved"; got: ${JSON.stringify(warnCalls)}`,
    ).toBe(true);

    // A .corrupt-<ts> file exists with the original corrupt content.
    const entries = await fsPromises.readdir(work);
    const corruptFiles = entries.filter((e) => e.startsWith("state.json.corrupt-"));
    expect(corruptFiles.length).toBe(1);
    const preserved = await fsPromises.readFile(join(work, corruptFiles[0]!), "utf8");
    expect(preserved).toBe(corruptContent);

    // Original state.json is gone (renamed to .corrupt-<ts>).
    const remaining = entries.filter((e) => e === "state.json");
    expect(remaining.length).toBe(0);
  });

  it("missing file: returns defaultState without warning", async () => {
    const file = join(work, "does-not-exist.json");
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
    let result: TestState;
    try {
      result = await readState<TestState>(file, "missing-session", defaultState);
    } finally {
      warnSpy.mockRestore();
    }
    expect(result.session_id).toBe("missing-session");
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe("writeFileAtomic — T7 round-export atomicity", () => {
  it("round-NNN.json + round-NNN.md both written atomically and both parse", async () => {
    const jsonPath = join(work, "round-001.json");
    const mdPath = join(work, "round-001.md");
    const jsonContent = JSON.stringify({ session_id: "s", round: 1, findings: [] }, null, 2);
    const mdContent = "# Round 1\n\nNo findings.\n";

    await writeFileAtomic(jsonPath, jsonContent);
    await writeFileAtomic(mdPath, mdContent);

    // Both files exist and parse.
    const jsonOnDisk = await fsPromises.readFile(jsonPath, "utf8");
    const mdOnDisk = await fsPromises.readFile(mdPath, "utf8");
    expect(JSON.parse(jsonOnDisk)).toEqual({ session_id: "s", round: 1, findings: [] });
    expect(mdOnDisk).toBe(mdContent);

    // No orphans.
    const orphans = await listTmpFiles(work, "round-001.json");
    expect(orphans).toEqual([]);
    const mdOrphans = await listTmpFiles(work, "round-001.md");
    expect(mdOrphans).toEqual([]);
  });

  it("mid-write failure of second write leaves the first intact (independent atomicity)", async () => {
    const jsonPath = join(work, "round-002.json");
    const mdPath = join(work, "round-002.md");
    const jsonContent = JSON.stringify({ session_id: "s", round: 2, findings: [] }, null, 2);
    const mdContent = "# Round 2\n";

    await writeFileAtomic(jsonPath, jsonContent);

    const realWrite = Bun.write.bind(Bun);
    const fakeWrite = ((..._args: Parameters<typeof Bun.write>) => {
      const err: NodeJS.ErrnoException = new Error("EIO: simulated mid-write failure");
      err.code = "EIO";
      throw err;
    }) as unknown as typeof Bun.write;
    __setFsPromisesForTest({ bunWrite: fakeWrite });

    let caught: Error | undefined;
    try {
      await writeFileAtomic(mdPath, mdContent);
    } catch (e) {
      caught = e as Error;
    } finally {
      __setFsPromisesForTest({ bunWrite: realWrite });
    }

    expect(caught).toBeDefined();
    expect(caught!.message).toMatch(/atomic write failed/);

    // First file is intact.
    const jsonStill = await fsPromises.readFile(jsonPath, "utf8");
    expect(JSON.parse(jsonStill)).toEqual({ session_id: "s", round: 2, findings: [] });

    // mdPath was NOT created (the failure was on Bun.write to tmp, before rename).
    // The md-tmp orphan was cleaned up.
    const mdOrphans = await listTmpFiles(work, "round-002.md");
    expect(mdOrphans).toEqual([]);
  });
});
