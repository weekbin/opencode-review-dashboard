/**
 * Unit tests for the "Previously discussed" panel.
 *
 * Covers the multi-round ACs (AC3, AC4), security ACs (AC5, AC6), and the
 * payload-shape AC (AC9). See `.omo/round-4/plan.md` §5 (Test plan).
 *
 * Run with:  bun run test:unit
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { __test } from "./index";

const { validateSessionId, parsePriorNotes, readPriorNotesFromSession } = __test;

// ── parsePriorNotes (AC3) ──────────────────────────────────────────────

describe("parsePriorNotes", () => {
  it("T1.1 extracts the Notes section between `## Notes` and the next heading", () => {
    const md = "## Notes\n\nfoo\n\n## Findings\n\n- one\n";
    expect(parsePriorNotes(md)).toBe("foo");
  });

  it("T1.2 extracts Notes when preceded by a top-level heading", () => {
    const md = "# Round 1\n\n## Notes\n\nbar\n\n## Findings\n";
    expect(parsePriorNotes(md)).toBe("bar");
  });

  it("T1.3 returns empty string when there is no Notes section", () => {
    const md = "## Findings\n\n- one\n- two\n";
    expect(parsePriorNotes(md)).toBe("");
  });

  it("T1.4 preserves multi-line notes content verbatim", () => {
    const md = "## Notes\n\nmulti\nline\nnotes\n\n## Findings\n";
    expect(parsePriorNotes(md)).toBe("multi\nline\nnotes");
  });

  it("T1.5 returns empty string for empty input", () => {
    expect(parsePriorNotes("")).toBe("");
  });
});

// ── validateSessionId (AC6) ────────────────────────────────────────────

describe("validateSessionId", () => {
  it("T4.1 rejects path-traversal payloads", () => {
    expect(validateSessionId("../../etc/passwd")).toBe(false);
    expect(validateSessionId("..")).toBe(false);
    expect(validateSessionId("foo/../../bar")).toBe(false);
  });

  it("T4.2 rejects absolute paths and NUL bytes", () => {
    expect(validateSessionId("/etc/passwd")).toBe(false);
    expect(validateSessionId("foo\u0000bar")).toBe(false);
  });

  it("T4.3 rejects strings with `..` substrings", () => {
    expect(validateSessionId("foo..bar")).toBe(false);
  });

  it("T4.4 rejects the empty string", () => {
    expect(validateSessionId("")).toBe(false);
  });

  it("T4.4b accepts simple alphanumeric ids", () => {
    expect(validateSessionId("review_abc-123")).toBe(true);
    expect(validateSessionId("test")).toBe(true);
  });

  it("T4.4c rejects strings longer than 64 chars", () => {
    expect(validateSessionId("a".repeat(65))).toBe(false);
  });

  it("T4.4d rejects non-string inputs", () => {
    expect(validateSessionId(null)).toBe(false);
    expect(validateSessionId(undefined)).toBe(false);
    expect(validateSessionId(42)).toBe(false);
  });
});

// ── readPriorNotesFromSession (AC4, AC5, AC6) ─────────────────────────

let work: string;

beforeEach(async () => {
  work = await fsPromises.mkdtemp(join(tmpdir(), "prior-notes-test-"));
});

afterEach(async () => {
  await fsPromises.rm(work, { recursive: true, force: true });
});

async function writeRound(name: string, body: string) {
  await fsPromises.writeFile(join(work, name), body, "utf8");
}

describe("readPriorNotesFromSession", () => {
  it("T2.1 returns parsed prior notes sorted ascending by round", async () => {
    await writeRound(
      "round-002.md",
      ["# Diff Review Round 2", "", "## Notes", "Round 2 notes", "", "## Findings", "- none"].join(
        "\n",
      ),
    );
    await writeRound(
      "round-001.md",
      ["# Diff Review Round 1", "", "## Notes", "Round 1 notes", "", "## Findings", "- none"].join(
        "\n",
      ),
    );
    const result = await readPriorNotesFromSession(work);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rounds).toHaveLength(2);
    expect(result.rounds[0]).toEqual({ round: 1, notes: "Round 1 notes" });
    expect(result.rounds[1]).toEqual({ round: 2, notes: "Round 2 notes" });
  });

  it("T2.2 returns empty list when no round files exist", async () => {
    const result = await readPriorNotesFromSession(work);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rounds).toEqual([]);
  });

  it("T4.5 returns 404 when the session directory does not exist", async () => {
    const result = await readPriorNotesFromSession(join(work, "does-not-exist"));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("T3.1 does not modify state.json or round-*.json mtimes", async () => {
    await fsPromises.writeFile(
      join(work, "state.json"),
      JSON.stringify({ session_id: "s", round: 2, findings: [], updated_at: 0 }),
      "utf8",
    );
    await fsPromises.writeFile(
      join(work, "round-001.json"),
      JSON.stringify({ round: 1, findings: [] }),
      "utf8",
    );
    await writeRound(
      "round-001.md",
      "# Diff Review Round 1\n\n## Notes\n\nhello\n\n## Findings\n\n- none",
    );
    // Wait briefly so any mtime bump would be observable.
    await new Promise((r) => setTimeout(r, 20));
    const stateBefore = (await fsPromises.stat(join(work, "state.json"))).mtimeMs;
    const roundJsonBefore = (await fsPromises.stat(join(work, "round-001.json"))).mtimeMs;
    const result = await readPriorNotesFromSession(work);
    expect(result.ok).toBe(true);
    const stateAfter = (await fsPromises.stat(join(work, "state.json"))).mtimeMs;
    const roundJsonAfter = (await fsPromises.stat(join(work, "round-001.json"))).mtimeMs;
    expect(stateAfter).toBe(stateBefore);
    expect(roundJsonAfter).toBe(roundJsonBefore);
  });

  it("ignores non-round-*.md files in the session dir", async () => {
    await writeRound("state.json", '{"x":1}');
    await writeRound("README.md", "# Notes\n\nshould not be parsed");
    await writeRound(
      "round-001.md",
      "# Diff Review Round 1\n\n## Notes\n\nreal notes\n\n## Findings\n\n- none",
    );
    const result = await readPriorNotesFromSession(work);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rounds).toEqual([{ round: 1, notes: "real notes" }]);
  });
});

// ── AC9: no State schema change (payload-shape / static) ──────────────

describe("AC9 — State + Finding type shapes are unchanged", () => {
  it("T5.1 State and Finding type declarations match the snapshot", async () => {
    // Snapshot taken from src/index.ts at R4 baseline (870a507). If this
    // test fails, the dev added a new field to the State or Finding type,
    // which is forbidden by the audit-trail integrity rule.
    const expectedState = [
      "type State = {",
      "  session_id: string;",
      "  round: number;",
      "  findings: Finding[];",
      "  draft?: Draft;",
      "  diff_base?: DiffBase;",
      "  previous_diff_base?: DiffBase;",
      "  updated_at: number;",
      "};",
    ].join("\n");

    const expectedFinding = [
      "type Finding = {",
      "  id: string;",
      "  round: number;",
      "  file: string;",
      "  side: Side;",
      "  start_line: number;",
      "  end_line: number;",
      "  category: Category;",
      "  severity: Severity;",
      "  comment: string;",
      '  status: "open" | "closed_auto" | "resolved";',
      "  anchor: Anchor;",
      '  kind: "line" | "file";',
      "  created_at: number;",
      "  updated_at: number;",
      "  closed_at?: number;",
      '  close_reason?: "file_removed" | "anchor_missing";',
      "  manually_reopened?: boolean;",
      "  manually_edited?: boolean;",
      "  edited_at?: number;",
      "  comments?: FindingComment[];",
      "};",
    ].join("\n");

    const src = await fsPromises.readFile(join(import.meta.dir, "index.ts"), "utf8");

    // Find the State and Finding type blocks. Both may have leading
    // whitespace; we strip it line-by-line.
    function findTypeBlock(label: string, body: string): string | null {
      const re = new RegExp(`type\\s+${label}\\s*=\\s*\\{([\\s\\S]*?)\\};`, "m");
      const match = re.exec(body);
      if (!match) return null;
      return `type ${label} = {${match[1]}};`;
    }

    const stateBlock = findTypeBlock("State", src);
    const findingBlock = findTypeBlock("Finding", src);

    expect(stateBlock).not.toBeNull();
    expect(findingBlock).not.toBeNull();
    expect(stateBlock).toBe(expectedState);
    expect(findingBlock).toBe(expectedFinding);
  });
});

// ── AC1: 4th tab button + pane rendered in review.html ────────────────

describe("AC1 — review.html exposes the Previously discussed tab", () => {
  it("T0.1 has exactly one Previously discussed button and one pane", async () => {
    const html = await fsPromises.readFile(join(import.meta.dir, "ui", "review.html"), "utf8");
    const buttonMatches = html.match(/data-tab="previously"/g) ?? [];
    const paneMatches = html.match(/data-pane="previously"/g) ?? [];
    expect(buttonMatches.length).toBe(1);
    expect(paneMatches.length).toBe(1);
  });
});
