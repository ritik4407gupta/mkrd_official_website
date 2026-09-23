import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Layers, Pause, Play, RotateCcw, Thermometer, Gauge, Ruler } from 'lucide-react';
import { MATERIALS_DB } from '../../data/mkrdData';
import { BRAND } from './palette';
import { StudioEnvironment, StudioLights, SimPost, Ground } from './rig';
import { extrudeUp, roundedRect, tslotProfile, mm } from './profiles';
import {
  buildPart, featureAt, Feature, LAYER_COUNT, LAYER_HEIGHT, PART_HEIGHT, SET,
} from './printedPart';
import { makePrintMaterial } from './printMaterial';
import { prefersReducedMotion } from '../../motion/tokens';

/**
 * Additive lab.
 *
 * The machine is MKRD's own: a 245 × 245 × 270 mm FDM printer, 0.4 mm nozzle.
 * Nothing here claims a capability the shop does not have — the previous scene
 * advertised a 450 × 450 × 500 mm dual-extrusion metal-sintering cell, which
 * was not real, and offered a material list (titanium, carbon PEEK) that was
 * not real either. The five materials below are the ones the shop actually runs.
 *
 * The part being printed is a genuine 4:1 planetary gearbox with involute teeth
 * generated from the involute of the base circle, at module 1.6 and a 20°
 * pressure angle — the profiles mesh, the planets are phased so the flanks
 * clear, and the gear ratios in the readout are the ones the tooth counts give.
 */

const BED_MM = 245;
const HEIGHT_MM = 270;
const NOZZLE_MM = 0.4;

/**
 * Per-filament process settings and appearance.
 *
 * Temperatures and speeds are the ordinary published windows for each family,
 * not claims about a particular spool. The colours are believable spool
 * colours rather than the brand ramp: a filament swatch that does not match the
 * part on the plate is worse than no swatch, and five shades of the same indigo
 * would make the material selector look like it did nothing.
 */
const FILAMENT: Record<
  string,
  { nozzle: number; bed: number; speed: number; color: string; roughness: number; sheen: number }
> = {
  'pla-plus': { nozzle: 215, bed: 60, speed: 60, color: '#E4E2F2', roughness: 0.42, sheen: 0.12 },
  abs: { nozzle: 245, bed: 100, speed: 45, color: '#2B3050', roughness: 0.66, sheen: 0.06 },
  petg: { nozzle: 235, bed: 80, speed: 50, color: '#6E7BD9', roughness: 0.3, sheen: 0.2 },
  tpu: { nozzle: 225, bed: 50, speed: 25, color: '#C4161C', roughness: 0.74, sheen: 0.04 },
  'nylon-cf': { nozzle: 260, bed: 80, speed: 40, color: '#14161F', roughness: 0.94, sheen: 0.02 },
};

const DEFAULT_MATERIAL = 'petg';

/** the printer sits below the orbit origin so the part lands near eye level */
const BASE_Y = mm(-70);


/* ------------------------------------------------------------------ machine */

const Frame = () => {
  const geo = useMemo(() => extrudeUp(tslotProfile(20), 1, {}), []);
  const rail = useMemo(() => extrudeUp(tslotProfile(20), 1, {}), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BRAND.steelDark, roughness: 0.42, metalness: 0.88, envMapIntensity: 1.1 }),
    [],
  );
  useEffect(() => () => { geo.dispose(); rail.dispose(); mat.dispose(); }, [geo, rail, mat]);

  const half = mm(BED_MM / 2 + 34);
  const h = mm(HEIGHT_MM + 46);
  const corners: Array<[number, number]> = [
    [-half, -half], [half, -half], [half, half], [-half, half],
  ];
  return (
    <group>
      {corners.map(([x, z], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[x, 0, z]} scale={[mm(1), h, mm(1)]} castShadow receiveShadow />
      ))}
      {/* top and bottom rails, running in X */}
      {[0, 1].map((k) =>
        [-half, half].map((z) => (
          <mesh
            key={`${k}-${z}`}
            geometry={rail}
            material={mat}
            position={[-half, k === 0 ? mm(6) : h, z]}
            rotation={[0, 0, -Math.PI / 2]}
            scale={[mm(1), half * 2, mm(1)]}
            castShadow
          />
        )),
      )}
      {/* and in Z */}
      {[0, 1].map((k) =>
        [-half, half].map((x) => (
          <mesh
            key={`z${k}-${x}`}
            geometry={rail}
            material={mat}
            position={[x, k === 0 ? mm(6) : h, -half]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[mm(1), half * 2, mm(1)]}
            castShadow
          />
        )),
      )}
    </group>
  );
};

