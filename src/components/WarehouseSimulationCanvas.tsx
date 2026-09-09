import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Grid, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

const AGV = ({ offset, color, pathType }: { offset: number, color: string, pathType: number }) => {
  const agvRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!agvRef.current) return;
    const t = (state.clock.elapsedTime * 2.0 + offset) % 16;
    
    let x = 0, z = 0, rot = 0;
    
    if (pathType === 1) {
      if (t < 4) { x = -7 + (t/4)*14; z = 7; rot = Math.PI / 2; }
      else if (t < 8) { x = 7; z = 7 - ((t-4)/4)*14; rot = 0; }
      else if (t < 12) { x = 7 - ((t-8)/4)*14; z = -7; rot = -Math.PI / 2; }
      else { x = -7; z = -7 + ((t-12)/4)*14; rot = Math.PI; }
    } else {
      if (t < 4) { x = -3 + (t/4)*6; z = -3; rot = Math.PI / 2; }
      else if (t < 8) { x = 3; z = -3 + ((t-4)/6)*6; rot = Math.PI; } // Adjusted smooth rotation
      else if (t < 12) { x = 3 - ((t-8)/4)*6; z = 3; rot = -Math.PI / 2; }
      else { x = -3; z = 3 - ((t-12)/4)*6; rot = 0; }
    }
    
    agvRef.current.position.lerp(new THREE.Vector3(x, 0.5, z), 0.15);
    const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0));
    agvRef.current.quaternion.slerp(targetQuat, 0.15);
  });

  return (
    <group ref={agvRef}>
      <Html position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-slate-900/80 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded border border-cyan-500/50 whitespace-nowrap backdrop-blur-sm shadow-lg pointer-events-none">
          AGV Unit {pathType}-{offset}
        </div>
      </Html>
      <Box args={[1.2, 0.4, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </Box>
      <Box args={[0.2, 0.1, 0.4]} position={[0, 0.25, 0.8]}>
        <meshBasicMaterial color="#22d3ee" />
      </Box>
      <Box args={[1, 1.2, 1.2]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.2} transparent opacity={0.9} />
      </Box>
      <Box args={[1.4, 0.3, 0.6]} position={[0, -0.2, 0.6]}>
        <meshStandardMaterial color="#0f172a" />
      </Box>
      <Box args={[1.4, 0.3, 0.6]} position={[0, -0.2, -0.6]}>
        <meshStandardMaterial color="#0f172a" />
      </Box>
    </group>
  );
};

const Racks = () => {
  const rackPositions = [
    [-4, 0, -4],
    [4, 0, -4]
  ];

  return (
    <group>
      {rackPositions.map((pos, idx) => (
        <group key={idx} position={[pos[0], 0, pos[2]]}>
          {idx === 0 && (
            <Html position={[0, 6.5, 0]} center zIndexRange={[100, 0]}>
              <div className="bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2 py-1 rounded border border-slate-600/50 whitespace-nowrap backdrop-blur-sm pointer-events-none">
                Smart Storage Rack
              </div>
            </Html>
          )}
          <Box args={[2, 6, 6]} position={[0, 3, 0]}>
            <meshStandardMaterial color="#334155" wireframe />
          </Box>
          <Box args={[1.8, 1.2, 5.8]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#06b6d4" opacity={0.6} transparent />
          </Box>
          <Box args={[1.8, 1.2, 5.8]} position={[0, 3.5, 0]}>
            <meshStandardMaterial color="#0ea5e9" opacity={0.4} transparent />
          </Box>
          <Box args={[1.8, 1.2, 5.8]} position={[0, 5.5, 0]}>
            <meshStandardMaterial color="#38bdf8" opacity={0.5} transparent />
          </Box>
        </group>
      ))}
    </group>
  );
};

const BarcodeScanningStation = () => {
  const laserRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if(laserRef.current) {
      laserRef.current.position.x = Math.sin(clock.elapsedTime * 5) * 0.9;
    }
  });

  return (
    <group position={[0, 0, 4]}>
       <Html position={[0, 4.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/80 text-yellow-300 text-[10px] font-mono px-2 py-1 rounded border border-yellow-500/50 whitespace-nowrap backdrop-blur-sm pointer-events-none shadow-lg">
            Barcode & QR Scanning Node
          </div>
       </Html>
       
       <Box args={[4, 1.2, 1.8]} position={[0, 0.6, 0]}>
         <meshStandardMaterial color="#1e293b" metalness={0.8} />
       </Box>
       <Box args={[0.3, 3, 2]} position={[0, 2.7, 0]}>
         <meshStandardMaterial color="#0f172a" />
       </Box>
       <mesh ref={laserRef} position={[0, 2.7, 0]} rotation={[0, Math.PI/2, 0]}>
         <planeGeometry args={[1.8, 2.8]} />
         <meshBasicMaterial color="#22c55e" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
       </mesh>
       
       <Box args={[0.9, 0.9, 0.9]} position={[-1, 1.65, 0.2]}>
         <meshStandardMaterial color="#eab308" />
       </Box>
       <Box args={[0.9, 0.9, 0.9]} position={[1, 1.65, -0.2]}>
         <meshStandardMaterial color="#eab308" />
       </Box>
    </group>
  );
}

const AnalyticsDashboard = () => {
  return (
    <Html position={[0, 6, -8]} transform center className="pointer-events-none">
      <div className="bg-slate-950/90 border border-cyan-500/50 p-4 rounded-xl w-72 shadow-[0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-xl">
        <h4 className="text-cyan-400 font-mono font-bold mb-3 border-b border-cyan-900 pb-2 text-xs uppercase tracking-widest flex items-center justify-between">
          <span>Live Telemetry</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </h4>
        <div className="space-y-2 text-[10px] font-mono text-slate-300">
          <div className="flex justify-between items-center">
            <span>QR / Barcode Scans</span> 
            <span className="text-green-400 font-bold text-xs">8,402</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Throughput Efficiency</span> 
            <span className="text-blue-400 font-bold text-xs">96.4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Matplotlib / Numpy Engine</span> 
            <span className="text-indigo-400 font-bold text-xs">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center">
            <span>PDF/PPTX Reports</span> 
            <span className="text-emerald-400 font-bold text-xs">GENERATED</span>
          </div>
        </div>
        <div className="mt-4 h-16 flex items-end gap-1.5 w-full">
          {[40, 70, 45, 90, 60, 80, 50, 95, 65, 85].map((h, i) => (
             <div key={i} className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </Html>
  );
}

export const WarehouseSimulationCanvas = () => {
  return (
    <div className="w-full h-full bg-[#02040a] rounded-xl overflow-hidden relative flex flex-col">
      
      {/* 3D Canvas rendering */}
      <div className="flex-grow w-full relative">
        <Canvas dpr={[1, 1.5]} camera={{ position: [18, 15, 18], fov: 40 }}>
          <color attach="background" args={['#02040a']} />
          
          <ambientLight intensity={0.6} />
          <directionalLight position={[15, 25, 15]} intensity={1.5} castShadow />
          <pointLight position={[-10, 15, -10]} intensity={1.2} color="#06b6d4" />
          <pointLight position={[10, 5, 10]} intensity={0.8} color="#3b82f6" />
          
          <Environment preset="night" opacity={0.3} />
          
          <Grid infiniteGrid fadeDistance={50} sectionColor="#0ea5e9" cellColor="#1e293b" position={[0, -0.01, 0]} />
          
          {/* Animated Fleet */}
          <AGV offset={0} color="#f59e0b" pathType={1} />
          <AGV offset={8} color="#f59e0b" pathType={1} />
          <AGV offset={2} color="#ec4899" pathType={2} />
          
          {/* Static Infrastructure */}
          <Racks />
          <BarcodeScanningStation />
          <AnalyticsDashboard />
          
          <OrbitControls enablePan={false} minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.1} minDistance={15} maxDistance={40} autoRotate autoRotateSpeed={0.8} />
        </Canvas>
      </div>

      {/* Flexible Explanation Bar Pinned to the Bottom */}
      <div className="w-full bg-slate-950/85 backdrop-blur-xl border-t border-cyan-900/50 p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.4)] z-20 transition-all duration-500">
        <div className="flex-1 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
             <h3 className="text-cyan-400 font-display font-black text-xl tracking-wide uppercase">WarehouseManager Pro Simulation</h3>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Visualizing the enterprise-grade logistics flow. The system utilizes continuous routing logic to guide AGVs, tracks inventory passing through optical scanner nodes, securely logs operations, and generates real-time performance analytics using Matplotlib & Numpy architectures.
          </p>
        </div>
        
        {/* Dynamic Badges that flow flexibly */}
        <div className="flex flex-wrap items-center gap-2 xl:gap-3 shrink-0">
          <div className="bg-slate-900 border border-slate-700/50 px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-200">
            <span className="block text-slate-500 mb-0.5">Tracking</span>
            Barcode & QR
          </div>
          <div className="bg-slate-900 border border-slate-700/50 px-3 py-1.5 rounded-lg text-[10px] font-mono text-indigo-200">
            <span className="block text-slate-500 mb-0.5">Analytics</span>
            Numpy & Matplotlib
          </div>
          <div className="bg-slate-900 border border-slate-700/50 px-3 py-1.5 rounded-lg text-[10px] font-mono text-emerald-200">
            <span className="block text-slate-500 mb-0.5">Exporting</span>
            PDF & PPTX
          </div>
          <div className="bg-slate-900 border border-slate-700/50 px-3 py-1.5 rounded-lg text-[10px] font-mono text-rose-200">
            <span className="block text-slate-500 mb-0.5">Security</span>
            Bcrypt Auth
          </div>
        </div>
      </div>

    </div>
  );
};
