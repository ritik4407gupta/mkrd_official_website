import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Trail, Float, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

const DataCore = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.x += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={coreRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial 
          color="#0066ff" 
          emissive="#0033ff"
          emissiveIntensity={2}
          attach="material" 
          distort={0.4} 
          speed={2} 
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      {/* Wireframe cage around core */}
      <Sphere args={[1.8, 16, 16]}>
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.15} />
      </Sphere>
    </Float>
  );
};

const OrbitingNodes = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate random node positions on a sphere
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      const radius = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= 0.001;
      groupRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <group key={i} position={pos}>
          <Trail width={0.5} color="#00ffff" length={4} decay={1} attenuation={(t) => t * t}>
            <Sphere args={[0.1, 16, 16]}>
              <meshBasicMaterial color="#00ffff" />
            </Sphere>
          </Trail>
          {/* Connection line to core */}
          <Line 
            points={[[0,0,0], [-pos.x, -pos.y, -pos.z]]} 
            color="#0066ff" 
            transparent 
            opacity={0.2} 
            lineWidth={1}
          />
        </group>
      ))}
      
      {/* Data Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#0033ff" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[6, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export const ThreeDDigitalExperience: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#020617] rounded-3xl overflow-hidden shadow-2xl border border-blue-900/30 group">
      {/* Glowing background behind canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617]/50 to-[#020617] pointer-events-none" />
      
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0033ff" />
        
        <DataCore />
        <OrbitingNodes />
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Cinematic HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-3xl" />
      
      {/* Top Left HUD */}
      <div className="absolute top-6 left-6 flex items-start gap-3 pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 backdrop-blur-md flex items-center justify-center shadow-lg">
          <div className="w-4 h-4 border-2 border-cyan-400 rounded-sm animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">ENTERPRISE TWIN ENGINE</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/50 border border-blue-700/50 text-blue-300 font-mono">v2.4.1</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wide mt-1">Live Multi-Node System Architecture</p>
        </div>
      </div>

      {/* Bottom Right HUD Metrics */}
      <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-xl pointer-events-none flex gap-6">
        <div>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">SYSTEM LATENCY</div>
          <div className="text-sm font-mono text-emerald-400 font-bold">12<span className="text-[10px] text-emerald-600 ml-0.5">ms</span></div>
        </div>
        <div>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">ACTIVE NODES</div>
          <div className="text-sm font-mono text-cyan-400 font-bold">2,481</div>
        </div>
        <div>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">INTEGRITY</div>
          <div className="text-sm font-mono text-blue-400 font-bold">99.9%</div>
        </div>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[10px] font-mono text-slate-300">Click & Drag to Rotate Matrix</span>
      </div>
    </div>
  );
};
