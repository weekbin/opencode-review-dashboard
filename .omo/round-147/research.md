# R147 Research — close fallbackCopy deprecation flag: rename + docstring + migration TODO

Lightweight-round compression (≤50 LOC + ≤2 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The audit grep that surfaced C1:

```bash
grep -nE 'document\.execCommand|"copy"' src/ui/app.ts
```

Returns exactly 1 match at L676. The full function is at L668-682, called from 4 sites (L393/L396, L459/L462, L1767/L1770, L1799/L1802).

Browser deprecation status (verified):
- `document.execCommand("copy")` is **deprecated** but still works in all major browsers as of 2026.
- The official replacement is the async Clipboard API (`navigator.clipboard.writeText`) — already in use as the primary path (4 caller sites check `navigator.clipboard?.writeText` first).
- No browser vendor has announced removal plans yet, but MDN documents it as deprecated.
- The `ClipboardItem` API is the future replacement but has wider browser support gaps and doesn't work in jsdom.

The deprecation is real but the migration is a behavior change with test environment implications. R147 ships the minimal-scope housekeeping: rename + docstring + migration TODO. Future refactor rounds can tackle the actual API replacement when there's a clearer reason.