#!/usr/bin/env bash
#
#  Run the MKRD site locally.
#
#      chmod +x scripts/run-local.sh     # once
#      ./scripts/run-local.sh            # production build, http://localhost:4173
#      ./scripts/run-local.sh --dev      # live reload,     http://localhost:3000
#      ./scripts/run-local.sh --doctor   # check the toolchain and stop
#
#  Why this does not just call `npm run build`
#  -------------------------------------------
#  npm scripts run the shims in node_modules/.bin, which are files starting
#  with `#!/usr/bin/env node`. Running one means the kernel exec()s it. Under
#  ~/Downloads on macOS that exec can come back EPERM:
#
#      sh: .../node_modules/.bin/vite: /usr/bin/env: bad interpreter:
#          Operation not permitted
#
#  The file is readable and npm wrote it seconds earlier — it is the exec that
#  is refused, usually because the tree carries com.apple.quarantine or the
#  exec bits did not survive however it got onto disk.
#
#  So this script hands the real entry point to node as an argument instead:
#
#      node node_modules/vite/bin/vite.js build
#
#  node then *reads* the file. Nothing is exec()d but node itself, which is on
#  PATH and allowed, and the whole class of problem goes away. If the build
#  still fails that way, the script prints the two commands that fix the cause
#  rather than leaving you to guess.
#

set -uo pipefail

# the project is the parent of scripts/, so this works wherever it is called from
PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MODE="preview"
PORT=4173
case "${1:-}" in
  --dev)    MODE="dev";    PORT=3000 ;;
  --doctor) MODE="doctor" ;;
  "")       ;;
  *) printf 'Unknown option: %s\nUse --dev, --doctor, or no argument.\n' "$1" >&2; exit 2 ;;
esac

B=$'\033[1m'; DIM=$'\033[2m'; GRN=$'\033[32m'; YEL=$'\033[33m'; RED=$'\033[31m'; R=$'\033[0m'
step() { printf '\n%s▸ %s%s\n' "$B" "$*" "$R"; }
ok()   { printf '  %s✓%s %s\n' "$GRN" "$R" "$*"; }
warn() { printf '  %s!%s %s\n' "$YEL" "$R" "$*"; }
err()  { printf '\n  %s✗ %s%s\n\n' "$RED" "$*" "$R"; }
die()  { err "$*"; exit 1; }

cd "$PROJECT" || die "Could not enter $PROJECT"
[ -f package.json ] || die "No package.json in $PROJECT"

printf '%sMKRD — local%s\n%s%s%s\n' "$B" "$R" "$DIM" "$PROJECT" "$R"

