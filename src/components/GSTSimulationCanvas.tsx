import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Grid, Box, Cylinder, Sphere, Float, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon,
  ShieldCheck,
  Server,
  Activity,
  FileBox,
  IndianRupee
} from 'lucide-react';

const DataPacket = ({ start, end, speed, color, offset }: { start: THREE.Vector3, end: THREE.Vector3, speed: number, color: string, offset: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 4; // Arch height
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = ((clock.elapsedTime * speed) + offset) % 1;
      const position = curve.getPoint(t);
      ref.current.position.copy(position);
      ref.current.scale.setScalar(Math.sin(t * Math.PI) * 1.5 + 0.5);
    }
  });

  return (
    <>
      <Line points={curve.getPoints(50)} color={color} opacity={0.1} transparent lineWidth={1} />
      <mesh ref={ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
};

const CoreServer = () => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.5;
      ringRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group position={[0, 2, 0]}>
      <Html position={[0, 4, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-mono px-3 py-1.5 rounded-lg whitespace-nowrap backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2">
          <Server className="w-3.5 h-3.5" />
          NATS CENTRAL BROKER
        </div>
      </Html>
      <Box args={[2.5, 3, 2.5]}>
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </Box>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 0.1, 2.6]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const HolographicUI = ({ position, color, title, icon: Icon, stats }: { position: [number, number, number], color: string, title: string, icon: any, stats: {label: string, value: string}[] }) => {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1.5} position={position}>
      <Html transform center scale={0.4} zIndexRange={[100, 0]} className="pointer-events-none">
        <div 
          className="w-64 rounded-xl border backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-3"
          style={{ 
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            borderColor: color + '50',
            boxShadow: `0 0 40px ${color}20` 
          }}
        >
          <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: color + '30' }}>
            <Icon className="w-5 h-5" style={{ color: color }} />
            <h4 className="font-display font-bold text-white text-sm tracking-wide uppercase">{title}</h4>
          </div>
          <div className="space-y-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase">{stat.label}</span>
                <span className="font-bold text-xs" style={{ color: color }}>{stat.value}</span>
              </div>
            ))}
          </div>
          {/* Animated Processing Bar */}
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full rounded-full w-full origin-left animate-pulse" 
              style={{ backgroundColor: color, animationDuration: `${Math.random() * 2 + 1}s` }} 
            />
          </div>
        </div>
      </Html>
      
      {/* Physical Anchor Node */}
      <Sphere args={[0.3, 32, 32]} position={[0, -2, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </Sphere>
      <Cylinder args={[0.02, 0.02, 2, 8]} position={[0, -1, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </Cylinder>
    </Float>
  );
};

export const GSTSimulationCanvas = () => {
  const center = new THREE.Vector3(0, 2, 0);
  
  // Nodes positions
  const posDashboard = new THREE.Vector3(-8, 5, 8);
  const posInvoice = new THREE.Vector3(8, 6, 6);
  const posEway = new THREE.Vector3(-7, 6, -7);
  const posReports = new THREE.Vector3(7, 5, -8);
  
  return (
    <div className="w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden relative flex flex-col shadow-2xl border border-slate-800">
      
      <div className="flex-grow w-full relative">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 15, 25], fov: 45 }}>
          <color attach="background" args={['#02040a']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <Environment preset="city" opacity={0.1} />
          
          <Grid infiniteGrid fadeDistance={60} sectionColor="#312e81" cellColor="#1e1b4b" position={[0, -0.01, 0]} />
          
          <CoreServer />
          
          {/* Dashboard Node */}
          <HolographicUI 
            position={posDashboard.toArray()} color="#10b981" title="Real-time Dashboard" icon={BarChart3}
            stats={[
              { label: 'Total Revenue', value: '₹ 12.4M' },
              { label: 'Active Invoices', value: '1,420' },
              { label: 'Pending Payment', value: '₹ 2.1M' }
            ]} 
          />

          {/* Tax Invoice Engine */}
          <HolographicUI 
            position={posInvoice.toArray()} color="#0ea5e9" title="Document Engine" icon={FileText}
            stats={[
              { label: 'Tax Invoices', value: 'GENERATING' },
              { label: 'Delivery Challans', value: 'SYNCED' },
              { label: 'Optical OCR Scan', value: 'ACTIVE' }
            ]} 
          />

          {/* E-Way Bill Portal */}
          <HolographicUI 
            position={posEway.toArray()} color="#f59e0b" title="E-Way Bill Integration" icon={FileBox}
            stats={[
              { label: 'NIC Portal Sync', value: 'CONNECTED' },
              { label: 'Active E-Way Bills', value: '84' },
              { label: 'Transport Status', value: 'TRACKING' }
            ]} 
          />

          {/* GSTR Reports */}
          <HolographicUI 
            position={posReports.toArray()} color="#8b5cf6" title="GSTR Compliance" icon={ShieldCheck}
            stats={[
              { label: 'GSTR-1 Status', value: 'FILED' },
              { label: 'GSTR-2B Recon', value: 'MATCHED' },
              { label: 'JSON Export', value: 'READY' }
            ]} 
          />
          
          {/* Neural Data Streams */}
          <DataPacket start={posDashboard} end={center} speed={0.3} color="#10b981" offset={0} />
          <DataPacket start={center} end={posDashboard} speed={0.3} color="#10b981" offset={0.5} />
          
          <DataPacket start={posInvoice} end={center} speed={0.4} color="#0ea5e9" offset={0.2} />
          <DataPacket start={center} end={posInvoice} speed={0.4} color="#0ea5e9" offset={0.7} />
          
          <DataPacket start={posEway} end={center} speed={0.35} color="#f59e0b" offset={0.1} />
          <DataPacket start={center} end={posEway} speed={0.35} color="#f59e0b" offset={0.6} />

          <DataPacket start={posReports} end={center} speed={0.45} color="#8b5cf6" offset={0.3} />
          <DataPacket start={center} end={posReports} speed={0.45} color="#8b5cf6" offset={0.8} />
          
          <OrbitControls enablePan={false} minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.2} minDistance={15} maxDistance={40} autoRotate autoRotateSpeed={0.8} />
        </Canvas>
      </div>

      {/* Advanced Animated Footer Bar */}
      <div className="w-full bg-slate-950/90 backdrop-blur-2xl border-t border-indigo-500/20 p-5 md:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] z-20 transition-all duration-500 rounded-b-[2rem]">
        <div className="flex-1 max-w-4xl space-y-3">
          <div className="flex items-center gap-3">
             <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
             </div>
             <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-display font-black text-xl md:text-2xl tracking-wide uppercase">
               GST Billing Suite Advanced Architecture
             </h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            A comprehensive visualization of a fully functional GST billing ERP. The system features a centralized NATS Message Broker that synchronizes a real-time <strong className="text-emerald-400">Financial Dashboard</strong>, an automated <strong className="text-cyan-400">Document Engine</strong> (Tax Invoices, Delivery Challans), seamless <strong className="text-amber-400">E-Way Bill integration</strong> with NIC portals, and automated <strong className="text-purple-400">GSTR Compliance reporting</strong>.
          </p>
        </div>
        
        {/* Animated Capability Badges */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-900 border border-emerald-900/50 px-4 py-2 rounded-xl text-xs font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex flex-col gap-1 hover:bg-emerald-950/50 transition-colors">
            <span className="text-[9px] text-emerald-500 uppercase font-bold tracking-widest">Dashboard & Customers</span>
            <span className="flex items-center gap-1.5"><Users className="w-3 h-3"/> Contact Sync</span>
          </div>
          <div className="bg-slate-900 border border-cyan-900/50 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col gap-1 hover:bg-cyan-950/50 transition-colors">
            <span className="text-[9px] text-cyan-500 uppercase font-bold tracking-widest">Invoicing Engine</span>
            <span className="flex items-center gap-1.5"><IndianRupee className="w-3 h-3"/> Payment Tracking</span>
          </div>
          <div className="bg-slate-900 border border-amber-900/50 px-4 py-2 rounded-xl text-xs font-mono text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] flex flex-col gap-1 hover:bg-amber-950/50 transition-colors">
            <span className="text-[9px] text-amber-500 uppercase font-bold tracking-widest">NIC Integration</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3"/> E-Way Bill Auto-Gen</span>
          </div>
        </div>
      </div>

    </div>
  );
};
