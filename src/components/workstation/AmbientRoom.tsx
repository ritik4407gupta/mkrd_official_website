import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * The room the workstation sits in.
 *
 * The desk used to stand on a flat plane in front of a flat colour, which read
 * as a product shot rather than a place — and it never moved, so the whole
 * panel was static until you clicked the screen. This gives the backdrop its
 * own life: the floor carries a grid with a pulse running out through it, a
 * bank of light bars behind the desk breathes on a slow wave, and dust drifts
 * through the key light.
 *
 * All three share one idea about focus. `focus` goes 0 → 1 as the camera dives
 * into the monitor; everything here fades down and slows as it rises, so the
 * room falls away and the application becomes the only lit thing in the frame.
 * The transition itself is not a cut — the value is eased every frame, and the
 * pulse briefly accelerates as it goes, so entering the screen feels like a
 * machine handing over rather than a state change.
 *
 * Cost: three draw calls, no textures, no per-frame CPU work beyond writing a
 * handful of uniforms. Everything that varies per instance or per particle is
 * an attribute read in the shader.
 */

const BAR_COUNT = 38;
const MOTE_COUNT = 420;

/** Eased focus, shared by every layer so they move as one. */
const useFocus = (zoomed: boolean) => {
  const focus = useRef(0);
  const velocity = useRef(0);
  useFrame((_, delta) => {
    const target = zoomed ? 1 : 0;
    const k = 1 - Math.pow(0.012, Math.min(delta, 0.05));
    const before = focus.current;
    focus.current += (target - before) * k;
    // how fast we are travelling, normalised — the layers use it to surge
    velocity.current = Math.min(1, Math.abs(focus.current - before) / Math.max(delta, 1e-4) / 1.6);
  });
  return { focus, velocity };
};

/* ───────────────────────────────────────────────────────────────── floor ──── */

const floorVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  void main() {
    vUv = uv;
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const floorFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uFocus;
  uniform float uSurge;
  uniform vec3  uBase;
  uniform vec3  uLine;
  uniform vec3  uPulse;
  varying vec3 vLocal;

  // One anti-aliased grid line per axis, using the screen-space derivative so
  // the lines stay one pixel wide at every distance instead of aliasing into
  // moire the way a plain step() would.
  //
  // The second term is the one that matters on a floor. At a grazing angle the
  // derivative grows without bound, the division drives the numerator to zero,
  // and every distant pixel reports itself as a line — the far half of the
  // floor turns into a solid sheet. Fading the line out as its own footprint
  // approaches a whole cell keeps the grid a grid all the way to the horizon.
  float grid(vec2 p, float scale) {
    vec2 g = p * scale;
    vec2 w = fwidth(g);
    vec2 c = abs(fract(g - 0.5) - 0.5) / max(w, vec2(1e-5));
    float line = 1.0 - min(min(c.x, c.y), 1.0);
    float footprint = max(w.x, w.y);
    return line * (1.0 - smoothstep(0.35, 0.9, footprint));
  }

  void main() {
    vec2 p = vLocal.xy;
    float r = length(p);

    float fine   = grid(p, 0.5)  * 0.35;
    float coarse = grid(p, 0.125) * 0.8;
    float lines  = max(fine, coarse);

    // a ring travelling outward from under the desk, on a long period
    float speed = 1.9 + uSurge * 5.0;
    float wave  = fract(r * 0.055 - uTime * 0.055 * speed);
    float ring  = smoothstep(0.0, 0.06, wave) * smoothstep(0.22, 0.06, wave);

    // everything falls off with distance so the floor ends in fog, not an edge
    float fall = smoothstep(13.0, 1.0, r);

    vec3 col = uBase;
    col += uLine  * lines * 0.34 * fall;
    col += uPulse * ring * lines * 1.15 * fall;
    col += uPulse * ring * 0.022 * fall;

    // fade into the same colour the scene fog uses, so the floor ends in haze
    col = mix(vec3(0.0196, 0.0235, 0.1019), col, fall);

    // the room dims as the camera commits to the screen
    col *= mix(1.0, 0.28, uFocus);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const PulseFloor: React.FC<{ zoomed: boolean }> = ({ zoomed }) => {
  const { focus, velocity } = useFocus(zoomed);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFocus: { value: 0 },
      uSurge: { value: 0 },
      uBase: { value: new THREE.Color('#080A1E') },
      uLine: { value: new THREE.Color('#2A2F6B') },
      uPulse: { value: new THREE.Color('#7C71FF') },
    }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uFocus.value = focus.current;
    uniforms.uSurge.value = velocity.current;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      {/* No `fog` here on purpose: a raw ShaderMaterial with fog enabled makes
          the renderer write three's own fog uniforms into a uniforms object
          that does not declare them, which throws on the first frame and takes
          the whole canvas down. The distance falloff is in the shader instead. */}
      <shaderMaterial
        vertexShader={floorVertex}
        fragmentShader={floorFragment}
        uniforms={uniforms}
      />
    </mesh>
  );
};

