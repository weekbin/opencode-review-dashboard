/**
 * R19 #37 — Toast notification helper.
 *
 * R14 #24 removed the intrusive "Draft saved at HH:MM:SS" toast without
 * a replacement. R19 ships the replacement: a brief, top-right toast
 * that:
 *   - exposes `role="status"` + `aria-live="polite"` (read aloud by screen
 *     readers without stealing focus)
 *   - auto-dismisses after 3 seconds via `setTimeout` (mirrors the
 *     existing R14 #24 auto-save indicator's lifecycle at
 *     `src/ui/app.ts:4822`)
 *   - supports a manual close button (X) which sets the toast hidden
 *     via `display: none` (matches AC2.4)
 *
 * Conforms to the add-only rule (R16 SG.14): this is a brand-new
 * helper imported by `src/ui/app.ts` and exercised in `toast.test.ts`
 * with bun's fake timers. Pure DOM and timing helpers live here so
 * unit tests can stub `setTimeout` / `document.body` without dragging
 * the rest of `src/ui/app.ts`.
 */

const TOAST_LIFETIME_MS = 3_000;

let toastContainer: HTMLElement | null = null;

/**
 * Return (and lazily create) the top-right toast viewport container.
 * One container per page; toasts append / detach as needed.
 *
 * Accepts an optional `attachTo` element — used by tests to inject a
 * mock container. In normal browser use, leave it `undefined` and the
 * helper attaches the container to `document.body`.
 */
function ensureContainer(attachTo?: HTMLElement): HTMLElement {
  const target = attachTo ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) throw new Error("ensureContainer: no document.body available");
  if (toastContainer && target.contains(toastContainer)) return toastContainer;
  const doc = target.ownerDocument ?? (typeof document !== "undefined" ? document : null);
  if (!doc) throw new Error("ensureContainer: no document available");
  const el = doc.createElement("div");
  el.id = "toast-container";
  el.className = "toast-container";
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "false");
  target.appendChild(el);
  toastContainer = el;
  return el;
}

/** Dismiss an active toast and clear its auto-dismiss timer. */
function dismissToast(toast: HTMLElement): void {
  const tid = (toast as unknown as { _toastTimerId?: ReturnType<typeof setTimeout> })._toastTimerId;
  if (typeof tid === "number") {
    clearTimeout(tid);
    (toast as unknown as { _toastTimerId?: ReturnType<typeof setTimeout> })._toastTimerId =
      undefined;
  }
  if (toast.parentNode) toast.parentNode.removeChild(toast);
}

/**
 * Show a toast message. Returns a `dismiss()` function the caller can
 * invoke to tear it down early (e.g. on navigation).
 *
 * @param message   Plain text rendered into the toast body. HTML is
 *                  NOT interpreted — this is intentional (XSS-safe by
 *                  construction).
 * @param options   `{ error?: boolean, lifetimeMs?: number, action?:
 *                  { label, onClick }, attachTo?: HTMLElement }` —
 *                  error toasts get a stronger border + the `error`
 *                  class; `lifetimeMs` overrides the default 3s (used
 *                  by tests with short real awaits); `attachTo` lets
 *                  callers override the container (tests use this to
 *                  inject a mock document.body).
 */
export function showToast(
  message: string,
  options: {
    error?: boolean;
    lifetimeMs?: number;
    action?: { label: string; onClick: () => void };
    attachTo?: HTMLElement;
  } = {},
): () => void {
  const container = options.attachTo ? ensureContainer(options.attachTo) : ensureContainer();
  const doc = container.ownerDocument ?? (typeof document !== "undefined" ? document : null);
  if (!doc) throw new Error("showToast: no document available");
  const toast = doc.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  if (options.error) toast.dataset.variant = "error";

  const body = doc.createElement("span");
  body.className = "toast-message";
  body.textContent = message;
  toast.appendChild(body);

  if (options.action) {
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "toast-action";
    btn.textContent = options.action.label;
    btn.addEventListener("click", () => {
      options.action?.onClick();
      dismissToast(toast);
    });
    toast.appendChild(btn);
  }

  const closeBtn = doc.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", "Close notification");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => dismissToast(toast));
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  const lifetime = options.lifetimeMs ?? TOAST_LIFETIME_MS;
  const tid = setTimeout(() => dismissToast(toast), lifetime);
  (toast as unknown as { _toastTimerId?: ReturnType<typeof setTimeout> })._toastTimerId = tid;

  return () => dismissToast(toast);
}

/** Remove every visible toast — used by tests + reload hygiene. */
export function dismissAllToasts(): void {
  if (!toastContainer) return;
  while (toastContainer.firstChild) {
    const node = toastContainer.firstChild;
    if (node instanceof HTMLElement) {
      const tid = (node as unknown as { _toastTimerId?: ReturnType<typeof setTimeout> })
        ._toastTimerId;
      if (typeof tid === "number") clearTimeout(tid);
    }
    toastContainer.removeChild(node);
  }
}

export const TOAST_DEFAULTS = {
  lifetimeMs: TOAST_LIFETIME_MS,
} as const;
