import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronsRight } from 'lucide-react';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * The MKRD entrance.
 *
 * The old opener was a hand-drawn cartoon yard — a cat, a duck in a plant pot,
 * a squirrel — assembled from sprite sheets whose origin we could not account
 * for, and about 2 MB of textures. This replaces it with something that is
 * MKRD's own in every sense: it is the logo, at scale, as a real mould.
 *
 * The mark is a two-plate die block split by a parting line. So the door IS the
 * mark: one extruded face carrying the M as a cavity and four guide-pillar
 * bores, cut down the centre into two plates by a pair of clipping planes. Pull
 * the plates apart and light floods through the cavity; push forward and you
 * travel through the parting line into the site. One continuous shot, no cut to
 * a black text card.
 *
 * Every polygon here is generated at runtime. There is not one texture file, so
 * the whole sequence costs nothing to download and belongs to nobody else.
 */

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const SCALE = 0.1;
const HALF = 28 * SCALE; // the face spans -28..28 in logo units

/** The MKRD mark's own outline, rebuilt as extrudable geometry. */
const buildFaceShape = (): THREE.Shape => {
  const r = 3;
  const s = new THREE.Shape();
  // rounded square, drawn in logo units centred on the parting line
  s.moveTo(-28 + r, 28);
  s.lineTo(28 - r, 28);
  s.quadraticCurveTo(28, 28, 28, 28 - r);
  s.lineTo(28, -28 + r);
  s.quadraticCurveTo(28, -28, 28 - r, -28);
  s.lineTo(-28 + r, -28);
  s.quadraticCurveTo(-28, -28, -28, -28 + r);
  s.lineTo(-28, 28 - r);
  s.quadraticCurveTo(-28, 28, -28 + r, 28);

  // the M cavity — the same letterform as the mark, apex on the parting line
  const m = new THREE.Path();
  const pts: [number, number][] = [
    [-21, -10], [-21, 15], [-12, 15], [0, -1], [12, 15], [21, 15], [21, -10],
    [13.5, -10], [13.5, 4], [2, -11], [-2, -11], [-13.5, 4], [-13.5, -10],
  ];
  m.moveTo(...pts[0]);
  pts.slice(1).forEach(([x, y]) => m.lineTo(x, y));
  m.closePath();
  s.holes.push(m);

  // guide-pillar bores at the four corners
  ([[-21, 21], [21, 21], [-21, -21], [21, -21]] as [number, number][]).forEach(([x, y]) => {
    const c = new THREE.Path();
    c.absarc(x, y, 1.9, 0, Math.PI * 2, false);
    s.holes.push(c);
  });
  return s;
};

