import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCw, Layers, Eye, Zap, Flame, Thermometer, ShieldCheck, Download } from 'lucide-react';
import { MATERIALS_DB } from '../data/mkrdData';

export const ThreeDPrinterCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentLayer, setCurrentLayer] = useState<number>(240);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('carbon-peek');
  const [printSpeed, setPrintSpeed] = useState<number>(120);
  const [viewAngle, setViewAngle] = useState<'iso' | 'top' | 'front'>('iso');

  const maxLayers = 450;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const currentLayerRef = useRef(currentLayer);
  currentLayerRef.current = currentLayer;
  const isWireframeRef = useRef(isWireframe);
  isWireframeRef.current = isWireframe;
  const selectedMaterialRef = useRef(selectedMaterial);
  selectedMaterialRef.current = selectedMaterial;

  const currentMatObj = MATERIALS_DB.find(m => m.id === selectedMaterial) || MATERIALS_DB[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x0a0d12); // Removed to make transparent
    scene.fog = new THREE.FogExp2(0x0a0d12, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(6, 6, 8);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    keyLight.position.set(8, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    fillLight.position.set(-8, 5, -6);
    scene.add(fillLight);

    // Hot nozzle glow pointlight
    const nozzleLight = new THREE.PointLight(0xf97316, 2.5, 5);
    nozzleLight.position.set(0, 2, 0);
    scene.add(nozzleLight);

    // Build Plate / Heated Bed
    const bedGeo = new THREE.BoxGeometry(6, 0.2, 6);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.y = -0.1;
    bedMesh.receiveShadow = true;
    scene.add(bedMesh);

    // Build Plate Grid
    const gridHelper = new THREE.GridHelper(6, 20, 0x0ea5e9, 0x334155);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Frame Pillars & Rails (Gantry System)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 6, 16);
    
    const p1 = new THREE.Mesh(pillarGeo, frameMat);
    p1.position.set(-2.8, 3, -2.8);
    scene.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, frameMat);
    p2.position.set(2.8, 3, -2.8);
    scene.add(p2);

    // Top crossbar
    const topBarGeo = new THREE.BoxGeometry(5.8, 0.15, 0.2);
    const topBar = new THREE.Mesh(topBarGeo, frameMat);
    topBar.position.set(0, 5.9, -2.8);
    scene.add(topBar);

    // X-Axis Gantry Rail
    const gantryGeo = new THREE.BoxGeometry(5.8, 0.18, 0.3);
    const gantry = new THREE.Mesh(gantryGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.15 }));
    gantry.position.set(0, 2.5, 0);
    scene.add(gantry);

    // Printhead & Nozzle
    const headGroup = new THREE.Group();
    const headBodyGeo = new THREE.BoxGeometry(0.7, 0.6, 0.6);
    const headBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const headBody = new THREE.Mesh(headBodyGeo, headBodyMat);
    headGroup.add(headBody);

    // Fan shroud
    const fanGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const fanMesh = new THREE.Mesh(fanGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    fanMesh.rotation.z = Math.PI / 2;
    fanMesh.position.set(0.36, 0, 0);
    headGroup.add(fanMesh);

    // Brass Extruder Nozzle
    const nozzleGeo = new THREE.ConeGeometry(0.12, 0.3, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.rotation.x = Math.PI;
    nozzleMesh.position.set(0, -0.4, 0);
    headGroup.add(nozzleMesh);

    scene.add(headGroup);

    // 3D Printed Object (Planetary Gear Mechanism & Housing)
    const printedGroup = new THREE.Group();
    printedGroup.position.set(0, 0, 0);
    scene.add(printedGroup);

    // Base gear ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.25, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    
    // Sun gear in center
    const sunGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 18);
    // Planet gears around
    const planetGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.7, 16);

    const getMaterialShading = (matId: string, wireframe: boolean) => {
      let color = 0x38bdf8;
      let metalness = 0.2;
      let roughness = 0.4;
      let transmission = 0;
      let opacity = 1;

      if (matId === 'carbon-peek') {
        color = 0x1e293b;
        roughness = 0.7;
        metalness = 0.4;
      } else if (matId === 'titanium-ti64') {
        color = 0x94a3b8;
        roughness = 0.15;
        metalness = 0.95;
      } else if (matId === 'polycarbonate-cf') {
        color = 0x0f172a;
        roughness = 0.5;
        metalness = 0.3;
      } else if (matId === 'tough-resin') {
        color = 0x0284c7;
        roughness = 0.1;
        metalness = 0.1;
        opacity = 0.85;
      } else if (matId === 'petg-industrial') {
        color = 0x10b981;
        roughness = 0.3;
        metalness = 0.2;
      }

      return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        wireframe,
        transparent: opacity < 1,
        opacity,
      });
    };

    let printedMat = getMaterialShading(selectedMaterial, isWireframe);

    const ringMesh = new THREE.Mesh(ringGeo, printedMat);
    ringMesh.position.y = 0.3;
    ringMesh.castShadow = true;
    ringMesh.receiveShadow = true;
    printedGroup.add(ringMesh);

    const sunMesh = new THREE.Mesh(sunGeo, printedMat);
    sunMesh.position.y = 0.4;
    sunMesh.castShadow = true;
    printedGroup.add(sunMesh);

    const planetMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      const pm = new THREE.Mesh(planetGeo, printedMat);
      pm.position.set(Math.cos(angle) * 0.95, 0.4, Math.sin(angle) * 0.95);
      pm.castShadow = true;
      printedGroup.add(pm);
      planetMeshes.push(pm);
    }

    // Top intricate bracket
    const bracketGeo = new THREE.BoxGeometry(2.4, 0.2, 0.5);
    const bracketMesh = new THREE.Mesh(bracketGeo, printedMat);
    bracketMesh.position.set(0, 0.85, 0);
    printedGroup.add(bracketMesh);

    // Mouse Interaction (Orbiting)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = { radius: 10, theta: 0.8, phi: 1.1 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi) + 1.2;
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1.2, 0);
    };
    updateCameraFromSpherical();

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

      updateCameraFromSpherical();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(4, Math.min(16, spherical.radius + e.deltaY * 0.01));
      updateCameraFromSpherical();
    };

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.01;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.01));

      updateCameraFromSpherical();
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update material if changed
      const currentMatId = selectedMaterialRef.current;
      const currentWire = isWireframeRef.current;
      
      printedGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = getMaterialShading(currentMatId, currentWire);
        }
      });

      // Layer height scaling
      const layerFraction = currentLayerRef.current / maxLayers;
      printedGroup.scale.set(1, Math.max(0.05, layerFraction), 1);
      
      const nozzleTargetY = (layerFraction * 1.0) + 0.4;
      gantry.position.y = nozzleTargetY + 0.5;

      // Simulated print path motion
      if (isPlayingRef.current) {
        const pathSpeed = elapsedTime * 3.5;
        const radius = 1.0;
        const targetX = Math.cos(pathSpeed) * radius;
        const targetZ = Math.sin(pathSpeed * 1.5) * (radius * 0.8);
        
        headGroup.position.x = targetX;
        headGroup.position.y = nozzleTargetY;
        headGroup.position.z = targetZ;

        nozzleLight.position.set(targetX, nozzleTargetY - 0.2, targetZ);

        // Slowly advance layer if playing
        setCurrentLayer(prev => {
          if (prev >= maxLayers) return 10;
          return prev + 0.2;
        });

        // Rotate inner gears slightly
        sunMesh.rotation.y = elapsedTime * 1.2;
        planetMeshes.forEach((pm, idx) => {
          pm.rotation.y = -elapsedTime * 2.4 + idx;
        });
      } else {
        headGroup.position.y = nozzleTargetY;
      }

      // Subtle slow auto rotation if not dragging
      if (!isDragging) {
        spherical.theta += 0.0015;
        updateCameraFromSpherical();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler using ResizeObserver to catch container size changes (like framer-motion)
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
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
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

  const handleAngleChange = (angle: 'iso' | 'top' | 'front') => {
    setViewAngle(angle);
  };

  return (
    <div id="additive-simulator" className="w-full h-full flex flex-col relative z-10">
      {/* Header bar / Telemetry */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 backdrop-blur-md gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider text-blue-400 uppercase">MKRD CELL-01</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono font-semibold">
                DUAL-EXTRUSION ACTIVE
              </span>
            </div>
            <p className="text-[12px] text-slate-300 hidden sm:block">Industrial Carbon & Metal Sintering Simulator</p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-slate-400">NOZZLE:</span>
            <span className="text-amber-300 font-bold">245°C</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">BED:</span>
            <span className="text-blue-300 font-bold">85°C</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">ENVELOPE:</span>
            <span className="text-emerald-300">450x450x500mm</span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Mount with HUD overlays */}
      <div className="relative w-full flex-grow cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="absolute inset-0" />

        {/* View Controls & Interactive HUD overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
          <div className="bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-xl">
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 tracking-wider font-bold">3D Slicing Inspector</div>
            <div className="flex items-center gap-1">
              <button
                id="btn-toggle-wireframe"
                onClick={() => setIsWireframe(!isWireframe)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                  isWireframe 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Eye className="w-3 h-3" />
                {isWireframe ? 'Wireframe ON' : 'Solid Shaded'}
              </button>
              <button
                id="btn-toggle-play"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                  isPlaying ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isPlaying ? 'Pause' : 'Simulate Print'}
              </button>
            </div>
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none hidden sm:flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Click & Drag to Orbit 360° • Scroll to Zoom</span>
        </div>

        {/* Live Progress Bar Over canvas */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-150"
            style={{ width: `${(currentLayer / maxLayers) * 100}%` }}
          />
        </div>
      </div>

      {/* Interactive Controls & Material Selector Dashboard */}
      <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-5">
        {/* Layer Scrubbing Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-slate-200">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>G-CODE SLICE HEIGHT:</span>
              <strong className="text-blue-300">{Math.round(currentLayer)} / {maxLayers} Layers</strong>
              <span className="text-slate-400">({((currentLayer * 0.05).toFixed(2))} mm)</span>
            </span>
            <span className="text-slate-400 font-mono">
              EST. TIME: <strong className="text-slate-200">{( (maxLayers - currentLayer) * 0.2 ).toFixed(0)}m remaining</strong>
            </span>
          </div>
          <input
            id="slider-layer-height"
            type="range"
            min="10"
            max={maxLayers}
            value={currentLayer}
            onChange={(e) => {
              setCurrentLayer(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />
        </div>

        {/* Material Selection Grid */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between font-bold">
            <span>Select Industrial Engineering Material:</span>
            <span className="text-blue-400 text-[11px] font-normal">Active: {currentMatObj.name}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {MATERIALS_DB.map((mat) => {
              const isSelected = selectedMaterial === mat.id;
              return (
                <button
                  key={mat.id}
                  id={`btn-mat-${mat.id}`}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-950/70 border-blue-500 shadow-lg shadow-blue-500/15 ring-1 ring-blue-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span 
                      className="w-3 h-3 rounded-full border border-white/20 shadow-inner" 
                      style={{ backgroundColor: mat.color }} 
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-400">{mat.costTier}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-200 truncate">{mat.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{mat.tensileStrength}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Material Technical Specification Strip */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-300">{currentMatObj.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{currentMatObj.category}</span>
            </div>
            <p className="text-slate-300 text-[12px] leading-relaxed">{currentMatObj.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">TENSILE</div>
              <div className="text-slate-100 font-bold">{currentMatObj.tensileStrength}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">HEAT DEFLECT</div>
              <div className="text-slate-100 font-bold">{currentMatObj.heatDeflection}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">DENSITY</div>
              <div className="text-slate-100 font-bold">{currentMatObj.density}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
