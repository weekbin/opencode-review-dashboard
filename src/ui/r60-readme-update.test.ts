// R60 polish: README + README.zh-CN.md lockstep update for R51/R52/R59 features.

import { describe, expect, it } from "bun:test";

const README_EN = "README.md";
const README_ZH = "README.zh-CN.md";

describe("R60 — README documents recent UX features (bilingual lockstep)", () => {
  it("README.md has R51 commit chevron entry", async () => {
    const md = await Bun.file(README_EN).text();
    expect(md).toMatch(/\(added R51\).*commit.*chevron|Commit card fold.*chevron.*R51/s);
  });

  it("README.md has R52 ignore-ws loading entry", async () => {
    const md = await Bun.file(README_EN).text();
    expect(md).toContain("(added R52)");
    expect(md.toLowerCase()).toContain("loading spinner");
  });

  it("README.md has R59 sidebar folder keyboard entry", async () => {
    const md = await Bun.file(README_EN).text();
    expect(md).toContain("(added R59)");
    expect(md.toLowerCase()).toContain("keyboard");
  });

  it("README.zh-CN.md has matching R51/R52/R59 entries (lockstep parity)", async () => {
    const md = await Bun.file(README_ZH).text();
    expect(md).toContain("R51 新增");
    expect(md).toContain("R52 新增");
    expect(md).toContain("R59 新增");
  });

  it("Section counts still parity (EN sections match ZH sections)", async () => {
    const en = await Bun.file(README_EN).text();
    const zh = await Bun.file(README_ZH).text();
    const enCount = (en.match(/^## /gm) || []).length;
    const zhCount = (zh.match(/^## /gm) || []).length;
    expect(enCount).toBe(zhCount);
  });
});
