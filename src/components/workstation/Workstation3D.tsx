import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, ContactShadows, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, MousePointerClick } from 'lucide-react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { AmbientRoom } from './AmbientRoom';
import { GstBillingApp } from '../../software/GstBillingApp';
import { WarehouseApp } from '../../software/WarehouseApp';

/**
 * The engineering workstation.
 *
 * The monitor is not a texture or a video — the screen is the real React
 * application, genuinely clickable: change the buyer and the tax columns
 * recompute, edit a quantity and the totals move. Clicking the monitor dollies
 * the camera in until the screen fills the frame; stepping back returns.
 *
 * How the screen is mounted: the monitor always faces the camera square-on, so
 * there is never any perspective skew across the screen plane. That means the
 * app does not need a CSS3D layer at all — projecting the screen's two opposite
 * corners into viewport pixels each frame gives an exact rectangle, and the app
 * is laid out inside it as ordinary DOM. Cheaper than CSS3D, pixel-accurate,
 * and it keeps the app fully interactive and accessible.
 *
 * Lighting is a deliberate three-point rig plus the screen's own spill onto the
 * desk. There is no runtime HDRI fetch — everything is local.
 */

const SCREEN_W = 3.36;
const SCREEN_H = 2.1;
const APP_W = 1280; // the app's internal layout width, scaled to fit the rect

type AppId = 'gst' | 'warehouse';
export interface ScreenRect { left: number; top: number; width: number; height: number }

const SCREEN_Y = 1.3;
const SCREEN_Z = -0.582; // monitor group z + screen offset

// Desk framing: close enough that the monitor is the subject, high enough to
// read the desk surface and the moulded part sitting on it.
const CAM_ROOM = new THREE.Vector3(0, 1.52, 4.25);
const LOOK_ROOM = new THREE.Vector3(0, 1.16, -0.35);
const LOOK_SCREEN = new THREE.Vector3(0, SCREEN_Y, SCREEN_Z);

/**
 * How far back the camera must sit for the screen to fill a given fraction of
 * the frame. Solved from the camera's own fov and aspect rather than hard-coded,
 * so the framing holds whatever size the container ends up — and this panel is
 * inside a scroll-driven box that changes size as you scroll past it.
 */
const fitDistance = (camera: THREE.PerspectiveCamera, fillW = 0.84, fillH = 0.84) => {
  const half = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const byHeight = SCREEN_H / fillH / (2 * half);
  const byWidth = SCREEN_W / fillW / (2 * half * camera.aspect);
  return Math.max(byHeight, byWidth);
};

const CameraRig: React.FC<{ zoomed: boolean }> = ({ zoomed }) => {
  const look = useRef(LOOK_ROOM.clone());
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    if (zoomed) target.set(0, SCREEN_Y, SCREEN_Z + fitDistance(cam));
    else target.copy(CAM_ROOM);

    // Frame-rate independent easing — a camera on rails, not a UI spring.
    const k = 1 - Math.pow(0.0025, Math.min(delta, 0.05));
    cam.position.lerp(target, k);
    look.current.lerp(zoomed ? LOOK_SCREEN : LOOK_ROOM, k);
    cam.lookAt(look.current);
  });
  return null;
};

/** Reports the monitor screen's exact pixel rectangle in the viewport. */
const ScreenProjector: React.FC<{ target: React.RefObject<THREE.Mesh | null>; onRect: (r: ScreenRect) => void }> = ({ target, onRect }) => {
  const tl = useMemo(() => new THREE.Vector3(), []);
  const br = useMemo(() => new THREE.Vector3(), []);
  const last = useRef<ScreenRect>({ left: 0, top: 0, width: 0, height: 0 });

  useFrame(({ camera, gl }) => {
    const mesh = target.current;
    if (!mesh) return;
    const el = gl.domElement;
    const size = { width: el.clientWidth, height: el.clientHeight };
    if (!size.width || !size.height) return;

    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    if (Math.abs(cam.aspect - aspect) > 0.001) {
      cam.aspect = aspect;
      cam.updateProjectionMatrix();
    }
    tl.set(-SCREEN_W / 2, SCREEN_H / 2, 0).applyMatrix4(mesh.matrixWorld).project(camera);
    br.set(SCREEN_W / 2, -SCREEN_H / 2, 0).applyMatrix4(mesh.matrixWorld).project(camera);

    const x1 = (tl.x * 0.5 + 0.5) * size.width;
    const y1 = (-tl.y * 0.5 + 0.5) * size.height;
    const x2 = (br.x * 0.5 + 0.5) * size.width;
    const y2 = (-br.y * 0.5 + 0.5) * size.height;
    const r = { left: x1, top: y1, width: x2 - x1, height: y2 - y1 };

    const p = last.current;
    if (Math.abs(p.left - r.left) > 0.4 || Math.abs(p.top - r.top) > 0.4 ||
        Math.abs(p.width - r.width) > 0.4 || Math.abs(p.height - r.height) > 0.4) {
      last.current = r;
      onRect(r);
    }
  });
  return null;
};

