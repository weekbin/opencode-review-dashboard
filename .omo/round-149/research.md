# R149 Research — remove 16 orphan i18n keys from src/ui/i18n.ts

Lightweight-round compression (≤30 LOC + ≤1 file + no behavior change): research lives inline in `brief.md` ## Files involved / ## Hardening included sections.

The audit-then-delete pattern is the v6 standard for dead-code cleanup (no special research needed — the audit script is the research artifact). The script captured:

```python
# scripts/orphan-i18n-audit.py
import re, subprocess
with open('src/ui/i18n.ts') as f: i18n = f.read()
keys = re.findall(r'^\s*"([a-zA-Z0-9_.]+)":\s*\{', i18n, re.M)
out_src = subprocess.check_output(['grep', '-rEn', r't\("([a-zA-Z0-9_.]+)"|data-i18n(?:-title|-placeholder|-aria-label)?="([a-zA-Z0-9_.]+)"|i18nKey:\s*"([a-zA-Z0-9_.]+)"|return\s*\{\s*ok:\s*false,\s*error:\s*"([a-zA-Z0-9_.]+)"', 'src/ui/app.ts', 'src/index.ts', 'src/ui/review.html', '-h']).decode()
used = set()
for m in re.finditer(r't\("([a-zA-Z0-9_.]+)"', out_src): used.add(m.group(1))
for m in re.finditer(r'data-i18n(?:-title|-placeholder|-aria-label)?="([a-zA-Z0-9_.]+)"', out_src): used.add(m.group(1))
for m in re.finditer(r'i18nKey:\s*"([a-zA-Z0-9_.]+)"', out_src): used.add(m.group(1))
for m in re.finditer(r'return\s*\{\s*ok:\s*false,\s*error:\s*"([a-zA-Z0-9_.]+)"', out_src): used.add(m.group(1))
orphans = sorted([k for k in keys if k not in used])
print(f"true production orphans: {len(orphans)}")
for o in orphans: print(f"  {o}")
```

Returns 17 true orphans. Skipping `sidebar.allFiles` (r112 test guards it as feature documentation) leaves 16 keys to delete.

Per-SHIP append discipline preserved.