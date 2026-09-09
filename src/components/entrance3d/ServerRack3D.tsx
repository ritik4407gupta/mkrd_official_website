// @ts-nocheck
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ENTRANCE_STATIONS } from './InteractiveStationProps';

interface ServerRack3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onInspect?: (data: any) => void;

  showLabel?: boolean;
}

export const ServerRack3D: React.FC<ServerRack3DProps> = ({
  position = [-4.6, -1.75, 2.8],
  rotation = [0, Math.PI * 0.15, 0],
  scale = 1,
  onInspect,
  showLabel = false
}) => {
  const groupRef = useRef<THREE.Group>();
  const [hovered, setHovered] = useState(false);
  const [activePulse, setActivePulse] = useState(false);
  const fanRef1 = useRef<THREE.Mesh>();
  const fanRef2 = useRef<THREE.Mesh>();
  const glowLightRef = useRef<THREE.PointLight>();
  const bladeLedsRef = useRef<THREE.Mesh[]>([]);

  const stationData = ENTRANCE_STATIONS.server;

  const numBlades = 7;
  const blades = useMemo(() => Array.from({ length: numBlades }, (_, i) => i), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Fans rotation
    const fanSpeed = hovered ? 22 : 8;
    if (fanRef1.current) fanRef1.current.rotation.z += delta * fanSpeed;
    if (fanRef2.current) fanRef2.current.rotation.z += delta * fanSpeed;

    // Subtle breathing pulse for glow light
    if (glowLightRef.current) {
      glowLightRef.current.intensity = hovered
        ? 2.5 + Math.sin(time * 6) * 0.5
        : 1.0 + Math.sin(time * 2) * 0.2;
    }

    // Subtle hovering floating effect
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
    setActivePulse(true);
    if (onInspect) onInspect(stationData);

    // Pulse animation
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: scale * 1.06,
        y: scale * 1.06,
        z: scale * 1.06,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }

    setTimeout(() => setActivePulse(false), 1200);
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
      {/* Base Pedestal with Cyber Grid Ring */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.7, 0.78, 0.1, 16]} />
        <meshStandardMaterial
          color={hovered ? '#0369a1' : '#0f172a'}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Floor Neon Accent Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.85, 32]} />
        <meshBasicMaterial
          color={hovered ? '#38bdf8' : '#0284c7'}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Main Server Cabinet Chassis */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.9, 2.3, 0.7]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0b1120'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Cabinet Frame Corner Pillars */}
      {[-0.43, 0.43].map((x, xi) =>
        [-0.33, 0.33].map((z, zi) => (
          <mesh key={`pillar-${xi}-${zi}`} position={[x, 1.25, z]}>
            <boxGeometry args={[0.06, 2.32, 0.06]} />
            <meshStandardMaterial color={hovered ? '#38bdf8' : '#1e3a8a'} metalness={0.9} roughness={0.1} />
          </mesh>
        ))
      )}

      {/* Rack Server Blades & Activity LEDs */}
      {blades.map((i) => {
        const bladeY = 0.35 + i * 0.28;
        return (
          <group key={`blade-${i}`} position={[0, bladeY, 0.02]}>
            {/* Blade Faceplate */}
            <mesh position={[0, 0, 0.28]}>
              <boxGeometry args={[0.76, 0.22, 0.12]} />
              <meshStandardMaterial
                color="#0f172a"
                metalness={0.7}
                roughness={0.4}
              />
            </mesh>

            {/* Vent slots / blade pattern */}
            <mesh position={[-0.1, 0, 0.35]}>
              <boxGeometry args={[0.42, 0.14, 0.01]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Status Indicator LED 1 (Green/Cyan online) */}
            <mesh position={[0.24, 0.04, 0.35]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color={activePulse ? '#38bdf8' : '#22c55e'} />
            </mesh>

            {/* Status Indicator LED 2 (Activity blinker) */}
            <mesh position={[0.3, 0.04, 0.35]}>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#38bdf8' : '#f59e0b'} />
            </mesh>

            {/* Ethernet Port cluster */}
            <mesh position={[0.26, -0.04, 0.35]}>
              <boxGeometry args={[0.1, 0.04, 0.01]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Top Exhaust Fans Shroud */}
      <group position={[0, 2.38, 0]}>
        <mesh position={[-0.22, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh ref={fanRef1} position={[-0.22, 0.03, 0]}>
          <boxGeometry args={[0.26, 0.01, 0.04]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        <mesh position={[0.22, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh ref={fanRef2} position={[0.22, 0.03, 0]}>
          <boxGeometry args={[0.26, 0.01, 0.04]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* Glass Front Door with Subtle Reflectivity */}
      <mesh position={[0, 1.25, 0.36]}>
        <boxGeometry args={[0.82, 2.22, 0.02]} />
        <meshPhysicalMaterial
          color={hovered ? '#38bdf8' : '#0284c7'}
          transparent
          opacity={hovered ? 0.35 : 0.2}
          roughness={0.1}
          metalness={0.2}
          transmission={0.8}
        />
      </mesh>

      {/* Door Handle */}
      <mesh position={[0.34, 1.25, 0.39]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Internal Rack Glow Light */}
      <pointLight
        ref={glowLightRef}
        position={[0, 1.3, 0.2]}
        color={hovered ? '#38bdf8' : '#0284c7'}
        intensity={hovered ? 2.5 : 1.2}
        distance={3.5}
      />

      {/* Floating 3D Tooltip / Holographic UI Card on Hover */}
      {showLabel && (<Html
        position={[0, 2.7, 0]}
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
            <span className="font-bold text-cyan-300">CLOUD NODE 01</span>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[10px] text-emerald-400 font-semibold">100Gbps FIBER</span>
          </div>

          {hovered && (
            <div className="p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-left text-xs max-w-[240px] text-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="font-bold text-cyan-400 text-xs mb-1 font-display">MKRD Enterprise Node</div>
              <p className="text-[11px] text-slate-300 leading-snug">
                128-core simulation cluster powering real-time structural finite element analysis.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-cyan-300">
                <span>LOAD: 42%</span>
                <span className="text-emerald-400">STATUS: OPTIMAL</span>
              </div>
            </div>
          )}
        </div>
      </Html>)}
    </group>
  );
};