/* ────────────────────────────────────────────────────────────── light bars ──── */

const barVertex = /* glsl */ `
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uFocus;
  uniform float uSurge;
  varying float vGlow;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    // a slow wave down the bank, plus each bar's own rhythm
    float wave = sin(uTime * 0.34 * (1.0 + uSurge * 2.0) + aPhase) * 0.5 + 0.5;
    float own  = sin(uTime * aSpeed + aPhase * 2.7) * 0.5 + 0.5;
    vGlow = mix(0.04, 0.62, wave * 0.65 + own * 0.35) * (1.0 - uFocus * 0.88);

    // the bar breathes very slightly in height as it brightens
    vec3 pos = position;
    pos.y *= 0.85 + vGlow * 0.3;

    vec4 mv = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const barFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uCool;
  uniform vec3 uWarm;
  varying float vGlow;
  varying vec2 vUv;

  void main() {
    // soft at both ends so a bar reads as light rather than a painted strip
    float ends = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
    vec3 col = mix(uCool, uWarm, vGlow) * vGlow * ends;
    gl_FragColor = vec4(col, ends * (0.06 + vGlow * 0.7));
    #include <colorspace_fragment>
  }
`;

const LightBars: React.FC<{ zoomed: boolean }> = ({ zoomed }) => {
  const { focus, velocity } = useFocus(zoomed);
  const mesh = useRef<THREE.InstancedMesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFocus: { value: 0 },
      uSurge: { value: 0 },
      uCool: { value: new THREE.Color('#1B2160') },
      uWarm: { value: new THREE.Color('#8B7DFF') },
    }),
    [],
  );

  // Position each bar once. Two ranks at different depths give the back wall
  // some thickness; the gap in the middle is where the monitor sits.
  const { matrices, phases, speeds } = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    const ph = new Float32Array(BAR_COUNT);
    const sp = new Float32Array(BAR_COUNT);
    const tmp = new THREE.Matrix4();
    for (let i = 0; i < BAR_COUNT; i++) {
      const rank = i % 2;
      const t = Math.floor(i / 2) / (BAR_COUNT / 2 - 1); // 0..1 across the wall
      const x = (t - 0.5) * 17 + (rank ? 0.55 : 0);
      const z = -12.5 - rank * 4.2 - Math.sin(t * 9.0) * 1.1;
      const h = 1.9 + Math.abs(Math.sin(t * 14.3 + rank)) * 2.9;
      tmp.makeTranslation(x, h / 2, z);
      tmp.scale(new THREE.Vector3(1, h, 1));
      m.push(tmp.clone());
      ph[i] = t * 7.0 + rank * 1.7;
      sp[i] = 0.5 + ((i * 37) % 11) / 11;
    }
    return { matrices: m, phases: ph, speeds: sp };
  }, []);

  React.useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    matrices.forEach((mat, i) => inst.setMatrixAt(i, mat));
    inst.instanceMatrix.needsUpdate = true;
    inst.geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    inst.geometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
  }, [matrices, phases, speeds]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uFocus.value = focus.current;
    uniforms.uSurge.value = velocity.current;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined as any, undefined as any, BAR_COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.16, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={barVertex}
        fragmentShader={barFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

/* ───────────────────────────────────────────────────────────────── motes ──── */

const moteVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uFocus;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // drift up and wander, wrapping back to the floor at the top
    float rise = fract((uTime * 0.016 + aSeed) * (0.6 + aSeed * 0.8));
    p.y = mix(0.15, 5.4, rise);
    p.x += sin(uTime * 0.14 + aSeed * 31.0) * 0.5;
    p.z += cos(uTime * 0.11 + aSeed * 17.0) * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // fade in off the floor and out at the ceiling, and clear out on focus
    vAlpha = smoothstep(0.0, 0.2, rise) * smoothstep(1.0, 0.68, rise) * (1.0 - uFocus);
    gl_PointSize = (5.5 + aSeed * 7.0) * uPixelRatio / max(-mv.z, 0.6);
  }
`;

const moteFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * core, core * core * vAlpha * 0.5);
    #include <colorspace_fragment>
  }
`;

const Motes: React.FC<{ zoomed: boolean }> = ({ zoomed }) => {
  const { focus } = useFocus(zoomed);

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(MOTE_COUNT * 3);
    const sd = new Float32Array(MOTE_COUNT);
    for (let i = 0; i < MOTE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 17;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = -10 + Math.random() * 13;
      sd[i] = Math.random();
    }
    return { positions: pos, seeds: sd };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFocus: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      uColor: { value: new THREE.Color('#A9B0F5') },
    }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uFocus.value = focus.current;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={moteVertex}
        fragmentShader={moteFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

/* ──────────────────────────────────────────────────────────────── export ──── */

export const AmbientRoom: React.FC<{ zoomed: boolean }> = ({ zoomed }) => (
  <>
    <PulseFloor zoomed={zoomed} />
    <LightBars zoomed={zoomed} />
    <Motes zoomed={zoomed} />
  </>
);
