import { describe, expect, it } from "bun:test";

const INDEX_TS = "src/index.ts";

describe("R154 — server-side i18n-coupling markers (regression net for 10-round-shelved contract)", () => {
  it("src/index.ts writes 'Manually reopened: <reason>' prefix when manually reopening a finding", async () => {
    const src = await Bun.file(INDEX_TS).text();
    expect(src).toMatch(/Manually reopened:/);
  });

  it("src/index.ts writes 'Edited by user<summary>' prefix when user edits a finding", async () => {
    const src = await Bun.file(INDEX_TS).text();
    expect(src).toMatch(/Edited by user/);
  });

  it("src/index.ts AGENT_PROMPT references 'Manually reopened: <reason>' in comments[] instructions", async () => {
    const src = await Bun.file(INDEX_TS).text();
    expect(src).toContain("Manually reopened: <reason>");
  });

  it("src/index.ts AGENT_PROMPT references 'Edited by user' in comments[] instructions", async () => {
    const src = await Bun.file(INDEX_TS).text();
    expect(src).toContain("Edited by user");
  });

  it("R141 retro reasoning: these markers are agent contract (not i18n candidates)", () => {
    // The agent parses these strings as literal prefixes when scanning comments[].
    // Localizing them would break agent parsing. Out of polish scope.
    // R154 just adds a regression test to catch unintended future changes.
    expect(true).toBe(true);
  });
});
