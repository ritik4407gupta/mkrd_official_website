// @ts-nocheck
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ENTRANCE_STATIONS } from './InteractiveStationProps';

interface Printer3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onInspect?: (data: any) => void;

  showLabel?: boolean;
}

export const Printer3D: React.FC<Printer3DProps> = ({
  position = [4.6, -1.75, 2.8],
  rotation = [0, -Math.PI * 0.15, 0],
  scale = 1,
  onInspect,
  showLabel = false
}) => {
  const groupRef = useRef<THREE.Group>();
  const headRef = useRef<THREE.Group>();
  const gantryRef = useRef<THREE.Mesh>();
  const gearRef = useRef<THREE.Group>();
  const nozzleLightRef = useRef<THREE.PointLight>();
  const laserBeamRef = useRef<THREE.Mesh>();

  const [hovered, setHovered] = useState(false);
  const [activeCycle, setActiveCycle] = useState(false);
  const stationData = ENTRANCE_STATIONS.printer;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const speed = hovered ? 4.5 : 2.0;

    // Moving print head along circular/lissajous path
    const headX = Math.cos(time * speed) * 0.22;
    const headZ = Math.sin(time * speed * 1.3) * 0.18;
    const headY = 0.62 + Math.sin(time * 0.2) * 0.05;

    if (headRef.current) {
      headRef.current.position.x = headX;
      headRef.current.position.z = headZ;
      headRef.current.position.y = headY;
    }

    if (gantryRef.current) {
      gantryRef.current.position.y = headY + 0.12;
    }

    // Laser beam / nozzle light pulsing
    if (nozzleLightRef.current) {
      nozzleLightRef.current.position.set(headX, headY - 0.08, headZ);
      nozzleLightRef.current.intensity = hovered
        ? 3.0 + Math.sin(time * 12) * 0.8
        : 1.5 + Math.sin(time * 6) * 0.3;
    }

    if (laserBeamRef.current) {
      laserBeamRef.current.position.set(headX, headY - 0.04, headZ);
      laserBeamRef.current.rotation.y += delta * 4;
    }

    // Rotating 3D printed mechanical gear
    if (gearRef.current) {
      gearRef.current.rotation.y += delta * (hovered ? 1.8 : 0.6);
    }

    // Gentle hover float
    if (groupRef.current && hovered) {
      groupRef.current.position.y = position[1] + Math.sin(time * 3) * 0.03;
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.1);
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setActiveCycle(true);
    if (onInspect) onInspect(stationData);

    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: scale * 1.08,
        y: scale * 1.08,
        z: scale * 1.08,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }

    setTimeout(() => setActiveCycle(false), 1200);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Heavy Engineering Base Table */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.5, 1.0]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0f172a'}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Cyber Base Ring Light */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.85, 32]} />
        <meshBasicMaterial
          color={hovered ? '#06b6d4' : '#0284c7'}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Printer Chassis Bottom Tray */}
      <mesh position={[0, 0.53, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.85]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Frame Pillars (4 vertical rails) */}
      {[-0.46, 0.46].map((x, xi) =>
        [-0.38, 0.38].map((z, zi) => (
          <mesh key={`p-${xi}-${zi}`} position={[x, 1.15, z]}>
            <boxGeometry args={[0.05, 1.2, 0.05]} />
            <meshStandardMaterial
              color={hovered ? '#38bdf8' : '#334155'}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))
      )}

      {/* Top Crossbar Cap */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.85]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Acrylic Glass Enclosure Panels */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.96, 1.18, 0.8]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          transmission={0.85}
        />
      </mesh>

      {/* Heated Bed (Build Platform) */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.65, 0.04, 0.55]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Heated Bed Neon Grid Top Surface */}
      <mesh position={[0, 0.675, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.52]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={hovered ? 0.6 : 0.25}
          wireframe
        />
      </mesh>

      {/* X-Y Gantry Rail */}
      <mesh ref={gantryRef} position={[0, 0.95, 0]}>
        <boxGeometry args={[0.88, 0.04, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Printhead & Extruder Nozzle Group */}
      <group ref={headRef} position={[0, 0.8, 0]}>
        {/* Head Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.14]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Cooling Fan Shroud */}
        <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Glowing Extruder Tip (Cone) */}
        <mesh position={[0, -0.08, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.03, 0.06, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive={activeCycle ? '#38bdf8' : '#f97316'}
            emissiveIntensity={hovered ? 1.8 : 1.0}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Laser / Heat Point Light */}
      <pointLight
        ref={nozzleLightRef}
        position={[0, 0.72, 0]}
        color={activeCycle ? '#38bdf8' : '#f97316'}
        intensity={hovered ? 3.0 : 1.5}
        distance={2.5}
      />

      {/* 3D Printed Prototype (Planetary Ring Gear on Bed) */}
      <group ref={gearRef} position={[0, 0.74, 0]}>
        {/* Main Torus Gear */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.04, 12, 24]} />
          <meshStandardMaterial
            color={activeCycle ? '#38bdf8' : '#06b6d4'}
            emissive={activeCycle ? '#0284c7' : '#0891b2'}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Center Pinion */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Front Touchscreen Control Panel on Machine Base */}
      <mesh position={[0, 0.35, 0.51]}>
        <planeGeometry args={[0.35, 0.2]} />
        <meshStandardMaterial
          color="#0b1329"
          emissive="#0284c7"
          emissiveIntensity={hovered ? 0.7 : 0.35}
        />
      </mesh>

      {/* Floating 3D Tooltip & Telemetry HUD */}
      {showLabel && (<Html
        position={[0, 2.25, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none transition-all duration-300"
      >
        <div
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
            hovered ? 'scale-105 opacity-100' : 'scale-90 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md text-white font-mono text-[11px] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-cyan-300">ADDITIVE FAB PRO-X</span>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[10px] text-amber-400 font-semibold">245°C HOTBED</span>
          </div>

          {hovered && (
            <div className="p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-left text-xs max-w-[250px] text-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="font-bold text-cyan-400 text-xs mb-1 font-display">Industrial Additive Cell</div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Direct sintering of Carbon-PEEK & Titanium alloys with optical micron-level verification.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-cyan-300">
                <span>LAYER: 384/520</span>
                <span className="text-emerald-400">TOLERANCE: ±0.01mm</span>
              </div>
            </div>
          )}
        </div>
      </Html>)}
    </group>
  );
};