# ── node ────────────────────────────────────────────────────────────────────
# Finder-launched shells get a minimal PATH, so look where node usually lives.
if ! command -v node >/dev/null 2>&1; then
  for d in /opt/homebrew/bin /usr/local/bin "$HOME/.nvm/versions/node"/*/bin; do
    if [ -x "$d/node" ]; then PATH="$d:$PATH"; export PATH; break; fi
  done
fi
command -v node >/dev/null 2>&1 || die "Node.js not found. Install the LTS build from https://nodejs.org"
NODE_MAJOR="$(node -v 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/')"
ok "node $(node -v)  ($(command -v node))"
if ! [ "${NODE_MAJOR:-0}" -ge 18 ] 2>/dev/null; then
  warn "Vite 6 wants Node 18 or newer."
fi

# ── dependencies ────────────────────────────────────────────────────────────
# Only auto-install when node_modules is absent. A lockfile-driven reinstall can
# silently add and remove hundreds of packages, which is not something a script
# should do to your tree behind your back — so that case is a warning.
if [ ! -d node_modules ]; then
  step "Installing dependencies (first run)"
  npm install || die "npm install failed — scroll up for the reason."
  ok "installed"
elif [ package-lock.json -nt node_modules ]; then
  warn "package-lock.json is newer than node_modules — run 'npm install' if the build misbehaves."
else
  ok "dependencies present"
fi

# ── resolve real entry points, bypassing the .bin shims ─────────────────────
VITE_JS="node_modules/vite/bin/vite.js"
TSC_JS="node_modules/typescript/bin/tsc"
[ -f "$VITE_JS" ] || VITE_JS=""
[ -f "$TSC_JS" ]  || TSC_JS=""

# Run a tool through node, so nothing but node itself is ever exec()d.
#
# There is deliberately no "fall back to npm run ..." branch: that path runs
# the .bin shim, which is the exact thing that fails here, so falling back to
# it would only turn a clear error into a confusing one.
run_tool() {
  local entry="$1"; shift
  [ -n "$entry" ] || die "Tool entry point missing from node_modules — try 'npm install'."
  node "$entry" "$@"
}

explain_eperm() {
  cat <<EOF

  ${YEL}That looks like macOS refusing to execute files in this folder.${R}

  Two things fix it. Try them in order:

    ${B}xattr -dr com.apple.quarantine "$PROJECT"${R}
        clears the quarantine flag from the tree

    ${B}chmod +x "$PROJECT"/node_modules/.bin/*${R}
        restores the exec bits on the tool shims

  Neither is needed for this script — it runs the tools through node — but
  plain 'npm run build' will keep failing until one of them is done.

EOF
}

# ── doctor ──────────────────────────────────────────────────────────────────
if [ "$MODE" = "doctor" ]; then
  step "Toolchain"
  printf '  vite      %s\n' "$( [ -n "$VITE_JS" ] && node "$VITE_JS" --version 2>&1 | head -1 || echo 'entry point MISSING' )"
  printf '  tsc       %s\n' "$( [ -n "$TSC_JS" ] && node "$TSC_JS" --version 2>&1 | head -1 || echo 'entry point MISSING' )"
  step "Can the .bin shims be executed?"
  if [ -e node_modules/.bin/vite ] && ./node_modules/.bin/vite --version >/dev/null 2>&1; then
    ok "yes — 'npm run build' will work too"
  else
    warn "no — this is the EPERM case; this script works around it"
    explain_eperm
  fi
  exit 0
fi

# ── free the port ───────────────────────────────────────────────────────────
if command -v lsof >/dev/null 2>&1 && lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  warn "port $PORT busy — stopping the old server"
  lsof -ti tcp:"$PORT" | xargs kill -9 2>/dev/null
  sleep 1
fi

# ── open the browser once the server actually answers ───────────────────────
open_when_ready() {
  local url="http://localhost:$PORT/"
  for _ in $(seq 1 90); do
    if curl -sf -o /dev/null "$url"; then
      command -v open >/dev/null 2>&1 && open "$url" || printf '  open %s\n' "$url"
      return
    fi
    sleep 1
  done
  warn "server never answered on port $PORT"
}

# ── run ─────────────────────────────────────────────────────────────────────
if [ "$MODE" = "dev" ]; then
  step "Dev server (live reload) — http://localhost:$PORT"
  printf '%s  Ctrl-C to stop.%s\n' "$DIM" "$R"
  open_when_ready &
  run_tool "$VITE_JS" --port "$PORT" --host 127.0.0.1
else
  step "Building"
  # `mktemp -t prefix` is BSD-only — GNU mktemp wants XXXXXX in the template and
  # fails without it, which silently left the log path empty on Linux.
  BUILD_LOG="$(mktemp "${TMPDIR:-/tmp}/mkrd-build.XXXXXX")" || BUILD_LOG="/tmp/mkrd-build.$$"
  run_tool "$VITE_JS" build 2>&1 | tee "$BUILD_LOG"
  BUILD_STATUS="${PIPESTATUS[0]}"

  if grep -qE 'bad interpreter|Operation not permitted|Permission denied' "$BUILD_LOG" 2>/dev/null; then
    rm -f "$BUILD_LOG"
    err "Build failed."
    explain_eperm
    exit 1
  fi
  if [ "$BUILD_STATUS" -ne 0 ]; then
    rm -f "$BUILD_LOG"
    die "Build failed — scroll up for the first error."
  fi
  rm -f "$BUILD_LOG"
  ok "build complete"

  step "Serving http://localhost:$PORT"
  printf '%s  Ctrl-C to stop.  Use --dev for live reload while editing.%s\n' "$DIM" "$R"
  open_when_ready &
  run_tool "$VITE_JS" preview --port "$PORT" --host 127.0.0.1
fi
