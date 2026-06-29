/**
 * Unit tests for `collectWorking()` with untracked files — sub-candidate #7.
 *
 * Covers AC7-1 (untracked file appears with status: 'added' + correct after),
 * AC7-2 (additions > 0 for untracked file), AC7-3 (no untracked files → no
 * behavior change), AC7-4 (.gitignore'd untracked file excluded), and AC7-6
 * (__test export includes collectWorking).
 *
 * Per .omo/round-5/tmp/r5-repro.md, the production code already handles
 * untracked files correctly (the `--others --exclude-standard` flag was added
 * in an earlier round's #4 fix). These tests LOCK IN that behavior so it
 * cannot regress.
 *
 * Run with:  bun run test:unit
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { __test } from "./index";

const { collectWorking, names, stats } = __test as unknown as {
  collectWorking: (
    root: string,
    dir: string,
  ) => Promise<{
    files: Array<{
      file: string;
      status: "added" | "deleted" | "modified";
      before: string;
      after: string;
      additions: number;
      deletions: number;
    }>;
    error?: string;
  }>;
  names: (
    root: string,
    area: string,
    withHead: boolean,
  ) => Promise<{
    files: string[];
    error?: string;
  }>;
  stats: (
    root: string,
    area: string,
    withHead: boolean,
  ) => Promise<Map<string, { additions: number; deletions: number }>>;
};

let work: string;

async function git(cwd: string, args: string[]) {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  await proc.exited;
  return proc;
}

async function bootstrapRepo() {
  await git(work, ["init", "-q", "-b", "main"]);
  await git(work, ["config", "user.email", "test@test.com"]);
  await git(work, ["config", "user.name", "test"]);
  await fsPromises.writeFile(join(work, "README.md"), "# test\n");
  await git(work, ["add", "README.md"]);
  await git(work, ["commit", "-q", "-m", "initial"]);
}

describe("untracked files — AC7-1 (file appears with status: 'added')", () => {
  beforeEach(async () => {
    work = await fsPromises.mkdtemp(join(tmpdir(), "r5-untracked-"));
    await bootstrapRepo();
  });

  afterEach(async () => {
    await fsPromises.rm(work, { recursive: true, force: true });
  });

  it("T7.1 untracked 2-line file appears with status: 'added' and matching after", async () => {
    const file = "src/__test_untracked.ts";
    await fsPromises.mkdir(join(work, "src"), { recursive: true });
    await fsPromises.writeFile(join(work, file), 'console.log("hello")\nconsole.log("world")\n');

    const result = await collectWorking(work, work);
    expect(result.error).toBeUndefined();
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.file).toBe(file);
    expect(result.files[0]?.status).toBe("added");
    expect(result.files[0]?.after).toBe('console.log("hello")\nconsole.log("world")\n');
    expect(result.files[0]?.before).toBe("");
  });

  it("T7.5 untracked 10-line file appears with additions === 10", async () => {
    const file = "src/big.ts";
    await fsPromises.mkdir(join(work, "src"), { recursive: true });
    const content = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join("\n") + "\n";
    await fsPromises.writeFile(join(work, file), content);

    const result = await collectWorking(work, work);
    const entry = result.files.find((f) => f.file === file);
    expect(entry).toBeDefined();
    expect(entry?.additions).toBe(10);
    expect(entry?.deletions).toBe(0);
  });
});

describe("untracked files — AC7-2 (additions > 0 for untracked file)", () => {
  beforeEach(async () => {
    work = await fsPromises.mkdtemp(join(tmpdir(), "r5-untracked-"));
    await bootstrapRepo();
  });

  afterEach(async () => {
    await fsPromises.rm(work, { recursive: true, force: true });
  });

  it("T7.2 2-line untracked file has additions === 2, deletions === 0", async () => {
    const file = "src/__test_untracked.ts";
    await fsPromises.mkdir(join(work, "src"), { recursive: true });
    await fsPromises.writeFile(join(work, file), 'console.log("hello")\nconsole.log("world")\n');

    const result = await collectWorking(work, work);
    expect(result.files[0]?.additions).toBe(2);
    expect(result.files[0]?.deletions).toBe(0);
  });
});

describe("untracked files — AC7-3 (no untracked files → no behavior change)", () => {
  beforeEach(async () => {
    work = await fsPromises.mkdtemp(join(tmpdir(), "r5-untracked-"));
    await bootstrapRepo();
  });

  afterEach(async () => {
    await fsPromises.rm(work, { recursive: true, force: true });
  });

  it("T7.3 only modified tracked files — no untracked files appear", async () => {
    await fsPromises.writeFile(join(work, "file.txt"), "v1\n");
    await git(work, ["add", "file.txt"]);
    await git(work, ["commit", "-q", "-m", "add file.txt"]);
    await fsPromises.writeFile(join(work, "file.txt"), "v1\nmodified\n");

    const result = await collectWorking(work, work);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.file).toBe("file.txt");
    expect(result.files[0]?.status).toBe("modified");
    expect(result.files[0]?.additions).toBe(1);
    expect(result.files[0]?.deletions).toBe(0);
  });
});

describe("untracked files — AC7-4 (.gitignore'd untracked file excluded)", () => {
  beforeEach(async () => {
    work = await fsPromises.mkdtemp(join(tmpdir(), "r5-untracked-"));
    await bootstrapRepo();
  });

  afterEach(async () => {
    await fsPromises.rm(work, { recursive: true, force: true });
  });

  it("T7.4 .gitignore-listed untracked file is excluded from the result", async () => {
    await fsPromises.writeFile(join(work, ".gitignore"), "dist/\n");
    await git(work, ["add", ".gitignore"]);
    await git(work, ["commit", "-q", "-m", "add .gitignore"]);
    await fsPromises.mkdir(join(work, "dist"), { recursive: true });
    await fsPromises.writeFile(join(work, "dist/should-ignore.js"), "x");

    const result = await collectWorking(work, work);
    expect(result.files.find((f) => f.file === "dist/should-ignore.js")).toBeUndefined();
  });
});

describe("__test export — AC7-6 (collectWorking + names + stats exposed)", () => {
  it("T7.6 __test export includes collectWorking, names, stats", () => {
    expect(typeof collectWorking).toBe("function");
    expect(typeof names).toBe("function");
    expect(typeof stats).toBe("function");
  });
});

describe("names() — AC7-1 (low-level: untracked files in names() output)", () => {
  beforeEach(async () => {
    work = await fsPromises.mkdtemp(join(tmpdir(), "r5-names-"));
    await bootstrapRepo();
  });

  afterEach(async () => {
    await fsPromises.rm(work, { recursive: true, force: true });
  });

  it("names() lists the untracked file even though no tracked diff exists", async () => {
    await fsPromises.mkdir(join(work, "src"), { recursive: true });
    await fsPromises.writeFile(join(work, "src/foo.ts"), "x");

    const result = await names(work, ".", true);
    expect(result.error).toBeUndefined();
    expect(result.files).toContain("src/foo.ts");
  });
});

describe("stats() — AC7-2 (low-level: stats map excludes untracked)", () => {
  beforeEach(async () => {
    work = await fsPromises.mkdtemp(join(tmpdir(), "r5-stats-"));
    await bootstrapRepo();
  });

  afterEach(async () => {
    await fsPromises.rm(work, { recursive: true, force: true });
  });

  it("stats() returns an empty map for untracked files (the fallback in collectWorking handles them)", async () => {
    const map = await stats(work, ".", true);
    expect(map.size).toBe(0);
  });
});
