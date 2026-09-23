import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Pause, Play, Scissors, Thermometer, Waves, Gauge } from 'lucide-react';
import { BRAND } from './palette';
import { StudioEnvironment, StudioLights, SimPost, Ground } from './rig';
import { mm } from './profiles';
import {
  buildToolGeometries, poseAt, STAGES, TOOL, CAVITY_X, ToolGeometries,
} from './mouldTool';
import { makeMeltMaterial, makeRunnerMaterial } from './meltMaterial';
import { prefersReducedMotion } from '../../motion/tokens';

/**
 * Mould tool cycle.
 *
 * This replaces the "Robotic Kinematics" tab, which showed a six-axis robot
 * with ±0.015 mm repeatability. MKRD does not own a six-axis robot — the
 * machinery list is an FDM printer, CAD workstations, a mould-flow analysis
 * cell and reverse-engineering, and the robot was in the same class of claim as
 * the "Defense Grade" badge and the ISO number that came off the rest of the
 * site.
 *
 * What replaces it is the thing they actually sell: a two-plate, two-impression
 * mould running a full cycle, sectionable, with the fill-time plot the flow
 * analysis produces. It is also the company mark — two plates parting on a
 * centre line — which is the same object the entrance and the page transitions
 * are built from.
 */

const OPEN_AXIS_Z = mm(TOOL.openStroke);
const SECTION_HEIGHT = 0; // the section cuts on the cavity centreline, world y = 0

/** the gate sits on the inner edge of each impression, at mid wall */
const GATE = new THREE.Vector3(TOOL.part.w / 2 - 2, TOOL.part.depth * 0.5, 0);
const MAX_FLOW = Math.hypot(TOOL.part.w, TOOL.part.h / 2, TOOL.part.depth) * 1.02;

/* ------------------------------------------------------------------ pieces */

const steel = (color: string, roughness: number, metalness = 0.95) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, envMapIntensity: 1.2 });

const ToolHalf = ({
  geo,
  materials,
  side,
}: {
  geo: ToolGeometries;
  materials: { bolster: THREE.Material; insert: THREE.Material; core: THREE.Material };
  side: 'fixed' | 'moving';
}) => {
  const sign = side === 'fixed' ? -1 : 1;
  const insertBase = sign === -1 ? -TOOL.insert.t : 0;
  const bolsterBase = sign === -1 ? -(TOOL.insert.t + TOOL.bolster.t) : TOOL.insert.t;

  return (
    <group>
      <mesh
        geometry={geo.bolster}
        material={materials.bolster}
        position={[0, mm(bolsterBase), 0]}
        scale={mm(1)}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={side === 'fixed' ? geo.cavityInsert : geo.insert}
        material={materials.insert}
        position={[0, mm(insertBase), 0]}
        scale={mm(1)}
        castShadow
        receiveShadow
      />
      {side === 'moving' &&
        CAVITY_X.map((x) => (
          <mesh
            key={x}
            geometry={geo.core}
            material={materials.core}
            position={[mm(x), 0, 0]}
            rotation={[0, 0, Math.PI]}
            scale={mm(1)}
            castShadow
          />
        ))}
    </group>
  );
};

/** the water: two runs per half, lit when the cycle is pulling heat out */
const Cooling = ({
  geo,
  flow,
  side,
}: {
  geo: ToolGeometries;
  flow: React.MutableRefObject<number>;
  side: 'fixed' | 'moving';
}) => {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2C7DE0',
        roughness: 0.25,
        metalness: 0.2,
        emissive: new THREE.Color('#2C7DE0'),
        emissiveIntensity: 0.3,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((state) => {
    const pulse = 0.25 + flow.current * (0.55 + 0.35 * Math.sin(state.clock.elapsedTime * 5));
    mat.emissiveIntensity = pulse;
  });
  const sign = side === 'fixed' ? -1 : 1;
  const ys = [TOOL.insert.t * 0.45, TOOL.insert.t + TOOL.bolster.t * 0.4].map((v) => sign * v);
  const zs = [-TOOL.part.h * 0.42, TOOL.part.h * 0.42];
  return (
    <group>
      {ys.map((y) =>
        zs.map((z) => (
          <mesh
            key={`${y}-${z}`}
            geometry={geo.coolingRun}
            material={mat}
            position={[0, mm(y), mm(z)]}
            rotation={[0, 0, Math.PI / 2]}
            scale={mm(1)}
          />
        )),
      )}
    </group>
  );
};

