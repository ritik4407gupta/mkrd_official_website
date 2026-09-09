// @ts-nocheck
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ENTRANCE_STATIONS } from './InteractiveStationProps';

interface RoboticMachine3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onInspect?: (data: any) => void;

  showLabel?: boolean;
}

export const RoboticMachine3D: React.FC<RoboticMachine3DProps> = ({
  position = [3.6, -1.75, 4.6],
  rotation = [0, -Math.PI * 0.28, 0],
  scale = 1,
  onInspect,
  showLabel = false
}) => {
  const groupRef = useRef<THREE.Group>();
  const baseTurntableRef = useRef<THREE.Group>();
  const lowerArmRef = useRef<THREE.Group>();
  const upperArmRef = useRef<THREE.Group>();
  const wristRef = useRef<THREE.Group>();
  const toolLaserRef = useRef<THREE.PointLight>();

  const [hovered, setHovered] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const stationData = ENTRANCE_STATIONS.robot;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const pointer = state.pointer;

    if (!isCalibrating) {
      if (hovered) {
        // Articulated tracking of user cursor
        const targetRotY = pointer.x * 0.6;
        const targetArmAngle = 0.35 + pointer.y * 0.25;

        if (baseTurntableRef.current) {
          baseTurntableRef.current.rotation.y = THREE.MathUtils.lerp(
            baseTurntableRef.current.rotation.y,
            targetRotY,
            0.08
          );
        }
        if (lowerArmRef.current) {
          lowerArmRef.current.rotation.z = THREE.MathUtils.lerp(
            lowerArmRef.current.rotation.z,
            targetArmAngle,
            0.08
          );
        }
        if (upperArmRef.current) {
          upperArmRef.current.rotation.z = THREE.MathUtils.lerp(
            upperArmRef.current.rotation.z,
            -targetArmAngle * 1.5,
            0.08
          );
        }
        if (wristRef.current) {
          wristRef.current.rotation.x += delta * 3;
        }
      } else {
        // Idling organic mechanical rhythm
        if (baseTurntableRef.current) {
          baseTurntableRef.current.rotation.y = Math.sin(time * 0.6) * 0.25;
        }
        if (lowerArmRef.current) {
          lowerArmRef.current.rotation.z = 0.3 + Math.sin(time * 0.9) * 0.15;
        }
        if (upperArmRef.current) {
          upperArmRef.current.rotation.z = -0.5 + Math.cos(time * 0.9) * 0.2;
        }
      }
    }

    if (toolLaserRef.current) {
      toolLaserRef.current.intensity = hovered ? 2.8 : 1.2;
    }

    // Hover float
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
    setIsCalibrating(true);
    if (onInspect) onInspect(stationData);

    // Calibration sequence timeline
    const tl = gsap.timeline({
      onComplete: () => setIsCalibrating(false)
    });

    if (groupRef.current) {
      tl.to(groupRef.current.scale, {
        x: scale * 1.08,
        y: scale * 1.08,
        z: scale * 1.08,
        duration: 0.15,
        yoyo: true,
        repeat: 1
      });
    }

    if (baseTurntableRef.current) {
      tl.to(baseTurntableRef.current.rotation, {
        y: Math.PI * 0.5,
        duration: 0.4,
        ease: 'back.out(2)'
      }, 0);
      tl.to(baseTurntableRef.current.rotation, {
        y: -Math.PI * 0.3,
        duration: 0.4,
        ease: 'power2.inOut'
      }, 0.4);
      tl.to(baseTurntableRef.current.rotation, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      }, 0.8);
    }

    if (wristRef.current) {
      tl.to(wristRef.current.rotation, {
        z: Math.PI * 2,
        duration: 0.8,
        ease: 'power1.inOut'
      }, 0.1);
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
      {/* Heavy Heavy Industrial Pedestal */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.65, 0.75, 0.5, 24]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0f172a'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Cyber Pedestal Neon Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.85, 32]} />
        <meshBasicMaterial
          color={hovered ? '#f59e0b' : '#d97706'}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Industrial Hazard Stripe Ring */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.1, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Turntable Rotational Joint */}
      <group ref={baseTurntableRef} position={[0, 0.5, 0]}>
        {/* Swivel Base */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.45, 0.52, 0.24, 20]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Lower Shoulder Mount */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.36, 0.25, 0.36]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>

        {/* Lower Arm Segment (Pivot at shoulder) */}
        <group ref={lowerArmRef} position={[0, 0.4, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.18, 0.95, 0.2]} />
            <meshStandardMaterial
              color={hovered ? '#0284c7' : '#0369a1'}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Hydraulic Cylinder Accent */}
          <mesh position={[0.12, 0.35, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.6, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Elbow Joint (Pivot) */}
          <group ref={upperArmRef} position={[0, 0.9, 0]}>
            {/* Elbow Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.14, 0.24, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>

            {/* Forearm Body */}
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.15, 0.75, 0.16]} />
              <meshStandardMaterial
                color={hovered ? '#38bdf8' : '#0284c7'}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Wrist & End-Effector Tool Head */}
            <group ref={wristRef} position={[0, 0.75, 0]}>
              {/* Tool Flange */}
              <mesh>
                <cylinderGeometry args={[0.09, 0.09, 0.08, 16]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} />
              </mesh>

              {/* Optical Laser / Milling Spindle Head */}
              <mesh position={[0, 0.12, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.06, 0.16, 16]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#f97316"
                  emissiveIntensity={hovered ? 1.6 : 0.8}
                  metalness={0.9}
                />
              </mesh>

              {/* Laser Focal Point Light */}
              <pointLight
                ref={toolLaserRef}
                position={[0, 0.25, 0]}
                color="#f59e0b"
                intensity={hovered ? 2.8 : 1.2}
                distance={2.5}
              />
            </group>
          </group>
        </group>
      </group>

      {/* Floating 3D Tooltip & Telemetry HUD */}
      {showLabel && (<Html
        position={[0, 2.5, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none transition-all duration-300"
      >
        <div
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
            hovered ? 'scale-105 opacity-100' : 'scale-90 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-md text-white font-mono text-[11px] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-300">6-AXIS ACTUATOR</span>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[10px] text-emerald-400 font-semibold">±0.002mm ACCURACY</span>
          </div>

          {hovered && (
            <div className="p-3 rounded-xl bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-md text-left text-xs max-w-[250px] text-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="font-bold text-amber-400 text-xs mb-1 font-display">Robotic Automation Unit</div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Harmonic-drive robotic actuator for precision mould CNC milling and laser inspection. Click to test calibration!
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-amber-300">
                <span>JOINT: 6/6 ALIGNED</span>
                <span className="text-emerald-400">CLICK TO CALIBRATE</span>
              </div>
            </div>
          )}
        </div>
      </Html>)}
    </group>
  );
};
