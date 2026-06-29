/**
 * Unit tests for R8 #2 — Sidebar keyboard navigation helpers.
 *
 * Covers AC8-2.10 (cycleTab + tabIndexFor pure-function contract).
 *
 * The helpers live in a small browser-safe module (`src/sidebar-keyboard.ts`)
 * so they can be imported and tested without dragging in the DOM-coupled
 * `src/ui/app.ts`. Runtime keyboard behavior (ArrowUp/ArrowDown/etc. →
 * tab cycles, Home/End → first/last) is verified via Playwright walkthrough
 * in the lead's 3c phase; the e2e harness covers the launch path with the
 * new `sidebar-keyboard-nav` scenario (19).
 *
 * Run with:  bun run test:unit
 */

import { describe, expect, it } from "bun:test";

import { cycleTab, TAB_ORDER, tabIndexFor } from "./sidebar-keyboard";

describe("AC8-2 — sidebar tab keyboard navigation helpers", () => {
  it("T8.2a TAB_ORDER has 4 tabs in declared order (files, commits, conversation, previously)", () => {
    expect(TAB_ORDER).toEqual(["files", "commits", "conversation", "previously"]);
    expect(TAB_ORDER.length).toBe(4);
  });

  it("T8.2b cycleTab wraps in both directions; tabIndexFor emits the 4-element roving array", () => {
    // cycleTab — forward wrap (last index → first)
    expect(cycleTab(3, 1, 4)).toBe(0);
    // cycleTab — backward wrap (first index → last)
    expect(cycleTab(0, -1, 4)).toBe(3);
    // cycleTab — normal forward step
    expect(cycleTab(1, 1, 4)).toBe(2);
    // cycleTab — normal backward step
    expect(cycleTab(2, -1, 4)).toBe(1);
    // tabIndexFor — active index 1 → ["-1","0","-1","-1"]
    expect(tabIndexFor(1, 4)).toEqual(["-1", "0", "-1", "-1"]);
    // tabIndexFor — active index 0 → ["0","-1","-1","-1"]
    expect(tabIndexFor(0, 4)).toEqual(["0", "-1", "-1", "-1"]);
    // tabIndexFor — active index 3 (last) → ["-1","-1","-1","0"]
    expect(tabIndexFor(3, 4)).toEqual(["-1", "-1", "-1", "0"]);
  });
});