const Feed = ({ geo, fill }: { geo: ToolGeometries; fill: React.MutableRefObject<number> }) => {
  const mat = useMemo(() => makeRunnerMaterial(), []);
  const sprueRef = useRef<THREE.Mesh>(null);
  const runnerRef = useRef<THREE.Mesh>(null);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(() => {
    // the sprue charges first, then the runner reaches the gates
    const f = fill.current;
    const sprueT = THREE.MathUtils.clamp(f / 0.22, 0, 1);
    const runT = THREE.MathUtils.clamp((f - 0.16) / 0.3, 0, 1);
    if (sprueRef.current) {
      sprueRef.current.scale.y = mm(Math.max(sprueT, 0.001));
      sprueRef.current.visible = sprueT > 0.01;
    }
    if (runnerRef.current) {
      runnerRef.current.scale.y = mm(Math.max(runT, 0.001));
      runnerRef.current.visible = runT > 0.01;
    }
    mat.emissiveIntensity = 0.35 + 0.5 * (1 - Math.abs(f - 0.5) * 2);
  });
  return (
    <group>
      <mesh
        ref={sprueRef}
        geometry={geo.sprue}
        material={mat}
        position={[0, mm(-(TOOL.insert.t + TOOL.bolster.t)), 0]}
        scale={mm(1)}
      />
      <mesh
        ref={runnerRef}
        geometry={geo.runnerBar}
        material={mat}
        position={[mm(-TOOL.cavityPitch), mm(-TOOL.runner.d / 2), 0]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={mm(1)}
      />
    </group>
  );
};

const Mouldings = ({
  geo,
  material,
}: {
  geo: ToolGeometries;
  material: THREE.Material;
}) => (
  <>
    {CAVITY_X.map((x, i) => (
      <mesh
        key={x}
        geometry={geo.part}
        material={material}
        position={[mm(x), mm(-TOOL.part.depth), 0]}
        // the second impression is the first one mirrored, which lets both share
        // one melt material: object space is unchanged by a negative scale
        scale={[i === 0 ? mm(1) : mm(-1), mm(1), mm(1)]}
      />
    ))}
  </>
);

/* ------------------------------------------------------------------- scene */

const Scene = ({
  playing,
  tRef,
  onTick,
  section,
  flowPlot,
  reduced,
  engaged,
}: {
  playing: boolean;
  tRef: React.MutableRefObject<number>;
  onTick: (t: number) => void;
  section: boolean;
  flowPlot: boolean;
  reduced: boolean;
  engaged: boolean;
}) => {
  const { gl } = useThree();
  const geo = useMemo(() => buildToolGeometries(), []);
  const melt = useMemo(() => makeMeltMaterial('#1F2452', MAX_FLOW), []);

  const movingHalf = useRef<THREE.Group>(null);
  const ejectors = useRef<THREE.Group>(null);
  const mouldings = useRef<THREE.Group>(null);
  const fillRef = useRef(0);
  const coolRef = useRef(0);
  const lastTick = useRef(0);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), SECTION_HEIGHT), []);

  const materials = useMemo(
    () => ({
      bolster: steel(BRAND.steelDark, 0.44),
      insert: steel('#A7AEDC', 0.22),
      core: steel('#C6CBEE', 0.16),
      pillar: steel('#D6DAF4', 0.12),
      ejector: steel('#E4E7FA', 0.14),
    }),
    [],
  );
  const steelList: THREE.MeshStandardMaterial[] = useMemo(
    () => [materials.bolster, materials.insert, materials.core, materials.pillar, materials.ejector],
    [materials],
  );

  // one clipping plane, applied to every steel surface and to the moulding, so a
  // section shows the pocket, the feed system and the water in one cut
  useEffect(() => {
    gl.localClippingEnabled = true;
    const list = section ? [plane] : [];
    for (const m of steelList) {
      m.clippingPlanes = list;
      m.side = section ? THREE.DoubleSide : THREE.FrontSide;
      m.needsUpdate = true;
    }
    melt.material.clippingPlanes = list;
    melt.material.side = section ? THREE.DoubleSide : THREE.FrontSide;
    melt.material.needsUpdate = true;
  }, [gl, section, plane, steelList, melt]);

  useEffect(() => {
    melt.uniforms.uGate.value.copy(GATE);
  }, [melt]);

  useEffect(
    () => () => {
      geo.dispose();
      melt.material.dispose();
      steelList.forEach((m) => m.dispose());
    },
    [geo, melt, steelList],
  );

  useFrame((state, dt) => {
    if (playing) {
      tRef.current = (tRef.current + dt / 11) % 1; // an 11 s replay of a 32 s cycle
    }
    const pose = poseAt(tRef.current);
    fillRef.current = pose.fill;
    coolRef.current = pose.coolFlow;

    melt.uniforms.uFront.value = pose.fill * MAX_FLOW * 1.02;
    melt.uniforms.uTemp.value = pose.temp;
    melt.uniforms.uFlow.value += ((flowPlot ? 1 : 0) - melt.uniforms.uFlow.value) * Math.min(1, dt * 6);

    if (movingHalf.current) movingHalf.current.position.z = pose.open * OPEN_AXIS_Z;
    if (ejectors.current) ejectors.current.position.y = mm(-pose.eject * 26);
    if (mouldings.current) {
      // the moulding rides the core until the pins let it go, then it drops away
      mouldings.current.position.z = pose.open * OPEN_AXIS_Z * pose.partOnCore;
      mouldings.current.position.y = mm(-pose.eject * 26) - mm((1 - pose.partOnCore) * 120);
      mouldings.current.visible = pose.partOnCore > 0.02;
    }

    if (state.clock.elapsedTime - lastTick.current > 0.1) {
      lastTick.current = state.clock.elapsedTime;
      onTick(tRef.current);
    }
  });

  const pillarPositions = useMemo(() => {
    const px = TOOL.bolster.w / 2 - TOOL.pillar.inset;
    const py = TOOL.bolster.h / 2 - TOOL.pillar.inset;
    return [[-px, -py], [px, -py], [px, py], [-px, py]] as Array<[number, number]>;
  }, []);

  return (
    <>
      <color attach="background" args={[BRAND.inkDeep]} />
      <fog attach="fog" args={[BRAND.inkDeep, mm(700), mm(2400)]} />
      <StudioEnvironment />
      <StudioLights shadows={!reduced} />

      {/* the tool is built extruding up the Y axis, then laid on its side so it
          opens toward the viewer the way a horizontal press actually does */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <group>
          <ToolHalf geo={geo} materials={materials} side="fixed" />
          <Cooling geo={geo} flow={coolRef} side="fixed" />
          <Feed geo={geo} fill={fillRef} />
          <mesh
            geometry={geo.locatingRing}
            material={materials.pillar}
            position={[0, mm(-(TOOL.insert.t + TOOL.bolster.t) - 8), 0]}
            scale={mm(1)}
          />
          {pillarPositions.map(([x, z]) => (
            <mesh
              key={`p${x}${z}`}
              geometry={geo.pillar}
              material={materials.pillar}
              position={[mm(x), mm(TOOL.openStroke / 2 - TOOL.insert.t), mm(z)]}
              scale={mm(1)}
              castShadow
            />
          ))}
        </group>

        <group ref={movingHalf}>
          <ToolHalf geo={geo} materials={materials} side="moving" />
          <Cooling geo={geo} flow={coolRef} side="moving" />
          <group ref={ejectors}>
            {CAVITY_X.flatMap((cx) =>
              [-1, 1].map((s) => (
                <mesh
                  key={`e${cx}${s}`}
                  geometry={geo.ejector}
                  material={materials.ejector}
                  position={[mm(cx + s * TOOL.part.w * 0.28), mm(TOOL.insert.t + 30), 0]}
                  scale={mm(1)}
                />
              )),
            )}
          </group>
        </group>

        <group ref={mouldings}>
          <Mouldings geo={geo} material={melt.material} />
        </group>
      </group>

      <Ground y={mm(-TOOL.bolster.h / 2 - 30)} scale={mm(900)} opacity={0.6} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        enableZoom={engaged}
        minDistance={mm(340)}
        maxDistance={mm(1200)}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 + 0.35}
        autoRotate={!reduced && !engaged}
        autoRotateSpeed={0.3}
        target={[0, 0, mm(TOOL.openStroke * 0.28)]}
      />
      <SimPost reduced={reduced} />
    </>
  );
};

