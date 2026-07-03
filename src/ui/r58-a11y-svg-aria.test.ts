// R58 a11y: layout toggle SVGs and drawer close button need aria-hidden / aria-label.
// Screen readers previously announced decorative SVG rect/path elements.

import { describe, expect, it } from "bun:test";

const REVIEW_HTML_PATH = "src/ui/review.html";

describe("R58 — a11y aria-hidden on decorative SVGs + drawer-close aria-label", () => {
  it("layout-toggle has aria-hidden=true on both Unified and Split SVGs", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const layoutBlock = html.match(/<div class="layout-toggle"[\s\S]*?<\/div>/);
    expect(layoutBlock).not.toBeNull();
    const svgCount = (layoutBlock![0].match(/<svg /g) || []).length;
    expect(svgCount).toBe(2);
    const ariaHiddenCount = (layoutBlock![0].match(/<svg aria-hidden="true"/g) || []).length;
    expect(ariaHiddenCount).toBe(2);
  });

  it("drawer-close button has aria-label + SVG has aria-hidden=true", async () => {
    const html = await Bun.file(REVIEW_HTML_PATH).text();
    const drawerBtn = html.match(/<button[^>]*id="drawer-close"[^>]*>[\s\S]*?<\/button>/);
    expect(drawerBtn).not.toBeNull();
    expect(drawerBtn![0]).toContain('aria-label="Close review drawer"');
    expect(drawerBtn![0]).toContain("<svg");
    expect(drawerBtn![0]).toContain('aria-hidden="true"');
  });
});