/** A soft radial falloff, drawn to a canvas so no image file is needed. */
const makeBloomTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(160,150,255,1)');
  g.addColorStop(0.45, 'rgba(120,110,255,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const DoorBlock: React.FC<{ progress: React.MutableRefObject<number> }> = ({ progress }) => {
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const seam = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const edgeL = useRef<THREE.Mesh>(null);
  const edgeR = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const bloom = useMemo(makeBloomTexture, []);
  useEffect(() => () => bloom.dispose(), [bloom]);

  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(buildFaceShape(), {
      depth: 8,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.5,
      bevelSegments: 3,
      curveSegments: 12,
    });
    g.center();
    g.scale(SCALE, SCALE, SCALE);
    return g;
  }, []);

  // One face, cut in two down the parting line. The planes travel with the
  // plates so each keeps a clean machined edge as it opens.
  const planes = useMemo(
    () => [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)],
    [],
  );

  useEffect(() => {
    gl.localClippingEnabled = true;
    return () => { gl.localClippingEnabled = false; };
  }, [gl]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ camera }, delta) => {
    const p = progress.current;

    // Two overlapping movements rather than one. The plates do most of their
    // travel first, so you watch the tool open; the camera only commits to the
    // gap once there is a gap to go through. Running them on one curve made the
    // shot punch past the block before it had finished parting.
    const openT = smoothstep(0, 0.72, p);
    const pushT = smoothstep(0.42, 1, p);
    const open = openT * HALF * 2.15;

    if (left.current) left.current.position.x = -open;
    if (right.current) right.current.position.x = open;
    planes[0].constant = -open;
    planes[1].constant = -open;

    // The seam marks the line while the tool is shut, then hands over to the
    // gap itself. It never grows — a red slab filling the screen is not a
    // parting line, it is a mistake.
    if (seam.current) {
      const m = seam.current.material as THREE.MeshBasicMaterial;
      m.opacity = (1 - smoothstep(0, 0.3, p)) * 0.95;
    }

    // The opening is lit by its own machined edges, not by a panel behind it.
    // Each plate carries a hot strip on its inner face that rides out with it —
    // which is what a parting line actually looks like when it breaks.
    const edgeOpacity = smoothstep(0.02, 0.28, p) * 0.9;
    if (edgeL.current) {
      edgeL.current.position.x = -open + 0.012;
      (edgeL.current.material as THREE.MeshBasicMaterial).opacity = edgeOpacity;
    }
    if (edgeR.current) {
      edgeR.current.position.x = open - 0.012;
      (edgeR.current.material as THREE.MeshBasicMaterial).opacity = edgeOpacity;
    }

    // and a soft bloom sitting in the gap, for atmosphere rather than fill
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      glow.current.scale.setScalar(0.6 + openT * 2.6);
      m.opacity = smoothstep(0.05, 0.55, p) * 0.36;
    }

    // travel stops in front of the plates; the exit fade covers the rest, so
    // the camera never ends up inside the geometry
    const z = 8.9 - pushT * 6.9;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 5, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {/* soft bloom in the gap — atmosphere, not a backdrop */}
      <mesh ref={glow} position={[0, 0, -1.6]}>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshBasicMaterial
          map={bloom}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={left} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#2E22E6" metalness={0.72} roughness={0.28} clippingPlanes={[planes[0]]} clipShadows />
      </mesh>
      <mesh ref={right} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#2E22E6" metalness={0.72} roughness={0.28} clippingPlanes={[planes[1]]} clipShadows />
      </mesh>

      {/* the hot machined edges of the two plates */}
      <mesh ref={edgeL} position={[0, 0, 0.2]}>
        <planeGeometry args={[0.024, HALF * 2]} />
        <meshBasicMaterial color="#B9AEFF" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={edgeR} position={[0, 0, 0.2]}>
        <planeGeometry args={[0.024, HALF * 2]} />
        <meshBasicMaterial color="#B9AEFF" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* the parting line itself */}
      <mesh ref={seam} position={[0, 0, 0.42]}>
        <planeGeometry args={[0.05, HALF * 2]} />
        <meshBasicMaterial color="#E20207" transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Pointer parallax with real authority — the block answers the cursor. */
const Parallax: React.FC = () => {
  const { camera, size } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [size]);

  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x * 1.5, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -target.current.y * 0.9, 3, delta);
  });
  return null;
};