const Desk = () => (
  <group>
    <RoundedBox args={[7.2, 0.11, 3.1]} radius={0.03} smoothness={3} position={[0, 0.52, -0.15]} receiveShadow castShadow>
      <meshStandardMaterial color="#1B1F42" roughness={0.55} metalness={0.22} />
    </RoundedBox>
    {[-2.9, 2.9].map((x) => (
      <mesh key={x} position={[x, 0.24, -0.15]} receiveShadow>
        <boxGeometry args={[0.12, 0.46, 2.6]} />
        <meshStandardMaterial color="#141733" roughness={0.45} metalness={0.4} />
      </mesh>
    ))}
    {/* a moulded part on the desk — the thing the software is billing for */}
    <mesh position={[2.05, 0.655, 0.62]} rotation={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[0.42, 0.16, 0.3]} />
      <meshStandardMaterial color="#2E22E6" roughness={0.34} metalness={0.55} />
    </mesh>
    <mesh position={[2.05, 0.775, 0.62]} rotation={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.055, 0.09, 24]} />
      <meshStandardMaterial color="#E20207" roughness={0.3} metalness={0.5} />
    </mesh>
  </group>
);

const Keyboard = () => (
  <group position={[0, 0.585, 1.0]}>
    <RoundedBox args={[1.86, 0.045, 0.6]} radius={0.018} smoothness={3} castShadow>
      <meshStandardMaterial color="#222750" roughness={0.5} metalness={0.34} />
    </RoundedBox>
    <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.74, 0.5]} />
      <meshStandardMaterial color="#12152F" roughness={0.8} />
    </mesh>
    <group position={[1.42, 0, 0.04]}>
      <RoundedBox args={[0.24, 0.055, 0.38]} radius={0.026} smoothness={3} castShadow>
        <meshStandardMaterial color="#222750" roughness={0.46} metalness={0.34} />
      </RoundedBox>
    </group>
  </group>
);

const Monitor: React.FC<{
  zoomed: boolean;
  onEnter: () => void;
  onRect: (r: ScreenRect) => void;
}> = ({ zoomed, onEnter, onRect }) => {
  const [hovered, setHovered] = useState(false);
  const screenRef = useRef<THREE.Mesh>(null);
  useCursor(hovered && !zoomed);

  return (
    <group position={[0, 1.3, -0.62]}>
      <mesh position={[0, -0.62, 0.06]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.5, 20]} />
        <meshStandardMaterial color="#252A57" roughness={0.36} metalness={0.62} />
      </mesh>
      <mesh position={[0, -0.855, 0.16]} castShadow receiveShadow>
        <cylinderGeometry args={[0.44, 0.46, 0.035, 36]} />
        <meshStandardMaterial color="#252A57" roughness={0.32} metalness={0.66} />
      </mesh>

      <RoundedBox args={[SCREEN_W + 0.13, SCREEN_H + 0.13, 0.07]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color="#232853" roughness={0.34} metalness={0.62} />
      </RoundedBox>

      {/* The screen surface. The app is drawn over this rectangle in DOM; this
          mesh is what the pointer actually hits when the camera is out. */}
      <mesh
        ref={screenRef}
        position={[0, 0, 0.038]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!zoomed) onEnter();
        }}
      >
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial color={hovered && !zoomed ? '#151A46' : '#0D1030'} toneMapped={false} />
      </mesh>

      {/* status strip on the lower bezel — the brand's red, at rest */}
      <mesh position={[0, -(SCREEN_H / 2) - 0.048, 0.04]}>
        <planeGeometry args={[0.34, 0.018]} />
        <meshBasicMaterial color="#E20207" toneMapped={false} />
      </mesh>

      {/* the screen lights the desk, as a screen would */}
      <pointLight position={[0, 0, 0.85]} intensity={2.2} distance={4.2} decay={2} color="#C8CBEE" />

      <ScreenProjector target={screenRef} onRect={onRect} />
    </group>
  );
};

