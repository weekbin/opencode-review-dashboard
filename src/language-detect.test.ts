/**
 * Unit tests for `detectLanguage()` — sub-candidate #9 (Agent language matching).
 *
 * Covers AC9-1 (zh-CN), AC9-2 (en), AC9-3 (mixed), AC9-4 (empty fallback),
 * AC9-6 (`__test` export includes `detectLanguage`).
 *
 * Threshold rules (per .omo/round-5/plan.md §3):
 *   - CJK ratio > 0.3 → "zh-CN"
 *   - CJK ratio < 0.1 → "en"
 *   - else → "mixed"
 *   - empty / whitespace → "en" (fallback to current default behavior)
 *
 * Run with:  bun run test:unit
 */

import { describe, expect, it } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { __test } from "./index";

const { detectLanguage } = __test as unknown as {
  detectLanguage: (text: string) => "zh-CN" | "en" | "mixed";
};

describe("detectLanguage — AC9-1 (zh-CN, CJK ratio > 0.3)", () => {
  it("T9.1 returns zh-CN for a Chinese-dominant sentence with English technical terms", () => {
    expect(
      detectLanguage(
        "这个 middleware 应该使用 jwt.verify 来验证 token。请不要使用 jwt.decode 来解码 token，这样做不安全。",
      ),
    ).toBe("zh-CN");
  });

  it("T9.6 returns zh-CN for pure 2-char Chinese", () => {
    expect(detectLanguage("中文")).toBe("zh-CN");
  });

  it("T9.9 returns zh-CN for a long Chinese paragraph (CJK ratio > 0.5)", () => {
    const paragraph =
      "请使用 jwt.verify 来验证 token,不要使用 jwt.decode,因为 decode 不会验证签名。在处理用户认证时,这个安全性是非常重要的考虑因素,务必使用正确的 API。";
    expect(detectLanguage(paragraph)).toBe("zh-CN");
  });

  it("returns zh-CN when CJK ratio is just above 0.3 (boundary)", () => {
    // 1 CJK + 2 ASCII = 1/3 ≈ 0.333 > 0.3
    expect(detectLanguage("中ab")).toBe("zh-CN");
  });
});

describe("detectLanguage — AC9-2 (en, CJK ratio < 0.1)", () => {
  it("T9.2 returns en for a pure English sentence with technical terms", () => {
    expect(detectLanguage("Please use jwt.verify instead of jwt.decode")).toBe("en");
  });

  it("T9.7 returns en for a short English sentence", () => {
    expect(detectLanguage("Hello world")).toBe("en");
  });

  it("T9.10 returns en for a long English paragraph (CJK ratio < 0.05)", () => {
    const paragraph =
      "Please ensure all the database queries are using parameterized statements to prevent SQL injection attacks. The current implementation uses string concatenation which is a known security vulnerability that should be fixed immediately.";
    expect(detectLanguage(paragraph)).toBe("en");
  });

  it("returns en when CJK ratio is just below 0.1 (boundary)", () => {
    // 1 CJK + 11 ASCII = 1/12 ≈ 0.083 < 0.1
    expect(detectLanguage("中abcdefghijk")).toBe("en");
  });
});

describe("detectLanguage — AC9-3 (mixed, CJK ratio between 0.1 and 0.3)", () => {
  it("T9.3 returns mixed for a bilingual sentence with CJK between 10-30%", () => {
    expect(detectLanguage("Use jwt.verify for 这个 auth middleware — 验证 token 的标准做法")).toBe(
      "mixed",
    );
  });

  it("T9.8 returns mixed for another bilingual sentence", () => {
    expect(detectLanguage("这个 is a test of mixed 语言")).toBe("mixed");
  });

  it("returns mixed when CJK ratio is at the middle of the band", () => {
    expect(detectLanguage("中abcde")).toBe("mixed");
  });
});

describe("detectLanguage — AC9-4 (empty / whitespace fallback to en)", () => {
  it("T9.4 returns en for an empty string", () => {
    expect(detectLanguage("")).toBe("en");
  });

  it("T9.5 returns en for whitespace-only input", () => {
    expect(detectLanguage("   \n\t  ")).toBe("en");
  });

  it("returns en for input that is just a newline", () => {
    expect(detectLanguage("\n")).toBe("en");
  });
});

describe("detectLanguage — agent-prompt structural check (AC9-5)", () => {
  it("the ### Language Matching section is present in src/index.ts agent prompt", async () => {
    const src = await fsPromises.readFile(join(import.meta.dir, "index.ts"), "utf8");

    const templateMatch = src.match(/template:\s*\[([\s\S]*?)\]\.join\("\\n"\)/);
    expect(templateMatch).not.toBeNull();
    if (!templateMatch) return;

    const templateBody = templateMatch[1];
    expect(templateBody).toContain("### Language Matching");
    expect(templateBody).toContain("30% CJK");
    expect(templateBody).toContain("zh-CN");
    expect(templateBody).toContain("English");
  });
});
