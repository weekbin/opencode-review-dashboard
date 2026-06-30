/**
 * R19 #38 — A11y modal helper.
 *
 * Additive (R16 SG.14): installed alongside the existing modal
 * builders (`showReopenReasonModal`, `showResolveReasonModal`,
 * `showMarkAsWontfixModal`, `showExportModal`) without modifying their
 * bodies. Adds:
 *   - `role="dialog"` + `aria-modal="true"` (defensive — most callers
 *      already set these via setAttribute)
 *   - Escape key closes the dialog (matches `showHelpModal`'s pattern)
 *   - Initial focus moves into the dialog (first focusable child)
 *   - Focus trap: Tab/Shift+Tab cycles inside the dialog only
 *   - Restores focus to the previously-active element on close
 *
 * Browser-only side effects (no DOM at import time); safe to import
 * from `src/ui/app.ts` once the page has loaded.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter((node) => {
    if (node.hasAttribute("hidden")) return false;
    if (node.getAttribute("aria-hidden") === "true") return false;
    const style = node instanceof HTMLElement ? getComputedStyle(node) : null;
    if (style && (style.display === "none" || style.visibility === "hidden")) return false;
    return true;
  });
}

/**
 * Install accessibility wiring on a modal `dialog` element.
 *
 * @param dialog       The inner dialog container (already has `role="dialog"`
 *                     + `aria-modal="true"` in most call sites — re-asserted
 *                     defensively here).
 * @param onClose      Called when the user presses Escape. The caller decides
 *                     how to tear down the dialog (the helper does NOT
 *                     remove any DOM — it only manages focus + keys).
 *
 * Returns a `dispose` function that detaches all key listeners and restores
 * focus to the previously-active element. Call it from your tear-down
 * path so we don't leak global window listeners.
 */
export function installModalA11y(dialog: HTMLElement, onClose: () => void): () => void {
  if (!dialog.hasAttribute("role")) dialog.setAttribute("role", "dialog");
  if (!dialog.hasAttribute("aria-modal")) dialog.setAttribute("aria-modal", "true");

  const previouslyFocused = document.activeElement as HTMLElement | null;

  const focusable = getFocusable(dialog);
  const target = focusable[0] ?? dialog;
  requestAnimationFrame(() => {
    if (document.body.contains(dialog)) target.focus();
  });

  function onKey(e: KeyboardEvent): void {
    if (!document.body.contains(dialog)) {
      window.removeEventListener("keydown", onKey, true);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = getFocusable(dialog);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !dialog.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  window.addEventListener("keydown", onKey, true);

  return () => {
    window.removeEventListener("keydown", onKey, true);
    if (previouslyFocused && document.body.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
  };
}
