import { describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { fileExists, readFileJson, readFileText, writeFile } from "./runtime-compat";

const IS_BUN = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";

describe("runtime-compat — public API surface", () => {
  it("exports fileExists as an async function", () => {
    expect(typeof fileExists).toBe("function");
  });

  it("exports readFileText as an async function", () => {
    expect(typeof readFileText).toBe("function");
  });

  it("exports readFileJson as an async function", () => {
    expect(typeof readFileJson).toBe("function");
  });

  it("exports writeFile as an async function", () => {
    expect(typeof writeFile).toBe("function");
  });
});

describe("runtime-compat — fileExists (Node path, always available)", () => {
  it("returns true for an existing file", async () => {
    const tmpFile = path.join(os.tmpdir(), `runtime-compat-exists-${Date.now()}.txt`);
    await fs.writeFile(tmpFile, "hello");
    try {
      expect(await fileExists(tmpFile)).toBe(true);
    } finally {
      await fs.unlink(tmpFile);
    }
  });

  it("returns false for a non-existent file", async () => {
    const fakePath = path.join(os.tmpdir(), `runtime-compat-nonexistent-${Date.now()}.txt`);
    expect(await fileExists(fakePath)).toBe(false);
  });
});

describe("runtime-compat — readFileText (Node path, always available)", () => {
  it("returns the file content for an existing file", async () => {
    const tmpFile = path.join(os.tmpdir(), `runtime-compat-read-${Date.now()}.txt`);
    await fs.writeFile(tmpFile, "hello world");
    try {
      expect(await readFileText(tmpFile)).toBe("hello world");
    } finally {
      await fs.unlink(tmpFile);
    }
  });

  it("returns empty string for a non-existent file", async () => {
    const fakePath = path.join(os.tmpdir(), `runtime-compat-missing-${Date.now()}.txt`);
    expect(await readFileText(fakePath)).toBe("");
  });
});

describe("runtime-compat — readFileJson (Node path, always available)", () => {
  it("returns parsed JSON for an existing file", async () => {
    const tmpFile = path.join(os.tmpdir(), `runtime-compat-json-${Date.now()}.json`);
    const data = { hello: "world", count: 42 };
    await fs.writeFile(tmpFile, JSON.stringify(data));
    try {
      const result = await readFileJson<typeof data>(tmpFile, { hello: "default", count: 0 });
      expect(result).toEqual(data);
    } finally {
      await fs.unlink(tmpFile);
    }
  });

  it("returns the default value for a non-existent file", async () => {
    const fakePath = path.join(os.tmpdir(), `runtime-compat-json-missing-${Date.now()}.json`);
    const fallback = { hello: "default", count: -1 };
    expect(await readFileJson(fakePath, fallback)).toBe(fallback);
  });
});

describe("runtime-compat — writeFile (Node path, always available)", () => {
  it("writes content to a file", async () => {
    const tmpFile = path.join(os.tmpdir(), `runtime-compat-write-${Date.now()}.txt`);
    try {
      await writeFile(tmpFile, "test content");
      const content = await fs.readFile(tmpFile, "utf8");
      expect(content).toBe("test content");
    } finally {
      await fs.unlink(tmpFile);
    }
  });

  it("overwrites existing file content", async () => {
    const tmpFile = path.join(os.tmpdir(), `runtime-compat-overwrite-${Date.now()}.txt`);
    await fs.writeFile(tmpFile, "initial");
    try {
      await writeFile(tmpFile, "updated");
      const content = await fs.readFile(tmpFile, "utf8");
      expect(content).toBe("updated");
    } finally {
      await fs.unlink(tmpFile);
    }
  });
});

describe("runtime-compat — runtime detection (IS_BUN)", () => {
  it("IS_BUN is a boolean", () => {
    expect(typeof IS_BUN).toBe("boolean");
  });
});

describe("runtime-compat — test-injection seam (R158 carry-over closure)", () => {
  it("_BUN is captured from globalThis.Bun at module-init time (R156 carry-over closure)", async () => {
    const src = await Bun.file("src/runtime-compat.ts").text();
    expect(src).toMatch(/const _BUN: typeof Bun \| undefined/);
    expect(src).toMatch(/\(globalThis as \{ Bun\?: typeof Bun \}\)\.Bun/);
  });

  it("fileExists calls bun().file(path).exists() on the Bun path (R158 behavior-contract)", async () => {
    const src = await Bun.file("src/runtime-compat.ts").text();
    expect(src).toMatch(/bun\(\)\.file\(path\)\.exists\(\)/);
  });

  it("fileExists falls back to fs.access() on the Node path (R158 behavior-contract)", async () => {
    const src = await Bun.file("src/runtime-compat.ts").text();
    expect(src).toMatch(/fs\.access\(/);
  });
});