export const MkrdEntrance: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const progress = useRef(0);
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  const touched = useRef(false);
  const glReady = useRef(false);

  const advance = useCallback((delta: number) => {
    if (finished.current) return;
    if (delta !== 0) touched.current = true;
    progress.current = Math.min(1, Math.max(0, progress.current + delta));
    setDisplay(progress.current);
    if (progress.current >= 1) {
      finished.current = true;
      setDone(true);
      window.setTimeout(onComplete, 620);
    }
  }, [onComplete]);

  const skip = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    progress.current = 1;
    setDisplay(1);
    setDone(true);
    window.setTimeout(onComplete, 320);
  }, [onComplete]);

  // Two failsafes, both for the same failure: a visitor left staring at a
  // dark blue rectangle with no way to know the site is behind it.
  //   - if WebGL never comes up, there is nothing to part, so open immediately;
  //   - if the visitor never touches it at all, open on their behalf.
  // Either way the site is reachable without the entrance having to succeed.
  useEffect(() => {
    const gl = window.setTimeout(() => { if (!glReady.current) skip(); }, 6000);
    const idle = window.setTimeout(() => { if (!touched.current) skip(); }, 14000);
    return () => { window.clearTimeout(gl); window.clearTimeout(idle); };
  }, [skip]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { skip(); return; }

    const onWheel = (e: WheelEvent) => { e.preventDefault(); advance(e.deltaY * 0.0013); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') advance(0.12);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') advance(-0.12);
    };
    let dragY: number | null = null;
    const down = (e: PointerEvent) => { dragY = e.clientY; touched.current = true; };
    const move = (e: PointerEvent) => {
      if (dragY === null) return;
      advance((dragY - e.clientY) * 0.0022);
      dragY = e.clientY;
    };
    const up = () => { dragY = null; };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [advance, skip]);

  const copyOpacity = Math.max(0, 1 - display * 1.9);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 bg-[#05061A] overflow-hidden cursor-grab active:cursor-grabbing touch-none"
        >
          <Canvas
            dpr={[1, 1.9]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 8.9], fov: 42, near: 0.1, far: 60 }}
            onCreated={() => { glReady.current = true; }}
          >
            <color attach="background" args={['#05061A']} />
            <ambientLight intensity={0.5} color="#9AA2E0" />
            <directionalLight position={[-5, 5, 6]} intensity={2.6} color="#E4E8FF" />
            <directionalLight position={[6, -2, -4]} intensity={2.2} color="#5B4DF5" />
            <pointLight position={[0, 0, 4]} intensity={1.6} distance={14} color="#7C71FF" />
            <pointLight position={[-4, -2, 2]} intensity={0.7} distance={9} color="#E20207" />
            <DoorBlock progress={progress} />
            <Parallax />

            {/* The post stack is what makes this read as a render rather than a
                viewport screenshot: the seam and the machined edges bloom, the
                frame falls off at the corners, and a hair of chromatic
                aberration keeps the edges from looking digitally perfect. */}
            <EffectComposer multisampling={4}>
              <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.75} />
              <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0006, 0.0009]} radialModulation modulationOffset={0.4} />
              <Vignette eskil={false} offset={0.28} darkness={0.72} />
            </EffectComposer>
          </Canvas>

          {/* the copy sits over the block and clears as the plates part */}
          <div
            className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-5 px-6 text-center pointer-events-none"
            style={{ opacity: copyOpacity }}
          >
            <div>
              <div className="font-mono text-[10px] tracking-[0.42em] uppercase text-brand-300/80">
                MKRD &middot; Software, Web &amp; 3D Printing
              </div>
              <h1 className="mt-3 font-display font-black text-white text-3xl sm:text-5xl tracking-tight">
                Nothing here is a mock-up.
              </h1>
              <p className="mt-3 text-fg-muted text-sm max-w-md mx-auto">
                Print a gearbox on our own cell, use our billing software, open a site we built.
                Gurugram, since 2018.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-brand-200/70">
              <ChevronsRight className="w-3.5 h-3.5 animate-pulse" />
              Scroll, drag or press enter
            </div>
          </div>

          {/* opening progress, as a parting-line readout */}
          <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
            <div className="w-56 h-[2px] bg-white/10 overflow-hidden rounded-full">
              <div
                className="h-full bg-accent transition-[width] duration-100 ease-out"
                style={{ width: `${display * 100}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={skip}
            className="absolute top-5 right-5 z-10 px-3 py-1.5 rounded-lg border border-ink-700 bg-ink-900/70 backdrop-blur-sm font-mono text-[10px] tracking-[0.2em] uppercase text-slate-400 hover:text-white hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-brand-400 transition-colors"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MkrdEntrance;
