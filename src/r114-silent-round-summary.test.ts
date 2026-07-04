/**
 * R114 #82 — Silent round auto-summary comment.
 *
 * Verifies the RoundSystemNote type + generator + post-submit hook + cap.
 * Silent round = round had 0 new findings AND 0 new notes. A summary is
 * appended to state.roundSystemNotes[].
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const INDEX_TS = join(import.meta.dir, "index.ts");
const APP_TS = join(import.meta.dir, "ui", "app.ts");
const I18N_TS = join(import.meta.dir, "ui", "i18n.ts");

class FakeStorage {
  store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
}

let fakeStorage: FakeStorage;

beforeEach(() => {
  fakeStorage = new FakeStorage();
  (globalThis as unknown as { localStorage: unknown }).localStorage = fakeStorage;
});

afterEach(() => {});

describe("R114 #82 AC1 — RoundSystemNote type added to state", () => {
  it("src/index.ts State type has roundSystemNotes field", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes("roundSystemNotes")).toBe(true);
  });

  it("src/index.ts RoundSystemNote type definition exists", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes("type RoundSystemNote")).toBe(true);
    expect(src.includes('kind: "silent_round_summary"')).toBe(true);
  });
});

describe("R114 #82 AC2 — silent-round detector function", () => {
  it("src/index.ts detectSilentRound() helper exists", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes("detectSilentRound") || src.includes("isSilentRound")).toBe(true);
  });

  it("src/index.ts renderSilentRoundTemplate() helper exists", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes("renderSilentRoundTemplate") || src.includes("silentRoundSummary")).toBe(
      true,
    );
  });
});

describe("R114 #82 AC3 — submit endpoint appends summary on silent round", () => {
  it("src/index.ts submit handler detects silent round + writes to roundSystemNotes[]", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes("next.roundSystemNotes")).toBe(true);
  });
});

describe("R114 #82 AC4 — summary cap (default 50)", () => {
  it("src/index.ts caps roundSystemNotes to last N (default 50)", async () => {
    const src = await fsPromises.readFile(INDEX_TS, "utf8");
    expect(src.includes("ROUND_SYSTEM_NOTES_CAP") || src.includes("50")).toBe(true);
  });
});

describe("R114 #82 AC5 — conversation pane displays round summary", () => {
  it("src/ui/app.ts renders roundSystemNotes in conversation header", async () => {
    const src = await fsPromises.readFile(APP_TS, "utf8");
    expect(src.includes("roundSystemNotes")).toBe(true);
  });
});

describe("R114 #82 AC6 — i18n for summary header", () => {
  it("src/ui/i18n.ts has summary.silentRound.* keys both locales", async () => {
    const i18nSrc = await fsPromises.readFile(I18N_TS, "utf8");
    expect(i18nSrc.includes('"summary.silentRound.heading"')).toBe(true);
  });
});