/** A visible LED bar under the top rail, plus the spot that actually lights. */
const ChamberLight = ({ z, color, intensity }: { z: number; color: string; intensity: number }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <group>
      <mesh position={[0, mm(HEIGHT_MM + 26), z]}>
        <boxGeometry args={[mm(BED_MM - 10), mm(3), mm(7)]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <primitive object={target} position={[0, 0, 0]} />
      <spotLight
        position={[0, mm(HEIGHT_MM + 22), z]}
        target={target}
        angle={0.95}
        penumbra={0.9}
        intensity={intensity}
        distance={mm(HEIGHT_MM * 2.4)}
        decay={1.6}
        color={color}
      />
    </group>
  );
};

const Bed = () => {
  const plate = useMemo(() => extrudeUp(roundedRect(BED_MM, BED_MM, 6), 4, { bevel: 0.6 }), []);
  const carrier = useMemo(() => extrudeUp(roundedRect(BED_MM + 16, BED_MM + 16, 4), 8, { bevel: 0.8 }), []);
  useEffect(() => () => { plate.dispose(); carrier.dispose(); }, [plate, carrier]);
  return (
    <group scale={mm(1)}>
      <mesh geometry={carrier} position={[0, -12, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={BRAND.ink800} roughness={0.55} metalness={0.7} />
      </mesh>
      {/* the PEI sheet: dark, slightly textured, faintly warm */}
      {/* the PEI sheet: near-black, matte, barely reflective. Left glossy it
          reads as a sheet of white paper under the overhead softbox. */}
      <mesh geometry={plate} position={[0, -4, 0]} receiveShadow>
        <meshStandardMaterial color="#101438" roughness={0.92} metalness={0.12} envMapIntensity={0.35} />
      </mesh>
    </group>
  );
};

/** The toolhead: heatsink, fan shroud, silicone sock, nozzle. */
const ToolHead = React.forwardRef<THREE.Group>((_, ref) => {
  const finGeo = useMemo(() => new THREE.BoxGeometry(mm(22), mm(1.2), mm(22)), []);
  useEffect(() => () => finGeo.dispose(), [finGeo]);
  return (
    <group ref={ref}>
      {/* carriage plate */}
      <mesh position={[0, mm(30), mm(-14)]} castShadow>
        <boxGeometry args={[mm(38), mm(46), mm(5)]} />
        <meshStandardMaterial color={BRAND.brand} roughness={0.35} metalness={0.55} />
      </mesh>
      {/* heatsink fins */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} geometry={finGeo} position={[0, mm(34 - i * 3.4), 0]} castShadow>
          <meshStandardMaterial color={BRAND.steel} roughness={0.3} metalness={0.95} />
        </mesh>
      ))}
      {/* part-cooling fan */}
      <mesh position={[mm(20), mm(20), 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[mm(11), mm(11), mm(9), 20]} />
        <meshStandardMaterial color={BRAND.ink850} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* heater block in its silicone sock */}
      <mesh position={[0, mm(8), 0]} castShadow>
        <boxGeometry args={[mm(17), mm(13), mm(15)]} />
        <meshStandardMaterial color={BRAND.accent} roughness={0.85} metalness={0.02} emissive={BRAND.accent} emissiveIntensity={0.22} />
      </mesh>
      {/* nozzle */}
      <mesh position={[0, mm(1), 0]}>
        <coneGeometry args={[mm(4.2), mm(9), 18]} />
        <meshStandardMaterial color="#C9A227" roughness={0.24} metalness={0.98} emissive={BRAND.hot} emissiveIntensity={0.7} />
      </mesh>
      <pointLight position={[0, mm(-1), 0]} intensity={0.35} distance={mm(60)} decay={2} color={BRAND.hot} />
    </group>
  );
});
ToolHead.displayName = 'ToolHead';

