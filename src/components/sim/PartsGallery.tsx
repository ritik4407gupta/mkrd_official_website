import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Clock, Layers, Ruler } from 'lucide-react';
import { BRAND } from './palette';
import { StudioEnvironment, StudioLights, SimPost, Ground } from './rig';
import { disc, extrudeUp, mm } from './profiles';
import { PRINTED_ITEMS, PrintedItem } from './printedItems';
import { makePrintMaterial } from './printMaterial';
import { prefersReducedMotion } from '../../motion/tokens';

/**
 * Printed parts gallery.
 *
 * Printing is what this site is for, so this is the tab that shows what comes
 * off the machines. Every part is generated from its real engineering geometry
 * — involute gear teeth, an articulating chain on real pin centres, an actual
 * helix — rather than downloaded, so the images are ours, there is no licence
 * to carry, and no photography is waiting on anyone.
 *
 * It replaces a six-axis robot arm that MKRD does not own.
 */

/**
 * A studio sweep behind the part.
 *
 * On a flat void background a dark part is a silhouette with no silhouette —
 * the edges have nothing to separate from. This is the cyclorama a product
 * photographer would put behind it: a large inverted sphere with a soft
 * vertical falloff, generated in the shader so it costs nothing to load.
 */
const Backdrop = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: new THREE.Color(BRAND.inkDeep) },
          uMid: { value: new THREE.Color('#171B45') },
          uBottom: { value: new THREE.Color('#0A0C24') },
        },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vDir;
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom;
          void main() {
            float h = vDir.y * 0.5 + 0.5;
            vec3 c = h < 0.5
              ? mix(uBottom, uMid, smoothstep(0.18, 0.5, h))
              : mix(uMid, uTop, smoothstep(0.5, 0.94, h));
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} scale={mm(2600)}>
      <sphereGeometry args={[1, 32, 24]} />
    </mesh>
  );
};

/** A turntable sized to whatever is standing on it, not a fixed slab. */
const Plinth = ({ radius }: { radius: number }) => {
  const top = useMemo(() => extrudeUp(disc(radius, 0), 5, { bevel: 0.8, curveSegments: 64 }), [radius]);
  useEffect(() => () => { top.dispose(); }, [top]);
  return (
    <group scale={mm(1)} position={[0, mm(-5), 0]}>
      <mesh geometry={top} receiveShadow>
        <meshStandardMaterial color="#0D1030" roughness={0.86} metalness={0.25} envMapIntensity={0.3} />
      </mesh>
    </group>
  );
};

