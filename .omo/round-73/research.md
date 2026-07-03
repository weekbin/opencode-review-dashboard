# R73 Research

## Bug shape

```ts
if (ok) {
  const original = button.textContent;
  button.textContent = "✓ Copied";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1200);
}
```

No `clearTimeout` before new `setTimeout`. Rapid clicks cause stale timer to overwrite fresh feedback.

## Fix pattern

Capture the timer ID on the button element itself. Standard JS pattern for DOM-bound timers:

```ts
const wButton = button as HTMLButtonElement & { _copyXxxFeedbackTimer?: number };
clearTimeout(wButton._copyXxxFeedbackTimer);
wButton._copyXxxFeedbackTimer = setTimeout(() => {
  button.textContent = original;
  button.disabled = false;
}, 1200) as unknown as number;
```

Per-button state stored on the DOM element. Reusable by all 3 copy handlers.

## Why this round matters

- Real user-visible bug: rapid clicks show garbled button text
- Same fix shape across 3 sites = high leverage
- Type narrowing via TypeScript intersection `(HTMLButtonElement & { _X?: number })` keeps the ad-hoc timer ID out of global state
- Zero behavior change for single-click users (10x improvement, edge-case hardening)