/* --------------------------------------------------------------- the print */

const PrintedPart = ({
  features,
  material,
  printY,
  driven,
}: {
  features: Feature[];
  material: THREE.Material;
  printY: React.MutableRefObject<number>;
  driven: React.MutableRefObject<number>;
}) => {
  const refs = useRef<Array<THREE.Group | null>>([]);

  useFrame(() => {
    const h = printY.current;
    const drive = driven.current;
    features.forEach((f, i) => {
      const g = refs.current[i];
      if (!g) return;
      const t = THREE.MathUtils.clamp((h - f.baseY) / f.height, 0, 1);
      g.visible = t > 0.0005;
      g.scale.y = Math.max(t, 0.0005);
      if (f.spin === 'sun') g.rotation.y = drive;
      else if (f.spin === 'carrier') g.rotation.y = drive * SET.carrierRate;
      else if (f.spin === 'planet') {
        // the planet orbits with the carrier and spins on its own pin
        const idx = Number(f.id.split('-')[1]);
        const psi = (idx * 2 * Math.PI) / SET.planetCount + drive * SET.carrierRate;
        g.position.x = mm(Math.cos(psi) * SET.centreDistance);
        g.position.z = mm(-Math.sin(psi) * SET.centreDistance);
        g.rotation.y = (f.phase ?? 0) + drive * SET.planetRate;
      }
    });
  });

  return (
    <group scale={mm(1)}>
      {features.map((f, i) => (
        <group
          key={f.id}
          ref={(el) => { refs.current[i] = el; }}
          position={[f.offset?.[0] ?? 0, f.baseY, -(f.offset?.[1] ?? 0)]}
          rotation={[0, f.phase ?? 0, 0]}
        >
          <mesh geometry={f.geometry} material={material} castShadow receiveShadow scale={[1, 1, 1]} />
        </group>
      ))}
    </group>
  );
};

/**
 * The perimeter the nozzle is tracing on the current layer, plus the bead of
 * material coming out of it.
 *
 * A plain lineBasicMaterial is one device pixel wide on every GPU regardless of
 * linewidth, which at this camera distance is invisible. drei's <Line> fixes
 * that but drags in three-stdlib, which cost this chunk 100 kB gzipped for one
 * glowing outline — so the bead is swept as a real tube instead, built once per
 * feature from three's own TubeGeometry. The active feature changes a handful of
 * times over a whole print, so rebuilding it there is free.
 */
