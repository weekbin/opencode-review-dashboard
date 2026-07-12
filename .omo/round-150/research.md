# R150 Research — localize 2 hardcoded English strings in app.ts

Lightweight-round compression (≤15 LOC + ≤3 files + no behavior change): research lives inline in `brief.md`.

The audit grep that surfaced C1:

```bash
grep -nE 'textContent\s*=\s*"`[A-Z][a-z]+|innerHTML\s*=\s*"`[A-Z][a-z]+|innerHTML\s*=\s*"[A-Z][a-z]+' src/ui/app.ts
```

Returns 1 match (`L619` nav hint) plus the template-literal variant at `L5358`.

The R146 audit (which scanned `src/ui/review.html` + `src/ui/app.ts` textContent assignments in innerHTML literals) missed these 2 strings because:
1. `L619` uses `(el|root)\.innerHTML = "..."` pattern with a static English string — R146 audit grep didn't cover this shape
2. `L5358` uses `textContent = \`...\`` template-literal with English + template substitution — R146 audit grep didn't cover template-literal shape

R150's audit grep adds both patterns to its coverage, making it more comprehensive than R146's.

The 3 byte-equivalence tests that broke (T12.K3b, T7.4b, T7.4g) are upgraded to behavior-contract per the R137→R142 SOP. This is the 7th-9th occurrence of this pattern (T11.2d, T16.8d, T16.10a, T10.1c, T14.23.7, T14.25.1, T12.K3b, T7.4b, T7.4g).

R103 invariant preserved: `en !== zh-CN` for both new keys.

Per-SHIP append discipline preserved.