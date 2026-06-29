# Environment Setup — team-dev-loop Required Tools

> **Last Updated**: 2026-06-29 (v5.1 — recorded after R10 retro discovered playwright-cli was missing on a fresh machine)
> **Purpose**: First-hand reference for agents running the team-dev-loop. Use this when:
> - Phase -0 Sync reports missing tools
> - Phase 3c Playwright walkthrough fails with "command not found"
> - Phase 0.5 PM Manager `gh issue create` fails with auth/repo errors
> - Any tool-related error mid-round
>
> **How to use**: Find the tool section below. Run the verification command. If missing, run the install command. Record outcome in `## Machine state log` at the bottom.

---

## Quick reference (TL;DR)

```bash
# Run ALL verification commands in sequence. Each outputs PASS/FAIL.
./scripts/verify-loop-env.sh    # if it exists (recommended)
# OR manually:
for tool in git node bun playwright-cli gh python3 chrome; do
  printf "%-15s " "$tool"
  command -v "$tool" >/dev/null 2>&1 && echo "OK" || echo "MISSING"
done
```

**Required tools** (v5 baseline):
1. `git` — version control
2. `node` — runtime (v18+ recommended, v24 tested)
3. `bun` (or `npm` + `node`) — package manager + test runner
4. `playwright-cli` — browser automation for Phase 3c
5. `gh` — GitHub CLI for Phase 0.5 issue-create + Phase 4.9 issue-close
6. `python3` — mock-server for test-review-ui e2e harness
7. `chrome` (or chromium) — browser binary for playwright

---

## Per-tool: verify / find / install

### 1. `git` (version control)

**Verify**:
```bash
git --version    # expect git version 2.x+
```

**Find** (if `command -v git` fails):
- macOS: `/usr/bin/git` (Xcode CLT) or `/opt/homebrew/bin/git`
- Linux: `/usr/bin/git` or `/usr/local/bin/git`

**Install**:
- macOS: `xcode-select --install` (Apple) or `brew install git` (Homebrew)
- Linux (Debian/Ubuntu): `sudo apt update && sudo apt install git`
- Linux (RHEL/Fedora): `sudo dnf install git`

**Common failures**:
- macOS: `git: command not found` → run `xcode-select --install`
- Linux: `Permission denied` → use `sudo`

---

### 2. `node` (JavaScript runtime)

**Verify**:
```bash
node --version    # expect v18.x or v20.x or v22.x or v24.x
```

**Find** (if `command -v node` fails):
- macOS: `/usr/local/bin/node`, `/opt/homebrew/bin/node`, `~/.nvm/versions/node/*/bin/node`
- Linux: `/usr/bin/node`, `/usr/local/bin/node`