const Toolpath = ({
  features,
  printY,
  headRef,
  driven,
}: {
  features: Feature[];
  printY: React.MutableRefObject<number>;
  headRef: React.RefObject<THREE.Group | null>;
  driven: React.MutableRefObject<number>;
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const groupRef = useRef<THREE.Group>(null);
  const beadRef = useRef<THREE.Mesh>(null);
  const cursor = useRef(0);

  const active = features.find((f) => f.id === activeId) ?? null;

  const { points, tube } = useMemo(() => {
    if (!active || !active.outline.length) {
      return { points: [new THREE.Vector3()], tube: null as THREE.TubeGeometry | null };
    }
    const src = active.outline;
    const n = Math.min(src.length, 260);
    const step = src.length / n;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const [x, y] = src[Math.floor(i * step) % src.length];
      pts.push(new THREE.Vector3(mm(x), 0, mm(-y)));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0);
    return { points: pts, tube: new THREE.TubeGeometry(curve, n, mm(0.55), 5, true) };
  }, [active]);

  useEffect(() => () => tube?.dispose(), [tube]);

  useFrame((_, dt) => {
    const f = featureAt(features, printY.current);
    const id = f?.outline.length ? f.id : '';
    if (id !== activeId) setActiveId(id);

    const g = groupRef.current;
    if (!g) return;
    g.visible = Boolean(f && f.outline.length);
    if (!f) return;

    const spin =
      f.spin === 'sun' ? driven.current
      : f.spin === 'carrier' ? driven.current * SET.carrierRate
      : 0;
    g.position.set(
      f.offset ? mm(f.offset[0]) : 0,
      mm(printY.current),
      f.offset ? mm(-f.offset[1]) : 0,
    );
    g.rotation.y = (f.phase ?? 0) + spin;

    // ride the perimeter
    const n = Math.max(points.length, 1);
    cursor.current = (cursor.current + dt * n * 0.5) % n;
    const pt = points[Math.floor(cursor.current)] ?? points[0];
    if (beadRef.current) beadRef.current.position.copy(pt);

    const head = headRef.current;
    if (head) {
      // the head hangs off the gantry, which already carries the print height —
      // only X and Z come from the toolpath. Setting Y here as well is what put
      // the nozzle a whole gantry-height above its own layer.
      const c = Math.cos(g.rotation.y);
      const sn = Math.sin(g.rotation.y);
      head.position.x = g.position.x + pt.x * c + pt.z * sn;
      head.position.z = g.position.z - pt.x * sn + pt.z * c;
    }
  });

  return (
    <group ref={groupRef}>
      {tube && (
        <mesh geometry={tube}>
          <meshBasicMaterial color={BRAND.hotCore} toneMapped={false} />
        </mesh>
      )}
      <mesh ref={beadRef}>
        <sphereGeometry args={[mm(1.1), 10, 10]} />
        <meshBasicMaterial color={BRAND.hotCore} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ---------------------------------------------------------------- the scene */

const Scene = ({
  materialId,
  playing,
  layerRef,
  onLayer,
  reduced,
  engaged,
}: {
  materialId: string;
  playing: boolean;
  layerRef: React.MutableRefObject<number>;
  onLayer: (n: number) => void;
  reduced: boolean;
  engaged: boolean;
}) => {
  const features = useMemo(() => buildPart(), []);
  const film = FILAMENT[materialId] ?? FILAMENT[DEFAULT_MATERIAL];
  const built = useMemo(() => makePrintMaterial(film.color, mm(LAYER_HEIGHT)), [film.color]);
  const printY = useRef(0);
  const driven = useRef(0);
  const headRef = useRef<THREE.Group>(null);
  const gantry = useRef<THREE.Group>(null);
  const lastPublish = useRef(0);

  useEffect(() => {
    built.material.color.set(film.color);
    built.material.roughness = film.roughness;
    built.material.metalness = film.sheen;
    built.material.needsUpdate = true;
    return () => { built.material.dispose(); };
  }, [built, film]);

  useEffect(() => () => features.forEach((f) => f.geometry.dispose()), [features]);

  useFrame((state, dt) => {
    if (playing) {
      layerRef.current += dt * 26; // ≈ 26 layers a second, a watchable rate
      if (layerRef.current > LAYER_COUNT) layerRef.current = 0;
    }
    const layer = layerRef.current;
    printY.current = layer * LAYER_HEIGHT;
    built.uniforms.uPrintY.value = BASE_Y + mm(printY.current);
    built.uniforms.uHeat.value = playing ? 1 : 0.25;

    // once the part is finished it is a gearbox, so run it
    const done = layer >= LAYER_COUNT - 0.5;
    driven.current += dt * (done ? 0.9 : 0);
    if (!done) driven.current = 0;

    if (gantry.current) {
      const target = mm(printY.current) + mm(1);
      gantry.current.position.y += (target - gantry.current.position.y) * Math.min(1, dt * 7);
    }

    if (state.clock.elapsedTime - lastPublish.current > 0.12) {
      lastPublish.current = state.clock.elapsedTime;
      onLayer(layer);
    }
  });

  return (
    <>
      <color attach="background" args={[BRAND.inkDeep]} />
      <fog attach="fog" args={[BRAND.inkDeep, mm(520), mm(1500)]} />
      <StudioEnvironment />
      <StudioLights shadows={!reduced} />

      <group position={[0, BASE_Y, 0]}>
        {/* Chamber LEDs. A rectAreaLight would be the physically right tool, but
            three only makes those work by uploading two BRDF lookup tables that
            weigh ~100 kB gzipped — far too much for one strip light. So: a
            visible emissive bar for the look, and a spot behind it for the
            illumination. */}
        <ChamberLight z={mm(BED_MM / 2 + 26)} color="#EEEDFF" intensity={16} />
        <ChamberLight z={mm(-(BED_MM / 2 + 26))} color={BRAND.lift} intensity={9} />
        <Frame />
        <Bed />
        <PrintedPart features={features} material={built.material} printY={printY} driven={driven} />
        <group ref={gantry}>
          {/* the X rail the toolhead runs on */}
          <mesh position={[0, mm(52), mm(-10)]} castShadow>
            <boxGeometry args={[mm(BED_MM + 68), mm(20), mm(20)]} />
            <meshStandardMaterial color={BRAND.steelDark} roughness={0.4} metalness={0.9} />
          </mesh>
          <ToolHead ref={headRef} />
        </group>
        <Toolpath features={features} printY={printY} headRef={headRef} driven={driven} />
        <Ground y={mm(-24)} scale={mm(520)} opacity={0.7} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        enableZoom={engaged}
        minDistance={mm(130)}
        maxDistance={mm(620)}
        minPolarAngle={0.42}
        maxPolarAngle={Math.PI / 2 - 0.05}
        autoRotate={!reduced && !engaged}
        autoRotateSpeed={0.28}
        target={[0, BASE_Y + mm(18), 0]}
      />
      <SimPost reduced={reduced} />
    </>
  );
};

/* ------------------------------------------------------------------- the UI */

export const AdditiveLab: React.FC = () => {
  const reduced = prefersReducedMotion();
  const [materialId, setMaterialId] = useState(DEFAULT_MATERIAL);
  const [playing, setPlaying] = useState(!reduced);
  const [layer, setLayer] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const layerRef = useRef(0);

  // The scene sits inside a tall scroll-pinned section. If OrbitControls owned
  // the wheel from the moment the pointer crossed the canvas, a visitor
  // scrolling down the page would be trapped zooming the printer instead. So
  // zoom only takes over once they deliberately engage, and Escape gives it back.
  useEffect(() => {
    if (!engaged) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEngaged(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engaged]);

  const spec = MATERIALS_DB.find((m) => m.id === materialId) ?? MATERIALS_DB[0];
  const film = FILAMENT[materialId] ?? FILAMENT[DEFAULT_MATERIAL];
  const pct = Math.min(100, (layer / LAYER_COUNT) * 100);
  const heightNow = (layer * LAYER_HEIGHT).toFixed(1);
  // a 146 mm × 58 mm part at 0.2 mm layers is a long print; the estimate scales
  // off the material's own feed rate, so slow TPU reads as slow
  const totalHours = (16 * 50) / film.speed;
  const remaining = Math.max(0, Math.round(totalHours * (1 - layer / LAYER_COUNT) * 10) / 10);

  const scrub = (n: number) => {
    layerRef.current = n;
    setLayer(n);
    setPlaying(false);
  };

  return (
    <div className="w-full h-full flex flex-col relative z-10 bg-ink-950/40">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-brand-900/40 bg-ink-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-70 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-brand-300 uppercase">In-house FDM cell</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-950/70 border border-brand-800/70 text-brand-200 font-mono">
                {BED_MM} × {BED_MM} × {HEIGHT_MM} mm
              </span>
            </div>
            <p className="text-[11.5px] text-fg-muted truncate">Printing a 4:1 planetary gearbox — {SET.sunTeeth}T sun, {SET.planetTeeth}T planets, {SET.ringTeeth}T ring, module {SET.module}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Chip icon={<Thermometer className="w-3.5 h-3.5 text-accent-lift" />} label="NOZZLE" value={`${film.nozzle} °C`} />
          <Chip icon={<Gauge className="w-3.5 h-3.5 text-brand-300" />} label="BED" value={`${film.bed} °C`} />
          <Chip icon={<Ruler className="w-3.5 h-3.5 text-fg-muted" />} label="TIP" value={`${NOZZLE_MM} mm`} className="hidden lg:flex" />
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
          camera={{ position: [mm(128), mm(96), mm(268)], fov: 33, near: 0.05, far: mm(3000) }}
        >
          <Suspense fallback={null}>
            <Scene
              materialId={materialId}
              playing={playing}
              layerRef={layerRef}
              onLayer={setLayer}
              reduced={reduced}
              engaged={engaged}
            />
          </Suspense>
        </Canvas>

        <div className="absolute top-4 left-4 flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-lg bg-ink-950/85 backdrop-blur border border-brand-900/60 text-[11px] font-mono text-fg hover:border-brand-600 transition-colors flex items-center gap-1.5"
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {playing ? 'Pause' : 'Run print'}
          </button>
          <button
            onClick={() => scrub(0)}
            className="px-3 py-1.5 rounded-lg bg-ink-950/85 backdrop-blur border border-brand-900/60 text-[11px] font-mono text-fg-muted hover:text-fg hover:border-brand-600 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" /> Restart
          </button>
        </div>

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

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-ink-800">
          <div className="h-full bg-gradient-to-r from-brand-700 via-brand-400 to-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="px-5 py-4 bg-ink-950/85 border-t border-brand-900/40 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
            <span className="flex items-center gap-2 text-fg">
              <Layers className="w-3.5 h-3.5 text-brand-300" />
              LAYER <strong className="text-brand-200 tabular-nums">{Math.round(layer)}</strong>
              <span className="text-fg-dim">/ {LAYER_COUNT}</span>
              <span className="text-fg-muted tabular-nums">Z {heightNow} / {PART_HEIGHT} mm</span>
            </span>
            <span className="text-fg-dim tabular-nums">
              {LAYER_HEIGHT} mm layers · {film.speed} mm/s · ~{remaining} h of {totalHours.toFixed(0)} h remaining
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={LAYER_COUNT}
            step={1}
            value={Math.round(layer)}
            onChange={(e) => scrub(Number(e.target.value))}
            aria-label="Slice height"
            className="w-full h-1.5 rounded-full appearance-none bg-ink-800 accent-brand-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          />
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-fg-dim mb-2">Material loaded</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {MATERIALS_DB.map((m) => {
              const on = m.id === materialId;
              return (
                <button
                  key={m.id}
                  onClick={() => setMaterialId(m.id)}
                  aria-pressed={on}
                  className={`p-2.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                    on
                      ? 'bg-brand-950/70 border-brand-500 shadow-[0_0_0_1px_var(--color-brand-500)]'
                      : 'bg-ink-900/60 border-ink-700 hover:border-ink-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white/25" style={{ backgroundColor: (FILAMENT[m.id] ?? FILAMENT[DEFAULT_MATERIAL]).color }} />
                    <span className="text-[9.5px] font-mono text-fg-dim">{m.costTier}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-fg truncate">{m.name}</div>
                  <div className="text-[9.5px] font-mono text-fg-dim mt-0.5">{m.tensileStrength}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-ink-900/60 border border-ink-700 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[12px] font-semibold text-brand-200">{spec.name}</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-ink-800 text-fg-muted font-mono">{spec.category}</span>
            </div>
            <p className="text-[11.5px] text-fg-muted leading-relaxed">{spec.description}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
            <Stat label="TENSILE" value={spec.tensileStrength} />
            <Stat label="HDT" value={spec.heatDeflection} />
            <Stat label="DENSITY" value={spec.density} />
          </div>
        </div>
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
    <div className="text-fg font-semibold tabular-nums">{value}</div>
  </div>
);

export default AdditiveLab;