const Part = ({ item, spin }: { item: PrintedItem; spin: boolean }) => {
  const pieces = useMemo(() => item.build(), [item]);
  const built = useMemo(() => makePrintMaterial(item.color, mm(item.layerMm)), [item.color, item.layerMm]);
  const accent = useMemo(() => makePrintMaterial(item.color, mm(item.layerMm)), [item.color, item.layerMm]);
  const turntable = useRef<THREE.Group>(null);
  const refs = useRef<Array<THREE.Object3D | null>>([]);

  useEffect(() => {
    built.material.color.set(item.color);
    built.material.roughness = item.roughness;
    // the accent pieces read as a second spool of the same family, one shade off
    accent.material.color.set(new THREE.Color(item.color).offsetHSL(0, 0, item.roughness > 0.7 ? 0.16 : -0.14));
    accent.material.roughness = Math.min(1, item.roughness + 0.08);
    built.material.needsUpdate = true;
    accent.material.needsUpdate = true;
    // the whole part is finished, so no hot layer — just the layer lines
    built.uniforms.uHeat.value = 0;
    accent.uniforms.uHeat.value = 0;
    built.uniforms.uPrintY.value = -9999;
    accent.uniforms.uPrintY.value = -9999;
  }, [built, accent, item]);

  useEffect(() => () => { built.material.dispose(); accent.material.dispose(); }, [built, accent]);
  useEffect(() => () => pieces.forEach((p) => p.geometry.dispose()), [pieces]);

  useFrame((state, dt) => {
    if (turntable.current && spin) turntable.current.rotation.y += dt * 0.22;
    item.animate?.(refs.current.filter(Boolean) as THREE.Object3D[], state.clock.elapsedTime);
  });

  return (
    <group ref={turntable}>
      <group scale={mm(1)} position={[0, 0, 0]}>
        {pieces.map((p, i) => (
          <mesh
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            geometry={p.geometry}
            material={p.accent ? accent.material : built.material}
            position={p.position}
            rotation={p.rotation ?? [0, 0, 0]}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    </group>
  );
};

const Scene = ({ item, spin, reduced, engaged }: { item: PrintedItem; spin: boolean; reduced: boolean; engaged: boolean }) => {
  // frame the camera to whatever is on the plinth, so a 190 mm chain and a
  // 68 mm foot both fill the shot instead of one being a speck
  const reach = Math.max(item.spanMm, item.heightMm * 1.7);
  const height = mm(item.heightMm * 0.9 + item.spanMm * 0.34);
  const plinthR = Math.max(reach * 0.62, 42);

  return (
    <>
      <color attach="background" args={[BRAND.inkDeep]} />
      <Backdrop />
      <StudioEnvironment intensity={1.5} />
      <StudioLights shadows={!reduced} intensity={1.4} />

      <group position={[0, mm(-item.heightMm * 0.35), 0]}>
        <Plinth radius={plinthR} />
        <Part item={item} spin={spin && !engaged} />
        <Ground y={mm(-5)} scale={mm(plinthR * 4)} opacity={0.6} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        enableZoom={engaged}
        minDistance={mm(reach * 0.7)}
        maxDistance={mm(reach * 4)}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 + 0.22}
        target={[0, mm(item.heightMm * 0.42), 0]}
      />
      <PerspectiveRig spanMm={item.spanMm} heightMm={item.heightMm} eye={height} />
      <SimPost reduced={reduced} />
    </>
  );
};

/**
 * Eases the camera to a new framing when the selected part changes.
 *
 * The distance is solved against the live viewport rather than guessed: this
 * canvas sits in a scroll-pinned frame that is often very wide and very short,
 * where a fixed distance leaves the part as a speck because the vertical field
 * of view is the binding constraint.
 */
const PerspectiveRig = ({ spanMm, heightMm, eye }: { spanMm: number; heightMm: number; eye: number }) => {
  const target = useRef(new THREE.Vector3());
  useFrame(({ camera, gl }, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const el = gl.domElement;
    const aspect = Math.max(el.clientWidth / Math.max(el.clientHeight, 1), 0.2);
    if (Math.abs(cam.aspect - aspect) > 0.001) {
      cam.aspect = aspect;
      cam.updateProjectionMatrix();
    }
    // Fit the object's PROJECTED extents, using the camera's current elevation.
    // Fitting the bounding sphere leaves a squat wide part tiny in a wide short
    // frame; fitting height alone puts the lens inside it. Looking down at
    // elevation φ, a part w wide and h tall covers h·cos φ + w·sin φ vertically.
    const r = Math.hypot(cam.position.x, cam.position.z) || 1;
    const phi = Math.atan2(Math.max(cam.position.y, 0), r);
    const projH = mm(heightMm) * Math.cos(phi) + mm(spanMm) * Math.sin(phi);
    const fill = 0.82;
    const halfV = THREE.MathUtils.degToRad(cam.fov) / 2;
    const halfH = Math.atan(Math.tan(halfV) * aspect);
    const dist = Math.max(
      projH / 2 / (Math.tan(halfV) * fill),
      mm(spanMm) / 2 / (Math.tan(halfH) * fill),
    );

    target.current.set((cam.position.x / r) * dist, eye, (cam.position.z / r) * dist);
    cam.position.lerp(target.current, Math.min(1, dt * 1.8));
  });
  return null;
};

export const PartsGallery: React.FC = () => {
  const reduced = prefersReducedMotion();
  const [activeId, setActiveId] = useState(PRINTED_ITEMS[0].id);
  const [spin, setSpin] = useState(!reduced);
  const [engaged, setEngaged] = useState(false);
  const item = PRINTED_ITEMS.find((p) => p.id === activeId) ?? PRINTED_ITEMS[0];

  useEffect(() => {
    if (!engaged) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEngaged(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engaged]);

  return (
    <div className="w-full h-full flex flex-col relative z-10 bg-ink-950/40">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-brand-900/40 bg-ink-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-ok shrink-0 shadow-[0_0_10px_var(--color-ok)]" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-brand-300 uppercase">Printed in-house</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-950/70 border border-brand-800/70 text-brand-200 font-mono">
                {PRINTED_ITEMS.length} parts
              </span>
            </div>
            <p className="text-[11.5px] text-fg-muted truncate">
              Four jobs a 245 × 245 × 270 mm FDM cell gets bought for — drag to turn any of them over
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Chip icon={<Ruler className="w-3.5 h-3.5 text-brand-300" />} label="SIZE" value={item.sizeMm} />
          <Chip icon={<Clock className="w-3.5 h-3.5 text-fg-muted" />} label="PRINT" value={`~${item.printHours} h`} className="hidden lg:flex" />
        </div>
      </header>

      <div
        className="relative w-full flex-grow cursor-grab active:cursor-grabbing"
        onPointerDown={() => setEngaged(true)}
      >
        <Canvas
          shadows={!reduced}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          camera={{ position: [mm(150), mm(95), mm(200)], fov: 34, near: 0.05, far: mm(4000) }}
        >
          <Suspense fallback={null}>
            <Scene item={item} spin={spin} reduced={reduced} engaged={engaged} />
          </Suspense>
        </Canvas>

        <button
          onClick={() => setSpin((v) => !v)}
          aria-pressed={spin}
          className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-ink-950/85 backdrop-blur border border-brand-900/60 text-[11px] font-mono text-fg hover:border-brand-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {spin ? 'Stop turntable' : 'Start turntable'}
        </button>

        <button
          onClick={() => setEngaged((v) => !v)}
          aria-pressed={engaged}
          className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-lg backdrop-blur border text-[10.5px] font-mono transition-colors hidden sm:block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
            engaged
              ? 'bg-brand-950/85 border-brand-500 text-brand-100'
              : 'bg-ink-950/80 border-brand-900/50 text-fg-dim hover:text-fg hover:border-brand-700'
          }`}
        >
          {engaged ? 'drag to orbit · scroll to zoom · esc to release' : 'click to take control'}
        </button>
      </div>

      <div className="px-5 py-4 bg-ink-950/85 border-t border-brand-900/40 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PRINTED_ITEMS.map((p) => {
            const on = p.id === activeId;
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                aria-pressed={on}
                className={`p-2.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  on
                    ? 'bg-brand-950/70 border-brand-500 shadow-[0_0_0_1px_var(--color-brand-500)]'
                    : 'bg-ink-900/60 border-ink-700 hover:border-ink-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white/25" style={{ backgroundColor: p.color }} />
                  <span className="text-[9.5px] font-mono text-fg-dim">~{p.printHours} h</span>
                </div>
                <div className="text-[11.5px] font-semibold text-fg leading-tight">{p.name}</div>
                <div className="text-[9.5px] font-mono text-fg-dim mt-0.5 truncate">{p.material}</div>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-lg bg-ink-900/60 border border-ink-700 flex flex-col md:flex-row md:items-start gap-3 justify-between">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Box className="w-3.5 h-3.5 text-brand-300" />
              <span className="text-[12.5px] font-semibold text-brand-200">{item.name}</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-ink-800 text-fg-muted font-mono">{item.material}</span>
            </div>
            <p className="text-[12px] text-fg leading-relaxed">{item.use}</p>
            <p className="text-[11.5px] text-fg-muted leading-relaxed">{item.why}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
            <Stat label="SIZE" value={item.sizeMm} />
            <Stat label="LAYER" value={`${item.layerMm} mm`} />
            <Stat label="PRINT" value={`~${item.printHours} h`} />
          </div>
        </div>

        <p className="text-[11px] text-fg-dim leading-relaxed border-l-2 border-brand-800 pl-3 flex gap-2">
          <Layers className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-400" />
          <span>
            These are generated from their own engineering geometry, live in your browser — the gear
            teeth are real involutes, the chain articulates on its real pin centres, the damper is a
            real helix. Nothing here is a stock model or a stock photograph.
          </span>
        </p>
      </div>
    </div>
  );
};

const Chip = ({ icon, label, value, className = '' }: { icon: React.ReactNode; label: string; value: string; className?: string }) => (
  <div className={`items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-950/70 border border-ink-700 flex ${className}`}>
    {icon}
    <span className="text-fg-dim">{label}</span>
    <span className="text-fg font-semibold tabular-nums">{value}</span>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-right">
    <div className="text-[9px] text-fg-dim tracking-wider">{label}</div>
    <div className="text-fg font-semibold tabular-nums whitespace-nowrap">{value}</div>
  </div>
);

export default PartsGallery;
