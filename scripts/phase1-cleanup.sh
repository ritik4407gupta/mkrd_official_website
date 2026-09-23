#!/usr/bin/env bash
#
# MKRD site — Phase 1 asset cleanup
#
# Removes assets that ship in the production build but that no code ever
# references. Nothing is deleted outright: everything is moved into
# _unused_assets_backup/ so you can put it back with a single mv.
#
# Run from the project root:   bash scripts/phase1-cleanup.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKUP="_unused_assets_backup"
mkdir -p "$BACKUP/particles" "$BACKUP/textures/entrance"

# --- 1. public/particles/ ------------------------------------------------
# Ten 800-1000 KB JPEGs ship here. Exactly one is referenced in the source
# (machinery_cnc, by InfrastructureView.tsx) — and that one is ALSO imported
# through src/assets, so Vite emits a second hashed copy of it into the
# bundle. The other nine are requested by nothing.
UNUSED_PARTICLES=(
  machinery_3d_print_1788702731123.jpg
  machinery_circuit_1788702761436.jpg
  machinery_digital_twin_1788702804038.jpg
  machinery_drone_1788702789439.jpg
  machinery_gears_1788702774358.jpg
  machinery_robot_arm_1788702706353.jpg
  machinery_servers_1788702719488.jpg
  machinery_warehouse_1788702819282.jpg
  machinery_welding_1788702747430.jpg
)

# --- 2. public/textures/entrance/ ---------------------------------------
# Working files left behind next to the ones actually loaded by
# EntranceDoors.tsx. The ORIGINAL brick wall alone is 2.2 MB.
UNUSED_TEXTURES=(
  wall_bricks_2_ORIGINAL.webp
  wall_bricks_2_backup.webp
  pot_with_duck1.webp
)

freed=0

move() { # $1 = relative path, $2 = backup subdir
  if [ -f "$1" ]; then
    size=$(wc -c < "$1")
    freed=$((freed + size))
    mv "$1" "$2/"
    printf '  moved  %-58s %6.2f MB\n' "$1" "$(echo "$size" | awk '{print $1/1048576}')"
  else
    printf '  skip   %-58s (not found)\n' "$1"
  fi
}

echo "Moving unused public/particles/ images…"
for f in "${UNUSED_PARTICLES[@]}"; do move "public/particles/$f" "$BACKUP/particles"; done

echo
echo "Moving leftover entrance texture working files…"
for f in "${UNUSED_TEXTURES[@]}"; do move "public/textures/entrance/$f" "$BACKUP/textures/entrance"; done

echo
printf 'Freed from the build: %.2f MB  (now in %s/)\n' "$(echo "$freed" | awk '{print $1/1048576}')" "$BACKUP"
echo
echo "Next:"
echo "  1. rm -rf dist && npm run build     # rebuild without the dead assets"
echo "  2. echo '_unused_assets_backup/' >> .gitignore"
echo "  3. Once you're happy, delete $BACKUP/ for good."
echo
echo "Still outstanding — the two videos are 74 MB of the remaining build:"
echo "  public/videos/world_back.mp4       70.8 MB   (360 tour modal)"
echo "  public/videos/engineering-bg.mp4    3.3 MB   (preloader background)"
echo "Neither is streamable. Send me the source masters and I'll re-encode them."
