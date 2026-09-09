import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sliders, RotateCw, Box, Move3d, Compass, Cpu, Layers } from 'lucide-react';

export const ThreeDRobotActuator: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [baseRotation, setBaseRotation] = useState<number>(35);
  const [armAngle, setArmAngle] = useState<number>(45);
  const [gripperClamp, setGripperClamp] = useState<number>(50);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'kinematics' | 'mould' | 'cmm'>('kinematics');

  const baseRotationRef = useRef(baseRotation);
  baseRotationRef.current = baseRotation;
  const armAngleRef = useRef(armAngle);
  armAngleRef.current = armAngle;
  const gripperClampRef = useRef(gripperClamp);
  gripperClampRef.current = gripperClamp;
  const isExplodedRef = useRef(isExploded);
  isExplodedRef.current = isExploded;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x090c10); // Removed to make transparent
    scene.fog = new THREE.FogExp2(0x090c10, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(5, 4.5, 6);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    cyanLight.position.set(5, 8, 5);
    scene.add(cyanLight);

    const blueLight = new THREE.DirectionalLight(0x3b82f6, 1.8);
    blueLight.position.set(-5, 4, -4);
    scene.add(blueLight);

    // Ground Platform with precision grid
    const floorGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.8,
      roughness: 0.3,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.1;
    scene.add(floorMesh);

    const grid = new THREE.GridHelper(7, 14, 0x0ea5e9, 0x1f2937);
    grid.position.y = 0.01;
    scene.add(grid);

    // Robot Structure (Hierarchical groups)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Robot Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.6, 24);
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const cyanAccentMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.5, roughness: 0.3, emissive: 0x0891b2, emissiveIntensity: 0.3 });

    const baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
    baseMesh.position.y = 0.3;
    baseGroup.add(baseMesh);

    // Swivel Turntable
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.y = 0.6;
    baseGroup.add(shoulderGroup);

    const shoulderJointGeo = new THREE.SphereGeometry(0.5, 20, 20);
    const shoulderJointMesh = new THREE.Mesh(shoulderJointGeo, cyanAccentMat);
    shoulderGroup.add(shoulderJointMesh);

    // Lower Arm Link
    const lowerArmGroup = new THREE.Group();
    shoulderGroup.add(lowerArmGroup);

    const lowerArmGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 16);
    const lowerArmMesh = new THREE.Mesh(lowerArmGeo, darkMetalMat);
    lowerArmMesh.position.y = 0.9;
    lowerArmGroup.add(lowerArmMesh);

    // Elbow Joint
    const elbowGroup = new THREE.Group();
    elbowGroup.position.y = 1.8;
    lowerArmGroup.add(elbowGroup);

    const elbowJointMesh = new THREE.Mesh(shoulderJointGeo, cyanAccentMat);
    elbowJointMesh.scale.set(0.8, 0.8, 0.8);
    elbowGroup.add(elbowJointMesh);

    // Forearm Link
    const forearmGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
    const forearmMesh = new THREE.Mesh(forearmGeo, chromeMat);
    forearmMesh.position.y = 0.75;
    elbowGroup.add(forearmMesh);

    // Wrist & Gripper Assembly
    const wristGroup = new THREE.Group();
    wristGroup.position.y = 1.5;
    elbowGroup.add(wristGroup);

    const wristGeo = new THREE.BoxGeometry(0.5, 0.3, 0.4);
    const wristMesh = new THREE.Mesh(wristGeo, darkMetalMat);
    wristGroup.add(wristMesh);

    // Dual Parallel Gripper Fingers
    const fingerGeo = new THREE.BoxGeometry(0.08, 0.5, 0.15);
    const leftFinger = new THREE.Mesh(fingerGeo, cyanAccentMat);
    const rightFinger = new THREE.Mesh(fingerGeo, cyanAccentMat);
    leftFinger.position.set(-0.2, 0.35, 0);
    rightFinger.position.set(0.2, 0.35, 0);
    wristGroup.add(leftFinger);
    wristGroup.add(rightFinger);

    // Target Injection Mould Core Cavity Part
    const mouldPartGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const mouldPart = new THREE.Mesh(mouldPartGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.15 }));
    mouldPart.position.set(0, 0.35, 0);
    wristGroup.add(mouldPart);

    // Mouse Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = { radius: 8, theta: 0.7, phi: 1.1 };

    const updateCamera = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi) + 1.2;
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1.5, 0);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));

      updateCamera();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Apply dynamic angles
      baseGroup.rotation.y = (baseRotationRef.current * Math.PI) / 180;
      lowerArmGroup.rotation.z = -(armAngleRef.current * Math.PI) / 180;
      elbowGroup.rotation.z = (armAngleRef.current * 1.4 * Math.PI) / 180;

      // Gripper clamp
      const clampOffset = (gripperClampRef.current / 100) * 0.15 + 0.08;
      leftFinger.position.x = -clampOffset;
      rightFinger.position.x = clampOffset;

      // Exploded view separation
      if (isExplodedRef.current) {
        forearmMesh.position.y = 1.3;
        wristGroup.position.y = 2.4;
      } else {
        forearmMesh.position.y = 0.75;
        wristGroup.position.y = 1.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((object: any) => {
        if (object.isMesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div id="robot-actuator-lab" className="w-full h-full flex flex-col relative z-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 uppercase">ROBOTIC ACTUATOR & TOOLING LAB</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono font-semibold">
                6-AXIS KINEMATICS
              </span>
            </div>
            <p className="text-[12px] text-slate-300">Automated Part Extraction & Mould Tooling Inspection</p>
          </div>
        </div>

        <button
          id="btn-toggle-explode"
          onClick={() => setIsExploded(!isExploded)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
            isExploded 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Move3d className="w-3.5 h-3.5" />
          <span>{isExploded ? 'Collapse View' : 'Exploded CAD View'}</span>
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full flex-grow cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="absolute inset-0" />

        {/* Real-time Telemetry Overlay */}
        <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Joint Kinematics</div>
          <div className="text-blue-400">J1 (BASE): {baseRotation}°</div>
          <div className="text-indigo-400">J2 (SHOULDER): {armAngle}°</div>
          <div className="text-emerald-400">J3 (GRIPPER): {gripperClamp}%</div>
          <div className="text-slate-400 text-[11px]">REPEATABILITY: ±0.015 mm</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-300 mb-1.5">
            <span>BASE ROTATION (J1):</span>
            <span className="text-blue-300 font-bold">{baseRotation}°</span>
          </div>
          <input
            type="range"
            min="-90"
            max="90"
            value={baseRotation}
            onChange={(e) => setBaseRotation(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1.5">
            <span>ARM EXTENSION (J2):</span>
            <span className="text-indigo-300 font-bold">{armAngle}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="75"
            value={armAngle}
            onChange={(e) => setArmAngle(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1.5">
            <span>GRIPPER CLAMP (J3):</span>
            <span className="text-emerald-300 font-bold">{gripperClamp}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={gripperClamp}
            onChange={(e) => setGripperClamp(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
