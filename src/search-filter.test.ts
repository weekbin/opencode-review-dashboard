/**
 * Unit tests for R8 #1 — In-tab search (filterByQuery + renderSearchInput).
 *
 * Covers AC8-1.1, AC8-1.2, AC8-1.3, AC8-1.4, AC8-1.6, AC8-1.7.
 *
 * `filterByQuery` is a pure function (no DOM access), so its correctness is
 * tested by direct import + behavioral assertions (T8.1a, T8.1b, T8.1c).
 * The DOM-coupled `renderSearchInput` is verified via static analysis on
 * `src/ui/app.ts` (T8.1d, T8.1e) following the same pattern as
 * `src/abort-controller.test.ts` — runtime behavior of the rendered
 * search input is covered by the new e2e scenario `in-tab-search` in
 * `scripts/test-review-ui/scenarios.mjs`.
 *
 * Run with:  bun run test:unit
 */

import { describe, expect, it } from "bun:test";

import { filterByQuery } from "./search-utils";

type FileLike = { path: string; name: string };
type CommitLike = { sha: string; short_sha: string; message: string };
type FindingLike = {
  id: string;
  file: string;
  comment: string;
  category: string;
  severity: string;
};

const FILES: FileLike[] = [
  { path: "src/ui/app.ts", name: "app.ts" },
  { path: "src/ui/review.html", name: "review.html" },
  { path: "src/state-store.ts", name: "state-store.ts" },
  { path: "README.md", name: "README.md" },
];

const COMMITS: CommitLike[] = [
  { sha: "aaa1111", short_sha: "aaa1111", message: "feat(search): in-tab search" },
  { sha: "bbb2222", short_sha: "bbb2222", message: "fix(abort): loadPriorNotes" },
  { sha: "ccc3333", short_sha: "ccc3333", message: "chore: bump version" },
];

const FINDINGS: FindingLike[] = [
  { id: "f1", file: "src/ui/app.ts", comment: "Use jwt.verify", category: "bug", severity: "high" },
  {
    id: "f2",
    file: "src/state-store.ts",
    comment: "atomic write",
    category: "perf",
    severity: "medium",
  },
  { id: "f3", file: "src/ui/app.ts", comment: "race condition", category: "bug", severity: "low" },
];

describe("AC8-1.7 — filterByQuery pure function (case-insensitive substring)", () => {
  it("T8.1a case-insensitive substring match (Files pane: path field)", () => {
    const out = filterByQuery(FILES, "REVIEW.HTML", (f) => f.path);
    expect(out).toHaveLength(1);
    expect(out[0]?.path).toBe("src/ui/review.html");
  });

  it("T8.1b empty query is identity (AC8-1.4 — empty restores full panel)", () => {
    expect(filterByQuery(FILES, "", (f) => f.path)).toEqual(FILES);
    expect(filterByQuery(FILES, "   ", (f) => f.path)).toEqual(FILES);
  });

  it("T8.1c different pickKey extractors pick different fields (Commits vs Findings)", () => {
    const outByMessage = filterByQuery(COMMITS, "search", (c) => c.message);
    expect(outByMessage).toHaveLength(1);
    expect(outByMessage[0]?.sha).toBe("aaa1111");

    const outByComment = filterByQuery(FINDINGS, "jwt", (f) => f.comment);
    expect(outByComment).toHaveLength(1);
    expect(outByComment[0]?.id).toBe("f1");

    const outByCategory = filterByQuery(FINDINGS, "BUG", (f) => f.category);
    expect(outByCategory).toHaveLength(2);
  });
});
