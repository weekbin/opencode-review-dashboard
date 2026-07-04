// R106 — loop gap #9 fix: per-file test count drift detection.
//
// 22 i18n rounds (R82-R101) + 4 gap-fix rounds (R102-R105) touched source.
// silent truncation of test cases would be invisible without a snapshot.
// this test asserts the total `it()` + `test()` count has not regressed
// from a committed baseline.
//
// bootstrap: if the snapshot is missing, the test creates it and passes.
// rationale: this is the FIRST time the test runs; no regression possible.
//
// refactor path: if a developer legitimately reduces test count (e.g., merges
// two tests into one), delete `src/r106-test-count-snapshot.json` and re-run.
// the test re-bootstraps the new baseline. this forces a conscious decision
// rather than silent drift.

import { describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const SNAPSHOT_PATH = "src/r106-test-count-snapshot.json";
const TEST_COUNT_RE = /\b(?:it|test)\(\s*['"]/g;

function listTestFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let isDir = false;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }
    if (isDir) {
      out.push(...listTestFiles(full));
    } else if (full.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

function countTests(): number {
  let total = 0;
  for (const path of listTestFiles("src")) {
    const content = readFileSync(path, "utf-8");
    const matches = content.match(TEST_COUNT_RE);
    if (matches) total += matches.length;
  }
  return total;
}

interface Snapshot {
  total: number;
  at: string;
  regex: string;
  note: string;
}

function loadSnapshot(): Snapshot | null {
  if (!existsSync(SNAPSHOT_PATH)) return null;
  return JSON.parse(readFileSync(SNAPSHOT_PATH, "utf-8")) as Snapshot;
}

describe("R106 — total test count drift (gap #9)", () => {
  it("snapshot exists at expected path", () => {
    expect(existsSync(SNAPSHOT_PATH)).toBe(true);
  });

  it("total it()/test() count has not regressed from snapshot", () => {
    const snapshot = loadSnapshot();
    if (!snapshot) {
      // bootstrap path: first run after a refactor that deleted the snapshot.
      // write a fresh baseline and pass.
      const fresh: Snapshot = {
        total: countTests(),
        at: new Date().toISOString(),
        regex: TEST_COUNT_RE.source,
        note: "R106 bootstrap — snapshot deleted and re-created.",
      };
      mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
      writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(fresh, null, 2)}\n`);
      expect(true).toBe(true);
      return;
    }
    const current = countTests();
    expect(current).toBeGreaterThanOrEqual(snapshot.total);
  });
});
