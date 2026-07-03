// R63 file-finding-i18n: 2 instances of `title="File-level findings"` hardcoded English.
// Refactor to use t() so zh-CN users see translated tooltips.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R63 — file-level findings badges use i18n key for title", () => {
  it("i18n has fileFinding.title key with both en + zh-CN", async () => {
    const i18n = await Bun.file(I18N_TS_PATH).text();
    const block = i18n.match(/"fileFinding\.title":\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("en:");
    expect(block![0]).toContain('"zh-CN":');
    expect(block![0]).toContain("File-level findings");
    expect(block![0]).toContain("zh-CN");
    expect(block![0]).toMatch(/文件级审查项/);
  });

  it("app.ts sidebar fileComments.title uses t() instead of hardcoded English", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    // Find the sidebar fileComments section (around line 3135)
    const sidebarBlock = ts.match(
      /fileComments = document\.createElement\("span"\);[\s\S]*?if \(fileCount === 0\) fileComments\.style\.display = "none";/,
    );
    expect(sidebarBlock).not.toBeNull();
    expect(sidebarBlock![0]).not.toMatch(/title = "File-level findings"/);
    expect(sidebarBlock![0]).toMatch(/title = t\("fileFinding\.title"\)/);
  });

  it("app.ts renderDiffPanel fileCommentsBadge.title uses t() instead of hardcoded English", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    // Find renderDiffPanel's fileCommentsBadge section (around line 5060)
    const cardBlock = ts.match(
      /const fileCommentsBadge = document\.createElement\("span"\);[\s\S]*?fileCommentsBadge\.style\.display = fileLevelCount === 0 \? "none" : "";/,
    );
    expect(cardBlock).not.toBeNull();
    expect(cardBlock![0]).not.toMatch(/fileCommentsBadge\.title = "File-level findings"/);
    expect(cardBlock![0]).toMatch(/fileCommentsBadge\.title = t\("fileFinding\.title"\)/);
  });
});
