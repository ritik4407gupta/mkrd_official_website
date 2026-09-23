#!/usr/bin/env bash
#
# MKRD site — retire the files the rebuild left behind.
#
# These 23 modules are unreachable from src/main.tsx: nothing imports them,
# directly or transitively, so they are already absent from every build. They
# are the old entrance (cartoon-yard doors and their HUD), the two toy
# simulation canvases the workstation replaced, the previous text/scroll
# animation primitives, and a handful of sections that were orphaned before
# this rebuild started.
#
# Nothing is deleted. Everything is moved into _retired/ preserving its path,
# so a single mv puts any of it back, and git still has the whole history.
#
# Deliberately NOT touched:
#   src/vite-env.d.ts          — ambient type declarations; never imported,
#                                always required. Removing it breaks the build.
#   public/videos/*            — still referenced; the tour video's provenance
#                                is a separate question.
#
# tsconfig.json already excludes _retired/, so `npm run lint` will not try to
# typecheck the moved files (their relative imports no longer resolve).
#
# Run from the project root:
#     bash scripts/cleanup-dead-files.sh
# Then confirm nothing broke:
#     npm run lint && npm run build
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RETIRED="_retired"

# --- 23 unreachable modules ------------------------------------------------
DEAD_MODULES=(
  # the previous entrance sequence, replaced by components/entrance/MkrdEntrance.tsx
  src/components/NewOpeningIntro.tsx
  src/components/EntranceDoors.tsx
  src/components/Preloader.tsx
  src/components/TransitionTextSequence.tsx
  src/components/entrance3d/EntranceOverlayHUD.tsx
  src/components/entrance3d/InteractiveStationProps.ts
  src/components/entrance3d/Printer3D.tsx
  src/components/entrance3d/RoboticMachine3D.tsx
  src/components/entrance3d/ServerRack3D.tsx
  src/components/entrance3d/WorkstationPC3D.tsx
  src/components/shaders/RevealMaterial.ts

  # the toy 3D "software" scenes, replaced by the workstation
  src/components/GSTSimulationCanvas.tsx
  src/components/WarehouseSimulationCanvas.tsx

  # superseded animation primitives, replaced by src/motion/*
  src/components/SplitTextReveal.tsx
  src/components/ParallaxSection.tsx

  # the WebGL navbar logo, replaced by the inline SVG mark in MkrdLogo.tsx
  src/components/MkrdLogo3D.tsx

  # orphaned before this rebuild — never reachable from any route
  src/components/BackgroundVideo.tsx          # also hard-codes a third-party YouTube id
  src/components/CaseStudiesSection.tsx
  src/components/ContactSection.tsx
  src/components/InfrastructureSection.tsx
  src/components/InfiniteMarquee.tsx
  src/components/InteractivePixelGrid.tsx
  src/components/ScrollCinemaSection.tsx
  src/components/ServicesHorizontal.tsx

  # superseded by the rebuilt simulation lab
  src/components/ThreeDPrinterCanvas.tsx       # replaced by sim/AdditiveLab.tsx
  src/components/ThreeDRobotActuator.tsx       # a six-axis robot this company does not own

  # the client roster, removed at the client's request
  src/components/PartnerLogosMarquee.tsx
)

# --- parked, NOT dead ------------------------------------------------------
# src/components/sim/MouldLab.tsx, mouldTool.ts and meltMaterial.ts are a
# complete, working two-plate mould cycle: clamp, fill, pack, cool, open, eject,
# sectionable, with the fill-time plot. It is not referenced by any route,
# because tool design belongs to the parent company and this site mentions that
# work rather than showcasing it — so it costs nothing in the build.
#
# It is deliberately left in place. Putting it back is one lazy import in
# SimulationsView.tsx, if it is ever wanted on the parent company's own site.

# --- the JPEG originals, superseded by the .webp the build now imports ------
DEAD_IMAGES=(
  src/assets/images/3d_printer_farm_bg.jpg
  src/assets/images/hero_robotic_precision_1787995484245.jpg
  src/assets/images/industrial_cnc_background.jpg
  src/assets/images/machinery_3d_print_1788702731123.jpg
  src/assets/images/machinery_cnc_1788702694039.jpg
  src/assets/images/machinery_gears_1788702774358.jpg
  src/assets/images/machinery_robot_arm_1788702706353.jpg
  src/assets/images/machinery_welding_1788702747430.jpg
  src/assets/images/mould_die_engineering_1787995513683.jpg
  src/assets/images/printer_additive_fab_1787995499367.jpg
  src/assets/images/software_microservices_tech_1787995547133.jpg
  src/assets/images/virtual_tour_scanning_1787995529203.jpg
)

freed=0
moved=0

retire() {
  local f="$1"
  if [ ! -f "$f" ]; then
    printf '  skip    %-58s (already gone)\n' "$f"
    return
  fi
  local size
  size=$(wc -c < "$f")
  mkdir -p "$RETIRED/$(dirname "$f")"
  mv "$f" "$RETIRED/$f"
  freed=$((freed + size))
  moved=$((moved + 1))
  printf '  retired %-58s %7.1f KB\n' "$f" "$(echo "$size" | awk '{print $1/1024}')"
}

echo "Retiring unreachable modules…"
for f in "${DEAD_MODULES[@]}"; do retire "$f"; done

echo
echo "Retiring superseded JPEG originals…"
for f in "${DEAD_IMAGES[@]}"; do retire "$f"; done

# drop the entrance3d/ and shaders/ folders if they are now empty
for d in src/components/entrance3d src/components/shaders; do
  if [ -d "$d" ] && [ -z "$(ls -A "$d")" ]; then
    rmdir "$d"
    echo "  removed empty folder $d"
  fi
done

echo
printf 'Moved %d files (%.2f MB) into %s/\n' "$moved" "$(echo "$freed" | awk '{print $1/1048576}')" "$RETIRED"
echo
echo "Verify:"
echo "  npm run lint && npm run build"
echo
echo "If the build is green:"
echo "  echo '_retired/' >> .gitignore     # keep it out of commits"
echo "  rm -rf $RETIRED                    # or delete it for good"
echo
echo "To undo everything:"
echo "  (cd $RETIRED && find . -type f -exec sh -c 'mkdir -p \"../\$(dirname {})\"; mv \"{}\" \"../{}\"' \\;)"
