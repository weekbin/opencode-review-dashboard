/**
 * R19 #37 — Toast notification unit tests.
 *
 * Covers AC2.1 (role=status / aria-live attached), AC2.2 (auto-dismiss
 * after 3s default lifetime, configurable down to a few ms for tests),
 * AC2.3 (4 trigger sites wired — verified via grep on app.ts), AC2.4
 * (close button removes the toast).
 *
 * Run with:  bun test src/ui/toast.test.ts
 *
 * Strategy: use bun:test's `mock` to stub `globalThis.document` with
 * a hand-rolled minimal DOM (just enough surface to run the toast
 * helper). Real `setTimeout` is fine because we pass `lifetimeMs` from
 * the test (50ms) and `await` past it.
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "bun:test";

import { dismissAllToasts, showToast } from "./toast";

const APP_TS = join(import.meta.dir, "..", "..", "src", "ui", "app.ts");

class FakeNode {
  tagName = "";
  children: FakeNode[] = [];
  parent: FakeNode | null = null;
  attrs = new Map<string, string>();
  datasetProxy: Record<string, string> = {};
  listeners = new Map<string, Array<(e?: unknown) => void>>();
  className = "";
  id = "";
  textContent = "";
  ownerDocument: FakeDocument | null = null;

  get parentNode(): FakeNode | null {
    return this.parent;
  }
  get dataset(): Record<string, string> {
    return this.datasetProxy;
  }

  appendChild(child: FakeNode): FakeNode {
    if (child.parent) child.parent.removeChild(child);
    child.parent = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }
  removeChild(child: FakeNode): FakeNode {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    child.parent = null;
    return child;
  }
  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }
  addEventListener(event: string, cb: (e?: unknown) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }
  contains(other: FakeNode | null | undefined): boolean {
    if (!other) return false;
    let cur: FakeNode | null = other;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parent;
    }
    return false;
  }
  click(): void {
    const list = this.listeners.get("click") ?? [];
    for (const cb of list) cb();
  }
}

interface FakeDocument {
  body: FakeNode;
  createElement: (tag: string) => FakeNode;
}

function makeFakeDocument(): FakeDocument {
  const body = new FakeNode();
  body.tagName = "BODY";
  const doc: FakeDocument = {
    body,
    createElement: (tag: string) => {
      const n = new FakeNode();
      n.tagName = tag.toUpperCase();
      n.ownerDocument = doc;
      return n;
    },
  };
  body.ownerDocument = doc;
  return doc;
}

let fakeDoc = makeFakeDocument();
(globalThis as unknown as { document: unknown }).document = fakeDoc;

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

afterEach(() => {
  dismissAllToasts();
  fakeDoc.body.children = [];
  fakeDoc = makeFakeDocument();
  (globalThis as unknown as { document: unknown }).document = fakeDoc;
});

describe("AC2.1 — showToast appends a role=status toast in a polite live region", () => {
  it("container has role/aria-live polite; toast has role=status", () => {
    showToast("hello");
    const container = fakeDoc.body.children[0]!;
    expect(container.attrs.get("aria-live")).toBe("polite");
    expect(container.attrs.get("aria-atomic")).toBe("false");
    expect(container.id).toBe("toast-container");

    const toast = container.children[0]!;
    expect(toast.attrs.get("role")).toBe("status");
  });

  it("renders message as textContent (XSS-safe; no innerHTML)", () => {
    showToast("<script>nope</script>");
    const toast = fakeDoc.body.children[0]!.children[0]!;
    const body = toast.children[0]!;
    expect(body.className).toBe("toast-message");
    expect(body.textContent).toBe("<script>nope</script>");
  });

  it("renders an X close button with aria-label", () => {
    showToast("hi");
    const toast = fakeDoc.body.children[0]!.children[0]!;
    const closeBtn = toast.children.find((c) => c.className === "toast-close");
    expect(closeBtn).toBeTruthy();
    expect(closeBtn!.attrs.get("aria-label")).toBe("Close notification");
    expect((closeBtn as unknown as { textContent: string }).textContent).toBe("×");
  });

  it("error variant stamps dataset.variant=error", () => {
    showToast("boom", { error: true });
    const toast = fakeDoc.body.children[0]!.children[0]!;
    expect(toast.dataset.variant).toBe("error");
  });

  it("action button invokes onClick and removes the toast", () => {
    let clicked = false;
    showToast("save", {
      action: {
        label: "Undo",
        onClick: () => {
          clicked = true;
        },
      },
    });
    const toast = fakeDoc.body.children[0]!.children[0]!;
    const actionBtn = toast.children.find((c) => c.className === "toast-action")!;
    actionBtn.click();
    expect(clicked).toBe(true);
    expect(toast.parent).toBeNull();
  });
});

describe("AC2.2 — auto-dismiss via setTimeout", () => {
  it("removes the toast after the configured lifetimeMs", async () => {
    showToast("tick", { lifetimeMs: 30 });
    expect(fakeDoc.body.children[0]!.children.length).toBe(1);
    await new Promise((r) => setTimeout(r, 60));
    expect(fakeDoc.body.children[0]!.children.length).toBe(0);
  });

  it("dismiss() returned from showToast removes the toast early", async () => {
    const dismiss = showToast("tick", { lifetimeMs: 1_000 });
    expect(fakeDoc.body.children[0]!.children.length).toBe(1);
    dismiss();
    expect(fakeDoc.body.children[0]!.children.length).toBe(0);
  });
});

describe("AC2.4 — manual close button tears down the toast", () => {
  it("clicking the close button removes the toast immediately", () => {
    showToast("wait...", { lifetimeMs: 1_000 });
    const toast = fakeDoc.body.children[0]!.children[0]!;
    expect(toast.parent).not.toBeNull();
    const closeBtn = toast.children.find((c) => c.className === "toast-close")!;
    closeBtn.click();
    expect(toast.parent).toBeNull();
  });
});

describe("AC2.3 — trigger sites wired in app.ts (additive)", () => {
  it("at least 4 showToast() call sites in app.ts", async () => {
    const src = await readSource(APP_TS);
    const calls = src.match(/showToast\(/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(4);
  });
});