/* ---------------------------------------------------------------------- UI */

export const MouldLab: React.FC = () => {
  const reduced = prefersReducedMotion();
  const [playing, setPlaying] = useState(!reduced);
  const [t, setT] = useState(0);
  const [section, setSection] = useState(false);
  const [flowPlot, setFlowPlot] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const tRef = useRef(0);

  useEffect(() => {
    if (!engaged) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEngaged(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engaged]);

  const pose = poseAt(t);
  const p = TOOL.process;
  const cycleSeconds = (t * p.cycleTime).toFixed(1);
  // the melt is at melt temperature at the gate and at mould temperature once
  // the cycle has taken the heat out
  const meltNow = Math.round(p.mouldTemp + (p.meltTemp - p.mouldTemp) * pose.temp);

  const scrub = (v: number) => {
    tRef.current = v;
    setT(v);
    setPlaying(false);
  };

  return (
    <div className="w-full h-full flex flex-col relative z-10 bg-ink-950/40">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-brand-900/40 bg-ink-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 shadow-[0_0_10px_var(--color-accent)]" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-brand-300 uppercase">Mould tool cycle</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-950/70 border border-brand-800/70 text-brand-200 font-mono">
                2 impressions · {TOOL.bolster.w} × {TOOL.bolster.h} mm
              </span>
            </div>
            <p className="text-[11.5px] text-fg-muted truncate">
              Two-plate tool, cold runner, edge-gated — design study for a {TOOL.part.w} × {TOOL.part.h} mm bezel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Chip icon={<Thermometer className="w-3.5 h-3.5 text-accent-lift" />} label="MELT" value={`${meltNow} °C`} />
          <Chip icon={<Waves className="w-3.5 h-3.5 text-brand-300" />} label="MOULD" value={`${p.mouldTemp} °C`} />
          <Chip icon={<Gauge className="w-3.5 h-3.5 text-fg-muted" />} label="CLAMP" value={`${p.clampForce} T`} className="hidden lg:flex" />
        </div>
      </header>

      <div
        className="relative w-full flex-grow cursor-grab active:cursor-grabbing"
        onPointerDown={() => setEngaged(true)}
      >
        <Canvas
          shadows={!reduced}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: 'high-performance', localClippingEnabled: true }}
          camera={{ position: [mm(340), mm(210), mm(540)], fov: 34, near: 0.05, far: mm(4000) }}
        >
          <Suspense fallback={null}>
            <Scene
              playing={playing}
              tRef={tRef}
              onTick={setT}
              section={section}
              flowPlot={flowPlot}
              reduced={reduced}
              engaged={engaged}
            />
          </Suspense>
        </Canvas>

        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setPlaying((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-ink-950/85 backdrop-blur border border-brand-900/60 text-[11px] font-mono text-fg hover:border-brand-600 transition-colors flex items-center gap-1.5"
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {playing ? 'Pause' : 'Run cycle'}
          </button>
          <Toggle on={section} onClick={() => setSection((v) => !v)} icon={<Scissors className="w-3 h-3" />}>
            Section
          </Toggle>
          <Toggle on={flowPlot} onClick={() => setFlowPlot((v) => !v)} icon={<Waves className="w-3 h-3" />}>
            Fill-time plot
          </Toggle>
        </div>

        <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-ink-950/85 backdrop-blur border border-brand-900/50 text-[10.5px] font-mono text-right">
          <div className="text-brand-200 font-bold tracking-[0.14em] uppercase">{pose.stage.label}</div>
          <div className="text-fg-dim tabular-nums">{cycleSeconds} s / {p.cycleTime} s</div>
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

        {flowPlot && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-950/85 backdrop-blur border border-brand-900/50">
            <span className="text-[9.5px] font-mono text-fg-dim">FILL TIME</span>
            <span
              className="h-2 w-28 rounded-full"
              style={{ background: 'linear-gradient(90deg,#0E2EC7 0%,#17A3DB 25%,#2EC76B 50%,#F2C71F 75%,#E01212 100%)' }}
            />
            <span className="text-[9.5px] font-mono text-fg-dim tabular-nums">0 – {p.fillTime} s</span>
          </div>
        )}
      </div>

      <div className="px-5 py-4 bg-ink-950/85 border-t border-brand-900/40 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {STAGES.map((s) => {
              const on = pose.stage.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrub(s.from + 0.001)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-[0.1em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                    on ? 'bg-brand-600 text-white' : 'bg-ink-900 text-fg-dim hover:text-fg hover:bg-ink-850'
                  }`}
                  style={{ flexGrow: (s.to - s.from) * 10 }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min={0}
            max={0.999}
            step={0.001}
            value={t}
            onChange={(e) => scrub(Number(e.target.value))}
            aria-label="Cycle position"
            className="w-full h-1.5 rounded-full appearance-none bg-ink-800 accent-brand-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          />
          <p className="text-[11.5px] text-fg-muted">{pose.stage.note}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <Stat label="MATERIAL" value={p.material} wide />
          <Stat label="SHOT" value={`${p.shotWeight} g`} />
          <Stat label="WALL" value={`${TOOL.part.wall} mm`} />
          <Stat label="FILL" value={`${p.fillTime} s`} />
          <Stat label="COOL" value={`${p.coolingTime} s`} />
          <Stat label="CYCLE" value={`${p.cycleTime} s`} />
          <Stat label="DRAFT" value={`${p.draft}°`} />
        </div>

        <p className="text-[11px] text-fg-dim leading-relaxed border-l-2 border-brand-800 pl-3">
          MKRD's scope is the tool: cavity and core design, feed and cooling layout, and the flow
          analysis that settles them before steel is cut. The press and the moulding run are the
          customer's. The numbers above are a design study for this bezel, not a machine specification.
        </p>
      </div>
    </div>
  );
};

const Toggle = ({
  on, onClick, icon, children,
}: { on: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    aria-pressed={on}
    className={`px-3 py-1.5 rounded-lg backdrop-blur border text-[11px] font-mono transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
      on
        ? 'bg-brand-950/85 border-brand-500 text-brand-100'
        : 'bg-ink-950/85 border-brand-900/60 text-fg-muted hover:text-fg hover:border-brand-700'
    }`}
  >
    {icon}
    {children}
  </button>
);

const Chip = ({ icon, label, value, className = '' }: { icon: React.ReactNode; label: string; value: string; className?: string }) => (
  <div className={`items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-950/70 border border-ink-700 flex ${className}`}>
    {icon}
    <span className="text-fg-dim">{label}</span>
    <span className="text-fg font-semibold tabular-nums">{value}</span>
  </div>
);

const Stat = ({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) => (
  <div className={`px-2.5 py-2 rounded-lg bg-ink-900/60 border border-ink-700 ${wide ? 'col-span-2 lg:col-span-1' : ''}`}>
    <div className="text-[9px] font-mono text-fg-dim tracking-[0.14em]">{label}</div>
    <div className="text-[12px] text-fg font-semibold tabular-nums truncate">{value}</div>
  </div>
);

export default MouldLab;
