import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import fs from 'node:fs';

/**
 * public/ is copied into dist verbatim by Vite, including files nothing
 * references. Nine of the ten particle photos are never requested by any
 * component, and three entrance textures are working files left beside the
 * ones actually loaded — together about 11 MB of the shipped build.
 *
 * Rather than delete them from the repo (they are someone's originals), this
 * drops them from the build output. The source of truth stays on disk; the
 * deploy does not carry it.
 */
const DEAD_PUBLIC_ASSETS = [
  'particles/machinery_3d_print_1788702731123.jpg',
  'particles/machinery_circuit_1788702761436.jpg',
  'particles/machinery_digital_twin_1788702804038.jpg',
  'particles/machinery_drone_1788702789439.jpg',
  'particles/machinery_gears_1788702774358.jpg',
  'particles/machinery_robot_arm_1788702706353.jpg',
  'particles/machinery_servers_1788702719488.jpg',
  'particles/machinery_warehouse_1788702819282.jpg',
  'particles/machinery_welding_1788702747430.jpg',
  // The whole cartoon-yard texture set. The entrance is now generated
  // geometry (see components/entrance/MkrdEntrance.tsx) and references none
  // of this, so it is dropped from the build rather than deleted from disk.
  'textures/entrance/wall_bricks_2_ORIGINAL.webp',
  'textures/entrance/wall_bricks_2_backup.webp',
  'textures/entrance/wall_bricks_2.webp',
  'textures/entrance/pot_with_duck1.webp',
  'textures/entrance/pot_with_duck.webp',
  'textures/entrance/avatar_window.webp',
  'textures/entrance/belka.webp',
  'textures/entrance/bricks.webp',
  'textures/entrance/bug_sketch.webp',
  'textures/entrance/cat_blink.webp',
  'textures/entrance/cat_front_body.webp',
  'textures/entrance/cat_meow_body.webp',
  'textures/entrance/cat_sketch.webp',
  'textures/entrance/floor_paper.webp',
  'textures/entrance/mouse_hanging.webp',
  'textures/entrance/sign.webp',
  'textures/entrance/speech_bubble.webp',
  'textures/entrance/stone-path.webp',
  'textures/entrance/tree_sketch.webp',
  'textures/entrance/window_bg.webp',
  'textures/entrance/window_sketch.webp',
  'textures/doors/door_back.webp',
  'textures/doors/door_back_left_sketch.webp',
  'textures/doors/door_left_painted.webp',
  'textures/doors/door_left_sketch.webp',
  'textures/doors/door_right_painted.webp',
  'textures/doors/door_right_sketch.webp',
  'textures/doors/frame_sketch.webp',
  'textures/doors/handle_left_painted.webp',
  'textures/doors/handle_left_sketch.webp',
  'textures/doors/handle_right_painted.webp',
  'textures/doors/handle_right_sketch.webp',
  'textures/doors/pien.webp',
  'textures/doors/pien_sketch.webp',
  // The tour-modal backdrop video and its poster. 3.9 MB of footage whose
  // licence nobody could confirm, played at half opacity behind a scrim — the
  // backdrop is now a wireframe globe drawn in SVG (VirtualTourModal.tsx), so
  // this is dead weight and a licence question the build no longer carries.
  'videos/world_back.mp4',
  'videos/world_back-poster.jpg',
  // Never referenced by any component.
  'videos/engineering-bg.mp4',
  'videos/engineering-bg-poster.jpg',
  // Nothing in src/ or index.html references these.
  'images/mkrd-logo.png',        // superseded by the SVG marks in brand/
  'images/ink-splash.webp',
  'textures/paper-texture.webp',
];

function prunePublicAssets(outDir = 'dist'): Plugin {
  return {
    name: 'mkrd:prune-public-assets',
    apply: 'build',
    closeBundle() {
      let freed = 0;
      for (const rel of DEAD_PUBLIC_ASSETS) {
        const file = path.resolve(__dirname, outDir, rel);
        if (fs.existsSync(file)) {
          freed += fs.statSync(file).size;
          fs.rmSync(file);
        }
      }
      // a pruned folder with nothing left in it is just noise in the deploy
      const roots = new Set(DEAD_PUBLIC_ASSETS.map((rel) => path.dirname(rel)));
      for (const dir of roots) {
        const full = path.resolve(__dirname, outDir, dir);
        try {
          if (fs.existsSync(full) && fs.readdirSync(full).length === 0) fs.rmdirSync(full);
        } catch {
          /* a non-empty or busy folder simply stays */
        }
      }
      if (freed > 0) {
        this.info(`pruned ${(freed / 1048576).toFixed(2)} MB of unreferenced public assets`);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), prunePublicAssets()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Keep three/drei out of the app chunk so a code change does not force
      // every visitor to re-download 1.5 MB of vendor code.
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            motion: ['motion', 'gsap', 'lenis'],
            carousel: ['swiper'],
          },
        },
      },
      chunkSizeWarningLimit: 900,
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
