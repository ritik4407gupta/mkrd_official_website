// @ts-nocheck
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ENTRANCE_STATIONS } from './InteractiveStationProps';

interface WorkstationPC3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onInspect?: (data: any) => void;

  showLabel?: boolean;
}

export const WorkstationPC3D: React.FC<WorkstationPC3DProps> = ({
  position = [-3.5, -1.75, 4.6],
  rotation = [0, Math.PI * 0.28, 0],
  scale = 1,
  onInspect,
  showLabel = false
}) => {
  const groupRef = useRef<THREE.Group>();
  const holoMeshRef = useRef<THREE.Group>();
  const pcRgbRef = useRef<THREE.PointLight>();
  const [hovered, setHovered] = useState(false);
  const [activeMode, setActiveMode] = useState<number>(0);
  const stationData = ENTRANCE_STATIONS.workstation;

  const simModes = ['FEA Stress Analysis', 'Aerodynamic Topology', 'Thermal Flow Distribution'];

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Floating 3D CAD hologram rotation
    if (holoMeshRef.current) {
      holoMeshRef.current.rotation.y += delta * (hovered ? 1.5 : 0.6);
      holoMeshRef.current.rotation.x = Math.sin(time * 0.8) * 0.15;
      holoMeshRef.current.position.y = 1.6 + Math.sin(time * 2) * 0.05;
    }

    // RGB Tower breathing light
    if (pcRgbRef.current) {
      pcRgbRef.current.intensity = hovered ? 2.5 : 1.2;
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
    setActiveMode((prev) => (prev + 1) % simModes.length);
    if (onInspect) onInspect(stationData);

    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: scale * 1.07,
        y: scale * 1.07,
        z: scale * 1.07,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }
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
      {/* Desk Base Surface */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0f172a'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Cyber Desk Underglow Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 0.95, 32]} />
        <meshBasicMaterial
          color={hovered ? '#818cf8' : '#3b82f6'}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Desk Metallic Legs */}
      {[-0.7, 0.7].map((x, xi) => (
        <mesh key={`leg-${xi}`} position={[x, 0.36, 0]}>
          <boxGeometry args={[0.08, 0.72, 0.7]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Left Curved Monitor */}
      <group position={[-0.38, 1.15, -0.05]} rotation={[0, 0.2, 0]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[0.7, 0.42, 0.03]} />
          <meshStandardMaterial color="#0b1120" metalness={0.9} />
        </mesh>
        {/* Screen Display */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.66, 0.38]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#1e3a8a"
            emissiveIntensity={hovered ? 1.0 : 0.6}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Right Curved Monitor */}
      <group position={[0.38, 1.15, -0.05]} rotation={[0, -0.2, 0]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[0.7, 0.42, 0.03]} />
          <meshStandardMaterial color="#0b1120" metalness={0.9} />
        </mesh>
        {/* Screen Display */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.66, 0.38]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={activeMode === 1 ? '#0891b2' : '#4338ca'}
            emissiveIntensity={hovered ? 1.0 : 0.6}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Dual Monitor Heavy Desk Arm Stand */}
      <mesh position={[0, 0.95, -0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      {/* High-End Tower PC Chassis */}
      <group position={[0.6, 1.02, 0.15]}>
        <mesh>
          <boxGeometry args={[0.22, 0.52, 0.44]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* RGB Tempered Glass Side Window */}
        <mesh position={[-0.115, 0, 0]}>
          <planeGeometry args={[0.4, 0.46]} />
          <meshPhysicalMaterial
            color="#818cf8"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>

        {/* Front Mesh Intake with RGB Fans */}
        <mesh position={[0, 0, 0.225]}>
          <planeGeometry args={[0.18, 0.46]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#38bdf8"
            emissiveIntensity={hovered ? 0.8 : 0.4}
            wireframe
          />
        </mesh>

        <pointLight
          ref={pcRgbRef}
          position={[-0.05, 0, 0]}
          color="#818cf8"
          intensity={hovered ? 2.5 : 1.2}
          distance={1.5}
        />
      </group>

      {/* RGB Mechanical Keyboard & Mouse */}
      <group position={[-0.05, 0.77, 0.18]}>
        {/* Keyboard Body */}
        <mesh>
          <boxGeometry args={[0.45, 0.015, 0.16]} />
          <meshStandardMaterial color="#0b1120" metalness={0.8} />
        </mesh>
        {/* Keycap Glow */}
        <mesh position={[0, 0.01, 0]}>
          <planeGeometry args={[0.42, 0.13]} />
          <meshStandardMaterial
            color="#818cf8"
            emissive="#6366f1"
            emissiveIntensity={hovered ? 0.7 : 0.3}
          />
        </mesh>

        {/* Precision Mouse */}
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.07, 0.02, 0.11]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
      </group>

      {/* Floating 3D Holographic CAD Wireframe Mesh */}
      <group ref={holoMeshRef} position={[0, 1.6, 0]}>
        <mesh>
          <octahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial
            color={activeMode === 0 ? '#38bdf8' : activeMode === 1 ? '#22d3ee' : '#a855f7'}
            emissive={activeMode === 0 ? '#0284c7' : activeMode === 1 ? '#0891b2' : '#7e22ce'}
            emissiveIntensity={hovered ? 1.4 : 0.8}
            wireframe
          />
        </mesh>
        {/* Outer Torus Orbit Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.26, 0.015, 12, 32]} />
          <meshBasicMaterial
            color="#818cf8"
            transparent
            opacity={hovered ? 0.9 : 0.4}
          />
        </mesh>
      </group>

      {/* Floating 3D Tooltip & Telemetry HUD */}
      {showLabel && (<Html
        position={[0, 2.3, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none transition-all duration-300"
      >
        <div
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
            hovered ? 'scale-105 opacity-100' : 'scale-90 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-md text-white font-mono text-[11px] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-bold text-indigo-300">CAD WORKSTATION</span>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[10px] text-cyan-300 font-semibold">{simModes[activeMode]}</span>
          </div>

          {hovered && (
            <div className="p-3 rounded-xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl backdrop-blur-md text-left text-xs max-w-[250px] text-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="font-bold text-indigo-400 text-xs mb-1 font-display">RTX Precision Terminal</div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Simulating parametric injection moulds and stress concentrations in real time. Click to toggle simulation layer!
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-indigo-300">
                <span>SIM: #{activeMode + 1}/3</span>
                <span className="text-emerald-400">CLICK TO CYCLE</span>
              </div>
            </div>
          )}
        </div>
      </Html>)}
    </group>
  );
};
