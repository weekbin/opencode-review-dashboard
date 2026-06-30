/**
 * Unit tests for R14 #23 / #25 / #24 — Sort findings dropdown, previously-
 * discussed round filter, draft auto-save indicator (closes #23, #25, #24).
 *
 * Covers AC1 (sort 4 modes), AC2 (sort sticky localStorage), AC3 (sort is
 * pure client-side reducer), AC4 (round filter chip), AC5 (filter in-memory
 * only), AC6 (filter composes with search), AC7 (indicator hidden when no
 * stamp, ticks every 5s), AC8 (indicator → "All changes saved" after 60s),
 * AC9 (state survives reload).
 *
 * Strategy:
 *  - Pure sort reducer (sortConversationEntries) is exported via
 *    sortConversationEntries and exercised as a real function.
 *  - State-shape + DOM-wiring is verified via source grep on
 *    src/index.ts, src/ui/app.ts, and src/ui/review.html (mirrors the
 *    static-analysis pattern from R9–R13 test files).
 *  - The formatRelativeSeconds helper is exercised directly to cover
 *    the "Saved Xs ago" tick formatting (AC7/AC8).
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

import { sortConversationEntries } from "./sort-utils";
import {
  formatRelativeSeconds,
  SAVE_INDICATOR_HIDE_AFTER_MS,
  SAVE_INDICATOR_TICK_MS,
} from "./format-utils";

const INDEX_TS = join(import.meta.dir, "index.ts");
const APP_TS = join(import.meta.dir, "ui", "app.ts");
const HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

// Minimal ConversationEntry shape — sortConversationEntries is generic but
// the reducer only reads id/round/file/start_line/severity/created_at so
// the rest can stay empty.
type Entry = {
  id: string;
  round: number;
  file: string;
  start_line: number;
  end_line: number;
  category: string;
  severity: string;
  comment: string;
  status: string;
  origin: "existing" | "new";
  created_at: number;
};

function makeEntry(over: Partial<Entry>): Entry {
  return {
    id: over.id ?? "x",
    round: over.round ?? 0,
    file: over.file ?? "src/a.ts",
    start_line: over.start_line ?? 1,
    end_line: over.end_line ?? 1,
    category: over.category ?? "bug",
    severity: over.severity ?? "medium",
    comment: over.comment ?? "",
    status: over.status ?? "open",
    origin: over.origin ?? "existing",
    created_at: over.created_at ?? 0,
  };
}

describe("AC1 + AC2 + AC3 — Sort findings dropdown (R14 #23)", () => {
  it("T14.23.1 sortConversationEntries: 'newest' default (round DESC, created_at ASC)", () => {
    const entries: Entry[] = [
      makeEntry({ id: "a", round: 1, created_at: 200 }),
      makeEntry({ id: "b", round: 2, created_at: 100 }),
      makeEntry({ id: "c", round: 1, created_at: 100 }),
      makeEntry({ id: "d", round: 2, created_at: 200 }),
    ];
    // Round 2 group first (round DESC), then within it: b(100) before d(200)
    // (created_at ASC). Round 1 group second: c(100) before a(200).
    const sorted = sortConversationEntries(entries, "newest");
    expect(sorted.map((e) => e.id)).toEqual(["b", "d", "c", "a"]);
  });

  it("T14.23.2 sortConversationEntries: 'oldest' is the reverse of 'newest'", () => {
    const entries: Entry[] = [
      makeEntry({ id: "a", round: 1, created_at: 200 }),
      makeEntry({ id: "b", round: 2, created_at: 100 }),
      makeEntry({ id: "c", round: 1, created_at: 100 }),
      makeEntry({ id: "d", round: 2, created_at: 200 }),
    ];
    // Round 1 group first (round ASC), then within it: c(100) before a(200).
    // Round 2 group second: b(100) before d(200).
    const sorted = sortConversationEntries(entries, "oldest");
    expect(sorted.map((e) => e.id)).toEqual(["c", "a", "b", "d"]);
  });

  it("T14.23.3 sortConversationEntries: 'severity' orders high before medium before low", () => {
    const entries: Entry[] = [
      makeEntry({ id: "low", severity: "low", created_at: 100 }),
      makeEntry({ id: "high", severity: "high", created_at: 200 }),
      makeEntry({ id: "med", severity: "medium", created_at: 150 }),
    ];
    const sorted = sortConversationEntries(entries, "severity");
    expect(sorted.map((e) => e.id)).toEqual(["high", "med", "low"]);
  });

  it("T14.23.4 sortConversationEntries: 'file' orders A–Z case-insensitively with line tie-break", () => {
    const entries: Entry[] = [
      makeEntry({ id: "B", file: "src/b.ts", start_line: 1 }),
      makeEntry({ id: "A1", file: "src/A.ts", start_line: 10 }),
      makeEntry({ id: "A0", file: "src/A.ts", start_line: 1 }),
      makeEntry({ id: "Z", file: "src/z.ts", start_line: 1 }),
    ];
    const sorted = sortConversationEntries(entries, "file");
    expect(sorted.map((e) => e.id)).toEqual(["A0", "A1", "B", "Z"]);
  });

  it("T14.23.5 state.sortFindingsBy is read from localStorage via the readStored helper", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/SORT_FINDINGS_KEY/);
    // Multi-line tolerant: the readStored<SortFindingsBy>(...) call spans
    // 5 lines in the source.
    expect(src).toMatch(
      /sortFindingsBy:\s*readStored<SortFindingsBy>\([\s\S]*?SORT_FINDINGS_KEY,[\s\S]*?\[.*?"newest".*?"oldest".*?"severity".*?"file".*?\][\s\S]*?"newest",?\s*\)/,
    );
  });

  it("T14.23.6 setSortFindingsBy persists via writeStored (mirrors setConversationFilter pattern)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /function\s+setSortFindingsBy[\s\S]{0,400}writeStored\(SORT_FINDINGS_KEY,\s*sort\)/,
    );
  });

  it("T14.23.7 <select id=sort-findings> is wired in review.html with 4 options", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/<select\s+id="sort-findings"\s+class="sort-findings"/);
    expect(html).toMatch(/<option\s+value="newest">Newest first<\/option>/);
    expect(html).toMatch(/<option\s+value="oldest">Oldest first<\/option>/);
    expect(html).toMatch(/<option\s+value="severity">Severity \(high → low\)<\/option>/);
    expect(html).toMatch(/<option\s+value="file">File path \(A–Z\)<\/option>/);
  });

  it("T14.23.8 CSS for .sort-findings-label and .sort-findings exists in review.html", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.sort-findings-label\s*\{/);
    expect(html).toMatch(/\.sort-findings\s*\{/);
    expect(html).toMatch(/\.sort-findings:focus-visible\s*\{/);
  });
});

describe("AC4 + AC5 + AC6 — Previously-discussed round filter (R14 #25)", () => {
  it("T14.25.1 <select id=filter-previously-by-round> is wired in review.html with default 'All rounds' option", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(
      /<select\s+id="filter-previously-by-round"\s+class="filter-previously-by-round"/,
    );
    expect(html).toMatch(/<option\s+value="all">All rounds<\/option>/);
  });

  it("T14.25.2 state.previouslyFilterByRound is in-memory ONLY (NOT localStorage)", async () => {
    const src = await readSource(APP_TS);
    // Positive: the field exists.
    expect(src).toMatch(/previouslyFilterByRound:\s*"all"\s+as\s+"all"\s*\|\s*number/);
    // Negative: the field is NOT initialized via readStored + no
    // writeStored call site on the round filter. (Sort findings IS
    // localStorage-persisted, so we check the negative specifically.)
    const roundFilterBlock = src.match(/previouslyFilterByRound:\s*"all"[\s\S]{0,200}?[\n,;]/)?.[0];
    expect(roundFilterBlock).toBeTruthy();
    expect(roundFilterBlock).not.toMatch(/readStored|writeStored|localStorage/);
  });

  it("T14.25.3 setPreviouslyFilterByRound is a no-network-call state setter (mirrors setSortFindingsBy shape)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+setPreviouslyFilterByRound/);
    const block = src.match(/function\s+setPreviouslyFilterByRound[\s\S]{0,400}?\n}/)?.[0];
    expect(block).toBeTruthy();
    // No fetch() / no localStorage write.
    expect(block).not.toMatch(/fetch\(|writeStored|localStorage\.setItem/);
  });

  it("T14.25.4 round filter composes with R8 in-tab search (filterByQuery runs first)", async () => {
    // The renderPreviouslyDiscussedPanel function builds searched
    // (filterByQuery output) and then narrows by state.previouslyFilterByRound.
    // Verify the actual filter-narrowing step runs AFTER the search filter.
    // (The dropdown-population step ALSO references previouslyFilterByRound
    // but it runs BEFORE the search — that's intentional, so we look for
    // the .filter( call that follows filterByQuery.)
    const src = await readSource(APP_TS);
    const startIdx = src.indexOf("function renderPreviouslyDiscussedPanel");
    expect(startIdx).toBeGreaterThan(-1);
    // Walk braces to find the function's closing brace.
    let depth = 0;
    let endIdx = -1;
    let inBlock = false;
    for (let i = startIdx; i < src.length; i++) {
      const ch = src[i];
      if (ch === "{") {
        depth++;
        inBlock = true;
      } else if (ch === "}") {
        depth--;
        if (inBlock && depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
    expect(endIdx).toBeGreaterThan(startIdx);
    const block = src.slice(startIdx, endIdx);
    expect(block).toMatch(/filterByQuery\(/);
    // The post-search filter narrows by round: `searched.filter((r) => r.round === ...)`
    expect(block).toMatch(/searched\.filter\(\(r\)\s*=>\s*r\.round\s*===/);
    // The .filter call must come AFTER the filterByQuery call.
    const idxFilterByQuery = block.indexOf("filterByQuery(");
    const idxSearchedFilter = block.indexOf("searched.filter(");
    expect(idxFilterByQuery).toBeGreaterThan(-1);
    expect(idxSearchedFilter).toBeGreaterThan(idxFilterByQuery);
  });

  it("T14.25.5 CSS for .filter-previously-label and .filter-previously-by-round exists", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.filter-previously-label\s*\{/);
    expect(html).toMatch(/\.filter-previously-by-round\s*\{/);
  });
});

describe("AC7 + AC8 + AC9 — Draft auto-save indicator (R14 #24)", () => {
  it("T14.24.1 Draft type in src/index.ts gains optional lastSavedAt field", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(/type\s+Draft\s*=\s*\{[\s\S]*?\n\};/)?.[0];
    expect(block).toBeTruthy();
    expect(block).toMatch(/lastSavedAt\?:\s*number/);
  });

  it("T14.24.2 PUT /draft handler stores max(client, server, prev) lastSavedAt and echoes it", async () => {
    const src = await readSource(INDEX_TS);
    // The handler computes max(clientLastSavedAt, now, base.draft?.lastSavedAt)
    // and stores it on the next draft object. Echo is via lastSavedAt in
    // the response body.
    expect(src).toMatch(
      /Math\.max\(clientLastSavedAt,\s*now,\s*base\.draft\?\.lastSavedAt\s*\?\?\s*0\)/,
    );
    // Storage: `draft: { notes, new_findings, lastSavedAt }` in the next
    // State object (multi-line tolerant).
    expect(src).toMatch(
      /draft:\s*\{[\s\S]*?notes,[\s\S]*?new_findings,[\s\S]*?lastSavedAt,[\s\S]*?\}/,
    );
    // Echo: response body has `ok: true, lastSavedAt`.
    expect(src).toMatch(/new\s+Response\(JSON\.stringify\(\{\s*ok:\s*true,\s*lastSavedAt\s*\}\)/);
  });

  it("T14.24.3 draftPayload includes lastSavedAt: Date.now() (client stamp)", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/lastSavedAt:\s*Date\.now\(\)/);
  });

  it("T14.24.4 saveDraft adopts the server's echoed lastSavedAt as the new baseline", async () => {
    const src = await readSource(APP_TS);
    // saveDraft reads response.json().lastSavedAt and assigns to state.draftLastSavedAt.
    expect(src).toMatch(
      /await\s+response\.json\(\)[\s\S]{0,200}state\.draftLastSavedAt\s*=\s*serverStamp/,
    );
  });

  it("T14.24.5 formatRelativeSeconds: <1.5s → 'just now'; <60s → 'Ns ago'; <60m → 'Nm ago'", () => {
    expect(formatRelativeSeconds(0)).toBe("just now");
    expect(formatRelativeSeconds(1_499)).toBe("just now");
    // Math.floor: 1500ms..1999ms → 1s ago; 2000ms..2999ms → 2s ago.
    expect(formatRelativeSeconds(1_500)).toBe("1s ago");
    expect(formatRelativeSeconds(2_000)).toBe("2s ago");
    expect(formatRelativeSeconds(5_000)).toBe("5s ago");
    expect(formatRelativeSeconds(59_999)).toBe("59s ago");
    expect(formatRelativeSeconds(60_000)).toBe("1m ago");
    expect(formatRelativeSeconds(3_540_000)).toBe("59m ago");
    // The m→h boundary: 3_600_000ms is 60m (m===60, not <60), so it
    // falls through to "1h ago". There's no "60m ago" output.
    expect(formatRelativeSeconds(3_600_000)).toBe("1h ago");
    expect(formatRelativeSeconds(7_200_000)).toBe("2h ago");
  });

  it("T14.24.6 SAVE_INDICATOR_HIDE_AFTER_MS === 60_000 and TICK_MS === 5_000", () => {
    expect(SAVE_INDICATOR_HIDE_AFTER_MS).toBe(60_000);
    expect(SAVE_INDICATOR_TICK_MS).toBe(5_000);
  });

  it("T14.24.7 <span id=save-indicator> is in the review header with id=save-indicator", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/<span\s+class="save-indicator"\s+id="save-indicator"/);
    expect(html).toMatch(/data-state="idle"/);
  });

  it("T14.24.8 CSS for .save-indicator + .pulse-on-save + @keyframes save-indicator-pulse exists", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.save-indicator\s*\{/);
    expect(html).toMatch(/\.save-indicator\[data-state="idle"\]\s*\{/);
    expect(html).toMatch(/\.save-indicator\.pulse-on-save\s*\{/);
    expect(html).toMatch(/@keyframes\s+save-indicator-pulse\s*\{/);
  });
});
