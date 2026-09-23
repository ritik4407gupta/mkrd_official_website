#!/bin/bash
#
#  Run the MKRD site locally.
#
#  Installs dependencies the first time, builds, serves the production build on
#  http://localhost:4173 and opens it. Ctrl-C stops it.
#
#      bash scripts/local-preview.sh          # production build, port 4173
#      bash scripts/local-preview.sh --dev    # live reload, port 3000
#
#  "Open MKRD Site.terminal" on the Desktop is a double-clickable shortcut to
#  this script. It is a Terminal settings file rather than a shell script
#  because a .command file has to be marked executable before Finder will run
#  it, and a .terminal file does not.
#

set -uo pipefail

PROJECT="$HOME/Downloads/mkrd"
MODE="preview"
PORT=4173
[ "${1:-}" = "--dev" ] && { MODE="dev"; PORT=3000; }

# ── pretty output ───────────────────────────────────────────────────────────
B=$'\033[1m'; DIM=$'\033[2m'; OK=$'\033[32m'; WARN=$'\033[33m'; ERR=$'\033[31m'; R=$'\033[0m'
say()  { printf "%s\n" "$*"; }
step() { printf "${B}▸ %s${R}\n" "$*"; }
ok()   { printf "  ${OK}✓${R} %s\n" "$*"; }
warn() { printf "  ${WARN}!${R} %s\n" "$*"; }
die()  { printf "\n  ${ERR}✗ %s${R}\n\n" "$*"; printf "${DIM}Press any key to close…${R}\n"; read -r -n 1; exit 1; }

clear
printf "${B}MKRD — local preview${R}\n"
printf "${DIM}%s${R}\n\n" "$PROJECT"

# ── checks ──────────────────────────────────────────────────────────────────
[ -d "$PROJECT" ] || die "Project folder not found at $PROJECT"
cd "$PROJECT" || die "Could not enter $PROJECT"
[ -f package.json ] || die "No package.json in $PROJECT — is this the right folder?"

# Node may live in nvm / Homebrew and not be on Finder's PATH, which is the
# usual reason a double-clicked script says "npm: command not found" when the
# same command works in Terminal.
if ! command -v node >/dev/null 2>&1; then
  for candidate in /opt/homebrew/bin /usr/local/bin "$HOME/.nvm/versions/node"/*/bin; do
    [ -x "$candidate/node" ] && PATH="$candidate:$PATH" && break
  done
  export PATH
fi
command -v node >/dev/null 2>&1 || die "Node.js is not installed. Get it from https://nodejs.org (LTS)."

NODE_MAJOR="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
[ "$NODE_MAJOR" -ge 18 ] 2>/dev/null || warn "Node $(node -v) is old; Vite 6 wants 18 or newer."
ok "Node $(node -v)"

# ── dependencies ────────────────────────────────────────────────────────────
if [ ! -d node_modules ]; then
  step "Installing dependencies (first run — a few minutes)"
  npm install || die "npm install failed. Scroll up for the reason."
  ok "Dependencies installed"
elif [ package-lock.json -nt node_modules ]; then
  step "Lockfile changed — updating dependencies"
  npm install || die "npm install failed."
  ok "Dependencies updated"
else
  ok "Dependencies present"
fi

# ── free the port ───────────────────────────────────────────────────────────
if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  warn "Port $PORT was busy — stopping the old server"
  lsof -ti tcp:"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# ── open the browser once the server answers ────────────────────────────────
open_when_ready() {
  for _ in $(seq 1 90); do
    if curl -sf -o /dev/null "http://localhost:$PORT/"; then
      open "http://localhost:$PORT/"
      return
    fi
    sleep 1
  done
  printf "  ${WARN}!${R} Server did not answer on port %s — open it yourself if it starts.\n" "$PORT"
}

# ── run ─────────────────────────────────────────────────────────────────────
# The browser poller starts only once we are about to serve. Starting it any
# earlier means a stale server left on this port gets opened while the new
# build is still running, and you end up looking at the old site.
if [ "$MODE" = "dev" ]; then
  step "Starting the dev server (live reload) on http://localhost:$PORT"
  say "${DIM}  Press Ctrl-C to stop.${R}"
  say ""
  open_when_ready &
  npm run dev
else
  step "Building"
  npm run build || die "Build failed. Scroll up for the first error."
  ok "Build complete"
  say ""
  step "Serving http://localhost:$PORT"
  say "${DIM}  Press Ctrl-C to stop. Run with --dev for live reload while editing.${R}"
  say ""
  open_when_ready &
  npx vite preview --port "$PORT" --host 127.0.0.1
fi

printf "\n${DIM}Server stopped. Press any key to close…${R}\n"
read -r -n 1
