# R77 Retro

## What worked
- Same fix pattern as R57-R72 (innerHTML template → t() with escapeHtml)
- Side fix to T36.2c caught a latent test fragility (literal-English assertion coupling)
- 4/4 tests RED → GREEN in 1 cycle

## What didn't
- First test file attempt had unused old-block field — corrected
- i18n keys added via Python script but tested regex against `export\.modal\.body` matched all 3 key variants correctly