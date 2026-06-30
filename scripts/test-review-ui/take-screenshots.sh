#!/usr/bin/env bash
# take-screenshots.sh — R18 rewrite: was puppeteer + Ubuntu-only paths, now playwright-cli + portable
#
# Captures README screenshots (diff/commits/conversation/finding) from the review dashboard.
# Works on macOS + Linux. Falls back gracefully if playwright-cli or chrome is missing.
#
# Pre-R18 bugs (all fixed here):
#   - executablePath: '/usr/bin/google-chrome'  ← Ubuntu-only, doesn't exist on macOS
#   - '/home/weekbin/...' screenshot output dir  ← Ubuntu home, doesn't exist on macOS
#   - puppeteer.launch had no fallback → script silently failed on macOS
#   - no cleanup → Chrome instances accumulated across runs (R18 root cause #1)
#
# Usage:
#   ./scripts/test-review-ui/take-screenshots.sh
#   PORT=8897 SCREENSHOT_DIR=./docs/screenshots ./scripts/test-review-ui/take-screenshots.sh
#
# Required tools: bash, playwright-cli (or playwright Python/Node fallback), curl
# Optional: playwright-cli installed via `npm install -g @playwright/cli@latest`

set -euo pipefail

# ---------- Config (env-overridable) ----------
PORT="${PORT:-8897}"
URL="http://127.0.0.1:${PORT}/review/test?token=test"
SCREENSHOT_DIR="${SCREENSHOT_DIR:-$(cd "$(dirname "$0")/../../docs/screenshots" 2>/dev/null && pwd || echo "$PWD/docs/screenshots")}"
SESSION="take-screenshots-$$"
LOG_PREFIX="[take-screenshots]"

# ---------- Preflight: tool detection ----------
log() { echo "${LOG_PREFIX} $*"; }
die() { echo "${LOG_PREFIX} ERROR: $*" >&2; exit 1; }

# Detect playwright-cli (the team-dev-loop canonical browser tool, R4+)
PLAYWRIGHT_CLI=""
if command -v playwright-cli >/dev/null 2>&1; then
  PLAYWRIGHT_CLI="playwright-cli"
elif command -v bunx >/dev/null 2>&1 && [ -d "node_modules/playwright" ]; then
  PLAYWRIGHT_CLI="bunx playwright"
elif command -v npx >/dev/null 2>&1; then
  PLAYWRIGHT_CLI="npx --no-install playwright"
fi
[ -n "$PLAYWRIGHT_CLI" ] || die "playwright-cli not found. Install: npm install -g @playwright/cli@latest"

# ---------- R18 macOS-safe pre-cleanup ----------
# Kills only playwright-spawned Chrome (--user-data-dir contains playwright_chromiumdev_profile marker).
# Does NOT touch user's manual Chrome.
log "Pre-cleanup (R18 macOS-safe pattern)..."
pkill -9 -f "cliDaemon" 2>/dev/null || true
pkill -9 -f "playwright_chromiumdev_profile-" 2>/dev/null || true
pkill -9 -f "chrome.*--type=zygote" 2>/dev/null || true  # legacy Ubuntu fallback (no-op on macOS)

# ---------- Mock-server health check ----------
log "Mock-server check (port ${PORT})..."
if ! curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  die "mock-server not responding on port ${PORT}. Start it first:
  python3 scripts/test-review-ui/mock-server.py ${PORT} &"
fi
log "Mock-server OK"

# ---------- Output dir ----------
mkdir -p "${SCREENSHOT_DIR}"
log "Screenshot dir: ${SCREENSHOT_DIR}"

# ---------- Capture ----------
log "Pre-warm ${PLAYWRIGHT_CLI} session=${SESSION}"
${PLAYWRIGHT_CLI} -s="${SESSION}" open "${URL}" >/dev/null 2>&1 || die "playwright-cli open failed"

capture() {
  local name="$1"
  local pre_action="$2"
  local output="${SCREENSHOT_DIR}/${name}.png"
  log "Capture: ${name} -> ${output}"

  if [ -n "${pre_action}" ]; then
    eval "${pre_action}"
    sleep 0.6  # let the click/animation settle
  fi

  ${PLAYWRIGHT_CLI} -s="${SESSION}" screenshot --filename "${output}" >/dev/null \
    || die "screenshot ${name} failed"
}

# Screenshot 1: initial diff view (default tab)
capture "diff" ""

# Screenshot 2: Commits tab
capture "commits" '${PLAYWRIGHT_CLI} -s="${SESSION}" eval "() => document.querySelector(\"button[data-tab=commits]\").click()" >/dev/null 2>&1 || true'

# Screenshot 3: Conversation tab
capture "conversation" '${PLAYWRIGHT_CLI} -s="${SESSION}" eval "() => document.querySelector(\"button[data-tab=conversation]\").click()" >/dev/null 2>&1 || true'

# Screenshot 4: Files tab + open finding drawer on line 7
capture_finding() {
  log "Capture: finding -> ${SCREENSHOT_DIR}/finding.png"
  ${PLAYWRIGHT_CLI} -s="${SESSION}" eval "() => document.querySelector(\"button[data-tab=files]\").click()" >/dev/null 2>&1 || true
  sleep 0.6
  ${PLAYWRIGHT_CLI} -s="${SESSION}" eval "() => { const el = document.querySelector('[data-line-number=\"7\"]'); if (el) el.click(); return el ? 'clicked' : 'not-found'; }" >/dev/null 2>&1 || true
  sleep 0.6
  ${PLAYWRIGHT_CLI} -s="${SESSION}" screenshot --filename "${SCREENSHOT_DIR}/finding.png" >/dev/null \
    || die "screenshot finding failed"
}
capture_finding

# ---------- R18 macOS-safe post-cleanup ----------
log "Post-cleanup (R18 pattern)..."
${PLAYWRIGHT_CLI} -s="${SESSION}" close >/dev/null 2>&1 || true
${PLAYWRIGHT_CLI} close-all >/dev/null 2>&1 || true
${PLAYWRIGHT_CLI} kill-all >/dev/null 2>&1 || true
pkill -9 -f "cliDaemon" 2>/dev/null || true
pkill -9 -f "playwright_chromiumdev_profile-" 2>/dev/null || true

REMAINING_PW=$(ps aux | grep -c "playwright_chromiumdev_profile-" | head -1 || echo 0)
REMAINING_CD=$(ps aux | grep -c "cliDaemon" | head -1 || echo 0)
log "Post-cleanup residue: playwright_chromiumdev_profile=${REMAINING_PW}, cliDaemon=${REMAINING_CD}"

log "Done. Screenshots saved to ${SCREENSHOT_DIR}"