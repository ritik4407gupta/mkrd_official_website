import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Crosshair,
  Wifi,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Package,
  Receipt
} from 'lucide-react';
import { ThreeDPrinterCanvas } from '../ThreeDPrinterCanvas';
import { ThreeDRobotActuator } from '../ThreeDRobotActuator';
import { WarehouseSimulationCanvas } from '../WarehouseSimulationCanvas';
import { GSTSimulationCanvas } from '../GSTSimulationCanvas';
import { VirtualTourModal } from '../VirtualTourModal';

interface SimulationsViewProps {
  onOpenQuoteModal: () => void;
}

export const SimulationsView: React.FC<SimulationsViewProps> = ({ onOpenQuoteModal }) => {
  const [activeSimulationTab, setActiveSimulationTab] = useState<'printer' | 'robot' | 'warehouse' | 'gst'>('printer');
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Advanced Flexible Parallax: scale up, hold, then scale down before exit
  const width = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["85vw", "96vw", "96vw", "85vw"]);
  const maxWidth = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["75rem", "120rem", "120rem", "75rem"]);
  const height = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["65vh", "94vh", "94vh", "65vh"]);
  
  // Keep the edges beautifully curved at all times to give it a floating premium window feel
  const borderRadius = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["2rem", "1rem", "1rem", "2rem"]);
  
  // Frame decorations fade out when fully expanded
  const decorationOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0, 0, 1]);
  const shadowIntensity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], 
    ["0 20px 50px -15px rgba(6,182,212,0.15)", "0 30px 80px -15px rgba(6,182,212,0.4)", "0 30px 80px -15px rgba(6,182,212,0.4)", "0 20px 50px -15px rgba(6,182,212,0.15)"]
  );

  return (
    <div className="relative pb-24 bg-[#02040a] min-h-[100vh] text-slate-300 font-sans">
      {/* High-tech Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-transparent to-[#02040a] pointer-events-none" />


      {/* Header Section */}
      <section className="relative pt-20 pb-16 z-10 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-600/20 blur-[150px] rounded-[100%] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            <Terminal className="w-3 h-3" />
            <span>Interactive Spatial Computing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} 
            className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6"
          >
            <span className="text-white">3D SIMULATION</span><br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 filter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              LABORATORY
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} 
            className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed mb-12"
          >
            Test and inspect our virtual hardware environments in real-time. Engage with interactive G-code additive slicer layer deposition and 6-axis industrial robotic arm inverse kinematics without leaving your browser.
          </motion.p>

          {/* Command Deck Control Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center p-2 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl relative"
          >
            {/* Control Panel Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500 rounded-tl-sm pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500 rounded-br-sm pointer-events-none" />

            <button
              onClick={() => setActiveSimulationTab('printer')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${
                activeSimulationTab === 'printer' ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {activeSimulationTab === 'printer' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-cyan-600 rounded-2xl shadow-[0_0_15px_rgba(8,145,178,0.6)]" />
              )}
              <Layers className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Additive Toolpath</span>
            </button>

            <button
              onClick={() => setActiveSimulationTab('robot')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${
                activeSimulationTab === 'robot' ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {activeSimulationTab === 'robot' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-cyan-600 rounded-2xl shadow-[0_0_15px_rgba(8,145,178,0.6)]" />
              )}
              <Cpu className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Robotic Kinematics</span>
            </button>

            <button
              onClick={() => setActiveSimulationTab('warehouse')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${
                activeSimulationTab === 'warehouse' ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {activeSimulationTab === 'warehouse' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-cyan-600 rounded-2xl shadow-[0_0_15px_rgba(8,145,178,0.6)]" />
              )}
              <Package className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Warehouse Manager</span>
            </button>

            <button
              onClick={() => setActiveSimulationTab('gst')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${
                activeSimulationTab === 'gst' ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {activeSimulationTab === 'gst' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-cyan-600 rounded-2xl shadow-[0_0_15px_rgba(8,145,178,0.6)]" />
              )}
              <Receipt className="w-4 h-4 relative z-10" />
              <span className="relative z-10">GST Billing Suite</span>
            </button>

            <div className="w-px h-8 bg-slate-700 mx-2 hidden sm:block" />

            <button
              onClick={() => setIsTourModalOpen(true)}
              className="relative group px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] bg-slate-950 border border-indigo-500/30 overflow-hidden sm:mt-0 mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 group-hover:from-indigo-600/40 group-hover:to-blue-600/40 transition-colors" />
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <Sparkles className="w-4 h-4 text-indigo-300 relative z-10" />
              <span className="text-indigo-100 relative z-10">360° Visual Tour</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Parallax Containment Bay */}
      <section className="w-full relative">
        <div ref={containerRef} className="h-[350vh] relative">
          <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
            
            <motion.div 
              className="relative bg-[#050B14] overflow-hidden flex flex-col mx-auto ring-1 ring-cyan-900/30 backdrop-blur-xl"
              style={{ width, maxWidth, height, borderRadius, boxShadow: shadowIntensity }}
            >
              {/* Containment Bay Holographic Border */}
              <div className="absolute inset-0 rounded-[inherit] border-2 border-transparent bg-gradient-to-b from-cyan-500/20 to-transparent" style={{ maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1px' }} />

              {/* Parallax HUD Decorations */}
              <motion.div style={{ opacity: decorationOpacity }} className="absolute inset-4 pointer-events-none z-20">
                <Crosshair className="absolute top-0 left-0 w-6 h-6 text-cyan-500/50" />
                <Crosshair className="absolute top-0 right-0 w-6 h-6 text-cyan-500/50" />
                <Crosshair className="absolute bottom-0 left-0 w-6 h-6 text-cyan-500/50" />
                <Crosshair className="absolute bottom-0 right-0 w-6 h-6 text-cyan-500/50" />
                
                <div className="absolute top-2 left-10 text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Live Simulation
                </div>
                
                {/* Tech scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none mix-blend-overlay" />
              </motion.div>

              {/* Background texture inside the 3D frame */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=2000&auto=format&fit=crop" 
                  alt="3D Background" 
                  className="w-full h-full object-cover opacity-10 pointer-events-none" 
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent pointer-events-none" />
              </div>

              {/* The Actual 3D Canvas rendering */}
              <div className="w-full h-full flex-grow relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSimulationTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    {activeSimulationTab === 'printer' && (
                      <ThreeDPrinterCanvas />
                    )}
                    {activeSimulationTab === 'robot' && (
                      <ThreeDRobotActuator />
                    )}
                    {activeSimulationTab === 'warehouse' && (
                      <WarehouseSimulationCanvas />
                    )}
                    {activeSimulationTab === 'gst' && (
                      <GSTSimulationCanvas />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cybernetic Engineering Assistance Callout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="group relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500/30 via-slate-800 to-indigo-500/30 shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all hover:shadow-[0_0_60px_rgba(34,211,238,0.2)]">
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out transition-transform" />

          <div className="bg-[#050a14]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Background geometric pattern */}
            <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
              <Cpu className="w-64 h-64 text-cyan-400" />
            </div>

            <div className="space-y-4 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-900/40 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
                <Zap className="w-3 h-3" />
                Advanced Engineering Services
              </div>
              <h4 className="text-2xl md:text-3xl font-display font-extrabold text-white">
                Need Custom Hardware Simulation or Tool DFM?
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Our engineering team conducts full Mouldflow rheological analysis, FEA stress simulation, and kinematic path planning for complex tooling and automation lines.
              </p>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="relative z-10 shrink-0 group/btn"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-200" />
              <div className="relative px-8 py-4 bg-slate-950 border border-slate-700/50 rounded-full flex items-center gap-3 transition-transform group-hover/btn:-translate-y-0.5">
                <span className="font-bold text-xs uppercase tracking-widest text-cyan-400">
                  Consult Specialist
                </span>
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Virtual Tour Blur Modal */}
      <VirtualTourModal 
        isOpen={isTourModalOpen} 
        onClose={() => setIsTourModalOpen(false)} 
      />
    </div>
  );
};