const Scene: React.FC<{ zoomed: boolean; onEnter: () => void; onRect: (r: ScreenRect) => void }> = ({ zoomed, onEnter, onRect }) => (
  <>
    <color attach="background" args={['#05061A']} />
    <fogExp2 attach="fog" args={['#05061A', 0.036]} />

    {/* three-point rig: cool key front-left, brand rim behind right, low fill */}
    <ambientLight intensity={0.62} color="#9AA2E0" />
    <directionalLight
      position={[-4.2, 4.6, 3.4]} intensity={2.35} color="#E4E8FF"
      castShadow shadow-mapSize={[1024, 1024]} shadow-camera-near={1} shadow-camera-far={18}
    />
    {/* brand rim from behind right, so the monitor and desk edges separate */}
    <directionalLight position={[5.2, 2.8, -3.6]} intensity={2.1} color="#5B4DF5" />
    {/* front fill — without this the near edge of the desk goes to black */}
    <directionalLight position={[0, 1.8, 6]} intensity={0.75} color="#B9BEEC" />
    <pointLight position={[0, 0.95, 2.4]} intensity={0.8} distance={8} color="#7C71FF" />
    {/* one red note — an accent, not a wash */}
    <pointLight position={[-3.9, 1.35, -2.1]} intensity={0.5} distance={4} color="#E20207" />

    <Desk />
    <Keyboard />
    <Monitor zoomed={zoomed} onEnter={onEnter} onRect={onRect} />

    <ContactShadows position={[0, 0.578, 0]} opacity={0.55} scale={9} blur={2.4} far={2.2} resolution={512} color="#000010" />

    {/* There is deliberately no lit ground plane here any more. A standard
        material floor sitting a millimetre under the shader floor z-fought with
        it at grazing angles and washed the far half of the room lavender, and
        it was never carrying the desk's shadow anyway — ContactShadows above
        does that. The floor is AmbientRoom's, and only AmbientRoom's. */}

    {/* The room: pulsing floor grid, a breathing bank of light bars behind the
        desk, and dust in the key light — all of which fall away as the camera
        commits to the screen. */}
    <AmbientRoom zoomed={zoomed} />

    <CameraRig zoomed={zoomed} />

    {/* Bloom on the screen glow and the red status strip; a soft vignette so
        the desk falls away at the frame edge instead of ending square. */}
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.32} mipmapBlur radius={0.62} />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  </>
);

export const Workstation3D: React.FC = () => {
  const [zoomed, setZoomed] = useState(false);
  const [app, setApp] = useState<AppId>('gst');
  const [rect, setRect] = useState<ScreenRect>({ left: 0, top: 0, width: 0, height: 0 });
  const onRect = useCallback((r: ScreenRect) => setRect(r), []);

  const scale = rect.width > 0 ? rect.width / APP_W : 0;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Canvas
        shadows
        resize={{ debounce: 0, scroll: true }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.44, 5.2], fov: 42, near: 0.1, far: 60 }}
      >
        <Scene zoomed={zoomed} onEnter={() => setZoomed(true)} onRect={onRect} />
      </Canvas>

      {/* The application, laid over the monitor's projected rectangle. */}
      {scale > 0 && (
        <div
          data-screen-overlay
          className="absolute z-10 overflow-hidden"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            // Clicks reach the app only once the camera has arrived, so a click
            // meant to zoom in never lands on a control inside the app.
            pointerEvents: zoomed ? 'auto' : 'none',
            boxShadow: '0 0 60px rgba(124,113,255,0.18)',
          }}
        >
          <div
            style={{
              width: APP_W,
              height: APP_W * (SCREEN_H / SCREEN_W),
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {app === 'gst' ? <GstBillingApp /> : <WarehouseApp />}
          </div>
          {!zoomed && <div className="absolute inset-0 bg-ink-950/35" />}
        </div>
      )}

      {!zoomed && (
        <button
          type="button"
          aria-label="Use the workstation"
          onClick={() => setZoomed(true)}
          className="absolute inset-0 z-20 cursor-pointer bg-transparent"
        />
      )}

      {!zoomed && rect.width > 0 && (
        <div
          className="absolute z-30 flex justify-center pointer-events-none"
          style={{ left: rect.left, top: rect.top + rect.height + 14, width: rect.width }}
        >
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-900/90 border border-brand-600/50 backdrop-blur-sm whitespace-nowrap hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-400 transition-colors">
            <MousePointerClick className="w-3 h-3 text-brand-400" />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-brand-200">
              Click the screen to use it
            </span>
          </button>
        </div>
      )}

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-40 flex items-center gap-1 p-1 rounded-xl bg-ink-900/85 border border-ink-700 backdrop-blur-md">
        {([['gst', 'GST Billing Suite'], ['warehouse', 'Warehouse Manager']] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setApp(id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-[0.14em] transition-colors ${
              app === id ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {zoomed && (
        <button
          type="button"
          onClick={() => setZoomed(false)}
          className="absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900/85 border border-ink-700 backdrop-blur-md text-[10px] font-mono uppercase tracking-[0.16em] text-brand-200 hover:text-white hover:border-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Step back
        </button>
      )}
    </div>
  );
};

export default Workstation3D;