**Install**:
- macOS: `brew install node` (Homebrew) or use [nvm](https://github.com/nvm-sh/nvm): `nvm install 22`
- Linux (Debian/Ubuntu): `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash && sudo apt install -y nodejs`
- Linux (RHEL/Fedora): `sudo dnf install nodejs`

**Important**: v5 SKILL.md referenced `node v22.21.1` via nvm. This is a **stale assumption** — R10 retro found a machine with `v24.12.0` and no nvm. The loop works with any Node v18+; the version in SKILL.md is not enforced.

**Common failures**:
- "node: command not found" → install via Homebrew/apt (see above)
- npm uses deprecated Chinese CDN mirrors → see "Network/registry" section below

---

### 3. `bun` (preferred package manager + test runner for this project)

**Verify**:
```bash
bun --version    # expect 1.x
```

**Find** (if `command -v bun` fails):
- macOS: `~/.bun/bin/bun`, `/opt/homebrew/bin/bun`, `~/.nvm/versions/node/*/bin/bun` (if installed via npm)
- Linux: `~/.bun/bin/bun`

**Install**:
- macOS/Linux: `curl -fsSL https://bun.sh/install | bash` (official)
- macOS: `brew install bun`
- Fallback: `npm install -g bun` (works but adds npm dep)

**Fallback if bun unavailable**: project still runs with `npm` + `node` (scripts are in package.json). Replace `bun run X` with `npm run X` or `npx X`.

**Common failures**:
- `bun: command not found` after install → PATH not updated. Add `export PATH="$HOME/.bun/bin:$PATH"` to `~/.zshrc` or `~/.bashrc`.

---

### 4. `playwright-cli` — **CRITICAL for Phase 3c**

**Verify**:
```bash
playwright-cli --version    # expect 0.1.x (e.g., 0.1.14)
# OR fallback:
bunx playwright --version   # if playwright-cli not globally installed
```

**Find** (if `command -v playwright-cli` fails):
- macOS: `~/.nvm/versions/node/*/bin/playwright-cli`, `/opt/homebrew/bin/playwright-cli`
- Linux: `~/.nvm/versions/node/*/bin/playwright-cli`, `/usr/local/bin/playwright-cli`

**Install**:
```bash
# Primary: npm global install
npm install -g @playwright/cli@latest

# Verify
playwright-cli --version   # should print 0.1.x

# Verify browser works
playwright-cli open https://example.com
# Expected output: "### Browser `default` opened with pid NNNN."
# Then KILL:
pkill -9 -f playwright-cli
```

**Fallback if npm install fails** (e.g., Chinese CDN mirrors):
```bash
# Use bunx (downloads on-demand, no global install needed)
bunx playwright --version

# OR install with explicit npm registry
npm install -g @playwright/cli@latest --registry https://registry.npmjs.org/

# OR install to local node_modules
npm install @playwright/cli
# Then run via: ./node_modules/.bin/playwright-cli
```

**Browser dependency**: playwright-cli needs a Chromium-based browser. Most likely candidates:
- `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS, requires GUI session)
- `/usr/bin/google-chrome` or `/usr/bin/chromium-browser` (Linux)
- playwright bundled chromium (auto-downloaded on first `playwright install`)

**Common failures**:
- `playwright-cli: command not found` → see Install section above
- `Browser not found` after `playwright-cli open` → run `npx playwright install chromium`
- Browser launches but hangs → may be running in headless env without display. Use `--headless` flag or run on machine with GUI.

---

### 5. `gh` (GitHub CLI — for issue-create/close in Phase 0.5 + 4.9)

**Verify**:
```bash
gh --version    # expect 2.x (e.g., 2.92.0)
gh auth status   # expect "Logged in to github.com as <user>"
```

**Find** (if `command -v gh` fails):
- macOS: `/opt/homebrew/bin/gh`, `/usr/local/bin/gh`
- Linux: `/usr/bin/gh`, `/usr/local/bin/gh`

**Install**:
- macOS: `brew install gh`
- Linux (Debian/Ubuntu): `curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh`
- Linux (RHEL/Fedora): `sudo dnf install gh`

**Auth setup** (required for `gh issue create`):
```bash
gh auth login    # follow prompts (HTTPS + web auth OR PAT)
# OR set GH_TOKEN env var
export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
```

**Repo remote check** (required for `gh issue create` to work):
```bash
git remote -v    # expect: origin  git@github.com:owner/repo.git (or https://...)
gh repo view     # should succeed
```

**Common failures**:
- `gh: command not found` → install
- `gh issue create` fails with `not logged in` → run `gh auth login`
- `gh issue create` fails with `repository not found` → check `git remote -v` and `gh repo view`
- `gh issue create` fails with `404 Not Found` on issues endpoint → check repo is public OR token has `repo` scope

---

### 6. `python3` (for test-review-ui mock-server)

**Verify**:
```bash
python3 --version    # expect 3.x (3.8+)
```

**Find** (if `command -v python3` fails):
- macOS: `/usr/bin/python3`, `/opt/homebrew/bin/python3`, `/usr/local/bin/python3`
- Linux: `/usr/bin/python3`

**Install**:
- macOS: `brew install python` OR `xcode-select --install` (Apple's Python 3)
- Linux (Debian/Ubuntu): `sudo apt install python3`
- Linux (RHEL/Fedora): `sudo dnf install python3`

**Verify mock-server can start**:
```bash
cd scripts/test-review-ui
python3 mock-server.py --help   # or just: python3 mock-server.py 8080 &
# Then test: curl http://localhost:8080/health
```

**Common failures**:
- `ModuleNotFoundError: No module named 'http.server'` (unlikely on 3.x) → use python3 not python2
- `Address already in use` on port 8080 → kill existing process or use different port

---

### 7. `chrome` / chromium (browser binary)

**Verify**:
```bash
# macOS:
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" 2>&1
# Linux:
ls /usr/bin/google-chrome /usr/bin/chromium-browser 2>&1
# Or check playwright's bundled chromium:
ls ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>&1
```

**Find**:
- macOS: `/Applications/Google Chrome.app/`
- Linux: `/usr/bin/google-chrome`, `/usr/bin/chromium-browser`, `~/.cache/ms-playwright/chromium-*/`
- playwright bundled: `npx playwright install chromium` will download to `~/.cache/ms-playwright/`

**Install**:
- macOS: Download from https://www.google.com/chrome/ OR `brew install --cask google-chrome`
- Linux (Debian/Ubuntu): `wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo dpkg -i google-chrome-stable_current_amd64.deb && sudo apt-get install -f`
- Linux (RHEL/Fedora): `sudo dnf install https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm`
- Playwright bundled: `npx playwright install chromium` (auto-downloads)

**Common failures**:
- `Google Chrome.app not found` (macOS) → install via brew or download
- Headless environment without display → use `playwright-cli open <url> --headless` (if supported) OR run on machine with GUI
- Permission denied on /usr/bin/google-chrome → use sudo or install to ~/.local/

---

## Phase-by-phase dependency map

| Phase | Required tools | Failure mode |
|---|---|---|
| **-0 Sync** | `git`, optional `gh` (for label pre-create) | HARD STOP if git fails |
| **0 PM Triage** | `git` (pre-check `git cat-file -e`) | HARD STOP if git fails |
| **0.25 PM Researcher** | `MiniMax_web_search`, `context7_query-docs`, `webfetch` | subagent uses tools; no env check |
| **0.5 PM Manager** | `gh` (auto-issue-create) | Skip issue-create if gh missing; rest of phase OK |
| **0.75 Planner** | `git` (pre-check `git cat-file -e`) | HARD STOP if missing SHAs |
| **1 Architect** | none (uses plan templates) | OK without env |
| **2 Dev** | `git`, `bun` or `npm`, `python3` (for scripts) | Dev subagent handles its own worktree |
| **2.5 Pre-Commit Audit** | `git`, `grep` | HARD STOP if any SHA missing |
| **3a Tester Review** | none (synthesized artifacts) | OK without env |
| **3b Tester Diff** | `git` | OK |
| **3c Tester Playwright** | **`playwright-cli`**, `chrome` | PARTIAL if missing; document in self-check |
| **3.5 PM Doc Writer** | none (markdown only) | OK |
| **4 Decision** | none | OK |
| **4.5-4.9 lead-owned** | `git`, `gh` (4.9 only) | 4.9 N/A if gh missing |
| **Closure push** | `git`, `gh` (for PR if used) | HARD STOP if push fails |

---

## Recommended Phase -0 Sync tool pre-flight (NEW v5.1)

Add this to `references/sync-spec.md` Phase -0 Sync step 1.5 (between fetch and status):

```bash
# === Tool pre-flight (NEW v5.1) ===
echo "[sync] Tool pre-flight check..."

MISSING_TOOLS=()

for tool in git node bun playwright-cli gh python3; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    MISSING_TOOLS+=("$tool")
    echo "[sync] MISSING: $tool"
  else
    echo "[sync] OK: $tool ($(command -v $tool))"
  fi
done

# Chrome is not in PATH but may be installed
if [ ! -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ] && \
   [ ! -f "/usr/bin/google-chrome" ] && \
   [ ! -f "/usr/bin/chromium-browser" ] && \
   [ -z "$(ls ~/.cache/ms-playwright/chromium-* 2>/dev/null)" ]; then
  MISSING_TOOLS+=("chrome")
  echo "[sync] MISSING: chrome (no system browser AND no playwright-bundled chromium)"
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
  echo "[sync] WARNING: Missing tools: ${MISSING_TOOLS[*]}"
  echo "[sync] See references/environment-setup.md for install instructions"
  echo "[sync] Phase 3c Playwright will be N/A if playwright-cli missing"
  # Do NOT HARD STOP — missing tools degrade gracefully per phase dependency map
fi
```

Output goes to `.omo/round-N/sync-report.md` ## Tool pre-flight section.

---

## Network/registry issues

### npm with deprecated Chinese CDN mirrors (this machine has these)

**Symptom**: `npm install` shows warnings like:
```
npm warn Unknown user config "unsafe-perm". This will stop working in the next major version of npm.
npm warn Unknown user config "python_mirror". This will stop working in the next major version of npm.
...
```

**Effect**: Usually only warnings, but can cause install failures if mirrors are unreachable.

**Fix** (if `npm install` actually fails):
```bash
# Option 1: Explicit registry (one-time)
npm install -g @playwright/cli@latest --registry https://registry.npmjs.org/

# Option 2: Clean up npm config
npm config delete unsafe-perm
npm config delete python_mirror
npm config delete sass_binary_site
npm config delete disturl
# ... etc for each warning

# Option 3: Use bun (no npm config issues)
bun add -g playwright-cli
# OR if local: bun add playwright-cli
```

---

## Machine state log (append after each setup)

### 2026-06-29 — initial R10 retro fix (this machine)

| Tool | Status | Path | Version | Install command |
|---|---|---|---|---|
| git | OK | `/usr/bin/git` | 2.x | pre-installed |
| node | OK | `~/.nvm/versions/node/v24.12.0/bin/node` | v24.12.0 | pre-installed (v22.21.1 in SKILL.md is stale assumption) |
| bun | OK | `~/.nvm/versions/node/v24.12.0/bin/bun` | 1.3.14 | pre-installed via npm global |
| **playwright-cli** | **WAS MISSING → INSTALLED** | `~/.nvm/versions/node/v24.12.0/bin/playwright-cli` | **0.1.14** | `npm install -g @playwright/cli@latest` (worked despite CDN warnings) |
| gh | OK | `/opt/homebrew/bin/gh` | 2.92.0 | pre-installed via Homebrew |
| python3 | OK | `/opt/homebrew/bin/python3` | 3.14.2 | pre-installed via Homebrew |
| chrome | OK | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | GUI app, not in PATH | pre-installed (macOS user install) |

**Install proof**: After `npm install -g @playwright/cli@latest`:
```
added 3 packages in 2s
playwright-cli --version → 0.1.14
playwright-cli open https://example.com → "### Browser `default` opened with pid NNNN."
```

---

## Related references

- `references/sync-spec.md` — Phase -0 Sync protocol (add tool pre-flight step)
- `references/v5-prompts.md` — PM Triage v5 + Planner (depend on `git cat-file -e`)
- `references/pre-commit-audit-spec.md` — Phase 2.5 (depends on `git`, `grep`)
- `.opencode/skills/review-dashboard-ui-test/SKILL.md` — UI test harness (depends on `playwright-cli`)

---

## Maintenance

This file should be updated whenever:
- A new loop dependency is added (e.g., new tool required for a phase)
- A known tool install path changes (e.g., Node version bump)
- A common failure mode is discovered (append to relevant section)
- A new machine is onboarded (append to "Machine state log")

Update owner: lead (sisyphus primary chat) at end of each round if env issues encountered.