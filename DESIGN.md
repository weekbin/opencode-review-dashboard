# opencode-review-dashboard Design System

## 1. Atmosphere & Identity

A compact developer workstation: dense enough for long diffs, calm enough for sustained review, and explicit about state. The signature is **review-state clarity**—small, persistent signals use restrained color, plain language, and stable placement so reviewers always know what can still change.

## 2. Color

The UI uses `light-dark()` to keep one semantic token valid in both themes.

| Role | Token | Light | Dark | Usage |
|---|---|---|---|---|
| Page surface | existing body background | `#f5f5f5` | `#0a0a0a` | Application canvas |
| Panel surface | existing header/sidebar background | `#fafafa` | `#1f1f1f` / `#252525` | Sticky chrome and panels |
| Text primary | existing body color | `#1a1a1a` | `#e8e8e8` | Main copy |
| Text secondary | existing muted color | `#666666` | `#888888` | Metadata and hints |
| Border default | existing panel border | `#e0e0e0` | `#3a3a3a` | Structural separation |
| Accent | `--pierre-accent` fallback | `#2563eb` | `#2563eb` | Focus and primary interaction |
| Success surface | `--status-success-surface` | `rgba(26,127,55,.08)` | `rgba(63,185,80,.12)` | Completed/locked status |
| Success border | `--status-success-border` | `rgba(26,127,55,.28)` | `rgba(63,185,80,.35)` | Completed/locked outline |
| Success text | `--status-success-text` | `#1a7f37` | `#3fb950` | Completed/locked copy and icon |

Rules:
- Color communicates interaction or review state, never decoration.
- New status colors require semantic tokens in `:root` and documentation here first.
- Light and dark values ship together; neither theme is a fallback.

## 3. Typography

| Level | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Page title | 16px | 600 | 1.4 | Header identity |
| Section title | 16px | 600 | 1.4 | Pane headings and status title |
| Body | 15px | 400 | 1.55 | Default interface copy |
| Body small | 14px | 400–500 | 1.5 | Tables, controls, supporting text |
| Caption | 12px | 500–600 | 1.4 | Badges, save state, metadata |

- Primary: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif`.
- Mono: `ui-monospace, "SF Mono", Monaco, "Cascadia Mono", "Roboto Mono", Consolas, monospace`.
- Numeric analytics use tabular or monospace treatment when alignment matters.

## 4. Spacing & Layout

Base unit: **4px**.

| Token concept | Value | Usage |
|---|---:|---|
| Tight | 4px | Compact inline controls |
| Compact | 8px | Icon-to-copy gap, badge padding |
| Default | 12px | Form and status inner spacing |
| Standard | 16px | Pane and card spacing |
| Comfortable | 20px | Header horizontal padding |
| Section | 32px | Major pane padding |

- Sticky application header: 50px; navigation row: 41px.
- Sidebar width is user-resizable from a 400px default.
- Main panes remain fluid; status content must wrap without horizontal overflow at 375px.
- Use spacing values divisible by 4px unless an existing optical adjustment is being preserved.

## 5. Components

### Status banner
- **Structure**: semantic `<section role="status" aria-live="polite">`, decorative inline SVG, title, detail.
- **Variants**: success/completed is the current variant.
- **Spacing**: 12px vertical, 16px horizontal, 8px internal gap.
- **States**: persistent and non-interactive; text updates when language changes through pane re-rendering.
- **Accessibility**: SVG is `aria-hidden`; visible copy names the state and round; color is not the only signal.
- **Motion**: none—persistent state must not compete with the diff.

### Compact control
- **Structure**: native button with inline label/icon.
- **States**: default, hover, active/pressed, focus-visible, disabled.
- **Accessibility**: native semantics; visible focus ring; `aria-pressed` for toggles.

### Modal / overlay
- **Structure**: overlay, card, heading, body, action row.
- **States**: open/closed, focus trapped, Escape dismissal except irreversible post-submit completion.
- **Accessibility**: initial focus, labelled heading, keyboard-contained interaction.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | 100–150ms | ease-out | Hover, focus, compact toggles |
| Standard | 200–300ms | ease-in-out | Panels, modals, opacity transitions |
| Confirmation | 600ms max | ease-out | Existing save pulse only |

- Animate only `transform` and `opacity`; avoid layout-property animation.
- Every interactive element retains hover, active, focus-visible, and disabled feedback.
- Respect `prefers-reduced-motion` for non-essential motion.
- Persistent state indicators do not animate on routine pane switches.

## 7. Depth & Surface

Strategy: **mixed, border-led**.

- Persistent layout uses tonal surfaces plus 1px borders.
- Shadows are reserved for temporary elevation such as popovers and modals.
- Status banners use a semantic tinted surface and border, not a generic card shadow.
- Border radius derives from `--radius: 8px`; compact inner controls may use 3–6px to preserve hierarchy.
