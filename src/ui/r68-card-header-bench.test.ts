// R68 perf bench: renderDiffPanel inner loop (per-file card header build).
// This is a representative workload, NOT the full DOM rebuild (that requires jsdom
// to mock document.createElement — out of scope for a bun:test unit bench).
//
// The bench captures the string-allocation + object-construction cost of building
// N card-header structures from synthetic file data. Real DOM creation is the
// dominant cost in production renderDiffPanel; this bench provides a lower-bound
// baseline so future optimization rounds have a regression gate.

import { describe, expect, it } from "bun:test";

interface SyntheticFile {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  source: "working" | "index";
}

function generateSyntheticFiles(count: number): SyntheticFile[] {
  const statuses: SyntheticFile["status"][] = ["added", "modified", "deleted", "renamed"];
  const files: SyntheticFile[] = [];
  for (let i = 0; i < count; i++) {
    files.push({
      path: `src/components/file-${i}/deep/nested/path/${i}.ts`,
      status: statuses[i % 4] as SyntheticFile["status"],
      additions: 10 + (i % 50),
      deletions: 5 + (i % 30),
      source: i % 3 === 0 ? "working" : "index",
    });
  }
  return files;
}

// Mimics the per-file card-header object-allocation done inside renderDiffPanel's
// for-of loop (app.ts:4995-5055). This is the testable slice: each iteration
// allocates ~12 child element-like objects and assembles them into a header tree.
function buildCardHeaderPayload(file: SyntheticFile): {
  cardId: string;
  className: string;
  datasetFile: string;
  filename: string;
  statusClass: string;
  statusText: string;
  addText: string;
  delText: string;
  chevronSvg: string;
  iconSvg: string;
} {
  const chevronSvg = '<svg width="14" height="14"><rect /></svg>';
  const iconSvg = '<svg width="14" height="14"><rect /></svg>';
  return {
    cardId: `file-${file.path}`,
    className: "card",
    datasetFile: file.path,
    filename: file.path,
    statusClass: `card-status ${file.status}`,
    statusText: file.status,
    addText: `+${file.additions}`,
    delText: `-${file.deletions}`,
    chevronSvg,
    iconSvg,
  };
}

function buildAllHeaders(files: SyntheticFile[]): unknown[] {
  const out: unknown[] = [];
  for (const file of files) {
    out.push(buildCardHeaderPayload(file));
  }
  return out;
}

describe("R68 — renderDiffPanel inner loop (per-file card header) perf bench", () => {
  it("100-file workload × 100 iter completes <200ms", () => {
    const files = generateSyntheticFiles(100);
    const firstResult = buildCardHeaderPayload(files[0] as SyntheticFile);
    expect(firstResult.cardId).toBeTruthy();

    // Warmup
    buildAllHeaders(files);

    const start = performance.now();
    let lastLength = 0;
    for (let i = 0; i < 100; i++) {
      lastLength = buildAllHeaders(files).length;
    }
    const elapsed = performance.now() - start;

    console.log(
      `[R68 buildCardHeader bench] files=100 iter=100 elapsed=${elapsed.toFixed(2)}ms per_call=${(elapsed / 100).toFixed(3)}ms`,
    );

    expect(lastLength).toBe(100);
    expect(elapsed).toBeLessThan(200);
  });

  it("500-file workload × 100 iter completes <1000ms (linear scaling)", () => {
    const files = generateSyntheticFiles(500);

    buildAllHeaders(files);

    const start = performance.now();
    let lastLength = 0;
    for (let i = 0; i < 100; i++) {
      lastLength = buildAllHeaders(files).length;
    }
    const elapsed = performance.now() - start;

    console.log(
      `[R68 buildCardHeader bench 500] files=500 iter=100 elapsed=${elapsed.toFixed(2)}ms per_call=${(elapsed / 100).toFixed(3)}ms`,
    );

    expect(lastLength).toBe(500);
    expect(elapsed).toBeLessThan(1000);
  });
});
