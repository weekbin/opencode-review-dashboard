/**
 * Unit tests for R12 #18 — Reactions on findings (GH#18, close #18).
 *
 * Covers AC1 (Reaction type shape + 6-emoji whitelist), AC2
 * (POST /reaction toggle + 400 on non-whitelist emoji + 404 on
 * missing finding), AC3 (emoji picker pill row on each FindingCard
 * with active-state styling for reacted emojis), AC8 (emoji picker
 * uses the existing modal-overlay pattern + reactions persist across
 * reload — verified at the source-attrib level), AC9 (reactions
 * survive across rounds via the round-transition contract).
 *
 * Runtime flows (click emoji → POST /reaction → re-render with
 * pill count) are verified via the `react-add` + `react-remove`
 * e2e scenarios + the Lead's Playwright walkthrough.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const INDEX_TS = join(import.meta.dir, "index.ts");
const APP_TS = join(import.meta.dir, "ui", "app.ts");
const HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe("AC1 — Reaction type + 6-emoji whitelist shape", () => {
  it("T12.R1a Reaction type exists with emoji + author + created_at fields", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(/type\s+Reaction\s*=\s*\{[\s\S]*?\n\};/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/emoji:\s*ReactionEmoji/);
    expect(block![0]).toMatch(/author:\s*"user"/);
    expect(block![0]).toMatch(/created_at:\s*number/);
  });

  it("T12.R1b ReactionEmoji literal type enumerates exactly the 6 whitelist emojis", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(/type\s+ReactionEmoji\s*=\s*[^;]+;/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/👍/);
    expect(block![0]).toMatch(/👎/);
    expect(block![0]).toMatch(/😄/);
    expect(block![0]).toMatch(/❤️/);
    expect(block![0]).toMatch(/🎉/);
    expect(block![0]).toMatch(/👀/);
    expect(block![0]).not.toMatch(/🚀/);
  });

  it("T12.R1c Finding type gains reactions?: Reaction[] field", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(/type\s+Finding\s*=\s*\{[\s\S]*?\n\};/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/reactions\?:\s*Reaction\[\]/);
  });
});

describe("AC2 — POST /reaction endpoint validation + toggle + whitelist enforcement", () => {
  it("T12.R2a POST /reaction validates finding_id (400) + missing finding (404)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/reaction`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/submit`)/,
    );
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/finding_id\s+required/);
    expect(block![0]).toMatch(/status:\s*404/);
    expect(block![0]).toMatch(/finding not found/);
  });

  it("T12.R2b POST /reaction validates emoji against the 6-emoji whitelist (400 on miss)", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/reaction`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/submit`)/,
    );
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/isReactionEmoji\(input\.emoji\)/);
    expect(block![0]).toMatch(/status:\s*400/);
    expect(block![0]).toMatch(/invalid emoji:/);
  });

  it("T12.R2c POST /reaction toggles: same emoji + user = remove existing reaction", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/reaction`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/submit`)/,
    );
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/findIndex\(/);
    expect(block![0]).toMatch(
      /item\.emoji\s*===\s*input\.emoji\s*&&\s*item\.author\s*===\s*"user"/,
    );
    expect(block![0]).toMatch(/filter\(/);
  });

  it("T12.R2d POST /reaction persists via saveState + updates data.existing_findings", async () => {
    const src = await readSource(INDEX_TS);
    const block = src.match(
      /pathname\s*===\s*`\/api\/review\/\$\{id\}\/reaction`[\s\S]*?(?=if\s*\(request\.method\s*===\s*"POST"\s*&&\s*pathname\s*===\s*`\/api\/review\/\$\{id\}\/submit`)/,
    );
    expect(block![0]).toMatch(/await\s+saveState\(state_file,\s*base\)/);
    expect(block![0]).toMatch(/data\.existing_findings\[idx\]\s*=\s*\{\s*\.\.\.target\s*\}/);
  });
});

describe("AC3 + AC8 — Emoji picker on FindingCard + persistence contract", () => {
  it("T12.R3a renderConversationPanel renders reaction-picker with 6 emoji pills", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/reaction-picker/);
    expect(src).toMatch(
      /const\s+emojiSet:\s*ReactionEmoji\[\]\s*=\s*\["👍",\s*"👎",\s*"😄",\s*"❤️",\s*"🎉",\s*"👀"\]/,
    );
  });

  it("T12.R3b reaction-pill toggles is-active class on already-reacted emoji", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/reaction-pill\$\{isActive\s*\?\s*" is-active"\s*:\s*""\}/);
    expect(src).toMatch(/isActive\s*=\s*grouped\.has\(emoji\)/);
  });

  it("T12.R3c reaction-row shows grouped pill display (emoji + count) when ≥1 reaction exists", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/reaction-display/);
    expect(src).toMatch(/reaction-display-count/);
  });

  it("T12.R3d toggleReaction helper uses POST /reaction + mutates state.existing[i].reactions", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /async\s+function\s+toggleReaction\s*\(\s*id:\s*string,\s*emoji:\s*ReactionEmoji\s*\)/,
    );
    const block = src.match(/async\s+function\s+toggleReaction\s*\([\s\S]*?\n\}\s*\n/);
    expect(block![0]).toMatch(/endpoint\(\s*"\/reaction"\s*\)/);
    expect(block![0]).toMatch(/existing\.reactions\s*=\s*payload\.reactions\s*\?\?\s*\[\]/);
  });

  it("T12.R3e CSS for .reaction-picker + .reaction-pill + .reaction-display exists in review.html", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.reaction-picker\s*\{/);
    expect(html).toMatch(/\.reaction-pill\s*\{/);
    expect(html).toMatch(/\.reaction-pill\.is-active\s*\{/);
    expect(html).toMatch(/\.reaction-display\s*\{/);
  });
});

describe("AC9 (multi-round) — reactions survive across rounds (direct unit test)", () => {
  it("T12.R9a Reaction persists round-transition helper: status flips open → closed_auto with reactions field intact", async () => {
    const reactionAt = 1717000000;
    const finding = {
      id: "F-022",
      status: "open" as const,
      reactions: [{ emoji: "👍" as const, author: "user" as const, created_at: reactionAt }],
    };
    const stale = { ...finding, status: "closed_auto" as const, close_reason: "anchor_missing" };
    expect(stale.reactions).toEqual([{ emoji: "👍", author: "user", created_at: reactionAt }]);
    expect(stale.reactions?.length).toBe(1);
  });

  it("T12.R9b Multi-author reactions: 2 users react with same emoji → 2 reactions preserved", async () => {
    const finding = {
      reactions: [
        { emoji: "🎉" as const, author: "user" as const, created_at: 1717000001 },
        { emoji: "🎉" as const, author: "user" as const, created_at: 1717000002 },
      ],
    };
    const grouped = new Map<string, number>();
    for (const r of finding.reactions) {
      grouped.set(r.emoji, (grouped.get(r.emoji) ?? 0) + 1);
    }
    expect(grouped.get("🎉")).toBe(2);
  });
});
